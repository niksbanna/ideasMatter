/*
  # Add user_id column to proposal_comments table

  1. Schema Changes
    - Add `user_id` column to `proposal_comments` table
    - Set up foreign key constraint to reference auth.users
    - Add index for better query performance
    - Update RLS policies to use user_id for authorization

  2. Security
    - Update existing RLS policies to work with user_id
    - Add policy for users to delete their own comments
    - Add policy for users to update their own comments

  This migration adds the missing user_id column that the application code expects.
*/

-- Add user_id column to proposal_comments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposal_comments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE proposal_comments ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_proposal_comments_user_id ON proposal_comments(user_id);

-- Update RLS policies to work with user_id
DROP POLICY IF EXISTS "Users can delete their own comments" ON proposal_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON proposal_comments;

-- Add policy for users to delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON proposal_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add policy for users to update their own comments
CREATE POLICY "Users can update their own comments"
  ON proposal_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);