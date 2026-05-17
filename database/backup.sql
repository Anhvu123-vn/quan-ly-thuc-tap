--
-- PostgreSQL database dump
--

\restrict tNyghFZ1V7yuwxzVvGeBacdFIL4UVbFH14aJkDDJWJqSnZcELRL2KM0LrqC0rLw

-- Dumped from database version 18.3 (Postgres.app)
-- Dumped by pg_dump version 18.3 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ApplicationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ApplicationStatus" AS ENUM (
    'applied',
    'screening',
    'interview',
    'department_approved',
    'rejected',
    'withdrawn'
);


ALTER TYPE public."ApplicationStatus" OWNER TO postgres;

--
-- Name: ApprovalLevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ApprovalLevel" AS ENUM (
    'department',
    'lecturer',
    'registrar'
);


ALTER TYPE public."ApprovalLevel" OWNER TO postgres;

--
-- Name: ApprovalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ApprovalStatus" AS ENUM (
    'pending',
    'in_progress',
    'approved',
    'rejected'
);


ALTER TYPE public."ApprovalStatus" OWNER TO postgres;

--
-- Name: EvaluationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EvaluationType" AS ENUM (
    'midterm',
    'final',
    'company'
);


ALTER TYPE public."EvaluationType" OWNER TO postgres;

--
-- Name: JobStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."JobStatus" AS ENUM (
    'draft',
    'active',
    'closed',
    'paused',
    'filled'
);


ALTER TYPE public."JobStatus" OWNER TO postgres;

--
-- Name: LogStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LogStatus" AS ENUM (
    'pending',
    'reviewed',
    'approved'
);


ALTER TYPE public."LogStatus" OWNER TO postgres;

--
-- Name: LogType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LogType" AS ENUM (
    'email',
    'notification',
    'system'
);


ALTER TYPE public."LogType" OWNER TO postgres;

--
-- Name: PositionDuration; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PositionDuration" AS ENUM (
    'one_month',
    'two_three_months',
    'four_six_months',
    'six_plus_months'
);


ALTER TYPE public."PositionDuration" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'student',
    'lecturer',
    'company',
    'admin'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: WorkType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WorkType" AS ENUM (
    'remote',
    'hybrid',
    'onsite'
);


