-- ==========================================
-- PHASE 4.1: Candidate Experience Database Schema
-- Created: 2026-02-08
-- ==========================================

-- 1. CLEANUP OLD TABLES
DROP TABLE IF EXISTS interview_answers CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;

-- 2. CREATE NEW ENUMS
DO $$ BEGIN
    CREATE TYPE interview_status AS ENUM ('in_progress', 'completed', 'abandoned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. CREATE CANDIDATES TABLE
CREATE TABLE candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_candidate_email_per_job UNIQUE (job_id, email),
  CONSTRAINT unique_candidate_phone_per_job UNIQUE (job_id, phone)
);

-- 4. CREATE INTERVIEWS TABLE (Session Tracking)
CREATE TABLE interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  status interview_status DEFAULT 'in_progress',
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);

-- 5. CREATE INTERVIEW ANSWERS TABLE (Telemetry)
CREATE TABLE interview_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE NOT NULL,
  question_id UUID NOT NULL, 
  answer_text TEXT NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  paste_count INTEGER DEFAULT 0,
  tab_switches INTEGER DEFAULT 0,
  off_screen_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(interview_id, question_id)
);

-- 6. RLS POLICIES

-- Enable RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_answers ENABLE ROW LEVEL SECURITY;

-- RECRUITER POLICIES (Full control over their OWN data)
CREATE POLICY "Recruiters access own candidates" ON candidates 
    FOR SELECT TO authenticated 
    USING (job_id IN (SELECT id FROM jobs WHERE recruiter_id = auth.uid()));

CREATE POLICY "Recruiters access own interviews" ON interviews 
    FOR SELECT TO authenticated 
    USING (job_id IN (SELECT id FROM jobs WHERE recruiter_id = auth.uid()));

CREATE POLICY "Recruiters access own answers" ON interview_answers 
    FOR SELECT TO authenticated 
    USING (interview_id IN (SELECT id FROM interviews WHERE job_id IN (SELECT id FROM jobs WHERE recruiter_id = auth.uid())));

-- CANDIDATE POLICIES (Public access for application flow)
-- Candidates (Anonymous) can create themselves
CREATE POLICY "Public apply to job" ON candidates 
    FOR INSERT TO anon 
    WITH CHECK (true);

-- Candidates can manage their own interview session (Need a way to secure this later, e.g. JWT or session ID)
-- For now allowing full access to anon for MVP flow, will refine in 4.3 with session logic
CREATE POLICY "Public manage own interview" ON interviews 
    FOR ALL TO anon 
    USING (true) 
    WITH CHECK (true);

-- Candidates submit answers
CREATE POLICY "Public submit answer" ON interview_answers 
    FOR INSERT TO anon 
    WITH CHECK (true);
