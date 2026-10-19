
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';

CREATE TYPE public.token_kind AS ENUM (
    'verify_email',
    'reset_password',
    'otp',
    'refresh'
);

ALTER TYPE public.token_kind OWNER TO tarang;

CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username public.citext NOT NULL,
    email public.citext NOT NULL,
    phone character varying(20),
    password_hash text NOT NULL,
    email_verified_at timestamp with time zone,
    phone_verified_at timestamp with time zone,
    disabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.accounts OWNER TO tarang;

CREATE TABLE public.admin_tokens (
    id integer NOT NULL,
    token character varying(7) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp with time zone NOT NULL,
    role character varying(20) DEFAULT 'admin'::character varying NOT NULL
);

ALTER TABLE public.admin_tokens OWNER TO tarang;

CREATE SEQUENCE public.admin_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.admin_tokens_id_seq OWNER TO tarang;

ALTER SEQUENCE public.admin_tokens_id_seq OWNED BY public.admin_tokens.id;

CREATE TABLE public.admin_webauthn_credentials (
    id integer NOT NULL,
    role character varying(50) NOT NULL,
    identifier character varying(255) NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type character varying(255) NOT NULL,
    sign_count bigint DEFAULT 0 NOT NULL,
    aaguid bytea,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    backup_eligible boolean DEFAULT false,
    backup_state boolean DEFAULT false
);

ALTER TABLE public.admin_webauthn_credentials OWNER TO tarang;

CREATE SEQUENCE public.admin_webauthn_credentials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.admin_webauthn_credentials_id_seq OWNER TO tarang;

ALTER SEQUENCE public.admin_webauthn_credentials_id_seq OWNED BY public.admin_webauthn_credentials.id;

CREATE TABLE public.auth_audits (
    id bigint NOT NULL,
    user_id uuid,
    event text NOT NULL,
    ip inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    details jsonb
);

ALTER TABLE public.auth_audits OWNER TO tarang;

CREATE SEQUENCE public.auth_audits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.auth_audits_id_seq OWNER TO tarang;

ALTER SEQUENCE public.auth_audits_id_seq OWNED BY public.auth_audits.id;

CREATE TABLE public.auth_login_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    requires_totp boolean DEFAULT false NOT NULL,
    requires_otp boolean DEFAULT false NOT NULL,
    requires_setup boolean DEFAULT false NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.auth_login_sessions OWNER TO tarang;

CREATE TABLE public.registration_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email public.citext NOT NULL,
    phone character varying(20),
    otp_hash text,
    email_verified boolean DEFAULT false NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.registration_sessions OWNER TO tarang;

CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    dirty boolean NOT NULL
);

ALTER TABLE public.schema_migrations OWNER TO tarang;

CREATE TABLE public.user_recovery_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    code_hash bytea NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.user_recovery_codes OWNER TO tarang;

CREATE TABLE public.user_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    kind public.token_kind NOT NULL,
    token_hash bytea NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    consumed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.user_tokens OWNER TO tarang;

ALTER TABLE ONLY public.admin_tokens ALTER COLUMN id SET DEFAULT nextval('public.admin_tokens_id_seq'::regclass);

ALTER TABLE ONLY public.admin_webauthn_credentials ALTER COLUMN id SET DEFAULT nextval('public.admin_webauthn_credentials_id_seq'::regclass);

ALTER TABLE ONLY public.auth_audits ALTER COLUMN id SET DEFAULT nextval('public.auth_audits_id_seq'::regclass);

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key UNIQUE (email);

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_phone_key UNIQUE (phone);

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_username_key UNIQUE (username);

ALTER TABLE ONLY public.admin_tokens
    ADD CONSTRAINT admin_tokens_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.admin_tokens
    ADD CONSTRAINT admin_tokens_token_key UNIQUE (token);

ALTER TABLE ONLY public.admin_webauthn_credentials
    ADD CONSTRAINT admin_webauthn_credentials_credential_id_key UNIQUE (credential_id);

