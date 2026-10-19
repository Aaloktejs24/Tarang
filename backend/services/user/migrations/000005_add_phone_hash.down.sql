DROP INDEX IF EXISTS idx_users_phone_hash;
ALTER TABLE users DROP COLUMN IF EXISTS phone_hash;
