package user

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"backend/shared/crypto"
	"backend/shared/queue"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Repository struct {
	db            *pgxpool.Pool
	rds           *redis.Client
	encryptionKey []byte
	pub           *queue.Publisher
}

func NewRepository(db *pgxpool.Pool, rds *redis.Client, encryptionKey string, pub *queue.Publisher) *Repository {
	return &Repository{
		db:            db,
		rds:           rds,
		encryptionKey: []byte(encryptionKey),
		pub:           pub,
	}
}

func (r *Repository) encrypt(val *string) *string {
	if val == nil || *val == "" {
		return val
	}
	enc, err := crypto.Encrypt(*val, r.encryptionKey)
	if err != nil {
		log.Printf("encryption error: %v", err)
		return val
	}
	return &enc
}



func (r *Repository) decrypt(val *string) *string {
	if val == nil || *val == "" {
		return val
	}
	dec, err := crypto.Decrypt(*val, r.encryptionKey)
	if err != nil {
		// Log but keep original (might be old unencrypted data during transition)
		log.Printf("decryption error: %v", err)
		return val
	}
	return &dec
}

func (r *Repository) UpdateKYC(ctx context.Context, u *User) error {
	_, err := r.db.Exec(ctx, `
		UPDATE users 
		SET kyc_verified_at=NOW(), 
		    kyc_reference_id=$1,
		    aadhaar_hash=$2, 
		    full_name=$3, 
		    dob=$4, 
		    gender=$5, 
		    updated_at=NOW()
		WHERE id=$6
	`, u.KycReferenceID, u.AadhaarHash, r.encrypt(u.FullName), u.DOB, u.Gender, u.ID)
	if err == nil {
		r.invalidateCache(ctx, u.ID)
	}
	return err
}

func (r *Repository) invalidateCache(ctx context.Context, userID uuid.UUID) {
	// To safely invalidate all keys (id, email, username), we need the current values from the DB.
	// This ensures that even if one cache key was missing, we find and clear the others.
	var u User
	err := r.db.QueryRow(ctx, `SELECT id, username FROM users WHERE id=$1`, userID).Scan(&u.ID, &u.Username)
	if err != nil {
		// If user not found, just try to clear by ID as a fallback
		r.rds.Del(ctx, "user:id:"+userID.String())
		return
	}

	r.rds.Del(ctx, "user:id:"+u.ID.String())
		r.rds.Del(ctx, "user:username:"+u.Username)
}

func (r *Repository) Create(ctx context.Context, u *User) error {
	log.Printf("[Repository] Creating User Profile - ID: %s, Username: %s, Role: %s", u.ID, u.Username, u.Role)
	row := r.db.QueryRow(ctx, `
		INSERT INTO users (id, username, email, full_name, role, phone, dob, gender)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING created_at, updated_at
	`, u.ID, u.Username, u.Email, r.encrypt(u.FullName), u.Role, r.encrypt(u.Phone), u.DOB, u.Gender)

	err := row.Scan(&u.CreatedAt, &u.UpdatedAt)
	return err
}











func (r *Repository) SetProfilePic(ctx context.Context, userID uuid.UUID, url string) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET profile_pic_url=$1, updated_at = now() WHERE id=$2`, url, userID)
	if err == nil {
		r.invalidateCache(ctx, userID)
	}
	return err
}

func (r *Repository) SetBanner(ctx context.Context, userID uuid.UUID, url string) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET banner_url=$1, updated_at = now() WHERE id=$2`, url, userID)
	if err == nil {
		r.invalidateCache(ctx, userID)
	}
	return err
}

