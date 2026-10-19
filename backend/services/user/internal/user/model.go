package user

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID              uuid.UUID  `db:"id" json:"id"`
	Username        string     `db:"username" json:"username"`
	Email           *string    `db:"email" json:"email,omitempty"`
	Role            string     `db:"role" json:"role"`
	KycVerifiedAt   *time.Time `db:"kyc_verified_at" json:"kyc_verified_at,omitempty"`
	KycReferenceID  *string    `db:"kyc_reference_id" json:"kyc_reference_id,omitempty"`
	AadhaarHash     *string    `db:"aadhaar_hash" json:"aadhaar_hash,omitempty"`
	FullName        *string    `db:"full_name" json:"full_name,omitempty"`
	Phone           *string    `db:"phone" json:"phone,omitempty"`
	DOB             *time.Time `db:"dob" json:"dob,omitempty"`
	Gender          *string    `db:"gender" json:"gender,omitempty"`
	ProfilePicURL  *string           `db:"profile_pic_url" json:"profile_pic_url,omitempty"`
	BannerURL      *string           `db:"banner_url" json:"banner_url,omitempty"`
	Bio            *string           `db:"bio" json:"bio,omitempty"`
	InstitutionName *string          `db:"institution_name" json:"institution_name,omitempty"`
	SocialLinks    map[string]string `db:"social_links" json:"social_links,omitempty"`
	Skills         []string          `db:"skills" json:"skills,omitempty"`
	Recognitions   []string          `db:"recognitions" json:"recognitions,omitempty"`
	Location       *string           `db:"location" json:"location,omitempty"`
	Languages      []string          `db:"languages" json:"languages,omitempty"`
	Demographic    *string           `db:"demographic" json:"demographic,omitempty"`

	Religion       *string `db:"religion" json:"religion,omitempty"`
	Caste          *string `db:"caste" json:"caste,omitempty"`
	Subcaste       *string `db:"subcaste" json:"subcaste,omitempty"`
	Nationality    *string `db:"nationality" json:"nationality,omitempty"`

	CreatedAt       time.Time `db:"created_at" json:"created_at"`
	UpdatedAt       time.Time `db:"updated_at" json:"updated_at"`

	InstituteProfile *InstituteProfileInput `json:"institute_profile,omitempty"`
	
	Addresses         []*UserAddress         `json:"addresses,omitempty"`
	AcademicRecords   []*UserAcademicRecord  `json:"academic_records,omitempty"`
	WorkExperiences   []*UserWorkExperience  `json:"work_experiences,omitempty"`
	}

type UserAddress struct {
	ID                 uuid.UUID `db:"id" json:"id"`
	UserID             uuid.UUID `db:"user_id" json:"user_id"`
	Type               string    `db:"type" json:"type"`
	AddressLine        *string   `db:"address_line" json:"address_line,omitempty"`
	State              *string   `db:"state" json:"state,omitempty"`
	District           *string   `db:"district" json:"district,omitempty"`
	Pincode            *string   `db:"pincode" json:"pincode,omitempty"`
	IsSameAsPermanent  bool      `db:"is_same_as_permanent" json:"is_same_as_permanent"`
	CreatedAt          time.Time `db:"created_at" json:"created_at"`
	UpdatedAt          time.Time `db:"updated_at" json:"updated_at"`
}

type UserAcademicRecord struct {
	ID              uuid.UUID `db:"id" json:"id"`
	UserID          uuid.UUID `db:"user_id" json:"user_id"`
	Qualification   *string   `db:"qualification" json:"qualification,omitempty"`
	BoardUniversity *string   `db:"board_university" json:"board_university,omitempty"`
	PassingYear     *int      `db:"passing_year" json:"passing_year,omitempty"`
	PercentageCgpa  *string   `db:"percentage_cgpa" json:"percentage_cgpa,omitempty"`
	DocumentURL     *string          `db:"document_url" json:"document_url,omitempty"`
	Achievements    json.RawMessage  `db:"achievements" json:"achievements,omitempty"`
	CreatedAt       time.Time        `db:"created_at" json:"created_at"`
	UpdatedAt       time.Time        `db:"updated_at" json:"updated_at"`
}

