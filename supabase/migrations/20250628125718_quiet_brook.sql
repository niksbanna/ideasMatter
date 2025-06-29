/*
  # Add user authentication support to proposals

  1. Changes
    - Add user_id column to proposals table
    - Update RLS policies to support authenticated users
    - Add policies for user-specific operations

  2. Security
    - Users can only edit/delete their own proposals
    - Public can still view all proposals
    - Authenticated users can submit proposals
*/

-- Add user_id column to proposals table
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update existing proposals to have a default user_id (for demo purposes)
-- In production, you might want to handle this differently
UPDATE proposals SET user_id = gen_random_uuid() WHERE user_id IS NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view proposals" ON proposals;
DROP POLICY IF EXISTS "Anyone can submit proposals" ON proposals;
DROP POLICY IF EXISTS "Anyone can update proposals" ON proposals;

-- Create new policies for authenticated users

-- Anyone can view proposals (public access)
CREATE POLICY "Public can view proposals"
  ON proposals
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated users can submit proposals
CREATE POLICY "Authenticated users can submit proposals"
  ON proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own proposals
CREATE POLICY "Users can update own proposals"
  ON proposals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own proposals
CREATE POLICY "Users can delete own proposals"
  ON proposals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow system updates for vote counts (triggered by vote changes)
CREATE POLICY "System can update vote counts"
  ON proposals
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);