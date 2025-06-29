/*
  # Add blockchain fields to proposals table

  1. Changes
    - Add blockchain_tx_id column to store transaction ID
    - Add blockchain_confirmed_round column to store confirmation round
    - Add blockchain_timestamp column to store timestamp
    - Add blockchain_status column to track status
    
  2. Security
    - Maintain existing RLS policies
    - No changes to permissions
*/

-- Add blockchain fields to proposals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'blockchain_tx_id'
  ) THEN
    ALTER TABLE proposals ADD COLUMN blockchain_tx_id text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'blockchain_confirmed_round'
  ) THEN
    ALTER TABLE proposals ADD COLUMN blockchain_confirmed_round integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'blockchain_timestamp'
  ) THEN
    ALTER TABLE proposals ADD COLUMN blockchain_timestamp bigint;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'blockchain_status'
  ) THEN
    ALTER TABLE proposals ADD COLUMN blockchain_status text DEFAULT 'pending';
  END IF;
END $$;

-- Add check constraint for blockchain_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'proposals_blockchain_status_check'
  ) THEN
    ALTER TABLE proposals ADD CONSTRAINT proposals_blockchain_status_check 
    CHECK (blockchain_status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'failed'::text]));
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_proposals_blockchain_tx_id ON proposals(blockchain_tx_id);
CREATE INDEX IF NOT EXISTS idx_proposals_blockchain_status ON proposals(blockchain_status);