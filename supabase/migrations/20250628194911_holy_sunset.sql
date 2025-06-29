/*
  # Create reports table for content moderation

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `idea_id` (uuid, foreign key to proposals)
      - `user_id` (uuid, foreign key to auth.users)
      - `report_text` (text, reason for reporting)
      - `status` (text, pending/reviewed/resolved)
      - `ai_decision` (text, BLOCK/ALLOW from AI moderation)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `reports` table
    - Add policies for authenticated users to submit reports
    - Add policies for viewing own reports
*/

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_text text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  ai_decision text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add check constraint for status
ALTER TABLE reports ADD CONSTRAINT reports_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text]));

-- Add check constraint for ai_decision
ALTER TABLE reports ADD CONSTRAINT reports_ai_decision_check 
CHECK (ai_decision = ANY (ARRAY['BLOCK'::text, 'ALLOW'::text]) OR ai_decision IS NULL);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can submit reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can update reports for moderation"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_idea_id ON reports(idea_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();