type MongoAcademicAchievements struct {
	AcademicRecordID string      `bson:"academic_record_id" json:"academic_record_id"`
	UserID           string      `bson:"user_id" json:"user_id"`
	Achievements     interface{} `bson:"achievements" json:"achievements"`
	UpdatedAt        time.Time   `bson:"updated_at" json:"updated_at"`
}

type UserWorkExperience struct {
	ID          uuid.UUID  `db:"id" json:"id"`
	UserID      uuid.UUID  `db:"user_id" json:"user_id"`
	CompanyName *string    `db:"company_name" json:"company_name,omitempty"`
	Designation *string    `db:"designation" json:"designation,omitempty"`
	StartDate   *time.Time `db:"start_date" json:"start_date,omitempty"`
	EndDate     *time.Time `db:"end_date" json:"end_date,omitempty"`
	CreatedAt   time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at" json:"updated_at"`
}


type InstituteProfileInput struct {
	InstituteType         string   `json:"institute_type" validate:"required"`
	EstablishedYear       int      `json:"established_year" validate:"required,min=1800"`
	RegistrationNumber    string   `json:"registration_number" validate:"required"`
	OfficialPhone         string   `json:"official_phone"`
	OfficialEmail         string   `json:"official_email"`
	WebsiteURL            string   `json:"website_url" validate:"omitempty,url"`
	CoursesOffered        []string `json:"courses_offered" validate:"required"`
	EducationLevels       []string `json:"education_levels" validate:"required"`
	StudentCount          int      `json:"student_count"`
	FacultyCount          int      `json:"faculty_count"`
	CampusType            string   `json:"campus_type"`
	OperatingHours        string   `json:"operating_hours"`
	LicenseCertificateURL string   `json:"license_certificate_url"`
	AccreditationDocs     []string `json:"accreditation_docs"`
	AddressLine           string   `json:"address_line"`
	Pincode               string   `json:"pincode"`
	ShortDescription      string   `json:"short_description"`
	LogoURL               string   `json:"logo_url"`
	BannerURL             string   `json:"banner_url"`
}


type UserPassword struct {
	UserID     uuid.UUID `db:"user_id" json:"user_id"`
	Hash       string    `db:"hash" json:"-"`
	Algo       string    `db:"algo" json:"algo"`
	ParamsJSON []byte    `db:"params_json" json:"params_json"`
	CreatedAt  time.Time `db:"created_at" json:"created_at"`
}

// B2B SaaS Models
type Institute struct {
	ID                 uuid.UUID `db:"id" json:"id"`
	Name               string    `db:"name" json:"name"`
	InstituteType      *string   `db:"institute_type" json:"institute_type,omitempty"`
	EstablishedYear    *int      `db:"established_year" json:"established_year,omitempty"`
	RegistrationNumber *string   `db:"registration_number" json:"registration_number,omitempty"`
	WebsiteURL         *string   `db:"website_url" json:"website_url,omitempty"`
	TaxID              *string   `db:"tax_id" json:"tax_id,omitempty"`
	ShortDescription   *string   `db:"short_description" json:"short_description,omitempty"`
	SocialLinks        []byte    `db:"social_links" json:"social_links,omitempty"`
	LogoURL            *string   `db:"logo_url" json:"logo_url,omitempty"`
	BannerURL          *string   `db:"banner_url" json:"banner_url,omitempty"`
	CreatedAt          time.Time `db:"created_at" json:"created_at"`
	UpdatedAt          time.Time `db:"updated_at" json:"updated_at"`
}

type InstituteUser struct {
	InstituteID  uuid.UUID  `db:"institute_id" json:"institute_id"`
	UserID       uuid.UUID  `db:"user_id" json:"user_id"`
	CampusID     *uuid.UUID `db:"campus_id" json:"campus_id,omitempty"`
	CollegeID    *uuid.UUID `db:"college_id" json:"college_id,omitempty"`
	DepartmentID *uuid.UUID `db:"department_id" json:"department_id,omitempty"`
	Role         string     `db:"role" json:"role"`
	CreatedAt    time.Time  `db:"created_at" json:"created_at"`
}