ALTER TYPE public."WorkType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id text NOT NULL,
    position_id text NOT NULL,
    student_id text NOT NULL,
    cover_letter text,
    resume_url text,
    portfolio_url text,
    status public."ApplicationStatus" DEFAULT 'applied'::public."ApplicationStatus" NOT NULL,
    applied_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- Name: approval_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.approval_items (
    id text NOT NULL,
    application_id text,
    student_id text,
    company_id text NOT NULL,
    position_id text,
    level public."ApprovalLevel" NOT NULL,
    status public."ApprovalStatus" DEFAULT 'pending'::public."ApprovalStatus" NOT NULL,
    reviewer_id text,
    comments text,
    reviewed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.approval_items OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id text NOT NULL,
    user_id text NOT NULL,
    application_id text,
    document_type text NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    mime_type text,
    uploaded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: evaluations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluations (
    id text NOT NULL,
    student_id text NOT NULL,
    evaluator_id text NOT NULL,
    application_id text,
    evaluation_type public."EvaluationType" NOT NULL,
    technical_score integer NOT NULL,
    attitude_score integer NOT NULL,
    communication_score integer NOT NULL,
    teamwork_score integer NOT NULL,
    overall_score numeric(3,2) NOT NULL,
    comments text,
    strengths text[],
    areas_for_improvement text[],
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.evaluations OWNER TO postgres;

--
-- Name: log_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.log_entries (
    id text NOT NULL,
    student_id text NOT NULL,
    week_number integer NOT NULL,
    entry_date timestamp(3) without time zone NOT NULL,
    completed_work text NOT NULL,
    challenges text,
    lessons_learned text,
    goals_for_next_week text,
    lecturer_comment text,
    lecturer_rating integer,
    status public."LogStatus" DEFAULT 'pending'::public."LogStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.log_entries OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    user_id text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    link text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: positions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.positions (
    id text NOT NULL,
    title text NOT NULL,
    company_id text NOT NULL,
    location text,
    field text,
    description text,
    requirements text[],
    responsibilities text[],
    salary_min numeric(12,2),
    salary_max numeric(12,2),
    duration public."PositionDuration",
    work_type public."WorkType" DEFAULT 'onsite'::public."WorkType" NOT NULL,
    slots integer DEFAULT 1 NOT NULL,
    posted_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deadline timestamp(3) without time zone,
    status public."JobStatus" DEFAULT 'draft'::public."JobStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.positions OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    user_id text NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    revoked_at timestamp(3) without time zone
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_profiles (
    id text NOT NULL,
    user_id text NOT NULL,
    major text,
    gpa numeric(3,2),
    skills text[],
    projects jsonb,
    bio text,
    resume_url text,
    transcript_url text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.student_profiles OWNER TO postgres;

--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_logs (
    id text NOT NULL,
    log_type public."LogType" NOT NULL,
    recipient_id text,
    recipient_email text,
    subject text,
    message text,
    status text DEFAULT 'sent'::text NOT NULL,
    sent_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata jsonb,
    actor_id text,
    actor_name text,
    actor_role text
);


ALTER TABLE public.system_logs OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role public."UserRole" DEFAULT 'student'::public."UserRole" NOT NULL,
    avatar text,
    phone text,
    department text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, position_id, student_id, cover_letter, resume_url, portfolio_url, status, applied_at, updated_at) FROM stdin;
78203392-1346-42b5-a1ea-319976b47285	bbbc1d1f-09c4-4392-b160-69cb65f26c54	b70e6f45-fd81-4d09-ba88-ce31c0532f32	\N	\N	\N	department_approved	2026-05-14 07:12:42.444	2026-05-16 09:10:41.949
8c134670-eb6e-4112-baa1-ba7ec7398ccf	3926a36a-e1e4-4216-81e4-cbd9da57a816	b70e6f45-fd81-4d09-ba88-ce31c0532f32	\N	\N	\N	withdrawn	2026-05-16 09:29:43.501	2026-05-16 09:34:48.749
92025438-d3fa-453a-affc-449c1dabc705	bbbc1d1f-09c4-4392-b160-69cb65f26c54	931bc777-ecf2-4c01-b233-6cdf8fd7072f	\N	\N	\N	department_approved	2026-05-16 09:18:56.332	2026-05-16 10:43:41.783
53d4f8ab-c685-4ad0-8a0b-0c5400515df0	22c4e616-8de3-4443-aa61-14203979b0e7	b70e6f45-fd81-4d09-ba88-ce31c0532f32	\N	\N	\N	applied	2026-05-16 11:07:06.933	2026-05-16 11:07:06.933
ce3eed02-d19d-4424-bd12-cfc5b69f2630	22c4e616-8de3-4443-aa61-14203979b0e7	20d53eef-7afc-4ef9-b0f8-a217a3ebc40f	\N	\N	\N	applied	2026-05-16 11:09:56.17	2026-05-16 11:09:56.17
0a44b583-7848-437b-ae63-71467723a223	6e501f85-c854-4637-9d97-0e875ec49c5e	b70e6f45-fd81-4d09-ba88-ce31c0532f32	\N	\N	\N	screening	2026-05-17 10:27:36.633	2026-05-17 10:28:22.069
fd4c1a2f-0a8e-4a79-b88f-c744589e12bb	6e501f85-c854-4637-9d97-0e875ec49c5e	931bc777-ecf2-4c01-b233-6cdf8fd7072f	\N	\N	\N	department_approved	2026-05-17 10:50:36.659	2026-05-17 10:51:03.421
1b9ad357-4e22-4b89-8a74-962f51f3fe89	28260895-d401-4c87-8e00-3ae36112465c	931bc777-ecf2-4c01-b233-6cdf8fd7072f	\N	\N	\N	department_approved	2026-05-17 10:39:38.623	2026-05-17 10:54:35.581
1a401a64-1b4f-4f70-b591-47a766094b2e	e68efba3-0a47-426d-a0d3-fd346d172815	931bc777-ecf2-4c01-b233-6cdf8fd7072f	\N	\N	\N	department_approved	2026-05-17 10:55:50.802	2026-05-17 10:57:38.418
165d2fb6-cb77-47a0-b977-7736dcdf5ef8	534cbb97-1a7a-451d-9e25-16cb2591e76a	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	\N	\N	\N	department_approved	2026-05-17 11:06:31.434	2026-05-17 11:07:39.589
358453b5-7493-44db-a8ce-fe1907cb29fd	2c8e3c68-fcea-4e95-9a80-22a051ad24eb	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	\N	\N	\N	screening	2026-05-17 11:13:41.968	2026-05-17 11:14:33.254
1571bb21-6356-43fe-b0d0-3727a38032a0	93bd341a-96ac-4149-a152-f7989ef272be	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	\N	\N	\N	department_approved	2026-05-17 11:21:05.702	2026-05-17 11:22:12.529
\.


--
-- Data for Name: approval_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.approval_items (id, application_id, student_id, company_id, position_id, level, status, reviewer_id, comments, reviewed_at, created_at, updated_at) FROM stdin;
dfc53c79-874e-4684-b7e5-f0e6f0cd81ad	92025438-d3fa-453a-affc-449c1dabc705	931bc777-ecf2-4c01-b233-6cdf8fd7072f	d0bffae3-dc73-4597-a9b0-772765b789c1	bbbc1d1f-09c4-4392-b160-69cb65f26c54	department	approved	\N	\N	\N	2026-05-15 17:19:39.816	2026-05-15 17:19:39.816
87390e7c-3dc4-4cc0-a9e5-a11fc4c4e71e	8c134670-eb6e-4112-baa1-ba7ec7398ccf	b70e6f45-fd81-4d09-ba88-ce31c0532f32	d0bffae3-dc73-4597-a9b0-772765b789c1	3926a36a-e1e4-4216-81e4-cbd9da57a816	department	approved	ac1a8b3d-6bf8-4511-bc81-64f4514f764e	Test approval	2026-05-16 10:21:38.162	2026-05-14 17:19:39.816	2026-05-16 10:21:38.164
62049fe8-1b02-4b99-a060-6efb0737e318	\N	\N	bbc8d777-076b-4649-9d25-c23402004c2b	ebcc0b91-127d-407c-9616-4154d8120112	department	approved	4cebcfa1-055a-4f00-b33b-eb85fbda1db9	Approved	2026-05-17 09:23:28.589	2026-05-17 09:23:04.134	2026-05-17 09:23:28.59
76c661a4-b12e-4a00-abc1-394756bdb44a	\N	\N	d0bffae3-dc73-4597-a9b0-772765b789c1	6e501f85-c854-4637-9d97-0e875ec49c5e	department	approved	e1e773b8-ea93-4495-a2f5-a76db55088de	\N	2026-05-17 09:29:28.357	2026-05-17 09:29:19.183	2026-05-17 09:29:28.358
ffff0e04-7bb5-4c56-bbeb-53b71ca7e769	\N	\N	d0bffae3-dc73-4597-a9b0-772765b789c1	bb32bd10-44fc-47a7-8a60-af9fa597c0a7	department	approved	e1e773b8-ea93-4495-a2f5-a76db55088de	\N	2026-05-17 09:52:41.715	2026-05-17 09:52:17.719	2026-05-17 09:52:41.716
f274a8fe-9d7d-4e41-850b-22e1a14f53c1	\N	\N	d0bffae3-dc73-4597-a9b0-772765b789c1	8c11578a-935e-40ee-b3c4-6f1736288897	department	approved	e1e773b8-ea93-4495-a2f5-a76db55088de	\N	2026-05-17 10:05:22.962	2026-05-17 09:43:51.697	2026-05-17 10:05:22.962
6957f94c-a672-41c7-ad4a-f9ade3379425	\N	\N	d0bffae3-dc73-4597-a9b0-772765b789c1	d3dbcd50-4582-4eea-90f7-5b8106e5d40d	department	approved	e1e773b8-ea93-4495-a2f5-a76db55088de	\N	2026-05-17 10:07:25.62	2026-05-17 10:07:07.067	2026-05-17 10:07:25.621
6a9ce276-e550-41c7-a246-d3a4cdd91900	\N	\N	d0bffae3-dc73-4597-a9b0-772765b789c1	28260895-d401-4c87-8e00-3ae36112465c	department	approved	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f		2026-05-17 10:39:18.958	2026-05-17 10:13:20.315	2026-05-17 10:39:18.959
36b3ec27-dd31-466d-81a9-1662169eb05e	fd4c1a2f-0a8e-4a79-b88f-c744589e12bb	931bc777-ecf2-4c01-b233-6cdf8fd7072f	d0bffae3-dc73-4597-a9b0-772765b789c1	6e501f85-c854-4637-9d97-0e875ec49c5e	lecturer	approved	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f		2026-05-17 10:50:55.756	2026-05-17 10:50:36.67	2026-05-17 10:50:55.756
03926831-f19e-4690-b300-f0a52b7fd9aa	fd4c1a2f-0a8e-4a79-b88f-c744589e12bb	931bc777-ecf2-4c01-b233-6cdf8fd7072f	d0bffae3-dc73-4597-a9b0-772765b789c1	6e501f85-c854-4637-9d97-0e875ec49c5e	department	approved	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f		2026-05-17 10:51:03.423	2026-05-17 10:50:55.752	2026-05-17 10:51:03.424
6c5cb146-3890-4bbb-94a3-92e07f303b81	\N	\N	d0bffae3-dc73-4597-a9b0-772765b789c1	e68efba3-0a47-426d-a0d3-fd346d172815	department	approved	e1e773b8-ea93-4495-a2f5-a76db55088de	\N	2026-05-17 10:55:28.607	2026-05-17 10:55:10.331	2026-05-17 10:55:28.608
52da73ff-b02b-44d1-99c7-3398c77451d5	1a401a64-1b4f-4f70-b591-47a766094b2e	931bc777-ecf2-4c01-b233-6cdf8fd7072f	d0bffae3-dc73-4597-a9b0-772765b789c1	e68efba3-0a47-426d-a0d3-fd346d172815	lecturer	approved	e1e773b8-ea93-4495-a2f5-a76db55088de	\N	2026-05-17 10:56:24.208	2026-05-17 10:55:50.815	2026-05-17 10:56:24.209
4fc3e766-1462-44c0-911c-090094b9e14e	1a401a64-1b4f-4f70-b591-47a766094b2e	931bc777-ecf2-4c01-b233-6cdf8fd7072f	d0bffae3-dc73-4597-a9b0-772765b789c1	e68efba3-0a47-426d-a0d3-fd346d172815	department	approved	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f		2026-05-17 10:57:38.422	2026-05-17 10:56:24.198	2026-05-17 10:57:38.423
b9da9454-9a24-4efa-89ee-71484982b7e1	\N	\N	d0bffae3-dc73-4597-a9b0-772765b789c1	534cbb97-1a7a-451d-9e25-16cb2591e76a	department	approved	e1e773b8-ea93-4495-a2f5-a76db55088de	\N	2026-05-17 11:06:15.129	2026-05-17 11:05:34.685	2026-05-17 11:06:15.13
b95eae39-901f-41ee-9627-ce2720e75327	165d2fb6-cb77-47a0-b977-7736dcdf5ef8	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	d0bffae3-dc73-4597-a9b0-772765b789c1	534cbb97-1a7a-451d-9e25-16cb2591e76a	department	pending	\N	\N	\N	2026-05-17 11:07:15.766	2026-05-17 11:07:15.766
1d07383b-d010-4c70-b5e2-768a07db6735	165d2fb6-cb77-47a0-b977-7736dcdf5ef8	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	d0bffae3-dc73-4597-a9b0-772765b789c1	534cbb97-1a7a-451d-9e25-16cb2591e76a	lecturer	approved	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f		2026-05-17 11:07:15.771	2026-05-17 11:06:31.449	2026-05-17 11:07:15.772
da04fd82-2c40-422c-b4b0-eb40e9d068fc	\N	\N	d0bffae3-dc73-4597-a9b0-772765b789c1	2c8e3c68-fcea-4e95-9a80-22a051ad24eb	department	approved	e1e773b8-ea93-4495-a2f5-a76db55088de	\N	2026-05-17 11:13:17.679	2026-05-17 11:12:19.927	2026-05-17 11:13:17.68
1f32beea-a0b7-4e0f-bbd2-1c65329fc422	358453b5-7493-44db-a8ce-fe1907cb29fd	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	d0bffae3-dc73-4597-a9b0-772765b789c1	2c8e3c68-fcea-4e95-9a80-22a051ad24eb	department	pending	\N	\N	\N	2026-05-17 11:14:33.252	2026-05-17 11:14:33.252
55f0354f-4198-46d3-ba29-6e39d2f3ac66	358453b5-7493-44db-a8ce-fe1907cb29fd	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	d0bffae3-dc73-4597-a9b0-772765b789c1	2c8e3c68-fcea-4e95-9a80-22a051ad24eb	lecturer	approved	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f		2026-05-17 11:14:33.258	2026-05-17 11:13:41.981	2026-05-17 11:14:33.259
9e41f2ad-13ba-4834-b93d-c3f0858b401b	\N	\N	d0bffae3-dc73-4597-a9b0-772765b789c1	93bd341a-96ac-4149-a152-f7989ef272be	department	approved	e1e773b8-ea93-4495-a2f5-a76db55088de	\N	2026-05-17 11:20:43.344	2026-05-17 11:19:42.544	2026-05-17 11:20:43.344
9c342b82-b209-4539-8894-b1184a8929c2	1571bb21-6356-43fe-b0d0-3727a38032a0	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	d0bffae3-dc73-4597-a9b0-772765b789c1	93bd341a-96ac-4149-a152-f7989ef272be	department	pending	\N	\N	\N	2026-05-17 11:21:50.247	2026-05-17 11:21:50.247
3ad82167-194c-4130-9fd3-8289760f8cfb	1571bb21-6356-43fe-b0d0-3727a38032a0	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	d0bffae3-dc73-4597-a9b0-772765b789c1	93bd341a-96ac-4149-a152-f7989ef272be	lecturer	approved	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f		2026-05-17 11:21:50.256	2026-05-17 11:21:05.719	2026-05-17 11:21:50.256
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, user_id, application_id, document_type, file_name, file_url, file_size, mime_type, uploaded_at) FROM stdin;
\.


--
-- Data for Name: evaluations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evaluations (id, student_id, evaluator_id, application_id, evaluation_type, technical_score, attitude_score, communication_score, teamwork_score, overall_score, comments, strengths, areas_for_improvement, created_at, updated_at) FROM stdin;
33f4d3d6-ee9c-4e27-9178-27c4750ce703	b70e6f45-fd81-4d09-ba88-ce31c0532f32	d0bffae3-dc73-4597-a9b0-772765b789c1	\N	company	5	5	5	5	5.00	Làm việc tốt, có tinh thần trách nhiệm, học hỏi nhanh	{}	{}	2026-05-16 09:19:41.18	2026-05-16 09:19:41.18
dfc9d39c-236a-4f1a-a051-c89edddc82a4	931bc777-ecf2-4c01-b233-6cdf8fd7072f	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	92025438-d3fa-453a-affc-449c1dabc705	final	5	5	5	5	5.00	Hoàn thành tốt công việc	{}	{}	2026-05-16 10:56:38.138	2026-05-16 10:56:38.138
dad092dd-8973-42ad-ac91-b9e3699bd461	b70e6f45-fd81-4d09-ba88-ce31c0532f32	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	78203392-1346-42b5-a1ea-319976b47285	final	0	0	0	0	0.00	Hoàn thành tốt công việc	{}	{}	2026-05-16 10:56:53.005	2026-05-16 10:56:53.005
\.


--
-- Data for Name: log_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.log_entries (id, student_id, week_number, entry_date, completed_work, challenges, lessons_learned, goals_for_next_week, lecturer_comment, lecturer_rating, status, created_at, updated_at) FROM stdin;
aa5e4d69-6af3-48d3-9ddd-2faff437aaca	b70e6f45-fd81-4d09-ba88-ce31c0532f32	1	2026-05-16 09:28:51.788	a	a	a	a	\N	\N	approved	2026-05-16 09:28:51.794	2026-05-16 10:34:29.567
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, is_read, link, created_at) FROM stdin;
ecef97bf-06f5-4078-a7c7-472dca3d87a6	e1e773b8-ea93-4495-a2f5-a76db55088de	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "UI/UX Design Intern". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 09:52:17.725
9d28591c-4109-47c6-850b-ca21994abf30	e8a477be-5a2e-4555-9932-a6971b9ecfde	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "UI/UX Design Intern". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 09:52:17.725
4ca750ff-56db-4a89-a4c2-8fa26a751990	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "UI/UX Design Intern" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 09:52:41.714
a53ea74a-97c0-47f8-ae87-b1e36549d1d9	4cebcfa1-055a-4f00-b33b-eb85fbda1db9	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "UI/UX Design Intern". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 09:52:17.725
013ab32a-ac5c-40ce-be8e-fd2970159d64	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "Frontend Intern" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 10:05:22.955
1f652ee0-7f3e-4661-a93c-6f09337b718f	e8a477be-5a2e-4555-9932-a6971b9ecfde	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Data Engineer Intern". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 10:07:07.072
6188d833-9e36-4b89-887a-1f31bf02b776	4cebcfa1-055a-4f00-b33b-eb85fbda1db9	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Data Engineer Intern". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 10:07:07.072
021e12eb-d768-44ca-bf15-070aaef29aa2	e1e773b8-ea93-4495-a2f5-a76db55088de	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Data Engineer Intern". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 10:07:07.072
670ae420-ab98-4bb2-bb4b-06630f45d13a	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "Data Engineer Intern" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 10:07:25.614
238b16e9-7826-4088-8ef0-0cafa74b2228	e8a477be-5a2e-4555-9932-a6971b9ecfde	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Devops/Cloud Intern". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 10:13:20.318
aea20a37-6fb9-4754-a909-8e3db20fcd81	4cebcfa1-055a-4f00-b33b-eb85fbda1db9	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Devops/Cloud Intern". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 10:13:20.318
5b6b34a1-bd78-4db9-a685-0a1192a49648	e1e773b8-ea93-4495-a2f5-a76db55088de	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Devops/Cloud Intern". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 10:13:20.318
c6631949-d213-47e2-b008-d26c4d036858	d0bffae3-dc73-4597-a9b0-772765b789c1	Đơn ứng tuyển mới	Sinh viên "Đào Ngọc Thông" đã nộp đơn ứng tuyển cho vị trí "AI Engineer Intern".	info	f	/company/applications/0a44b583-7848-437b-ae63-71467723a223	2026-05-17 10:27:36.643
7f69698c-36a2-4284-ab47-2b9b1860031d	b70e6f45-fd81-4d09-ba88-ce31c0532f32	Nộp đơn ứng tuyển thành công	Bạn đã nộp đơn ứng tuyển cho vị trí "AI Engineer Intern". Đơn đang chờ được xem xét.	info	f	/applications/0a44b583-7848-437b-ae63-71467723a223	2026-05-17 10:27:36.644
8044a356-f2e6-408e-a75b-62537e7cbe1b	b70e6f45-fd81-4d09-ba88-ce31c0532f32	Đơn ứng tuyển đang được xem xét	Đơn ứng tuyển cho vị trí "AI Engineer Intern" đang được doanh nghiệp xem xét.	info	f	/applications/0a44b583-7848-437b-ae63-71467723a223	2026-05-17 10:28:22.076
8bdb571e-b16e-4def-b43c-4ba150ce9ed2	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "Devops/Cloud Intern" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 10:39:18.954
d7a97e1f-d784-45d3-94d4-18db87f405f9	d0bffae3-dc73-4597-a9b0-772765b789c1	Đơn ứng tuyển mới	Sinh viên "Lê Thị Hoài Linh" đã nộp đơn ứng tuyển cho vị trí "Devops/Cloud Intern".	info	f	/company/applications/1b9ad357-4e22-4b89-8a74-962f51f3fe89	2026-05-17 10:39:38.632
85ed8789-a067-44f8-9fef-ac766d9fbb9a	931bc777-ecf2-4c01-b233-6cdf8fd7072f	Nộp đơn ứng tuyển thành công	Bạn đã nộp đơn ứng tuyển cho vị trí "Devops/Cloud Intern". Đơn đang chờ được xem xét.	info	f	/applications/1b9ad357-4e22-4b89-8a74-962f51f3fe89	2026-05-17 10:39:38.633
aebfb3ae-b78d-4164-a963-31609d7210ea	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Sinh viên nộp đơn thực tập	Sinh viên "Lê Thị Hoài Linh" đã nộp đơn ứng tuyển cho vị trí "Devops/Cloud Intern".	info	f	/lecturer/applications	2026-05-17 10:39:38.635
472c97c3-4fb3-499f-a6a2-d963eae0eb81	ac1a8b3d-6bf8-4511-bc81-64f4514f764e	Sinh viên nộp đơn thực tập	Sinh viên "Lê Thị Hoài Linh" đã nộp đơn ứng tuyển cho vị trí "Devops/Cloud Intern".	info	f	/lecturer/applications	2026-05-17 10:39:38.635
5d03e432-9eb5-4aa3-8ffa-d3a428335a54	d0bffae3-dc73-4597-a9b0-772765b789c1	Đơn ứng tuyển mới	Sinh viên "Lê Thị Hoài Linh" đã nộp đơn ứng tuyển cho vị trí "AI Engineer Intern".	info	f	/company/applications/fd4c1a2f-0a8e-4a79-b88f-c744589e12bb	2026-05-17 10:50:36.665
ecc12200-46c7-4dd0-9304-2e828243ef31	931bc777-ecf2-4c01-b233-6cdf8fd7072f	Nộp đơn ứng tuyển thành công	Bạn đã nộp đơn ứng tuyển cho vị trí "AI Engineer Intern". Đơn đang chờ được xem xét.	info	f	/applications/fd4c1a2f-0a8e-4a79-b88f-c744589e12bb	2026-05-17 10:50:36.666
3f647290-3455-49b1-a8df-979d97c09df2	ac1a8b3d-6bf8-4511-bc81-64f4514f764e	Sinh viên nộp đơn thực tập	Sinh viên "Lê Thị Hoài Linh" đã nộp đơn ứng tuyển cho vị trí "AI Engineer Intern".	info	f	/lecturer/applications	2026-05-17 10:50:36.668
636754d7-6f0e-42ad-9f8c-803a2000064f	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Sinh viên nộp đơn thực tập	Sinh viên "Lê Thị Hoài Linh" đã nộp đơn ứng tuyển cho vị trí "AI Engineer Intern".	info	f	/lecturer/applications	2026-05-17 10:50:36.668
28ab0e49-ad25-4d4b-8622-7bd9af346b8e	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "AI Engineer Intern" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 10:50:55.746
c53e838f-23fb-4b15-92d9-e33553c017cd	931bc777-ecf2-4c01-b233-6cdf8fd7072f	Đơn đã được giảng viên duyệt!	Đơn ứng tuyển vị trí "AI Engineer Intern" đã được giảng viên duyệt. Đơn đang chờ phòng đào tạo xét duyệt.	approval	f	/applications/fd4c1a2f-0a8e-4a79-b88f-c744589e12bb	2026-05-17 10:50:55.755
8db49eaa-d857-4d3d-930d-c6ef6b4336f3	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "AI Engineer Intern" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 10:51:03.405
621882ba-49d5-44db-bcd5-6091e3330f59	931bc777-ecf2-4c01-b233-6cdf8fd7072f	Đơn ứng tuyển đã được duyệt!	Đơn ứng tuyển vị trí "AI Engineer Intern" đã được phê duyệt hoàn tất.	approval	f	/applications/fd4c1a2f-0a8e-4a79-b88f-c744589e12bb	2026-05-17 10:51:03.422
1129b727-6302-4b9f-b0a8-7576ca210779	931bc777-ecf2-4c01-b233-6cdf8fd7072f	Đơn ứng tuyển đang được xem xét	Đơn ứng tuyển cho vị trí "Devops/Cloud Intern" đang được doanh nghiệp xem xét.	info	f	/applications/1b9ad357-4e22-4b89-8a74-962f51f3fe89	2026-05-17 10:54:25.363
e2c7f496-069d-4cab-a4d1-8776fe8389e4	931bc777-ecf2-4c01-b233-6cdf8fd7072f	Lịch phỏng vấn	Đơn ứng tuyển cho vị trí "Devops/Cloud Intern" đã được mời phỏng vấn.	info	f	/applications/1b9ad357-4e22-4b89-8a74-962f51f3fe89	2026-05-17 10:54:29.706
bda1336f-d539-43de-ad47-f74f2dd63973	e1e773b8-ea93-4495-a2f5-a76db55088de	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Test". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 10:55:10.335
33c26ec0-3fce-4e7f-b749-133a383b2974	e8a477be-5a2e-4555-9932-a6971b9ecfde	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Test". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 10:55:10.335
f676764b-cb0a-4a7c-8c94-4e0a203ad3c4	4cebcfa1-055a-4f00-b33b-eb85fbda1db9	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Test". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 10:55:10.335
1e9be373-7886-4686-8361-6a4475c18449	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "Test" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 10:55:28.603
2d5de67d-a183-4dee-a9b0-11605865159f	d0bffae3-dc73-4597-a9b0-772765b789c1	Đơn ứng tuyển mới	Sinh viên "Lê Thị Hoài Linh" đã nộp đơn ứng tuyển cho vị trí "Test".	info	f	/company/applications/1a401a64-1b4f-4f70-b591-47a766094b2e	2026-05-17 10:55:50.809
66c7283c-d1b6-4ab1-a4e5-67cb044fd8fa	931bc777-ecf2-4c01-b233-6cdf8fd7072f	Nộp đơn ứng tuyển thành công	Bạn đã nộp đơn ứng tuyển cho vị trí "Test". Đơn đang chờ được xem xét.	info	f	/applications/1a401a64-1b4f-4f70-b591-47a766094b2e	2026-05-17 10:55:50.811
414140f8-c7f9-4d9b-abf2-132e082f4d73	ac1a8b3d-6bf8-4511-bc81-64f4514f764e	Sinh viên nộp đơn thực tập	Sinh viên "Lê Thị Hoài Linh" đã nộp đơn ứng tuyển cho vị trí "Test".	info	f	/lecturer/applications	2026-05-17 10:55:50.813
ab001db3-c179-42ca-9ef0-3c1aa5e21055	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Sinh viên nộp đơn thực tập	Sinh viên "Lê Thị Hoài Linh" đã nộp đơn ứng tuyển cho vị trí "Test".	info	f	/lecturer/applications	2026-05-17 10:55:50.813
045e63ac-a975-4b78-bf0f-5f549c15f474	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "Test" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 10:56:24.188
2480503a-36a8-4618-a038-b0a5167cae5d	931bc777-ecf2-4c01-b233-6cdf8fd7072f	Đơn đã được giảng viên duyệt!	Đơn ứng tuyển vị trí "Test" đã được giảng viên duyệt. Đơn đang chờ phòng đào tạo xét duyệt.	approval	f	/applications/1a401a64-1b4f-4f70-b591-47a766094b2e	2026-05-17 10:56:24.204
69ac897c-79b6-432e-bf4d-984a62db3e57	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "Test" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 10:57:38.411
c61292bb-2591-4aea-9268-2dccffba3357	931bc777-ecf2-4c01-b233-6cdf8fd7072f	Đơn ứng tuyển đã được duyệt!	Đơn ứng tuyển vị trí "Test" đã được phê duyệt hoàn tất.	approval	f	/applications/1a401a64-1b4f-4f70-b591-47a766094b2e	2026-05-17 10:57:38.42
1eae941c-a1e9-462a-a58a-d295cb508285	e8a477be-5a2e-4555-9932-a6971b9ecfde	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Test 2". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 11:05:34.688
1234fe13-64f5-4caf-8d3a-c74c1994fe67	e1e773b8-ea93-4495-a2f5-a76db55088de	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Test 2". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 11:05:34.688
f2f00184-a6f6-408b-ba96-35ceb62dbbdd	4cebcfa1-055a-4f00-b33b-eb85fbda1db9	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Test 2". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 11:05:34.688
56c94a42-0789-4712-9681-38c1433acdee	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "Test 2" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 11:06:15.116
583f5132-eb8b-4a92-96ab-1b3819a14bc3	d0bffae3-dc73-4597-a9b0-772765b789c1	Đơn ứng tuyển mới	Sinh viên "Nguyễn Trọng Thái" đã nộp đơn ứng tuyển cho vị trí "Test 2".	info	f	/company/applications/165d2fb6-cb77-47a0-b977-7736dcdf5ef8	2026-05-17 11:06:31.441
9458e8f7-f6ad-405a-a0b9-d6745f6b838f	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	Nộp đơn ứng tuyển thành công	Bạn đã nộp đơn ứng tuyển cho vị trí "Test 2". Đơn đang chờ được xem xét.	info	f	/applications/165d2fb6-cb77-47a0-b977-7736dcdf5ef8	2026-05-17 11:06:31.444
86813ba1-ec0e-4761-b59d-1de25a82adf9	ac1a8b3d-6bf8-4511-bc81-64f4514f764e	Sinh viên nộp đơn thực tập	Sinh viên "Nguyễn Trọng Thái" đã nộp đơn ứng tuyển cho vị trí "Test 2".	info	f	/lecturer/applications	2026-05-17 11:06:31.447
d9476597-b47b-425b-beeb-3c64b8502834	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Sinh viên nộp đơn thực tập	Sinh viên "Nguyễn Trọng Thái" đã nộp đơn ứng tuyển cho vị trí "Test 2".	info	f	/lecturer/applications	2026-05-17 11:06:31.447
83228297-3cbe-4e12-8b10-a81dfba290e5	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "Test 2" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 11:07:15.759
de026ed9-952c-4fe9-8ffe-e61eca3acd54	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	Đơn đã được giảng viên duyệt!	Đơn ứng tuyển vị trí "Test 2" đã được giảng viên duyệt. Đơn đang chờ phòng đào tạo xét duyệt.	approval	f	/applications/165d2fb6-cb77-47a0-b977-7736dcdf5ef8	2026-05-17 11:07:15.769
d885a8b5-e514-41e0-810a-da94505f4f58	e8a477be-5a2e-4555-9932-a6971b9ecfde	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Test Final". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 11:12:19.93
d17ce277-cefe-4f3b-832c-d15388e484d4	e1e773b8-ea93-4495-a2f5-a76db55088de	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Test Final". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 11:12:19.93
f8bf546c-51f6-4a18-bb98-503673546d4c	4cebcfa1-055a-4f00-b33b-eb85fbda1db9	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Test Final". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 11:12:19.93
d56506e9-643f-4b53-b4a3-f0d0b6fb7e03	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "Test Final" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 11:13:17.675
9cc9cf44-5a31-4339-bd0e-ab5778232552	d0bffae3-dc73-4597-a9b0-772765b789c1	Đơn ứng tuyển mới	Sinh viên "Nguyễn Trọng Thái" đã nộp đơn ứng tuyển cho vị trí "Test Final".	info	f	/company/applications/358453b5-7493-44db-a8ce-fe1907cb29fd	2026-05-17 11:13:41.974
49011c2d-b1b9-4e15-8f36-2a46a006603e	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	Nộp đơn ứng tuyển thành công	Bạn đã nộp đơn ứng tuyển cho vị trí "Test Final". Đơn đang chờ được xem xét.	info	f	/applications/358453b5-7493-44db-a8ce-fe1907cb29fd	2026-05-17 11:13:41.976
8a8d8fae-d65e-4059-9aee-c3a85a992424	ac1a8b3d-6bf8-4511-bc81-64f4514f764e	Sinh viên nộp đơn thực tập	Sinh viên "Nguyễn Trọng Thái" đã nộp đơn ứng tuyển cho vị trí "Test Final".	info	f	/lecturer/applications	2026-05-17 11:13:41.978
e90e18a7-9e72-457a-b6f3-6b45c089d67b	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Sinh viên nộp đơn thực tập	Sinh viên "Nguyễn Trọng Thái" đã nộp đơn ứng tuyển cho vị trí "Test Final".	info	f	/lecturer/applications	2026-05-17 11:13:41.978
a225aad6-e4ae-40fa-be4e-87b57452c309	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "Test Final" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 11:14:33.243
f3da2d1d-2346-4b56-b326-ee35e180a8ff	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	Đơn đã được giảng viên duyệt!	Đơn ứng tuyển vị trí "Test Final" đã được giảng viên duyệt. Đơn đang chờ phòng đào tạo xét duyệt.	approval	f	/applications/358453b5-7493-44db-a8ce-fe1907cb29fd	2026-05-17 11:14:33.256
5fb06684-af25-4d60-8261-663c59e591a5	e8a477be-5a2e-4555-9932-a6971b9ecfde	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Test 5". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 11:19:42.547
7a9cfc42-84b3-41f5-b1d0-9ec0a3310bb5	4cebcfa1-055a-4f00-b33b-eb85fbda1db9	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Test 5". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 11:19:42.547
2e6dce03-dedc-4b2e-8bd6-73310075c1bd	e1e773b8-ea93-4495-a2f5-a76db55088de	Tin tuyển dụng mới cần duyệt	Doanh nghiệp "Eco Tech" vừa đăng tin tuyển dụng mới: "Test 5". Vui lòng vào kiểm tra và phê duyệt.	info	f	/admin	2026-05-17 11:19:42.547
9378fa65-391f-4a9d-b4b1-5279a0dc59e1	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "Test 5" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 11:20:43.34
4bb4d6a3-c610-49cc-9570-ceadfe10a52c	d0bffae3-dc73-4597-a9b0-772765b789c1	Đơn ứng tuyển mới	Sinh viên "Nguyễn Trọng Thái" đã nộp đơn ứng tuyển cho vị trí "Test 5".	info	f	/company/applications/1571bb21-6356-43fe-b0d0-3727a38032a0	2026-05-17 11:21:05.71
316ceaf9-fd7e-4145-84e3-720a08db8a70	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	Nộp đơn ứng tuyển thành công	Bạn đã nộp đơn ứng tuyển cho vị trí "Test 5". Đơn đang chờ được xem xét.	info	f	/applications/1571bb21-6356-43fe-b0d0-3727a38032a0	2026-05-17 11:21:05.712
f4bc23b0-a959-4083-889f-aca98ebf184d	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Sinh viên nộp đơn thực tập	Sinh viên "Nguyễn Trọng Thái" đã nộp đơn ứng tuyển cho vị trí "Test 5".	info	f	/lecturer/applications	2026-05-17 11:21:05.716
9e2e8fe6-6264-407b-80eb-51a071128e44	ac1a8b3d-6bf8-4511-bc81-64f4514f764e	Sinh viên nộp đơn thực tập	Sinh viên "Nguyễn Trọng Thái" đã nộp đơn ứng tuyển cho vị trí "Test 5".	info	f	/lecturer/applications	2026-05-17 11:21:05.716
21a4cb58-a410-4d99-8af7-31fa8e6171dd	d0bffae3-dc73-4597-a9b0-772765b789c1	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "Test 5" đã được admin phê duyệt và hiển thị công khai.	approval	f	/company/jobs	2026-05-17 11:21:50.237
7ef4959a-7156-4de1-a215-093a5b8ddfb7	d0bffae3-dc73-4597-a9b0-772765b789c1	Sinh viên ứng tuyển thực tập	Sinh viên "Nguyễn Trọng Thái" đã được giảng viên duyệt và gửi đơn ứng tuyển vị trí "Test 5". Vui lòng vào xem và phê duyệt.	info	f	/company/applications/1571bb21-6356-43fe-b0d0-3727a38032a0	2026-05-17 11:21:50.25
51bbfe98-7924-4120-9176-212b374abe7a	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	Đơn đã được giảng viên duyệt!	Đơn ứng tuyển vị trí "Test 5" đã được giảng viên duyệt. Đơn đang chờ phòng đào tạo xét duyệt.	approval	f	/applications/1571bb21-6356-43fe-b0d0-3727a38032a0	2026-05-17 11:21:50.253
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.positions (id, title, company_id, location, field, description, requirements, responsibilities, salary_min, salary_max, duration, work_type, slots, posted_date, deadline, status, created_at, updated_at) FROM stdin;
3926a36a-e1e4-4216-81e4-cbd9da57a816	Frontend Developer	d0bffae3-dc73-4597-a9b0-772765b789c1	Hà Nội	Software	\N	{React}	\N	3.00	3.50	two_three_months	remote	1	2026-05-14 06:51:39.526	\N	active	2026-05-14 06:51:39.526	2026-05-14 06:51:39.526
bbbc1d1f-09c4-4392-b160-69cb65f26c54	Backend Developer Intern	d0bffae3-dc73-4597-a9b0-772765b789c1	Hà Nội	Software	\N	{NestJS}	\N	3.00	3.50	two_three_months	onsite	1	2026-05-14 06:56:17.701	\N	active	2026-05-14 06:56:17.701	2026-05-14 06:56:17.701
22c4e616-8de3-4443-aa61-14203979b0e7	Devops Engineer Intern	d0bffae3-dc73-4597-a9b0-772765b789c1	Hanoi	DevOps	\N	{Docker,AWS,Linux}	\N	5.00	7.00	two_three_months	onsite	1	2026-05-16 10:58:39.843	\N	active	2026-05-16 10:58:39.843	2026-05-16 10:58:39.843
d127f2b7-9561-4787-a29a-8cab51589976	Cloud Engineer Intern	d0bffae3-dc73-4597-a9b0-772765b789c1	Hanoi	Product	\N	{Docker,AWS,Linux}	\N	2.00	4.00	two_three_months	onsite	1	2026-05-17 09:19:16.055	\N	active	2026-05-17 09:19:16.055	2026-05-17 09:19:16.055
ebcc0b91-127d-407c-9616-4154d8120112	Frontend Developer	bbc8d777-076b-4649-9d25-c23402004c2b	Ho Chi Minh	\N	We are looking for a frontend developer	\N	\N	\N	\N	\N	onsite	1	2026-05-17 09:23:04.127	\N	active	2026-05-17 09:23:04.127	2026-05-17 09:23:28.586
bb32bd10-44fc-47a7-8a60-af9fa597c0a7	UI/UX Design Intern	d0bffae3-dc73-4597-a9b0-772765b789c1	Ho Chi Minh City	Design	\N	{Figma}	\N	3.00	7.00	four_six_months	onsite	1	2026-05-17 09:52:17.714	\N	active	2026-05-17 09:52:17.714	2026-05-17 09:52:41.711
8c11578a-935e-40ee-b3c4-6f1736288897	Frontend Intern	d0bffae3-dc73-4597-a9b0-772765b789c1	Hanoi	Software	\N	{React}	\N	3.00	5.00	two_three_months	onsite	1	2026-05-17 09:43:51.692	\N	active	2026-05-17 09:43:51.692	2026-05-17 10:05:22.952
d3dbcd50-4582-4eea-90f7-5b8106e5d40d	Data Engineer Intern	d0bffae3-dc73-4597-a9b0-772765b789c1	Ho Chi Minh City	Data Science	\N	{Python}	\N	7.00	8.00	four_six_months	onsite	1	2026-05-17 10:07:07.062	\N	active	2026-05-17 10:07:07.062	2026-05-17 10:07:25.61
28260895-d401-4c87-8e00-3ae36112465c	Devops/Cloud Intern	d0bffae3-dc73-4597-a9b0-772765b789c1	Hanoi	DevOps	\N	{Docker,AWS,Linux}	\N	7.00	9.00	four_six_months	onsite	1	2026-05-17 10:13:20.307	\N	active	2026-05-17 10:13:20.307	2026-05-17 10:39:18.951
6e501f85-c854-4637-9d97-0e875ec49c5e	AI Engineer Intern	d0bffae3-dc73-4597-a9b0-772765b789c1	Ho Chi Minh	Software	\N	{Python}	\N	7.00	9.00	four_six_months	onsite	1	2026-05-17 09:29:19.176	\N	active	2026-05-17 09:29:19.176	2026-05-17 10:51:03.377
e68efba3-0a47-426d-a0d3-fd346d172815	Test	d0bffae3-dc73-4597-a9b0-772765b789c1	Hanoi	Software	\N	{Docker,AWS,Linux}	\N	1.00	2.00	four_six_months	onsite	1	2026-05-17 10:55:10.327	\N	active	2026-05-17 10:55:10.327	2026-05-17 10:57:38.408
534cbb97-1a7a-451d-9e25-16cb2591e76a	Test 2	d0bffae3-dc73-4597-a9b0-772765b789c1	Hanoi	Design	\N	{Python}	\N	1.00	4.00	two_three_months	onsite	1	2026-05-17 11:05:34.681	\N	active	2026-05-17 11:05:34.681	2026-05-17 11:07:15.756
2c8e3c68-fcea-4e95-9a80-22a051ad24eb	Test Final	d0bffae3-dc73-4597-a9b0-772765b789c1	Hanoi	Marketing	\N	{Figma}	\N	4.00	7.00	two_three_months	onsite	1	2026-05-17 11:12:19.923	\N	active	2026-05-17 11:12:19.923	2026-05-17 11:14:33.24
93bd341a-96ac-4149-a152-f7989ef272be	Test 5	d0bffae3-dc73-4597-a9b0-772765b789c1	Ho Chi Minh City	Software	\N	{Figma}	\N	6.00	8.00	two_three_months	hybrid	1	2026-05-17 11:19:42.54	\N	active	2026-05-17 11:19:42.54	2026-05-17 11:21:50.235
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at, revoked_at) FROM stdin;
bc085690-fb31-42ce-a86f-6916d6df2570	0fccb4c6-b998-4f6b-80c6-c37b63129f87	$2b$10$Kh2ro0rw9uijanGkxqFlhuT2.h6G49d/bXz4mRfcAafSBrgqzbmha	2026-05-19 16:56:37.439	2026-05-12 16:56:37.441	\N
f53324a1-64f4-4065-b914-aa792efbcb05	e8a477be-5a2e-4555-9932-a6971b9ecfde	$2b$10$iie1hs7nvMIZJNva8N8xa.i/gcY6sxqZnF0u2BCVLEomNx0pc3F6S	2026-05-24 10:10:52.491	2026-05-17 10:10:52.493	\N
26e64f58-05d1-439c-a919-2499d20ae927	ac1a8b3d-6bf8-4511-bc81-64f4514f764e	$2b$10$RSnDxCeWjotCBX8tfcxIaewVGC3mivtM2uIcIeDt9CFJMvgNmGua2	2026-05-23 10:55:09.739	2026-05-16 10:55:09.747	\N
116c47b1-a02d-4cf4-a570-b5c33c051717	bbc8d777-076b-4649-9d25-c23402004c2b	$2b$10$L0jvCg5qzKyWFse.12yChOdith5o2jvrGlytd6izFAjewgnTaPLB.	2026-05-24 09:22:57.422	2026-05-17 09:22:57.427	\N
7bab59bb-4562-40ca-9351-0821afaaca62	4cebcfa1-055a-4f00-b33b-eb85fbda1db9	$2b$10$YjAUy/n7LinXnX7h1ojiju2m2S7WMmR0pIKsxsYGTXl1UokXr7zRm	2026-05-24 09:23:16.407	2026-05-17 09:23:16.409	\N
795b7353-c07e-4cfc-8ee6-3aec1cd81d3d	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	$2b$10$cQ/XomHcK1U0en/rCRrVG.kkqrSYB8LN7M7.pTV7PqZThH7KASHM.	2026-05-24 11:21:03.215	2026-05-17 11:21:03.216	\N
9993eb91-5578-446a-bf3f-e1c37520b60f	d0bffae3-dc73-4597-a9b0-772765b789c1	$2b$10$bFLWZ2O2y.LO3LKgz34z1uPjQrQCm.TtI83ZIN.TYmJA1WF.P4PCe	2026-05-24 11:22:00.308	2026-05-17 11:22:00.311	\N
\.


