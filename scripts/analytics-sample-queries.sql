-- =====================================================================================
-- MARCONI INMOBILIARIA - ANALYTICS SAMPLE QUERIES
-- =====================================================================================
-- Production-ready SQL queries for common analytics operations
-- Use these examples to build custom reports and dashboards
-- =====================================================================================

-- =====================================================================================
-- 1. PROPERTY PERFORMANCE QUERIES
-- =====================================================================================

-- Get top 10 most viewed properties in the last 30 days
SELECT 
    p.id,
    p.title,
    p.price,
    p.property_type,
    COUNT(pve.id) as total_views,
    COUNT(pve.id) FILTER (WHERE pve.is_unique_view = true) as unique_views,
    ROUND(AVG(pve.time_on_page), 2) as avg_time_on_page,
    ROUND(AVG(pve.scroll_depth), 2) as avg_scroll_depth,
    COUNT(lge.id) as leads_generated,
    CASE 
        WHEN COUNT(pve.id) FILTER (WHERE pve.is_unique_view = true) > 0 
        THEN ROUND(COUNT(lge.id)::DECIMAL / COUNT(pve.id) FILTER (WHERE pve.is_unique_view = true) * 100, 2)
        ELSE 0 
    END as conversion_rate
FROM properties p
LEFT JOIN property_view_events pve ON p.id = pve.property_id 
    AND pve.view_timestamp >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN lead_generation_events lge ON p.id = lge.property_id 
    AND lge.conversion_timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.title, p.price, p.property_type
ORDER BY total_views DESC
LIMIT 10;

-- Property engagement analysis
SELECT 
    p.id,
    p.title,
    p.property_type,
    COUNT(pve.id) as total_views,
    ROUND(AVG(pve.time_on_page), 2) as avg_time_on_page,
    ROUND(AVG(pve.scroll_depth), 2) as avg_scroll_depth,
    COUNT(pve.id) FILTER (WHERE pve.contact_button_clicked = true) as contact_clicks,
    COUNT(pve.id) FILTER (WHERE pve.whatsapp_clicked = true) as whatsapp_clicks,
    COUNT(pve.id) FILTER (WHERE pve.phone_clicked = true) as phone_clicks,
    COUNT(pve.id) FILTER (WHERE pve.map_interacted = true) as map_interactions,
    ROUND(AVG(pve.images_viewed), 1) as avg_images_viewed
FROM properties p
LEFT JOIN property_view_events pve ON p.id = pve.property_id
    AND pve.view_timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.title, p.property_type
HAVING COUNT(pve.id) > 0
ORDER BY total_views DESC;

-- Property performance by neighborhood
SELECT 
    p.neighborhood,
    COUNT(DISTINCT p.id) as properties_count,
    COUNT(pve.id) as total_views,
    COUNT(pve.id) FILTER (WHERE pve.is_unique_view = true) as unique_views,
    COUNT(lge.id) as total_leads,
    ROUND(COUNT(lge.id)::DECIMAL / NULLIF(COUNT(pve.id) FILTER (WHERE pve.is_unique_view = true), 0) * 100, 2) as conversion_rate,
    ROUND(AVG(pve.time_on_page), 2) as avg_time_on_page
FROM properties p
LEFT JOIN property_view_events pve ON p.id = pve.property_id
    AND pve.view_timestamp >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN lead_generation_events lge ON p.id = lge.property_id
    AND lge.conversion_timestamp >= CURRENT_DATE - INTERVAL '30 days'
WHERE p.neighborhood IS NOT NULL
GROUP BY p.neighborhood
ORDER BY conversion_rate DESC NULLS LAST;

-- =====================================================================================
-- 2. LEAD SOURCE PERFORMANCE QUERIES
-- =====================================================================================

-- Lead sources performance analysis
SELECT 
    ls.display_name as lead_source,
    ls.source_code,
    COUNT(lge.id) as leads_count,
    COUNT(DISTINCT lge.session_id) as unique_sessions,
    ROUND(AVG(lge.time_to_conversion), 2) as avg_conversion_time_minutes,
    COUNT(lge.id) FILTER (WHERE lge.conversion_timestamp >= CURRENT_DATE - INTERVAL '7 days') as leads_last_7_days,
    COUNT(lge.id) FILTER (WHERE lge.conversion_timestamp >= CURRENT_DATE - INTERVAL '30 days') as leads_last_30_days,
    ROUND(
        COUNT(lge.id)::DECIMAL / 
        NULLIF(COUNT(DISTINCT lge.session_id), 0) * 100, 2
    ) as session_to_lead_conversion_rate
