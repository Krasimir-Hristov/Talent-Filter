-- ==========================================
-- TALENTFILTER MASTER SCHEMA
-- ==========================================

-- 1. CLEANUP (Optional: Only uncomment these if you need to wipe your DB and start over)
-- ==========================================
-- DROP TABLE IF EXISTS interviews, candidates, questions, jobs, profiles CASCADE;

-- 2. TABLE DEFINITIONS
-- ==========================================

-- PROFILES: Linked to Supabase Auth
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'recruiter' CHECK (role IN ('recruiter', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOBS: Created by recruiters
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUESTIONS: Specific criteria for each job
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  ideal_answer TEXT NOT NULL,
  time_limit INTEGER DEFAULT 180, -- Seconds
  weight INTEGER DEFAULT 1 CHECK (weight >= 0 AND weight <= 10),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CANDIDATES: People applying via public link
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INTERVIEWS: Results and AI analysis
CREATE TABLE IF NOT EXISTS interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  ai_summary TEXT,
  flags JSONB DEFAULT '{"tab_switches": 0, "copy_paste_attempts": 0}'::jsonb,
  status TEXT DEFAULT 'started' CHECK (status IN ('started', 'completed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 3. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- RECRUITER POLICIES (Full control over their OWN data)
CREATE POLICY "Recruiters manage own profile" ON profiles FOR ALL TO authenticated USING (auth.uid() = id);
CREATE POLICY "Recruiters manage own jobs" ON jobs FOR ALL TO authenticated USING (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters manage own questions" ON questions FOR ALL TO authenticated 
  USING (job_id IN (SELECT id FROM jobs WHERE recruiter_id = auth.uid()));

-- RECRUITER VIEWING RESULTS (Isolation: Can only see candidates for their own jobs)
CREATE POLICY "Recruiters view own candidates" ON candidates FOR SELECT TO authenticated 
  USING (id IN (SELECT candidate_id FROM interviews WHERE job_id IN (SELECT id FROM jobs WHERE recruiter_id = auth.uid())));
CREATE POLICY "Recruiters view own interviews" ON interviews FOR SELECT TO authenticated 
  USING (job_id IN (SELECT id FROM jobs WHERE recruiter_id = auth.uid()));

-- CANDIDATE POLICIES (Public access to published items)
CREATE POLICY "Public view published jobs" ON jobs FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Public view questions" ON questions FOR SELECT TO anon USING (true);
CREATE POLICY "Public submit candidate data" ON candidates FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public start/update interview" ON interviews FOR ALL TO anon USING (true) WITH CHECK (true);

-- 4. AUTOMATION (Trigger for new users)
-- ==========================================

-- Automatically create a profile row in the PUBLIC schema when a user joins the AUTH schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger already exists to avoid errors on reapplying
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;
