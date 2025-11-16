"use client"

import React from 'react'
import {
  AnalyticsDashboardLayout,
  ModuleContainer,
  WidgetGrid,
  ContentGrid,
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
import { Target, Users, Mail, Globe, TrendingUp, Eye, MousePointer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Marketing-specific data
const marketingKPIs = [
  {
    title: 'Leads Generados',
    value: 847,
    change: 23.4,
    trend: 'up' as const,
    format: 'number' as const
  },
  {
    title: 'Costo por Lead',
    value: 125,
    change: -12.8,
    trend: 'down' as const,
    format: 'currency' as const
  },
  {
    title: 'Tasa de Conversión',
    value: 18.7,
    change: 5.1,
    trend: 'up' as const,
    format: 'percentage' as const
  },
  {
    title: 'ROI Campaigns',
    value: 340,
    change: 45.2,
    trend: 'up' as const,
    format: 'percentage' as const
  }
]

const channelData = [
  {
    channel: 'Google Ads',
    leads: 324,
    cost: 15420,
    cpl: 47.6,
    conversion: 24.1,
    roi: 380
  },
  {
    channel: 'Facebook Ads',
    leads: 189,
    cost: 8950,
    cpl: 47.4,
    conversion: 16.8,
    roi: 285
  },
  {
    channel: 'Instagram Ads',
    leads: 156,
    cost: 7340,
    cpl: 47.1,
    conversion: 21.2,
    roi: 315
  },
  {
    channel: 'LinkedIn Ads',
    leads: 98,
    cost: 6280,
    cpl: 64.1,
    conversion: 31.6,
    roi: 425
  },
  {
    channel: 'Organic Search',
    leads: 80,
    cost: 0,
    cpl: 0,
    conversion: 35.0,
    roi: 0
  }
]

const campaignData = [
  {
    campaign: 'Primavera 2024 - Casas Premium',
    status: 'active',
    budget: 25000,
    spent: 18750,
    leads: 185,
    conversion: 22.7,
    performance: 'excellent'
  },
  {
    campaign: 'Departamentos Céntricos',
    status: 'active',
    budget: 15000,
    spent: 12300,
    leads: 127,
    conversion: 18.9,
    performance: 'good'
  },
  {
    campaign: 'Inversores Comerciales',
    status: 'paused',
    budget: 30000,
    spent: 8500,
    leads: 43,
    conversion: 35.4,
    performance: 'excellent'
  }
]

const channelColumns = [
  { key: 'channel', header: 'Canal' },
  { key: 'leads', header: 'Leads' },
  { key: 'cost', header: 'Inversión', format: 'currency' },
  { key: 'cpl', header: 'CPL', format: 'currency' },
  { key: 'conversion', header: 'Conversión (%)', format: 'percentage' },
  { key: 'roi', header: 'ROI (%)', format: 'percentage' }
]

const campaignColumns = [
  { key: 'campaign', header: 'Campaña' },
  { key: 'status', header: 'Estado' },
  { key: 'budget', header: 'Presupuesto', format: 'currency' },
  { key: 'spent', header: 'Gastado', format: 'currency' },
  { key: 'leads', header: 'Leads' },
  { key: 'conversion', header: 'Conversión (%)', format: 'percentage' },
  { key: 'performance', header: 'Performance' }
]

const leadSources = [
  { source: 'Google Ads', count: 324, percentage: 38.2 },
  { source: 'Facebook Ads', count: 189, percentage: 22.3 },
  { source: 'Instagram Ads', count: 156, percentage: 18.4 },
  { source: 'LinkedIn Ads', count: 98, percentage: 11.6 },
  { source: 'Organic Search', count: 80, percentage: 9.5 }
]

export function MarketingModuleDemo() {
  const layout = useAnalyticsLayout(
    {},
    {
      defaultGridColumns: LAYOUT_PRESETS.marketing.kpis.columns,
      defaultDensity: LAYOUT_PRESETS.marketing.kpis.density
    }
  )

  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <TrendingUp className="h-4 w-4 mr-2" />
        Optimizar
      </Button>
      <Button size="sm">
        <Target className="h-4 w-4 mr-2" />
        Nueva Campaña
      </Button>
    </div>
  )

  const sidebar = (
    <div className="space-y-6">
      {/* Lead Sources Widget */}
      <div className="p-4 bg-card rounded-lg border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Fuentes de Leads
        </h3>
        <div className="space-y-3">
          {leadSources.map((source, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-primary" />
                <span className="text-sm">{source.source}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{source.count}</div>
                <div className="text-xs text-muted-foreground">
                  {source.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-card rounded-lg border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MousePointer className="h-4 w-4" />
          Acciones Rápidas
        </h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Mail className="h-4 w-4 mr-2" />
            Email Campaign
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Globe className="h-4 w-4 mr-2" />
            Landing Page
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Users className="h-4 w-4 mr-2" />
            Segmentar Leads
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <AnalyticsDashboardLayout
      title="Marketing & Leads"
      subtitle="Análisis de campañas y generación de leads"
      actions={actions}
      breadcrumbs={buildAnalyticsBreadcrumbs('marketing')}
    >
      {/* Marketing KPIs */}
      <ModuleContainer
        module="marketing"
        title="Métricas de Marketing"
        subtitle="Indicadores clave de campañas y leads"
        icon={Target}
        className="mb-8"
      >
        <WidgetGrid
          columns="auto"
          gap="lg"
          density={layout.density}
        >
          {marketingKPIs.map((kpi, index) => (
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

      {/* Main Content with Sidebar */}
      <ContentGrid
        sidebar={sidebar}
        sidebarPosition="right"
        sidebarSize="1/3"
      >
        {/* Charts Section */}
        <ModuleContainer
          module="marketing"
          title="Análisis de Canales"
          subtitle="Performance por canal de marketing"
          icon={Globe}
          className="mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartContainer
              title="Leads por Canal"
              subtitle="Distribución de generación de leads"
              className="h-80"
            >
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Gráfico de dona - canales
              </div>
            </ChartContainer>

            <ChartContainer
              title="ROI por Canal"
              subtitle="Retorno de inversión comparativo"
              className="h-80"
            >
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Gráfico de barras - ROI
              </div>
            </ChartContainer>
          </div>

          <DataTable
            data={channelData}
            columns={channelColumns}
            pagination={{ enabled: true, pageSize: 10 }}
            sorting={{ enabled: true }}
          />
        </ModuleContainer>

        {/* Campaign Performance */}
        <ModuleContainer
          module="marketing"
          title="Performance de Campañas"
          subtitle="Análisis detallado de campañas activas"
          icon={TrendingUp}
          headerActions={
            <div className="flex items-center gap-2">
              <MetricsBadge
                label="Activas"
                value={campaignData.filter(c => c.status === 'active').length}
                variant="success"
              />
              <MetricsBadge
                label="Pausadas"
                value={campaignData.filter(c => c.status === 'paused').length}
                variant="warning"
              />
            </div>
          }
        >
          <DataTable
            data={campaignData}
            columns={campaignColumns}
            renderCell={(value, row, column) => {
              if (column.key === 'status') {
                return (
                  <Badge
                    variant={value === 'active' ? 'default' : 'secondary'}
                  >
                    {value === 'active' ? 'Activa' : 'Pausada'}
                  </Badge>
                )
              }
              if (column.key === 'performance') {
                return (
                  <Badge
                    variant={
                      value === 'excellent' ? 'success' :
                      value === 'good' ? 'default' : 'warning'
                    }
                  >
                    {value === 'excellent' ? 'Excelente' :
                     value === 'good' ? 'Buena' : 'Regular'}
                  </Badge>
                )
              }
              return value
            }}
          />
        </ModuleContainer>

        {/* Lead Funnel Analysis */}
        <ModuleContainer
          module="marketing"
          title="Embudo de Conversión"
          subtitle="Análisis del journey de leads a clientes"
          icon={Users}
          variant="elevated"
          className="mb-8"
        >
          <div className="space-y-6">
            {/* Funnel Stages */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { stage: 'Visitantes', count: 12500, color: 'bg-blue-500' },
                { stage: 'Leads', count: 847, color: 'bg-green-500' },
                { stage: 'Calificados', count: 456, color: 'bg-yellow-500' },
                { stage: 'Oportunidades', count: 189, color: 'bg-orange-500' },
                { stage: 'Clientes', count: 78, color: 'bg-red-500' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className={`${item.color} h-20 rounded-lg mb-2 flex items-center justify-center text-white font-bold text-lg`}>
                    {item.count.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium">{item.stage}</div>
                  <div className="text-xs text-muted-foreground">
                    {index > 0 ? `${((item.count / 12500) * 100).toFixed(1)}%` : '100%'}
                  </div>
                </div>
              ))}
            </div>

            {/* Conversion Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-400">
                    Mejor Conversión
                  </span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-300">
                  LinkedIn Ads tiene la mayor tasa de conversión (31.6%) pero menor volumen.
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-700 dark:text-blue-400">
                    Oportunidad
                  </span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Incrementar presupuesto en canales con mejor ROI para maximizar resultados.
                </p>
              </div>
            </div>
          </div>
        </ModuleContainer>
      </ContentGrid>
    </AnalyticsDashboardLayout>
  )
}

export default MarketingModuleDemo