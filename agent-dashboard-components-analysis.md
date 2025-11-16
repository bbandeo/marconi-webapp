# Análisis de Componentes de Dashboard - Marconi Inmobiliaria

## Resumen Ejecutivo

Este documento analiza los componentes de dashboard existentes en el sistema de analytics de Marconi Inmobiliaria, incluyendo su estructura, métricas, fuentes de datos y estado actual de implementación.

---

## 1. Componentes de Dashboard Existentes

### 1.1 Dashboard Principal (`Dashboard.tsx`)

**Ubicación:** `components/admin/Dashboard.tsx`

**Propósito:** Dashboard principal del panel de administración, orientado a CRM y gestión de contactos/leads.

**Métricas que muestra:**
- Propiedades activas y destacadas
- Total de contactos y contactos nuevos esta semana
- Tasa de conversión y contactos convertidos
- Puntuación promedio de leads y acciones vencidas
- Distribución del pipeline (nuevos, contactados, calificados, convertidos)
- Actividad semanal
- Fuentes de contacto
- Distribución por prioridad
- Actividad reciente

**Obtención de datos:**
- `useContacts()` - Obtiene lista de contactos desde API
- `useContactMetrics(contacts)` - Calcula métricas derivadas de los contactos
- `fetch('/api/properties')` - Obtiene propiedades directamente

**Estructura de datos esperada:**
```typescript
interface Contact {
  id: string
  name: string
  property: string
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  createdAt: string
  priority: 'low' | 'medium' | 'high'
  source: string
  score: number
  nextActionDate?: string
}
```

**Estado:** ✅ Usa datos reales de la API de contactos/properties

---

### 1.2 AnalyticsDashboard (`AnalyticsDashboard.tsx`)

**Ubicación:** `components/admin/AnalyticsDashboard.tsx`

**Propósito:** Dashboard de analytics general con métricas de tráfico web, sesiones y conversiones.

**Métricas que muestra:**
- Sesiones totales y visitantes únicos
- Vistas de propiedades (totales y únicas)
- Total de leads y conversiones
- Tasa de conversión general
- Tiempo promedio en página
- Tráfico por dispositivo (mobile, tablet, desktop)
- Propiedades más vistas
- Fuentes de leads con tasas de conversión
- Estadísticas diarias

**Obtención de datos:**
- Fetch directo a `/api/analytics/dashboard` con parámetros de fecha
- Datos transformados manualmente en el componente

**Estructura de datos esperada:**
```typescript
interface DashboardStats {
  total_sessions: number
  total_property_views: number
  unique_property_views: number
  total_leads: number
  conversion_rate: number
  avg_time_on_page: number
  top_properties: TopProperty[]
  top_lead_sources: LeadSourceStat[]
  traffic_by_device: DeviceTypeStat[]
  daily_stats: DailyStat[]
}
```

**Estado:** ✅ Usa datos reales del módulo de analytics

---

### 1.3 PropertyAnalytics (`PropertyAnalytics.tsx`)

**Ubicación:** `components/admin/PropertyAnalytics.tsx`

**Propósito:** Dashboard especializado en análisis de rendimiento de propiedades individuales.

**Métricas que muestra:**
- Total de propiedades activas
- Views promedio por propiedad
- Días promedio en mercado
- Tasa de conversión de leads
- Performance individual de cada propiedad (views, leads, conversión)
- Insights dinámicos sobre top performers

**Obtención de datos:**
- `useAnalyticsDashboard()` - Para datos generales del dashboard
- `fetch('/api/analytics/modules/properties')` - Para datos específicos de propiedades
- `useRealTimeUpdates()` - Para actualizaciones en tiempo real

