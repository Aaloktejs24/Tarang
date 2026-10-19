ALTER TABLE user_academic_records ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;