--
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_profiles (id, user_id, major, gpa, skills, projects, bio, resume_url, transcript_url, created_at, updated_at) FROM stdin;
9447a6d7-c034-492b-afd1-962ab45e3ba0	b70e6f45-fd81-4d09-ba88-ce31c0532f32	\N	3.50	{react,nodejs,figma}	"[{\\"id\\":\\"proj-1778926389117\\",\\"title\\":\\"a\\",\\"description\\":\\"a\\",\\"link\\":\\"a\\",\\"technologies\\":[\\"a\\"],\\"year\\":2026}]"	sinh viên Phenikaa	\N	\N	2026-05-13 10:57:36.919	2026-05-16 10:13:13.445
f5a7b422-85d0-482a-b794-34c1acb32e9d	20d53eef-7afc-4ef9-b0f8-a217a3ebc40f	\N	0.00	{react,nodejs,git,docker}	"[{\\"id\\":\\"proj-1778930178789\\",\\"title\\":\\"example\\",\\"description\\":\\"example\\",\\"link\\":\\"http://\\",\\"technologies\\":[\\"React\\"],\\"year\\":2026}]"	thứ sinh vật hãm	\N	\N	2026-05-16 11:12:23.192	2026-05-16 11:16:21.538
bf610479-1497-48a0-aa7e-256a9ba0f4aa	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	\N	\N	\N	\N	\N	\N	\N	2026-05-17 11:05:09.267	2026-05-17 11:05:09.267
\.


