CREATE TABLE IF NOT EXISTS institute_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    institute_type TEXT,
    established_year INT,
    registration_number TEXT,
    
    primary_contact_name TEXT,
    primary_contact_designation TEXT,
    official_phone TEXT,
    official_email TEXT,
    website_url TEXT,
    alternate_contact TEXT,
    
    courses_offered JSONB,
    education_levels JSONB,
    student_count INT,
    faculty_count INT,
    campus_type TEXT,
    operating_hours TEXT,
    
    accreditation_docs JSONB,
    license_certificate_url TEXT,
    tax_id TEXT,
    certifications JSONB,
    
    bank_account_name TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    billing_address TEXT,
    
    short_description TEXT,
    facilities JSONB,
    social_links JSONB,
    
    terms_accepted_at TIMESTAMPTZ,
    privacy_accepted_at TIMESTAMPTZ,
    authorized_signatory_name TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