**Estructura de datos esperada:**
```typescript
interface PropertyKPIs {
  totalProperties: { value: number, active: number, sold: number, pending: number }
  avgViewsPerProperty: { value: number, change: number, benchmark: number }
  avgTimeOnMarket: { value: number, change: number, target: number }
  conversionRate: { value: number, change: number, benchmark: number }
}

interface PropertyPerformance {
  id: string
  title: string
  address: string
  price: number
  views: number
  uniqueViews: number
  leads: number
  daysOnMarket: number
  leadConversionRate: number
  performance: 'excellent' | 'good' | 'average' | 'poor'
}
```

**Estado:** ✅ Usa datos reales del módulo properties + datos mock como fallback

---

### 1.4 MarketingAnalytics (`MarketingAnalytics.tsx`)

**Ubicación:** `components/admin/MarketingAnalytics.tsx`

**Propósito:** Dashboard de marketing y generación de leads con análisis de canales y ROI.

**Métricas que muestra:**
- Total de leads generados
- Calidad de leads (scoring)
- Costo por lead (CPL)
- Tráfico web y conversión
- Performance por canal (WhatsApp, Facebook, Google Ads, etc.)
- ROI de campañas con UTM tracking
- Website analytics (fuentes de tráfico, páginas principales)

**Obtención de datos:**
- `useAnalyticsDashboard()` - Para métricas generales
- `useRealTimeUpdates()` - Para updates en tiempo real
- Datos MOCK para canales, campañas y website analytics

**Estructura de datos esperada:**
```typescript
interface MarketingKPIs {
  totalLeads: { value: number, change: number, cost: number }
  leadQuality: { value: number, change: number, benchmark: number }
  costPerLead: { value: number, change: number, target: number }
  websiteTraffic: { value: number, change: number, conversionRate: number }
}

interface ChannelPerformance {
  id: string
  name: string
  leads: number
  cost: number
  cpl: number
  conversionRate: number
  roi: number
  trend: number
  status: 'active' | 'paused' | 'testing'
}
```

**Estado:** ⚠️ KPIs usan datos reales parciales (leads, sessions), pero canales/campañas son MOCK

---

### 1.5 SalesPerformance (`SalesPerformance.tsx`)

**Ubicación:** `components/admin/SalesPerformance.tsx`

**Propósito:** Dashboard de rendimiento de ventas con pipeline y funnel.

**Métricas que muestra:**
- Ingresos totales de ventas
- Ventas cerradas
- Valor promedio de venta
- Tiempo de ciclo de venta
- Pipeline de ventas (5 etapas: prospectos, calificados, propuesta, negociación, cerrado)
- Funnel de conversión
- Top agentes
- Top propiedades vendidas

**Obtención de datos:**
- `useAnalyticsDashboard()` - Para datos generales
- `useRealTimeUpdates()` - Para updates en tiempo real
- Datos MOCK para KPIs de ventas, pipeline, agentes

**Estructura de datos esperada:**
```typescript
interface SalesKPIs {
  totalRevenue: { value: number, change: number, target: number }
  leadsConverted: { value: number, change: number, target: number }
  avgSaleValue: { value: number, change: number, benchmark: number }
  salesCycleTime: { value: number, change: number, target: number }
}

interface PipelineStage {
  id: string
  name: string
  count: number
  value: number
  conversionRate: number
  color: string
}
```

**Estado:** ❌ Completamente MOCK (no hay tabla sales_closed ni sales_pipeline)

---

### 1.6 CustomerInsights (`CustomerInsights.tsx`)

**Ubicación:** `components/admin/CustomerInsights.tsx`

**Propósito:** Dashboard de análisis de clientes, segmentación y customer journey.

**Métricas que muestra:**
- Total de clientes
- Lifetime value promedio
- Customer satisfaction y NPS
- Tasa de retención
- Segmentación de clientes (VIP Investors, First-Time Buyers, etc.)
- Customer journey (6 etapas: Awareness → Retention)

**Obtención de datos:**
- `useAnalyticsDashboard()` - Para datos generales
- `useRealTimeUpdates()` - Para updates en tiempo real
- Datos MOCK para todos los KPIs y segmentos

