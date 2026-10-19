--
-- PostgreSQL database dump
--

\restrict LkfTqo80MNGR2e89hmmJaeCUgV9P9QY7qwp2eYRRU57hN3FsFNb9fHwy6bIuWdV

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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: institute_profiles; Type: TABLE; Schema: public; Owner: tarang
--

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

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: tarang
--

CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    dirty boolean NOT NULL
);


ALTER TABLE public.schema_migrations OWNER TO tarang;

--
-- Name: user_passwords; Type: TABLE; Schema: public; Owner: tarang
--

CREATE TABLE public.user_passwords (
    user_id uuid NOT NULL,
    hash text NOT NULL,
    algo text NOT NULL,
    params_json jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_passwords OWNER TO tarang;

--
-- Name: users; Type: TABLE; Schema: public; Owner: tarang
--

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

--
-- Name: institute_profiles institute_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.institute_profiles
    ADD CONSTRAINT institute_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: user_passwords user_passwords_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.user_passwords
    ADD CONSTRAINT user_passwords_pkey PRIMARY KEY (user_id);


--
-- Name: users users_aadhaar_hash_key; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_aadhaar_hash_key UNIQUE (aadhaar_hash);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_users_phone_hash; Type: INDEX; Schema: public; Owner: tarang
--

CREATE INDEX idx_users_phone_hash ON public.users USING btree (phone_hash);


--
-- Name: institute_profiles institute_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.institute_profiles
    ADD CONSTRAINT institute_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict LkfTqo80MNGR2e89hmmJaeCUgV9P9QY7qwp2eYRRU57hN3FsFNb9fHwy6bIuWdV

