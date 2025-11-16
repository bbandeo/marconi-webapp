# Dashboard Analytics v4 - Marconi Inmobiliaria
## Documento de Requerimientos de Business Intelligence

---

## 📊 ANÁLISIS DEL SISTEMA ACTUAL DE DATOS

### Datos Recolectados por el Sistema
Basado en el análisis del código, el sistema actual recolecta:

#### **1. Sesiones de Usuario (analytics_sessions)**
- **Identificación**: Session UUID, IP hash (GDPR compliant)
- **Dispositivo & Browser**: Device type, browser, OS, screen resolution
- **Origen**: Referrer domain, landing page, geolocalización
- **Marketing**: UTM parameters completos (source, medium, campaign, term, content)
- **Comportamiento**: Timestamps de primera y última actividad

#### **2. Vistas de Propiedades (analytics_property_views)**
- **Engagement**: Duración de vista, scroll depth, imágenes vistas
- **Interacciones**: Contact form clicks, WhatsApp, teléfono, email clicks
- **Navegación**: URL, referrer, query de búsqueda, filtros aplicados
- **Debounce**: Sistema de 2 horas para evitar vistas duplicadas

#### **3. Generación de Leads (analytics_lead_generation)**
- **Atribución**: Lead source, property attribution, session tracking
- **Conversión**: Tiempo hasta conversión, página de conversión
- **Contexto**: Form type, contact method, UTM data
- **Valor**: Lead value estimation (no implementado completamente)

#### **4. Interacciones de Usuario (analytics_user_interactions)**
- **Eventos**: Clicks, scrolls, form focus, gallery interactions
- **Contexto**: Element IDs, coordinates, viewport data
- **Metadata**: Page URL, timestamp, interaction data JSON

#### **5. Fuentes de Lead (analytics_lead_sources)**
- **Catálogo**: 12 fuentes predefinidas (web, social, direct, referral, advertising)
- **UI Config**: Icons, colors, display names
- **Categorización**: Web, social, direct, referral, advertising

---

## 🎯 REQUERIMIENTOS DE KPIs PARA INMOBILIARIA JOVEN EN CRECIMIENTO

### **MÉTRICAS CRÍTICAS (Must-Have)**

#### **A. Performance de Ventas**
1. **Conversion Rate Global**: Lead-to-sale conversion %
2. **Lead Velocity**: Tiempo promedio de lead a venta
3. **Revenue per Lead**: Valor promedio por lead convertido
4. **Monthly Recurring Revenue (MRR)**: Para alquileres
5. **Sales Cycle Length**: Duración promedio del ciclo de venta

#### **B. Generación de Leads**
1. **Lead Generation Rate**: Leads/día, leads/semana
2. **Lead Quality Score**: Basado en probabilidad de conversión
3. **Cost per Lead (CPL)**: Por canal de marketing
4. **Lead Source Attribution**: ROI por fuente
5. **Response Time**: Tiempo de respuesta a nuevos leads

#### **C. Performance Digital**
1. **Website Conversion Rate**: Visitantes a leads
2. **Property Detail Views**: Depth de engagement
3. **Search-to-Contact Ratio**: Eficacia del proceso de búsqueda
4. **Mobile vs Desktop Performance**: Conversión por dispositivo
5. **Bounce Rate por Tipo de Propiedad**: Relevancia del contenido

### **MÉTRICAS IMPORTANTES (Should-Have)**

#### **D. Análisis de Propiedades**
1. **Time on Market**: Tiempo promedio de venta por tipo
2. **Price per Square Meter Trends**: Tendencias de precio/m²
3. **Property Type Performance**: Ventas por tipo de propiedad
4. **Location Performance**: Ventas por zona/barrio
5. **Listing Quality Score**: Engagement vs características

#### **E. Marketing & Canales**
1. **UTM Campaign Performance**: ROI de campañas específicas
2. **Social Media Engagement**: Leads desde redes sociales
3. **Organic vs Paid Traffic**: Distribución y performance
4. **Referral Program Performance**: Leads por referidos
5. **Seasonal Trends**: Patrones estacionales de demanda

#### **F. Experiencia del Cliente**
1. **Customer Journey Length**: Pasos hasta conversión
2. **Touch Points Analysis**: Canales más efectivos en el journey
3. **Property Match Quality**: Relevancia de recomendaciones
4. **Response Satisfaction**: Feedback de tiempo de respuesta
5. **Repeat Customer Rate**: Clientes recurrentes

### **MÉTRICAS ADICIONALES (Could-Have)**

#### **G. Predictive Analytics**
1. **Lead Scoring Model**: Probabilidad de conversión AI-driven
2. **Churn Prediction**: Riesgo de pérdida de clientes
3. **Price Optimization**: Recomendaciones de pricing
4. **Inventory Turnover Prediction**: Tiempo estimado de venta
5. **Market Trend Forecasting**: Predicción de demanda

#### **H. Operational Excellence**
1. **Agent Performance**: Conversión por agente de ventas
2. **Follow-up Efficiency**: Tasa de seguimiento oportuno
3. **Documentation Quality**: Completitud de fichas técnicas
4. **Photo Quality Impact**: Correlación fotos-engagement
5. **Virtual Tour Effectiveness**: ROI de tours virtuales

---

## 🏗️ ARQUITECTURA DE INFORMACIÓN DEL DASHBOARD

### **ESTRUCTURA MODULAR PROPUESTA**

