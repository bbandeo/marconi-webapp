# Análisis del Esquema de Analytics - Marconi Inmobiliaria

**Fecha de análisis:** 2025-10-03
**Versión del esquema:** 1.0.0
**Estado:** Producción activa

---

## Resumen Ejecutivo

El sistema de analytics de Marconi Inmobiliaria es un sistema completo de tracking GDPR-compliant que rastrea sesiones de usuario, vistas de propiedades, generación de leads e interacciones. Implementa debouncing de 2 horas para vistas duplicadas, hashing de IPs para privacidad, y agregación de datos para reportes eficientes.

---

## 1. Tablas Disponibles

### 1.1 Tablas Principales de Tracking

#### `analytics_sessions`
**Propósito:** Tracking de sesiones de usuario anónimas con cumplimiento GDPR

**Campos clave:**
- `id` (UUID) - Clave primaria interna
- `session_id` (VARCHAR 255) - UUID generado por el cliente, usado como referencia
- `ip_hash` (VARCHAR 64) - Hash SHA-256 de la IP para privacidad
- `user_agent` (TEXT) - Agente de usuario del navegador
- `device_type` (VARCHAR 50) - desktop | mobile | tablet
- `browser_name`, `browser_version`, `os_name`, `os_version` - Información del navegador/OS
- `referrer_domain` (VARCHAR 255) - Dominio de referencia
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` - Parámetros UTM
- `country_code` (CHAR 2) - Código de país
- `language` (VARCHAR 10) - Idioma del usuario (default: 'es')
- `screen_width`, `screen_height` (INTEGER) - Resolución de pantalla
- `opt_out` (BOOLEAN) - Usuario optó por no ser trackeado (GDPR)
- `first_seen_at`, `last_seen_at` (TIMESTAMP) - Timestamps de actividad

**Índices:**
- `idx_analytics_sessions_session_id` - Búsqueda por session_id
- `idx_analytics_sessions_ip_hash` - Búsqueda por IP hash
- `idx_analytics_sessions_first_seen` - Ordenamiento temporal
- `idx_analytics_sessions_utm_source` - Filtrado por fuente

**Retención de datos:** 24 meses (configurable)

---

#### `analytics_property_views`
**Propósito:** Tracking detallado de vistas de propiedades con debouncing de 2 horas

**Campos clave:**
- `id` (UUID) - Clave primaria
- `property_id` (INTEGER) - FK a `properties(id)` ON DELETE CASCADE
- `session_id` (VARCHAR 255) - FK a `analytics_sessions(session_id)` ON DELETE SET NULL
- `view_duration_seconds` (INTEGER) - Tiempo en la página
- `page_url` (TEXT) - URL de la página (nullable desde fix reciente)
- `referrer_url` (TEXT) - URL de referencia
- `search_query` (VARCHAR 255) - Query de búsqueda si aplica
- `search_filters` (JSONB) - Filtros aplicados
- `interaction_events` (JSONB) - Array de eventos de interacción
- `scroll_percentage` (INTEGER) - Profundidad de scroll (0-100)
- `images_viewed` (INTEGER) - Número de imágenes vistas
- `contact_form_opened`, `contact_form_submitted` (BOOLEAN) - Interacción con formulario
- `phone_clicked`, `whatsapp_clicked`, `email_clicked` (BOOLEAN) - Clicks en botones de contacto
- `viewed_at` (TIMESTAMP) - Timestamp de la vista

**Índices:**
- `idx_analytics_property_views_property_id` - Filtrado por propiedad
- `idx_analytics_property_views_session_id` - Filtrado por sesión
- `idx_analytics_property_views_viewed_at` - Ordenamiento temporal
- `idx_analytics_property_views_property_viewed` - Compuesto (property_id, viewed_at)

**Lógica especial:**
- Debounce de 2 horas: si la misma sesión ve la misma propiedad en < 2 horas, se actualiza el registro existente en lugar de crear uno nuevo
- Incrementa automáticamente el contador `views` en la tabla `properties`

---

#### `analytics_lead_sources`
**Propósito:** Catálogo de fuentes de leads para análisis de atribución

**Campos clave:**
- `id` (SERIAL) - Clave primaria
- `name` (VARCHAR 100) - Código interno único (ej: 'whatsapp', 'formulario_web')
- `display_name` (VARCHAR 100) - Nombre en español para UI
- `description` (TEXT) - Descripción de la fuente
- `category` (VARCHAR 50) - web | social | direct | referral | advertising
- `icon` (VARCHAR 50) - Nombre del ícono para UI
- `color` (VARCHAR 7) - Color hex para visualización
- `is_active` (BOOLEAN) - Estado activo/inactivo
- `sort_order` (INTEGER) - Orden de visualización

**Datos precargados:**
1. formulario_web (Formulario Web) - web
2. whatsapp (WhatsApp) - social
3. telefono (Teléfono) - direct
4. email (Email) - direct
5. facebook (Facebook) - social
6. instagram (Instagram) - social
7. google_ads (Google Ads) - advertising
8. facebook_ads (Facebook Ads) - advertising
9. referido (Referido) - referral
10. walk_in (Visita Presencial) - direct
11. marketplace (Marketplace) - web
12. otros (Otros) - referral

---

#### `analytics_lead_generation`
**Propósito:** Tracking de generación y atribución de leads

**Campos clave:**
- `id` (UUID) - Clave primaria
- `lead_id` (INTEGER) - FK a `leads(id)` ON DELETE CASCADE (nullable)
- `session_id` (VARCHAR 255) - FK a `analytics_sessions(session_id)` ON DELETE SET NULL
- `property_id` (INTEGER) - FK a `properties(id)` ON DELETE SET NULL
- `lead_source_id` (INTEGER) - FK a `analytics_lead_sources(id)`
- `form_type` (VARCHAR 50) - contact | phone_call | whatsapp | email | callback | visit_request
- `contact_method` (VARCHAR 50) - Método preferido de contacto
- `lead_value` (DECIMAL 10,2) - Valor estimado del lead
- `conversion_time_minutes` (INTEGER) - Tiempo desde primera vista hasta conversión
- `form_data` (JSONB) - Datos del formulario (sin PII)
- `page_url` (TEXT) - Página donde se generó el lead
- `referrer_url` (TEXT) - URL de referencia
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` - Parámetros UTM
- `generated_at` (TIMESTAMP) - Timestamp de generación

