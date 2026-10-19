ALTER TABLE institutes
ADD CONSTRAINT chk_established_year CHECK (established_year IS NULL OR (established_year > 1800 AND established_year <= extract(year from current_date)));

ALTER TABLE institute_academics
ADD CONSTRAINT chk_student_count CHECK (student_count IS NULL OR student_count >= 0),
ADD CONSTRAINT chk_faculty_count CHECK (faculty_count IS NULL OR faculty_count >= 0);