**Estructura de datos esperada:**
```typescript
interface CustomerKPIs {
  totalCustomers: { value: number, newThisMonth: number, returningCustomers: number, churnRate: number }
  avgLifetimeValue: { value: number, change: number, highValueCustomers: number }
  customerSatisfaction: { value: number, change: number, npsScore: number }
  retentionRate: { value: number, change: number, benchmark: number }
}

interface CustomerSegment {
  id: string
  name: string
  customerCount: number
  percentage: number
  avgValue: number
  retentionRate: number
  priority: 'high' | 'medium' | 'low'
}
```

**Estado:** ❌ Completamente MOCK (no hay tablas de customers/CRM)

---

## 2. Hooks de Analytics

### 2.1 `useAnalyticsDashboard()`

**Ubicación:** `hooks/useAnalyticsDashboard.ts`

**Propósito:** Hook principal para data fetching del dashboard analytics con React Query.

**Datos que proporciona:**
- Overview metrics (totalViews, uniqueSessions, totalLeads, conversionRate)
- Trends (cambios porcentuales)
- Top properties
- Lead sources
- Recent activity

**Conexión con APIs:**
- `GET /api/analytics/dashboard?period={period}`
- Cache strategy: realtime (24h) o standard (otros períodos)
- Auto-refresh configurable

**Estado:** ✅ Funcional, conectado a API real

---

### 2.2 `useAnalytics()`

**Ubicación:** `hooks/useAnalytics.ts`

**Propósito:** Hook para tracking del lado del cliente (GDPR compliant).

**Datos que proporciona:**
- Session management
- Property view tracking
- Lead generation tracking
- Interaction tracking
- GDPR opt-out

**Conexión con APIs:**
- `POST /api/analytics/session` - Crear sesión
- `POST /api/analytics/property-view` - Track vista
- `POST /api/analytics/lead-generation` - Track lead
- `POST /api/analytics/interaction` - Track interacción

**Estado:** ✅ Funcional, implementa tracking completo

---

### 2.3 `useRealTimeUpdates()`

**Ubicación:** `hooks/useRealTimeUpdates.ts`

**Propósito:** Hook para updates en tiempo real vía polling o WebSocket.

**Datos que proporciona:**
- Active users
- Current views
- Today leads
- Top active properties
- Recent events
- System status

**Conexión con APIs:**
- `GET /api/analytics/realtime/active` - Polling
- `ws://[host]/api/analytics/realtime/ws` - WebSocket (opcional)
- Fallback a datos vacíos si endpoint no existe (404)

**Estado:** ⚠️ Implementado pero endpoint /realtime/active puede no existir

---

### 2.4 `useLeadAnalytics()`

**Ubicación:** `hooks/useLeadAnalytics.ts`

**Propósito:** Hook especializado para análisis de leads y conversiones.

**Datos que proporciona:**
- Lead overview (total, qualified, converted)
- Conversion funnel con dropoff rates
- Lead sources performance
- Lead quality scoring

**Conexión con APIs:**
- `GET /api/analytics/leads/analytics?period={period}`
- `GET /api/analytics/leads/sources?period={period}`
- `GET /api/analytics/leads/funnel?period={period}`

**Estado:** ⚠️ Hook implementado pero endpoints API no verificados

---

### 2.5 `usePropertyMetrics()`

**Ubicación:** `hooks/usePropertyMetrics.ts`

**Propósito:** Hook para métricas de propiedades individuales y comparaciones.

**Datos que proporciona:**
- Individual property metrics (views, leads, engagement)
- Property rankings
- Property performance overview
- Multi-property comparison

**Conexión con APIs:**
- `GET /api/analytics/property-metrics/{id}?days_back={days}`
- `GET /api/analytics/properties/rankings?period={period}`
- `GET /api/analytics/properties/performance?period={period}`

**Estado:** ⚠️ Hook implementado pero endpoints API no verificados

---

### 2.6 `useContactMetrics()`

**Ubicación:** `hooks/useContactMetrics.ts`

