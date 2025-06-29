/*
  # Add validation fields to proposals table

  1. Changes
    - Add validation_score column to store AI validation score (0-100)
    - Add validation_reasons column to store validation feedback
    - Update status constraint to include 'rejected' status
    - Add index for better performance on status queries

  2. Security
    - Maintain existing RLS policies
    - No changes to permissions
*/

-- Add validation fields to proposals table
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS validation_score integer,
ADD COLUMN IF NOT EXISTS validation_reasons text[];

-- Update status constraint to include 'rejected'
ALTER TABLE proposals 
DROP CONSTRAINT IF EXISTS proposals_status_check;

ALTER TABLE proposals 
ADD CONSTRAINT proposals_status_check 
CHECK (status IN ('draft', 'active', 'completed', 'rejected'));

-- Add index for status queries (for better performance when filtering by status)
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

-- Add index for validation score (for potential future sorting/filtering)
CREATE INDEX IF NOT EXISTS idx_proposals_validation_score ON proposals(validation_score);

-- Add comment to document the validation fields
COMMENT ON COLUMN proposals.validation_score IS 'AI validation score from 0-100, higher scores indicate better content quality';
COMMENT ON COLUMN proposals.validation_reasons IS 'Array of validation feedback reasons from AI content review';