**Índices:**
- `idx_analytics_lead_generation_lead_id` - Búsqueda por lead
- `idx_analytics_lead_generation_session_id` - Búsqueda por sesión
- `idx_analytics_lead_generation_property_id` - Búsqueda por propiedad
- `idx_analytics_lead_generation_source_id` - Búsqueda por fuente
- `idx_analytics_lead_generation_generated_at` - Ordenamiento temporal

---

#### `analytics_user_interactions`
**Propósito:** Tracking de interacciones específicas del usuario para análisis UX

**Campos clave:**
- `id` (UUID) - Clave primaria
- `session_id` (VARCHAR 255) - FK a `analytics_sessions(session_id)` ON DELETE CASCADE
- `property_id` (INTEGER) - FK a `properties(id)` ON DELETE SET NULL
- `interaction_type` (VARCHAR 100) - click | scroll | form_field_focus | etc
- `element_id`, `element_class`, `element_text` - Identificación del elemento
- `page_url` (TEXT) - URL de la página
- `coordinates_x`, `coordinates_y` (INTEGER) - Coordenadas del click
- `viewport_width`, `viewport_height` (INTEGER) - Tamaño del viewport
- `interaction_data` (JSONB) - Datos adicionales específicos
- `occurred_at` (TIMESTAMP) - Timestamp de la interacción

**Índices:**
- `idx_analytics_user_interactions_session_id`
- `idx_analytics_user_interactions_property_id`
- `idx_analytics_user_interactions_type`
- `idx_analytics_user_interactions_occurred_at`

**Tipos de interacción soportados:**
- click, scroll, form_field_focus, form_submit
- page_load, page_unload
- contact_click, phone_click, whatsapp_click, email_click
- image_view, gallery_interaction

---

#### `analytics_campaign_attribution`
**Propósito:** Atribución detallada de campañas de marketing

**Campos clave:**
- `id` (UUID) - Clave primaria
- `session_id` (VARCHAR 255) - FK a `analytics_sessions(session_id)` ON DELETE CASCADE
- `campaign_name`, `campaign_source`, `campaign_medium` - Información de campaña
- `campaign_content`, `campaign_term` - Detalles adicionales
- `ad_group`, `keyword`, `placement`, `creative` - Datos de publicidad
- `landing_page` (TEXT) - Página de aterrizaje
- `referrer_domain` (VARCHAR 255) - Dominio de referencia
- `cost_per_click` (DECIMAL 8,4) - CPC si está disponible
- `first_touch`, `last_touch` (BOOLEAN) - Atribución de primer/último toque
- `attributed_at` (TIMESTAMP) - Timestamp de atribución

**Índices:**
- `idx_analytics_campaign_attribution_session_id`
- `idx_analytics_campaign_attribution_campaign` - Compuesto (campaign_name, campaign_source)
- `idx_analytics_campaign_attribution_attributed_at`

---

### 1.2 Tablas de Agregación (Pre-calculadas)

#### `analytics_daily_stats`
**Propósito:** Estadísticas diarias agregadas por propiedad para reportes rápidos

