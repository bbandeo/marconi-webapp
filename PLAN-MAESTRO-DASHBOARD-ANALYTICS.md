# Plan Maestro: Actualización del Dashboard de Analytics
## Marconi Inmobiliaria

**Fecha:** 2025-10-03
**Versión:** 1.0
**Autor:** Claude Code + Agentes Especializados
**Objetivo:** Actualizar todos los dashboards para mostrar EXCLUSIVAMENTE datos reales disponibles en la base de datos

---

## Executive Summary

### Situación Actual
El sistema de analytics de Marconi Inmobiliaria cuenta con una **infraestructura robusta y completa**:
- ✅ 11 tablas de analytics implementadas y funcionales
- ✅ 7 funciones PostgreSQL (RPCs) operativas
- ✅ 8 endpoints API REST completamente funcionales
- ✅ Sistema GDPR-compliant con tracking anónimo
- ✅ AnalyticsService con 20+ métodos probados

Sin embargo, **algunos componentes de dashboard muestran datos mock** en lugar de consultar las fuentes de datos reales disponibles.

### Alcance del Plan
Este plan detalla la actualización de 6 componentes de dashboard para:
1. **Eliminar todos los datos mock/hardcodeados**
2. **Usar exclusivamente datos reales de la base de datos**
3. **Derivar métricas inteligentes desde datos existentes**
4. **Mantener UX profesional con disclaimers apropiados**

### Resultados Esperados
- **0% datos mock** en PropertyAnalytics y MarketingAnalytics
- **100% de métricas** derivadas de fuentes reales
- **Dashboards funcionales** que muestran el estado real del negocio
- **Base sólida** para expansión futura

### Estimación Total
**8-11 días de desarrollo** divididos en 3 fases priorizadas

---

## 1. Análisis de Estado Actual

### 1.1 Componentes de Dashboard Evaluados

| Componente | Estado Actual | Datos Reales | Datos Mock | Prioridad |
|------------|---------------|--------------|------------|-----------|
| **Dashboard.tsx** | ✅ Funcional | 100% | 0% | ✓ Mantener |
| **AnalyticsDashboard.tsx** | ✅ Funcional | 100% | 0% | ✓ Mantener |
| **PropertyAnalytics.tsx** | ⚠️ Parcial | 70% | 30% | 🔴 Alta |
| **MarketingAnalytics.tsx** | ⚠️ Parcial | 40% | 60% | 🔴 Alta |
| **SalesPerformance.tsx** | ❌ Mock | 0% | 100% | 🟡 Media |
| **CustomerInsights.tsx** | ❌ Mock | 0% | 100% | 🟢 Baja |

### 1.2 Infraestructura Disponible

#### Tablas de Base de Datos
**Core Analytics (todas funcionales):**
- `analytics_sessions` - Sesiones anónimas GDPR-compliant
- `analytics_property_views` - Vistas con debouncing de 2 horas
- `analytics_lead_generation` - Generación y atribución de leads
- `analytics_lead_sources` - Catálogo de fuentes de leads (12 fuentes predefinidas)
- `analytics_user_interactions` - Interacciones UX detalladas
- `analytics_campaign_attribution` - Atribución de campañas
- `analytics_daily_stats`, `weekly_stats`, `monthly_stats` - Agregaciones
- `analytics_lead_source_stats` - Stats por fuente
- `analytics_campaign_stats` - Stats de campañas

**Business Data (todas funcionales):**
- `properties` - Propiedades inmobiliarias
- `leads` - Contactos/leads CRM
- `profiles` - Usuarios del sistema

**Tablas Faltantes (no críticas para este plan):**
- ❌ `sales_closed` - Ventas cerradas
- ❌ `sales_pipeline` - Pipeline de ventas
- ❌ `sales_agents` - Agentes de ventas
- ❌ `marketing_channels` - Canales con costos/ROI
- ❌ `customer_segments` - Segmentación de clientes

#### Endpoints API Implementados
Todos los siguientes endpoints están **100% funcionales**:

1. **GET /api/analytics/dashboard**
   - Stats generales con filtros avanzados
   - Cache: 5 minutos
   - Rate limit: 100 req/hora

