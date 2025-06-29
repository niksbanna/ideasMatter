/*
  # Create interaction tables for proposals

  1. New Tables
    - `proposal_votes`
      - `id` (uuid, primary key)
      - `proposal_id` (uuid, foreign key to proposals)
      - `user_id` (text, user identifier)
      - `vote_type` (text, 'up' or 'down')
      - `created_at` (timestamp)
    - `proposal_comments`
      - `id` (uuid, primary key)
      - `proposal_id` (uuid, foreign key to proposals)
      - `user_name` (text)
      - `content` (text)
      - `created_at` (timestamp)
    - `proposal_saves`
      - `id` (uuid, primary key)
      - `proposal_id` (uuid, foreign key to proposals)
      - `user_id` (text, user identifier)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since we don't have auth yet)
*/

-- Create proposal_votes table
CREATE TABLE IF NOT EXISTS proposal_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(proposal_id, user_id)
);

-- Create proposal_comments table
CREATE TABLE IF NOT EXISTS proposal_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create proposal_saves table
CREATE TABLE IF NOT EXISTS proposal_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(proposal_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE proposal_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_saves ENABLE ROW LEVEL SECURITY;

-- Create policies for proposal_votes
CREATE POLICY "Anyone can view votes"
  ON proposal_votes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can submit votes"
  ON proposal_votes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own votes"
  ON proposal_votes
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own votes"
  ON proposal_votes
  FOR DELETE
  TO public
  USING (true);

-- Create policies for proposal_comments
CREATE POLICY "Anyone can view comments"
  ON proposal_comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can submit comments"
  ON proposal_comments
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for proposal_saves
CREATE POLICY "Anyone can view saves"
  ON proposal_saves
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can save proposals"
  ON proposal_saves
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can delete their own saves"
  ON proposal_saves
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_proposal_votes_proposal_id ON proposal_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_votes_user_id ON proposal_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_proposal_comments_proposal_id ON proposal_comments(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_saves_proposal_id ON proposal_saves(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_saves_user_id ON proposal_saves(user_id);

-- Create function to update proposal vote counts
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
    )
  WHERE id = COALESCE(NEW.proposal_id, OLD.proposal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers to automatically update vote counts
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