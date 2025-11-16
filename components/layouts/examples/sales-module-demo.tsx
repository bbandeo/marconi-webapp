"use client"

import React from 'react'
import {
  AnalyticsDashboardLayout,
  ModuleContainer,
  WidgetGrid,
  ChartGrid,
  buildAnalyticsBreadcrumbs,
  useAnalyticsLayout,
  LAYOUT_PRESETS
} from '@/components/layouts'

// Import T1.3 components
import { KPICard } from '@/components/ui/kpi-card'
import { ChartContainer } from '@/components/ui/chart-container'
import { DataTable } from '@/components/ui/data-table'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { MetricsBadge } from '@/components/ui/metrics-badge'

// Icons
import { TrendingUp, Target, Users, DollarSign, Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Sales-specific data
const salesKPIs = [
  {
    title: 'Pipeline Total',
    value: 4250000,
    change: 18.5,
    trend: 'up' as const,
    format: 'currency' as const
  },
  {
    title: 'Deals Cerrados',
    value: 23,
    change: 12.1,
    trend: 'up' as const,
    format: 'number' as const
  },
  {
    title: 'Tasa de Cierre',
    value: 24.5,
    change: 5.2,
    trend: 'up' as const,
    format: 'percentage' as const
  },
  {
    title: 'Tiempo Prom. Cierre',
    value: 45,
    change: -8.3,
    trend: 'down' as const,
    format: 'number' as const,
    unit: 'días'
  }
]

const pipelineData = [
  {
    stage: 'Prospecto',
    count: 45,
    value: 1250000,
    conversion: 85
  },
  {
    stage: 'Calificado',
    count: 38,
    value: 1050000,
    conversion: 72
  },
  {
    stage: 'Propuesta',
    count: 27,
    value: 890000,
    conversion: 58
  },
  {
    stage: 'Negociación',
    count: 16,
    value: 620000,
    conversion: 35
  },
  {
    stage: 'Cerrado',
    count: 9,
    value: 380000,
    conversion: 100
  }
]

const agentPerformance = [
  {
    agent: 'María García',
    deals: 8,
    revenue: 980000,
    conversion: 28.5,
    avgDays: 38
  },
  {
    agent: 'Juan López',
    deals: 6,
    revenue: 750000,
    conversion: 22.1,
    avgDays: 42
  },
  {
    agent: 'Ana Rodríguez',
    deals: 5,
    revenue: 680000,
    conversion: 31.2,
    avgDays: 35
  },
  {
    agent: 'Carlos Mendoza',
    deals: 4,
    revenue: 520000,
    conversion: 18.9,
    avgDays: 52
  }
]

const pipelineColumns = [
  { key: 'stage', header: 'Etapa' },
  { key: 'count', header: 'Cantidad' },
  { key: 'value', header: 'Valor', format: 'currency' },
  { key: 'conversion', header: 'Conversión (%)', format: 'percentage' }
]

const agentColumns = [
  { key: 'agent', header: 'Agente' },
  { key: 'deals', header: 'Deals' },
  { key: 'revenue', header: 'Ingresos', format: 'currency' },
  { key: 'conversion', header: 'Conversión (%)', format: 'percentage' },
  { key: 'avgDays', header: 'Días Prom.' }
]

export function SalesModuleDemo() {
  const layout = useAnalyticsLayout(
    {},
    {
      defaultGridColumns: LAYOUT_PRESETS.sales.kpis.columns,
      defaultDensity: LAYOUT_PRESETS.sales.kpis.density
    }
  )

  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Calendar className="h-4 w-4 mr-2" />
        Este Mes
      </Button>
      <Button size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filtros
      </Button>
    </div>
  )

  return (
    <AnalyticsDashboardLayout
      title="Sales Performance"
      subtitle="Análisis detallado del rendimiento de ventas"
      actions={actions}
      breadcrumbs={buildAnalyticsBreadcrumbs('sales')}
    >
      {/* Sales KPIs */}
      <ModuleContainer
        module="sales"
        title="Métricas de Ventas"
        subtitle="Indicadores clave del pipeline y rendimiento"
        icon={TrendingUp}
        className="mb-8"
      >
        <WidgetGrid
          columns={4}
          gap="md"
          density={layout.density}
        >
          {salesKPIs.map((kpi, index) => (
            <KPICard
              key={index}
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              trend={kpi.trend}
              format={kpi.format}
              unit={kpi.unit}
            />
          ))}
        </WidgetGrid>
      </ModuleContainer>

      {/* Charts Section */}
      <ModuleContainer
        module="sales"
        title="Análisis Visual"
        subtitle="Gráficos de tendencias y distribución"
        icon={Target}
        className="mb-8"
      >
        <ChartGrid layout="focus" className="mb-6">
          <ChartContainer
            title="Pipeline por Valor"
            subtitle="Distribución de oportunidades por etapa"
            className="h-80"
          >
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Gráfico de embudo de ventas
            </div>
          </ChartContainer>

          <ChartContainer
            title="Conversión por Etapa"
            subtitle="Tasa de conversión en cada fase"
            className="h-80"
          >
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Gráfico de conversión
            </div>
          </ChartContainer>

          <ChartContainer
            title="Tendencia Mensual"
            subtitle="Evolución de ventas en el tiempo"
            className="h-80"
          >
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Gráfico de línea temporal
            </div>
          </ChartContainer>
        </ChartGrid>
      </ModuleContainer>

      {/* Pipeline Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <ModuleContainer
          module="sales"
          title="Pipeline Detallado"
          subtitle="Análisis por etapa de venta"
          icon={TrendingUp}
          headerActions={
            <MetricsBadge
              label="Total Pipeline"
              value="$4.25M"
              variant="default"
            />
          }
        >
          <DataTable
            data={pipelineData}
            columns={pipelineColumns}
            compact
            hideSearch
            hidePagination
          />
        </ModuleContainer>

        <ModuleContainer
          module="sales"
          title="Rendimiento por Agente"
          subtitle="Comparativa de performance individual"
          icon={Users}
          headerActions={
            <div className="flex items-center gap-2">
              <TrendIndicator
                value={23}
                label="deals este mes"
                trend="up"
              />
            </div>
          }
        >
          <DataTable
            data={agentPerformance}
            columns={agentColumns}
            compact
            hideSearch
            hidePagination
          />
        </ModuleContainer>
      </div>

      {/* Performance Insights */}
      <ModuleContainer
        module="sales"
        title="Insights y Recomendaciones"
        subtitle="Análisis automático del rendimiento"
        icon={DollarSign}
        variant="elevated"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-700 dark:text-green-400">
                Oportunidad
              </span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-300">
              La tasa de conversión en la etapa de negociación ha mejorado un 15% este mes.
            </p>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-700 dark:text-yellow-400">
                Atención
              </span>
            </div>
            <p className="text-sm text-yellow-600 dark:text-yellow-300">
              El tiempo promedio de cierre se ha incrementado en la etapa de propuesta.
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-700 dark:text-blue-400">
                Recomendación
              </span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Considerar capacitación adicional para optimizar el proceso de propuestas.
            </p>
          </div>
        </div>
      </ModuleContainer>
    </AnalyticsDashboardLayout>
  )
}

export default SalesModuleDemo