2. **GET /api/analytics/modules/{module}**
   - `overview` - Executive overview
   - `sales` - Sales metrics
   - `marketing` - Marketing campaigns y canales
   - `properties` - Property analytics
   - `customers` - Customer behavior
   - Cache: 3-10 minutos según módulo

3. **GET /api/analytics/property-metrics/{id}**
   - Métricas detalladas por propiedad
   - Cache: 2-10 minutos según período

4. **POST /api/analytics/session** - Gestión de sesiones
5. **POST /api/analytics/property-view** - Tracking de vistas
6. **POST /api/analytics/lead-generation** - Tracking de leads
7. **POST /api/analytics/interaction** - Tracking de interacciones
8. **POST /api/analytics/gdpr/opt-out** - GDPR compliance

#### Servicios TypeScript
**AnalyticsService** (`services/analytics.ts`) - Completamente funcional con 20+ métodos:
- Session management
- Property view tracking con debouncing
- Lead generation tracking
- Interaction tracking batch
- Dashboard stats aggregation
- Property metrics calculation
- Campaign stats
- Lead source performance
- Device type analytics
- GDPR opt-out handling

---

## 2. Datos Disponibles vs Requeridos

### 2.1 Métricas Disponibles con Datos Reales (>0 potencial)

| Métrica | Fuente | API Disponible | Calidad |
|---------|--------|----------------|---------|
| **Sesiones totales** | `analytics_sessions` | ✅ `/dashboard` | Excelente |
| **Property views** | `analytics_property_views` | ✅ `/dashboard` | Excelente |
| **Unique views** | `analytics_property_views` (distinct session_id) | ✅ `/dashboard` | Excelente |
| **Total leads** | `analytics_lead_generation` | ✅ `/dashboard` | Excelente |
| **Conversion rate** | Calculado (leads/sessions) | ✅ `/dashboard` | Excelente |
| **Tráfico por dispositivo** | `analytics_sessions.device_type` | ✅ `/dashboard` | Excelente |
| **Top propiedades** | JOIN views + properties | ✅ `/modules/properties` | Excelente |
| **Fuentes de leads** | `analytics_lead_sources` + generation | ✅ `/dashboard` | Excelente |
| **Tiempo en página** | `analytics_property_views.view_duration_seconds` | ✅ `/dashboard` | Buena |
| **Clicks de contacto** | `analytics_property_views` (whatsapp/phone/email) | ✅ `/property-metrics/{id}` | Buena |
| **UTM tracking** | `analytics_sessions` (utm_*) | ✅ `/modules/marketing` | Buena |
| **Campañas** | `analytics_sessions` + `campaign_attribution` | ✅ `/modules/marketing` | Buena |
| **Daily/weekly trends** | Agregación dinámica | ✅ `/dashboard` | Buena |
| **Scroll depth** | `analytics_property_views.scroll_percentage` | ✅ `/property-metrics/{id}` | Media |
| **Imágenes vistas** | `analytics_property_views.images_viewed` | ✅ `/property-metrics/{id}` | Media |

### 2.2 Métricas Derivables (con cálculos adicionales)

| Métrica | Fuente de Derivación | Complejidad | Calidad Esperada |
|---------|---------------------|-------------|------------------|
| **Days on market** | `properties.created_at` → now() | Baja | Excelente |
| **Channel performance** | `analytics_lead_sources` (12 fuentes) | Baja | Buena |
| **Campaign ROI** | UTM tracking (sin costos reales) | Media | Limitada* |
| **Sales closed** | `leads` con status='converted' | Media | Buena |
| **Sales pipeline** | `leads` agrupados por status | Media | Buena |
| **Lead quality score** | `leads.score` o analytics data | Media | Media |
| **Customer segmentation** | Leads únicos por email | Alta | Limitada* |
| **Retention rate** | Leads recurrentes (mismo email) | Alta | Limitada* |

**Limitada* = Datos parciales, requiere disclaimers**

### 2.3 Métricas NO Disponibles (tablas faltantes)

