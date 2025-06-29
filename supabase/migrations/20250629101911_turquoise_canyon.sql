/*
  # Fix vote count update triggers

  1. Changes
    - Update the update_proposal_vote_counts function to handle all vote types
    - Ensure yes/no/like votes are properly counted
    
  2. Security
    - No changes to RLS policies needed
    - Maintains existing table structure and relationships
*/

-- Update the function to handle all vote types
CREATE OR REPLACE FUNCTION update_proposal_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the proposal's vote counts
  UPDATE proposals 
  SET 
    votes_up = (
      SELECT COUNT(*) 
      FROM proposal_votes 
      WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id) 
      AND vote_type = 'up'
    ),
    votes_down = (
      SELECT COUNT(*) 
      FROM proposal_votes 
      WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id) 
      AND vote_type = 'down'
    ),
    votes_yes = (
      SELECT COUNT(*) 
      FROM proposal_votes 
      WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id) 
      AND vote_type = 'yes'
    ),
    votes_no = (
      SELECT COUNT(*) 
      FROM proposal_votes 
      WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id) 
      AND vote_type = 'no'
    ),
    likes = (
      SELECT COUNT(*) 
      FROM proposal_votes 
      WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id) 
      AND vote_type = 'like'
    )
  WHERE id = COALESCE(NEW.proposal_id, OLD.proposal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Make sure triggers are properly set up
DROP TRIGGER IF EXISTS update_vote_counts_on_insert ON proposal_votes;
CREATE TRIGGER update_vote_counts_on_insert
  AFTER INSERT ON proposal_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_vote_counts();

DROP TRIGGER IF EXISTS update_vote_counts_on_update ON proposal_votes;
CREATE TRIGGER update_vote_counts_on_update
  AFTER UPDATE ON proposal_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_vote_counts();

DROP TRIGGER IF EXISTS update_vote_counts_on_delete ON proposal_votes;
CREATE TRIGGER update_vote_counts_on_delete
  AFTER DELETE ON proposal_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_vote_counts();