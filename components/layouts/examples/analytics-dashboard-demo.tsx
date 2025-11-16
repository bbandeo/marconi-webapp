"use client"

import React from 'react'
import {
  AnalyticsDashboardLayout,
  ModuleContainer,
  WidgetGrid,
  SidebarNavigation,
  FilterBar,
  ResponsiveWrapper,
  buildAnalyticsBreadcrumbs,
  useAnalyticsLayout
} from '@/components/layouts'

// Import T1.3 components
import { KPICard } from '@/components/ui/kpi-card'
import { ChartContainer } from '@/components/ui/chart-container'
import { DataTable } from '@/components/ui/data-table'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { MetricsBadge } from '@/components/ui/metrics-badge'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'

// Import icons
import {
  BarChart3,
  TrendingUp,
  Users,
  Building,
  Target,
  Plus,
  Download,
  Filter,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Sample data
const kpiData = [
  {
    title: 'Ingresos Totales',
    value: 1250000,
    change: 12.5,
    trend: 'up' as const,
    format: 'currency'
  },
  {
    title: 'Propiedades Vendidas',
    value: 48,
    change: 8.2,
    trend: 'up' as const,
    format: 'number'
  },
  {
    title: 'Leads Generados',
    value: 324,
    change: -2.1,
    trend: 'down' as const,
    format: 'number'
  },
  {
    title: 'Tasa de Conversión',
    value: 14.8,
    change: 3.4,
    trend: 'up' as const,
    format: 'percentage'
  }
]

const navigationItems = [
  {
    id: 'overview',
    label: 'Overview Ejecutivo',
    icon: BarChart3,
    href: '/admin/analytics',
    active: true,
    badge: 4
  },
  {
    id: 'sales',
    label: 'Sales Performance',
    icon: TrendingUp,
    href: '/admin/analytics/sales',
    children: [
      { id: 'pipeline', label: 'Pipeline', icon: TrendingUp, href: '/admin/analytics/sales/pipeline' },
      { id: 'funnel', label: 'Funnel', icon: TrendingUp, href: '/admin/analytics/sales/funnel' }
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing & Leads',
    icon: Target,
    href: '/admin/analytics/marketing',
    badge: 12
  },
  {
    id: 'properties',
    label: 'Property Analytics',
    icon: Building,
    href: '/admin/analytics/properties'
  },
  {
    id: 'customers',
    label: 'Customer Insights',
    icon: Users,
    href: '/admin/analytics/customers'
  }
]

const quickFilters = [
  { id: 'featured', label: 'Destacadas', value: 'featured', active: true, count: 12 },
  { id: 'new', label: 'Nuevas', value: 'new', active: false, count: 8 },
  { id: 'urgent', label: 'Urgentes', value: 'urgent', active: false, count: 3 }
]

const customFilters = [
  {
    id: 'property_type',
    label: 'Tipo de Propiedad',
    type: 'select' as const,
    options: [
      { value: 'all', label: 'Todos los tipos' },
      { value: 'apartment', label: 'Departamento' },
      { value: 'house', label: 'Casa' },
      { value: 'commercial', label: 'Comercial' }
    ]
  },
  {
    id: 'agent',
    label: 'Agente',
    type: 'select' as const,
    options: [
      { value: 'all', label: 'Todos los agentes' },
      { value: 'agent1', label: 'María García' },
      { value: 'agent2', label: 'Juan López' }
    ]
  }
]

const tableData = [
  {
    property: 'Casa Moderna en Polanco',
    type: 'Casa',
    price: '$2,500,000',
    agent: 'María García',
    views: 145,
    leads: 8,
    status: 'Activa'
  },
  {
    property: 'Depto en Santa Fe',
    type: 'Departamento',
    price: '$1,200,000',
    agent: 'Juan López',
    views: 89,
    leads: 12,
    status: 'Vendida'
  },
  {
    property: 'Oficina Corporativa',
    type: 'Comercial',
    price: '$3,800,000',
    agent: 'Ana Rodríguez',
    views: 67,
    leads: 5,
    status: 'Activa'
  }
]

const tableColumns = [
  { key: 'property', header: 'Propiedad' },
  { key: 'type', header: 'Tipo' },
  { key: 'price', header: 'Precio' },
  { key: 'agent', header: 'Agente' },
  { key: 'views', header: 'Vistas' },
  { key: 'leads', header: 'Leads' },
  { key: 'status', header: 'Estado' }
]

export function AnalyticsDashboardDemo() {
  const layout = useAnalyticsLayout({
    quickFilters,
    customFilters
  })

  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
      <Button size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Reporte
      </Button>
    </div>
  )

  const filters = (
    <FilterBar
      dateRange={layout.dateRange}
      onDateRangeChange={layout.setDateRange}
      quickFilters={layout.quickFilters}
      onQuickFilterToggle={layout.toggleQuickFilter}
      customFilters={layout.customFilters}
      onCustomFilterChange={layout.setCustomFilter}
      onReset={layout.resetFilters}
    />
  )

  const sidebar = (
    <SidebarNavigation
      items={navigationItems}
      collapsed={layout.sidebarCollapsed}
      onToggle={layout.toggleSidebar}
    />
  )

  const renderDesktopLayout = () => (
    <div className="flex gap-6">
      <div className="w-80 flex-shrink-0">
        {sidebar}
      </div>
      <div className="flex-1 min-w-0">
        <AnalyticsDashboardLayout
          title="Analytics Dashboard"
          subtitle="Vista general de rendimiento inmobiliario"
          actions={actions}
          filters={filters}
          breadcrumbs={buildAnalyticsBreadcrumbs('overview')}
        >
          {/* KPI Grid */}
          <ModuleContainer
            module="overview"
            title="Métricas Principales"
            subtitle="Indicadores clave de rendimiento"
            icon={BarChart3}
            className="mb-8"
          >
            <WidgetGrid columns="auto" gap="md" className="mb-6">
              {kpiData.map((kpi, index) => (
                <KPICard
                  key={index}
                  title={kpi.title}
                  value={kpi.value}
                  change={kpi.change}
                  trend={kpi.trend}
                  format={kpi.format}
                />
              ))}
            </WidgetGrid>
          </ModuleContainer>

          {/* Charts Grid */}
          <ModuleContainer
            module="overview"
            title="Análisis Visual"
            subtitle="Gráficos y tendencias"
            icon={TrendingUp}
            className="mb-8"
          >
            <WidgetGrid columns={2} gap="lg">
              <ChartContainer
                title="Ventas por Mes"
                subtitle="Evolución mensual de ventas"
                className="h-96"
              >
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Gráfico de ventas aquí
                </div>
              </ChartContainer>

              <ChartContainer
                title="Leads por Fuente"
                subtitle="Distribución de canales de generación"
                className="h-96"
              >
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Gráfico de leads aquí
                </div>
              </ChartContainer>
            </WidgetGrid>
          </ModuleContainer>

          {/* Data Table */}
          <ModuleContainer
            module="properties"
            title="Propiedades Destacadas"
            subtitle="Rendimiento de propiedades principales"
            icon={Building}
            headerActions={
              <div className="flex items-center gap-2">
                <MetricsBadge
                  label="Total"
                  value={tableData.length}
                  variant="default"
                />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            }
          >
            <DataTable
              data={tableData}
              columns={tableColumns}
              pagination={{ enabled: true, pageSize: 10 }}
              sorting={{ enabled: true }}
              search={{ enabled: true, placeholder: 'Buscar propiedades...' }}
            />
          </ModuleContainer>
        </AnalyticsDashboardLayout>
      </div>
    </div>
  )

  const renderMobileLayout = () => (
    <AnalyticsDashboardLayout
      title="Analytics"
      subtitle="Dashboard móvil"
      actions={
        <Button size="sm" variant="outline">
          <Calendar className="h-4 w-4" />
        </Button>
      }
    >
      {/* Mobile KPI Grid */}
      <WidgetGrid columns={1} gap="sm" className="mb-6">
        {kpiData.slice(0, 2).map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            format={kpi.format}
            compact
          />
        ))}
      </WidgetGrid>

      {/* Mobile Chart */}
      <ChartContainer
        title="Resumen Ventas"
        subtitle="Vista rápida"
        className="h-64 mb-6"
      >
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Gráfico móvil
        </div>
      </ChartContainer>

      {/* Mobile Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Propiedades Activas</h3>
        {tableData.slice(0, 3).map((item, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="font-medium">{item.property}</div>
            <div className="text-sm text-muted-foreground">
              {item.type} • {item.price}
            </div>
            <div className="flex items-center justify-between mt-2">
              <TrendIndicator
                value={item.views}
                label="vistas"
                trend="up"
              />
              <MetricsBadge
                label="Leads"
                value={item.leads}
                variant="success"
              />
            </div>
          </div>
        ))}
      </div>
    </AnalyticsDashboardLayout>
  )

  return (
    <ResponsiveWrapper
      desktop={renderDesktopLayout()}
      mobile={renderMobileLayout()}
      className="analytics-dashboard-demo"
    />
  )
}

export default AnalyticsDashboardDemo