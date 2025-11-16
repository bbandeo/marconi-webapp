# Analytics Components v4 - Base Components

Este directorio contiene los componentes base reutilizables para el dashboard analytics v4 de Marconi Inmobiliaria.

## Componentes Implementados

### 1. `KPICard` - Tarjetas de KPI
**Archivo:** `kpi-card.tsx`

Componente para mostrar indicadores clave de rendimiento con tendencias.

```tsx
<KPICard
  title="Total Propiedades"
  value={1234}
  format="number"
  trend={{
    value: 12.5,
    period: "vs mes anterior",
    direction: "positive"
  }}
  icon={Home}
  size="lg"
  color="primary"
  description="Propiedades activas en el sistema"
/>
```

**Características:**
- ✅ Formatos: number, currency, percentage
- ✅ Indicadores de tendencia con iconos
- ✅ 4 variantes de color (primary, secondary, tertiary, quaternary)
- ✅ 3 tamaños (sm, md, lg)
- ✅ Estados de loading
- ✅ Iconos opcionales

### 2. `ChartContainer` - Contenedor de Gráficos
**Archivo:** `chart-container.tsx`

Wrapper universal para componentes de gráficos con manejo de estados.

```tsx
<ChartContainer
  title="Visualizaciones por Mes"
  subtitle="Últimos 12 meses"
  size="lg"
  loading={isLoading}
  error={errorMessage}
  actions={<Button>Export</Button>}
>
  <LineChart data={chartData} />
</ChartContainer>
```

**Características:**
- ✅ Estados de loading y error
- ✅ Header con título, subtítulo y acciones
- ✅ 4 tamaños configurables
- ✅ Skeleton loading específico para charts
- ✅ Flexible para cualquier librería de gráficos

### 3. `TrendIndicator` - Indicadores de Tendencia
**Archivo:** `trend-indicator.tsx`

Componente especializado para mostrar cambios y tendencias.

```tsx
<TrendIndicator
  value={15.3}
  direction="positive"
  period="vs mes anterior"
  asPercentage
  size="lg"
  showIcon
  showValue
/>
```

**Características:**
- ✅ Detección automática de dirección por valor
- ✅ Formato como porcentaje o número
- ✅ Iconos direccionales automáticos
- ✅ 3 tamaños (sm, md, lg)
- ✅ Colores semánticos según dirección

### 4. `MetricsBadge` - Badges de Estado
**Archivo:** `metrics-badge.tsx`

Badges para estados, categorías y métricas del sistema.

```tsx
<MetricsBadge
  status="success"
  variant="solid"
  size="md"
  icon={CheckCircle}
>
  Sistema Operativo
</MetricsBadge>
```

**Características:**
- ✅ 5 estados: success, warning, error, info, neutral
- ✅ 3 variantes: solid, outline, soft
- ✅ 3 tamaños (sm, md, lg)
- ✅ Iconos opcionales
- ✅ Estados de loading

### 5. `DataTable` - Tabla de Datos
**Archivo:** `data-table.tsx`

Tabla completa con sorting, filtering y paginación.

```tsx
const columns: ColumnDef<PropertyData>[] = [
  {
    id: "name",
    header: "Propiedad",
    accessorFn: (row) => row.name,
    sortable: true
  },
  {
    id: "views",
    header: "Views",
    accessorFn: (row) => row.views,
    sortable: true,
    center: true,
    cell: ({ value }) => <span className="kpi-number">{value}</span>
  }
]

<DataTable
  data={properties}
  columns={columns}
  sorting
  filtering
  pagination
  pageSize={10}
  searchPlaceholder="Buscar propiedades..."
/>
```

**Características:**
- ✅ Sorting multi-columna
- ✅ Filtrado/búsqueda global
- ✅ Paginación automática
- ✅ Definición flexible de columnas
- ✅ Cell renderers personalizados
- ✅ Estados de loading

### 6. `LoadingSkeleton` - Estados de Carga
**Archivo:** `loading-skeleton.tsx`

Skeletons especializados para cada tipo de componente analytics.

```tsx
// Skeleton básico
<Skeleton variant="text" size="md" count={3} />

// Skeletons especializados
<SkeletonKPI showTrend showIcon size="lg" />
<SkeletonChart height="lg" showLegend />
<SkeletonTable columns={4} rows={5} showSearch showPagination />
<SkeletonGrid items={6} layout="mixed" />
```

**Componentes incluidos:**
- ✅ `Skeleton` - Base skeleton flexible
- ✅ `SkeletonKPI` - Para KPI cards
- ✅ `SkeletonChart` - Para contenedores de gráficos
- ✅ `SkeletonTable` - Para tablas de datos
- ✅ `SkeletonGrid` - Para grids de widgets

## Export Barrel

**Archivo:** `analytics.ts`

Exports centralizados de todos los componentes:

```tsx
import {
  KPICard,
  ChartContainer,
  TrendIndicator,
  MetricsBadge,
  DataTable,
  SkeletonKPI,
  SkeletonChart,
  SkeletonTable,
  type ColumnDef,
  type KPICardProps,
  type TrendConfig
} from "@/components/ui/analytics"
```

## Design System Integration

Todos los componentes utilizan los design tokens implementados:

### Colores Analytics
- `chart-primary` - #F37321 (naranja vibrante)
- `chart-secondary` - #4F46E5 (azul)
- `chart-tertiary` - #10B981 (verde)
- `chart-quaternary` - #8B5CF6 (púrpura)
- `trend-positive/negative/neutral`
- `status-success/warning/error/info/neutral`

### Tipografía Data
- `text-data-xxl` a `text-data-xxs` (48px a 10px)
- `kpi-number` y `kpi-number-large`
- `kpi-label` y `kpi-description`
- Font families optimizadas para legibilidad de datos

### Espaciado Widgets
- `widget-xs/sm/md/lg` - Padding interno de widgets
- `widget-gap` - Gap entre widgets
- `chart-padding` - Padding interno de gráficos

### CSS Utilities
- `.widget-container` - Contenedor base para widgets
- `.analytics-grid` - Grid responsive para layouts
- `.analytics-skeleton` - Estados de loading consistentes

## Accessibility (WCAG AA)

Todos los componentes implementan:

- ✅ **Contraste de color:** 4.5:1 mínimo
- ✅ **Semantic HTML:** Roles ARIA apropiados
- ✅ **Keyboard navigation:** Tab, Enter, Space
- ✅ **Screen readers:** aria-label, aria-describedby
- ✅ **Focus states:** Indicadores visuales claros
- ✅ **High contrast mode:** Compatible
- ✅ **Reduced motion:** Respeta configuración del usuario

## Responsive Design

Grid system adaptativo con breakpoints:

- **Mobile:** 1 columna
- **Tablet (640px+):** 2 columnas
- **Desktop (1024px+):** 4 columnas
- **XL (1440px+):** 6 columnas

## Testing & Validation

### Demo Component
**Archivo:** `analytics-demo.tsx`

Demostración interactiva de todos los componentes funcionando juntos.

### Integration Test
**Archivo:** `analytics-integration-test.tsx`

Suite de tests que valida:
- ✅ Rendering correcto de todos los componentes
- ✅ Estados de loading funcionales
- ✅ Interactividad (sorting, filtering, etc.)
- ✅ Responsive design
- ✅ Accessibility compliance
- ✅ Design tokens aplicados correctamente

## Performance

### Optimizaciones implementadas:
- ✅ `forwardRef` para componentes que necesitan referencias
- ✅ `useMemo` en DataTable para filtros y sorting
- ✅ `React.memo` implícito en componentes funcionales
- ✅ Lazy loading de estados pesados
- ✅ CSS-in-JS optimizado con `class-variance-authority`

## Usage Examples

### Dashboard KPI Row
```tsx
<div className="analytics-grid-responsive">
  <KPICard
    title="Total Properties"
    value={properties.length}
    format="number"
    trend={{ value: 12.5, period: "this month", direction: "positive" }}
    icon={Home}
  />
  <KPICard
    title="Revenue"
    value={totalRevenue}
    format="currency"
    trend={{ value: -2.1, period: "vs last month", direction: "negative" }}
    icon={TrendingUp}
    color="secondary"
  />
</div>
```

### Chart Section
```tsx
<ChartContainer
  title="Property Views Over Time"
  subtitle="Last 30 days"
  size="lg"
  actions={<Button variant="outline">Export</Button>}
>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={viewsData}>
      <Line dataKey="views" stroke="var(--chart-primary)" />
    </LineChart>
  </ResponsiveContainer>
</ChartContainer>
```

### Properties Table
```tsx
<DataTable
  data={properties}
  columns={propertyColumns}
  sorting
  filtering
  pagination
  pageSize={20}
  searchPlaceholder="Search properties..."
  emptyMessage="No properties found"
/>
```

## Next Steps

Estos componentes base están listos para:

1. **T1.4: Layout System** - Creación de layouts complejos
2. **T1.5: Advanced Features** - Funcionalidades avanzadas
3. **Integration** - Conexión con APIs reales
4. **Chart Libraries** - Integración con Recharts, Chart.js, etc.

## Files Created

```
components/ui/
├── kpi-card.tsx                    # KPI cards con trends
├── chart-container.tsx             # Wrapper para gráficos
├── trend-indicator.tsx             # Indicadores de tendencia
├── metrics-badge.tsx               # Badges de estado
├── data-table.tsx                  # Tabla con funcionalidad completa
├── loading-skeleton.tsx            # Estados de carga especializados
├── analytics.ts                    # Export barrel
├── analytics-demo.tsx              # Demo interactivo
├── analytics-integration-test.tsx  # Tests de integración
└── README.md                       # Esta documentación
```

---

**Status:** ✅ **COMPLETED** - Todos los componentes base implementados y validados

**Ready for:** T1.4 Layout System para Analytics Dashboard v4