--
-- Data for Name: system_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_logs (id, log_type, recipient_id, recipient_email, subject, message, status, sent_at, metadata, actor_id, actor_name, actor_role) FROM stdin;
0b5bed0a-36b8-4ded-a9a0-64da5b1e05c5	system	\N	\N	Admin đăng nhập hệ thống	Quản trị viên "Nguyen Van B" đã đăng nhập thành công.	sent	2026-05-12 17:11:54.862	{"ip": "192.168.1.100", "action": "login"}	e8a477be-5a2e-4555-9932-a6971b9ecfde	Nguyen Van B	admin
72b638da-fd6a-406a-be4c-3b644ed0e440	system	e8a477be-5a2e-4555-9932-a6971b9ecfde	\N	Doanh nghiệp đăng tin tuyển dụng mới: Thực tập Frontend Developer	Doanh nghiệp "TechViet Solutions" đã tạo tin tuyển dụng "Thực tập Frontend Developer" đang chờ admin duyệt.	sent	2026-05-13 17:11:54.866	{"action": "position_created", "positionTitle": "Thực tập Frontend Developer"}	d0bffae3-dc73-4597-a9b0-772765b789c1	TechViet Solutions	company
76538f9b-1515-47e2-b636-65c96f8f3c43	email	d0bffae3-dc73-4597-a9b0-772765b789c1	contact@techviet.vn	Tin tuyển dụng đã được duyệt!	Tin tuyển dụng "Thực tập Frontend Developer" đã được admin phê duyệt và hiển thị công khai.	sent	2026-05-14 17:11:54.866	{"status": "active", "positionTitle": "Thực tập Frontend Developer"}	e8a477be-5a2e-4555-9932-a6971b9ecfde	Nguyen Van B	admin
78aecbac-0014-4ca9-87d0-6b7c6ce8ee7b	system	d0bffae3-dc73-4597-a9b0-772765b789c1	contact@techviet.vn	Sinh viên nộp đơn ứng tuyển: Thực tập Frontend Developer	Sinh viên "Test User" đã nộp đơn ứng tuyển cho vị trí "Thực tập Frontend Developer".	sent	2026-05-15 17:11:54.866	{"action": "application_created", "positionTitle": "Thực tập Frontend Developer"}	0fccb4c6-b998-4f6b-80c6-c37b63129f87	Test User	student
f23cdc13-09a9-4638-ac11-4fb6a789b768	system	0fccb4c6-b998-4f6b-80c6-c37b63129f87	\N	Giảng viên phê duyệt đơn ứng tuyển: Thực tập Frontend Developer	Giảng viên "Trần Văn Dũng" đã phê duyệt đơn ứng tuyển của sinh viên "Test User".	sent	2026-05-16 17:11:54.866	{"action": "application_approved", "positionTitle": "Thực tập Frontend Developer"}	ac1a8b3d-6bf8-4511-bc81-64f4514f764e	Trần Văn Dũng	lecturer
be1a92c4-df27-4795-b25a-43a7af9e4313	system	\N	\N	Bảo trì hệ thống	Sao lưu cơ sở dữ liệu định kỳ hoàn tất thành công.	sent	2026-05-17 05:11:54.867	{"size_mb": 256, "backup_type": "full", "duration_seconds": 45}	\N	\N	\N
7b400b92-ef25-468f-aac8-6ff0968e4e7c	notification	0fccb4c6-b998-4f6b-80c6-c37b63129f87	\N	Cập nhật trạng thái đơn ứng tuyển	Đơn ứng tuyển của bạn đã được cập nhật trạng thái thành "Đang chờ duyệt".	sent	2026-05-17 11:11:54.867	{"type": "status_update"}	0fccb4c6-b998-4f6b-80c6-c37b63129f87	Test User	student
ab751a85-9483-4b58-a825-ddbfbdc9f277	system	e8a477be-5a2e-4555-9932-a6971b9ecfde	\N	Doanh nghiệp cập nhật tin tuyển dụng	Doanh nghiệp "TechViet Solutions" đã cập nhật nội dung tin tuyển dụng "Thực tập Backend NodeJS".	sent	2026-05-17 14:11:54.867	{"action": "position_updated", "positionTitle": "Thực tập Backend NodeJS"}	d0bffae3-dc73-4597-a9b0-772765b789c1	TechViet Solutions	company
877ea790-19e2-4785-862b-c9994d0976fa	system	\N	\N	Doanh nghiệp đăng tin tuyển dụng mới: Devops/Cloud Intern	Doanh nghiệp "Eco Tech" đã tạo tin tuyển dụng "Devops/Cloud Intern" đang chờ admin duyệt.	sent	2026-05-17 10:13:20.321	{"companyId": "d0bffae3-dc73-4597-a9b0-772765b789c1", "positionId": "28260895-d401-4c87-8e00-3ae36112465c", "positionTitle": "Devops/Cloud Intern"}	d0bffae3-dc73-4597-a9b0-772765b789c1	Eco Tech	company
0f87af2e-0378-48b8-b76b-b471afca3fb7	system	\N	\N	Sinh viên nộp đơn ứng tuyển: AI Engineer Intern	Sinh viên "Đào Ngọc Thông" đã nộp đơn ứng tuyển cho vị trí "AI Engineer Intern".	sent	2026-05-17 10:27:36.64	{"studentId": "b70e6f45-fd81-4d09-ba88-ce31c0532f32", "positionId": "6e501f85-c854-4637-9d97-0e875ec49c5e", "applicationId": "0a44b583-7848-437b-ae63-71467723a223"}	b70e6f45-fd81-4d09-ba88-ce31c0532f32	Đào Ngọc Thông	student
df0a3fc4-9093-4cde-9443-d65ad518ade4	system	\N	\N	Cập nhật trạng thái đơn: AI Engineer Intern	"Eco Tech" (company) đã cập nhật trạng thái đơn ứng tuyển của "Đào Ngọc Thông" thành "screening".	sent	2026-05-17 10:28:22.075	{"newStatus": "screening", "applicationId": "0a44b583-7848-437b-ae63-71467723a223"}	d0bffae3-dc73-4597-a9b0-772765b789c1	Eco Tech	company
a327d9c1-da86-4bc3-bf86-1d45cd7ed4a0	system	\N	\N	Admin duyệt tin tuyển dụng: Devops/Cloud Intern	Admin "Đỗ Nguyên Anh Vũ" đã phê duyệt tin tuyển dụng "Devops/Cloud Intern".	sent	2026-05-17 10:39:18.957	{"comment": "", "positionId": "28260895-d401-4c87-8e00-3ae36112465c", "approvalResult": "approved"}	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Đỗ Nguyên Anh Vũ	lecturer
3a6a838d-c43e-4f2f-95f3-3cbb08fa1ab3	system	\N	\N	Sinh viên nộp đơn ứng tuyển: Devops/Cloud Intern	Sinh viên "Lê Thị Hoài Linh" đã nộp đơn ứng tuyển cho vị trí "Devops/Cloud Intern".	sent	2026-05-17 10:39:38.63	{"studentId": "931bc777-ecf2-4c01-b233-6cdf8fd7072f", "positionId": "28260895-d401-4c87-8e00-3ae36112465c", "applicationId": "1b9ad357-4e22-4b89-8a74-962f51f3fe89"}	931bc777-ecf2-4c01-b233-6cdf8fd7072f	Lê Thị Hoài Linh	student
be34b73f-2901-48f6-bca5-42baaeab7540	system	\N	\N	Sinh viên nộp đơn ứng tuyển: AI Engineer Intern	Sinh viên "Lê Thị Hoài Linh" đã nộp đơn ứng tuyển cho vị trí "AI Engineer Intern".	sent	2026-05-17 10:50:36.663	{"studentId": "931bc777-ecf2-4c01-b233-6cdf8fd7072f", "positionId": "6e501f85-c854-4637-9d97-0e875ec49c5e", "applicationId": "fd4c1a2f-0a8e-4a79-b88f-c744589e12bb"}	931bc777-ecf2-4c01-b233-6cdf8fd7072f	Lê Thị Hoài Linh	student
c3e7b2c1-9036-40d9-b8e9-cc81b81d3c75	system	\N	\N	Admin duyệt tin tuyển dụng: AI Engineer Intern	Admin "Đỗ Nguyên Anh Vũ" đã phê duyệt tin tuyển dụng "AI Engineer Intern".	sent	2026-05-17 10:50:55.748	{"comment": "", "positionId": "6e501f85-c854-4637-9d97-0e875ec49c5e", "approvalResult": "approved"}	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Đỗ Nguyên Anh Vũ	lecturer
87550d31-5166-4130-89cd-df9569de27af	system	\N	\N	Phê duyệt đơn ứng tuyển: AI Engineer Intern	Đỗ Nguyên Anh Vũ đã phê duyệt đơn ứng tuyển của sinh viên "Lê Thị Hoài Linh" cho vị trí "AI Engineer Intern".	sent	2026-05-17 10:50:55.756	{"comment": "", "studentId": "931bc777-ecf2-4c01-b233-6cdf8fd7072f", "applicationId": "fd4c1a2f-0a8e-4a79-b88f-c744589e12bb", "approvalResult": "approved"}	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Đỗ Nguyên Anh Vũ	lecturer
d7f4ae2e-e788-4092-8ffc-e6097f5eb23e	system	\N	\N	Admin duyệt tin tuyển dụng: AI Engineer Intern	Admin "Đỗ Nguyên Anh Vũ" đã phê duyệt tin tuyển dụng "AI Engineer Intern".	sent	2026-05-17 10:51:03.411	{"comment": "", "positionId": "6e501f85-c854-4637-9d97-0e875ec49c5e", "approvalResult": "approved"}	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Đỗ Nguyên Anh Vũ	lecturer
63cc9099-c914-47b0-86ee-b92548d8c409	system	\N	\N	Phê duyệt đơn ứng tuyển: AI Engineer Intern	Đỗ Nguyên Anh Vũ đã phê duyệt đơn ứng tuyển của sinh viên "Lê Thị Hoài Linh" cho vị trí "AI Engineer Intern".	sent	2026-05-17 10:51:03.423	{"comment": "", "studentId": "931bc777-ecf2-4c01-b233-6cdf8fd7072f", "applicationId": "fd4c1a2f-0a8e-4a79-b88f-c744589e12bb", "approvalResult": "approved"}	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Đỗ Nguyên Anh Vũ	lecturer
41ba90ed-88f8-42b8-8416-50420e52aaeb	system	\N	\N	Cập nhật trạng thái đơn: Devops/Cloud Intern	"Eco Tech" (company) đã cập nhật trạng thái đơn ứng tuyển của "Lê Thị Hoài Linh" thành "screening".	sent	2026-05-17 10:54:25.36	{"newStatus": "screening", "applicationId": "1b9ad357-4e22-4b89-8a74-962f51f3fe89"}	d0bffae3-dc73-4597-a9b0-772765b789c1	Eco Tech	company
83df81ff-97fe-44f5-840a-42b241664bfc	system	\N	\N	Cập nhật trạng thái đơn: Devops/Cloud Intern	"Eco Tech" (company) đã cập nhật trạng thái đơn ứng tuyển của "Lê Thị Hoài Linh" thành "interview".	sent	2026-05-17 10:54:29.703	{"newStatus": "interview", "applicationId": "1b9ad357-4e22-4b89-8a74-962f51f3fe89"}	d0bffae3-dc73-4597-a9b0-772765b789c1	Eco Tech	company
83d19dbc-feb7-4e87-9771-1dee389db3df	system	\N	\N	Cập nhật trạng thái đơn: Devops/Cloud Intern	"Eco Tech" (company) đã cập nhật trạng thái đơn ứng tuyển của "Lê Thị Hoài Linh" thành "department_approved".	sent	2026-05-17 10:54:35.584	{"newStatus": "department_approved", "applicationId": "1b9ad357-4e22-4b89-8a74-962f51f3fe89"}	d0bffae3-dc73-4597-a9b0-772765b789c1	Eco Tech	company
4e94bc67-464d-4a9a-be9f-bbc86f7b0bc0	system	\N	\N	Doanh nghiệp đăng tin tuyển dụng mới: Test	Doanh nghiệp "Eco Tech" đã tạo tin tuyển dụng "Test" đang chờ admin duyệt.	sent	2026-05-17 10:55:10.337	{"companyId": "d0bffae3-dc73-4597-a9b0-772765b789c1", "positionId": "e68efba3-0a47-426d-a0d3-fd346d172815", "positionTitle": "Test"}	d0bffae3-dc73-4597-a9b0-772765b789c1	Eco Tech	company
9e3c8f06-0dbb-40b1-b917-6361fdb051b1	system	\N	\N	Admin duyệt tin tuyển dụng: Test	Admin "User Test" đã phê duyệt tin tuyển dụng "Test".	sent	2026-05-17 10:55:28.606	{"positionId": "e68efba3-0a47-426d-a0d3-fd346d172815", "approvalResult": "approved"}	e1e773b8-ea93-4495-a2f5-a76db55088de	User Test	admin
6562f434-09ef-4a2b-8c57-55a37a1d5028	system	\N	\N	Sinh viên nộp đơn ứng tuyển: Test	Sinh viên "Lê Thị Hoài Linh" đã nộp đơn ứng tuyển cho vị trí "Test".	sent	2026-05-17 10:55:50.807	{"studentId": "931bc777-ecf2-4c01-b233-6cdf8fd7072f", "positionId": "e68efba3-0a47-426d-a0d3-fd346d172815", "applicationId": "1a401a64-1b4f-4f70-b591-47a766094b2e"}	931bc777-ecf2-4c01-b233-6cdf8fd7072f	Lê Thị Hoài Linh	student
7b830d02-09aa-4c26-8ec5-5a70e6c46755	system	\N	\N	Admin duyệt tin tuyển dụng: Test	Admin "User Test" đã phê duyệt tin tuyển dụng "Test".	sent	2026-05-17 10:56:24.191	{"positionId": "e68efba3-0a47-426d-a0d3-fd346d172815", "approvalResult": "approved"}	e1e773b8-ea93-4495-a2f5-a76db55088de	User Test	admin
70e10717-8cd0-424b-9d31-2f685cb3caaa	system	\N	\N	Phê duyệt đơn ứng tuyển: Test	User Test đã phê duyệt đơn ứng tuyển của sinh viên "Lê Thị Hoài Linh" cho vị trí "Test".	sent	2026-05-17 10:56:24.207	{"studentId": "931bc777-ecf2-4c01-b233-6cdf8fd7072f", "applicationId": "1a401a64-1b4f-4f70-b591-47a766094b2e", "approvalResult": "approved"}	e1e773b8-ea93-4495-a2f5-a76db55088de	User Test	admin
f46bb47f-6b17-41ee-a366-af08f6c34b91	system	\N	\N	Admin duyệt tin tuyển dụng: Test	Admin "Đỗ Nguyên Anh Vũ" đã phê duyệt tin tuyển dụng "Test".	sent	2026-05-17 10:57:38.412	{"comment": "", "positionId": "e68efba3-0a47-426d-a0d3-fd346d172815", "approvalResult": "approved"}	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Đỗ Nguyên Anh Vũ	lecturer
f61dd760-2763-4155-bfa7-d00fcc8ded21	system	\N	\N	Phê duyệt đơn ứng tuyển: Test	Đỗ Nguyên Anh Vũ đã phê duyệt đơn ứng tuyển của sinh viên "Lê Thị Hoài Linh" cho vị trí "Test".	sent	2026-05-17 10:57:38.422	{"comment": "", "studentId": "931bc777-ecf2-4c01-b233-6cdf8fd7072f", "applicationId": "1a401a64-1b4f-4f70-b591-47a766094b2e", "approvalResult": "approved"}	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Đỗ Nguyên Anh Vũ	lecturer
61358c07-2f0f-4e7b-97da-12cb5af7254e	system	\N	\N	Đăng ký tài khoản mới: Nguyễn Trọng Thái	Người dùng "Nguyễn Trọng Thái" (student) đã đăng ký tài khoản mới với email "trongthai@gmail.com".	sent	2026-05-17 11:04:56.966	{"role": "student", "userId": "86fd7931-5e1b-4010-a19d-dce3d3ea5b9a", "department": "Khoa CNTT"}	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	Nguyễn Trọng Thái	student
129ad7f0-0eb3-4b94-8b9b-2b69f0c14f20	system	\N	\N	Doanh nghiệp đăng tin tuyển dụng mới: Test 2	Doanh nghiệp "Eco Tech" đã tạo tin tuyển dụng "Test 2" đang chờ admin duyệt.	sent	2026-05-17 11:05:34.691	{"companyId": "d0bffae3-dc73-4597-a9b0-772765b789c1", "positionId": "534cbb97-1a7a-451d-9e25-16cb2591e76a", "positionTitle": "Test 2"}	d0bffae3-dc73-4597-a9b0-772765b789c1	Eco Tech	company
ff6548c9-b64e-411b-a8bd-4e026e905689	system	\N	\N	Admin duyệt tin tuyển dụng: Test 2	Admin "User Test" đã phê duyệt tin tuyển dụng "Test 2".	sent	2026-05-17 11:06:15.118	{"positionId": "534cbb97-1a7a-451d-9e25-16cb2591e76a", "approvalResult": "approved"}	e1e773b8-ea93-4495-a2f5-a76db55088de	User Test	admin
255db2a6-f87d-496e-a270-5415f9b7eedc	system	\N	\N	Sinh viên nộp đơn ứng tuyển: Test 2	Sinh viên "Nguyễn Trọng Thái" đã nộp đơn ứng tuyển cho vị trí "Test 2".	sent	2026-05-17 11:06:31.439	{"studentId": "86fd7931-5e1b-4010-a19d-dce3d3ea5b9a", "positionId": "534cbb97-1a7a-451d-9e25-16cb2591e76a", "applicationId": "165d2fb6-cb77-47a0-b977-7736dcdf5ef8"}	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	Nguyễn Trọng Thái	student
99f14115-e2cb-4958-9cb0-a12e3edcda2b	system	\N	\N	Admin duyệt tin tuyển dụng: Test 2	Admin "Đỗ Nguyên Anh Vũ" đã phê duyệt tin tuyển dụng "Test 2".	sent	2026-05-17 11:07:15.761	{"comment": "", "positionId": "534cbb97-1a7a-451d-9e25-16cb2591e76a", "approvalResult": "approved"}	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Đỗ Nguyên Anh Vũ	lecturer
53d12443-3f65-4a1a-b1a9-bf01eb4212ef	system	\N	\N	Phê duyệt đơn ứng tuyển: Test 2	Đỗ Nguyên Anh Vũ đã phê duyệt đơn ứng tuyển của sinh viên "Nguyễn Trọng Thái" cho vị trí "Test 2".	sent	2026-05-17 11:07:15.771	{"comment": "", "studentId": "86fd7931-5e1b-4010-a19d-dce3d3ea5b9a", "applicationId": "165d2fb6-cb77-47a0-b977-7736dcdf5ef8", "approvalResult": "approved"}	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Đỗ Nguyên Anh Vũ	lecturer
544c9821-29e0-476e-a83a-1c3b5a302a08	system	\N	\N	Cập nhật trạng thái đơn: Test 2	"Eco Tech" (company) đã cập nhật trạng thái đơn ứng tuyển của "Nguyễn Trọng Thái" thành "department_approved".	sent	2026-05-17 11:07:39.598	{"newStatus": "department_approved", "applicationId": "165d2fb6-cb77-47a0-b977-7736dcdf5ef8"}	d0bffae3-dc73-4597-a9b0-772765b789c1	Eco Tech	company
57b9fe3a-2270-4d36-afaf-503883fafcdb	system	\N	\N	Doanh nghiệp đăng tin tuyển dụng mới: Test Final	Doanh nghiệp "Eco Tech" đã tạo tin tuyển dụng "Test Final" đang chờ admin duyệt.	sent	2026-05-17 11:12:19.934	{"companyId": "d0bffae3-dc73-4597-a9b0-772765b789c1", "positionId": "2c8e3c68-fcea-4e95-9a80-22a051ad24eb", "positionTitle": "Test Final"}	d0bffae3-dc73-4597-a9b0-772765b789c1	Eco Tech	company
418ebea5-be21-4e88-a6c1-332e3b707c02	system	\N	\N	Admin duyệt tin tuyển dụng: Test Final	Admin "User Test" đã phê duyệt tin tuyển dụng "Test Final".	sent	2026-05-17 11:13:17.677	{"positionId": "2c8e3c68-fcea-4e95-9a80-22a051ad24eb", "approvalResult": "approved"}	e1e773b8-ea93-4495-a2f5-a76db55088de	User Test	admin
99c628ca-560b-4391-8d5b-d1ca251c01f2	system	\N	\N	Sinh viên nộp đơn ứng tuyển: Test Final	Sinh viên "Nguyễn Trọng Thái" đã nộp đơn ứng tuyển cho vị trí "Test Final".	sent	2026-05-17 11:13:41.972	{"studentId": "86fd7931-5e1b-4010-a19d-dce3d3ea5b9a", "positionId": "2c8e3c68-fcea-4e95-9a80-22a051ad24eb", "applicationId": "358453b5-7493-44db-a8ce-fe1907cb29fd"}	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	Nguyễn Trọng Thái	student
6e441922-d204-4cfc-865c-53827cb902fb	system	\N	\N	Admin duyệt tin tuyển dụng: Test Final	Admin "Đỗ Nguyên Anh Vũ" đã phê duyệt tin tuyển dụng "Test Final".	sent	2026-05-17 11:14:33.246	{"comment": "", "positionId": "2c8e3c68-fcea-4e95-9a80-22a051ad24eb", "approvalResult": "approved"}	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Đỗ Nguyên Anh Vũ	lecturer
745b15ca-977f-4ffb-8b9e-413ea3ac6840	system	\N	\N	Phê duyệt đơn ứng tuyển: Test Final	Đỗ Nguyên Anh Vũ đã phê duyệt đơn ứng tuyển của sinh viên "Nguyễn Trọng Thái" cho vị trí "Test Final".	sent	2026-05-17 11:14:33.258	{"comment": "", "studentId": "86fd7931-5e1b-4010-a19d-dce3d3ea5b9a", "applicationId": "358453b5-7493-44db-a8ce-fe1907cb29fd", "approvalResult": "approved"}	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Đỗ Nguyên Anh Vũ	lecturer
cd9dd192-a27f-45e6-950c-92509606cf7f	system	\N	\N	Doanh nghiệp đăng tin tuyển dụng mới: Test 5	Doanh nghiệp "Eco Tech" đã tạo tin tuyển dụng "Test 5" đang chờ admin duyệt.	sent	2026-05-17 11:19:42.601	{"companyId": "d0bffae3-dc73-4597-a9b0-772765b789c1", "positionId": "93bd341a-96ac-4149-a152-f7989ef272be", "positionTitle": "Test 5"}	d0bffae3-dc73-4597-a9b0-772765b789c1	Eco Tech	company
4be71760-e6b1-4c92-89c2-376d4cc4bee5	system	\N	\N	Admin duyệt tin tuyển dụng: Test 5	Admin "User Test" đã phê duyệt tin tuyển dụng "Test 5".	sent	2026-05-17 11:20:43.341	{"positionId": "93bd341a-96ac-4149-a152-f7989ef272be", "approvalResult": "approved"}	e1e773b8-ea93-4495-a2f5-a76db55088de	User Test	admin
25669811-c222-477e-970b-48b0b1f31da4	system	\N	\N	Sinh viên nộp đơn ứng tuyển: Test 5	Sinh viên "Nguyễn Trọng Thái" đã nộp đơn ứng tuyển cho vị trí "Test 5".	sent	2026-05-17 11:21:05.707	{"studentId": "86fd7931-5e1b-4010-a19d-dce3d3ea5b9a", "positionId": "93bd341a-96ac-4149-a152-f7989ef272be", "applicationId": "1571bb21-6356-43fe-b0d0-3727a38032a0"}	86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	Nguyễn Trọng Thái	student
0dc9775e-7b48-4937-858d-0e78531047d1	system	\N	\N	Admin duyệt tin tuyển dụng: Test 5	Admin "Đỗ Nguyên Anh Vũ" đã phê duyệt tin tuyển dụng "Test 5".	sent	2026-05-17 11:21:50.239	{"comment": "", "positionId": "93bd341a-96ac-4149-a152-f7989ef272be", "approvalResult": "approved"}	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Đỗ Nguyên Anh Vũ	lecturer
4adc5557-c706-46a4-9672-46c0ea00defb	system	\N	\N	Phê duyệt đơn ứng tuyển: Test 5	Đỗ Nguyên Anh Vũ đã phê duyệt đơn ứng tuyển của sinh viên "Nguyễn Trọng Thái" cho vị trí "Test 5".	sent	2026-05-17 11:21:50.255	{"comment": "", "studentId": "86fd7931-5e1b-4010-a19d-dce3d3ea5b9a", "applicationId": "1571bb21-6356-43fe-b0d0-3727a38032a0", "approvalResult": "approved"}	4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Đỗ Nguyên Anh Vũ	lecturer
3d390838-1a1d-4e03-89e0-12fc07e53ff4	system	\N	\N	Cập nhật trạng thái đơn: Test 5	"Eco Tech" (company) đã cập nhật trạng thái đơn ứng tuyển của "Nguyễn Trọng Thái" thành "department_approved".	sent	2026-05-17 11:22:12.535	{"newStatus": "department_approved", "applicationId": "1571bb21-6356-43fe-b0d0-3727a38032a0"}	d0bffae3-dc73-4597-a9b0-772765b789c1	Eco Tech	company
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role, avatar, phone, department, status, created_at, updated_at) FROM stdin;
0fccb4c6-b998-4f6b-80c6-c37b63129f87	Test User	test_1778604992@example.com	$2b$10$TIyz1BZtdzReuBmUdpRQMuVCoqIOb49nIuOLm5hw3AL.8GD8KTgby	student	\N	0123456789	IT	active	2026-05-12 16:56:32.205	2026-05-12 16:56:32.205
e1e773b8-ea93-4495-a2f5-a76db55088de	User Test	user_test@gmail.com	$2b$10$XG3sRomY0gDlpAmF90g7IOk2TEencYofx.10ihGcmdgzrDIgLxk3O	admin	\N	0123456789	Computer Science	active	2026-05-12 17:15:36.482	2026-05-12 17:15:36.482
931bc777-ecf2-4c01-b233-6cdf8fd7072f	Lê Thị Hoài Linh	hoailinhle@gmail.com	$2b$10$Aijmrnt9SX/VIfol8E74meqGH6ze8BN.Q0e0l0BB5IWH2RKA5DOnO	student	\N	09812432	Khoa CNTT	active	2026-05-13 03:10:00.385	2026-05-13 03:10:00.385
ac1a8b3d-6bf8-4511-bc81-64f4514f764e	Trần Văn Dũng	teacher_test@gmail.com	$2b$10$d5GDC2zepcB2xCVnb/xgtORa/IUoqykaCHaTRyNMXZSGvUBnWR2Ka	lecturer	\N	\N	Khoa CNTT	active	2026-05-13 09:45:26.383	2026-05-13 09:45:26.383
e8a477be-5a2e-4555-9932-a6971b9ecfde	Nguyen Van B	user2@example.com	$2b$10$CfvVCgcACsGQvY8xTgVQ0uNIiO9EXNfYrCYsT5JSESKfDbrA4/lKi	admin	\N	0123456789	Computer Science	active	2026-05-12 17:10:20.091	2026-05-13 14:15:51.526
d0bffae3-dc73-4597-a9b0-772765b789c1	Eco Tech	ecotech@gmail.com	$2b$10$P0C7YPnmp/ipZ2Gpt382hOHz/f86reXFX8sOJzkiTRGFJPJoefGTK	company	\N	098812432	Computer Science	active	2026-05-14 06:30:47.093	2026-05-14 06:30:47.093
b70e6f45-fd81-4d09-ba88-ce31c0532f32	Đào Ngọc Thông	ngocthongdev.pka@gmail.com	$2b$10$E4zv3ZXYMJUGfQEi7bOok.9ZVE1YTqM7mkn60ZGtDCm9IXKwguWfu	student	\N	0987649983	Khoa CNTT	active	2026-05-12 17:16:16.21	2026-05-16 10:13:13.433
4096b71a-d1f1-4f8a-89bb-27fc67b3a99f	Đỗ Nguyên Anh Vũ	anhvu@gmail.com	$2b$10$q1d/OqNBgjhJc6IrOs3V6uVeFG6LxI464GdAzBxhJTq/6s5u3USH2	lecturer	\N	0988762314	Computer Science	active	2026-05-16 10:15:18.189	2026-05-16 10:15:18.189
20d53eef-7afc-4ef9-b0f8-a217a3ebc40f	Mai Thuý Nga	nga@gmail.com	$2b$10$2zW0.KPgERRExXyAy1J9Ne/r3UtRhiO0tQ9pCR4Va8kXqhfWZfUCG	student	\N	021345324	Computer Science	active	2026-05-16 11:09:39.849	2026-05-16 11:16:21.529
bbc8d777-076b-4649-9d25-c23402004c2b	Test Company	testcompany@test.com	$2b$10$I5LMvfgI7UnsBnWGKKlvSe9TAbpbZAUbF1Hvjs0i/.D1Q963h5dgq	company	\N	0901234567	IT	active	2026-05-17 09:22:57.355	2026-05-17 09:22:57.355
4cebcfa1-055a-4f00-b33b-eb85fbda1db9	Test Admin	testadmin@test.com	$2b$10$P6YADGtuDrVLzzIe4sIH6.m/pmf/N7cGrUskMmXCOVgP1m/7k2eKy	admin	\N	0901234567	Admin	active	2026-05-17 09:23:16.347	2026-05-17 09:23:16.347
86fd7931-5e1b-4010-a19d-dce3d3ea5b9a	Nguyễn Trọng Thái	trongthai@gmail.com	$2b$10$y0bLZEqb5iH2R7wxmMMfreAQtM74wUpKPslwjROQ7xJgLRiIsBh1G	student	\N	082145234	Khoa CNTT	active	2026-05-17 11:04:56.89	2026-05-17 11:04:56.89
\.


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: approval_items approval_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_items
    ADD CONSTRAINT approval_items_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: evaluations evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_pkey PRIMARY KEY (id);


