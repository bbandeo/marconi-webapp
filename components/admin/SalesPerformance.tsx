'use client'

// =====================================================================================
// SALES PERFORMANCE DASHBOARD v4 - T3.2 MÓDULO SALES
// =====================================================================================
// Dashboard de rendimiento de ventas con pipeline, funnel, performance de agentes
// y rankings de propiedades. Sigue patrones de dashboard v4.
// =====================================================================================

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KPICard } from '@/components/ui/kpi-card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AnalyticsDashboardLayout,
  WidgetGrid,
  buildAnalyticsBreadcrumbs
} from '@/components/layouts'
import {
  TrendingUp,
  Users,
  Building,
  Target,
  DollarSign,
  Clock,
  RefreshCw,
  ChevronRight,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { useAnalyticsDashboard } from '@/hooks/useAnalyticsDashboard'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'

// =====================================================================================
// TYPES & INTERFACES
// =====================================================================================

interface SalesKPIs {
  totalRevenue: {
    value: number
    change: number
    target: number
  }
  leadsConverted: {
    value: number
    change: number
    target: number
  }
  avgSaleValue: {
    value: number
    change: number
    benchmark: number
  }
  salesCycleTime: {
    value: number
    change: number
    target: number
  }
}

interface PipelineStage {
  id: string
  name: string
  count: number
  value: number
  conversionRate: number
  color: string
}

interface AgentPerformance {
  id: string
  name: string
  avatar: string
  salesCount: number
  revenue: number
  conversionRate: number
  avgSaleValue: number
  rank: number
  change: number
}

interface PropertyRanking {
  id: string
  title: string
  image: string
  leads: number
  sales: number
  conversionRate: number
  revenue: number
  trend: number
}

// =====================================================================================
// CONFIGURATION
// =====================================================================================

const DASHBOARD_CONFIG = {
  refreshInterval: 30000,
  autoRefresh: true,
  realTimeEnabled: true
}

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 días', days: 7 },
  { value: '30d', label: '30 días', days: 30 },
  { value: '90d', label: '90 días', days: 90 },
  { value: '1y', label: '1 año', days: 365 }
]

// =====================================================================================
// SALES PIPELINE COMPONENT
// =====================================================================================

interface SalesPipelineProps {
  data: PipelineStage[]
  loading: boolean
}

function SalesPipeline({ data, loading }: SalesPipelineProps) {
  const mockPipelineData: PipelineStage[] = [
    {
      id: 'prospects',
      name: 'Prospectos',
      count: 145,
      value: 2500000,
      conversionRate: 45,
      color: '#8B5CF6'
    },
    {
      id: 'qualified',
      name: 'Calificados',
      count: 89,
      value: 1850000,
      conversionRate: 35,
      color: '#3B82F6'
    },
    {
      id: 'proposal',
      name: 'Propuesta',
      count: 45,
      value: 1200000,
      conversionRate: 25,
      color: '#F59E0B'
    },
    {
      id: 'negotiation',
      name: 'Negociación',
      count: 23,
      value: 780000,
      conversionRate: 65,
      color: '#10B981'
    },
    {
      id: 'closed',
      name: 'Cerrado',
      count: 15,
      value: 510000,
      conversionRate: 100,
      color: '#F37321'
    }
  ]

  const pipelineData = data?.length > 0 ? data : mockPipelineData

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chart-primary mx-auto mb-2"></div>
          <p className="text-subtle-gray text-sm">Cargando pipeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {pipelineData.map((stage, index) => (
          <div key={stage.id} className="relative">
            <Card className="widget-container border-l-4" style={{ borderLeftColor: stage.color }}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-bone-white text-sm">{stage.name}</h3>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ color: stage.color, borderColor: `${stage.color}30` }}
                    >
                      {stage.conversionRate}%
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="text-kpi-number text-bone-white">{stage.count}</div>
                    <div className="text-xs text-subtle-gray">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                        minimumFractionDigits: 0
                      }).format(stage.value)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Arrow between stages */}
            {index < pipelineData.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                <ChevronRight className="w-4 h-4 text-subtle-gray" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border-subtle">
        <div className="text-center p-3 rounded-lg bg-surface-darker/30">
          <div className="text-kpi-number-small text-chart-success">
            {pipelineData.reduce((sum, stage) => sum + stage.count, 0)}
          </div>
          <div className="text-xs text-subtle-gray">Total Leads</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-surface-darker/30">
          <div className="text-kpi-number-small text-chart-primary">
            {new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS',
              minimumFractionDigits: 0
            }).format(pipelineData.reduce((sum, stage) => sum + stage.value, 0))}
          </div>
          <div className="text-xs text-subtle-gray">Valor Total Pipeline</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-surface-darker/30">
          <div className="text-kpi-number-small text-chart-tertiary">
            {Math.round(
              pipelineData.reduce((sum, stage) => sum + stage.conversionRate, 0) / pipelineData.length
            )}%
          </div>
          <div className="text-xs text-subtle-gray">Conversión Promedio</div>
        </div>
      </div>
    </div>
  )
}