FROM lead_sources ls
LEFT JOIN lead_generation_events lge ON ls.id = lge.lead_source_id
    AND lge.conversion_timestamp >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY ls.id, ls.display_name, ls.source_code
ORDER BY leads_count DESC;

-- Lead quality by source (based on lead progression)
SELECT 
    ls.display_name as lead_source,
    COUNT(lge.id) as total_leads,
    COUNT(l.id) FILTER (WHERE l.status = 'new') as new_leads,
    COUNT(l.id) FILTER (WHERE l.status = 'contacted') as contacted_leads,
    COUNT(l.id) FILTER (WHERE l.status = 'qualified') as qualified_leads,
    COUNT(l.id) FILTER (WHERE l.status = 'converted') as converted_leads,
    ROUND(
        COUNT(l.id) FILTER (WHERE l.status = 'qualified')::DECIMAL / 
        NULLIF(COUNT(lge.id), 0) * 100, 2
    ) as qualification_rate,
    ROUND(
        COUNT(l.id) FILTER (WHERE l.status = 'converted')::DECIMAL / 
        NULLIF(COUNT(lge.id), 0) * 100, 2
    ) as conversion_rate
FROM lead_sources ls
LEFT JOIN lead_generation_events lge ON ls.id = lge.lead_source_id
    AND lge.conversion_timestamp >= CURRENT_DATE - INTERVAL '90 days'
LEFT JOIN leads l ON lge.lead_id = l.id
GROUP BY ls.id, ls.display_name
ORDER BY qualification_rate DESC NULLS LAST;

-- =====================================================================================
-- 3. TRAFFIC & SESSION ANALYTICS
-- =====================================================================================

-- Daily traffic trends for last 30 days
SELECT 
    date_trunc('day', as_session.first_seen)::date as date,
    COUNT(DISTINCT as_session.session_id) as unique_sessions,
    COUNT(pve.id) as total_page_views,
    COUNT(pve.id) FILTER (WHERE pve.is_unique_view = true) as unique_page_views,
    COUNT(lge.id) as leads_generated,
    ROUND(COUNT(lge.id)::DECIMAL / NULLIF(COUNT(DISTINCT as_session.session_id), 0) * 100, 2) as session_to_lead_rate
FROM analytics_sessions as_session
LEFT JOIN property_view_events pve ON as_session.session_id = pve.session_id
    AND pve.view_timestamp >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN lead_generation_events lge ON as_session.session_id = lge.session_id
    AND lge.conversion_timestamp >= CURRENT_DATE - INTERVAL '30 days'
WHERE as_session.first_seen >= CURRENT_DATE - INTERVAL '30 days'
    AND as_session.is_opted_out = false
GROUP BY date_trunc('day', as_session.first_seen)::date
ORDER BY date DESC;

-- Hourly traffic patterns (last 7 days)
SELECT 
    EXTRACT(hour FROM pve.view_timestamp) as hour_of_day,
    COUNT(pve.id) as total_views,
    COUNT(DISTINCT pve.session_id) as unique_sessions,
    ROUND(AVG(pve.time_on_page), 2) as avg_time_on_page,
    COUNT(pve.id) FILTER (WHERE pve.contact_button_clicked = true OR pve.whatsapp_clicked = true OR pve.phone_clicked = true) as engagement_actions
FROM property_view_events pve
WHERE pve.view_timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY EXTRACT(hour FROM pve.view_timestamp)
ORDER BY hour_of_day;

-- Device and browser analytics
SELECT 
    as_session.device_type,
    as_session.browser,
    as_session.os,
    COUNT(DISTINCT as_session.session_id) as sessions,
    COUNT(pve.id) as page_views,
    COUNT(lge.id) as leads,
    ROUND(AVG(pve.time_on_page), 2) as avg_time_on_page,
    ROUND(COUNT(lge.id)::DECIMAL / NULLIF(COUNT(DISTINCT as_session.session_id), 0) * 100, 2) as conversion_rate
