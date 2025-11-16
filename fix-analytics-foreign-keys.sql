-- =====================================================================================
-- FIX PARA FOREIGN KEYS DE ANALYTICS
-- =====================================================================================
-- Este script corrige el problema de foreign keys entre analytics_sessions y las tablas relacionadas
-- El problema: las tablas hacen referencia a analytics_sessions(id) pero deberían apuntar a session_id
-- =====================================================================================

-- Paso 1: Eliminar los foreign key constraints existentes
ALTER TABLE analytics_property_views DROP CONSTRAINT IF EXISTS analytics_property_views_session_id_fkey;
ALTER TABLE analytics_user_interactions DROP CONSTRAINT IF EXISTS analytics_user_interactions_session_id_fkey;
ALTER TABLE analytics_lead_generation DROP CONSTRAINT IF EXISTS analytics_lead_generation_session_id_fkey;
ALTER TABLE analytics_campaign_attribution DROP CONSTRAINT IF EXISTS analytics_campaign_attribution_session_id_fkey;

-- Paso 2: Cambiar el tipo de las columnas session_id de UUID a VARCHAR(255) para que coincidan
ALTER TABLE analytics_property_views ALTER COLUMN session_id TYPE VARCHAR(255);
ALTER TABLE analytics_user_interactions ALTER COLUMN session_id TYPE VARCHAR(255);
ALTER TABLE analytics_lead_generation ALTER COLUMN session_id TYPE VARCHAR(255);
ALTER TABLE analytics_campaign_attribution ALTER COLUMN session_id TYPE VARCHAR(255);

-- Paso 3: Recrear los foreign key constraints apuntando al campo session_id correcto
ALTER TABLE analytics_property_views
ADD CONSTRAINT analytics_property_views_session_id_fkey
FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE SET NULL;

ALTER TABLE analytics_user_interactions
ADD CONSTRAINT analytics_user_interactions_session_id_fkey
FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE;

ALTER TABLE analytics_lead_generation
ADD CONSTRAINT analytics_lead_generation_session_id_fkey
FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE SET NULL;

ALTER TABLE analytics_campaign_attribution
ADD CONSTRAINT analytics_campaign_attribution_session_id_fkey
FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE;

-- Paso 4: Actualizar las funciones PostgreSQL para usar el campo session_id correcto

-- Función check_duplicate_property_view actualizada
CREATE OR REPLACE FUNCTION check_duplicate_property_view(
    p_property_id INTEGER,
    p_session_id VARCHAR(255)
) RETURNS BOOLEAN AS $$
DECLARE
    last_view_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Buscar la última vista de esta propiedad por esta sesión
    SELECT viewed_at INTO last_view_time
    FROM analytics_property_views
    WHERE property_id = p_property_id
      AND session_id = p_session_id
    ORDER BY viewed_at DESC
    LIMIT 1;

    -- Si no hay vista previa o han pasado más de 2 horas
    IF last_view_time IS NULL OR (NOW() - last_view_time) > INTERVAL '2 hours' THEN
        RETURN FALSE; -- No es duplicado
    ELSE
        RETURN TRUE; -- Es duplicado
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función track_property_view actualizada
CREATE OR REPLACE FUNCTION track_property_view(
    p_property_id INTEGER,
    p_session_id VARCHAR(255),
    p_page_url TEXT,
    p_referrer_url TEXT DEFAULT NULL,
    p_search_query VARCHAR(255) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    view_id UUID;
    is_duplicate BOOLEAN;
BEGIN
    -- Verificar si es vista duplicada
    SELECT check_duplicate_property_view(p_property_id, p_session_id) INTO is_duplicate;

    IF is_duplicate THEN
        -- Actualizar la última vista en lugar de crear nueva
        UPDATE analytics_property_views
        SET viewed_at = NOW(),
            page_url = p_page_url,
            referrer_url = COALESCE(p_referrer_url, referrer_url),
            search_query = COALESCE(p_search_query, search_query)
        WHERE property_id = p_property_id
          AND session_id = p_session_id
          AND viewed_at = (
              SELECT MAX(viewed_at)
              FROM analytics_property_views
              WHERE property_id = p_property_id AND session_id = p_session_id
          )
        RETURNING id INTO view_id;
    ELSE
        -- Crear nueva vista
        INSERT INTO analytics_property_views (
            property_id, session_id, page_url, referrer_url, search_query
        ) VALUES (
            p_property_id, p_session_id, p_page_url, p_referrer_url, p_search_query
        ) RETURNING id INTO view_id;

        -- Incrementar contador en la tabla properties (mantener compatibilidad)
        UPDATE properties
        SET views = COALESCE(views, 0) + 1
        WHERE id = p_property_id;
    END IF;

    RETURN view_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función analytics_opt_out actualizada
CREATE OR REPLACE FUNCTION analytics_opt_out(p_session_id VARCHAR(255))
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE analytics_sessions
    SET opt_out = TRUE
    WHERE session_id = p_session_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 5: Actualizar índices para optimizar performance con el nuevo campo
DROP INDEX IF EXISTS idx_analytics_property_views_session_id;
CREATE INDEX idx_analytics_property_views_session_id ON analytics_property_views(session_id);

DROP INDEX IF EXISTS idx_analytics_user_interactions_session_id;
CREATE INDEX idx_analytics_user_interactions_session_id ON analytics_user_interactions(session_id);

DROP INDEX IF EXISTS idx_analytics_lead_generation_session_id;
CREATE INDEX idx_analytics_lead_generation_session_id ON analytics_lead_generation(session_id);

DROP INDEX IF EXISTS idx_analytics_campaign_attribution_session_id;
CREATE INDEX idx_analytics_campaign_attribution_session_id ON analytics_campaign_attribution(session_id);

-- Paso 6: Comentarios de documentación
COMMENT ON CONSTRAINT analytics_property_views_session_id_fkey ON analytics_property_views
IS 'Foreign key corregida para apuntar a analytics_sessions.session_id en lugar de id';

COMMENT ON CONSTRAINT analytics_user_interactions_session_id_fkey ON analytics_user_interactions
IS 'Foreign key corregida para apuntar a analytics_sessions.session_id en lugar de id';

-- Mostrar resumen de la corrección
SELECT
    'CORRECCIÓN DE FOREIGN KEYS COMPLETADA' as status,
    'Todas las tablas de analytics ahora referencian correctamente analytics_sessions.session_id' as summary;

-- Verificar que las constraints están correctamente configuradas
SELECT
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE confrelid = 'analytics_sessions'::regclass
  AND contype = 'f'
ORDER BY conname;