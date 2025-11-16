-- =====================================================================================
-- FIX ANALYTICS NULLABLE FIELDS MIGRATION
-- =====================================================================================
-- Hace que page_url sea opcional (nullable) en analytics_property_views
-- Fecha: 2025-10-01
-- Razón: El tracking debe funcionar incluso sin page_url
-- =====================================================================================

-- Modificar columna page_url para permitir NULL
ALTER TABLE analytics_property_views
ALTER COLUMN page_url DROP NOT NULL;

-- Verificar el cambio
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'analytics_property_views'
    AND column_name = 'page_url';