ALTER TABLE ONLY public.admin_webauthn_credentials
    ADD CONSTRAINT admin_webauthn_credentials_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.auth_audits
    ADD CONSTRAINT auth_audits_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.auth_login_sessions
    ADD CONSTRAINT auth_login_sessions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.registration_sessions
    ADD CONSTRAINT registration_sessions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);

ALTER TABLE ONLY public.user_recovery_codes
    ADD CONSTRAINT user_recovery_codes_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT user_tokens_pkey PRIMARY KEY (id);

CREATE INDEX idx_admin_tokens_token ON public.admin_tokens USING btree (token);

CREATE INDEX idx_admin_webauthn_role_identifier ON public.admin_webauthn_credentials USING btree (role, identifier);

CREATE INDEX idx_auth_login_sessions_expires_at ON public.auth_login_sessions USING btree (expires_at);

ALTER TABLE ONLY public.auth_login_sessions
    ADD CONSTRAINT auth_login_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.accounts(id) ON DELETE CASCADE;

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';

CREATE TABLE public.institute_profiles (
    user_id uuid NOT NULL,
    institute_type text,
    established_year integer,
    registration_number text,
    primary_contact_name text,
    primary_contact_designation text,
    official_phone text,
    official_email text,
    website_url text,
    alternate_contact text,
    courses_offered jsonb,
    education_levels jsonb,
    student_count integer,
    faculty_count integer,
    campus_type text,
    operating_hours text,
    accreditation_docs jsonb,
    license_certificate_url text,
    tax_id text,
    certifications jsonb,
    bank_account_name text,
    bank_account_number text,
    bank_ifsc text,
    billing_address text,
    short_description text,
    facilities jsonb,
    social_links jsonb,
    terms_accepted_at timestamp with time zone,
    privacy_accepted_at timestamp with time zone,
    authorized_signatory_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.institute_profiles OWNER TO tarang;

CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    dirty boolean NOT NULL
);

ALTER TABLE public.schema_migrations OWNER TO tarang;

CREATE TABLE public.user_passwords (
    user_id uuid NOT NULL,
    hash text NOT NULL,
    algo text NOT NULL,
    params_json jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.user_passwords OWNER TO tarang;

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username public.citext NOT NULL,
    email public.citext NOT NULL,
    phone text,
    role text DEFAULT 'user'::text NOT NULL,
    email_verified_at timestamp with time zone,
    phone_verified_at timestamp with time zone,
    totp_secret text,
    disabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    kyc_verified_at timestamp with time zone,
    aadhaar_hash text,
    full_name text,
    dob text,
    gender text,
    kyc_reference_id character varying(100),
    mfa_preference character varying(20) DEFAULT 'none'::character varying,
    phone_hash text,
    profile_pic_url text,
    banner_url text,
    bio text,
    social_links jsonb DEFAULT '{}'::jsonb,
    skills text[] DEFAULT '{}'::text[],
    recognitions text[] DEFAULT '{}'::text[],
    institution_name text,
    location text,
    languages text[],
    demographic text
);

ALTER TABLE public.users OWNER TO tarang;

ALTER TABLE ONLY public.institute_profiles
    ADD CONSTRAINT institute_profiles_pkey PRIMARY KEY (user_id);

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);

ALTER TABLE ONLY public.user_passwords
    ADD CONSTRAINT user_passwords_pkey PRIMARY KEY (user_id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_aadhaar_hash_key UNIQUE (aadhaar_hash);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);

CREATE INDEX idx_users_phone_hash ON public.users USING btree (phone_hash);

ALTER TABLE ONLY public.institute_profiles
    ADD CONSTRAINT institute_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';

