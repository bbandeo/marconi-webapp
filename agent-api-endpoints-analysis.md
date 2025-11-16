# Análisis de Endpoints de Analytics API

## Resumen Ejecutivo

Este documento detalla todos los endpoints de la API de Analytics de Marconi Inmobiliaria. El sistema está construido sobre Next.js 15 con un enfoque en performance, seguridad y cumplimiento GDPR. Incluye 8 rutas principales con soporte para tracking de sesiones, visualizaciones de propiedades, generación de leads, interacciones de usuario y dashboards analíticos.

**Stack Detectado**: Next.js 15 con App Router, Supabase (PostgreSQL), TypeScript

**Características Generales**:
- Rate limiting por IP (in-memory store)
- Response caching con stale-while-revalidate
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy)
- Performance monitoring y headers de tiempo de respuesta
- GDPR compliance con IP hashing y opt-out

---

## 1. Dashboard Analytics API

**Archivo**: `app/api/analytics/dashboard/route.ts`

### GET /api/analytics/dashboard

**Propósito**: Obtener estadísticas completas del dashboard con métricas agregadas.

**Parámetros Query String**:
- `start_date` (string, opcional): Fecha inicio formato YYYY-MM-DD. Default: 30 días atrás
- `end_date` (string, opcional): Fecha fin formato YYYY-MM-DD. Default: hoy
- `property_ids` (string CSV, opcional): IDs de propiedades separados por coma (ej: "1,2,3")
- `lead_source_ids` (string CSV, opcional): IDs de fuentes de leads separados por coma
- `utm_source` (string, opcional): Filtro por fuente UTM
- `utm_campaign` (string, opcional): Filtro por campaña UTM
- `device_type` (string, opcional): Filtro por tipo de dispositivo
- `country_code` (string, opcional): Filtro por código de país
- `compact` (boolean, opcional): Respuesta compacta para móviles. Default: false

**Validaciones**:
- Rango de fechas máximo: 90 días
- Rate limit: 100 requests/hora por IP

**Estructura de Respuesta**:
```json
{
  "success": true,
  "data": {
    "sessions_count": 1000,
    "property_views_count": 5000,
    "leads_count": 150,
    "conversions_count": 25,
    "conversion_rate": 3.0,
    "avg_session_duration": 180,
    "avg_property_view_duration": 120,
    "bounce_rate": 35.5,
    "pages_per_session": 4.2,
    "views_trend": [],
    "leads_trend": [],
    "geographic_stats": [],
    "new_vs_returning": {},
    "hourly_traffic": []
  },
  "filters": { /* filtros aplicados */ },
  "meta": {
    "execution_time_ms": 250,
    "cached": false,
    "rate_limit": {
      "remaining": 99,
      "reset_time": 1234567890000
    },
    "compact": false
  }
}
```

**Headers de Respuesta**:
- `Cache-Control`: public, max-age=300, s-maxage=300, stale-while-revalidate=3600
- `X-RateLimit-Limit`: 100
- `X-RateLimit-Remaining`: número
- `X-RateLimit-Reset`: timestamp
- `X-Response-Time`: duración en ms
- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: DENY
- `X-XSS-Protection`: 1; mode=block
- `Referrer-Policy`: strict-origin-when-cross-origin

**Códigos de Error**:
- `400`: Rango de fechas inválido (INVALID_DATE_RANGE)
- `429`: Rate limit excedido (RATE_LIMIT_EXCEEDED)
- `500`: Error interno (INTERNAL_ERROR)

---

### POST /api/analytics/dashboard

**Propósito**: Consultas avanzadas del dashboard con selección de métricas específicas.

**Body JSON**:
```json
{
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "property_ids": [1, 2, 3],
  "lead_source_ids": [1, 2],
  "utm_source": "google",
  "utm_campaign": "verano-2025",
  "device_type": "mobile",
  "country_code": "ES",
  "metrics": ["overview", "properties", "campaigns", "sources", "devices"],
  "limit": 10,
  "compact": false
}
```

**Parámetros Body**:
- `metrics` (array, requerido): Array de métricas a obtener. Opciones:
  - `"overview"`: Métricas generales del dashboard
  - `"properties"`: Top propiedades por views/leads/conversión
  - `"campaigns"`: Estadísticas de campañas UTM
  - `"sources"`: Estadísticas por fuente de leads
  - `"devices"`: Estadísticas por tipo de dispositivo
  - `"all"`: Todas las métricas anteriores
- `limit` (number, opcional): Límite de resultados para top lists. Default: 10, Max: 50
- `compact` (boolean, opcional): Modo compacto (top 5). Default: false
- Otros parámetros igual que GET