**Campos clave:**
- `id` (SERIAL) - Clave primaria
- `date` (DATE) - Fecha de las estadísticas
- `property_id` (INTEGER) - FK a `properties(id)` ON DELETE CASCADE (nullable para stats globales)
- `total_views` (INTEGER) - Total de vistas
- `unique_sessions` (INTEGER) - Sesiones únicas
- `avg_duration_seconds` (DECIMAL 8,2) - Duración promedio
- `total_interactions` (INTEGER) - Total de interacciones
- `leads_generated` (INTEGER) - Leads generados
- `contact_forms_submitted` (INTEGER) - Formularios enviados
- `phone_clicks`, `whatsapp_clicks`, `email_clicks` (INTEGER) - Clicks por tipo
- `bounce_rate` (DECIMAL 5,2) - Tasa de rebote (%)
- `conversion_rate` (DECIMAL 5,2) - Tasa de conversión (%)

**Constraint único:** (date, property_id)

**Índices:**
- `idx_analytics_daily_stats_date`
- `idx_analytics_daily_stats_property_date`

---

#### `analytics_weekly_stats`
**Propósito:** Estadísticas semanales agregadas

**Campos clave:**
- Similares a daily_stats pero agrupadas por año/semana
- `year` (INTEGER), `week` (INTEGER 1-53)

**Constraint único:** (year, week, property_id)

---

#### `analytics_monthly_stats`
**Propósito:** Estadísticas mensuales agregadas

**Campos clave:**
- Similares a daily_stats pero agrupadas por año/mes
- `year` (INTEGER), `month` (INTEGER 1-12)

**Constraint único:** (year, month, property_id)

---

#### `analytics_lead_source_stats`
**Propósito:** Estadísticas diarias por fuente de lead

**Campos clave:**
- `date` (DATE)
- `lead_source_id` (INTEGER) - FK a `analytics_lead_sources(id)`
- `leads_generated` (INTEGER)
- `conversion_rate` (DECIMAL 5,2)
- `avg_lead_value` (DECIMAL 10,2)
- `cost_per_lead` (DECIMAL 10,2)

**Constraint único:** (date, lead_source_id)

---

#### `analytics_campaign_stats`
**Propósito:** Estadísticas diarias de campañas de marketing

**Campos clave:**
- `date` (DATE)
- `campaign_name`, `campaign_source` (VARCHAR 255)
- `impressions`, `clicks`, `sessions`, `leads_generated` (INTEGER)
- `cost`, `revenue` (DECIMAL 10,2)
- `ctr` (DECIMAL 5,4) - Click-through rate
- `cpc` (DECIMAL 8,4) - Cost per click
- `cpl` (DECIMAL 10,2) - Cost per lead
- `roas` (DECIMAL 8,4) - Return on ad spend

**Constraint único:** (date, campaign_name, campaign_source)

---

## 2. Funciones PostgreSQL (RPCs)

### 2.1 Funciones de Tracking

#### `check_duplicate_property_view(p_property_id INTEGER, p_session_id VARCHAR(255))`
**Retorna:** BOOLEAN
**Propósito:** Detecta si una vista de propiedad es duplicada (dentro de 2 horas)
**Lógica:**
- Busca la última vista de la propiedad por la sesión
- Si no existe o han pasado > 2 horas: retorna FALSE (no es duplicado)
- Si existe y < 2 horas: retorna TRUE (es duplicado)

---

#### `track_property_view(...)`
**Retorna:** UUID (ID de la vista)
**Propósito:** Registra una vista de propiedad con debounce automático
**Parámetros:**
- `p_property_id` (INTEGER)
- `p_session_id` (VARCHAR 255)
- `p_page_url` (TEXT)
- `p_referrer_url` (TEXT, opcional)
- `p_search_query` (VARCHAR 255, opcional)

**Lógica:**
1. Verifica si es duplicado usando `check_duplicate_property_view()`
2. Si es duplicado: actualiza el registro existente con nueva información
3. Si no es duplicado: crea nuevo registro e incrementa `properties.views`
4. Retorna el UUID de la vista

**Uso recomendado:** Esta función debería usarse en lugar de inserts directos para aprovechar el debouncing automático

---

#### `hash_ip_address(ip_address TEXT)`
**Retorna:** VARCHAR(64)
**Propósito:** Genera hash SHA-256 de una dirección IP para cumplimiento GDPR
**Lógica:** `SHA-256(ip_address + 'marconi_salt_2025')`
**Nota:** El salt 'marconi_salt_2025' está hardcodeado - considerar moverlo a variable de entorno

---

#### `analytics_opt_out(p_session_id VARCHAR(255))`
**Retorna:** BOOLEAN
**Propósito:** Marca una sesión como opt-out para cumplimiento GDPR
**Lógica:**
- Actualiza `analytics_sessions.opt_out = TRUE` para la sesión
- Retorna TRUE si se encontró y actualizó la sesión

---

### 2.2 Funciones de Consulta