#### **🏠 MÓDULO 1: OVERVIEW EJECUTIVO**
**Ubicación**: Dashboard principal (landing page)
**Público**: CEO, Gerentes, Directores
**Métricas Clave**:
- Revenue total del período
- Leads generados vs objetivo
- Properties sold/rented vs inventory
- Conversion rate global
- Top 3 properties performance

#### **📈 MÓDULO 2: SALES PERFORMANCE**
**Ubicación**: Sección de Ventas
**Público**: Sales Manager, Agentes
**Subsecciones**:
- **2A. Sales Pipeline**: Status de leads por etapa
- **2B. Conversion Funnel**: Visitante → Lead → Cliente
- **2C. Agent Performance**: Métricas individuales de agentes
- **2D. Property Performance**: Top/bottom properties

#### **🎯 MÓDULO 3: MARKETING & LEADS**
**Ubicación**: Sección de Marketing
**Público**: Marketing Manager, CMO
**Subsecciones**:
- **3A. Lead Generation**: Volume, quality, sources
- **3B. Channel Performance**: ROI por canal de marketing
- **3C. Campaign Analysis**: UTM tracking y ROI
- **3D. Website Analytics**: Traffic, engagement, conversión

#### **🏘️ MÓDULO 4: PROPERTY ANALYTICS**
**Ubicación**: Sección de Propiedades
**Público**: Property Managers, Analistas
**Subsecciones**:
- **4A. Property Performance**: Views, leads, time on market
- **4B. Market Insights**: Trends de precio, demanda por zona
- **4C. Listing Optimization**: Photo performance, description effectiveness
- **4D. Inventory Management**: Stock levels, turnover rates

#### **👥 MÓDULO 5: CUSTOMER INSIGHTS**
**Ubicación**: Sección de Clientes
**Público**: Customer Success, CRM Manager
**Subsecciones**:
- **5A. Customer Journey**: Path to conversion analysis
- **5B. Behavioral Patterns**: Device usage, time patterns
- **5C. Geographic Analysis**: Cliente distribution y preferences
- **5D. Retention & Referrals**: Customer lifetime value

---

## 🔄 FLUJO DE NAVEGACIÓN PROPUESTO

### **NAVEGACIÓN PRINCIPAL**
```
Dashboard Home
├── 📊 Overview Ejecutivo (Default)
├── 💰 Sales Performance
├── 🎯 Marketing & Leads
├── 🏘️ Property Analytics
├── 👥 Customer Insights
└── ⚙️ Configuration
```

### **NAVEGACIÓN SECUNDARIA POR MÓDULO**

#### **Sales Performance**
```
Sales
├── Pipeline View (Default)
├── Conversion Funnel
├── Agent Performance
└── Property Rankings
```

#### **Marketing & Leads**
```
Marketing
├── Lead Overview (Default)
├── Channel Performance
├── Campaign ROI
└── Website Analytics
```

#### **Property Analytics**
```
Properties
├── Performance Dashboard (Default)
├── Market Insights
├── Listing Optimization
└── Inventory Analysis
```

#### **Customer Insights**
```
Customers
├── Journey Analysis (Default)
├── Behavioral Patterns
├── Geographic Analysis
└── Retention Analysis
```

---

## 📱 RESPONSIVE DESIGN CONSIDERATIONS

### **Desktop (Primary)**
- **Layout**: Grid 4-columnas para métricas principales
- **Gráficos**: Charts complejos con drill-down capabilities
- **Tables**: Data tables con sorting y filtering avanzado

### **Tablet**
- **Layout**: Grid 2-columnas adaptativo
- **Navegación**: Tab-based navigation con swipe
- **Gráficos**: Simplified charts optimizados para touch

### **Mobile**
- **Layout**: Single column con métricas colapsables
- **Navegación**: Bottom navigation bar
- **Interacción**: Touch-optimized con gestures

---

## 📊 ARQUITECTURA DE WIDGETS

### **WIDGET TYPES STANDARDIZADOS**

#### **1. KPI Cards**
- Métrica principal + trend indicator
- Comparación período anterior
- Target vs actual
- Color coding (green/red/yellow)

#### **2. Time Series Charts**
- Line charts para trends temporales
- Multiple series support
- Zoom & pan capabilities
- Period comparison overlay

#### **3. Ranking Tables**
- Top/bottom performers
- Sortable columns
- Drill-down navigation
- Export functionality

#### **4. Funnel Visualizations**
- Conversion funnels
- Drop-off analysis
- Stage-by-stage breakdown
- Actionable insights

#### **5. Geographic Maps**
- Property distribution
- Performance heatmaps
- Zoom to neighborhood level
- Cluster analysis

---

## 🎨 DESIGN SYSTEM INTEGRATION

### **Component Hierarchy**
```
DashboardLayout
├── HeaderNavigation
├── SidebarNavigation
├── ModuleContainer
│   ├── ModuleHeader
│   ├── FilterBar
│   ├── WidgetGrid
│   │   ├── KPICard
│   │   ├── Chart
│   │   ├── DataTable
│   │   └── Map
│   └── ModuleFooter
└── FooterActions
```

### **State Management**
- **Global**: Dashboard filters, user preferences
- **Module**: Module-specific data and filters
- **Widget**: Individual widget state and data
- **Cache**: Query result caching for performance

---

Este análisis establece las bases para un dashboard completo que balanceará las necesidades operativas inmediatas de una inmobiliaria en crecimiento con capacidades analíticas avanzadas para optimización futura.