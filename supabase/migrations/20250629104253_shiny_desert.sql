/*
  # Add is_published column to resumes table

  1. Changes
    - Add `is_published` column to `resumes` table with boolean type and default false
    - This column will track whether a resume is published or in draft state

  2. Security
    - No changes to existing RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resumes' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE resumes ADD COLUMN is_published boolean DEFAULT false;
  END IF;
END $$;