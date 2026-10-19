CREATE SEQUENCE IF NOT EXISTS application_number_seq START 10000;

ALTER TABLE admission_applications DROP CONSTRAINT IF EXISTS admission_applications_user_id_program_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_application 
ON admission_applications (user_id, program_id) 
WHERE status NOT IN ('withdrawn', 'rejected');