FROM analytics_sessions as_session
LEFT JOIN property_view_events pve ON as_session.session_id = pve.session_id
    AND pve.view_timestamp >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN lead_generation_events lge ON as_session.session_id = lge.session_id
    AND lge.conversion_timestamp >= CURRENT_DATE - INTERVAL '30 days'
WHERE as_session.first_seen >= CURRENT_DATE - INTERVAL '30 days'
    AND as_session.is_opted_out = false
GROUP BY as_session.device_type, as_session.browser, as_session.os
ORDER BY sessions DESC;

-- =====================================================================================
-- 4. UTM CAMPAIGN ANALYTICS
-- =====================================================================================

-- Campaign performance analysis
SELECT 
    COALESCE(as_session.utm_source, 'direct') as utm_source,
    COALESCE(as_session.utm_medium, 'none') as utm_medium,
    COALESCE(as_session.utm_campaign, 'none') as utm_campaign,
    COUNT(DISTINCT as_session.session_id) as sessions,
    COUNT(pve.id) as page_views,
    COUNT(pve.id) FILTER (WHERE pve.is_unique_view = true) as unique_views,
    COUNT(lge.id) as leads,
    ROUND(COUNT(lge.id)::DECIMAL / NULLIF(COUNT(DISTINCT as_session.session_id), 0) * 100, 2) as session_conversion_rate,
    ROUND(COUNT(lge.id)::DECIMAL / NULLIF(COUNT(pve.id) FILTER (WHERE pve.is_unique_view = true), 0) * 100, 2) as view_conversion_rate,
    ROUND(AVG(lge.time_to_conversion), 2) as avg_conversion_time_minutes
FROM analytics_sessions as_session
LEFT JOIN property_view_events pve ON as_session.session_id = pve.session_id
    AND pve.view_timestamp >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN lead_generation_events lge ON as_session.session_id = lge.session_id
    AND lge.conversion_timestamp >= CURRENT_DATE - INTERVAL '30 days'
WHERE as_session.first_seen >= CURRENT_DATE - INTERVAL '30 days'
    AND as_session.is_opted_out = false
GROUP BY as_session.utm_source, as_session.utm_medium, as_session.utm_campaign
ORDER BY leads DESC;

-- Best performing campaigns by lead quality
SELECT 
    lge.utm_source,
    lge.utm_campaign,
    COUNT(lge.id) as total_leads,
    COUNT(l.id) FILTER (WHERE l.status = 'qualified') as qualified_leads,
    COUNT(l.id) FILTER (WHERE l.status = 'converted') as converted_leads,
    ROUND(AVG(l.score), 2) as avg_lead_score,
    ROUND(
        COUNT(l.id) FILTER (WHERE l.status = 'qualified')::DECIMAL / 
        NULLIF(COUNT(lge.id), 0) * 100, 2
    ) as qualification_rate,
    ROUND(AVG(lge.time_to_conversion), 2) as avg_conversion_time
FROM lead_generation_events lge
LEFT JOIN leads l ON lge.lead_id = l.id
WHERE lge.conversion_timestamp >= CURRENT_DATE - INTERVAL '30 days'
    AND lge.utm_source IS NOT NULL
GROUP BY lge.utm_source, lge.utm_campaign
HAVING COUNT(lge.id) >= 5  -- Only campaigns with at least 5 leads
ORDER BY qualification_rate DESC, converted_leads DESC;

-- =====================================================================================
-- 5. USER BEHAVIOR & ENGAGEMENT QUERIES
-- =====================================================================================