| Métrica | Tabla Requerida | Impacto | Alternativa |
|---------|----------------|---------|-------------|
| **Revenue real** | `sales_closed.amount` | Alto | Usar lead_value estimado |
| **Sales agents** | `sales_agents` | Medio | Ocultar sección |
| **Marketing costs** | `marketing_channels.cost` | Alto | Mostrar "Not tracked" |
| **CPL real** | `marketing_channels.cost` / leads | Alto | Calcular sin costos |
| **ROAS** | revenue / ad_spend | Medio | Mostrar "Not tracked" |
| **NPS score** | `customer_satisfaction` | Bajo | Ocultar métrica |
| **Customer LTV** | `customer_purchases` | Medio | Usar valor de leads |

---

## 3. Plan de Implementación por Fases

### FASE 1: Mejoras Rápidas (1-2 días) 🔴 PRIORIDAD ALTA

#### 1.1 PropertyAnalytics - Eliminación Total de Mock

**Objetivo:** 100% de datos reales, 0% mock

**Archivo:** `components/admin/PropertyAnalytics.tsx`

**Cambios:**
1. **Eliminar fallback a mockPropertiesData**
   - Ubicación: Líneas donde se usa `mockPropertiesData`
   - Acción: Eliminar completamente, confiar en API

2. **Calcular Days on Market desde created_at**
   ```typescript
   const daysOnMarket = properties.map(p => ({
     ...p,
     daysOnMarket: Math.floor(
       (new Date() - new Date(p.created_at)) / (1000 * 60 * 60 * 24)
     )
   }))
   ```

3. **Generar Insights Dinámicos**
   - Top performers: Propiedades en top 25% de views y conversion
   - Needs attention: Propiedades en bottom 25% de views
   - Lógica basada en percentiles reales

4. **Mejorar manejo de estados**
   - Loading state profesional
   - Empty state: "No properties data available yet"
   - Error state con retry

**API usada:** `GET /api/analytics/modules/properties`

**Métricas mostradas:**
- Total properties (active/sold/pending desde properties.status)
- Average views per property (calculado)
- Average time on market (desde created_at)
- Conversion rate (leads / unique_views)
- Performance table con ALL datos reales

**Complejidad:** Baja
**Tiempo estimado:** 4-6 horas
**Testing:** Verificar con datos reales en DB

---

#### 1.2 useRealTimeUpdates - Polling de Dashboard

**Objetivo:** Real-time updates funcionales sin nuevo endpoint

**Archivo:** `hooks/useRealTimeUpdates.ts`

**Cambios:**
1. **Reemplazar fetch a /api/analytics/realtime/active**
   - Cambiar a: `GET /api/analytics/dashboard?period=today`

2. **Implementar polling configurable**
   ```typescript
   const interval = pollingInterval || 60000 // 60 segundos default
   useEffect(() => {
     const timer = setInterval(fetchData, interval)
     return () => clearInterval(timer)
   }, [interval])
   ```

3. **Transformar respuesta a formato esperado**
   ```typescript
   const transformDashboardToRealtime = (dashboardData) => ({
     activeUsers: dashboardData.sessions_count,
     currentViews: dashboardData.property_views_count,
     todayLeads: dashboardData.leads_count,
     topActiveProperties: dashboardData.top_properties.slice(0, 5),
     recentEvents: dashboardData.daily_stats[0] || {},
     systemStatus: 'operational'
   })
   ```

4. **Agregar pause/resume polling**
   - Pausar cuando tab no está visible
   - Usar Page Visibility API

**API usada:** `GET /api/analytics/dashboard?period=today`

**Beneficios:**
- Reutiliza infraestructura existente
- No requiere WebSocket
- Updates cada minuto aceptable para analytics

**Complejidad:** Baja
**Tiempo estimado:** 2-3 horas
**Testing:** Verificar polling funciona, no memory leaks

---

### FASE 2: Actualizaciones Medias (2-3 días) 🟡 PRIORIDAD MEDIA

#### 2.1 MarketingAnalytics - Channel Performance Real

**Objetivo:** Mostrar performance de canales desde datos reales

**Archivo:** `components/admin/MarketingAnalytics.tsx`

**Cambios:**
1. **Reemplazar mockChannelsData con query real**
   - Usar: `GET /api/analytics/modules/marketing`
   - Parsear: `data.lead_sources` array

