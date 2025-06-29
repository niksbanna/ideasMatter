/*
  # Update vote type constraint for proposal_votes table

  1. Changes
    - Remove existing check constraint that only allows 'up' and 'down'
    - Add new check constraint that allows 'up', 'down', 'yes', 'no', and 'like'
    
  2. Security
    - No changes to RLS policies needed
    - Maintains existing table structure and relationships
*/

-- Remove the existing restrictive constraint
ALTER TABLE proposal_votes 
DROP CONSTRAINT IF EXISTS proposal_votes_vote_type_check;

-- Add new constraint that allows all vote types used by the application
ALTER TABLE proposal_votes 
ADD CONSTRAINT proposal_votes_vote_type_check 
CHECK (vote_type = ANY (ARRAY['up'::text, 'down'::text, 'yes'::text, 'no'::text, 'like'::text]));