// =====================================================================================
// CONVERSION FUNNEL COMPONENT
// =====================================================================================

function ConversionFunnel() {
  const funnelData = [
    { stage: 'Visitantes Web', count: 2500, percentage: 100 },
    { stage: 'Leads Generados', count: 450, percentage: 18 },
    { stage: 'Leads Calificados', count: 180, percentage: 40 },
    { stage: 'Propuestas Enviadas', count: 85, percentage: 47 },
    { stage: 'Ventas Cerradas', count: 25, percentage: 29 }
  ]

  return (
    <div className="space-y-4">
      {funnelData.map((item, index) => (
        <div key={item.stage} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-data-label">{item.stage}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-bone-white">{item.count.toLocaleString()}</span>
              <Badge variant="outline" className="text-xs">
                {item.percentage}%
              </Badge>
            </div>
          </div>
          <div className="relative">
            <div className="w-full bg-surface-darker rounded-full h-6">
              <div
                className="bg-gradient-to-r from-chart-primary to-chart-secondary h-6 rounded-full transition-all duration-300"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
              {item.count.toLocaleString()} ({item.percentage}%)
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================

export default function SalesPerformance() {
  // State management
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Date range calculation
  const currentPeriod = PERIOD_OPTIONS.find(p => p.value === selectedPeriod) || PERIOD_OPTIONS[1]
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - currentPeriod.days * 24 * 60 * 60 * 1000)

  // Hooks for data fetching
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useAnalyticsDashboard({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    compact: false
  })

  // Real-time updates
  const {
    isConnected: realtimeConnected,
    isWebSocket
  } = useRealTimeUpdates({
    enabled: DASHBOARD_CONFIG.realTimeEnabled,
    interval: DASHBOARD_CONFIG.refreshInterval,
    enableWebSocket: true,
    enableNotifications: false
  })

  // Mock sales KPIs
  const salesKPIs: SalesKPIs = {
    totalRevenue: {
      value: 12500000,
      change: 15.3,
      target: 15000000
    },
    leadsConverted: {
      value: 25,
      change: 8.7,
      target: 30
    },
    avgSaleValue: {
      value: 500000,
      change: -2.1,
      benchmark: 520000
    },
    salesCycleTime: {
      value: 45,
      change: -12.5,
      target: 30
    }
  }

  // Mock agent performance data
  const agentsData: AgentPerformance[] = [
    {
      id: '1',
      name: 'María González',
      avatar: '/avatars/maria.jpg',
      salesCount: 8,
      revenue: 3200000,
      conversionRate: 32,
      avgSaleValue: 400000,
      rank: 1,
      change: 15.2
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      avatar: '/avatars/carlos.jpg',
      salesCount: 6,
      revenue: 2800000,
      conversionRate: 28,
      avgSaleValue: 466667,
      rank: 2,
      change: 8.7
    },
    {
      id: '3',
      name: 'Ana Silva',
      avatar: '/avatars/ana.jpg',
      salesCount: 5,
      revenue: 2200000,
      conversionRate: 25,
      avgSaleValue: 440000,
      rank: 3,
      change: -3.2
    }
  ]

  // Breadcrumbs
  const breadcrumbs = buildAnalyticsBreadcrumbs('sales', 'Sales Performance')

  // Header actions
  const headerActions = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-subtle-gray order-2 sm:order-1">
        <Clock className="w-4 h-4" />
        <span className="hidden sm:inline">Última actualización: {lastRefresh.toLocaleTimeString('es-AR')}</span>
        <span className="sm:hidden">{lastRefresh.toLocaleTimeString('es-AR', { timeStyle: 'short' })}</span>
        {realtimeConnected && (
          <Badge variant="outline" className="text-chart-success border-chart-success/30">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-chart-success rounded-full animate-pulse"></div>
              {isWebSocket ? 'WebSocket' : 'Polling'}
            </div>
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 order-1 sm:order-2">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-28 sm:w-32 filter-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="filter-panel">
            {PERIOD_OPTIONS.map(period => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => {
            refetchDashboard()
            setLastRefresh(new Date())
          }}
          variant="outline"
          size="sm"
          disabled={dashboardLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${dashboardLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>
      </div>
    </div>
  )

  return (
    <AnalyticsDashboardLayout
      title="Sales Performance"
      subtitle="Pipeline de ventas, conversiones y rendimiento de agentes"
      breadcrumbs={breadcrumbs}
      actions={headerActions}
      loading={dashboardLoading}
      className="space-y-dashboard"
    >
      {/* Sales KPI Cards Row */}
      <WidgetGrid
        desktop={{ cols: 4, gap: 'lg' }}
        tablet={{ cols: 2, gap: 'md' }}
        mobile={{ cols: 1, gap: 'sm' }}
      >
        {/* Total Revenue KPI */}
        <KPICard
          title="Ingresos de Ventas"
          value={salesKPIs.totalRevenue.value}
          format="currency"
          trend={{
            value: salesKPIs.totalRevenue.change,
            period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
            direction: salesKPIs.totalRevenue.change > 0 ? 'positive' : 'negative'
          }}
          icon={DollarSign}
          color="primary"
          size="lg"
          description={`Meta: ${new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
          }).format(salesKPIs.totalRevenue.target)} (${Math.round((salesKPIs.totalRevenue.value / salesKPIs.totalRevenue.target) * 100)}%)`}
        />

        {/* Leads Converted KPI */}
        <KPICard
          title="Ventas Cerradas"
          value={salesKPIs.leadsConverted.value}
          format="number"
          trend={{
            value: salesKPIs.leadsConverted.change,
            period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
            direction: salesKPIs.leadsConverted.change > 0 ? 'positive' : 'negative'
          }}
          icon={Target}
          color="secondary"
          size="lg"
          description={`Meta: ${salesKPIs.leadsConverted.target} (${Math.round((salesKPIs.leadsConverted.value / salesKPIs.leadsConverted.target) * 100)}% completado)`}
        />

        {/* Average Sale Value KPI */}
        <KPICard
          title="Valor Promedio de Venta"
          value={salesKPIs.avgSaleValue.value}
          format="currency"
          trend={{
            value: salesKPIs.avgSaleValue.change,
            period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
            direction: salesKPIs.avgSaleValue.change > 0 ? 'positive' : 'negative'
          }}
          icon={TrendingUp}
          color="tertiary"
          size="lg"
          description={`Benchmark: ${new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
          }).format(salesKPIs.avgSaleValue.benchmark)}`}
        />

        {/* Sales Cycle Time KPI */}
        <KPICard
          title="Tiempo de Ciclo de Venta"
          value={salesKPIs.salesCycleTime.value}
          format="number"
          trend={{
            value: salesKPIs.salesCycleTime.change,
            period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
            direction: salesKPIs.salesCycleTime.change < 0 ? 'positive' : 'negative' // Lower is better
          }}
          icon={Clock}
          color="quaternary"
          size="lg"
          description={`días promedio • Meta: ${salesKPIs.salesCycleTime.target} días`}
        />
      </WidgetGrid>

      {/* Main Analytics Row */}
      <WidgetGrid
        desktop={{ cols: 2, gap: 'lg' }}
        tablet={{ cols: 1, gap: 'md' }}
        mobile={{ cols: 1, gap: 'sm' }}
      >
        {/* Sales Pipeline */}
        <Card className="widget-container col-span-2">
          <CardHeader className="widget-header">
            <CardTitle className="widget-title flex items-center gap-2">
              <Layers className="w-5 h-5 text-chart-primary" />
              Pipeline de Ventas
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {currentPeriod.label}
            </Badge>
          </CardHeader>
          <CardContent className="widget-content">
            <SalesPipeline data={[]} loading={dashboardLoading} />
          </CardContent>
        </Card>
      </WidgetGrid>

      {/* Secondary Analytics Row */}
      <WidgetGrid
        desktop={{ cols: 3, gap: 'lg' }}
        tablet={{ cols: 2, gap: 'md' }}
        mobile={{ cols: 1, gap: 'sm' }}
      >
        {/* Conversion Funnel */}
        <Card className="widget-container">
          <CardHeader className="widget-header">
            <CardTitle className="widget-title flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-chart-secondary" />
              Funnel de Conversión
            </CardTitle>
          </CardHeader>
          <CardContent className="widget-content">
            <ConversionFunnel />
          </CardContent>
        </Card>

        {/* Agent Performance */}
        <Card className="widget-container">
          <CardHeader className="widget-header">
            <CardTitle className="widget-title flex items-center gap-2">
              <Users className="w-5 h-5 text-chart-tertiary" />
              Top Agentes
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {currentPeriod.label}
            </Badge>
          </CardHeader>
          <CardContent className="widget-content">
            <div className="space-y-4">
              {agentsData.map((agent, index) => (
                <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-darker/30 hover:bg-surface-darker/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <Badge className="w-6 h-6 flex items-center justify-center p-0 text-xs">
                      {agent.rank}
                    </Badge>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chart-primary to-chart-secondary flex items-center justify-center text-white font-medium text-sm">
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-white text-sm truncate">{agent.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-subtle-gray">
                        <span>{agent.salesCount} ventas</span>
                        <span>{agent.conversionRate}% conversión</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-bone-white">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                        minimumFractionDigits: 0
                      }).format(agent.revenue)}
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${
                      agent.change > 0 ? 'text-chart-success' : 'text-chart-error'
                    }`}>
                      {agent.change > 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {Math.abs(agent.change)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Property Rankings */}
        <Card className="widget-container">
          <CardHeader className="widget-header">
            <CardTitle className="widget-title flex items-center gap-2">
              <Building className="w-5 h-5 text-chart-quaternary" />
              Top Propiedades
            </CardTitle>
          </CardHeader>
          <CardContent className="widget-content">
            <div className="space-y-3">
              {dashboardData?.top_properties?.slice(0, 5).map((property, index) => (
                <div
                  key={property.property_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-darker/30 hover:bg-surface-darker/50 transition-colors"
                >
                  <Badge className="w-6 h-6 flex items-center justify-center p-0 text-xs">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm truncate">{property.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-subtle-gray">
                      <span>{property.metric_value} vistas</span>
                      <span>{property.leads || 0} leads</span>
                    </div>
                  </div>
                  <div className="text-xs text-chart-success">
                    +{Math.floor(Math.random() * 20 + 5)}%
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-subtle-gray">
                  <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay datos de propiedades disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </WidgetGrid>
    </AnalyticsDashboardLayout>
  )
}