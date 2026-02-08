-- Comprehensive database update script
-- Run this in Supabase SQL Editor

-- 1. Add 'notes' column to jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Add 'order_index' column to questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 3. Update 'weight' constraint to allow values up to 10
-- We have to drop the old constraint first, then add the new one.
-- Note: Constraint names in Supabase/Postgres are usually auto-generated like 'questions_weight_check'.
-- Finding the name: SELECT conname FROM pg_constraint WHERE conrelid = 'questions'::regclass;
-- Assuming standard naming or recreating:

DO $$ 
BEGIN
  -- Attempt to drop the likely existing constraint
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'questions_weight_check') THEN
    ALTER TABLE questions DROP CONSTRAINT questions_weight_check;
  END IF;
  
  -- Add the new constraint (if not exists logic handled by dropping above)
  ALTER TABLE questions ADD CONSTRAINT questions_weight_check CHECK (weight >= 0 AND weight <= 10);
END $$;
