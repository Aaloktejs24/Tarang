ALTER TABLE accounts ADD COLUMN totp_secret TEXT;
ALTER TABLE accounts ADD COLUMN mfa_preference VARCHAR(20) NOT NULL DEFAULT 'none';
