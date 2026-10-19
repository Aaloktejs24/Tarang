ALTER TABLE users RENAME COLUMN institution_name TO primary_name;
ALTER TABLE users ADD COLUMN secondary_name TEXT;