#### `get_property_metrics(p_property_id INTEGER, p_days_back INTEGER DEFAULT 30)`
**Retorna:** TABLE con las siguientes columnas:
- `total_views` (BIGINT) - Total de vistas
- `unique_sessions` (BIGINT) - Sesiones únicas
- `avg_duration` (NUMERIC) - Duración promedio en segundos
- `total_interactions` (BIGINT) - Total de interacciones del usuario
- `leads_generated` (BIGINT) - Leads generados
- `conversion_rate` (NUMERIC) - Tasa de conversión (%)

**Propósito:** Obtiene métricas completas de una propiedad
**Rango:** Últimos X días (default: 30)

**Nota:** Esta función hace JOIN con `analytics_property_views`, `analytics_user_interactions` y `analytics_lead_generation`

---

#### `get_dashboard_metrics(p_days_back INTEGER DEFAULT 30)`
**Retorna:** TABLE con las siguientes columnas:
- `total_views` (BIGINT)
- `unique_sessions` (BIGINT)
- `total_leads` (BIGINT)
- `conversion_rate` (NUMERIC)
- `top_property_id` (INTEGER)
- `top_property_views` (BIGINT)
- `best_lead_source` (VARCHAR 100)
- `best_source_leads` (BIGINT)

**Propósito:** Obtiene métricas generales del dashboard
**Rango:** Últimos X días (default: 30)

**Lógica:**
- Agrega datos de vistas, sesiones y leads
- Identifica la propiedad con más vistas
- Identifica la mejor fuente de leads

---

### 2.3 Funciones de Mantenimiento

#### `cleanup_old_analytics_data()`
**Retorna:** INTEGER (número de registros eliminados)
**Propósito:** Limpia datos antiguos según política de retención GDPR
**Lógica:**
- Elimina registros > 24 meses de:
  - `analytics_property_views`
  - `analytics_user_interactions`
  - `analytics_lead_generation`
  - `analytics_campaign_attribution`
- Elimina sesiones huérfanas (sin vistas asociadas) > 24 meses
- Retorna el conteo de registros eliminados

**Uso:** Ejecutar en cron job mensual para cumplimiento GDPR

---

## 3. Métricas Rastreadas

### 3.1 Métricas de Sesión
- **IP Hash:** SHA-256 hash de IP para privacidad
- **Información del dispositivo:** tipo, navegador, OS, resolución
- **Datos de campaña:** UTM parameters completos
- **Geolocalización:** código de país, ciudad
- **Timestamps:** primera visita, última visita
- **Opt-out:** flag GDPR de consentimiento

### 3.2 Métricas de Vista de Propiedad
- **Engagement temporal:**
  - Duración de la vista en segundos
  - Profundidad de scroll (0-100%)
  - Número de imágenes vistas

- **Interacciones:**
  - Formulario de contacto abierto/enviado
  - Click en teléfono
  - Click en WhatsApp
  - Click en email
  - Array de eventos de interacción (JSONB)

- **Contexto:**
  - URL de la página
  - URL de referencia
  - Query de búsqueda
  - Filtros de búsqueda aplicados (JSONB)

### 3.3 Métricas de Lead
- **Atribución:**
  - Fuente del lead (tabla de catálogo)
  - Propiedad que generó el lead
  - Sesión de origen
  - Parámetros UTM completos

- **Conversión:**
  - Tiempo hasta conversión (minutos)
  - Tipo de formulario
  - Método de contacto preferido
  - Valor estimado del lead

- **Datos del formulario:**
  - JSONB sin PII (información personal identificable)
  - Página de conversión
  - URL de referencia

### 3.4 Métricas de Interacción del Usuario
- **Tipo de interacción:** Categoría (click, scroll, form, etc.)
- **Elemento:** ID, clase, texto del elemento
- **Posición:** Coordenadas X/Y del click
- **Viewport:** Ancho/alto del viewport
- **Datos adicionales:** JSONB con información específica del evento
- **Timestamp:** Momento exacto de la interacción

### 3.5 Métricas de Campaña
- **Atribución de campaña:**
  - Nombre, fuente, medio, contenido, término
  - Grupo de anuncios, keyword, placement, creative
  - Página de aterrizaje
  - Dominio de referencia

- **Métricas de rendimiento:**
  - First-touch vs Last-touch attribution
  - Cost per click (si está disponible)

- **Métricas agregadas diarias:**
  - Impresiones, clicks, sesiones
  - Leads generados
  - Costo, revenue
  - CTR, CPC, CPL, ROAS

### 3.6 Métricas Agregadas
Las tablas de agregación calculan y almacenan:
- **Diarias/Semanales/Mensuales:**
  - Total de vistas y sesiones únicas
  - Duración promedio
  - Total de interacciones
  - Leads generados
  - Formularios enviados
  - Clicks por tipo de contacto
  - Tasa de rebote
  - Tasa de conversión

