ALTER TABLE admission_stages ADD COLUMN selected_fields JSONB DEFAULT '[]'::jsonb;
ALTER TABLE admission_stages ADD COLUMN academic_records_config JSONB DEFAULT '[]'::jsonb;
