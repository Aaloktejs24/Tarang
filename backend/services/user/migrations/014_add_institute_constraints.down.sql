ALTER TABLE institutes
DROP CONSTRAINT IF EXISTS chk_established_year;

ALTER TABLE institute_academics
DROP CONSTRAINT IF EXISTS chk_student_count,
DROP CONSTRAINT IF EXISTS chk_faculty_count;