2. **Transformar lead_sources a ChannelPerformance**
   ```typescript
   const channelPerformance = leadSources.map(source => ({
     id: source.source_id.toString(),
     name: source.source_name, // "WhatsApp", "Facebook", etc.
     leads: source.leads_count,
     cost: null, // No tracked
     cpl: null, // No tracked
     conversionRate: source.conversion_rate,
     roi: null, // No tracked
     trend: calculateTrend(source, previousPeriod),
     status: source.leads_count > 0 ? 'active' : 'paused'
   }))
   ```

3. **Agregar UI disclaimer para métricas no disponibles**
   ```tsx
   <Badge variant="outline">
     <InfoIcon /> Marketing costs not tracked
   </Badge>
   ```

4. **Mostrar CPL y ROI como "Not tracked" o permitir input manual**
   - Opción A: Mostrar "-" o "N/A"
   - Opción B: Agregar modal para input manual de costos (Fase futura)

**API usada:** `GET /api/analytics/modules/marketing`

**Métricas mostradas:**
- ✅ Leads por canal (REAL)
- ✅ Conversion rate por canal (REAL)
- ✅ Trend vs período anterior (REAL)
- ⚠️ CPL (Manual o N/A)
- ⚠️ ROI (Manual o N/A)
- ⚠️ Cost (Manual o N/A)

**Complejidad:** Media
**Tiempo estimado:** 3-4 horas
**Testing:** Verificar 12 fuentes de analytics_lead_sources

---

#### 2.2 MarketingAnalytics - Campaign Performance Real

**Objetivo:** Mostrar performance de campañas UTM desde datos reales

**Archivo:** `components/admin/MarketingAnalytics.tsx`

**Cambios:**
1. **Usar data.campaigns desde API**
   - Ya disponible en `/api/analytics/modules/marketing`
   - Estructura: `{ campaign_name, sessions, leads, conversion_rate }`

2. **Reemplazar mockCampaignsData**
   ```typescript
   const campaignPerformance = campaigns.map(camp => ({
     id: camp.campaign_name,
     name: camp.campaign_name,
     source: camp.utm_source || 'Direct',
     medium: camp.utm_medium || 'Unknown',
     sessions: camp.sessions,
     leads: camp.leads,
     conversionRate: camp.conversion_rate,
     cost: null, // No tracked
     revenue: null, // No tracked
     roas: null // No tracked
   }))
   ```

3. **Agregar filtros de campaña**
   - Por fuente UTM (Google, Facebook, etc.)
   - Por período temporal
   - Por status (active/paused)

**API usada:** `GET /api/analytics/modules/marketing`

**Métricas mostradas:**
- ✅ Sessions por campaña (REAL)
- ✅ Leads por campaña (REAL)
- ✅ Conversion rate (REAL)
- ⚠️ Cost/Revenue/ROAS (Manual o N/A)

**Complejidad:** Baja-Media
**Tiempo estimado:** 2-3 horas
**Testing:** Verificar con campañas UTM existentes

---

### FASE 3: Transformaciones (3-4 días) 🟢 PRIORIDAD BAJA

#### 3.1 SalesPerformance - Derivar desde Leads

**Objetivo:** Métricas de ventas derivadas de leads convertidos

**Archivo:** `components/admin/SalesPerformance.tsx`

**Opción Elegida:** Usar módulo `/api/analytics/modules/sales` existente

**Investigación necesaria:**
1. **Verificar qué retorna actualmente el módulo sales**
   - Ejecutar: `GET /api/analytics/modules/sales`
   - Analizar estructura de respuesta

2. **Si módulo está vacío, implementar lógica en API**
   - Ubicación: `app/api/analytics/modules/[module]/route.ts`
   - Caso 'sales': Agregar lógica de derivación

**Lógica de derivación:**
```typescript
// En el endpoint /api/analytics/modules/sales
const salesMetrics = {
  pipeline: {
    total_leads: leadsCount,
    conversion_rate: (convertedLeads / totalLeads) * 100,
    avg_lead_value: avgLeadValue,
    leads_trend: dailyLeadsTrend
  },
  top_performing_properties: topPropertiesByLeads,
  lead_sources: leadSourcesStats,
  conversion_funnel: {
    visitors: totalSessions,
    property_views: totalViews,
    leads: totalLeads,
    conversions: convertedLeads
  }
}
```