func (r *Repository) SetBio(ctx context.Context, userID uuid.UUID, bio string) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET bio=$1, updated_at = now() WHERE id=$2`, bio, userID)
	if err == nil {
		r.invalidateCache(ctx, userID)
	}
	return err
}

func (r *Repository) UpdateProfile(ctx context.Context, u *User) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `
		UPDATE users 
		SET full_name=$1, dob=$2, gender=$3, bio=$4, 
		    social_links=$5, skills=$6, recognitions=$7, 
		    institution_name=$8, location=$9, languages=$10, demographic=$11,
			religion=$12, caste=$13, subcaste=$14, nationality=$15,
		    updated_at=NOW()
		WHERE id=$16
	`, r.encrypt(u.FullName), u.DOB, u.Gender, u.Bio,
		u.SocialLinks, u.Skills, u.Recognitions, u.InstitutionName,
		u.Location, u.Languages, u.Demographic,
		r.encrypt(u.Religion), r.encrypt(u.Caste), r.encrypt(u.Subcaste), u.Nationality,
		u.ID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `DELETE FROM user_addresses WHERE user_id=$1`, u.ID)
	if err != nil { return err }
	for _, addr := range u.Addresses {
		_, err = tx.Exec(ctx, `
			INSERT INTO user_addresses (user_id, type, address_line, state, district, pincode, is_same_as_permanent)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`, u.ID, addr.Type, r.encrypt(addr.AddressLine), addr.State, addr.District, addr.Pincode, addr.IsSameAsPermanent)
		if err != nil { return err }
	}

	_, err = tx.Exec(ctx, `DELETE FROM user_academic_records WHERE user_id=$1`, u.ID)
	if err != nil { return err }
	for _, rec := range u.AcademicRecords {
		var newID uuid.UUID
		var achievementsJSON interface{}
		if len(rec.Achievements) > 0 {
			achievementsJSON = string(rec.Achievements)
		}

		err = tx.QueryRow(ctx, `
			INSERT INTO user_academic_records (user_id, qualification, board_university, passing_year, percentage_cgpa, document_url, achievements)
			VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
		`, u.ID, rec.Qualification, rec.BoardUniversity, rec.PassingYear, rec.PercentageCgpa, rec.DocumentURL, achievementsJSON).Scan(&newID)
		if err != nil { return err }
		rec.ID = newID
	}

	_, err = tx.Exec(ctx, `DELETE FROM user_work_experiences WHERE user_id=$1`, u.ID)
	if err != nil { return err }
	for _, we := range u.WorkExperiences {
		_, err = tx.Exec(ctx, `
			INSERT INTO user_work_experiences (user_id, company_name, designation, start_date, end_date)
			VALUES ($1, $2, $3, $4, $5)
		`, u.ID, we.CompanyName, we.Designation, we.StartDate, we.EndDate)
		if err != nil { return err }
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}

	// Async Mongo Publish
	if r.pub != nil {
		for _, rec := range u.AcademicRecords {
			if len(rec.Achievements) > 0 && string(rec.Achievements) != "null" && string(rec.Achievements) != "[]" {
				var achievements interface{}
				if err := json.Unmarshal(rec.Achievements, &achievements); err == nil {
					mongoJob := queue.MongoSyncJob{
						Collection: "academic_achievements",
						DocumentID: rec.ID.String(),
						Payload: MongoAcademicAchievements{
							AcademicRecordID: rec.ID.String(),
							UserID:           u.ID.String(),
							Achievements:     achievements,
							UpdatedAt:        time.Now(),
						},
					}
					if err := r.pub.PublishMongoSync(mongoJob); err != nil {
						log.Printf("failed to publish mongo sync job for record %s: %v", rec.ID, err)
					}
				}
			}
		}
	}

	r.invalidateCache(ctx, u.ID)
	return nil
}



// ExistsByEmail checks if a user exists with the given email.
func (r *Repository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE email=$1)`, email).Scan(&exists)
	return exists, err
}

