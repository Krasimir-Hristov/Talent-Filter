-- Update job statuses from published/draft to active/closed
-- This migration simplifies the status system to only two states

-- 1. Update existing 'published' and 'draft' jobs to 'active'
UPDATE jobs 
SET status = 'active' 
WHERE status IN ('published', 'draft');

-- 2. Update the CHECK constraint to only allow 'active' and 'closed'
DO $$ 
BEGIN
  -- Drop the old constraint if it exists
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_status_check') THEN
    ALTER TABLE jobs DROP CONSTRAINT jobs_status_check;
  END IF;
  
  -- Add the new constraint with only 'active' and 'closed'
  ALTER TABLE jobs ADD CONSTRAINT jobs_status_check CHECK (status IN ('active', 'closed'));
END $$;

-- 3. Update the default value to 'active'
ALTER TABLE jobs ALTER COLUMN status SET DEFAULT 'active';

-- 4. Update RLS policy to use 'active' instead of 'published'
DROP POLICY IF EXISTS "Public view published jobs" ON jobs;
CREATE POLICY "Public view active jobs" ON jobs 
  FOR SELECT 
  TO anon 
  USING (status = 'active');