**Validaciones**:
- Métricas debe ser array no vacío con valores válidos
- Rango de fechas máximo: 90 días
- Rate limit: 100 requests/hora por IP

**Estructura de Respuesta**:
```json
{
  "success": true,
  "data": {
    "overview": { /* si incluido en metrics */ },
    "top_properties": {
      "by_views": [],
      "by_leads": [],
      "by_conversion": []
    },
    "campaigns": [],
    "lead_sources": [],
    "devices": []
  },
  "filters": { /* filtros aplicados */ },
  "meta": {
    "execution_time_ms": 350,
    "metrics_requested": ["overview", "properties"],
    "cached": false,
    "rate_limit": {
      "remaining": 98,
      "reset_time": 1234567890000
    },
    "compact": false
  }
}
```

**Cache**: 60 segundos (más corto que GET)

---

## 2. Modules Analytics API

**Archivo**: `app/api/analytics/modules/[module]/route.ts`

### GET /api/analytics/modules/{module}

**Propósito**: Obtener datos analíticos específicos por módulo de dashboard.

**Módulos Válidos**:
- `overview`: Resumen ejecutivo con KPIs principales
- `sales`: Métricas de ventas, pipeline y conversión
- `marketing`: Campañas, generación de leads y canales
- `properties`: Analytics de propiedades individuales
- `customers`: Comportamiento de usuarios y journey

**Parámetros Query String**:
- Mismos que `/api/analytics/dashboard` GET
- Límite de rango: 180 días (más amplio que dashboard general)

**Configuración por Módulo**:

| Módulo | Cache TTL | Rate Limit | Descripción |
|--------|-----------|------------|-------------|
| overview | 300s (5min) | 100/hora | Executive overview con key metrics y KPIs |
| sales | 180s (3min) | 150/hora | Sales performance, pipeline y conversion metrics |
| marketing | 240s (4min) | 120/hora | Marketing campaigns, lead gen y channel performance |
| properties | 600s (10min) | 80/hora | Property analytics, performance y market insights |
| customers | 480s (8min) | 100/hora | Customer journey, behavior patterns y retention analytics |

**Estructura de Respuesta General**:
```json
{
  "success": true,
  "module": "properties",
  "data": { /* estructura específica del módulo */ },
  "filters": { /* filtros aplicados */ },
  "meta": {
    "execution_time_ms": 200,
    "cached": false,
    "rate_limit": {
      "remaining": 79,
      "reset_time": 1234567890000
    },
    "compact": false,
    "module_config": {
      "description": "Property analytics, performance, and market insights",
      "cache_ttl": 600
    }
  }
}
```

**Headers Adicionales**:
- `X-Module`: nombre del módulo

---

#### Módulo: Overview

**Endpoint**: `GET /api/analytics/modules/overview`

**Data Structure**:
```json
{
  "kpis": {
    "sessions_count": 1000,
    "property_views_count": 5000,
    "leads_count": 150,
    "conversion_rate": 3.0,
    /* ... más métricas del dashboard */
  },
  "top_properties": [
    {
      "property_id": 1,
      "title": "Casa en...",
      "unique_views": 250,
      "total_views": 500,
      "leads_generated": 15
    }
  ],
  "summary": {
    "total_properties": 45,
    "total_leads": 150,
    "conversion_rate": 3.0,
    "avg_time_on_site": 180
  }
}
```

---

#### Módulo: Sales

**Endpoint**: `GET /api/analytics/modules/sales`

**Data Structure**:
```json
{
  "pipeline": {
    "total_leads": 150,
    "conversion_rate": 3.0,
    "avg_lead_value": 0,
    "leads_trend": []
  },
  "top_performing_properties": [
    {
      "property_id": 1,
      "leads_generated": 20,
      "conversion_rate": 5.2
    }
  ],
  "lead_sources": [
    {
      "source_id": 1,
      "source_name": "WhatsApp",
      "leads_count": 50
    }
  ],
  "conversion_funnel": {
    "visitors": 1000,
    "property_views": 5000,
    "leads": 150,
    "conversions": 30
  }
}
```

---

#### Módulo: Marketing

**Endpoint**: `GET /api/analytics/modules/marketing`

**Data Structure**:
```json
{
  "campaigns": [
    {
      "campaign_name": "verano-2025",
      "sessions": 200,
      "leads": 25,
      "conversion_rate": 12.5
    }
  ],
  "lead_sources": [
    {
      "source_name": "organic_search",
      "leads_count": 50
    }
  ],
  "device_breakdown": [
    {
      "device_type": "mobile",
      "sessions": 600,
      "percentage": 60.0
    }
  ],
  "channel_performance": {
    "organic": {},
    "social": {},
    "direct": {},
    "referral": {}
  }
}
```