func (r *Repository) loadExtendedProfile(ctx context.Context, u *User) {
	u.Addresses = make([]*UserAddress, 0)
	u.AcademicRecords = make([]*UserAcademicRecord, 0)
	u.WorkExperiences = make([]*UserWorkExperience, 0)
	
	rows, err := r.db.Query(ctx, `SELECT id, user_id, type, address_line, state, district, pincode, is_same_as_permanent, created_at, updated_at FROM user_addresses WHERE user_id=$1`, u.ID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var a UserAddress
			if err := rows.Scan(&a.ID, &a.UserID, &a.Type, &a.AddressLine, &a.State, &a.District, &a.Pincode, &a.IsSameAsPermanent, &a.CreatedAt, &a.UpdatedAt); err == nil {
				a.AddressLine = r.decrypt(a.AddressLine)
				u.Addresses = append(u.Addresses, &a)
			}
		}
	}

	rows2, err := r.db.Query(ctx, `SELECT id, user_id, qualification, board_university, passing_year, percentage_cgpa, document_url, achievements, created_at, updated_at FROM user_academic_records WHERE user_id=$1`, u.ID)
	if err == nil {
		defer rows2.Close()
		for rows2.Next() {
			var a UserAcademicRecord
			if err := rows2.Scan(&a.ID, &a.UserID, &a.Qualification, &a.BoardUniversity, &a.PassingYear, &a.PercentageCgpa, &a.DocumentURL, &a.Achievements, &a.CreatedAt, &a.UpdatedAt); err == nil {
				
				// Fetch Achievements from Mongo
				/*
				if database.MongoDatabase != nil {
					var mRecord MongoAcademicAchievements
					collection := database.MongoDatabase.Collection("academic_achievements")
					err := collection.FindOne(ctx, bson.M{"academic_record_id": a.ID.String()}).Decode(&mRecord)
					if err == nil && mRecord.Achievements != nil {
						if achBytes, err := json.Marshal(mRecord.Achievements); err == nil {
							a.Achievements = achBytes
						}
					}
				}
				*/

				u.AcademicRecords = append(u.AcademicRecords, &a)
			}
		}
	}

	rows3, err := r.db.Query(ctx, `SELECT id, user_id, company_name, designation, start_date, end_date, created_at, updated_at FROM user_work_experiences WHERE user_id=$1`, u.ID)
	if err == nil {
		defer rows3.Close()
		for rows3.Next() {
			var w UserWorkExperience
			if err := rows3.Scan(&w.ID, &w.UserID, &w.CompanyName, &w.Designation, &w.StartDate, &w.EndDate, &w.CreatedAt, &w.UpdatedAt); err == nil {
				u.WorkExperiences = append(u.WorkExperiences, &w)
			}
		}
	}
}

func (r *Repository) GetByID(ctx context.Context, id uuid.UUID) (*User, error) {
	// 1. Try Cache
	cacheKey := "user:id:" + id.String()
	if val, err := r.rds.Get(ctx, cacheKey).Result(); err == nil {
		var u User
		if err := json.Unmarshal([]byte(val), &u); err == nil {
			return &u, nil
		}
	}

	var u User
	err := r.db.QueryRow(ctx, `
		SELECT id, username, email, role,
		       kyc_verified_at, kyc_reference_id, aadhaar_hash, full_name, dob, gender,
		       profile_pic_url, banner_url, bio, institution_name, social_links, skills, recognitions,
		       created_at, updated_at,
		       location, languages, demographic,
			   religion, caste, subcaste, nationality, phone
		FROM users WHERE id=$1
	`, id).Scan(&u.ID, &u.Username, &u.Email, &u.Role,
		&u.KycVerifiedAt, &u.KycReferenceID, &u.AadhaarHash, &u.FullName, &u.DOB, &u.Gender,
		&u.ProfilePicURL, &u.BannerURL, &u.Bio, &u.InstitutionName, &u.SocialLinks, &u.Skills, &u.Recognitions,
		&u.CreatedAt, &u.UpdatedAt,
		&u.Location, &u.Languages, &u.Demographic,
		&u.Religion, &u.Caste, &u.Subcaste, &u.Nationality, &u.Phone)
	if err != nil {
		return nil, err
	}
	u.FullName = r.decrypt(u.FullName)
	u.Religion = r.decrypt(u.Religion)
	u.Caste = r.decrypt(u.Caste)
	u.Subcaste = r.decrypt(u.Subcaste)
	u.Phone = r.decrypt(u.Phone)
	r.loadExtendedProfile(ctx, &u)
	
	if u.Role == "institute" || u.Role == "organisation" {
		inst := &InstituteProfileInput{}
		var coursesBytes, eduBytes, accDocsBytes []byte
		var banner, logo, phone, email *string
		q := `
			SELECT i.institute_type, i.established_year, i.registration_number, i.website_url, i.short_description, i.logo_url, i.banner_url,
			       c.address, c.campus_type, c.operating_hours,
			       a.courses_offered, a.education_levels, a.student_count, a.faculty_count, a.accreditation_docs,
			       cnt.phone, cnt.email
			FROM institute_users iu
			JOIN institutes i ON iu.institute_id = i.id
			LEFT JOIN institute_campuses c ON c.institute_id = i.id AND c.name = 'Main Campus'
			LEFT JOIN institute_academics a ON a.campus_id = c.id
			LEFT JOIN institute_contacts cnt ON cnt.institute_id = i.id AND cnt.is_primary = true
			WHERE iu.user_id = $1 AND iu.role = 'owner'
			LIMIT 1
		`
		err = r.db.QueryRow(ctx, q, u.ID).Scan(
			&inst.InstituteType, &inst.EstablishedYear, &inst.RegistrationNumber, &inst.WebsiteURL, &inst.ShortDescription, &logo, &banner,
			&inst.AddressLine, &inst.CampusType, &inst.OperatingHours,
			&coursesBytes, &eduBytes, &inst.StudentCount, &inst.FacultyCount, &accDocsBytes,
			&phone, &email,
		)
		if err == nil {
			if banner != nil { inst.BannerURL = *banner }
			if logo != nil { inst.LogoURL = *logo }
			if phone != nil { inst.OfficialPhone = *phone }
			if email != nil { inst.OfficialEmail = *email }
			_ = json.Unmarshal(coursesBytes, &inst.CoursesOffered)
			_ = json.Unmarshal(eduBytes, &inst.EducationLevels)
			_ = json.Unmarshal(accDocsBytes, &inst.AccreditationDocs)
			u.InstituteProfile = inst
		}
	}

	// 3. Set Cache
	if data, err := json.Marshal(u); err == nil {
		r.rds.Set(ctx, cacheKey, data, 10*time.Minute)
	}

	return &u, nil
}

