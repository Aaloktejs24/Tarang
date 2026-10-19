ALTER TABLE users ADD COLUMN phone_hash TEXT;
CREATE INDEX idx_users_phone_hash ON users(phone_hash);
