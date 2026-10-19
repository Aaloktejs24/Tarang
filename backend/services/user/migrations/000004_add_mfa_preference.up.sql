BEGIN;

ALTER TABLE users ADD COLUMN mfa_preference VARCHAR(20) DEFAULT 'none';

UPDATE users
SET mfa_preference = 'totp'
WHERE totp_enabled = true;

ALTER TABLE users DROP COLUMN totp_enabled;

COMMIT;