**Cambios en componente:**
1. **Eliminar todos los mocks**
2. **Fetch desde módulo sales**
3. **Adaptar KPIs a datos disponibles**
   - Total Revenue: `SUM(lead_value)` de leads convertidos
   - Leads Converted: `COUNT(*)` WHERE status='converted'
   - Avg Sale Value: `AVG(lead_value)` de leads convertidos
   - Sales Cycle Time: `AVG(conversion_time_minutes)` desde analytics_lead_generation

4. **Pipeline desde status de leads**
   ```typescript
   const pipeline = [
     { name: 'Nuevos', count: leads.filter(l => l.status === 'new').length },
     { name: 'Contactados', count: leads.filter(l => l.status === 'contacted').length },
     { name: 'Calificados', count: leads.filter(l => l.status === 'qualified').length },
     { name: 'Convertidos', count: leads.filter(l => l.status === 'converted').length }
   ]
   ```

5. **Agregar disclaimer**
   ```tsx
   <Alert>
     <InfoIcon />
     Sales metrics derived from leads data.
     For detailed sales tracking, integrate CRM system.
   </Alert>
   ```

6. **Eliminar sección de agentes** (no hay datos)

**API usada:** `GET /api/analytics/modules/sales`

**Métricas mostradas:**
- ✅ Pipeline stages desde leads.status (REAL derivado)
- ✅ Conversion funnel (REAL)
- ✅ Top properties por leads (REAL)
- ✅ Lead sources performance (REAL)
- ⚠️ Revenue (derivado de lead_value estimado)
- ❌ Sales agents (no disponible - ocultar)

**Complejidad:** Media-Alta
**Tiempo estimado:** 4-5 horas
**Testing:** Verificar con leads reales, especialmente converted

---

#### 3.2 CustomerInsights → LeadInsights (Renombrado)

**Objetivo:** Transformar en "Lead Insights" con datos honestos

**Archivo:** `components/admin/CustomerInsights.tsx` → renombrar a `LeadInsights.tsx`

**Cambios conceptuales:**
1. **Renombrar componente y archivo**
   - `CustomerInsights.tsx` → `LeadInsights.tsx`
   - Título: "Customer Insights" → "Lead Analytics & Segmentation"

2. **Cambiar enfoque de Customer a Lead**
   - No pretender tener customer data que no existe
   - Enfocarse en análisis de leads
   - Ser honesto sobre limitaciones

**Cambios técnicos:**
1. **KPIs basados en leads**
   ```typescript
   const leadKPIs = {
     totalLeads: {
       value: totalLeads,
       newThisMonth: leadsThisMonth,
       qualified: qualifiedLeads,
       converted: convertedLeads
     },
     avgLeadValue: {
       value: avgLeadValue,
       change: changeVsPrevMonth,
       highValueLeads: leadsAboveAvg
     },
     leadQuality: {
       value: avgScore,
       change: scoreChange,
       distribution: scoreDistribution
     },
     conversionRate: {
       value: conversionRate,
       change: conversionChange,
       benchmark: industryBenchmark || null
     }
   }
   ```

2. **Segmentación de leads (no customers)**
   ```typescript
   const leadSegments = [
     {
       id: 'hot_leads',
       name: 'Hot Leads',
       description: 'High priority, quick response needed',
       leadCount: leads.filter(l => l.priority === 'high').length,
       avgValue: avgValueOfHotLeads,
       conversionRate: conversionRateHotLeads
     },
     {
       id: 'qualified_leads',
       name: 'Qualified Leads',
       description: 'Contacted and qualified',
       leadCount: leads.filter(l => l.status === 'qualified').length,
       avgValue: avgValueOfQualified,
       conversionRate: conversionRateQualified
     },
     // ... más segmentos
   ]
   ```

3. **Lead Journey (no customer journey)**
   - Awareness → View → Contact → Qualification → Conversion
   - Datos desde analytics_sessions → views → leads

4. **Eliminar métricas no disponibles**
   - ❌ NPS score
   - ❌ Customer satisfaction
   - ❌ Retention rate real (puede calcular leads recurrentes)
   - ❌ Lifetime value real

**API usada:**
- `GET /api/analytics/modules/customers` (renombrar internamente a leads)
- `GET /api/leads` (tabla leads directamente)

