--
-- PostgreSQL database dump
--

\restrict FA4IovDomZnbXFiebJlfCCGPaLxN3Ybj1zfOQzdoPKnIXyg4oK5x4ejFK5r7qnV

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: token_kind; Type: TYPE; Schema: public; Owner: tarang
--

CREATE TYPE public.token_kind AS ENUM (
    'verify_email',
    'reset_password',
    'otp',
    'refresh'
);


ALTER TYPE public.token_kind OWNER TO tarang;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: tarang
--

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

--
-- Name: admin_tokens; Type: TABLE; Schema: public; Owner: tarang
--

CREATE TABLE public.admin_tokens (
    id integer NOT NULL,
    token character varying(7) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp with time zone NOT NULL,
    role character varying(20) DEFAULT 'admin'::character varying NOT NULL
);


ALTER TABLE public.admin_tokens OWNER TO tarang;

--
-- Name: admin_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: tarang
--

CREATE SEQUENCE public.admin_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admin_tokens_id_seq OWNER TO tarang;

--
-- Name: admin_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tarang
--

ALTER SEQUENCE public.admin_tokens_id_seq OWNED BY public.admin_tokens.id;


--
-- Name: admin_webauthn_credentials; Type: TABLE; Schema: public; Owner: tarang
--

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

--
-- Name: admin_webauthn_credentials_id_seq; Type: SEQUENCE; Schema: public; Owner: tarang
--

CREATE SEQUENCE public.admin_webauthn_credentials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admin_webauthn_credentials_id_seq OWNER TO tarang;

--
-- Name: admin_webauthn_credentials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tarang
--

ALTER SEQUENCE public.admin_webauthn_credentials_id_seq OWNED BY public.admin_webauthn_credentials.id;


--
-- Name: auth_audits; Type: TABLE; Schema: public; Owner: tarang
--

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

--
-- Name: auth_audits_id_seq; Type: SEQUENCE; Schema: public; Owner: tarang
--

CREATE SEQUENCE public.auth_audits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_audits_id_seq OWNER TO tarang;

--
-- Name: auth_audits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tarang
--

ALTER SEQUENCE public.auth_audits_id_seq OWNED BY public.auth_audits.id;


--
-- Name: auth_login_sessions; Type: TABLE; Schema: public; Owner: tarang
--

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

--
-- Name: registration_sessions; Type: TABLE; Schema: public; Owner: tarang
--

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

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: tarang
--

CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    dirty boolean NOT NULL
);


ALTER TABLE public.schema_migrations OWNER TO tarang;

--
-- Name: user_recovery_codes; Type: TABLE; Schema: public; Owner: tarang
--

CREATE TABLE public.user_recovery_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    code_hash bytea NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_recovery_codes OWNER TO tarang;

--
-- Name: user_tokens; Type: TABLE; Schema: public; Owner: tarang
--

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

--
-- Name: admin_tokens id; Type: DEFAULT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admin_tokens ALTER COLUMN id SET DEFAULT nextval('public.admin_tokens_id_seq'::regclass);


--
-- Name: admin_webauthn_credentials id; Type: DEFAULT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admin_webauthn_credentials ALTER COLUMN id SET DEFAULT nextval('public.admin_webauthn_credentials_id_seq'::regclass);


--
-- Name: auth_audits id; Type: DEFAULT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.auth_audits ALTER COLUMN id SET DEFAULT nextval('public.auth_audits_id_seq'::regclass);


--
-- Name: accounts accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key UNIQUE (email);


--
-- Name: accounts accounts_phone_key; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_phone_key UNIQUE (phone);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_username_key; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_username_key UNIQUE (username);


--
-- Name: admin_tokens admin_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admin_tokens
    ADD CONSTRAINT admin_tokens_pkey PRIMARY KEY (id);


--
-- Name: admin_tokens admin_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admin_tokens
    ADD CONSTRAINT admin_tokens_token_key UNIQUE (token);


--
-- Name: admin_webauthn_credentials admin_webauthn_credentials_credential_id_key; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admin_webauthn_credentials
    ADD CONSTRAINT admin_webauthn_credentials_credential_id_key UNIQUE (credential_id);


--
-- Name: admin_webauthn_credentials admin_webauthn_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admin_webauthn_credentials
    ADD CONSTRAINT admin_webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: auth_audits auth_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.auth_audits
    ADD CONSTRAINT auth_audits_pkey PRIMARY KEY (id);


--
-- Name: auth_login_sessions auth_login_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.auth_login_sessions
    ADD CONSTRAINT auth_login_sessions_pkey PRIMARY KEY (id);


--
-- Name: registration_sessions registration_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.registration_sessions
    ADD CONSTRAINT registration_sessions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: user_recovery_codes user_recovery_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.user_recovery_codes
    ADD CONSTRAINT user_recovery_codes_pkey PRIMARY KEY (id);


--
-- Name: user_tokens user_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT user_tokens_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_tokens_token; Type: INDEX; Schema: public; Owner: tarang
--

CREATE INDEX idx_admin_tokens_token ON public.admin_tokens USING btree (token);


--
-- Name: idx_admin_webauthn_role_identifier; Type: INDEX; Schema: public; Owner: tarang
--

CREATE INDEX idx_admin_webauthn_role_identifier ON public.admin_webauthn_credentials USING btree (role, identifier);


--
-- Name: idx_auth_login_sessions_expires_at; Type: INDEX; Schema: public; Owner: tarang
--

CREATE INDEX idx_auth_login_sessions_expires_at ON public.auth_login_sessions USING btree (expires_at);


--
-- Name: auth_login_sessions auth_login_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.auth_login_sessions
    ADD CONSTRAINT auth_login_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict FA4IovDomZnbXFiebJlfCCGPaLxN3Ybj1zfOQzdoPKnIXyg4oK5x4ejFK5r7qnV