--
-- Name: log_entries log_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_entries
    ADD CONSTRAINT log_entries_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: applications_position_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX applications_position_id_idx ON public.applications USING btree (position_id);


--
-- Name: applications_position_id_student_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX applications_position_id_student_id_key ON public.applications USING btree (position_id, student_id);


--
-- Name: applications_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX applications_status_idx ON public.applications USING btree (status);


--
-- Name: applications_student_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX applications_student_id_idx ON public.applications USING btree (student_id);


--
-- Name: approval_items_application_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX approval_items_application_id_idx ON public.approval_items USING btree (application_id);


--
-- Name: approval_items_level_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX approval_items_level_idx ON public.approval_items USING btree (level);


--
-- Name: approval_items_position_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX approval_items_position_id_idx ON public.approval_items USING btree (position_id);


--
-- Name: approval_items_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX approval_items_status_idx ON public.approval_items USING btree (status);


--
-- Name: approval_items_student_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX approval_items_student_id_idx ON public.approval_items USING btree (student_id);


--
-- Name: documents_application_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documents_application_id_idx ON public.documents USING btree (application_id);


--
-- Name: documents_document_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documents_document_type_idx ON public.documents USING btree (document_type);


--
-- Name: documents_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documents_user_id_idx ON public.documents USING btree (user_id);


