-- =============================================
-- MARCONI INMOBILIARIA - ANALYTICS MIGRATION
-- Sistema de tracking para propiedades y leads
-- Version: 1.0.0
-- =============================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. TABLA: ANALYTICS_SESSIONS
-- Tracking de sesiones de usuario anónimas
-- =============================================
CREATE TABLE analytics_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL, -- Cliente genera UUID
    ip_hash VARCHAR(64) NOT NULL, -- SHA-256 de IP para GDPR compliance
    user_agent TEXT,
    device_type VARCHAR(50) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    browser_name VARCHAR(100),
    browser_version VARCHAR(50),
    os_name VARCHAR(100),
    os_version VARCHAR(50),
    referrer_domain VARCHAR(255),
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_term VARCHAR(255),
    utm_content VARCHAR(255),
    country_code CHAR(2),
    city VARCHAR(100),
    language VARCHAR(10) DEFAULT 'es',
    timezone VARCHAR(50),
    screen_width INTEGER,
    screen_height INTEGER,
    opt_out BOOLEAN DEFAULT FALSE, -- GDPR opt-out
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios para la tabla sessions
COMMENT ON TABLE analytics_sessions IS 'Sesiones de usuario anónimas para tracking GDPR-compliant';
COMMENT ON COLUMN analytics_sessions.ip_hash IS 'Hash SHA-256 de IP para privacidad';
COMMENT ON COLUMN analytics_sessions.opt_out IS 'Usuario optó por no ser trackeado';

-- =============================================
-- 2. TABLA: ANALYTICS_PROPERTY_VIEWS
-- Tracking detallado de vistas de propiedades
-- =============================================
CREATE TABLE analytics_property_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    session_id UUID REFERENCES analytics_sessions(id) ON DELETE SET NULL,
    view_duration_seconds INTEGER DEFAULT 0,
    page_url TEXT NOT NULL,
    referrer_url TEXT,
    search_query VARCHAR(255), -- Si llegó por búsqueda
    search_filters JSONB, -- Filtros aplicados en búsqueda
    interaction_events JSONB DEFAULT '[]', -- Clicks, scrolls, etc
    scroll_percentage INTEGER CHECK (scroll_percentage >= 0 AND scroll_percentage <= 100),
    images_viewed INTEGER DEFAULT 0,
    contact_form_opened BOOLEAN DEFAULT FALSE,
    contact_form_submitted BOOLEAN DEFAULT FALSE,
    phone_clicked BOOLEAN DEFAULT FALSE,
    whatsapp_clicked BOOLEAN DEFAULT FALSE,
    email_clicked BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios para la tabla property_views
COMMENT ON TABLE analytics_property_views IS 'Tracking detallado de vistas de propiedades';
COMMENT ON COLUMN analytics_property_views.view_duration_seconds IS 'Tiempo en segundos en la página';
COMMENT ON COLUMN analytics_property_views.interaction_events IS 'Array JSON de eventos de interacción';

-- =============================================
-- 3. TABLA: ANALYTICS_LEAD_SOURCES
-- Catálogo de fuentes de leads
-- =============================================
CREATE TABLE analytics_lead_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL, -- Nombre en español
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('web', 'social', 'direct', 'referral', 'advertising')),
    icon VARCHAR(50), -- Nombre del ícono para UI
    color VARCHAR(7), -- Color hex para UI
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios para la tabla lead_sources
COMMENT ON TABLE analytics_lead_sources IS 'Catálogo de fuentes de leads para análisis de atribución';

-- =============================================
-- 4. TABLA: ANALYTICS_LEAD_GENERATION
-- Tracking de generación de leads
-- =============================================
CREATE TABLE analytics_lead_generation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE, -- Puede ser NULL para leads anónimos
    session_id UUID REFERENCES analytics_sessions(id) ON DELETE SET NULL,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL, -- Propiedad que generó el lead
    lead_source_id INTEGER REFERENCES analytics_lead_sources(id),
    form_type VARCHAR(50), -- 'contact', 'phone_call', 'whatsapp', 'email'
    contact_method VARCHAR(50), -- Método preferido de contacto
    lead_value DECIMAL(10,2) DEFAULT 0, -- Valor estimado del lead
    conversion_time_minutes INTEGER, -- Tiempo desde primera vista hasta conversión
    form_data JSONB, -- Datos del formulario (sin PII)
    page_url TEXT, -- Página donde se generó el lead
    referrer_url TEXT,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_term VARCHAR(255),
    utm_content VARCHAR(255),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios para la tabla lead_generation