CREATE TABLE public.admission_applications (
    id character varying(255) NOT NULL,
    user_id character varying(255) NOT NULL,
    institute_id character varying(255) NOT NULL,
    program_id character varying(255) NOT NULL,
    current_stage_index integer DEFAULT 0,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.admission_applications OWNER TO tarang;

CREATE TABLE public.admission_program_drafts (
    id character varying(255) NOT NULL,
    institute_id character varying(255) NOT NULL,
    program_id character varying(255),
    draft_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.admission_program_drafts OWNER TO tarang;

CREATE TABLE public.admission_programs (
    id character varying(255) NOT NULL,
    institute_id character varying(255) NOT NULL,
    workflow_title character varying(255) NOT NULL,
    workflow_desc text NOT NULL,
    image_url character varying(255),
    last_date character varying(255),
    seats integer,
    academic_year character varying(255),
    eligibility character varying(255),
    fees character varying(255),
    duration character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    publish_date character varying(255)
);

ALTER TABLE public.admission_programs OWNER TO tarang;

CREATE TABLE public.admission_stages (
    id integer NOT NULL,
    program_id character varying(255) NOT NULL,
    stage_order integer NOT NULL,
    title character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    requirements jsonb,
    quiz_attachment_name character varying(255),
    quiz_attachment_size character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    start_date character varying(50),
    end_date character varying(50),
    start_date_only character varying(20),
    start_time_only character varying(10),
    end_date_only character varying(20),
    end_time_only character varying(10),
    interview_meeting_link character varying(255),
    interview_passcode character varying(100),
    payment_amount numeric(10,2),
    payment_currency character varying(10),
    quiz_attachments jsonb,
    selected_fields jsonb DEFAULT '[]'::jsonb,
    academic_records_config jsonb DEFAULT '[]'::jsonb
);

ALTER TABLE public.admission_stages OWNER TO tarang;

CREATE SEQUENCE public.admission_stages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.admission_stages_id_seq OWNER TO tarang;

ALTER SEQUENCE public.admission_stages_id_seq OWNED BY public.admission_stages.id;

CREATE TABLE public.admission_transactions (
    id character varying(255) NOT NULL,
    application_id character varying(255) NOT NULL,
    actor_id character varying(255) NOT NULL,
    action_type character varying(100) NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.admission_transactions OWNER TO tarang;

CREATE SEQUENCE public.application_number_seq
    START WITH 10000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.application_number_seq OWNER TO tarang;

CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    dirty boolean NOT NULL
);

ALTER TABLE public.schema_migrations OWNER TO tarang;

ALTER TABLE ONLY public.admission_stages ALTER COLUMN id SET DEFAULT nextval('public.admission_stages_id_seq'::regclass);

ALTER TABLE ONLY public.admission_applications
    ADD CONSTRAINT admission_applications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.admission_program_drafts
    ADD CONSTRAINT admission_program_drafts_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.admission_programs
    ADD CONSTRAINT admission_programs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.admission_stages
    ADD CONSTRAINT admission_stages_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.admission_transactions
    ADD CONSTRAINT admission_transactions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);

CREATE UNIQUE INDEX idx_unique_active_application ON public.admission_applications USING btree (user_id, program_id) WHERE ((status)::text <> ALL ((ARRAY['withdrawn'::character varying, 'rejected'::character varying])::text[]));

ALTER TABLE ONLY public.admission_applications
    ADD CONSTRAINT admission_applications_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.admission_programs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.admission_stages
    ADD CONSTRAINT admission_stages_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.admission_programs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.admission_transactions
    ADD CONSTRAINT admission_transactions_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.admission_applications(id) ON DELETE CASCADE;


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS streaming_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    raw_minio_key VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    dash_manifest_url TEXT,
    hls_manifest_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_streaming_jobs_user_id ON streaming_jobs(user_id);
CREATE INDEX idx_streaming_jobs_status ON streaming_jobs(status);


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS document_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    extension VARCHAR(10) NOT NULL,
    requires_conversion BOOLEAN NOT NULL DEFAULT FALSE,
    raw_minio_key VARCHAR(255) NOT NULL,
    processed_minio_key VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_document_jobs_user_id ON document_jobs(user_id);
CREATE INDEX idx_document_jobs_status ON document_jobs(status);
