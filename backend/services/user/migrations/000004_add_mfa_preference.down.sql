BEGIN;

ALTER TABLE users ADD COLUMN totp_enabled BOOLEAN DEFAULT false;

UPDATE users
SET totp_enabled = true
WHERE mfa_preference = 'totp';

ALTER TABLE users DROP COLUMN mfa_preference;

COMMIT;