---

#### Módulo: Properties

**Endpoint**: `GET /api/analytics/modules/properties`

**Data Structure**:
```json
{
  "top_properties": {
    "by_views": [
      {
        "property_id": 1,
        "title": "Casa en...",
        "address": "Calle...",
        "neighborhood": "Palermo",
        "price": 250000,
        "images": ["url1", "url2"],
        "property_type": "casa",
        "operation_type": "venta",
        "created_at": "2025-01-01T00:00:00Z",
        "days_on_market": 30,
        "unique_views": 500,
        "total_views": 1200
      }
    ],
    "by_leads": [],
    "by_conversion_rate": []
  },
  "overview": {
    "total_properties": 20,
    "total_views": 5000,
    "avg_views_per_property": 250,
    "avg_time_on_property": 120
  },
  "performance_trends": {
    "views_trend": [],
    "leads_trend": []
  }
}
```

**Nota**: Este módulo enriquece los datos de analytics con detalles completos de la tabla `properties`.

---

#### Módulo: Customers

**Endpoint**: `GET /api/analytics/modules/customers`

**Data Structure**:
```json
{
  "behavior_overview": {
    "total_sessions": 1000,
    "avg_session_duration": 180,
    "bounce_rate": 35.5,
    "pages_per_session": 4.2
  },
  "device_preferences": [
    {
      "device_type": "mobile",
      "sessions": 600
    }
  ],
  "acquisition_channels": [],
  "geographic_distribution": [],
  "engagement_metrics": {
    "repeat_visitors": 200,
    "new_vs_returning": {},
    "time_trends": []
  }
}
```

---

### POST /api/analytics/modules/{module}

**Propósito**: Consultas complejas de módulos con parámetros personalizados.

**Body JSON**:
```json
{
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "property_ids": [1, 2, 3],
  "lead_source_ids": [1, 2],
  "utm_source": "google",
  "utm_campaign": "verano-2025",
  "device_type": "mobile",
  "country_code": "ES",
  "options": {
    // Opciones específicas del módulo
  }
}
```

**Cache**: TTL del módulo / 2 (más corto para POST)

---

## 3. Property Metrics API

**Archivo**: `app/api/analytics/property-metrics/[id]/route.ts`

### GET /api/analytics/property-metrics/{id}

**Propósito**: Obtener métricas detalladas de una propiedad específica.

**Parámetros de Ruta**:
- `id` (number, requerido): ID de la propiedad

**Parámetros Query String**:
- `start_date` (string, opcional): Fecha inicio
- `end_date` (string, opcional): Fecha fin
- `period` (string, opcional): Período predefinido. Opciones: `7d`, `30d`, `90d`, `1y`. Default: `30d`
- `compact` (boolean, opcional): Modo compacto con métricas simplificadas

**Validaciones**:
- Property ID debe ser número válido > 0
- Rango de fechas máximo: 1 año (365 días)
- Rate limit: 150 requests/hora por IP (mayor que otros endpoints)

**Estructura de Respuesta**:
```json
{
  "success": true,
  "data": {
    "property_id": 1,
    "period": {
      "start_date": "2024-12-04",
      "end_date": "2025-01-03",
      "period": "30d",
      "days_back": 30
    },
    "metrics": {
      "total_views": 500,
      "unique_views": 350,
      "total_leads": 20,
      "conversion_rate": 4.0,
      "avg_time_on_page": 120,
      "bounce_rate": 30.0,
      "whatsapp_clicks": 15,
      "phone_clicks": 10,
      "email_clicks": 5,
      "images_viewed_avg": 8.5,
      "views_trend": [],
      "leads_trend": [],
      "hourly_distribution": []
    }
  },
  "meta": {
    "execution_time_ms": 150,
    "rate_limit": {
      "remaining": 149,
      "reset_time": 1234567890000
    },
    "compact": false,
    "property_id": 1
  }
}
```

**Modo Compact**:
```json
{
  "metrics": {
    "total_views": 500,
    "total_leads": 20,
    "conversion_rate": 4.0,
    "avg_time_on_page": 120
  }
}
```

**Cache por Período**:
- `7d`: 120s (2 minutos)
- `30d`: 300s (5 minutos)
- `90d`, `1y`: 600s (10 minutos)

**Headers Adicionales**:
- `X-Property-ID`: ID de la propiedad

