ALTER TABLE admission_stages
DROP COLUMN IF EXISTS payment_amount,
DROP COLUMN IF EXISTS payment_currency,
DROP COLUMN IF EXISTS quiz_attachments;
