/*
  # Allow Anonymous Insert for Properties

  1. Changes
    - Drop the authenticated-only insert policy
    - Create new policy allowing anon inserts with marketer validation
  
  2. Security
    - Validates that marketer_id exists in marketers table
    - Prevents orphaned property records
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "Allow authenticated users to insert properties" ON properties;

-- Allow anon inserts with marketer validation
CREATE POLICY "Allow inserts with valid marketer"
  ON properties
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketers 
      WHERE id = marketer_id
    )
  );