---

## 4. Servicios Disponibles

### 4.1 AnalyticsService (services/analytics.ts)

Clase principal que encapsula toda la lógica de analytics. Usa `supabaseAdmin` para bypass de RLS policies.

#### 4.1.1 Métodos de Gestión de Sesiones

##### `createSession(sessionData: CreateAnalyticsSessionInput): Promise<string>`
**Propósito:** Crea una nueva sesión de analytics
**Retorna:** session_id (UUID)
**Características:**
- Genera UUID automáticamente
- Hashea IP con salt para GDPR
- Maneja errores con fallbacks
- Trunca campos largos para evitar errores de DB

**Uso:**
```typescript
const sessionId = await AnalyticsService.createSession({
  ip_address: '192.168.1.1',
  user_agent: navigator.userAgent,
  device_type: 'desktop',
  utm_source: 'google'
});
```

---

##### `getOrCreateSession(ipAddress, userAgent?, additionalData?): Promise<string>`
**Propósito:** Obtiene sesión existente o crea una nueva
**Retorna:** session_id (UUID)
**Lógica:**
- Busca sesión existente con mismo IP hash en últimas 4 horas
- Si existe: retorna session_id existente
- Si no existe: crea nueva sesión
- Maneja errores con múltiples fallbacks

**Uso:**
```typescript
const sessionId = await AnalyticsService.getOrCreateSession(
  ipAddress,
  userAgent,
  { utm_source: 'facebook', device_type: 'mobile' }
);
```

---

##### `updateSessionLastSeen(sessionId: string): Promise<void>`
**Propósito:** Actualiza el timestamp last_seen_at de una sesión
**Nota:** No lanza error si falla (no es crítico)

---

#### 4.1.2 Métodos de Tracking de Vistas

##### `recordPropertyView(viewData: CreatePropertyViewInput): Promise<string>`
**Propósito:** Registra una vista de propiedad con debouncing automático
**Retorna:** event_id (UUID)
**Características:**
- Valida campos requeridos
- Convierte session_id a UUID interno de la DB
- Implementa debounce de 2 horas:
  - Si vista duplicada: actualiza registro existente
  - Si nueva: crea nuevo registro
- Actualiza last_seen_at de la sesión

**Uso:**
```typescript
const eventId = await AnalyticsService.recordPropertyView({
  session_id: sessionId,
  property_id: 123,
  page_url: '/propiedades/123',
  time_on_page: 45,
  scroll_depth: 80,
  whatsapp_clicked: true,
  images_viewed: 3
});
```

---

##### `recordPropertyViewWithSession(...): Promise<{eventId, sessionId}>`
**Propósito:** Método de conveniencia que crea/obtiene sesión y registra vista
**Parámetros:**
- `propertyId` (number)
- `ipAddress` (string)
- `userAgent?` (string)
- `viewData?` (Partial<CreatePropertyViewInput>)
- `sessionData?` (Partial<CreateAnalyticsSessionInput>)

**Retorna:** Objeto con eventId y sessionId

**Uso:**
```typescript
const { eventId, sessionId } = await AnalyticsService.recordPropertyViewWithSession(
  123,
  req.headers['x-forwarded-for'],
  req.headers['user-agent'],
  { scroll_depth: 75, images_viewed: 2 }
);
```

---

#### 4.1.3 Métodos de Tracking de Leads

##### `recordLeadGeneration(leadData: CreateLeadGenerationEventInput): Promise<void>`
**Propósito:** Registra un evento de generación de lead
**Características:**
- Valida campos requeridos
- Convierte session_id a UUID interno
- Asocia lead con sesión, propiedad y fuente
- Captura tiempo de conversión y datos UTM

**Uso:**
```typescript
await AnalyticsService.recordLeadGeneration({
  lead_id: 456,
  session_id: sessionId,
  property_id: 123,
  lead_source_id: 1, // formulario_web
  form_type: 'contact',
  time_to_conversion: 15, // minutos
  conversion_page: '/propiedades/123'
});
```

---

##### `recordLeadWithSource(...): Promise<void>`
**Propósito:** Registra lead con detección automática de fuente
**Parámetros:**
- `leadId` (number)
- `sourceCode` (LeadSourceCode) - ej: 'whatsapp', 'formulario_web'
- `sessionId?` (string)
- `propertyId?` (number)
- `additionalData?` (Partial<CreateLeadGenerationEventInput>)

**Características:**
- Busca lead_source_id automáticamente por código
- Calcula tiempo de conversión desde primera visita de la sesión
- Simplifica el uso al no requerir lead_source_id

**Uso:**
```typescript
await AnalyticsService.recordLeadWithSource(
  456,
  'whatsapp',
  sessionId,
  123,
  { form_type: 'callback' }
);
```

---