COMMENT ON TABLE analytics_lead_generation IS 'Tracking de generación y atribución de leads';
COMMENT ON COLUMN analytics_lead_generation.conversion_time_minutes IS 'Tiempo desde primera vista hasta conversión en minutos';

-- =============================================
-- 5. TABLA: ANALYTICS_USER_INTERACTIONS
-- Tracking de interacciones específicas
-- =============================================
CREATE TABLE analytics_user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES analytics_sessions(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    interaction_type VARCHAR(100) NOT NULL, -- 'click', 'scroll', 'form_field_focus', etc
    element_id VARCHAR(255), -- ID del elemento HTML
    element_class VARCHAR(255), -- Clase CSS del elemento
    element_text VARCHAR(500), -- Texto del elemento
    page_url TEXT NOT NULL,
    coordinates_x INTEGER, -- Coordenadas X del click
    coordinates_y INTEGER, -- Coordenadas Y del click
    viewport_width INTEGER,
    viewport_height INTEGER,
    interaction_data JSONB, -- Datos adicionales específicos del tipo de interacción
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios para la tabla user_interactions
COMMENT ON TABLE analytics_user_interactions IS 'Tracking detallado de interacciones del usuario';

-- =============================================
-- 6. TABLA: ANALYTICS_CAMPAIGN_ATTRIBUTION
-- Attribution de campañas y fuentes
-- =============================================
CREATE TABLE analytics_campaign_attribution (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES analytics_sessions(id) ON DELETE CASCADE,
    campaign_name VARCHAR(255),
    campaign_source VARCHAR(255), -- utm_source
    campaign_medium VARCHAR(255), -- utm_medium
    campaign_content VARCHAR(255), -- utm_content
    campaign_term VARCHAR(255), -- utm_term
    ad_group VARCHAR(255),
    keyword VARCHAR(255),
    placement VARCHAR(255),
    creative VARCHAR(255),
    landing_page TEXT,
    referrer_domain VARCHAR(255),
    cost_per_click DECIMAL(8,4), -- CPC if available
    first_touch BOOLEAN DEFAULT FALSE, -- Primera interacción
    last_touch BOOLEAN DEFAULT FALSE, -- Última interacción antes de conversión
    attributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios para la tabla campaign_attribution
COMMENT ON TABLE analytics_campaign_attribution IS 'Atribución detallada de campañas de marketing';

-- =============================================
-- TABLAS DE AGREGACIÓN PARA DASHBOARD
-- =============================================

-- 7. TABLA: ANALYTICS_DAILY_STATS
CREATE TABLE analytics_daily_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    total_views INTEGER DEFAULT 0,
    unique_sessions INTEGER DEFAULT 0,
    avg_duration_seconds DECIMAL(8,2) DEFAULT 0,
    total_interactions INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    contact_forms_submitted INTEGER DEFAULT 0,
    phone_clicks INTEGER DEFAULT 0,
    whatsapp_clicks INTEGER DEFAULT 0,
    email_clicks INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0, -- Porcentaje de rebote
    conversion_rate DECIMAL(5,2) DEFAULT 0, -- Porcentaje de conversión
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, property_id)
);

-- Comentarios para la tabla daily_stats
COMMENT ON TABLE analytics_daily_stats IS 'Estadísticas diarias agregadas por propiedad';

-- 8. TABLA: ANALYTICS_WEEKLY_STATS
CREATE TABLE analytics_weekly_stats (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    week INTEGER NOT NULL CHECK (week >= 1 AND week <= 53),
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    total_views INTEGER DEFAULT 0,
    unique_sessions INTEGER DEFAULT 0,
    avg_duration_seconds DECIMAL(8,2) DEFAULT 0,
    total_interactions INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    contact_forms_submitted INTEGER DEFAULT 0,
    phone_clicks INTEGER DEFAULT 0,
    whatsapp_clicks INTEGER DEFAULT 0,
    email_clicks INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year, week, property_id)
);

