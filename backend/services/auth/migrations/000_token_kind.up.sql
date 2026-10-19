CREATE TYPE token_kind AS ENUM (
  'verify_email',
  'reset_password',
  'otp',
  'refresh'
);