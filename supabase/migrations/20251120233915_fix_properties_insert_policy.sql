/*
  # Fix Properties Insert Policy

  1. Changes
    - Drop existing restrictive insert policy
    - Create new insert policy that allows authenticated users to insert properties
    - The policy will check that the marketer_id exists in the marketers table
  
  2. Security
    - Still maintains data integrity by validating marketer_id
    - Allows inserts from authenticated sessions
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "Marketers can insert own properties" ON properties;

-- Create new insert policy that works with our auth setup
CREATE POLICY "Allow authenticated users to insert properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketers 
      WHERE id = marketer_id
    )
  );