-- Comentarios para la tabla weekly_stats
COMMENT ON TABLE analytics_weekly_stats IS 'Estadísticas semanales agregadas por propiedad';

-- 9. TABLA: ANALYTICS_MONTHLY_STATS
CREATE TABLE analytics_monthly_stats (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    total_views INTEGER DEFAULT 0,
    unique_sessions INTEGER DEFAULT 0,
    avg_duration_seconds DECIMAL(8,2) DEFAULT 0,
    total_interactions INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    contact_forms_submitted INTEGER DEFAULT 0,
    phone_clicks INTEGER DEFAULT 0,
    whatsapp_clicks INTEGER DEFAULT 0,
    email_clicks INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year, month, property_id)
);

-- Comentarios para la tabla monthly_stats
COMMENT ON TABLE analytics_monthly_stats IS 'Estadísticas mensuales agregadas por propiedad';

-- 10. TABLA: ANALYTICS_LEAD_SOURCE_STATS
CREATE TABLE analytics_lead_source_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    lead_source_id INTEGER REFERENCES analytics_lead_sources(id) ON DELETE CASCADE,
    leads_generated INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    avg_lead_value DECIMAL(10,2) DEFAULT 0,
    cost_per_lead DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, lead_source_id)
);

-- Comentarios para la tabla lead_source_stats
COMMENT ON TABLE analytics_lead_source_stats IS 'Estadísticas diarias por fuente de lead';

-- 11. TABLA: ANALYTICS_CAMPAIGN_STATS
CREATE TABLE analytics_campaign_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_source VARCHAR(255) NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0, -- Click-through rate
    cpc DECIMAL(8,4) DEFAULT 0, -- Cost per click
    cpl DECIMAL(10,2) DEFAULT 0, -- Cost per lead
    roas DECIMAL(8,4) DEFAULT 0, -- Return on ad spend
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, campaign_name, campaign_source)
);

-- Comentarios para la tabla campaign_stats
COMMENT ON TABLE analytics_campaign_stats IS 'Estadísticas diarias de campañas de marketing';

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para analytics_sessions
CREATE INDEX idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX idx_analytics_sessions_ip_hash ON analytics_sessions(ip_hash);
CREATE INDEX idx_analytics_sessions_first_seen ON analytics_sessions(first_seen_at);
CREATE INDEX idx_analytics_sessions_utm_source ON analytics_sessions(utm_source);

-- Índices para analytics_property_views
CREATE INDEX idx_analytics_property_views_property_id ON analytics_property_views(property_id);
CREATE INDEX idx_analytics_property_views_session_id ON analytics_property_views(session_id);
CREATE INDEX idx_analytics_property_views_viewed_at ON analytics_property_views(viewed_at);
CREATE INDEX idx_analytics_property_views_property_viewed ON analytics_property_views(property_id, viewed_at);

-- Índices para analytics_lead_generation
CREATE INDEX idx_analytics_lead_generation_lead_id ON analytics_lead_generation(lead_id);
CREATE INDEX idx_analytics_lead_generation_session_id ON analytics_lead_generation(session_id);
CREATE INDEX idx_analytics_lead_generation_property_id ON analytics_lead_generation(property_id);
CREATE INDEX idx_analytics_lead_generation_source_id ON analytics_lead_generation(lead_source_id);
CREATE INDEX idx_analytics_lead_generation_generated_at ON analytics_lead_generation(generated_at);

-- Índices para analytics_user_interactions
CREATE INDEX idx_analytics_user_interactions_session_id ON analytics_user_interactions(session_id);
CREATE INDEX idx_analytics_user_interactions_property_id ON analytics_user_interactions(property_id);
CREATE INDEX idx_analytics_user_interactions_type ON analytics_user_interactions(interaction_type);
CREATE INDEX idx_analytics_user_interactions_occurred_at ON analytics_user_interactions(occurred_at);

