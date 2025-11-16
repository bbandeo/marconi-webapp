# Metrics Audit - Task Onboarding

**Task ID:** metrics-audit
**Date:** 2025-10-01
**Objective:** Auditar todas las métricas implementadas en los dashboards analytics v4 y determinar cuáles están conectadas a datos reales vs. mock data

---

## 📋 TASK OVERVIEW

### Context
Los 5 módulos de Analytics Dashboard v4 (T3.1 - T3.5) están completamente implementados y funcionales, pero actualmente muestran **datos mock hardcoded**. Existe un sistema de analytics robusto en producción que recolecta datos reales, pero **no está conectado a los dashboards**.

### Objective
Crear un inventario completo de todas las métricas mostradas en los dashboards y clasificarlas según su estado de implementación para priorizar la conexión con datos reales.

---

## 🔍 RESEARCH COMPLETED

### Files Analyzed

**Dashboard Components (5 archivos):**
1. `components/admin/ExecutiveOverview.tsx` - Overview ejecutivo con 4 KPIs principales
2. `components/admin/SalesPerformance.tsx` - Sales dashboard con pipeline y agent performance
3. `components/admin/MarketingAnalytics.tsx` - Marketing con channels, campaigns y ROI
4. `components/admin/PropertyAnalytics.tsx` - Property performance y geographic analytics
5. `components/admin/CustomerInsights.tsx` - Customer segmentation y journey

**Analytics Infrastructure:**
1. `services/analytics.ts` - Servicio principal de analytics (950+ líneas)
2. `scripts/analytics-schema-migration.sql` - Schema completo de 11 tablas
3. `types/analytics.ts` - Type definitions para analytics

### Key Findings

**✅ Sistema de Recolección REAL Implementado:**
- **11 tablas PostgreSQL** funcionando en producción
- **Sessions tracking** con GDPR compliance (IP hashing)
- **Property views** con debounce de 2 horas
- **Lead generation** con attribution
- **Campaign tracking** con UTM parameters
- **User interactions** detalladas (clicks, scrolls)
- **Agregaciones** (daily, weekly, monthly stats)

**❌ Dashboards Usando Mock Data:**
- Todos los 5 dashboards usan datos hardcoded
- Funciones `generateMockData()` en cada componente
- No hay conexión con `services/analytics.ts`
- Hooks `useAnalyticsDashboard` existen pero no implementados

---

## 📊 METRICS INVENTORY SUMMARY

### Total Metrics Identified: ~80+

**Por Dashboard:**
- **Executive Overview:** 4 KPIs + 2 charts
- **Sales Performance:** 4 KPIs + pipeline (5 stages) + agents (6) + property rankings
- **Marketing & Leads:** 4 KPIs + channels (6) + campaigns + website analytics
- **Property Analytics:** 4 KPIs + property performance + geographic + price trends
- **Customer Insights:** 4 KPIs + segmentation (5) + journey (6 stages)

### Classification

**✅ Already Collecting (Real Data Available):**
- Sessions & unique visitors
- Property views (total, unique, duration)
- Lead generation events
- Source attribution (UTM, referrer)
- Device type breakdown
- Interaction events (phone, whatsapp, email, contact form clicks)
- Campaign data (basic)

**⏸️ Partially Available (Needs Calculation):**
- Conversion rates (data exists, calculation needed)
- Average metrics (avg duration, avg value)
- Trends & comparisons (temporal analysis)
- Bounce rates (can be calculated)
- Time on market (property data + analytics)

**❌ Not Implemented (Requires New Collection):**
- **Revenue tracking** - Solo tenemos leads, no ventas cerradas
- **Sales closed** - No hay tracking de cierre de venta
- **Agent performance** - No hay asignación de leads a agentes
- **Customer segmentation** - No hay lógica de segmentación
- **Customer lifetime value** - No se calcula
- **NPS scores** - No se recolecta satisfacción
- **Agent rankings** - No hay sistema de scoring
- **Property revenue attribution** - No se trackea revenue por property
- **ROI calculations** - Falta costo y revenue tracking
- **A/B testing results** - No hay sistema de experimentos

---

## 🗂️ DATABASE SCHEMA ANALYSIS

### Existing Tables (11 total)