**Métricas mostradas:**
- ✅ Total leads y distribución por status (REAL)
- ✅ Lead quality score (REAL si existe en DB)
- ✅ Conversion rate (REAL)
- ✅ Lead segmentation por priority/status (REAL)
- ✅ Lead journey stages (REAL derivado)
- ⚠️ Lead value (estimado o manual)
- ❌ Customer satisfaction/NPS (ocultar)

**Rutas a actualizar:**
- `app/admin/analytics/customers/page.tsx` → considerar renombrar a `leads`
- Navegación en sidebar

**Complejidad:** Media
**Tiempo estimado:** 3-4 horas
**Testing:** Verificar con datos de leads table

---

## 4. Especificaciones Técnicas Detalladas

### 4.1 Estructura de Archivos Afectados

```
landpage-marconi/
├── components/admin/
│   ├── PropertyAnalytics.tsx        [MODIFICAR - Fase 1.1]
│   ├── MarketingAnalytics.tsx       [MODIFICAR - Fase 2.1, 2.2]
│   ├── SalesPerformance.tsx         [MODIFICAR - Fase 3.1]
│   ├── CustomerInsights.tsx         [RENOMBRAR - Fase 3.2]
│   └── LeadInsights.tsx             [CREAR - Fase 3.2]
│
├── hooks/
│   └── useRealTimeUpdates.ts        [MODIFICAR - Fase 1.2]
│
├── app/api/analytics/modules/[module]/
│   └── route.ts                     [VERIFICAR/MODIFICAR - Fase 3.1]
│
├── app/admin/analytics/
│   ├── properties/page.tsx          [OK - sin cambios]
│   ├── marketing/page.tsx           [OK - sin cambios]
│   ├── sales/page.tsx               [OK - sin cambios]
│   └── customers/page.tsx           [CONSIDERAR RENOMBRAR - Fase 3.2]
│
└── types/
    └── analytics.ts                 [POSIBLE EXTENSIÓN]
```

### 4.2 Dependencias y Servicios

**Servicios TypeScript:**
- ✅ `services/analytics.ts` - Ya implementado, sin cambios
- ✅ `services/properties.ts` - Ya implementado, sin cambios
- ✅ `services/leads.ts` - Ya implementado, sin cambios

**Hooks:**
- ✅ `useAnalyticsDashboard.ts` - Ya funcional, sin cambios
- ✅ `useAnalytics.ts` - Ya funcional, sin cambios
- 🔄 `useRealTimeUpdates.ts` - Modificar en Fase 1.2
- ⚠️ `useLeadAnalytics.ts` - Opcional, verificar si se usa
- ⚠️ `usePropertyMetrics.ts` - Opcional, verificar si se usa

**APIs REST:**
- ✅ `GET /api/analytics/dashboard` - Funcional
- ✅ `GET /api/analytics/modules/{module}` - Funcional para todos los módulos
- ✅ `GET /api/analytics/property-metrics/{id}` - Funcional
- ✅ Todas las APIs de tracking - Funcionales

### 4.3 Testing Strategy

**Por Fase:**

**Fase 1:**
- [ ] PropertyAnalytics renderiza sin datos mock
- [ ] PropertyAnalytics muestra datos reales si existen en DB
- [ ] PropertyAnalytics calcula days_on_market correctamente
- [ ] useRealTimeUpdates hace polling cada 60 segundos
- [ ] useRealTimeUpdates pausa cuando tab no visible

**Fase 2:**
- [ ] MarketingAnalytics muestra 12 fuentes de leads
- [ ] Channel performance con conversion rates correctos
- [ ] Campaign data desde UTM params
- [ ] Disclaimers visibles para métricas no tracked

**Fase 3:**
- [ ] SalesPerformance deriva pipeline desde leads.status
- [ ] Funnel de conversión con datos reales
- [ ] LeadInsights (renombrado) muestra segmentos correctos
- [ ] Lead journey con stages reales

**Testing General:**
- [ ] Todos los componentes manejan loading state
- [ ] Todos los componentes manejan empty state
- [ ] Todos los componentes manejan error state
- [ ] No hay console errors en producción
- [ ] Performance acceptable (< 2s para cargar cada dashboard)

### 4.4 Manejo de Estados

