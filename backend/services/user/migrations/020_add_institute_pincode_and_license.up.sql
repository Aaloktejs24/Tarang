ALTER TABLE institutes ADD COLUMN IF NOT EXISTS license_certificate_url TEXT;
ALTER TABLE institute_campuses ADD COLUMN IF NOT EXISTS pincode TEXT;