**Core Tracking Tables:**
1. `analytics_sessions` - Usuario anónimo, device, UTM, geo
2. `analytics_property_views` - Vistas detalladas con interacciones
3. `analytics_lead_sources` - Catálogo de fuentes (WhatsApp, Web, etc.)
4. `analytics_lead_generation` - Leads generados con attribution
5. `analytics_user_interactions` - Clicks, scrolls, eventos específicos
6. `analytics_campaign_attribution` - First/last touch attribution

**Aggregation Tables:**
7. `analytics_daily_stats` - Stats diarias por property
8. `analytics_weekly_stats` - Stats semanales por property
9. `analytics_monthly_stats` - Stats mensuales por property
10. `analytics_lead_source_stats` - Stats por fuente de lead
11. `analytics_campaign_stats` - Stats de campañas (impressions, clicks, cost, ROI)

### Missing Tables (Need to Create)

1. **Sales Pipeline Table** - Para tracking de etapas de venta
2. **Agent Performance Table** - Para métricas por agente
3. **Customer Segments Table** - Para segmentación
4. **Revenue Events Table** - Para tracking de ventas cerradas
5. **Property Revenue Table** - Para revenue attribution por property

---

## 🔧 HOOKS & SERVICES STATUS

### Implemented (T2.1 - Servicios de Datos)

**Hooks Created (but not fully implemented):**
- `hooks/useAnalyticsDashboard.ts` - Hook principal (estructura creada)
- `hooks/usePropertyMetrics.ts` - Métricas de propiedades
- `hooks/useLeadAnalytics.ts` - Analytics de leads
- `hooks/useRealTimeUpdates.ts` - Updates en tiempo real

**Status:** Los hooks existen con TypeScript types correctos pero usan React Query con mock data o endpoints no implementados.

### Service Layer

**`services/analytics.ts`** - FULLY IMPLEMENTED
- ✅ Session creation & management
- ✅ Property view tracking
- ✅ Lead generation tracking
- ✅ User interaction tracking
- ✅ Dashboard stats retrieval (basic)
- ⏸️ Advanced analytics (parcial)

**What's Missing:**
- API routes en `app/api/analytics/*` no existen completamente
- Agregaciones avanzadas (trends, comparisons)
- Real-time calculations
- Complex queries (funnel analysis, cohort analysis)

---

## 💡 TECHNICAL CHALLENGES IDENTIFIED

### 1. Missing Revenue Data
**Problem:** Dashboards muestran revenue, pero solo rastreamos leads, no ventas cerradas.

**Solution Options:**
- A) Integrar con CRM externo (si existe)
- B) Crear tabla `sales_closed` en DB
- C) Usar lead value estimado × conversion rate

### 2. Agent Assignment Missing
**Problem:** No hay tracking de qué agente maneja qué lead.

**Solution:** Agregar campo `assigned_agent_id` a tabla `leads`

### 3. Customer Segmentation Logic
**Problem:** Los segmentos son mock, no hay lógica real.

**Solution:** Implementar reglas de segmentación:
- VIP Investors: >2 propiedades compradas + alto valor
- First-Time Buyers: 1 compra, sin historial
- Etc.

### 4. Real-Time Updates
**Problem:** Dashboards prometen real-time pero usan mock data static.

**Solution:**
- React Query polling (cada 30s)
- O WebSocket connection para updates live
- Supabase Realtime subscriptions

### 5. Performance at Scale
**Problem:** Queries complejos pueden ser lentos con mucho data.

**Solution:**
- Usar tablas de agregación (ya existen)
- Materialized views en PostgreSQL
- Caching en Redis (futuro)

---

## 📈 METRICS BY CATEGORY

### Revenue Metrics
- Total Revenue (❌ no tracking)
- Revenue by Property (❌ no tracking)
- Average Sale Value (❌ no tracking)
- Revenue Trends (❌ no tracking)
- Revenue Goals vs Actual (❌ no tracking)

### Lead Metrics
- Total Leads (✅ implemented)
- Lead Quality Score (❌ logic missing)
- Lead Source Attribution (✅ implemented)
- Lead Conversion Rate (⏸️ needs calculation)
- Cost Per Lead (⏸️ needs cost data)

