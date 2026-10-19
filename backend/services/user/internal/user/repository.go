package user

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"backend/shared/crypto"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Repository struct {
	db            *pgxpool.Pool
	rds           *redis.Client
	encryptionKey []byte
}

func NewRepository(db *pgxpool.Pool, rds *redis.Client, encryptionKey string) *Repository {
	return &Repository{
		db:            db,
		rds:           rds,
		encryptionKey: []byte(encryptionKey),
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

func (r *Repository) hash(val *string) *string {
	if val == nil || *val == "" {
		return val
	}
	h := crypto.Hash(*val, r.encryptionKey)
	return &h
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
	`, u.KycReferenceID, u.AadhaarHash, r.encrypt(u.FullName), r.encrypt(u.DOB), r.encrypt(u.Gender), u.ID)
	if err == nil {
		r.invalidateCache(ctx, u.ID)
	}
	return err
}

func (r *Repository) invalidateCache(ctx context.Context, userID uuid.UUID) {
	// To safely invalidate all keys (id, email, username), we need the current values from the DB.
	// This ensures that even if one cache key was missing, we find and clear the others.
	var u User
	err := r.db.QueryRow(ctx, `SELECT id, email, username FROM users WHERE id=$1`, userID).Scan(&u.ID, &u.Email, &u.Username)
	if err != nil {
		// If user not found, just try to clear by ID as a fallback
		r.rds.Del(ctx, "user:id:"+userID.String())
		return
	}

	r.rds.Del(ctx, "user:id:"+u.ID.String())
	r.rds.Del(ctx, "user:email:"+u.Email)
	r.rds.Del(ctx, "user:username:"+u.Username)
}

func (r *Repository) Create(ctx context.Context, u *User) error {
	log.Printf("[Repository] Creating User Profile - ID: %s, Email: %s, Username: %s, Role: %s", u.ID, u.Email, u.Username, u.Role)
	row := r.db.QueryRow(ctx, `
		INSERT INTO users (id, email, username, full_name, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING created_at, updated_at
	`, u.ID, u.Email, u.Username, r.encrypt(u.FullName), u.Role)

	err := row.Scan(&u.CreatedAt, &u.UpdatedAt)
	return err
}

func (r *Repository) GetByEmail(ctx context.Context, email string) (*User, error) {
	// 1. Try Cache
	cacheKey := "user:email:" + email
	if val, err := r.rds.Get(ctx, cacheKey).Result(); err == nil {
		var u User
		if err := json.Unmarshal([]byte(val), &u); err == nil {
			return &u, nil
		}
	}

	var u User
	err := r.db.QueryRow(ctx, `
		SELECT id, email, username, role, phone, phone_hash, phone_verified_at, email_verified_at, 
		       kyc_verified_at, kyc_reference_id, aadhaar_hash, full_name, dob, gender,
		       profile_pic_url, banner_url, bio, institution_name, social_links, skills, recognitions,
		       totp_secret, mfa_preference, disabled, created_at, updated_at,
		       location, languages, demographic
		FROM users WHERE email=$1
	`, email).Scan(&u.ID, &u.Email, &u.Username, &u.Role, &u.Phone, &u.PhoneHash, &u.PhoneVerifiedAt, &u.EmailVerifiedAt,
		&u.KycVerifiedAt, &u.KycReferenceID, &u.AadhaarHash, &u.FullName, &u.DOB, &u.Gender,
		&u.ProfilePicURL, &u.BannerURL, &u.Bio, &u.InstitutionName, &u.SocialLinks, &u.Skills, &u.Recognitions,
		&u.TOTPSecret, &u.MFAPreference, &u.Disabled, &u.CreatedAt, &u.UpdatedAt,
		&u.Location, &u.Languages, &u.Demographic)
	if err != nil {
		return nil, err
	}
	u.FullName = r.decrypt(u.FullName)
	u.DOB = r.decrypt(u.DOB)
	u.Gender = r.decrypt(u.Gender)
	u.Phone = r.decrypt(u.Phone)

	// 2. Load InstituteProfile if applicable
	if u.Role == "institute" || u.Role == "organisation" {
		ip, err := r.GetInstituteProfile(ctx, u.ID)
		if err == nil {
			u.InstituteProfile = ip
		}
	}

	// 3. Set Cache
	if data, err := json.Marshal(u); err == nil {
		r.rds.Set(ctx, cacheKey, data, 10*time.Minute)
	}

	return &u, nil
}

func (r *Repository) SetEmailVerified(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET email_verified_at = now(), updated_at = now() WHERE id=$1`, userID)
	if err == nil {
		r.invalidateCache(ctx, userID)
	}
	return err
}

func (r *Repository) SetPhoneVerified(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET phone_verified_at = now(), updated_at = now() WHERE id=$1`, userID)
	if err == nil {
		r.invalidateCache(ctx, userID)
	}
	return err
}

func (r *Repository) SetTOTPSecret(ctx context.Context, userID uuid.UUID, secret string) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET totp_secret=$1, updated_at = now() WHERE id=$2`, secret, userID)
	if err == nil {
		r.invalidateCache(ctx, userID)
	}
	return err
}

func (r *Repository) SetMFAPreference(ctx context.Context, userID uuid.UUID, preference string) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET mfa_preference=$1, updated_at = now() WHERE id=$2`, preference, userID)
	if err == nil {
		r.invalidateCache(ctx, userID)
	}
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
	_, err := r.db.Exec(ctx, `
		UPDATE users 
		SET full_name=$1, dob=$2, gender=$3, bio=$4, 
		    social_links=$5, skills=$6, recognitions=$7, 
		    institution_name=$8, location=$9, languages=$10, demographic=$11,
		    updated_at=NOW()
		WHERE id=$12
	`, r.encrypt(u.FullName), r.encrypt(u.DOB), r.encrypt(u.Gender), u.Bio,
		u.SocialLinks, u.Skills, u.Recognitions, u.InstitutionName,
		u.Location, u.Languages, u.Demographic, u.ID)
	if err == nil {
		r.invalidateCache(ctx, u.ID)
	}
	return err
}

func (r *Repository) SetDisabled(ctx context.Context, userID uuid.UUID, disabled bool) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET disabled=$1, updated_at = now() WHERE id=$2`, disabled, userID)
	if err == nil {
		r.invalidateCache(ctx, userID)
	}
	return err
}