**Códigos de Error**:
- `400`: Property ID inválido (INVALID_PROPERTY_ID), período inválido (INVALID_PERIOD), rango de fechas inválido (INVALID_DATE_RANGE)

---

## 4. Session Management API

**Archivo**: `app/api/analytics/session/route.ts`

### POST /api/analytics/session

**Propósito**: Crear o recuperar una sesión de analytics con compliance GDPR.

**Body JSON**:
```json
{
  "user_agent": "Mozilla/5.0...",
  "country_code": "ES",
  "device_type": "mobile",
  "browser": "Chrome",
  "os": "Android",
  "referrer_domain": "google.com",
  "landing_page": "/propiedades",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "verano-2025",
  "utm_term": "casas baratas",
  "utm_content": "ad1"
}
```

**Parámetros Body** (todos opcionales):
- `user_agent` (string): User agent del browser. Si no se proporciona, se extrae del header
- `country_code` (string): Código ISO de país (2 letras)
- `device_type` (string): Tipo de dispositivo ("mobile", "desktop", "tablet")
- `browser` (string): Nombre del navegador
- `os` (string): Sistema operativo
- `referrer_domain` (string): Dominio de referencia
- `landing_page` (string): Página de aterrizaje
- `utm_source` (string): Fuente UTM
- `utm_medium` (string): Medio UTM
- `utm_campaign` (string): Campaña UTM
- `utm_term` (string): Término UTM
- `utm_content` (string): Contenido UTM

**Lógica**:
1. Extrae IP del header `x-forwarded-for` o `x-real-ip`
2. Hashea la IP con salt para GDPR compliance
3. Busca sesión existente en las últimas 24 horas (configurable)
4. Si existe, retorna el session_id existente
5. Si no existe, crea nueva sesión y retorna nuevo session_id

**Estructura de Respuesta**:
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Códigos de Error**:
- `500`: Error al crear sesión

---

### PUT /api/analytics/session

**Propósito**: Actualizar el timestamp de última actividad de una sesión.

**Parámetros Query String**:
- `session_id` (string, requerido): UUID de la sesión

**Estructura de Respuesta**:
```json
{
  "success": true
}
```

**Códigos de Error**:
- `400`: Session ID requerido
- `500`: Error al actualizar sesión

---

## 5. Property View Tracking API

**Archivo**: `app/api/analytics/property-view/route.ts`

### POST /api/analytics/property-view

**Propósito**: Registrar una visualización de propiedad con datos de interacción.