**Propósito:** Hook para calcular métricas derivadas de contactos (client-side).

**Datos que proporciona:**
- Counts por status (new, contacted, qualified, converted)
- Conversion rate
- Average score
- Source statistics
- Priority statistics
- Weekly data

**Conexión con APIs:**
- No conecta con API, calcula métricas localmente desde array de contactos

**Estado:** ✅ Funcional, procesa datos de useContacts()

---

## 3. Estado Actual: Datos Reales vs Mockeados

### ✅ Componentes con Datos Reales

1. **Dashboard Principal**
   - Contactos: ✅ Real
   - Propiedades: ✅ Real
   - Métricas calculadas: ✅ Real

2. **AnalyticsDashboard**
   - Sessions: ✅ Real
   - Property views: ✅ Real
   - Leads: ✅ Real
   - Top properties: ✅ Real
   - Device stats: ✅ Real

3. **PropertyAnalytics**
   - Total properties: ✅ Real
   - Avg views: ✅ Real
   - Conversion rate: ✅ Real
   - Top properties: ✅ Real con fallback a mock

### ⚠️ Componentes con Datos Parciales

4. **MarketingAnalytics**
   - Total leads: ✅ Real
   - Sessions: ✅ Real
   - Conversion rate: ✅ Real
   - Channel performance: ❌ Mock
   - Campaign ROI: ❌ Mock
   - Website analytics: ❌ Mock

### ❌ Componentes Completamente Mockeados

5. **SalesPerformance**
   - Todos los KPIs: ❌ Mock
   - Pipeline stages: ❌ Mock
   - Agent performance: ❌ Mock
   - Conversion funnel: ❌ Mock

6. **CustomerInsights**
   - Todos los KPIs: ❌ Mock
   - Customer segments: ❌ Mock
   - Customer journey: ❌ Mock
   - Retention metrics: ❌ Mock

---

## 4. Componentes que Necesitan Actualización

### Prioridad Alta

1. **SalesPerformance**
   - **Problema:** No hay backend para sales tracking
   - **Necesita:** Implementar tablas `sales_closed`, `sales_pipeline`, `sales_agents`
   - **Alternativa:** Derivar métricas de `leads` con status 'converted'

2. **MarketingAnalytics - Channel Performance**
   - **Problema:** Datos de canales hardcodeados
   - **Necesita:** Tabla `marketing_channels` con tracking de costs y ROI
   - **Alternativa:** Derivar de `analytics_lead_sources` + datos manuales de costos

### Prioridad Media

3. **CustomerInsights**
   - **Problema:** No hay CRM completo
   - **Necesita:** Sistema de customer scoring y segmentación
   - **Alternativa:** Derivar de tabla `leads` + propiedades vendidas

4. **MarketingAnalytics - Campaign ROI**
   - **Problema:** No hay tracking de campañas con UTM
   - **Necesita:** Tabla `marketing_campaigns` + UTM tracking mejorado
   - **Estado actual:** UTMs se capturan en sessions pero no se usan

### Prioridad Baja

5. **Real-Time Updates**
   - **Problema:** Endpoint `/api/analytics/realtime/active` no implementado
   - **Impacto:** El hook funciona con fallback a datos vacíos
   - **Solución:** Implementar endpoint o usar polling desde dashboard

---

## 5. Arquitectura de Datos

### Flujo de Datos Actual