-- User journey analysis
WITH session_journey AS (
    SELECT 
        pve.session_id,
        COUNT(DISTINCT pve.property_id) as properties_viewed,
        COUNT(pve.id) as total_page_views,
        MAX(pve.view_timestamp) - MIN(pve.view_timestamp) as session_duration,
        MAX(pve.scroll_depth) as max_scroll_depth,
        SUM(pve.time_on_page) as total_time_on_pages,
        BOOL_OR(pve.contact_button_clicked) as clicked_contact,
        BOOL_OR(pve.whatsapp_clicked) as clicked_whatsapp,
        BOOL_OR(pve.phone_clicked) as clicked_phone,
        BOOL_OR(pve.map_interacted) as interacted_with_map
    FROM property_view_events pve
    WHERE pve.view_timestamp >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY pve.session_id
)
SELECT 
    'Short sessions (1 view)' as session_type,
    COUNT(*) as session_count,
    ROUND(AVG(total_time_on_pages), 2) as avg_time_spent,
    ROUND(SUM(CASE WHEN clicked_contact OR clicked_whatsapp OR clicked_phone THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100, 2) as engagement_rate
FROM session_journey
WHERE properties_viewed = 1
UNION ALL
SELECT 
    'Medium sessions (2-4 views)' as session_type,
    COUNT(*) as session_count,
    ROUND(AVG(total_time_on_pages), 2) as avg_time_spent,
    ROUND(SUM(CASE WHEN clicked_contact OR clicked_whatsapp OR clicked_phone THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100, 2) as engagement_rate
FROM session_journey
WHERE properties_viewed BETWEEN 2 AND 4
UNION ALL
SELECT 
    'Long sessions (5+ views)' as session_type,
    COUNT(*) as session_count,
    ROUND(AVG(total_time_on_pages), 2) as avg_time_spent,
    ROUND(SUM(CASE WHEN clicked_contact OR clicked_whatsapp OR clicked_phone THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100, 2) as engagement_rate
FROM session_journey
WHERE properties_viewed >= 5;

-- Page interaction analysis
SELECT 
    'Contact Button' as interaction_type,
    COUNT(pve.id) FILTER (WHERE pve.contact_button_clicked = true) as total_interactions,
    COUNT(DISTINCT pve.session_id) FILTER (WHERE pve.contact_button_clicked = true) as unique_users,
    ROUND(
        COUNT(pve.id) FILTER (WHERE pve.contact_button_clicked = true)::DECIMAL / 
        NULLIF(COUNT(pve.id), 0) * 100, 2
    ) as interaction_rate
FROM property_view_events pve
WHERE pve.view_timestamp >= CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
    'WhatsApp Button' as interaction_type,
    COUNT(pve.id) FILTER (WHERE pve.whatsapp_clicked = true) as total_interactions,
    COUNT(DISTINCT pve.session_id) FILTER (WHERE pve.whatsapp_clicked = true) as unique_users,
    ROUND(
        COUNT(pve.id) FILTER (WHERE pve.whatsapp_clicked = true)::DECIMAL / 
        NULLIF(COUNT(pve.id), 0) * 100, 2
    ) as interaction_rate
FROM property_view_events pve
WHERE pve.view_timestamp >= CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
    'Phone Button' as interaction_type,
    COUNT(pve.id) FILTER (WHERE pve.phone_clicked = true) as total_interactions,
    COUNT(DISTINCT pve.session_id) FILTER (WHERE pve.phone_clicked = true) as unique_users,
    ROUND(
        COUNT(pve.id) FILTER (WHERE pve.phone_clicked = true)::DECIMAL / 
        NULLIF(COUNT(pve.id), 0) * 100, 2
    ) as interaction_rate
FROM property_view_events pve
WHERE pve.view_timestamp >= CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
    'Map Interaction' as interaction_type,
    COUNT(pve.id) FILTER (WHERE pve.map_interacted = true) as total_interactions,
    COUNT(DISTINCT pve.session_id) FILTER (WHERE pve.map_interacted = true) as unique_users,
    ROUND(
        COUNT(pve.id) FILTER (WHERE pve.map_interacted = true)::DECIMAL / 
        NULLIF(COUNT(pve.id), 0) * 100, 2
    ) as interaction_rate
FROM property_view_events pve
WHERE pve.view_timestamp >= CURRENT_DATE - INTERVAL '30 days';

-- =====================================================================================
-- 6. FUNNEL ANALYSIS QUERIES
-- =====================================================================================

-- Lead generation funnel
WITH funnel_data AS (
    SELECT 
        COUNT(DISTINCT as_session.session_id) as total_sessions,
        COUNT(DISTINCT pve.session_id) as sessions_with_views,
        COUNT(DISTINCT pve.session_id) FILTER (WHERE 
            pve.contact_button_clicked = true OR 
            pve.whatsapp_clicked = true OR 
            pve.phone_clicked = true
        ) as sessions_with_engagement,
        COUNT(DISTINCT lge.session_id) as sessions_with_leads
    FROM analytics_sessions as_session
    LEFT JOIN property_view_events pve ON as_session.session_id = pve.session_id
        AND pve.view_timestamp >= CURRENT_DATE - INTERVAL '30 days'
    LEFT JOIN lead_generation_events lge ON as_session.session_id = lge.session_id
        AND lge.conversion_timestamp >= CURRENT_DATE - INTERVAL '30 days'
    WHERE as_session.first_seen >= CURRENT_DATE - INTERVAL '30 days'
        AND as_session.is_opted_out = false
)
SELECT 
    'Sessions' as funnel_step,
    total_sessions as count,
    100.0 as percentage,
    0.0 as drop_off_rate
FROM funnel_data
UNION ALL
SELECT 
    'Property Views' as funnel_step,
    sessions_with_views as count,
    ROUND(sessions_with_views::DECIMAL / total_sessions * 100, 2) as percentage,
    ROUND((total_sessions - sessions_with_views)::DECIMAL / total_sessions * 100, 2) as drop_off_rate
FROM funnel_data
UNION ALL
SELECT 
    'Engaged Users' as funnel_step,
    sessions_with_engagement as count,
    ROUND(sessions_with_engagement::DECIMAL / total_sessions * 100, 2) as percentage,
    ROUND((sessions_with_views - sessions_with_engagement)::DECIMAL / sessions_with_views * 100, 2) as drop_off_rate
FROM funnel_data
UNION ALL
SELECT 
    'Lead Generation' as funnel_step,
    sessions_with_leads as count,
    ROUND(sessions_with_leads::DECIMAL / total_sessions * 100, 2) as percentage,
    ROUND((sessions_with_engagement - sessions_with_leads)::DECIMAL / sessions_with_engagement * 100, 2) as drop_off_rate
FROM funnel_data;

-- =====================================================================================
-- 7. AGGREGATED REPORTING QUERIES
-- =====================================================================================

-- Weekly summary report
SELECT 
    DATE_TRUNC('week', CURRENT_DATE - INTERVAL '7 days' * generate_series)::date as week_start,
    COUNT(DISTINCT as_session.session_id) as unique_sessions,
    COUNT(pve.id) as total_views,
    COUNT(pve.id) FILTER (WHERE pve.is_unique_view = true) as unique_views,
    COUNT(lge.id) as leads_generated,
    ROUND(AVG(pve.time_on_page), 2) as avg_time_on_page,
    ROUND(AVG(pve.scroll_depth), 2) as avg_scroll_depth,
    ROUND(COUNT(lge.id)::DECIMAL / NULLIF(COUNT(DISTINCT as_session.session_id), 0) * 100, 2) as conversion_rate
FROM generate_series(0, 11) as generate_series
LEFT JOIN analytics_sessions as_session ON 
    DATE_TRUNC('week', as_session.first_seen) = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '7 days' * generate_series)
    AND as_session.is_opted_out = false
LEFT JOIN property_view_events pve ON as_session.session_id = pve.session_id
LEFT JOIN lead_generation_events lge ON as_session.session_id = lge.session_id
GROUP BY week_start
ORDER BY week_start DESC;

-- Monthly property type performance
SELECT 
    p.property_type,
    COUNT(DISTINCT p.id) as total_properties,
    COUNT(pve.id) as total_views,
    COUNT(pve.id) FILTER (WHERE pve.is_unique_view = true) as unique_views,
    COUNT(lge.id) as leads_generated,
    ROUND(AVG(pve.time_on_page), 2) as avg_time_on_page,
    ROUND(COUNT(lge.id)::DECIMAL / NULLIF(COUNT(pve.id) FILTER (WHERE pve.is_unique_view = true), 0) * 100, 2) as conversion_rate,
    ROUND(AVG(p.price), 2) as avg_property_price
FROM properties p
LEFT JOIN property_view_events pve ON p.id = pve.property_id
    AND pve.view_timestamp >= DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN lead_generation_events lge ON p.id = lge.property_id
    AND lge.conversion_timestamp >= DATE_TRUNC('month', CURRENT_DATE)
WHERE p.status = 'available'
GROUP BY p.property_type
ORDER BY total_views DESC;

-- =====================================================================================
-- 8. PERFORMANCE MONITORING QUERIES
-- =====================================================================================

-- Analytics system health check
SELECT 
    'Total Sessions (Last 24h)' as metric,
    COUNT(DISTINCT session_id) as value
FROM analytics_sessions
WHERE first_seen >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    AND is_opted_out = false
UNION ALL
SELECT 
    'Total Property Views (Last 24h)' as metric,
    COUNT(*) as value
FROM property_view_events
WHERE view_timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
UNION ALL
SELECT 
    'Total Leads (Last 24h)' as metric,
    COUNT(*) as value
FROM lead_generation_events
WHERE conversion_timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
UNION ALL
SELECT 
    'Opted Out Sessions' as metric,
    COUNT(*) as value
FROM analytics_sessions
WHERE is_opted_out = true
UNION ALL
SELECT 
    'Duplicate Views (Last 24h)' as metric,
    COUNT(*) as value
FROM property_view_events
WHERE view_timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    AND is_unique_view = false
UNION ALL
SELECT 
    'Data Retention (Days)' as metric,
    EXTRACT(days FROM CURRENT_TIMESTAMP - MIN(first_seen)) as value
FROM analytics_sessions;

-- Database size and cleanup status
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_stat_get_tuples_returned(c.oid) as rows_read,
    pg_stat_get_tuples_fetched(c.oid) as rows_fetched
FROM pg_tables 
JOIN pg_class c ON c.relname = tablename
WHERE schemaname = 'public' 
    AND tablename LIKE '%analytics%' OR tablename LIKE '%lead_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================================================
-- 9. CUSTOM REPORT TEMPLATES
-- =====================================================================================

-- Executive summary report (last 30 days)
WITH summary_data AS (
    SELECT 
        COUNT(DISTINCT as_session.session_id) as total_sessions,
        COUNT(DISTINCT pve.property_id) as properties_viewed,
        COUNT(pve.id) FILTER (WHERE pve.is_unique_view = true) as unique_views,
        COUNT(lge.id) as total_leads,
        COUNT(DISTINCT lge.lead_id) as unique_leads,
        AVG(pve.time_on_page) as avg_time_on_page,
        AVG(lge.time_to_conversion) as avg_conversion_time
    FROM analytics_sessions as_session
    LEFT JOIN property_view_events pve ON as_session.session_id = pve.session_id
        AND pve.view_timestamp >= CURRENT_DATE - INTERVAL '30 days'
    LEFT JOIN lead_generation_events lge ON as_session.session_id = lge.session_id
        AND lge.conversion_timestamp >= CURRENT_DATE - INTERVAL '30 days'
    WHERE as_session.first_seen >= CURRENT_DATE - INTERVAL '30 days'
        AND as_session.is_opted_out = false
)
SELECT 
    'MARCONI INMOBILIARIA - ANALYTICS EXECUTIVE SUMMARY' as report_title,
    'Last 30 Days: ' || (CURRENT_DATE - INTERVAL '30 days')::text || ' to ' || CURRENT_DATE::text as period,
    total_sessions || ' unique visitors' as traffic,
    properties_viewed || ' properties viewed' as property_interest,
    unique_views || ' unique property views' as engagement,
    total_leads || ' leads generated (' || unique_leads || ' unique)' as conversions,
    ROUND(total_leads::DECIMAL / total_sessions * 100, 2) || '% conversion rate' as performance,
    ROUND(avg_time_on_page, 0) || ' seconds average time per page' as engagement_quality,
    ROUND(avg_conversion_time, 0) || ' minutes average time to convert' as conversion_speed
FROM summary_data;

-- =====================================================================================
-- END OF SAMPLE QUERIES
-- =====================================================================================

-- Usage Notes:
-- 1. Replace date ranges as needed for different reporting periods
-- 2. Add WHERE clauses to filter by specific properties, campaigns, or sources
-- 3. Modify GROUP BY clauses for different aggregation levels
-- 4. Use HAVING clauses to filter aggregated results
-- 5. Combine queries with UNION ALL for comprehensive reports
-- 6. Use CTEs (WITH clauses) for complex multi-step calculations
-- 7. Consider performance impacts for large datasets - add appropriate indexes
-- 8. Test queries with EXPLAIN ANALYZE for optimization opportunities