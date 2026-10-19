ALTER TABLE admin_webauthn_credentials 
ADD COLUMN backup_eligible BOOLEAN DEFAULT false,
ADD COLUMN backup_state BOOLEAN DEFAULT false;
