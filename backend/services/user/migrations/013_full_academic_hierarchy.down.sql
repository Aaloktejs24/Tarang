ALTER TABLE institute_users DROP COLUMN department_id;
ALTER TABLE institute_users DROP COLUMN college_id;
ALTER TABLE institute_users DROP COLUMN campus_id;
ALTER TABLE institute_academics DROP COLUMN campus_id;
ALTER TABLE institute_academics ADD COLUMN institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE UNIQUE;
DROP TABLE IF EXISTS institute_departments;
DROP TABLE IF EXISTS institute_colleges;