func (r *Repository) GetByUsername(ctx context.Context, username string) (*User, error) {
	// 1. Try Cache
	cacheKey := "user:username:" + username
	if val, err := r.rds.Get(ctx, cacheKey).Result(); err == nil {
		var u User
		if err := json.Unmarshal([]byte(val), &u); err == nil {
			return &u, nil
		}
	}

	var u User
	err := r.db.QueryRow(ctx, `
		SELECT id, username, email, role,
		       kyc_verified_at, kyc_reference_id, aadhaar_hash, full_name, dob, gender,
		       profile_pic_url, banner_url, bio, institution_name, social_links, skills, recognitions,
		       created_at, updated_at,
		       location, languages, demographic,
			   religion, caste, subcaste, nationality, phone
		FROM users WHERE username=$1
	`, username).Scan(&u.ID, &u.Username, &u.Email, &u.Role,
		&u.KycVerifiedAt, &u.KycReferenceID, &u.AadhaarHash, &u.FullName, &u.DOB, &u.Gender,
		&u.ProfilePicURL, &u.BannerURL, &u.Bio, &u.InstitutionName, &u.SocialLinks, &u.Skills, &u.Recognitions,
		&u.CreatedAt, &u.UpdatedAt,
		&u.Location, &u.Languages, &u.Demographic,
		&u.Religion, &u.Caste, &u.Subcaste, &u.Nationality, &u.Phone)
	if err != nil {
		return nil, err
	}
	u.FullName = r.decrypt(u.FullName)
	u.Religion = r.decrypt(u.Religion)
	u.Caste = r.decrypt(u.Caste)
	u.Subcaste = r.decrypt(u.Subcaste)
	u.Phone = r.decrypt(u.Phone)
	r.loadExtendedProfile(ctx, &u)
	
	if u.Role == "institute" || u.Role == "organisation" {
		inst := &InstituteProfileInput{}
		var coursesBytes, eduBytes, accDocsBytes []byte
		var banner, logo, phone, email *string
		q := `
			SELECT i.institute_type, i.established_year, i.registration_number, i.website_url, i.short_description, i.logo_url, i.banner_url,
			       c.address, c.campus_type, c.operating_hours,
			       a.courses_offered, a.education_levels, a.student_count, a.faculty_count, a.accreditation_docs,
			       cnt.phone, cnt.email
			FROM institute_users iu
			JOIN institutes i ON iu.institute_id = i.id
			LEFT JOIN institute_campuses c ON c.institute_id = i.id AND c.name = 'Main Campus'
			LEFT JOIN institute_academics a ON a.campus_id = c.id
			LEFT JOIN institute_contacts cnt ON cnt.institute_id = i.id AND cnt.is_primary = true
			WHERE iu.user_id = $1 AND iu.role = 'owner'
			LIMIT 1
		`
		err = r.db.QueryRow(ctx, q, u.ID).Scan(
			&inst.InstituteType, &inst.EstablishedYear, &inst.RegistrationNumber, &inst.WebsiteURL, &inst.ShortDescription, &logo, &banner,
			&inst.AddressLine, &inst.CampusType, &inst.OperatingHours,
			&coursesBytes, &eduBytes, &inst.StudentCount, &inst.FacultyCount, &accDocsBytes,
			&phone, &email,
		)
		if err == nil {
			if banner != nil { inst.BannerURL = *banner }
			if logo != nil { inst.LogoURL = *logo }
			if phone != nil { inst.OfficialPhone = *phone }
			if email != nil { inst.OfficialEmail = *email }
			_ = json.Unmarshal(coursesBytes, &inst.CoursesOffered)
			_ = json.Unmarshal(eduBytes, &inst.EducationLevels)
			_ = json.Unmarshal(accDocsBytes, &inst.AccreditationDocs)
			u.InstituteProfile = inst
		}
	}

	// 3. Set Cache
	if data, err := json.Marshal(u); err == nil {
		r.rds.Set(ctx, cacheKey, data, 10*time.Minute)
	}

	return &u, nil
}