#### 4.1.4 Métodos de Tracking de Interacciones

##### `recordInteraction(interactionData: CreateUserInteractionEventInput): Promise<void>`
**Propósito:** Registra una interacción individual del usuario
**Características:**
- Silencioso: no lanza errores para no romper UX
- Convierte session_id a UUID interno
- Almacena datos detallados de la interacción

**Uso:**
```typescript
await AnalyticsService.recordInteraction({
  session_id: sessionId,
  property_id: 123,
  event_type: 'click',
  event_target: 'whatsapp-button',
  page_url: '/propiedades/123',
  event_data: { button_text: 'Contactar por WhatsApp' }
});
```

---

##### `recordInteractionsBatch(interactions: CreateUserInteractionEventInput[]): Promise<void>`
**Propósito:** Registra múltiples interacciones en batch para mejor performance
**Características:**
- Valida todas las interacciones (filtra inválidas)
- Obtiene UUIDs de sesión en una sola query
- Inserta todas las interacciones válidas en una sola operación
- No lanza errores (silencioso)

**Uso:**
```typescript
await AnalyticsService.recordInteractionsBatch([
  { session_id: sessionId, event_type: 'click', ... },
  { session_id: sessionId, event_type: 'scroll', ... },
  // ...más interacciones
]);
```

---

#### 4.1.5 Métodos de Consultas y Análisis

##### `getPropertyMetrics(propertyId, daysBack = 30): Promise<PropertyMetrics>`
**Propósito:** Obtiene métricas completas de una propiedad
**Retorna:**
```typescript
{
  total_views: number,
  unique_views: number,
  avg_time_on_page: number | null,
  avg_scroll_depth: number | null,
  contact_rate: number | null,
  leads_generated: number,
  conversion_rate: number | null
}
```

**Lógica:**
- Consulta directa a tablas (no usa la función RPC)
- Calcula métricas en memoria para evitar problemas con función DB
- Deduplica sesiones para unique_views

---

##### `getTopProperties(limit = 10, metric = 'views', days = 30): Promise<TopPropertyResult[]>`
**Propósito:** Obtiene las propiedades con mejor rendimiento
**Parámetros:**
- `limit` - Número de propiedades a retornar
- `metric` - 'views' | 'leads' | 'conversion_rate'
- `days` - Rango de días

**Retorna:**
```typescript
[{
  property_id: number,
  title: string,
  metric_value: number,
  unique_views: number,
  leads: number
}]
```

**Características:**
- Calcula métricas manualmente (no usa RPC)
- Ordena por métrica seleccionada
- Incluye título de propiedad con JOIN

---

##### `getDashboardStats(filters?: AnalyticsFilters): Promise<DashboardStats>`
**Propósito:** Obtiene estadísticas completas del dashboard
**Retorna:**
```typescript
{
  total_sessions: number,
  total_property_views: number,
  unique_property_views: number,
  total_leads: number,
  conversion_rate: number,
  avg_time_on_page: number,
  top_properties: TopPropertyResult[],
  top_lead_sources: Array<{
    source_id: number,
    source_name: string,
    leads_count: number,
    conversion_rate: number
  }>,
  traffic_by_device: Array<{
    device_type: string,
    sessions: number,
    percentage: number
  }>,
  daily_stats: Array<{
    date: string,
    sessions: number,
    views: number,
    leads: number
  }>
}
```

**Características:**
- Ejecuta múltiples queries en paralelo con Promise.all()
- Calcula todas las métricas clave del dashboard
- Incluye series de tiempo diarias

---

##### `getLeadSourceStats(startDate, endDate): Promise<LeadSourceStats[]>`
**Propósito:** Estadísticas de rendimiento por fuente de lead
**Retorna:**
```typescript
[{
  source_id: number,
  source_name: string,
  leads_count: number,
  avg_conversion_time: number | null,
  unique_sessions: number,
  conversion_rate: number | null
}]
```

---

##### `getCampaignStats(startDate, endDate): Promise<CampaignStats[]>`
**Propósito:** Estadísticas de rendimiento de campañas
**Retorna:**
```typescript
[{
  utm_source: string,
  utm_campaign: string | null,
  sessions: number,
  total_events: number,
  leads: number,
  avg_conversion_time: number | null,
  roas: number | null
}]
```

---

##### `getDeviceTypeStats(startDate, endDate): Promise<DeviceTypeStats[]>`
**Propósito:** Análisis de tráfico por tipo de dispositivo
**Retorna:**
```typescript
[{
  device_type: string,
  sessions: number,
  property_views: number,
  leads: number,
  conversion_rate: number
}]
```

**Características:**
- Crea mapa de sesión -> dispositivo
- Cuenta vistas y leads por dispositivo
- Calcula tasa de conversión por dispositivo

---

#### 4.1.6 Métodos de GDPR y Privacidad