**Body JSON**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "property_id": 1,
  "time_on_page": 120,
  "scroll_depth": 75,
  "contact_button_clicked": true,
  "whatsapp_clicked": true,
  "phone_clicked": false,
  "email_clicked": false,
  "images_viewed": 8,
  "page_url": "/propiedades/1",
  "referrer_url": "/propiedades",
  "search_query": "casas en palermo"
}
```

**Parámetros Body**:
- `session_id` (string, requerido): UUID de la sesión
- `property_id` (number, requerido): ID de la propiedad (> 0)
- `time_on_page` (number, opcional): Tiempo en página en segundos
- `scroll_depth` (number, opcional): Profundidad de scroll (0-100%)
- `contact_button_clicked` (boolean, opcional): Si se clickeó botón de contacto
- `whatsapp_clicked` (boolean, opcional): Si se clickeó WhatsApp
- `phone_clicked` (boolean, opcional): Si se clickeó teléfono
- `email_clicked` (boolean, opcional): Si se clickeó email
- `images_viewed` (number, opcional): Número de imágenes vistas
- `page_url` (string, opcional): URL de la página
- `referrer_url` (string, opcional): URL de referencia
- `search_query` (string, opcional): Query de búsqueda que llevó a la propiedad

**Lógica Interna**:
- Utiliza función de base de datos con debouncing automático (2 horas)
- Si la misma sesión vio la misma propiedad en las últimas 2 horas, no duplica el registro
- Incrementa contador de views en tabla `properties` solo para views únicas

**Estructura de Respuesta**:
```json
{
  "success": true,
  "event_id": 123456
}
```

**Códigos de Error**:
- `400`: Session ID o Property ID requerido/inválido (AnalyticsValidationError)
- `500`: Error al registrar view

---

### PUT /api/analytics/property-view

**Propósito**: Registrar una visualización de propiedad con creación automática de sesión.

**Body JSON**:
```json
{
  "property_id": 1,
  "time_on_page": 120,
  "scroll_depth": 75,
  "contact_button_clicked": true,
  "whatsapp_clicked": true,
  "phone_clicked": false,
  "email_clicked": false,
  "images_viewed": 8,
  "page_url": "/propiedades/1",
  "referrer_url": "/propiedades",
  // Datos para crear sesión automáticamente
  "country_code": "ES",
  "device_type": "mobile",
  "browser": "Chrome",
  "os": "Android",
  "referrer_domain": "google.com",
  "landing_page": "/propiedades",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "verano-2025",
  "utm_term": "casas baratas",
  "utm_content": "ad1"
}
```

**Parámetros Body**:
- `property_id` (number, requerido): ID de la propiedad
- Datos de view (igual que POST)
- Datos de sesión (igual que POST /session)

**Lógica**:
1. Extrae IP y User-Agent de headers
2. Crea o recupera sesión automáticamente
3. Registra el property view con la sesión
4. Retorna tanto event_id como session_id

**Estructura de Respuesta**:
```json
{
  "success": true,
  "event_id": 123456,
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Uso**: Ideal para tracking simplificado donde el frontend no maneja sesiones explícitamente.

---

## 6. Lead Generation Tracking API

**Archivo**: `app/api/analytics/lead-generation/route.ts`

### POST /api/analytics/lead-generation

**Propósito**: Registrar un evento de generación de lead con atribución completa.

**Body JSON**:
```json
{
  "lead_id": 123,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "property_id": 1,
  "lead_source_id": 2,
  "form_type": "contact_form",
  "conversion_page": "/propiedades/1",
  "time_to_conversion": 300,
  "session_pages_viewed": 5,
  "properties_viewed": 3,
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "verano-2025",
  "utm_term": "casas baratas",
  "utm_content": "ad1"
}
```

**Parámetros Body**:
- `lead_id` (number, requerido): ID del lead creado (> 0)
- `session_id` (string, opcional): UUID de la sesión
- `property_id` (number, opcional): ID de la propiedad asociada
- `lead_source_id` (number, requerido): ID de la fuente del lead (> 0)
- `form_type` (string, opcional): Tipo de formulario ("contact_form", "whatsapp", "phone", "email")
- `conversion_page` (string, opcional): URL donde se generó el lead
- `time_to_conversion` (number, opcional): Tiempo hasta conversión en segundos
- `session_pages_viewed` (number, opcional): Páginas vistas en la sesión. Default: 1
- `properties_viewed` (number, opcional): Propiedades vistas antes del lead. Default: 0
- `utm_source` (string, opcional): Fuente UTM
- `utm_medium` (string, opcional): Medio UTM
- `utm_campaign` (string, opcional): Campaña UTM
- `utm_term` (string, opcional): Término UTM
- `utm_content` (string, opcional): Contenido UTM

**Estructura de Respuesta**:
```json
{
  "success": true,
  "message": "Lead generation event recorded successfully"
}
```

**Códigos de Error**:
- `400`: Lead ID o Lead Source ID inválido/requerido (AnalyticsValidationError)
- `500`: Error al registrar lead generation

---

### PUT /api/analytics/lead-generation

**Propósito**: Registrar un lead con detección automática de fuente por código.

**Body JSON**:
```json
{
  "lead_id": 123,
  "source_code": "WHATSAPP",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "property_id": 1,
  "form_type": "whatsapp",
  "conversion_page": "/propiedades/1",
  "session_pages_viewed": 5,
  "properties_viewed": 3,
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "verano-2025",
  "utm_term": "casas baratas",
  "utm_content": "ad1"
}
```

**Parámetros Body**:
- `lead_id` (number, requerido): ID del lead (> 0)
- `source_code` (string, requerido): Código de fuente de lead. Opciones típicas:
  - `"WHATSAPP"`: Lead por WhatsApp
  - `"PHONE"`: Lead por teléfono
  - `"EMAIL"`: Lead por email
  - `"CONTACT_FORM"`: Lead por formulario web
  - `"ORGANIC_SEARCH"`: Lead por búsqueda orgánica
  - `"SOCIAL_MEDIA"`: Lead por redes sociales
  - Etc. (definidos en tabla `analytics_lead_sources`)
- Otros campos igual que POST

**Lógica**:
1. Busca el `lead_source_id` en la tabla `analytics_lead_sources` usando el `source_code`
2. Si no existe, puede crear la fuente automáticamente (según configuración)
3. Registra el lead generation con la fuente encontrada/creada

**Estructura de Respuesta**:
```json
{
  "success": true,
  "message": "Lead recorded with source attribution"
}
```

**Uso**: Más simple que POST, no requiere conocer el lead_source_id.

---

## 7. User Interaction Tracking API

**Archivo**: `app/api/analytics/interaction/route.ts`

### POST /api/analytics/interaction

**Propósito**: Registrar eventos de interacción del usuario para análisis UX.

**Body JSON**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "property_id": 1,
  "event_type": "click",
  "event_target": "whatsapp_button",
  "page_url": "/propiedades/1",
  "event_data": {
    "button_text": "Contactar por WhatsApp",
    "position_x": 150,
    "position_y": 200
  },
  "timestamp": "2025-01-03T12:00:00Z"
}
```

**Parámetros Body**:
- `session_id` (string, requerido): UUID de la sesión
- `property_id` (number, opcional): ID de la propiedad asociada
- `event_type` (string, requerido): Tipo de evento. Ejemplos:
  - `"click"`: Click en elemento
  - `"scroll"`: Evento de scroll
  - `"hover"`: Hover sobre elemento
  - `"form_interaction"`: Interacción con formulario
  - `"video_play"`: Reproducción de video
  - `"image_view"`: Visualización de imagen
- `event_target` (string, opcional): Target del evento (ej: "whatsapp_button", "contact_form", "image_gallery")
- `page_url` (string, opcional): URL de la página. Si no se proporciona, se usa el Referer header
- `event_data` (JSON, opcional): Datos adicionales del evento en formato JSON
- `timestamp` (string, opcional): Timestamp ISO 8601. Si no se proporciona, se usa el momento actual

**Estructura de Respuesta**:
```json
{
  "success": true,
  "message": "Interaction recorded successfully"
}
```

**Códigos de Error**:
- `400`: Session ID o event_type requerido
- `500`: Error al registrar interacción

---

### PUT /api/analytics/interaction

**Propósito**: Registrar múltiples interacciones en batch.

**Body JSON**:
```json
{
  "interactions": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "property_id": 1,
      "event_type": "click",
      "event_target": "whatsapp_button",
      "page_url": "/propiedades/1",
      "event_data": {},
      "timestamp": "2025-01-03T12:00:00Z"
    },
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "property_id": 1,
      "event_type": "scroll",
      "event_target": "property_details",
      "page_url": "/propiedades/1",
      "event_data": { "scroll_depth": 50 },
      "timestamp": "2025-01-03T12:00:15Z"
    }
  ]
}
```

**Parámetros Body**:
- `interactions` (array, requerido): Array de objetos de interacción (estructura igual que POST)

**Estructura de Respuesta**:
```json
{
  "success": true,
  "message": "25 interactions recorded successfully"
}
```

**Uso**: Más eficiente para registrar múltiples eventos acumulados.

**Códigos de Error**:
- `400`: Array de interactions requerido o vacío
- `500`: Error al registrar batch

---

## 8. GDPR Compliance API

**Archivo**: `app/api/analytics/gdpr/opt-out/route.ts`

### POST /api/analytics/gdpr/opt-out

**Propósito**: Procesar solicitudes de opt-out de tracking analytics (GDPR compliance).

**Body JSON**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "privacy_concerns"
}
```

