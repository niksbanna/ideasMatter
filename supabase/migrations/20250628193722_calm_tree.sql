/*
  # Add missing columns to proposals table

  1. New Columns
    - `idea_type` (text) - Distinguishes between 'proposal' and 'poll' types
    - `votes_yes` (integer) - Count of yes votes for polls
    - `votes_no` (integer) - Count of no votes for polls  
    - `likes` (integer) - Count of likes for general engagement

  2. Updates
    - Add default values for all new columns
    - Add check constraint for idea_type values
    - Update existing records to have default values

  3. Notes
    - All columns are added safely with IF NOT EXISTS checks
    - Default values ensure existing data remains valid
    - New columns support the poll/proposal distinction in the UI
*/

-- Add idea_type column to distinguish between proposals and polls
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'idea_type'
  ) THEN
    ALTER TABLE proposals ADD COLUMN idea_type text NOT NULL DEFAULT 'poll';
  END IF;
END $$;

-- Add votes_yes column for poll voting
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'votes_yes'
  ) THEN
    ALTER TABLE proposals ADD COLUMN votes_yes integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add votes_no column for poll voting
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'votes_no'
  ) THEN
    ALTER TABLE proposals ADD COLUMN votes_no integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add likes column for general engagement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'likes'
  ) THEN
    ALTER TABLE proposals ADD COLUMN likes integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add check constraint for idea_type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'proposals_idea_type_check'
  ) THEN
    ALTER TABLE proposals ADD CONSTRAINT proposals_idea_type_check 
    CHECK (idea_type = ANY (ARRAY['proposal'::text, 'poll'::text]));
  END IF;
END $$;

-- Create indexes for the new columns to improve query performance
CREATE INDEX IF NOT EXISTS idx_proposals_idea_type ON proposals(idea_type);
CREATE INDEX IF NOT EXISTS idx_proposals_likes ON proposals(likes);