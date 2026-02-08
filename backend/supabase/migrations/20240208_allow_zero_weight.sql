-- Migration to allow 0 weight for screening questions
-- Required for introductory questions or "Tell me about yourself" type items

DO $$ 
BEGIN
  -- 1. Update questions weight check
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'questions_weight_check') THEN
    ALTER TABLE questions DROP CONSTRAINT questions_weight_check;
  END IF;
  
  ALTER TABLE questions ADD CONSTRAINT questions_weight_check CHECK (weight >= 0 AND weight <= 10);

  -- 2. Update job status check to match schema.sql
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_status_check') THEN
    ALTER TABLE jobs DROP CONSTRAINT jobs_status_check;
  END IF;
  
  ALTER TABLE jobs ADD CONSTRAINT jobs_status_check CHECK (status IN ('active', 'closed', 'draft', 'published'));

END $$;
