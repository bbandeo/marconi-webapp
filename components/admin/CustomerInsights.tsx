'use client'

// =====================================================================================
// CUSTOMER INSIGHTS DASHBOARD v4 - T3.5 MÓDULO CUSTOMER INSIGHTS
// =====================================================================================
// Dashboard de análisis de clientes - segmentación, lifetime value, customer journey
// y analytics de retención para optimización de relaciones comerciales.
// =====================================================================================

import React, { useState } from 'react'
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
  TrendingDown,
  Users,
  UserCheck,
  Heart,
  DollarSign,
  Clock,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  Star,
  Crown,
  User,
  UserPlus,
  Repeat,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Activity,
  Award
} from 'lucide-react'
import { useAnalyticsDashboard } from '@/hooks/useAnalyticsDashboard'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'

// =====================================================================================
// TYPES & INTERFACES ESPECÍFICOS PARA CUSTOMER INSIGHTS
// =====================================================================================

interface CustomerKPIs {
  totalCustomers: {
    value: number
    newThisMonth: number
    returningCustomers: number
    churnRate: number
  }
  avgLifetimeValue: {
    value: number
    change: number
    highValueCustomers: number
  }
  customerSatisfaction: {
    value: number // percentage
    change: number
    npsScore: number
  }
  retentionRate: {
    value: number // percentage
    change: number
    benchmark: number
  }
}

interface CustomerSegment {
  id: string
  name: string
  description: string
  customerCount: number
  percentage: number
  avgValue: number
  avgTransactions: number
  retentionRate: number
  growthRate: number
  color: string
  priority: 'high' | 'medium' | 'low'
  characteristics: string[]
}

interface CustomerJourney {
  stage: string
  customers: number
  conversionRate: number
  avgTimeInStage: number // days
  dropOffRate: number
  topActions: string[]
  nextStageConversion: number
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
// CUSTOMER SEGMENTATION COMPONENT
// =====================================================================================

interface CustomerSegmentationProps {
  period: string
  loading: boolean
}

function CustomerSegmentationWidget({ period, loading }: CustomerSegmentationProps) {
  // Mock data de customer segments - En el futuro vendrá de CRM/analytics API
  const segmentsData: CustomerSegment[] = [
    {
      id: 'vip-investors',
      name: 'VIP Investors',
      description: 'Inversionistas de alto valor con múltiples propiedades',
      customerCount: 28,
      percentage: 12.4,
      avgValue: 850000,
      avgTransactions: 3.2,
      retentionRate: 92.0,
      growthRate: 15.8,
      color: '#FFD700',
      priority: 'high',
      characteristics: ['Alto valor', 'Múltiples compras', 'Referidos frecuentes']
    },
    {
      id: 'first-time-buyers',
      name: 'First-Time Buyers',
      description: 'Compradores primerizos, principalmente familias jóvenes',
      customerCount: 89,
      percentage: 39.2,
      avgValue: 420000,
      avgTransactions: 1.1,
      retentionRate: 68.5,
      growthRate: 22.3,
      color: '#4CAF50',
      priority: 'high',
      characteristics: ['Primera compra', 'Familias jóvenes', 'Necesitan asesoría']
    },
    {
      id: 'upgraders',
      name: 'Property Upgraders',
      description: 'Clientes que buscan mejorar su vivienda actual',
      customerCount: 65,
      percentage: 28.6,
      avgValue: 580000,
      avgTransactions: 1.8,
      retentionRate: 75.2,
      growthRate: 8.7,
      color: '#2196F3',
      priority: 'medium',
      characteristics: ['Cambio de vivienda', 'Mayor poder adquisitivo', 'Experiencia previa']
    },
    {
      id: 'downsizers',
      name: 'Downsizers',
      description: 'Clientes maduros que buscan reducir el tamaño de su vivienda',
      customerCount: 32,
      percentage: 14.1,
      avgValue: 380000,
      avgTransactions: 1.3,
      retentionRate: 82.0,
      growthRate: -3.2,
      color: '#FF9800',
      priority: 'medium',
      characteristics: ['Adultos mayores', 'Simplificación', 'Ubicación estratégica']
    },
    {
      id: 'investors',
      name: 'Small Investors',
      description: 'Pequeños inversionistas con 1-2 propiedades de inversión',
      customerCount: 13,
      percentage: 5.7,
      avgValue: 320000,
      avgTransactions: 1.5,
      retentionRate: 71.8,
      growthRate: 12.1,
      color: '#9C27B0',
      priority: 'low',
      characteristics: ['Inversión secundaria', 'ROI orientados', 'Potencial crecimiento']
    }
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-darker/30">
              <div className="w-4 h-4 bg-surface-darker rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-darker rounded w-32"></div>
                <div className="h-3 bg-surface-darker rounded w-48"></div>
              </div>
              <div className="w-16 h-4 bg-surface-darker rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-chart-error'
      case 'medium': return 'text-chart-warning'
      case 'low': return 'text-chart-info'
      default: return 'text-subtle-gray'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta'
      case 'medium': return 'Media'
      case 'low': return 'Baja'
      default: return priority
    }
  }

