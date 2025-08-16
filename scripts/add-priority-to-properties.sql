-- Add priority column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT NULL;

-- Create an index for better performance when sorting by priority
CREATE INDEX IF NOT EXISTS idx_properties_priority ON properties(priority);

-- Update existing featured properties with initial priorities
-- This gives them sequential priorities starting from 1
WITH featured_properties AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
  FROM properties
  WHERE featured = true
)
UPDATE properties
SET priority = fp.row_num
FROM featured_properties fp
WHERE properties.id = fp.id;