-- Índices para analytics_campaign_attribution
CREATE INDEX idx_analytics_campaign_attribution_session_id ON analytics_campaign_attribution(session_id);
CREATE INDEX idx_analytics_campaign_attribution_campaign ON analytics_campaign_attribution(campaign_name, campaign_source);
CREATE INDEX idx_analytics_campaign_attribution_attributed_at ON analytics_campaign_attribution(attributed_at);

-- Índices para tablas de agregación
CREATE INDEX idx_analytics_daily_stats_date ON analytics_daily_stats(date);
CREATE INDEX idx_analytics_daily_stats_property_date ON analytics_daily_stats(property_id, date);
CREATE INDEX idx_analytics_weekly_stats_year_week ON analytics_weekly_stats(year, week);
CREATE INDEX idx_analytics_monthly_stats_year_month ON analytics_monthly_stats(year, month);
CREATE INDEX idx_analytics_lead_source_stats_date ON analytics_lead_source_stats(date);
CREATE INDEX idx_analytics_campaign_stats_date ON analytics_campaign_stats(date);

-- =============================================
-- INSERTAR DATOS INICIALES: LEAD SOURCES
-- =============================================
INSERT INTO analytics_lead_sources (name, display_name, description, category, icon, color, sort_order) VALUES
('formulario_web', 'Formulario Web', 'Formulario de contacto en el sitio web', 'web', 'globe', '#3B82F6', 1),
('whatsapp', 'WhatsApp', 'Contacto vía WhatsApp', 'social', 'message-circle', '#25D366', 2),
('telefono', 'Teléfono', 'Llamada telefónica directa', 'direct', 'phone', '#F59E0B', 3),
('email', 'Email', 'Correo electrónico directo', 'direct', 'mail', '#8B5CF6', 4),
('facebook', 'Facebook', 'Redes sociales - Facebook', 'social', 'facebook', '#1877F2', 5),
('instagram', 'Instagram', 'Redes sociales - Instagram', 'social', 'instagram', '#E4405F', 6),
('google_ads', 'Google Ads', 'Publicidad de Google', 'advertising', 'search', '#4285F4', 7),
('facebook_ads', 'Facebook Ads', 'Publicidad de Facebook', 'advertising', 'facebook', '#1877F2', 8),
('referido', 'Referido', 'Recomendación de cliente existente', 'referral', 'users', '#10B981', 9),
('walk_in', 'Visita Presencial', 'Cliente que visitó la oficina', 'direct', 'map-pin', '#F97316', 10),
('marketplace', 'Marketplace', 'Plataformas como MercadoLibre, OLX', 'web', 'store', '#6366F1', 11),
('otros', 'Otros', 'Otras fuentes no categorizadas', 'referral', 'help-circle', '#6B7280', 12);

-- =============================================
-- FUNCIONES POSTGRESQL (RPC) PARA SUPABASE
-- =============================================