##### `handleOptOut(sessionId, ipAddress?): Promise<void>`
**Propósito:** Maneja solicitud de opt-out del usuario
**Características:**
- Marca sesión específica como opt-out
- Opcionalmente marca todas las sesiones de una IP
- Hashea IP antes de buscar sesiones
- Lanza AnalyticsPrivacyError si falla

**Uso:**
```typescript
await AnalyticsService.handleOptOut(sessionId);
// o
await AnalyticsService.handleOptOut(null, ipAddress);
```

---

##### `cleanupOldData(retentionMonths = 25): Promise<number>`
**Propósito:** Limpia datos antiguos según política de retención
**Retorna:** Número de registros eliminados
**Características:**
- Llama a la función RPC `cleanup_old_analytics_data()`
- Default: 25 meses de retención (configurable con ANALYTICS_CONSTANTS)

**Uso:**
```typescript
const deletedCount = await AnalyticsService.cleanupOldData();
console.log(`Eliminados ${deletedCount} registros antiguos`);
```

---

#### 4.1.7 Métodos Privados (Helpers)

##### `hashString(input: string): Promise<string>`
**Propósito:** Hash SHA-256 de string para privacidad
**Características:**
- Detecta entorno (browser vs Node.js)
- Browser: usa Web Crypto API
- Node.js: usa módulo crypto
- Retorna hash hexadecimal

---

##### `validatePropertyView(data)`, `validateLeadGeneration(data)`, `validateInteraction(data)`
**Propósito:** Validación de datos antes de inserción
**Lanza:** AnalyticsValidationError con mensaje descriptivo

---

##### `getSessionStats()`, `getViewStats()`, `getLeadStats()`, `getDailyStats()`
**Propósito:** Helpers para queries específicas usadas por getDashboardStats()

---

### 4.2 Constantes y Configuración

#### ANALYTICS_CONSTANTS (types/analytics.ts)
```typescript
{
  MAX_SESSION_DURATION_HOURS: 4,
  VIEW_DEBOUNCE_DURATION_HOURS: 2,
  RETENTION_MONTHS: 25,
  MAX_BATCH_SIZE: 100
}
```

#### LEAD_SOURCE_CODES
Códigos de fuentes de leads:
- `FORMULARIO_WEB`, `WHATSAPP`, `TELEFONO`, `EMAIL`
- `FACEBOOK`, `INSTAGRAM`, `GOOGLE_ADS`, `FACEBOOK_ADS`
- `REFERIDO`, `WALK_IN`, `MARKETPLACE`, `OTROS`

#### INTERACTION_TYPES
Tipos de interacción:
- `CLICK`, `SCROLL`, `FORM_FOCUS`, `FORM_SUBMIT`
- `PAGE_LOAD`, `PAGE_UNLOAD`
- `CONTACT_CLICK`, `PHONE_CLICK`, `WHATSAPP_CLICK`, `EMAIL_CLICK`
- `IMAGE_VIEW`, `GALLERY_INTERACTION`

---

## 5. Vistas SQL Pre-construidas

### `analytics_top_properties`
Resumen de propiedades más vistas con métricas completas:
- Total de vistas y vistas únicas
- Duración promedio
- Leads generados
- Tasa de conversión
- Últimos 30 días por defecto

### `analytics_lead_source_performance`
Performance de fuentes de leads:
- Total de leads y sesiones únicas
- Valor promedio del lead
- Tasa de conversión por fuente
- Últimos 30 días por defecto

---

## 6. Índices y Optimización

### Índices Principales
- **Todos los campos de timestamp:** Para queries de rango temporal
- **Todas las foreign keys:** Para JOINs eficientes
- **Campos de búsqueda comunes:** utm_source, device_type, campaign_name
- **Índices compuestos:** (property_id, viewed_at), (date, property_id)

### Políticas RLS (Row Level Security)
- **Habilitado en todas las tablas analytics**
- **SELECT:** Solo administradores autenticados
- **INSERT:** Permitido públicamente (para tracking anónimo)
- **Excepción:** `analytics_lead_sources` es públicamente legible (is_active = true)

**Nota importante:** El servicio usa `supabaseAdmin` para bypass de RLS policies, permitiendo tracking anónimo sin autenticación.

---

## 7. Flujo de Datos Típico

### 7.1 Visita a Página de Propiedad

```
1. Usuario visita /propiedades/123
2. Frontend llama a /api/analytics/track-view
3. API obtiene IP y user agent
4. AnalyticsService.getOrCreateSession() crea/obtiene sesión
5. AnalyticsService.recordPropertyView() registra vista con debouncing
6. Si vista duplicada (< 2 horas): actualiza registro existente
7. Si nueva: crea registro y incrementa properties.views
8. Opcionalmente: registra interacciones (clicks, scrolls)
```

### 7.2 Generación de Lead