// ExistsByEmail checks if a user exists with the given email.
func (r *Repository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE email=$1)`, email).Scan(&exists)
	return exists, err
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
		SELECT id, email, username, role, phone, phone_hash, phone_verified_at, email_verified_at, 
		       kyc_verified_at, kyc_reference_id, aadhaar_hash, full_name, dob, gender,
		       profile_pic_url, banner_url, bio, institution_name, social_links, skills, recognitions,
		       totp_secret, mfa_preference, disabled, created_at, updated_at,
		       location, languages, demographic
		FROM users WHERE id=$1
	`, id).Scan(&u.ID, &u.Email, &u.Username, &u.Role, &u.Phone, &u.PhoneHash, &u.PhoneVerifiedAt, &u.EmailVerifiedAt,
		&u.KycVerifiedAt, &u.KycReferenceID, &u.AadhaarHash, &u.FullName, &u.DOB, &u.Gender,
		&u.ProfilePicURL, &u.BannerURL, &u.Bio, &u.InstitutionName, &u.SocialLinks, &u.Skills, &u.Recognitions,
		&u.TOTPSecret, &u.MFAPreference, &u.Disabled, &u.CreatedAt, &u.UpdatedAt,
		&u.Location, &u.Languages, &u.Demographic)
	if err != nil {
		return nil, err
	}
	u.FullName = r.decrypt(u.FullName)
	u.DOB = r.decrypt(u.DOB)
	u.Gender = r.decrypt(u.Gender)
	u.Phone = r.decrypt(u.Phone)

	// 2. Load InstituteProfile if applicable
	if u.Role == "institute" || u.Role == "organisation" {
		ip, err := r.GetInstituteProfile(ctx, u.ID)
		if err == nil {
			u.InstituteProfile = ip
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
		SELECT id, email, username, role, phone, phone_hash, phone_verified_at, email_verified_at, 
		       kyc_verified_at, kyc_reference_id, aadhaar_hash, full_name, dob, gender,
		       profile_pic_url, banner_url, bio, institution_name, social_links, skills, recognitions,
		       totp_secret, mfa_preference, disabled, created_at, updated_at,
		       location, languages, demographic
		FROM users WHERE username=$1
	`, username).Scan(&u.ID, &u.Email, &u.Username, &u.Role, &u.Phone, &u.PhoneHash, &u.PhoneVerifiedAt, &u.EmailVerifiedAt,
		&u.KycVerifiedAt, &u.KycReferenceID, &u.AadhaarHash, &u.FullName, &u.DOB, &u.Gender,
		&u.ProfilePicURL, &u.BannerURL, &u.Bio, &u.InstitutionName, &u.SocialLinks, &u.Skills, &u.Recognitions,
		&u.TOTPSecret, &u.MFAPreference, &u.Disabled, &u.CreatedAt, &u.UpdatedAt,
		&u.Location, &u.Languages, &u.Demographic)
	if err != nil {
		return nil, err
	}
	u.FullName = r.decrypt(u.FullName)
	u.DOB = r.decrypt(u.DOB)
	u.Gender = r.decrypt(u.Gender)
	u.Phone = r.decrypt(u.Phone)

	// 2. Load InstituteProfile if applicable
	if u.Role == "institute" || u.Role == "organisation" {
		ip, err := r.GetInstituteProfile(ctx, u.ID)
		if err == nil {
			u.InstituteProfile = ip
		}
	}

	// 3. Set Cache
	if data, err := json.Marshal(u); err == nil {
		r.rds.Set(ctx, cacheKey, data, 10*time.Minute)
	}

	return &u, nil
}

func (r *Repository) GetByPhone(ctx context.Context, phone string) (*User, error) {
	var u User
	err := r.db.QueryRow(ctx, `
		SELECT id, email, username, role, phone, phone_hash, phone_verified_at, email_verified_at, 
		       kyc_verified_at, kyc_reference_id, aadhaar_hash, full_name, dob, gender,
		       profile_pic_url, banner_url, bio, institution_name, social_links, skills, recognitions,
		       totp_secret, mfa_preference, disabled, created_at, updated_at,
		       location, languages, demographic
		FROM users WHERE phone_hash=$1
	`, r.hash(&phone)).Scan(&u.ID, &u.Email, &u.Username, &u.Role, &u.Phone, &u.PhoneHash, &u.PhoneVerifiedAt, &u.EmailVerifiedAt,
		&u.KycVerifiedAt, &u.KycReferenceID, &u.AadhaarHash, &u.FullName, &u.DOB, &u.Gender,
		&u.ProfilePicURL, &u.BannerURL, &u.Bio, &u.InstitutionName, &u.SocialLinks, &u.Skills, &u.Recognitions,
		&u.TOTPSecret, &u.MFAPreference, &u.Disabled, &u.CreatedAt, &u.UpdatedAt,
		&u.Location, &u.Languages, &u.Demographic)
	if err != nil {
		return nil, err
	}
	u.FullName = r.decrypt(u.FullName)
	u.DOB = r.decrypt(u.DOB)
	u.Gender = r.decrypt(u.Gender)
	u.Phone = r.decrypt(u.Phone)

	// 2. Load InstituteProfile if applicable
	if u.Role == "institute" || u.Role == "organisation" {
		ip, err := r.GetInstituteProfile(ctx, u.ID)
		if err == nil {
			u.InstituteProfile = ip
		}
	}

	return &u, nil
}

// GetInstitutes fetches a paginated list of users with the 'institute' role.
func (r *Repository) GetInstitutes(ctx context.Context, limit, offset int) ([]*User, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, email, username, role, phone, phone_hash, phone_verified_at, email_verified_at, 
		       kyc_verified_at, kyc_reference_id, aadhaar_hash, full_name, dob, gender,
		       profile_pic_url, banner_url, bio, institution_name, social_links, skills, recognitions,
		       totp_secret, mfa_preference, disabled, created_at, updated_at,
		       location, languages, demographic
		FROM users WHERE role IN ('institute', 'organisation') AND disabled=false
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
		err := rows.Scan(&u.ID, &u.Email, &u.Username, &u.Role, &u.Phone, &u.PhoneHash, &u.PhoneVerifiedAt, &u.EmailVerifiedAt,
			&u.KycVerifiedAt, &u.KycReferenceID, &u.AadhaarHash, &u.FullName, &u.DOB, &u.Gender,
			&u.ProfilePicURL, &u.BannerURL, &u.Bio, &u.InstitutionName, &u.SocialLinks, &u.Skills, &u.Recognitions,
			&u.TOTPSecret, &u.MFAPreference, &u.Disabled, &u.CreatedAt, &u.UpdatedAt,
			&u.Location, &u.Languages, &u.Demographic)
		if err != nil {
			return nil, err
		}
		u.FullName = r.decrypt(u.FullName)
		u.DOB = r.decrypt(u.DOB)
		u.Gender = r.decrypt(u.Gender)
		u.Phone = r.decrypt(u.Phone)

		ip, err := r.GetInstituteProfile(ctx, u.ID)
		if err == nil {
			u.InstituteProfile = ip
		}
		users = append(users, &u)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}
