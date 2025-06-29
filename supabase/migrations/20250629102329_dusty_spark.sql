/*
  # Create vote counts update function

  1. Database Functions
    - `update_proposal_vote_counts()` - Trigger function to automatically update vote counts on proposals table
      - Updates votes_up, votes_down, votes_yes, votes_no, and likes columns
      - Triggered on INSERT, UPDATE, DELETE operations on proposal_votes table

  2. Purpose
    - Maintains accurate vote counts in the proposals table
    - Eliminates need for manual count calculations in application code
    - Ensures data consistency across vote operations
*/

CREATE OR REPLACE FUNCTION update_proposal_vote_counts() 
RETURNS TRIGGER AS $$
BEGIN
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
$$ LANGUAGE plpgsql;