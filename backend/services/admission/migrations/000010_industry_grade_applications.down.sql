DROP INDEX IF EXISTS idx_unique_active_application;

ALTER TABLE admission_applications ADD CONSTRAINT admission_applications_user_id_program_id_key UNIQUE (user_id, program_id);

DROP SEQUENCE IF EXISTS application_number_seq;