**Loading State:**
```tsx
{loading && (
  <div className="space-y-4">
    <LoadingSkeleton count={4} />
  </div>
)}
```

**Empty State:**
```tsx
{!loading && data.length === 0 && (
  <Card>
    <CardContent className="text-center py-12">
      <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No data available yet</h3>
      <p className="text-sm text-muted-foreground mt-2">
        Start tracking analytics to see insights here
      </p>
    </CardContent>
  </Card>
)}
```

**Error State:**
```tsx
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error loading analytics</AlertTitle>
    <AlertDescription>
      {error.message}
      <Button variant="outline" size="sm" onClick={retry} className="mt-2">
        Retry
      </Button>
    </AlertDescription>
  </Alert>
)}
```

---

## 5. Métricas de Éxito

### 5.1 KPIs del Proyecto

| Métrica | Antes | Objetivo | Medición |
|---------|-------|----------|----------|
| **% Datos Mock** | 50% | 0% | Código review |
| **Componentes funcionales** | 2/6 | 6/6 | Testing manual |
| **APIs utilizadas** | 2/8 | 8/8 | Network tab |
| **Coverage de métricas** | 40% | 90% | Inventario de métricas |
| **User errors** | ? | 0 | Error logging |
| **Load time** | ? | <2s | Performance profiling |

### 5.2 Criterios de Aceptación

**Fase 1 Completada:**
- [ ] PropertyAnalytics NO usa mockPropertiesData
- [ ] PropertyAnalytics calcula days_on_market desde created_at
- [ ] PropertyAnalytics genera insights dinámicos
- [ ] useRealTimeUpdates hace polling de /api/analytics/dashboard
- [ ] No hay console errors

**Fase 2 Completada:**
- [ ] MarketingAnalytics muestra channels desde analytics_lead_sources
- [ ] MarketingAnalytics muestra campaigns desde UTM tracking
- [ ] Disclaimers visibles para CPL/ROI
- [ ] Conversion rates correctos por canal

**Fase 3 Completada:**
- [ ] SalesPerformance deriva KPIs desde leads table
- [ ] Pipeline refleja status real de leads
- [ ] CustomerInsights renombrado a LeadInsights
- [ ] LeadInsights muestra segmentación real de leads
- [ ] Disclaimers apropiados en todas las métricas derivadas

**Proyecto Completo:**
- [ ] Todas las fases completadas
- [ ] Testing pasado
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] Deploy a producción

---

## 6. Riesgos y Mitigaciones

### 6.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **No hay datos en DB** | Media | Alto | Implementar seeding de datos demo |
| **APIs retornan errores** | Baja | Alto | Manejo robusto de errores, fallbacks |
| **Performance lento** | Media | Medio | Caching agresivo, lazy loading |
| **Breaking changes en APIs** | Baja | Alto | Testing exhaustivo pre-deploy |
| **Inconsistencia de datos** | Media | Medio | Validación en backend |

### 6.2 Riesgos de Negocio

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Expectativas no cumplidas** | Media | Medio | Comunicación clara sobre limitaciones |
| **Datos revelan problemas** | Media | Bajo | Positivo - permite tomar acción |
| **Usuarios extrañan features mock** | Baja | Bajo | Roadmap claro de features futuras |

### 6.3 Plan de Contingencia

**Si no hay suficientes datos reales:**
- Opción A: Seeding de datos demo realistas
- Opción B: Mostrar empty states con CTAs
- Opción C: Tutorial de onboarding para generar datos

**Si APIs tienen problemas:**
- Implementar circuit breaker
- Fallback a cached data
- Graceful degradation

**Si performance es lento:**
- Implementar pagination
- Lazy loading de charts
- Server-side caching más agresivo

---

## 7. Roadmap Visual