// GetInstitutes fetches a paginated list of users with the 'institute' role.
func (r *Repository) GetInstitutes(ctx context.Context, limit, offset int) ([]*User, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, username, role,
		       kyc_verified_at, kyc_reference_id, aadhaar_hash, full_name, dob, gender,
		       profile_pic_url, banner_url, bio, institution_name, social_links, skills, recognitions,
		       created_at, updated_at,
		       location, languages, demographic
		FROM users WHERE role IN ('institute', 'organisation')
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		var u User
		err := rows.Scan(&u.ID, &u.Username, &u.Role,
		&u.KycVerifiedAt, &u.KycReferenceID, &u.AadhaarHash, &u.FullName, &u.DOB, &u.Gender,
		&u.ProfilePicURL, &u.BannerURL, &u.Bio, &u.InstitutionName, &u.SocialLinks, &u.Skills, &u.Recognitions,
		&u.CreatedAt, &u.UpdatedAt,
		&u.Location, &u.Languages, &u.Demographic)
		if err != nil {
			return nil, err
		}
		u.FullName = r.decrypt(u.FullName)
		
		users = append(users, &u)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

// CheckUserInstituteRole checks if a user has a specific role in an institute
func (r *Repository) CheckUserInstituteRole(ctx context.Context, instituteID, userID uuid.UUID) (string, error) {
	var role string
	err := r.db.QueryRow(ctx, "SELECT role FROM institute_users WHERE institute_id=$1 AND user_id=$2", instituteID, userID).Scan(&role)
	if err != nil {
		return "", err
	}
	return role, nil
}

// CreateInstitute creates a new institute and assigns the user as owner
func (r *Repository) CreateInstitute(ctx context.Context, i *Institute, ownerID uuid.UUID) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	_, err = tx.Exec(ctx, `
		INSERT INTO institutes (id, name, institute_type, established_year, registration_number, website_url, tax_id, short_description, social_links)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, i.ID, i.Name, i.InstituteType, i.EstablishedYear, i.RegistrationNumber, i.WebsiteURL, i.TaxID, i.ShortDescription, i.SocialLinks)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO institute_users (institute_id, user_id, role)
		VALUES ($1, $2, 'owner')
	`, i.ID, ownerID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

// GetInstitute retrieves basic institute info
func (r *Repository) GetInstitute(ctx context.Context, id uuid.UUID) (*Institute, error) {
	var i Institute
	err := r.db.QueryRow(ctx, `
		SELECT id, name, institute_type, established_year, registration_number, website_url, tax_id, short_description, social_links, created_at, updated_at
		FROM institutes WHERE id=$1
	`, id).Scan(&i.ID, &i.Name, &i.InstituteType, &i.EstablishedYear, &i.RegistrationNumber, &i.WebsiteURL, &i.TaxID, &i.ShortDescription, &i.SocialLinks, &i.CreatedAt, &i.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &i, nil
}

// AddInstituteBanking adds banking details (protected by RBAC in service)
func (r *Repository) AddInstituteBanking(ctx context.Context, b *InstituteBanking) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO institute_banking (id, institute_id, bank_account_name, bank_account_number, bank_ifsc, billing_address)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, b.ID, b.InstituteID, b.BankAccountName, b.BankAccountNumber, b.BankIFSC, b.BillingAddress)
	return err
}

// AddInstituteCampus adds a campus
func (r *Repository) AddInstituteCampus(ctx context.Context, c *InstituteCampus) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO institute_campuses (id, institute_id, name, address, campus_type, operating_hours, facilities)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, c.ID, c.InstituteID, c.Name, c.Address, c.CampusType, c.OperatingHours, c.Facilities)
	return err
}

