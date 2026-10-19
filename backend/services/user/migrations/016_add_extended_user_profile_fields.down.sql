DROP TABLE IF EXISTS user_work_experiences;
DROP TABLE IF EXISTS user_academic_records;
DROP TABLE IF EXISTS user_addresses;

ALTER TABLE users DROP COLUMN IF EXISTS religion;
ALTER TABLE users DROP COLUMN IF EXISTS caste;
ALTER TABLE users DROP COLUMN IF EXISTS subcaste;
ALTER TABLE users DROP COLUMN IF EXISTS nationality;