```
┌─────────────────────────────────────────────────────────────┐
│                     PROYECTO COMPLETO                       │
│                  Estimado: 8-11 días                        │
└─────────────────────────────────────────────────────────────┘

Semana 1: FASE 1 - Mejoras Rápidas
┌──────────────┬──────────────┬──────────────┐
│   Día 1-2    │              │              │
│ Property     │ useRealTime  │   Testing    │
│ Analytics    │  Updates     │   Fase 1     │
│  (4-6h)      │   (2-3h)     │   (2-3h)     │
└──────────────┴──────────────┴──────────────┘
                ✅ Quick Wins

Semana 2: FASE 2 - Actualizaciones Medias
┌──────────────┬──────────────┬──────────────┐
│   Día 3-4    │   Día 5      │              │
│ Marketing    │ Campaign     │   Testing    │
│  Channels    │ Tracking     │   Fase 2     │
│  (3-4h)      │  (2-3h)      │   (2-3h)     │
└──────────────┴──────────────┴──────────────┘
                ✅ Marketing Real Data

Semana 3: FASE 3 - Transformaciones
┌──────────────┬──────────────┬──────────────┐
│   Día 6-7    │   Día 8-9    │   Día 10-11  │
│    Sales     │    Lead      │   Testing    │
│ Performance  │  Insights    │  Completo    │
│  (4-5h)      │  (3-4h)      │  + Fixes     │
└──────────────┴──────────────┴──────────────┘
                ✅ Proyecto Completo
```

---

## 8. Próximos Pasos Inmediatos

### Paso 1: Configuración del Entorno (30 min)
1. [ ] Pull latest code
2. [ ] Verificar que dev server funciona
3. [ ] Verificar acceso a Supabase
4. [ ] Ejecutar `GET /api/analytics/dashboard` manualmente para verificar datos

### Paso 2: Análisis de Datos Existentes (1 hora)
1. [ ] Verificar cuántos registros hay en:
   - `analytics_sessions`
   - `analytics_property_views`
   - `analytics_lead_generation`
   - `leads`
   - `properties`
2. [ ] Si <10 registros: Crear datos de prueba
3. [ ] Documentar IDs de propiedades para testing

### Paso 3: Comenzar Fase 1.1 (4-6 horas)
1. [ ] Crear branch: `feature/analytics-real-data-phase-1`
2. [ ] Abrir `components/admin/PropertyAnalytics.tsx`
3. [ ] Seguir especificaciones de Fase 1.1
4. [ ] Testing local
5. [ ] Commit y push

---

## 9. Notas Adicionales

### 9.1 Consideraciones de UX

**Transparencia sobre datos:**
- Usar badges/tooltips para indicar "Derived metric"
- Mostrar "Not tracked" en lugar de valores falsos
- Explicar limitaciones cuando sea necesario

**Performance:**
- Lazy loading de charts pesados
- Skeleton loaders durante carga
- Debouncing de actualizaciones en tiempo real

**Accesibilidad:**
- Colores accesibles en charts
- Alt text en visualizaciones
- Keyboard navigation

### 9.2 Documentación

**Actualizar durante el proyecto:**
- [ ] README.md con nuevas capabilities
- [ ] CLAUDE.md si cambian patrones
- [ ] Comentarios en código para métricas derivadas
- [ ] API documentation si se agregan endpoints

### 9.3 Code Quality

**Standards:**
- TypeScript strict mode
- ESLint rules
- Prettier formatting
- Componentes funcionales con hooks
- Props bien tipados

**Refactoring oportunidades:**
- Extraer cálculos complejos a utils
- Compartir lógica de transformación
- Custom hooks para queries repetidas

---

## 10. Conclusión

Este plan maestro proporciona una **ruta clara y priorizada** para eliminar todos los datos mock del dashboard de analytics y reemplazarlos con **datos 100% reales** de la base de datos.

**Ventajas del enfoque:**
- ✅ Basado en infraestructura existente y funcional
- ✅ No requiere crear nuevas tablas (usa las 11 existentes)
- ✅ Priorización clara: quick wins primero
- ✅ Estimaciones realistas
- ✅ Riesgos identificados y mitigados
- ✅ Criterios de éxito claros

**Resultado final esperado:**
Un sistema de dashboards de analytics **completamente funcional** que muestra el **estado real del negocio**, con métricas honestas y confiables, sentando las bases para expansiones futuras.

---

**Aprobación requerida antes de iniciar:** ✓
**Recursos necesarios:** 1 desarrollador full-time
**Duración estimada:** 8-11 días laborales
**Prioridad:** 🔴 Alta

---

*Generado por Claude Code + Análisis de Agentes Especializados*
*Fecha: 2025-10-03*
*Versión: 1.0*
