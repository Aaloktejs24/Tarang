-- 1. Drop old table
DROP TABLE IF EXISTS institute_profiles CASCADE;

-- 2. Institutes Core Table
CREATE TABLE institutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    institute_type TEXT,
    established_year INT,
    registration_number TEXT,
    website_url TEXT,
    tax_id TEXT,
    short_description TEXT,
    social_links JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Institute Users (RBAC)
CREATE TABLE institute_users (
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- owner, admin, finance_admin, academic_admin, faculty
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (institute_id, user_id)
);

-- 4. Institute Banking
CREATE TABLE institute_banking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    bank_account_name TEXT NOT NULL,
    bank_account_number TEXT NOT NULL,
    bank_ifsc TEXT NOT NULL,
    billing_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Institute Contacts
CREATE TABLE institute_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    designation TEXT,
    phone TEXT,
    email TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Institute Campuses
CREATE TABLE institute_campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Main Campus"
    address TEXT,
    campus_type TEXT,
    operating_hours TEXT,
    facilities JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Institute Academics (Centralized Academic Info)
CREATE TABLE institute_academics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE UNIQUE,
    courses_offered JSONB,
    education_levels JSONB,
    student_count INT,
    faculty_count INT,
    accreditation_docs JSONB,
    certifications JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

