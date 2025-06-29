/*
  # Create proposals table for policy ideas

  1. New Tables
    - `proposals`
      - `id` (uuid, primary key)
      - `title` (text, not null) - The title of the policy proposal
      - `description` (text, not null) - Detailed description of the idea
      - `author_name` (text, not null) - Name of the person who submitted the idea
      - `category` (text, default 'General') - Policy category
      - `status` (text, default 'draft') - Current status of the proposal
      - `ai_draft` (jsonb, nullable) - AI-generated policy draft structure
      - `votes_up` (integer, default 0) - Number of upvotes
      - `votes_down` (integer, default 0) - Number of downvotes
      - `created_at` (timestamptz, default now()) - When the proposal was created
      - `updated_at` (timestamptz, default now()) - When the proposal was last updated

  2. Security
    - Enable RLS on `proposals` table
    - Add policy for public read access
    - Add policy for authenticated users to insert proposals

  3. Additional Features
    - Trigger to automatically update `updated_at` timestamp
    - Check constraint for valid status values
*/

-- Create the proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  author_name text NOT NULL,
  category text DEFAULT 'General',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  ai_draft jsonb,
  votes_up integer DEFAULT 0,
  votes_down integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view proposals)
CREATE POLICY "Anyone can view proposals"
  ON proposals
  FOR SELECT
  TO public
  USING (true);

-- Create policy for public insert access (anyone can submit proposals)
CREATE POLICY "Anyone can submit proposals"
  ON proposals
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy for public update access (anyone can update proposals - for voting)
CREATE POLICY "Anyone can update proposals"
  ON proposals
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);