func (r *Repository) UpsertInstituteProfile(ctx context.Context, userID uuid.UUID, inst *InstituteProfileInput, instName *string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		fmt.Printf("[UpsertInstituteProfile] Begin tx error: %v\n", err)
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var instituteID uuid.UUID
	err = tx.QueryRow(ctx, `SELECT institute_id FROM institute_users WHERE user_id=$1 AND role='owner' LIMIT 1`, userID).Scan(&instituteID)
	fmt.Printf("[UpsertInstituteProfile] lookup err=%v, instituteID=%v\n", err, instituteID)

	// Convert array slices to jsonb bytes
	coursesJSON, _ := json.Marshal(inst.CoursesOffered)
	eduLevelsJSON, _ := json.Marshal(inst.EducationLevels)
	accDocsJSON, _ := json.Marshal(inst.AccreditationDocs)

	nameToUse := ""
	if instName != nil {
		nameToUse = *instName
	}
	fmt.Printf("[UpsertInstituteProfile] nameToUse=%q, instituteType=%q, year=%d, regNum=%q\n", nameToUse, inst.InstituteType, inst.EstablishedYear, inst.RegistrationNumber)

	if err != nil { // Not found — create institute, campus, academics, contacts
		instituteID = uuid.New()
		fmt.Printf("[UpsertInstituteProfile] INSERT institutes id=%v\n", instituteID)
		_, err = tx.Exec(ctx, `
			INSERT INTO institutes (id, name, institute_type, established_year, registration_number, website_url, short_description, logo_url, banner_url)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`, instituteID, nameToUse, inst.InstituteType, inst.EstablishedYear, inst.RegistrationNumber, inst.WebsiteURL, inst.ShortDescription, inst.LogoURL, inst.BannerURL)
		if err != nil { fmt.Printf("[UpsertInstituteProfile] INSERT institutes error: %v\n", err); return err }

		fmt.Printf("[UpsertInstituteProfile] INSERT institute_users\n")
		_, err = tx.Exec(ctx, `
			INSERT INTO institute_users (institute_id, user_id, role)
			VALUES ($1, $2, 'owner')
		`, instituteID, userID)
		if err != nil { fmt.Printf("[UpsertInstituteProfile] INSERT institute_users error: %v\n", err); return err }

		// Create main campus
		campusID := uuid.New()
		fmt.Printf("[UpsertInstituteProfile] INSERT institute_campuses id=%v\n", campusID)
		_, err = tx.Exec(ctx, `
			INSERT INTO institute_campuses (id, institute_id, name, address, campus_type, operating_hours)
			VALUES ($1, $2, 'Main Campus', $3, $4, $5)
		`, campusID, instituteID, inst.AddressLine, inst.CampusType, inst.OperatingHours)
		if err != nil { fmt.Printf("[UpsertInstituteProfile] INSERT institute_campuses error: %v\n", err); return err }

		fmt.Printf("[UpsertInstituteProfile] INSERT institute_academics courses=%s edu=%s\n", string(coursesJSON), string(eduLevelsJSON))
		_, err = tx.Exec(ctx, `
			INSERT INTO institute_academics (campus_id, courses_offered, education_levels, student_count, faculty_count, accreditation_docs)
			VALUES ($1, $2, $3, $4, $5, $6)
		`, campusID, coursesJSON, eduLevelsJSON, inst.StudentCount, inst.FacultyCount, accDocsJSON)
		if err != nil { fmt.Printf("[UpsertInstituteProfile] INSERT institute_academics error: %v\n", err); return err }

		fmt.Printf("[UpsertInstituteProfile] INSERT institute_contacts\n")
		_, err = tx.Exec(ctx, `
			INSERT INTO institute_contacts (institute_id, name, phone, email, is_primary)
			VALUES ($1, $2, $3, $4, true)
		`, instituteID, nameToUse, inst.OfficialPhone, inst.OfficialEmail)
		if err != nil { fmt.Printf("[UpsertInstituteProfile] INSERT institute_contacts error: %v\n", err); return err }

	} else { // Found — update existing records
		fmt.Printf("[UpsertInstituteProfile] UPDATE institutes id=%v\n", instituteID)
		_, err = tx.Exec(ctx, `
			UPDATE institutes
			SET name=$1, institute_type=$2, established_year=$3, registration_number=$4, website_url=$5, short_description=$6, logo_url=$7, banner_url=$8, updated_at=NOW()
			WHERE id=$9
		`, nameToUse, inst.InstituteType, inst.EstablishedYear, inst.RegistrationNumber, inst.WebsiteURL, inst.ShortDescription, inst.LogoURL, inst.BannerURL, instituteID)
		if err != nil { fmt.Printf("[UpsertInstituteProfile] UPDATE institutes error: %v\n", err); return err }

		// Update or create main campus
		var campusID uuid.UUID
		campusErr := tx.QueryRow(ctx, `SELECT id FROM institute_campuses WHERE institute_id=$1 AND name='Main Campus' LIMIT 1`, instituteID).Scan(&campusID)
		if campusErr != nil {
			campusID = uuid.New()
			fmt.Printf("[UpsertInstituteProfile] INSERT main campus id=%v\n", campusID)
			_, err = tx.Exec(ctx, `
				INSERT INTO institute_campuses (id, institute_id, name, address, campus_type, operating_hours)
				VALUES ($1, $2, 'Main Campus', $3, $4, $5)
			`, campusID, instituteID, inst.AddressLine, inst.CampusType, inst.OperatingHours)
			if err != nil { fmt.Printf("[UpsertInstituteProfile] INSERT campus error: %v\n", err); return err }
		} else {
			fmt.Printf("[UpsertInstituteProfile] UPDATE campus id=%v\n", campusID)
			_, err = tx.Exec(ctx, `
				UPDATE institute_campuses
				SET address=$1, campus_type=$2, operating_hours=$3, updated_at=NOW()
				WHERE id=$4
			`, inst.AddressLine, inst.CampusType, inst.OperatingHours, campusID)
			if err != nil { fmt.Printf("[UpsertInstituteProfile] UPDATE campus error: %v\n", err); return err }
		}

		// Upsert institute_academics via campus_id
		fmt.Printf("[UpsertInstituteProfile] UPSERT institute_academics for campus=%v\n", campusID)
		_, err = tx.Exec(ctx, `
			INSERT INTO institute_academics (campus_id, courses_offered, education_levels, student_count, faculty_count, accreditation_docs)
			VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT (campus_id) DO UPDATE
			SET courses_offered=$2, education_levels=$3, student_count=$4, faculty_count=$5, accreditation_docs=$6, updated_at=NOW()
		`, campusID, coursesJSON, eduLevelsJSON, inst.StudentCount, inst.FacultyCount, accDocsJSON)
		if err != nil { fmt.Printf("[UpsertInstituteProfile] UPSERT institute_academics error: %v\n", err); return err }

		fmt.Printf("[UpsertInstituteProfile] UPDATE institute_contacts\n")
		_, err = tx.Exec(ctx, `
			UPDATE institute_contacts
			SET phone=$1, email=$2, updated_at=NOW()
			WHERE institute_id=$3 AND is_primary=true
		`, inst.OfficialPhone, inst.OfficialEmail, instituteID)
		if err != nil { fmt.Printf("[UpsertInstituteProfile] UPDATE institute_contacts error: %v\n", err); return err }
	}

	return tx.Commit(ctx)
}
