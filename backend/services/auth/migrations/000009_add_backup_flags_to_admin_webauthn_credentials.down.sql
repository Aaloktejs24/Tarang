ALTER TABLE admin_webauthn_credentials 
DROP COLUMN IF EXISTS backup_eligible,
DROP COLUMN IF EXISTS backup_state;