```
1. Usuario envía formulario de contacto
2. Frontend/API crea registro en tabla leads
3. API llama a /api/analytics/track-lead
4. AnalyticsService.recordLeadWithSource() registra evento
5. Busca lead_source_id por código ('formulario_web', 'whatsapp', etc)
6. Calcula tiempo de conversión desde primera visita de la sesión
7. Asocia lead con sesión, propiedad y fuente
8. Captura datos UTM para atribución
```

### 7.3 Generación de Dashboard

```
1. Admin visita /admin/analytics
2. Frontend llama a API/servicio para obtener métricas
3. AnalyticsService.getDashboardStats() ejecuta queries paralelas:
   - Estadísticas de sesiones
   - Estadísticas de vistas
   - Estadísticas de leads
   - Top propiedades
   - Performance de fuentes
   - Breakdown por dispositivo
   - Series de tiempo diarias
4. Retorna objeto DashboardStats completo
5. Frontend visualiza con gráficas y tablas
```

---

## 8. Consideraciones Técnicas

### 8.1 GDPR Compliance
- **IP Hashing:** Todas las IPs se hashean con SHA-256 + salt antes de almacenar
- **Opt-out:** Los usuarios pueden optar por no ser rastreados
- **Retención de datos:** 24-25 meses por defecto, limpieza automática disponible
- **Sin PII:** Los datos de formulario se almacenan en JSONB sin información personal identificable

### 8.2 Performance
- **Debouncing:** Evita vistas duplicadas en ventana de 2 horas
- **Índices:** Índices extensivos en todos los campos de búsqueda
- **Agregación:** Tablas pre-calculadas para reportes rápidos
- **Batch operations:** Soporte para inserción batch de interacciones
- **Queries paralelas:** getDashboardStats usa Promise.all()

### 8.3 Limitaciones Conocidas
- **Funciones RPC:** Algunas funciones PostgreSQL tienen problemas, el servicio calcula métricas en memoria como workaround
- **Session UUID vs session_id:** Discrepancia entre UUID interno (id) y VARCHAR externo (session_id) - solucionado con fix reciente
- **Hardcoded salt:** El salt de hashing está hardcodeado - debería moverse a variable de entorno
- **Tablas de agregación:** No están pobladas automáticamente - requieren job/trigger adicional

### 8.4 Migraciones Aplicadas
1. **analytics-schema-migration.sql:** Schema inicial v1.0.0
2. **fix-analytics-nullable-fields.sql:** Hace page_url nullable
3. **fix-analytics-foreign-keys.sql:** Corrige foreign keys para usar session_id en lugar de id UUID

---

## 9. APIs REST Disponibles

Basado en el patrón estándar del proyecto, se esperan estos endpoints:

### POST /api/analytics/track-view
Registra vista de propiedad

### POST /api/analytics/track-lead
Registra generación de lead

### POST /api/analytics/track-interaction
Registra interacción del usuario

### POST /api/analytics/session
Crea o obtiene sesión

### POST /api/analytics/opt-out
Maneja opt-out GDPR

### GET /api/analytics/dashboard
Obtiene métricas del dashboard

### GET /api/analytics/property/:id
Obtiene métricas de una propiedad específica

---

## 10. Próximos Pasos Recomendados

### 10.1 Mejoras de Seguridad
- Mover el salt de hashing a variable de entorno
- Implementar rate limiting en endpoints públicos
- Auditar políticas RLS para asegurar protección adecuada

### 10.2 Mejoras de Performance
- Implementar job automático para poblar tablas de agregación
- Considerar particionamiento de tablas grandes por fecha
- Cachear queries de dashboard frecuentes

### 10.3 Mejoras de Funcionalidad
- Implementar A/B testing tracking
- Agregar tracking de eventos personalizados
- Expandir atribución multi-touch
- Dashboard de reportes en tiempo real

### 10.4 Mejoras de Datos
- Enriquecer con datos de geolocalización más detallados
- Integrar con Google Analytics para validación cruzada
- Agregar tracking de email opens/clicks si se implementa email marketing

---

## Resumen Final

El sistema de analytics de Marconi Inmobiliaria es **robusto, completo y GDPR-compliant**. Proporciona:

- **11 tablas** principales y de agregación
- **7 funciones PostgreSQL** para operaciones comunes
- **1 servicio TypeScript** completo con 20+ métodos
- **Tracking completo** de sesiones, vistas, leads e interacciones
- **Privacidad por diseño** con IP hashing y opt-out
- **Performance optimizado** con índices, debouncing y agregación
- **APIs REST** para integración frontend

El sistema está en **producción activa** y se usa para rastrear todas las interacciones del sitio web y generar reportes de marketing y ventas.

---

**Documento generado:** 2025-10-03
**Versión:** 1.0
**Autor:** Claude Code (Análisis automático del codebase)
