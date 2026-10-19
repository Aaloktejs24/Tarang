ALTER TABLE users DROP COLUMN IF EXISTS secondary_name;
ALTER TABLE users RENAME COLUMN primary_name TO institution_name;