--
-- Name: evaluations_evaluation_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX evaluations_evaluation_type_idx ON public.evaluations USING btree (evaluation_type);


--
-- Name: evaluations_evaluator_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX evaluations_evaluator_id_idx ON public.evaluations USING btree (evaluator_id);


--
-- Name: evaluations_student_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX evaluations_student_id_idx ON public.evaluations USING btree (student_id);


--
-- Name: log_entries_student_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX log_entries_student_id_idx ON public.log_entries USING btree (student_id);


--
-- Name: log_entries_student_id_week_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX log_entries_student_id_week_number_key ON public.log_entries USING btree (student_id, week_number);


--
-- Name: notifications_is_read_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_is_read_idx ON public.notifications USING btree (is_read);


--
-- Name: notifications_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_user_id_idx ON public.notifications USING btree (user_id);


--
-- Name: positions_company_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX positions_company_id_idx ON public.positions USING btree (company_id);


--
-- Name: positions_field_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX positions_field_idx ON public.positions USING btree (field);


--
-- Name: positions_location_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX positions_location_idx ON public.positions USING btree (location);


--
-- Name: positions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX positions_status_idx ON public.positions USING btree (status);


--
-- Name: refresh_tokens_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_token_idx ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_user_id_idx ON public.refresh_tokens USING btree (user_id);


