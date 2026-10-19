ALTER TABLE admission_stages
  DROP COLUMN IF EXISTS start_date,
  DROP COLUMN IF EXISTS end_date,
  DROP COLUMN IF EXISTS start_date_only,
  DROP COLUMN IF EXISTS start_time_only,
  DROP COLUMN IF EXISTS end_date_only,
  DROP COLUMN IF EXISTS end_time_only;
