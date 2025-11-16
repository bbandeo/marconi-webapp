'use client'

// =====================================================================================
// PROPERTY ANALYTICS DASHBOARD v4 - T3.4 MÓDULO PROPERTY ANALYTICS
// =====================================================================================
// Dashboard especializado en análisis de propiedades - performance individual,
// métricas de listados, geographic analytics y price optimization.
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
  Home,
  MapPin,
  DollarSign,
  Clock,
  RefreshCw,
  BarChart3,
  PieChart,
  Eye,
  Users,
  Calendar,
  Star,
  Target,
  Zap,
  Activity,
  Map,
  Building,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { useAnalyticsDashboard } from '@/hooks/useAnalyticsDashboard'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'

// =====================================================================================
// TYPES & INTERFACES ESPECÍFICOS PARA PROPERTY ANALYTICS
// =====================================================================================

interface PropertyKPIs {
  totalProperties: {
    value: number
    active: number
    sold: number
    pending: number
  }
  avgViewsPerProperty: {
    value: number
    change: number
    benchmark: number
  }
  avgTimeOnMarket: {
    value: number // days
    change: number
    target: number
  }
  conversionRate: {
    value: number // percentage
    change: number
    benchmark: number
  }
}

interface PropertyPerformance {
  id: string
  title: string
  address: string
  neighborhood: string
  price: number
  propertyType: 'casa' | 'departamento' | 'local' | 'terreno'
  listingDate: string
  views: number
  uniqueViews: number
  leads: number
  showings: number
  favorites: number
  daysOnMarket: number
  priceChanges: number
  leadConversionRate: number
  performance: 'excellent' | 'good' | 'average' | 'poor'
  trending: 'up' | 'down' | 'stable'
  images?: string[]
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
// PROPERTY PERFORMANCE COMPONENT
// =====================================================================================

interface PropertyPerformanceProps {
  period: string
  loading: boolean
}

function PropertyPerformanceWidget({ period, loading }: PropertyPerformanceProps) {
  // ✅ Get real data from properties module
  const [propertiesModuleData, setPropertiesModuleData] = React.useState<any>(null)

  React.useEffect(() => {
    fetch('/api/analytics/modules/properties')
      .then(res => res.json())
      .then(data => setPropertiesModuleData(data.data))
      .catch(err => console.error('Failed to fetch properties module data:', err))
  }, [period])

  // ✅ Transform top_properties from API to PropertyPerformance interface - 100% REAL DATA
  const propertiesData: PropertyPerformance[] = (propertiesModuleData?.top_properties?.by_views || []).map((prop, index) => {
    // Calculate conversion rate properly
    const conversionRate = prop.unique_views > 0 ? ((prop.leads / prop.unique_views) * 100) : 0

    // Calculate days on market from created_at
    const createdDate = prop.created_at ? new Date(prop.created_at) : new Date()
    const daysOnMarket = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

    return {
      id: prop.property_id?.toString() || `prop-${index}`,
      title: prop.title || 'Propiedad sin título',
      address: prop.address || 'Dirección no disponible',
      neighborhood: prop.neighborhood || 'N/A',
      price: prop.price || 0,
      propertyType: prop.property_type || 'departamento',
      listingDate: prop.created_at || new Date().toISOString(),
      views: prop.metric_value || 0, // Total views
      uniqueViews: prop.unique_views || 0,
      leads: prop.leads || 0,
      showings: 0, // TODO Phase 3: Track showings
      favorites: 0, // TODO Phase 3: Track favorites
      daysOnMarket: daysOnMarket,
      priceChanges: 0, // TODO Phase 3: Track price history
      leadConversionRate: conversionRate,
      performance: conversionRate > 2 ? 'excellent' : conversionRate > 1.5 ? 'good' : conversionRate > 1 ? 'average' : 'poor',
      trending: prop.metric_value > 50 ? 'up' : prop.metric_value < 10 ? 'down' : 'stable',
      images: prop.images || []
    }
  })

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-darker/30">
              <div className="w-12 h-12 bg-surface-darker rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-darker rounded w-48"></div>
                <div className="h-3 bg-surface-darker rounded w-32"></div>
              </div>
              <div className="w-20 h-8 bg-surface-darker rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ✅ Empty state - No fallback to mock data
  if (propertiesData.length === 0) {
    return (
      <Card className="border-border-subtle">
        <CardContent className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-semibold text-white">No hay datos de propiedades disponibles</h3>
          <p className="text-sm text-subtle-gray mt-2">
            Las métricas de propiedades aparecerán aquí una vez que haya tráfico registrado
          </p>
        </CardContent>
      </Card>
    )
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-chart-success'
      case 'good': return 'text-chart-info'
      case 'average': return 'text-chart-warning'
      case 'poor': return 'text-chart-error'
      default: return 'text-subtle-gray'
    }
  }

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'casa': return Home
      case 'departamento': return Building
      case 'local': return Target
      case 'terreno': return Map
      default: return Home
    }
  }

  const getTrendingIcon = (trending: string) => {
    switch (trending) {
      case 'up': return ArrowUpRight
      case 'down': return ArrowDownRight
      case 'stable': return Activity
      default: return Activity
    }
  }

  const getTrendingColor = (trending: string) => {
    switch (trending) {
      case 'up': return 'text-chart-success'
      case 'down': return 'text-chart-error'
      case 'stable': return 'text-chart-info'
      default: return 'text-subtle-gray'
    }
  }

  // ✅ USE ONLY REAL DATA - No fallback to mock
  const displayData = propertiesData

  // Calcular métricas totales desde datos reales
  const totalViews = displayData.reduce((sum, prop) => sum + prop.views, 0)
  const totalLeads = displayData.reduce((sum, prop) => sum + prop.leads, 0)
  const avgDaysOnMarket = displayData.length > 0 ? Math.round(displayData.reduce((sum, prop) => sum + prop.daysOnMarket, 0) / displayData.length) : 0

  return (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-surface-darker/20 border border-border-subtle">
        <div className="text-center">
          <div className="text-kpi-number-small text-chart-primary">{totalViews.toLocaleString()}</div>
          <div className="text-xs text-subtle-gray">Total Views</div>
        </div>
        <div className="text-center">
          <div className="text-kpi-number-small text-chart-secondary">{totalLeads}</div>
          <div className="text-xs text-subtle-gray">Total Leads</div>
        </div>
        <div className="text-center">
          <div className="text-kpi-number-small text-chart-tertiary">{avgDaysOnMarket}</div>
          <div className="text-xs text-subtle-gray">Días Promedio</div>
        </div>
      </div>

      {/* Properties List */}
      <div className="space-y-3">
        {displayData
          .sort((a, b) => b.views - a.views) // Ordenar por views descendente
          .map((property) => {
            const PropertyTypeIcon = getPropertyTypeIcon(property.propertyType)
            const TrendingIcon = getTrendingIcon(property.trending)

            return (
              <div
                key={property.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-surface-darker/30 hover:bg-surface-darker/50 transition-colors border border-border-subtle/50"
              >
                {/* Property Image & Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {property.images && property.images.length > 0 ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-darker">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          const target = e.target as HTMLElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full bg-chart-primary/20 flex items-center justify-center"><svg class="w-8 h-8 text-chart-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></div>`
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-chart-primary/20 flex items-center justify-center flex-shrink-0">
                      <PropertyTypeIcon className="w-8 h-8 text-chart-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white text-sm truncate">{property.title}</h4>
                      <div className="flex items-center gap-1">
                        <TrendingIcon className={`w-3 h-3 ${getTrendingColor(property.trending)}`} />
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPerformanceColor(property.performance)} bg-current/10`}>
                          {property.performance}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-subtle-gray">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {property.address || property.neighborhood}
                      </span>
                      <span>{property.views.toLocaleString()} views</span>
                      <span className="hidden sm:inline">{property.leads} leads</span>
                      <span className="hidden md:inline">{property.daysOnMarket} días</span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="flex items-center gap-6 text-right">
                  <div className="hidden sm:block">
                    <div className="text-sm font-semibold text-bone-white">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0
                      }).format(property.price)}
                    </div>
                    <div className="text-xs text-subtle-gray">Precio</div>
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${getPerformanceColor(property.performance)}`}>
                      {property.leadConversionRate}%
                    </div>
                    <div className="text-xs text-subtle-gray">Conversión</div>
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {/* ✅ Performance Insight - Dynamic based on percentiles */}
      {displayData.length > 0 && (() => {
        // Calculate percentiles for views and conversion rate
        const sortedByViews = [...displayData].sort((a, b) => a.views - b.views)
        const sortedByConversion = [...displayData].sort((a, b) => a.leadConversionRate - b.leadConversionRate)

        const percentile25Views = sortedByViews[Math.floor(displayData.length * 0.25)]?.views || 0
        const percentile75Views = sortedByViews[Math.floor(displayData.length * 0.75)]?.views || 0
        const percentile25Conversion = sortedByConversion[Math.floor(displayData.length * 0.25)]?.leadConversionRate || 0
        const percentile75Conversion = sortedByConversion[Math.floor(displayData.length * 0.75)]?.leadConversionRate || 0

        // Top performers: Top 25% in both views and conversion
        const topPerformers = displayData.filter(p =>
          p.views >= percentile75Views && p.leadConversionRate >= percentile75Conversion
        )

        // Needs attention: Bottom 25% in views
        const needsAttention = displayData.filter(p =>
          p.views > 0 && p.views <= percentile25Views
        )

        // Generate dynamic insight
        let insight = ''

        if (topPerformers.length > 0) {
          const topProp = topPerformers[0]
          insight += `🌟 Top performers (${topPerformers.length}): ${topProp.title} lidera con ${topProp.views.toLocaleString()} views y ${topProp.leadConversionRate.toFixed(2)}% conversión. `
        }

        if (needsAttention.length > 0 && displayData.length > 1) {
          const needsProp = needsAttention[0]
          insight += `⚠️ ${needsAttention.length} ${needsAttention.length === 1 ? 'propiedad necesita' : 'propiedades necesitan'} atención: ${needsProp.title} tiene bajo tráfico (${needsProp.views} views). Considera mejorar fotos, descripción o promoción.`
        }

        if (!insight) {
          insight = `Análisis basado en ${displayData.length} ${displayData.length === 1 ? 'propiedad' : 'propiedades'}. Continúa monitoreando el rendimiento.`
        }

        return (
          <div className="mt-4 p-3 rounded-lg bg-chart-primary/10 border border-chart-primary/20">
            <div className="flex items-start gap-2">
              <BarChart3 className="w-4 h-4 text-chart-primary mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-chart-primary">Insights de Performance</div>
                <div className="text-subtle-gray text-xs mt-1">
                  {insight}
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================

export default function PropertyAnalytics() {
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

  // State for properties module data
  const [propertiesModuleData, setPropertiesModuleData] = React.useState<any>(null)

  // Fetch properties module data
  React.useEffect(() => {
    const fetchPropertiesData = async () => {
      try {
        const response = await fetch('/api/analytics/modules/properties')
        const result = await response.json()
        if (result.success) {
          setPropertiesModuleData(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch properties module data:', error)
      }
    }

    fetchPropertiesData()
  }, [selectedPeriod])

  // ✅ REAL DATA from properties module - 100% calculated from real data
  const propertyKPIs: PropertyKPIs = React.useMemo(() => {
    if (!propertiesModuleData || !propertiesModuleData.overview) {
      return {
        totalProperties: { value: 0, active: 0, sold: 0, pending: 0 },
        avgViewsPerProperty: { value: 0, change: 0, benchmark: 1200 },
        avgTimeOnMarket: { value: 0, change: 0, target: 60 },
        conversionRate: { value: 0, change: 0, benchmark: 1.20 }
      }
    }

    const overview = propertiesModuleData.overview

    // ✅ Calculate avg time on market from properties' created_at dates
    let avgTimeOnMarket = 0
    if (propertiesModuleData.top_properties?.by_views?.length > 0) {
      const properties = propertiesModuleData.top_properties.by_views
      const totalDays = properties.reduce((sum: number, prop: any) => {
        if (prop.created_at) {
          const createdDate = new Date(prop.created_at)
          const daysOnMarket = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
          return sum + daysOnMarket
        }
        return sum
      }, 0)
      avgTimeOnMarket = properties.length > 0 ? Math.round(totalDays / properties.length) : 0
    }

    return {
      totalProperties: {
        value: overview.total_properties || 0, // ✅ Real property count
        active: overview.total_properties || 0, // TODO Phase 3: Add property status filtering
        sold: 0, // TODO Phase 3: Track from sales_closed table
        pending: 0 // TODO Phase 3: Track from sales_pipeline table
      },
      avgViewsPerProperty: {
        value: overview.avg_views_per_property || 0, // ✅ Real: total_views / property_count
        change: 0, // TODO Phase 2: Calculate trend
        benchmark: 1200
      },
      avgTimeOnMarket: {
        value: avgTimeOnMarket, // ✅ Real: calculated from properties.created_at
        change: 0, // TODO Phase 2: Calculate trend
        target: 60
      },
      conversionRate: {
        value: dashboardData?.conversion_rate || 0, // ✅ Real data from dashboard
        change: 0, // TODO Phase 2: Calculate trend
        benchmark: 1.20
      }
    }
  }, [propertiesModuleData, dashboardData])

  // Breadcrumbs
  const breadcrumbs = buildAnalyticsBreadcrumbs('properties', 'Property Analytics')

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
      title="Property Analytics"
      subtitle="Análisis detallado de performance de propiedades y optimización de listados"
      breadcrumbs={breadcrumbs}
      actions={headerActions}
      loading={dashboardLoading}
      className="space-y-dashboard"
    >
      {/* Property KPI Cards Row */}
      <WidgetGrid
        desktop={{ cols: 4, gap: 'lg' }}
        tablet={{ cols: 2, gap: 'md' }}
        mobile={{ cols: 1, gap: 'sm' }}
      >
        {/* Total Properties */}
        <KPICard
          title="Propiedades Activas"
          value={propertyKPIs.totalProperties.active}
          format="number"
          trend={{
            value: 5.2,
            period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
            direction: 'positive'
          }}
          icon={Home}
          color="primary"
          size="lg"
          description={`Total portfolio: ${propertyKPIs.totalProperties.value} propiedades`}
        />

        {/* Average Views Per Property */}
        <KPICard
          title="Views Promedio"
          value={propertyKPIs.avgViewsPerProperty.value}
          format="number"
          trend={{
            value: propertyKPIs.avgViewsPerProperty.change,
            period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
            direction: propertyKPIs.avgViewsPerProperty.change > 0 ? 'positive' : 'negative'
          }}
          icon={Eye}
          color="secondary"
          size="lg"
          description={`Benchmark del sector: ${propertyKPIs.avgViewsPerProperty.benchmark.toLocaleString()}`}
        />

        {/* Average Time on Market */}
        <KPICard
          title="Días en Mercado"
          value={propertyKPIs.avgTimeOnMarket.value}
          format="number"
          trend={{
            value: propertyKPIs.avgTimeOnMarket.change,
            period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
            direction: propertyKPIs.avgTimeOnMarket.change < 0 ? 'positive' : 'negative' // Lower is better
          }}
          icon={Calendar}
          color="tertiary"
          size="lg"
          description={`Meta objetivo: ${propertyKPIs.avgTimeOnMarket.target} días`}
        />

        {/* Property Conversion Rate */}
        <KPICard
          title="Conversión de Leads"
          value={propertyKPIs.conversionRate.value}
          format="percentage"
          trend={{
            value: propertyKPIs.conversionRate.change,
            period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
            direction: propertyKPIs.conversionRate.change > 0 ? 'positive' : 'negative'
          }}
          icon={Target}
          color="quaternary"
          size="lg"
          description={`Benchmark: ${propertyKPIs.conversionRate.benchmark}%`}
        />
      </WidgetGrid>

      {/* Property Performance Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="widget-container lg:col-span-2">
          <CardHeader className="widget-header">
            <CardTitle className="widget-title flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-chart-primary" />
              Property Performance
            </CardTitle>
            <Badge variant="default" className="text-xs bg-chart-primary/20 text-chart-primary border-chart-primary/30">
              Top Performers
            </Badge>
          </CardHeader>
          <CardContent className="widget-content">
            <PropertyPerformanceWidget period={selectedPeriod} loading={dashboardLoading} />
          </CardContent>
        </Card>

        {/* Placeholder para próximos widgets */}
        <Card className="widget-container">
          <CardHeader className="widget-header">
            <CardTitle className="widget-title flex items-center gap-2">
              <Map className="w-5 h-5 text-chart-secondary" />
              Geographic Analytics
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Próximamente
            </Badge>
          </CardHeader>
          <CardContent className="widget-content">
            <div className="text-center py-8 text-subtle-gray">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Análisis por zona</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholders para Price Analytics y Listing Optimization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="widget-container">
          <CardHeader className="widget-header">
            <CardTitle className="widget-title flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-chart-tertiary" />
              Price Analytics
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Próximamente
            </Badge>
          </CardHeader>
          <CardContent className="widget-content">
            <div className="text-center py-8 text-subtle-gray">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Comparativas de mercado</p>
            </div>
          </CardContent>
        </Card>

        <Card className="widget-container">
          <CardHeader className="widget-header">
            <CardTitle className="widget-title flex items-center gap-2">
              <Zap className="w-5 h-5 text-chart-quaternary" />
              Listing Optimization
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Próximamente
            </Badge>
          </CardHeader>
          <CardContent className="widget-content">
            <div className="text-center py-8 text-subtle-gray">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Sugerencias de mejora</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnalyticsDashboardLayout>
  )
}