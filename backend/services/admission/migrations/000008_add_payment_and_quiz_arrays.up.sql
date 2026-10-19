ALTER TABLE admission_stages
ADD COLUMN payment_amount DECIMAL(10,2),
ADD COLUMN payment_currency VARCHAR(10),
ADD COLUMN quiz_attachments JSONB;
