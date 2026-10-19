-- 1. Create Colleges Level
CREATE TABLE institute_colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES institute_campuses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    established_year INT,
    accreditation_docs JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Departments Level
CREATE TABLE institute_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID REFERENCES institute_colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    head_of_department TEXT,
    faculty_count INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Modify Academics to link to Campus instead of Institute
-- Since we just created institute_academics in 012, we can drop and recreate or alter
ALTER TABLE institute_academics DROP COLUMN institute_id;
ALTER TABLE institute_academics ADD COLUMN campus_id UUID REFERENCES institute_campuses(id) ON DELETE CASCADE UNIQUE;

-- 4. Modify RBAC (institute_users) to support granular levels
ALTER TABLE institute_users ADD COLUMN campus_id UUID REFERENCES institute_campuses(id) ON DELETE CASCADE;
ALTER TABLE institute_users ADD COLUMN college_id UUID REFERENCES institute_colleges(id) ON DELETE CASCADE;
ALTER TABLE institute_users ADD COLUMN department_id UUID REFERENCES institute_departments(id) ON DELETE CASCADE;
-- If campus_id, college_id, and department_id are all NULL, the user has an Institute-wide role.
-- If campus_id is NOT NULL, they have a role for that specific campus, etc.
