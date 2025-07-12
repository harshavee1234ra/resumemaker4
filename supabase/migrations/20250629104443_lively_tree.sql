/*
  # Add is_published column to resumes table

  1. Changes
    - Add `is_published` column to `resumes` table if it doesn't exist
    - Set default value to `false`
    - Make it non-nullable with a default value

  2. Notes
    - Uses conditional logic to only add the column if it doesn't already exist
    - This ensures the migration is safe to run multiple times
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resumes' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE resumes ADD COLUMN is_published boolean DEFAULT false NOT NULL;
  END IF;
END $$;