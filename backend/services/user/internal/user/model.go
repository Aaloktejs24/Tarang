package user

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID              uuid.UUID  `db:"id" json:"id"`
	Email           string     `db:"email" json:"email"`
	Username        string     `db:"username" json:"username"`
	Role            string     `db:"role" json:"role"`
	Phone           *string    `db:"phone" json:"phone,omitempty"`
	PhoneHash       *string    `db:"phone_hash" json:"-"`
	PhoneVerifiedAt *time.Time `db:"phone_verified_at" json:"phone_verified_at,omitempty"`
	EmailVerifiedAt *time.Time `db:"email_verified_at" json:"email_verified_at,omitempty"`
	KycVerifiedAt   *time.Time `db:"kyc_verified_at" json:"kyc_verified_at,omitempty"`

	KycReferenceID *string `db:"kyc_reference_id" json:"kyc_reference_id,omitempty"`
	AadhaarHash    *string `db:"aadhaar_hash" json:"aadhaar_hash,omitempty"`
	FullName       *string `db:"full_name" json:"full_name,omitempty"`
	DOB            *string `db:"dob" json:"dob,omitempty"`
	Gender         *string `db:"gender" json:"gender,omitempty"`
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

	TOTPSecret    *string   `db:"totp_secret" json:"totp_secret,omitempty"`
	MFAPreference string    `db:"mfa_preference" json:"mfa_preference"`
	Disabled      bool      `db:"disabled" json:"disabled"`
	CreatedAt     time.Time `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time `db:"updated_at" json:"updated_at"`
	
	InstituteProfile *InstituteProfile `db:"-" json:"institute_profile,omitempty"`
}

type InstituteProfile struct {
	UserID                  uuid.UUID  `db:"user_id" json:"user_id"`
	InstituteType           *string    `db:"institute_type" json:"institute_type,omitempty"`
	EstablishedYear         *int32     `db:"established_year" json:"established_year,omitempty"`
	RegistrationNumber      *string    `db:"registration_number" json:"registration_number,omitempty"`
	PrimaryContactName      *string    `db:"primary_contact_name" json:"primary_contact_name,omitempty"`
	PrimaryContactDesignation *string  `db:"primary_contact_designation" json:"primary_contact_designation,omitempty"`
	OfficialPhone           *string    `db:"official_phone" json:"official_phone,omitempty"`
	OfficialEmail           *string    `db:"official_email" json:"official_email,omitempty"`
	WebsiteURL              *string    `db:"website_url" json:"website_url,omitempty"`
	AlternateContact        *string    `db:"alternate_contact" json:"alternate_contact,omitempty"`
	CoursesOffered          json.RawMessage `db:"courses_offered" json:"courses_offered,omitempty"`
	EducationLevels         json.RawMessage `db:"education_levels" json:"education_levels,omitempty"`
	StudentCount            *int32     `db:"student_count" json:"student_count,omitempty"`
	FacultyCount            *int32     `db:"faculty_count" json:"faculty_count,omitempty"`
	CampusType              *string    `db:"campus_type" json:"campus_type,omitempty"`
	OperatingHours          *string    `db:"operating_hours" json:"operating_hours,omitempty"`
	AccreditationDocs       json.RawMessage `db:"accreditation_docs" json:"accreditation_docs,omitempty"`
	LicenseCertificateURL   *string    `db:"license_certificate_url" json:"license_certificate_url,omitempty"`
	TaxID                   *string    `db:"tax_id" json:"tax_id,omitempty"`
	Certifications          json.RawMessage `db:"certifications" json:"certifications,omitempty"`
	BankAccountName         *string    `db:"bank_account_name" json:"bank_account_name,omitempty"`
	BankAccountNumber       *string    `db:"bank_account_number" json:"bank_account_number,omitempty"`
	BankIFSC                *string    `db:"bank_ifsc" json:"bank_ifsc,omitempty"`
	BillingAddress          *string    `db:"billing_address" json:"billing_address,omitempty"`
	ShortDescription        *string    `db:"short_description" json:"short_description,omitempty"`
	Facilities              json.RawMessage `db:"facilities" json:"facilities,omitempty"`
	SocialLinks             json.RawMessage `db:"social_links" json:"social_links,omitempty"`
	TermsAcceptedAt         *time.Time `db:"terms_accepted_at" json:"terms_accepted_at,omitempty"`
	PrivacyAcceptedAt       *time.Time `db:"privacy_accepted_at" json:"privacy_accepted_at,omitempty"`
	AuthorizedSignatoryName *string    `db:"authorized_signatory_name" json:"authorized_signatory_name,omitempty"`
	CreatedAt               time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt               time.Time  `db:"updated_at" json:"updated_at"`
}

type UserPassword struct {
	UserID     uuid.UUID `db:"user_id" json:"user_id"`
	Hash       string    `db:"hash" json:"-"`
	Algo       string    `db:"algo" json:"algo"`
	ParamsJSON []byte    `db:"params_json" json:"params_json"`
	CreatedAt  time.Time `db:"created_at" json:"created_at"`
}