type InstituteBanking struct {
	ID                uuid.UUID `db:"id" json:"id"`
	InstituteID       uuid.UUID `db:"institute_id" json:"institute_id"`
	BankAccountName   string    `db:"bank_account_name" json:"bank_account_name"`
	BankAccountNumber string    `db:"bank_account_number" json:"bank_account_number"`
	BankIFSC          string    `db:"bank_ifsc" json:"bank_ifsc"`
	BillingAddress    *string   `db:"billing_address" json:"billing_address,omitempty"`
	CreatedAt         time.Time `db:"created_at" json:"created_at"`
	UpdatedAt         time.Time `db:"updated_at" json:"updated_at"`
}

type InstituteContact struct {
	ID          uuid.UUID `db:"id" json:"id"`
	InstituteID uuid.UUID `db:"institute_id" json:"institute_id"`
	Name        string    `db:"name" json:"name"`
	Designation *string   `db:"designation" json:"designation,omitempty"`
	Phone       *string   `db:"phone" json:"phone,omitempty"`
	Email       *string   `db:"email" json:"email,omitempty"`
	IsPrimary   bool      `db:"is_primary" json:"is_primary"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}

type InstituteCampus struct {
	ID             uuid.UUID `db:"id" json:"id"`
	InstituteID    uuid.UUID `db:"institute_id" json:"institute_id"`
	Name           string    `db:"name" json:"name"`
	Address        *string   `db:"address" json:"address,omitempty"`
	CampusType     *string   `db:"campus_type" json:"campus_type,omitempty"`
	OperatingHours *string   `db:"operating_hours" json:"operating_hours,omitempty"`
	Facilities     []byte    `db:"facilities" json:"facilities,omitempty"`
	CreatedAt      time.Time `db:"created_at" json:"created_at"`
	UpdatedAt      time.Time `db:"updated_at" json:"updated_at"`
}

type InstituteAcademics struct {
	ID                uuid.UUID `db:"id" json:"id"`
	CampusID          uuid.UUID `db:"campus_id" json:"campus_id"`
	CoursesOffered    []byte    `db:"courses_offered" json:"courses_offered,omitempty"`
	EducationLevels   []byte    `db:"education_levels" json:"education_levels,omitempty"`
	StudentCount      *int      `db:"student_count" json:"student_count,omitempty"`
	FacultyCount      *int      `db:"faculty_count" json:"faculty_count,omitempty"`
	AccreditationDocs []byte    `db:"accreditation_docs" json:"accreditation_docs,omitempty"`
	Certifications    []byte    `db:"certifications" json:"certifications,omitempty"`
	CreatedAt         time.Time `db:"created_at" json:"created_at"`
	UpdatedAt         time.Time `db:"updated_at" json:"updated_at"`
}

type InstituteCollege struct {
	ID                uuid.UUID `db:"id" json:"id"`
	CampusID          uuid.UUID `db:"campus_id" json:"campus_id"`
	Name              string    `db:"name" json:"name"`
	EstablishedYear   *int      `db:"established_year" json:"established_year,omitempty"`
	AccreditationDocs []byte    `db:"accreditation_docs" json:"accreditation_docs,omitempty"`
	CreatedAt         time.Time `db:"created_at" json:"created_at"`
	UpdatedAt         time.Time `db:"updated_at" json:"updated_at"`
}

type InstituteDepartment struct {
	ID               uuid.UUID `db:"id" json:"id"`
	CollegeID        uuid.UUID `db:"college_id" json:"college_id"`
	Name             string    `db:"name" json:"name"`
	HeadOfDepartment *string   `db:"head_of_department" json:"head_of_department,omitempty"`
	FacultyCount     *int      `db:"faculty_count" json:"faculty_count,omitempty"`
	CreatedAt        time.Time `db:"created_at" json:"created_at"`
	UpdatedAt        time.Time `db:"updated_at" json:"updated_at"`
}
