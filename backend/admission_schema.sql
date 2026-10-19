--
-- PostgreSQL database dump
--

\restrict 3iaSTXHxbJ8khbUR0fTYoqX9EyPh145HopC7fs6qBbeGc4s3KukfzjaNO6YGcvG

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
-- Name: admission_applications; Type: TABLE; Schema: public; Owner: tarang
--

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

--
-- Name: admission_program_drafts; Type: TABLE; Schema: public; Owner: tarang
--

CREATE TABLE public.admission_program_drafts (
    id character varying(255) NOT NULL,
    institute_id character varying(255) NOT NULL,
    program_id character varying(255),
    draft_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admission_program_drafts OWNER TO tarang;

--
-- Name: admission_programs; Type: TABLE; Schema: public; Owner: tarang
--

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

--
-- Name: admission_stages; Type: TABLE; Schema: public; Owner: tarang
--

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

--
-- Name: admission_stages_id_seq; Type: SEQUENCE; Schema: public; Owner: tarang
--

CREATE SEQUENCE public.admission_stages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admission_stages_id_seq OWNER TO tarang;

--
-- Name: admission_stages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tarang
--

ALTER SEQUENCE public.admission_stages_id_seq OWNED BY public.admission_stages.id;


--
-- Name: admission_transactions; Type: TABLE; Schema: public; Owner: tarang
--

CREATE TABLE public.admission_transactions (
    id character varying(255) NOT NULL,
    application_id character varying(255) NOT NULL,
    actor_id character varying(255) NOT NULL,
    action_type character varying(100) NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admission_transactions OWNER TO tarang;

--
-- Name: application_number_seq; Type: SEQUENCE; Schema: public; Owner: tarang
--

CREATE SEQUENCE public.application_number_seq
    START WITH 10000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.application_number_seq OWNER TO tarang;

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: tarang
--

CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    dirty boolean NOT NULL
);


ALTER TABLE public.schema_migrations OWNER TO tarang;

--
-- Name: admission_stages id; Type: DEFAULT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admission_stages ALTER COLUMN id SET DEFAULT nextval('public.admission_stages_id_seq'::regclass);


--
-- Name: admission_applications admission_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admission_applications
    ADD CONSTRAINT admission_applications_pkey PRIMARY KEY (id);


--
-- Name: admission_program_drafts admission_program_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admission_program_drafts
    ADD CONSTRAINT admission_program_drafts_pkey PRIMARY KEY (id);


--
-- Name: admission_programs admission_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admission_programs
    ADD CONSTRAINT admission_programs_pkey PRIMARY KEY (id);


--
-- Name: admission_stages admission_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admission_stages
    ADD CONSTRAINT admission_stages_pkey PRIMARY KEY (id);


--
-- Name: admission_transactions admission_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admission_transactions
    ADD CONSTRAINT admission_transactions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: idx_unique_active_application; Type: INDEX; Schema: public; Owner: tarang
--

CREATE UNIQUE INDEX idx_unique_active_application ON public.admission_applications USING btree (user_id, program_id) WHERE ((status)::text <> ALL ((ARRAY['withdrawn'::character varying, 'rejected'::character varying])::text[]));


--
-- Name: admission_applications admission_applications_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admission_applications
    ADD CONSTRAINT admission_applications_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.admission_programs(id) ON DELETE CASCADE;


--
-- Name: admission_stages admission_stages_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admission_stages
    ADD CONSTRAINT admission_stages_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.admission_programs(id) ON DELETE CASCADE;


--
-- Name: admission_transactions admission_transactions_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tarang
--

ALTER TABLE ONLY public.admission_transactions
    ADD CONSTRAINT admission_transactions_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.admission_applications(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 3iaSTXHxbJ8khbUR0fTYoqX9EyPh145HopC7fs6qBbeGc4s3KukfzjaNO6YGcvG