-- 1. FUNCIÓN: Detectar vista duplicada (debounce 2 horas)
CREATE OR REPLACE FUNCTION check_duplicate_property_view(
    p_property_id INTEGER,
    p_session_id UUID
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

-- 2. FUNCIÓN: Registrar vista de propiedad con debounce
CREATE OR REPLACE FUNCTION track_property_view(
    p_property_id INTEGER,
    p_session_id UUID,
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

-- 3. FUNCIÓN: Obtener métricas de propiedad
CREATE OR REPLACE FUNCTION get_property_metrics(
    p_property_id INTEGER,
    p_days_back INTEGER DEFAULT 30
) RETURNS TABLE(
    total_views BIGINT,
    unique_sessions BIGINT,
    avg_duration NUMERIC,
    total_interactions BIGINT,
    leads_generated BIGINT,
    conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(apv.id) as total_views,
        COUNT(DISTINCT apv.session_id) as unique_sessions,
        AVG(apv.view_duration_seconds) as avg_duration,
        COALESCE(interactions.total, 0) as total_interactions,
        COALESCE(leads.total, 0) as leads_generated,
        CASE 
            WHEN COUNT(DISTINCT apv.session_id) > 0 
            THEN (COALESCE(leads.total, 0)::NUMERIC / COUNT(DISTINCT apv.session_id)) * 100
            ELSE 0 
        END as conversion_rate
    FROM analytics_property_views apv
    LEFT JOIN (
        SELECT 
            property_id, 
            COUNT(*) as total
        FROM analytics_user_interactions 
        WHERE property_id = p_property_id 
          AND occurred_at >= NOW() - (p_days_back || ' days')::INTERVAL
        GROUP BY property_id
    ) interactions ON interactions.property_id = apv.property_id
    LEFT JOIN (
        SELECT 
            property_id, 
            COUNT(*) as total
        FROM analytics_lead_generation 
        WHERE property_id = p_property_id 
          AND generated_at >= NOW() - (p_days_back || ' days')::INTERVAL
        GROUP BY property_id
    ) leads ON leads.property_id = apv.property_id
    WHERE apv.property_id = p_property_id
      AND apv.viewed_at >= NOW() - (p_days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNCIÓN: Dashboard general de métricas
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
    p_days_back INTEGER DEFAULT 30
) RETURNS TABLE(
    total_views BIGINT,
    unique_sessions BIGINT,
    total_leads BIGINT,
    conversion_rate NUMERIC,
    top_property_id INTEGER,
    top_property_views BIGINT,
    best_lead_source VARCHAR(100),
    best_source_leads BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH metrics AS (
        SELECT 
            COUNT(apv.id) as views,
            COUNT(DISTINCT apv.session_id) as sessions,
            COUNT(alg.id) as leads
        FROM analytics_property_views apv
        LEFT JOIN analytics_lead_generation alg 
            ON alg.session_id = apv.session_id 
            AND alg.generated_at >= NOW() - (p_days_back || ' days')::INTERVAL
        WHERE apv.viewed_at >= NOW() - (p_days_back || ' days')::INTERVAL
    ),
    top_property AS (
        SELECT property_id, COUNT(*) as view_count
        FROM analytics_property_views
        WHERE viewed_at >= NOW() - (p_days_back || ' days')::INTERVAL
        GROUP BY property_id
        ORDER BY view_count DESC
        LIMIT 1
    ),
    top_source AS (
        SELECT als.display_name as source_name, COUNT(alg.id) as lead_count
        FROM analytics_lead_generation alg
        JOIN analytics_lead_sources als ON als.id = alg.lead_source_id
        WHERE alg.generated_at >= NOW() - (p_days_back || ' days')::INTERVAL
        GROUP BY als.display_name
        ORDER BY lead_count DESC
        LIMIT 1
    )
    SELECT 
        metrics.views as total_views,
        metrics.sessions as unique_sessions,
        metrics.leads as total_leads,
        CASE 
            WHEN metrics.sessions > 0 
            THEN (metrics.leads::NUMERIC / metrics.sessions) * 100
            ELSE 0 
        END as conversion_rate,
        top_property.property_id as top_property_id,
        top_property.view_count as top_property_views,
        top_source.source_name as best_lead_source,
        top_source.lead_count as best_source_leads
    FROM metrics
    CROSS JOIN top_property
    CROSS JOIN top_source;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNCIÓN: Hash IP para GDPR compliance
CREATE OR REPLACE FUNCTION hash_ip_address(ip_address TEXT) 
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN encode(digest(ip_address || 'marconi_salt_2025', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNCIÓN: Limpiar datos antiguos (GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data() 
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Eliminar datos de más de 24 meses
    DELETE FROM analytics_property_views 
    WHERE created_at < NOW() - INTERVAL '24 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM analytics_user_interactions 
    WHERE created_at < NOW() - INTERVAL '24 months';
    
    DELETE FROM analytics_lead_generation 
    WHERE created_at < NOW() - INTERVAL '24 months';
    
    DELETE FROM analytics_campaign_attribution 
    WHERE created_at < NOW() - INTERVAL '24 months';
    
    -- Limpiar sesiones huérfanas
    DELETE FROM analytics_sessions 
    WHERE created_at < NOW() - INTERVAL '24 months'
      AND id NOT IN (
          SELECT DISTINCT session_id 
          FROM analytics_property_views 
          WHERE session_id IS NOT NULL
      );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNCIÓN: Opt-out de tracking (GDPR)
CREATE OR REPLACE FUNCTION analytics_opt_out(p_session_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE analytics_sessions 
    SET opt_out = TRUE 
    WHERE session_id = p_session_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Habilitar RLS en todas las tablas analytics
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_lead_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_campaign_attribution ENABLE ROW LEVEL SECURITY;

-- Política: Solo administradores pueden ver datos analytics
CREATE POLICY "Admin can view analytics_sessions" ON analytics_sessions
    FOR SELECT USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert analytics_sessions" ON analytics_sessions
    FOR INSERT WITH CHECK (true); -- Permitir inserts anónimos para tracking

CREATE POLICY "Admin can view analytics_property_views" ON analytics_property_views
    FOR SELECT USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public can insert analytics_property_views" ON analytics_property_views
    FOR INSERT WITH CHECK (true); -- Permitir inserts anónimos para tracking

-- Políticas similares para otras tablas...
CREATE POLICY "Public can view analytics_lead_sources" ON analytics_lead_sources
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage analytics_lead_sources" ON analytics_lead_sources
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- =============================================
-- TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- =============================================

-- Trigger para actualizar updated_at en lead_sources
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_lead_sources_updated_at
    BEFORE UPDATE ON analytics_lead_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS PARA REPORTES COMUNES
-- =============================================

-- Vista: Resumen de propiedades más vistas
CREATE VIEW analytics_top_properties AS
SELECT 
    p.id,
    p.title,
    p.property_type,
    p.operation_type,
    p.price,
    p.neighborhood,
    COUNT(apv.id) as total_views,
    COUNT(DISTINCT apv.session_id) as unique_views,
    AVG(apv.view_duration_seconds) as avg_duration,
    COUNT(alg.id) as leads_generated,
    CASE 
        WHEN COUNT(DISTINCT apv.session_id) > 0 
        THEN (COUNT(alg.id)::NUMERIC / COUNT(DISTINCT apv.session_id)) * 100
        ELSE 0 
    END as conversion_rate
FROM properties p
LEFT JOIN analytics_property_views apv ON p.id = apv.property_id
LEFT JOIN analytics_lead_generation alg ON p.id = alg.property_id
WHERE apv.viewed_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.title, p.property_type, p.operation_type, p.price, p.neighborhood
ORDER BY total_views DESC;

-- Vista: Performance de fuentes de leads
CREATE VIEW analytics_lead_source_performance AS
SELECT 
    als.display_name,
    als.category,
    COUNT(alg.id) as total_leads,
    COUNT(DISTINCT alg.session_id) as unique_sessions,
    ROUND(AVG(alg.lead_value), 2) as avg_lead_value,
    ROUND(
        COUNT(alg.id)::NUMERIC / 
        NULLIF(COUNT(DISTINCT apv.session_id), 0) * 100, 
        2
    ) as conversion_rate
FROM analytics_lead_sources als
LEFT JOIN analytics_lead_generation alg ON als.id = alg.lead_source_id
LEFT JOIN analytics_property_views apv ON alg.session_id = apv.session_id
WHERE alg.generated_at >= NOW() - INTERVAL '30 days'
   OR alg.generated_at IS NULL
GROUP BY als.id, als.display_name, als.category
ORDER BY total_leads DESC NULLS LAST;

-- =============================================
-- COMENTARIOS FINALES Y DOCUMENTACIÓN
-- =============================================

COMMENT ON DATABASE postgres IS 'Marconi Inmobiliaria - Analytics tracking system installed';

-- Crear tabla de metadatos de migración
CREATE TABLE IF NOT EXISTS analytics_migrations (
    version VARCHAR(20) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO analytics_migrations (version, description) VALUES 
('1.0.0', 'Initial analytics schema with GDPR compliance, 2-hour debounce, and comprehensive tracking');

-- =============================================
-- FIN DE MIGRACIÓN
-- =============================================

-- Mostrar resumen de objetos creados
SELECT 'MIGRACIÓN COMPLETADA EXITOSAMENTE' as status,
       'Se crearon 11 tablas, 20+ índices, 7 funciones, y vistas para analytics' as summary;