**Parámetros Body**:
- `session_id` (string, opcional): UUID de la sesión a opt-out
- `reason` (string, opcional): Razón del opt-out para auditoría

**Lógica**:
1. Extrae IP del request (si no hay session_id)
2. Marca la sesión como opt-out en la base de datos
3. Anonimiza datos existentes de esa sesión (según configuración)
4. Puede agregar IP a lista de opt-out para prevenir tracking futuro

**Estructura de Respuesta**:
```json
{
  "success": true,
  "message": "Successfully opted out of analytics tracking",
  "details": {
    "session_opted_out": true,
    "ip_opted_out": true,
    "reason": "privacy_concerns"
  }
}
```

**Códigos de Error**:
- `400`: Session ID o IP requerido (AnalyticsPrivacyError)
- `500`: Error al procesar opt-out

---

### GET /api/analytics/gdpr/opt-out

**Propósito**: Verificar el estado de opt-out de una sesión.

**Parámetros Query String**:
- `session_id` (string, requerido): UUID de la sesión

**Estructura de Respuesta**:
```json
{
  "success": true,
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "is_opted_out": false,
    "message": "This session is participating in analytics tracking"
  }
}
```

**Códigos de Error**:
- `400`: Session ID requerido
- `404`: Session no encontrada (PGRST116)
- `500`: Error al verificar estado

---

## Arquitectura y Patrones

### Capa de Servicio

Todos los endpoints utilizan `AnalyticsService` (`services/analytics.ts`) para la lógica de negocio:

