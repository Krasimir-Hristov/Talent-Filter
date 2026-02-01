-- Add notes to jobs table if not exists
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add order_index to questions table if not exists
ALTER TABLE questions ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
