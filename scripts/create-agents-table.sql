-- Migration script for creating agents table
-- This script creates the agents table for managing real estate agents in Marconi Inmobiliaria

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50),
  photo_url TEXT,
  photo_public_id VARCHAR(255),
  bio TEXT,
  specialty VARCHAR(255),
  years_of_experience INTEGER CHECK (years_of_experience IS NULL OR years_of_experience >= 0),
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on active for filtering active agents (email already has unique index)
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(active);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS agents_updated_at ON agents;

-- Create trigger to call the update function before any update
CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_agents_updated_at();

-- Add comments to table and columns for documentation
COMMENT ON TABLE agents IS 'Stores information about real estate agents for Marconi Inmobiliaria';
COMMENT ON COLUMN agents.id IS 'Unique identifier for the agent';
COMMENT ON COLUMN agents.name IS 'Full name of the agent';
COMMENT ON COLUMN agents.email IS 'Email address (unique)';
COMMENT ON COLUMN agents.phone IS 'Primary phone number';
COMMENT ON COLUMN agents.whatsapp IS 'WhatsApp number for direct contact';
COMMENT ON COLUMN agents.photo_url IS 'Cloudinary URL for agent photo';
COMMENT ON COLUMN agents.photo_public_id IS 'Cloudinary public ID for photo management';
COMMENT ON COLUMN agents.bio IS 'Biography or description of the agent';
COMMENT ON COLUMN agents.specialty IS 'Area of expertise (e.g., residential, commercial)';
COMMENT ON COLUMN agents.years_of_experience IS 'Years of experience in real estate';
COMMENT ON COLUMN agents.active IS 'Whether the agent is currently active (soft delete flag)';
COMMENT ON COLUMN agents.created_at IS 'Timestamp when the agent was created';
COMMENT ON COLUMN agents.updated_at IS 'Timestamp when the agent was last updated';