**Métodos Principales**:
- `getOrCreateSession()`: Gestión de sesiones con deduplicación
- `createSession()`: Creación de nueva sesión
- `updateSessionLastSeen()`: Actualizar timestamp de sesión
- `recordPropertyView()`: Registrar visualización con debouncing
- `recordPropertyViewWithSession()`: View con creación automática de sesión
- `recordLeadGeneration()`: Registrar generación de lead
- `recordLeadWithSource()`: Lead con detección automática de fuente
- `recordInteraction()`: Registrar interacción única
- `recordInteractionsBatch()`: Registrar interacciones en batch
- `handleOptOut()`: Procesar opt-out GDPR
- `getDashboardStats()`: Obtener estadísticas del dashboard
- `getPropertyMetrics()`: Métricas de propiedad específica
- `getTopProperties()`: Top propiedades por métrica
- `getCampaignStats()`: Estadísticas de campañas
- `getLeadSourceStats()`: Estadísticas por fuente de leads
- `getDeviceTypeStats()`: Estadísticas por tipo de dispositivo

### Seguridad

**Rate Limiting**:
- In-memory store con Map de JavaScript
- Límites por IP y endpoint
- Headers informativos: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- Respuesta 429 con Retry-After header

**Security Headers** (todos los endpoints):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

**GDPR Compliance**:
- IP hashing con salt antes de almacenar
- Opt-out disponible con anonimización
- Sesiones con expiración automática
- No almacenamiento de PII sin consentimiento

### Performance

**Caching**:
- Response caching con max-age y stale-while-revalidate
- Cache más largo para datos estáticos (propiedades: 10min)
- Cache más corto para datos en tiempo real (ventas: 3min)
- ETags para validación de cache

**Performance Headers**:
- `X-Response-Time`: Duración de ejecución en ms
- Tracking de `execution_time_ms` en response body

**Optimizaciones**:
- Consultas paralelas con Promise.all()
- Filtros y límites en queries SQL
- Agregaciones precalculadas en tablas de stats
- Funciones RPC de PostgreSQL para lógica compleja

### Validación

**Tipos de Error Personalizados**:
- `AnalyticsValidationError`: Errores de validación de input
- `AnalyticsPrivacyError`: Errores relacionados con GDPR

**Validaciones Comunes**:
- IDs numéricos > 0
- Rangos de fechas máximos (90-365 días según endpoint)
- Formatos de fecha ISO 8601
- Arrays no vacíos
- Enum values para campos como device_type, event_type

### Base de Datos

**Tablas Principales**:
- `analytics_sessions`: Sesiones de usuario
- `analytics_property_views`: Visualizaciones de propiedades
- `analytics_lead_generation`: Eventos de generación de leads
- `analytics_user_interactions`: Interacciones de usuario
- `analytics_lead_sources`: Catálogo de fuentes de leads
- Tablas de agregación: `daily_stats`, `weekly_stats`, `monthly_stats`

**Funciones PostgreSQL (RPCs)**:
- Debouncing de vistas duplicadas (2 horas)
- Hashing de IPs con salt
- Cálculo de métricas agregadas
- Recuperación optimizada de stats

---

## Flujo de Tracking Típico

### 1. Usuario Llega al Sitio

```
1. Frontend llama: POST /api/analytics/session
   - Se crea/recupera sesión con datos UTM
   - Se retorna session_id

2. Frontend almacena session_id en localStorage/sessionStorage
```

### 2. Usuario Visualiza Propiedad

```
3. Frontend llama: POST /api/analytics/property-view
   - Envía session_id y property_id
   - Envía datos de interacción (time_on_page, scroll_depth, etc.)
   - Backend aplica debouncing automático

4. Opcionalmente, frontend llama: POST /api/analytics/interaction (batch)
   - Envía eventos de clicks, hovers, etc.
```

### 3. Usuario Genera Lead

```
5. Backend de leads llama: PUT /api/analytics/lead-generation
   - Envía lead_id y source_code ("WHATSAPP", "CONTACT_FORM", etc.)
   - Se asocia con session_id y property_id
   - Se registra atribución completa
```

### 4. Opt-Out GDPR (Opcional)

```
6. Usuario solicita opt-out en cookie banner
7. Frontend llama: POST /api/analytics/gdpr/opt-out
   - Se marca sesión como opted-out
   - Se anonimiza data histórica
```

---

## Endpoints para Dashboards Admin

### Dashboard General
```
GET /api/analytics/dashboard
  - Métricas generales del sitio
  - KPIs principales
  - Trends y distribuciones

POST /api/analytics/dashboard
  - Queries avanzadas con filtros
  - Selección de métricas específicas
```