--
-- Name: student_profiles_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_profiles_user_id_idx ON public.student_profiles USING btree (user_id);


--
-- Name: student_profiles_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX student_profiles_user_id_key ON public.student_profiles USING btree (user_id);


--
-- Name: system_logs_actor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX system_logs_actor_id_idx ON public.system_logs USING btree (actor_id);


--
-- Name: system_logs_log_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX system_logs_log_type_idx ON public.system_logs USING btree (log_type);


--
-- Name: system_logs_recipient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX system_logs_recipient_id_idx ON public.system_logs USING btree (recipient_id);


--
-- Name: system_logs_sent_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX system_logs_sent_at_idx ON public.system_logs USING btree (sent_at);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: users_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_status_idx ON public.users USING btree (status);


--
-- Name: applications applications_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: applications applications_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: approval_items approval_items_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_items
    ADD CONSTRAINT approval_items_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: approval_items approval_items_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_items
    ADD CONSTRAINT approval_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: approval_items approval_items_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_items
    ADD CONSTRAINT approval_items_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: approval_items approval_items_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_items
    ADD CONSTRAINT approval_items_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: approval_items approval_items_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_items
    ADD CONSTRAINT approval_items_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: documents documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: evaluations evaluations_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: evaluations evaluations_evaluator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_evaluator_id_fkey FOREIGN KEY (evaluator_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: evaluations evaluations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: log_entries log_entries_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_entries
    ADD CONSTRAINT log_entries_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: positions positions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict tNyghFZ1V7yuwxzVvGeBacdFIL4UVbFH14aJkDDJWJqSnZcELRL2KM0LrqC0rLw

