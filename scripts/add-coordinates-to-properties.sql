-- Add latitude and longitude columns to properties table
-- This migration adds coordinate fields to support map location selection

-- Add latitude column (decimal with 8 digits, 6 after decimal for precision)
ALTER TABLE properties
ADD COLUMN latitude DECIMAL(10,8) NULL;

-- Add longitude column (decimal with 11 digits, 8 after decimal for precision)
ALTER TABLE properties
ADD COLUMN longitude DECIMAL(11,8) NULL;

-- Add comment to document the columns
COMMENT ON COLUMN properties.latitude IS 'Property latitude coordinate for map display';
COMMENT ON COLUMN properties.longitude IS 'Property longitude coordinate for map display';

-- Create index for coordinate-based queries (future use for radius searches)
CREATE INDEX idx_properties_coordinates ON properties (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Optional: Add constraint to ensure coordinates are within Argentina bounds
-- Argentina bounds: latitude between -55.061314 and -21.781277, longitude between -73.560562 and -53.591835
ALTER TABLE properties
ADD CONSTRAINT chk_argentina_latitude
CHECK (latitude IS NULL OR (latitude >= -55.061314 AND latitude <= -21.781277));

ALTER TABLE properties
ADD CONSTRAINT chk_argentina_longitude
CHECK (longitude IS NULL OR (longitude >= -73.560562 AND longitude <= -53.591835));