### Dashboard Modular (v4)
```
GET /api/analytics/modules/overview
  - Executive overview

GET /api/analytics/modules/sales
  - Pipeline y conversión

GET /api/analytics/modules/marketing
  - Campañas y canales

GET /api/analytics/modules/properties
  - Performance de propiedades

GET /api/analytics/modules/customers
  - Comportamiento de usuarios
```

### Analytics de Propiedad Individual
```
GET /api/analytics/property-metrics/{id}
  - Métricas detalladas de una propiedad
  - Trends históricos
  - Distribución temporal
```

---

## Consideraciones de Implementación

### Frontend

**Hook Personalizado**: `hooks/useAnalytics.ts`
- Interfaz unificada para tracking
- Manejo automático de session_id
- Retry logic en caso de errores
- Batching de interacciones

**Ejemplo de Uso**:
```typescript
const { trackPropertyView, trackInteraction, trackLead } = useAnalytics()

// Tracking de view
await trackPropertyView({
  propertyId: 1,
  timeOnPage: 120,
  scrollDepth: 75,
  whatsappClicked: true
})

// Tracking de interacción
await trackInteraction({
  eventType: 'click',
  eventTarget: 'contact_button'
})
```

### Rate Limiting en Producción

**Recomendación**: Implementar rate limiting con Redis o servicio dedicado:
- Upstash Redis
- Vercel KV
- CloudFlare Rate Limiting

**Límites Actuales** (in-memory, no persistente):
- Dashboard: 100 req/hora
- Modules: 80-150 req/hora según módulo
- Property Metrics: 150 req/hora
- Tracking endpoints: Sin límite (pero considerar implementar)

### Monitoring y Observability

**Métricas a Monitorear**:
- Execution time (disponible en X-Response-Time)
- Error rates por endpoint
- Rate limit hits
- Cache hit rates
- Database query performance

**Logs**:
- Todos los endpoints loggean errores a console
- Considerar integrar servicio como Sentry o Datadog

---

## Resumen de Endpoints

| Endpoint | Métodos | Propósito | Rate Limit | Cache TTL |
|----------|---------|-----------|------------|-----------|
| `/api/analytics/dashboard` | GET, POST | Stats generales del dashboard | 100/h | 300s |
| `/api/analytics/modules/{module}` | GET, POST | Stats por módulo específico | 80-150/h | 180-600s |
| `/api/analytics/property-metrics/{id}` | GET | Métricas de propiedad individual | 150/h | 120-600s |
| `/api/analytics/session` | POST, PUT | Gestión de sesiones | - | - |
| `/api/analytics/property-view` | POST, PUT | Tracking de views de propiedades | - | - |
| `/api/analytics/lead-generation` | POST, PUT | Tracking de generación de leads | - | - |
| `/api/analytics/interaction` | POST, PUT | Tracking de interacciones UX | - | - |
| `/api/analytics/gdpr/opt-out` | GET, POST | Opt-out y verificación GDPR | - | - |

---

## Apéndice: Tipos TypeScript

### AnalyticsFilters
```typescript
interface AnalyticsFilters {
  start_date: string          // YYYY-MM-DD
  end_date: string            // YYYY-MM-DD
  property_ids?: number[]
  lead_source_ids?: number[]
  utm_source?: string
  utm_campaign?: string
  device_type?: 'mobile' | 'desktop' | 'tablet'
  country_code?: string
}
```

### CreateAnalyticsSessionInput
```typescript
interface CreateAnalyticsSessionInput {
  ip_address: string
  user_agent?: string
  country_code?: string
  device_type?: string
  browser?: string
  os?: string
  referrer_domain?: string
  landing_page?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}
```

### CreatePropertyViewInput
```typescript
interface CreatePropertyViewInput {
  session_id: string
  property_id: number
  time_on_page?: number
  scroll_depth?: number
  contact_button_clicked?: boolean
  whatsapp_clicked?: boolean
  phone_clicked?: boolean
  email_clicked?: boolean
  images_viewed?: number
  page_url?: string
  referrer_url?: string
  search_query?: string
}
```

### CreateLeadGenerationEventInput
```typescript
interface CreateLeadGenerationEventInput {
  lead_id: number
  session_id?: string
  property_id?: number
  lead_source_id: number
  form_type?: string
  conversion_page?: string
  time_to_conversion?: number
  session_pages_viewed?: number
  properties_viewed?: number
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}
```

### CreateUserInteractionEventInput
```typescript
interface CreateUserInteractionEventInput {
  session_id: string
  property_id?: number
  event_type: string
  event_target?: string
  page_url?: string
  event_data?: any
  timestamp?: string
}
```

---

**Documento generado**: 2025-01-03
**Versión API**: v4
**Stack**: Next.js 15, Supabase, TypeScript
