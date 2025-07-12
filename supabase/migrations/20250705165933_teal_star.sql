/*
  # Add custom sections support to resumes

  1. Changes
    - Add `custom_sections` column to `resumes` table
    - This will store custom sections as JSONB data

  2. Structure
    - Each custom section will have: id, title, icon, items, order, visible
    - Each item will have: id, title, subtitle, date, location, description, link
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resumes' AND column_name = 'custom_sections'
  ) THEN
    ALTER TABLE resumes ADD COLUMN custom_sections jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;