  // Calcular totales
  const totalCustomers = segmentsData.reduce((sum, segment) => sum + segment.customerCount, 0)
  const avgValue = segmentsData.reduce((sum, segment) => sum + (segment.avgValue * segment.customerCount), 0) / totalCustomers
  const avgRetention = segmentsData.reduce((sum, segment) => sum + (segment.retentionRate * segment.customerCount), 0) / totalCustomers

  return (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-surface-darker/20 border border-border-subtle">
        <div className="text-center">
          <div className="text-kpi-number-small text-chart-primary">{totalCustomers}</div>
          <div className="text-xs text-subtle-gray">Total Clientes</div>
        </div>
        <div className="text-center">
          <div className="text-kpi-number-small text-chart-secondary">
            {new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0
            }).format(avgValue)}
          </div>
          <div className="text-xs text-subtle-gray">Valor Promedio</div>
        </div>
        <div className="text-center">
          <div className="text-kpi-number-small text-chart-success">{Math.round(avgRetention)}%</div>
          <div className="text-xs text-subtle-gray">Retención Promedio</div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="space-y-3">
        {segmentsData
          .sort((a, b) => b.avgValue - a.avgValue) // Ordenar por valor promedio descendente
          .map((segment) => (
            <div
              key={segment.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-surface-darker/30 hover:bg-surface-darker/50 transition-colors border border-border-subtle/50"
            >
              {/* Segment Indicator & Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: segment.color }}
                ></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white text-sm">{segment.name}</h4>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(segment.priority)}`}>
                      {getPriorityBadge(segment.priority)}
                    </Badge>
                    {segment.growthRate > 0 && (
                      <div className="flex items-center text-chart-success text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {segment.growthRate}%
                      </div>
                    )}
                    {segment.growthRate < 0 && (
                      <div className="flex items-center text-chart-error text-xs">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        {Math.abs(segment.growthRate)}%
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-subtle-gray mb-1">{segment.description}</div>
                  <div className="flex items-center gap-4 text-xs text-subtle-gray">
                    <span>{segment.customerCount} clientes ({segment.percentage}%)</span>
                    <span className="hidden sm:inline">{segment.avgTransactions} transacciones</span>
                    <span className="hidden md:inline">{segment.retentionRate}% retención</span>
                  </div>
                </div>
              </div>

              {/* Value Metrics */}
              <div className="text-right">
                <div className="text-sm font-semibold text-bone-white">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0
                  }).format(segment.avgValue)}
                </div>
                <div className="text-xs text-subtle-gray">Valor promedio</div>
              </div>
            </div>
          ))}
      </div>

      {/* Customer Insights */}
      <div className="mt-4 p-3 rounded-lg bg-chart-warning/10 border border-chart-warning/20">
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 text-chart-warning mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-chart-warning">Insight de Segmentación</div>
            <div className="text-subtle-gray text-xs mt-1">
              VIP Investors (12.4%) generan el mayor valor promedio ($850k). First-Time Buyers representan la oportunidad de crecimiento más grande (39.2%).
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =====================================================================================
// CUSTOMER JOURNEY COMPONENT
// =====================================================================================

interface CustomerJourneyProps {
  period: string
  loading: boolean
}

