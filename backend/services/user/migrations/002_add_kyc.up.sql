ALTER TABLE users 
ADD COLUMN kyc_verified_at TIMESTAMPTZ,
ADD COLUMN aadhaar_hash VARCHAR(64) UNIQUE,
ADD COLUMN full_name VARCHAR(100),
ADD COLUMN dob DATE,
ADD COLUMN gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
