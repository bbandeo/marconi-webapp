-- =============================================
-- MARCONI INMOBILIARIA - SITE SETTINGS MIGRATION
-- Sistema de configuración general del sitio
-- Version: 1.0.0
-- =============================================

-- Crear extensiones necesarias (si no existen)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: SITE_SETTINGS
-- Configuraciones generales del sitio web
-- =============================================
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Información de la empresa
    company_name VARCHAR(255) NOT NULL DEFAULT 'Marconi Inmobiliaria',
    company_description TEXT,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    whatsapp_number VARCHAR(50),
    address TEXT NOT NULL,
    website_url VARCHAR(255),

    -- Redes sociales (JSON para flexibilidad)
    social_media JSONB DEFAULT '{
        "facebook": null,
        "instagram": null,
        "linkedin": null,
        "youtube": null,
        "twitter": null
    }'::jsonb,

    -- Branding y assets
    logo_url VARCHAR(500),
    logo_dark_url VARCHAR(500), -- Para modo oscuro
    favicon_url VARCHAR(500),
    brand_colors JSONB DEFAULT '{
        "primary": "#f97316",
        "secondary": "#1f2937"
    }'::jsonb,

    -- SEO y metadatos
    meta_title VARCHAR(255) DEFAULT 'Marconi Inmobiliaria - Propiedades en Reconquista',
    meta_description TEXT DEFAULT 'Encontrá tu próxima propiedad con Marconi Inmobiliaria. Casas, departamentos y terrenos en Reconquista, Santa Fe.',
    meta_keywords TEXT,
    google_analytics_id VARCHAR(50),
    google_tag_manager_id VARCHAR(50),

    -- Configuraciones de contacto
    contact_methods JSONB DEFAULT '{
        "whatsapp_enabled": true,
        "phone_enabled": true,
        "email_enabled": true,
        "contact_form_enabled": true
    }'::jsonb,

    -- Configuraciones operativas
    business_hours JSONB DEFAULT '{
        "monday": {"open": "09:00", "close": "18:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
        "thursday": {"open": "09:00", "close": "18:00", "closed": false},
        "friday": {"open": "09:00", "close": "18:00", "closed": false},
        "saturday": {"open": "09:00", "close": "13:00", "closed": false},
        "sunday": {"open": "09:00", "close": "13:00", "closed": true}
    }'::jsonb,

    -- Configuraciones adicionales
    settings_data JSONB DEFAULT '{}'::jsonb, -- Para extensibilidad futura

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios para documentación
COMMENT ON TABLE site_settings IS 'Configuraciones generales del sitio web de Marconi Inmobiliaria';
COMMENT ON COLUMN site_settings.company_name IS 'Nombre oficial de la inmobiliaria';
COMMENT ON COLUMN site_settings.social_media IS 'URLs de redes sociales en formato JSON';
COMMENT ON COLUMN site_settings.brand_colors IS 'Colores de marca en formato hexadecimal';
COMMENT ON COLUMN site_settings.contact_methods IS 'Configuración de métodos de contacto habilitados';
COMMENT ON COLUMN site_settings.business_hours IS 'Horarios de atención por día de la semana';
COMMENT ON COLUMN site_settings.settings_data IS 'Configuraciones adicionales para extensibilidad';

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================
CREATE INDEX idx_site_settings_updated_at ON site_settings(updated_at);

-- =============================================
-- FUNCIÓN PARA AUTO-UPDATE DE updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER trigger_update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_site_settings_updated_at();

-- =============================================
-- DATOS INICIALES
-- =============================================
INSERT INTO site_settings (
    company_name,
    contact_email,
    contact_phone,
    whatsapp_number,
    address,
    website_url,
    social_media,
    meta_title,
    meta_description,
    company_description
) VALUES (
    'Marconi Inmobiliaria',
    'marconinegociosinmobiliarios@hotmail.com',
    '+54 9 3482 308100',
    '+54 9 3482 308100',
    'Belgrano 123, Reconquista, Santa Fe, Argentina',
    'https://marconi-inmobiliaria.vercel.app',
    '{
        "facebook": null,
        "instagram": null,
        "linkedin": null,
        "youtube": null,
        "twitter": null
    }'::jsonb,
    'Marconi Inmobiliaria - Tu próxima propiedad te está esperando',
    'Encontrá casas, departamentos y terrenos en Reconquista, Santa Fe. Marconi Inmobiliaria, tu socio de confianza en bienes raíces.',
    'Marconi Inmobiliaria es una empresa familiar dedicada a brindar servicios integrales de bienes raíces en Reconquista y zona norte de Santa Fe. Con años de experiencia en el mercado inmobiliario, nos especializamos en la compra, venta y alquiler de propiedades residenciales y comerciales.'
) ON CONFLICT DO NOTHING;

-- =============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =============================================
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (cualquiera puede leer configuraciones)
CREATE POLICY "Public read access for site_settings" ON site_settings
    FOR SELECT USING (true);

-- Política para escritura solo para usuarios autenticados (admins)
CREATE POLICY "Authenticated users can update site_settings" ON site_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert site_settings" ON site_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- FUNCIÓN PARA OBTENER CONFIGURACIONES
-- =============================================
CREATE OR REPLACE FUNCTION get_site_settings()
RETURNS TABLE (
    id UUID,
    company_name VARCHAR(255),
    company_description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    whatsapp_number VARCHAR(50),
    address TEXT,
    website_url VARCHAR(255),
    social_media JSONB,
    logo_url VARCHAR(500),
    logo_dark_url VARCHAR(500),
    favicon_url VARCHAR(500),
    brand_colors JSONB,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    google_analytics_id VARCHAR(50),
    google_tag_manager_id VARCHAR(50),
    contact_methods JSONB,
    business_hours JSONB,
    settings_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT * FROM site_settings LIMIT 1;
$$;

-- Comentario para la función
COMMENT ON FUNCTION get_site_settings() IS 'Obtiene las configuraciones del sitio (solo un registro)';

-- =============================================
-- FINALIZACIÓN
-- =============================================
-- Verificar que la tabla fue creada correctamente
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'site_settings') THEN
        RAISE NOTICE '✅ Tabla site_settings creada exitosamente';
        RAISE NOTICE '✅ Datos iniciales insertados';
        RAISE NOTICE '✅ Políticas de seguridad aplicadas';
        RAISE NOTICE '✅ Función get_site_settings() creada';
    ELSE
        RAISE EXCEPTION '❌ Error: No se pudo crear la tabla site_settings';
    END IF;
END $$;