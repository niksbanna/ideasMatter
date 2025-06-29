/*
  # Create blockchain_votes table for Algorand integration

  1. New Tables
    - `blockchain_votes`
      - `id` (uuid, primary key)
      - `proposal_id` (uuid, foreign key to proposals)
      - `user_id` (uuid, foreign key to auth.users)
      - `vote_type` (text, 'up', 'down', 'yes', 'no', 'like')
      - `blockchain_tx_id` (text, Algorand transaction ID)
      - `blockchain_confirmed_round` (integer, Algorand confirmation round)
      - `blockchain_timestamp` (bigint, timestamp of blockchain confirmation)
      - `blockchain_status` (text, 'pending', 'confirmed', 'failed')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `blockchain_votes` table
    - Add policies for authenticated users to manage their votes
    - Add policies for public to view blockchain vote records
*/

-- Create blockchain_votes table
CREATE TABLE IF NOT EXISTS blockchain_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type = ANY (ARRAY['up'::text, 'down'::text, 'yes'::text, 'no'::text, 'like'::text])),
  blockchain_tx_id text,
  blockchain_confirmed_round integer,
  blockchain_timestamp bigint,
  blockchain_status text NOT NULL DEFAULT 'pending' CHECK (blockchain_status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'failed'::text])),
  created_at timestamptz DEFAULT now(),
  UNIQUE(proposal_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE blockchain_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for blockchain_votes
CREATE POLICY "Users can view their own blockchain votes"
  ON blockchain_votes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view confirmed blockchain votes"
  ON blockchain_votes
  FOR SELECT
  TO public
  USING (blockchain_status = 'confirmed');

CREATE POLICY "Users can insert their own blockchain votes"
  ON blockchain_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blockchain votes"
  ON blockchain_votes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blockchain votes"
  ON blockchain_votes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blockchain_votes_proposal_id ON blockchain_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_votes_user_id ON blockchain_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_votes_tx_id ON blockchain_votes(blockchain_tx_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_votes_status ON blockchain_votes(blockchain_status);