```
┌─────────────────┐
│   Cliente Web   │
└────────┬────────┘
         │
    ┌────▼─────────────────────┐
    │  useAnalytics() Hook     │
    │  (Client-side tracking)  │
    └────┬─────────────────────┘
         │
    ┌────▼─────────────────────────┐
    │  API Routes                  │
    │  - /api/analytics/session    │
    │  - /api/analytics/property-view
    │  - /api/analytics/lead-gen   │
    └────┬─────────────────────────┘
         │
    ┌────▼─────────────────────────┐
    │  Analytics Service           │
    │  (services/analytics.ts)     │
    └────┬─────────────────────────┘
         │
    ┌────▼─────────────────────────┐
    │  Supabase Database           │
    │  - analytics_sessions        │
    │  - analytics_property_views  │
    │  - analytics_lead_generation │
    │  - analytics_lead_sources    │
    │  - daily_stats (agregados)   │
    └──────────────────────────────┘

┌─────────────────────────────────┐
│   Dashboard Components          │
│   (useAnalyticsDashboard)       │
└────┬────────────────────────────┘
     │
┌────▼────────────────────────────┐
│  GET /api/analytics/dashboard   │
│  GET /api/analytics/modules/*   │
└────┬────────────────────────────┘
     │
┌────▼────────────────────────────┐
│  Aggregated Stats from DB       │
└─────────────────────────────────┘
```

### Tablas Existentes

**Core Analytics:**
- ✅ `analytics_sessions` - Sesiones anónimas GDPR
- ✅ `analytics_property_views` - Vistas de propiedades
- ✅ `analytics_lead_generation` - Generación de leads
- ✅ `analytics_lead_sources` - Catálogo de fuentes
- ✅ `daily_stats`, `weekly_stats`, etc. - Agregados

**Business Data:**
- ✅ `properties` - Propiedades inmobiliarias
- ✅ `leads` - Contactos/leads CRM
- ✅ `profiles` - Usuarios del sistema

**Missing (para dashboards completos):**
- ❌ `sales_closed` - Ventas cerradas
- ❌ `sales_pipeline` - Pipeline de ventas
- ❌ `sales_agents` - Agentes de ventas
- ❌ `marketing_campaigns` - Campañas de marketing
- ❌ `marketing_channels` - Canales con costos
- ❌ `customer_segments` - Segmentación de clientes
- ❌ `customer_lifecycle` - Customer journey tracking

---

## 6. Recomendaciones

### Inmediatas

1. **Completar PropertyAnalytics:**
   - Implementar tracking de `days_on_market` en tabla properties
   - Agregar campo `created_at` si no existe
   - Calcular métricas de tiempo en mercado

2. **Mejorar MarketingAnalytics:**
   - Crear vista materializada para channel performance
   - Derivar de `analytics_lead_sources` + costos manuales
   - Implementar cálculo de ROI básico

3. **Simplificar SalesPerformance:**
   - Derivar métricas de tabla `leads` con status='converted'
   - Calcular pipeline desde status de leads
   - Diferir sales tracking completo a Fase 3

### Corto Plazo

4. **Implementar UTM Campaign Tracking:**
   - Usar UTM params ya capturados en sessions
   - Crear agregación de campañas
   - Mostrar performance por campaña

5. **Customer Insights Básico:**
   - Segmentar por valor de leads convertidos
   - Calcular lifetime value de clientes recurrentes
   - Trackear retención básica

### Largo Plazo

6. **Sales Pipeline Completo:**
   - Implementar tablas sales específicas
   - Integrar con CRM externo si es necesario
   - Trackear agentes y comisiones

7. **Real-Time Dashboard:**
   - Implementar WebSocket server
   - Crear endpoint `/realtime/active`
   - Push notifications para eventos importantes

---

## Conclusión

El sistema de analytics de Marconi Inmobiliaria tiene una base sólida con:
- ✅ Tracking completo de sesiones, vistas y leads
- ✅ Dashboards funcionales para analytics y properties
- ✅ Arquitectura escalable con React Query

Necesita completar:
- ⚠️ Backend para sales tracking
- ⚠️ Marketing campaign tracking con ROI
- ⚠️ Customer segmentation y lifecycle

**Priorización sugerida:**
1. Primero: Completar PropertyAnalytics (más cercano a estar completo)
2. Segundo: MarketingAnalytics con datos derivados
3. Tercero: Versión simplificada de SalesPerformance
4. Cuarto: CustomerInsights básico

Esta estrategia permite tener dashboards funcionales rápidamente mientras se desarrolla la infraestructura completa en fases posteriores.