function CustomerJourneyWidget({ period, loading }: CustomerJourneyProps) {
  // Mock data del customer journey - En el futuro vendrá de CRM analytics
  const journeyData: CustomerJourney[] = [
    {
      stage: 'Awareness',
      customers: 1250,
      conversionRate: 100,
      avgTimeInStage: 3,
      dropOffRate: 18.5,
      topActions: ['Visita website', 'Búsqueda propiedades', 'Descargar brochure'],
      nextStageConversion: 81.5
    },
    {
      stage: 'Interest',
      customers: 1019,
      conversionRate: 81.5,
      avgTimeInStage: 7,
      dropOffRate: 22.8,
      topActions: ['Contactar agente', 'Agendar visita', 'Solicitar información'],
      nextStageConversion: 77.2
    },
    {
      stage: 'Consideration',
      customers: 787,
      conversionRate: 77.2,
      avgTimeInStage: 14,
      dropOffRate: 31.2,
      topActions: ['Visitar propiedades', 'Comparar opciones', 'Consultar financiación'],
      nextStageConversion: 68.8
    },
    {
      stage: 'Intent',
      customers: 541,
      conversionRate: 68.8,
      avgTimeInStage: 21,
      dropOffRate: 28.5,
      topActions: ['Negociar precio', 'Pre-aprobación', 'Inspección técnica'],
      nextStageConversion: 71.5
    },
    {
      stage: 'Purchase',
      customers: 387,
      conversionRate: 71.5,
      avgTimeInStage: 35,
      dropOffRate: 12.8,
      topActions: ['Firma contrato', 'Gestión legal', 'Entrega llaves'],
      nextStageConversion: 87.2
    },
    {
      stage: 'Retention',
      customers: 337,
      conversionRate: 87.2,
      avgTimeInStage: 365,
      dropOffRate: 8.3,
      topActions: ['Follow-up post venta', 'Servicios adicionales', 'Referidos'],
      nextStageConversion: 91.7
    }
  ]

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-darker/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface-darker rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-surface-darker rounded w-20"></div>
                  <div className="h-2 bg-surface-darker rounded w-16"></div>
                </div>
              </div>
              <div className="w-12 h-4 bg-surface-darker rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const getStageColor = (index: number) => {
    const colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#9C27B0', '#FF5722']
    return colors[index % colors.length]
  }

  return (
    <div className="space-y-4">
      {/* Journey Funnel */}
      <div className="space-y-2">
        {journeyData.map((stage, index) => (
          <div key={stage.stage} className="relative">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-darker/30 hover:bg-surface-darker/50 transition-colors border border-border-subtle/50">
              {/* Stage Indicator */}
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                  style={{ backgroundColor: getStageColor(index) }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white text-sm">{stage.stage}</h4>
                    <span className="text-xs text-subtle-gray">
                      {stage.avgTimeInStage} días promedio
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-subtle-gray">
                    <span>{stage.customers.toLocaleString()} clientes</span>
                    <span className="hidden sm:inline">{stage.dropOffRate}% abandono</span>
                    <span className="hidden md:inline">{stage.topActions[0]}</span>
                  </div>
                </div>
              </div>

              {/* Conversion Metrics */}
              <div className="text-right">
                <div className="text-sm font-semibold text-bone-white">
                  {stage.conversionRate}%
                </div>
                <div className="text-xs text-subtle-gray">conversión</div>
              </div>

              {/* Arrow to next stage */}
              {index < journeyData.length - 1 && (
                <div className="absolute -bottom-1 right-4">
                  <ArrowRight className="w-4 h-4 text-chart-info" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Journey Insights */}
      <div className="mt-4 p-3 rounded-lg bg-chart-info/10 border border-chart-info/20">
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 text-chart-info mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-chart-info">Insight de Customer Journey</div>
            <div className="text-subtle-gray text-xs mt-1">
              Mayor abandono en Consideration (31.2%). Optimizar comparación de propiedades y proceso de financiación.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================

export default function CustomerInsights() {
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

  // Mock customer KPIs - En el futuro estos vendrán de la API
  const customerKPIs: CustomerKPIs = {
    totalCustomers: {
      value: 227,
      newThisMonth: 18,
      returningCustomers: 34,
      churnRate: 3.2
    },
    avgLifetimeValue: {
      value: 485000,
      change: 15.8,
      highValueCustomers: 28
    },
    customerSatisfaction: {
      value: 87.5,
      change: 4.2,
      npsScore: 72
    },
    retentionRate: {
      value: 78.4,
      change: 6.8,
      benchmark: 65.0
    }
  }

  // Breadcrumbs
  const breadcrumbs = buildAnalyticsBreadcrumbs('customers', 'Customer Insights')

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
      title="Customer Insights"
      subtitle="Análisis profundo de clientes, segmentación y customer journey"
      breadcrumbs={breadcrumbs}
      actions={headerActions}
      loading={dashboardLoading}
      className="space-y-dashboard"
    >
      {/* Customer KPI Cards Row */}
      <WidgetGrid
        desktop={{ cols: 4, gap: 'lg' }}
        tablet={{ cols: 2, gap: 'md' }}
        mobile={{ cols: 1, gap: 'sm' }}
      >
        {/* Total Customers */}
        <KPICard
          title="Total Clientes"
          value={customerKPIs.totalCustomers.value}
          format="number"
          trend={{
            value: 8.5,
            period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
            direction: 'positive'
          }}
          icon={Users}
          color="primary"
          size="lg"
          description={`${customerKPIs.totalCustomers.newThisMonth} nuevos este mes`}
        />

        {/* Average Lifetime Value */}
        <KPICard
          title="Lifetime Value"
          value={customerKPIs.avgLifetimeValue.value}
          format="currency"
          trend={{
            value: customerKPIs.avgLifetimeValue.change,
            period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
            direction: customerKPIs.avgLifetimeValue.change > 0 ? 'positive' : 'negative'
          }}
          icon={Crown}
          color="secondary"
          size="lg"
          description={`${customerKPIs.avgLifetimeValue.highValueCustomers} clientes VIP`}
        />

        {/* Customer Satisfaction */}
        <KPICard
          title="Satisfacción"
          value={customerKPIs.customerSatisfaction.value}
          format="percentage"
          trend={{
            value: customerKPIs.customerSatisfaction.change,
            period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
            direction: customerKPIs.customerSatisfaction.change > 0 ? 'positive' : 'negative'
          }}
          icon={Heart}
          color="tertiary"
          size="lg"
          description={`NPS Score: ${customerKPIs.customerSatisfaction.npsScore}`}
        />

        {/* Retention Rate */}
        <KPICard
          title="Retención"
          value={customerKPIs.retentionRate.value}
          format="percentage"
          trend={{
            value: customerKPIs.retentionRate.change,
            period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
            direction: customerKPIs.retentionRate.change > 0 ? 'positive' : 'negative'
          }}
          icon={Repeat}
          color="quaternary"
          size="lg"
          description={`Benchmark: ${customerKPIs.retentionRate.benchmark}%`}
        />
      </WidgetGrid>

      {/* Customer Analysis Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segmentation */}
        <Card className="widget-container">
          <CardHeader className="widget-header">
            <CardTitle className="widget-title flex items-center gap-2">
              <PieChart className="w-5 h-5 text-chart-primary" />
              Customer Segmentation
            </CardTitle>
            <Badge variant="default" className="text-xs bg-chart-primary/20 text-chart-primary border-chart-primary/30">
              Behavioral Analysis
            </Badge>
          </CardHeader>
          <CardContent className="widget-content">
            <CustomerSegmentationWidget period={selectedPeriod} loading={dashboardLoading} />
          </CardContent>
        </Card>

        {/* Customer Journey */}
        <Card className="widget-container">
          <CardHeader className="widget-header">
            <CardTitle className="widget-title flex items-center gap-2">
              <Target className="w-5 h-5 text-chart-secondary" />
              Customer Journey
            </CardTitle>
            <Badge variant="default" className="text-xs bg-chart-secondary/20 text-chart-secondary border-chart-secondary/30">
              Conversion Funnel
            </Badge>
          </CardHeader>
          <CardContent className="widget-content">
            <CustomerJourneyWidget period={selectedPeriod} loading={dashboardLoading} />
          </CardContent>
        </Card>
      </div>

      {/* Placeholders para futuros widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="widget-container">
          <CardHeader className="widget-header">
            <CardTitle className="widget-title flex items-center gap-2">
              <Award className="w-5 h-5 text-chart-tertiary" />
              Loyalty Analytics
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Próximamente
            </Badge>
          </CardHeader>
          <CardContent className="widget-content">
            <div className="text-center py-8 text-subtle-gray">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Programas de fidelización</p>
            </div>
          </CardContent>
        </Card>

        <Card className="widget-container">
          <CardHeader className="widget-header">
            <CardTitle className="widget-title flex items-center gap-2">
              <Activity className="w-5 h-5 text-chart-quaternary" />
              Customer Health Score
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Próximamente
            </Badge>
          </CardHeader>
          <CardContent className="widget-content">
            <div className="text-center py-8 text-subtle-gray">
              <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Score de salud del cliente</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnalyticsDashboardLayout>
  )
}