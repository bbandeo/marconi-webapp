-- Add new columns to leads table for MVP functionality
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS last_contact TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_action TEXT,
ADD COLUMN IF NOT EXISTS next_action_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 5 CHECK (score >= 1 AND score <= 10),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_next_action_date ON leads(next_action_date);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Update existing records to have default values
UPDATE leads 
SET 
  priority = 'medium',
  score = 5,
  updated_at = CURRENT_TIMESTAMP
WHERE priority IS NULL OR score IS NULL;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data for testing (optional)
-- INSERT INTO leads (name, email, phone, message, lead_source, status, priority, score, notes)
-- VALUES 
-- ('Juan Pérez', 'juan@email.com', '+54 9 3482 123456', 'Interesado en casa del centro', 'Website', 'new', 'high', 8, 'Cliente muy interesado, llamar mañana'),
-- ('María García', 'maria@email.com', '+54 9 3482 654321', 'Consulta sobre departamento', 'WhatsApp', 'contacted', 'medium', 6, 'Ya contactada, programar visita'),
-- ('Carlos López', 'carlos@email.com', '+54 9 3482 789012', 'Busca terreno para inversión', 'Instagram', 'qualified', 'high', 9, 'Inversor serio, tiene presupuesto confirmado');