### Property Metrics
- Total Properties (✅ from properties table)
- Active Properties (✅ from properties table)
- Views per Property (✅ implemented)
- Unique Views (✅ implemented)
- Time on Market (⏸️ needs calculation)
- Property Conversion Rate (⏸️ needs sales data)

### Marketing Metrics
- Channel Performance (⏸️ partial data)
- Campaign ROI (❌ needs cost + revenue)
- UTM Tracking (✅ implemented)
- Website Traffic (✅ implemented)
- Bounce Rate (⏸️ needs calculation)
- Click-Through Rate (⏸️ partial data)

### Customer Metrics
- Total Customers (⏸️ = leads que compraron?)
- Lifetime Value (❌ no tracking)
- Customer Satisfaction (❌ no surveys)
- NPS Score (❌ no tracking)
- Retention Rate (❌ no tracking)
- Churn Rate (❌ no tracking)

### Agent Metrics
- Agent Sales Count (❌ no assignment)
- Agent Revenue (❌ no tracking)
- Agent Conversion Rate (❌ no tracking)
- Agent Rankings (❌ no scoring system)

---

## 🎯 RECOMMENDED IMPLEMENTATION PHASES

### Phase 1: Low-Hanging Fruit (1-2 weeks)
**Objetivo:** Conectar métricas que YA tenemos datos para mostrar

**Tasks:**
1. Conectar Property Views a Property Analytics Dashboard
2. Conectar Lead Generation a Marketing Dashboard
3. Implementar cálculos básicos (conversion rates, averages)
4. Crear API routes faltantes (`/api/analytics/dashboard`, `/api/analytics/properties`, etc.)
5. Actualizar hooks para consumir APIs reales

**Metrics Unlocked:** ~30 métricas (property views, leads, sources, channels, devices)

### Phase 2: Calculations & Aggregations (2-3 weeks)
**Objetivo:** Calcular métricas derivadas de datos existentes

**Tasks:**
1. Implementar funciones PostgreSQL para agregaciones complejas
2. Crear materialized views para queries pesados
3. Calcular trends (week-over-week, month-over-month)
4. Implementar bounce rate calculation
5. Time-series analysis para charts

**Metrics Unlocked:** ~20 métricas (trends, bounces, time metrics, comparisons)

### Phase 3: New Data Collection (3-5 weeks)
**Objetivo:** Implementar tracking de métricas faltantes

**Tasks:**
1. Sales Pipeline Tracking (tabla + UI)
2. Revenue Events (cerrar loop de lead→sale)
3. Agent Assignment System
4. Customer Segmentation Logic
5. NPS/Satisfaction Surveys

**Metrics Unlocked:** ~30 métricas (revenue, agent performance, customer insights)

---

## 📝 DELIVERABLES

### 1. Analytics Metrics Inventory (`analytics-metrics-inventory.md`)
- Lista completa de ~80 métricas
- Estado de cada una (✅ ⏸️ ❌)
- Source data para cada métrica
- Calculation logic needed

### 2. Implementation Roadmap (`implementation-roadmap.md`)
- 3 fases detalladas
- Tareas específicas por fase
- Estimaciones de tiempo
- Priorización por valor/esfuerzo

### 3. This Onboarding Doc
- Context completo
- Research findings
- Technical challenges
- Next steps

---

## ❓ QUESTIONS FOR STAKEHOLDER

1. **Revenue Tracking:** ¿Existe un sistema CRM externo donde se registran ventas cerradas? ¿O debemos crear todo en la DB?

2. **Agent Management:** ¿Hay un sistema de asignación de leads a agentes? ¿O los agentes toman leads libremente?

3. **Customer Definition:** ¿Qué define un "customer"? ¿Un lead que compró? ¿Necesitamos tabla separada?

4. **Budget Tracking:** ¿Se trackea el costo de campañas en algún lado? ¿O debemos agregar campos para budget?

5. **Priority:** ¿Qué dashboard es más crítico? ¿Executive Overview, Sales, o Marketing?

---

## ✅ READY TO PROCEED

Con esta investigación completa, estoy listo para:
1. ✅ Crear inventory detallado de métricas
2. ✅ Crear roadmap de implementación
3. ✅ Comenzar con Phase 1 cuando se apruebe

**Next Step:** Crear `analytics-metrics-inventory.md` con lista completa de métricas.
