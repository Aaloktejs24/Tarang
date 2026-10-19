package user

import (
	"context"

	"github.com/google/uuid"
)

func (r *Repository) GetInstituteProfile(ctx context.Context, userID uuid.UUID) (*InstituteProfile, error) {
	var ip InstituteProfile
	err := r.db.QueryRow(ctx, `SELECT user_id, institute_type, established_year, registration_number, primary_contact_name, primary_contact_designation, official_phone, official_email, website_url, alternate_contact, courses_offered, education_levels, student_count, faculty_count, campus_type, operating_hours, accreditation_docs, license_certificate_url, tax_id, certifications, bank_account_name, bank_account_number, bank_ifsc, billing_address, short_description, facilities, social_links, terms_accepted_at, privacy_accepted_at, authorized_signatory_name, created_at, updated_at FROM institute_profiles WHERE user_id=$1`, userID).Scan(
		&ip.UserID, &ip.InstituteType, &ip.EstablishedYear, &ip.RegistrationNumber,
		&ip.PrimaryContactName, &ip.PrimaryContactDesignation, &ip.OfficialPhone, &ip.OfficialEmail,
		&ip.WebsiteURL, &ip.AlternateContact, &ip.CoursesOffered, &ip.EducationLevels,
		&ip.StudentCount, &ip.FacultyCount, &ip.CampusType, &ip.OperatingHours,
		&ip.AccreditationDocs, &ip.LicenseCertificateURL, &ip.TaxID, &ip.Certifications,
		&ip.BankAccountName, &ip.BankAccountNumber, &ip.BankIFSC, &ip.BillingAddress,
		&ip.ShortDescription, &ip.Facilities, &ip.SocialLinks,
		&ip.TermsAcceptedAt, &ip.PrivacyAcceptedAt, &ip.AuthorizedSignatoryName,
		&ip.CreatedAt, &ip.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &ip, nil
}

func (r *Repository) UpsertInstituteProfile(ctx context.Context, ip *InstituteProfile) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO institute_profiles (
			user_id, institute_type, established_year, registration_number,
			primary_contact_name, primary_contact_designation, official_phone, official_email,
			website_url, alternate_contact, courses_offered, education_levels,
			student_count, faculty_count, campus_type, operating_hours,
			accreditation_docs, license_certificate_url, tax_id, certifications,
			bank_account_name, bank_account_number, bank_ifsc, billing_address,
			short_description, facilities, social_links,
			terms_accepted_at, privacy_accepted_at, authorized_signatory_name, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, NOW()
		)
		ON CONFLICT (user_id) DO UPDATE SET
			institute_type = EXCLUDED.institute_type,
			established_year = EXCLUDED.established_year,
			registration_number = EXCLUDED.registration_number,
			primary_contact_name = EXCLUDED.primary_contact_name,
			primary_contact_designation = EXCLUDED.primary_contact_designation,
			official_phone = EXCLUDED.official_phone,
			official_email = EXCLUDED.official_email,
			website_url = EXCLUDED.website_url,
			alternate_contact = EXCLUDED.alternate_contact,
			courses_offered = EXCLUDED.courses_offered,
			education_levels = EXCLUDED.education_levels,
			student_count = EXCLUDED.student_count,
			faculty_count = EXCLUDED.faculty_count,
			campus_type = EXCLUDED.campus_type,
			operating_hours = EXCLUDED.operating_hours,
			accreditation_docs = EXCLUDED.accreditation_docs,
			license_certificate_url = EXCLUDED.license_certificate_url,
			tax_id = EXCLUDED.tax_id,
			certifications = EXCLUDED.certifications,
			bank_account_name = EXCLUDED.bank_account_name,
			bank_account_number = EXCLUDED.bank_account_number,
			bank_ifsc = EXCLUDED.bank_ifsc,
			billing_address = EXCLUDED.billing_address,
			short_description = EXCLUDED.short_description,
			facilities = EXCLUDED.facilities,
			social_links = EXCLUDED.social_links,
			terms_accepted_at = EXCLUDED.terms_accepted_at,
			privacy_accepted_at = EXCLUDED.privacy_accepted_at,
			authorized_signatory_name = EXCLUDED.authorized_signatory_name,
			updated_at = NOW()
	`,
		ip.UserID, ip.InstituteType, ip.EstablishedYear, ip.RegistrationNumber,
		ip.PrimaryContactName, ip.PrimaryContactDesignation, ip.OfficialPhone, ip.OfficialEmail,
		ip.WebsiteURL, ip.AlternateContact, ip.CoursesOffered, ip.EducationLevels,
		ip.StudentCount, ip.FacultyCount, ip.CampusType, ip.OperatingHours,
		ip.AccreditationDocs, ip.LicenseCertificateURL, ip.TaxID, ip.Certifications,
		ip.BankAccountName, ip.BankAccountNumber, ip.BankIFSC, ip.BillingAddress,
		ip.ShortDescription, ip.Facilities, ip.SocialLinks,
		ip.TermsAcceptedAt, ip.PrivacyAcceptedAt, ip.AuthorizedSignatoryName,
	)
	if err == nil {
		r.invalidateCache(ctx, ip.UserID)
	}
	return err
}
