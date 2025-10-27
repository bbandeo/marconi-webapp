'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown,
  Eye, 
  Users, 
  Target, 
  Clock,
  Phone,
  MessageCircle,
  Mail,
  Globe,
  Building2,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  MousePointer,
  ArrowRight,
  RefreshCw
} from "lucide-react"
import { LeadSourceStats } from "@/components/LeadSourceSelector"

interface DashboardStats {
  total_sessions: number
  total_property_views: number
  unique_property_views: number
  total_leads: number
  conversion_rate: number
  avg_time_on_page: number
  top_properties: TopProperty[]
  top_lead_sources: LeadSourceStat[]
  traffic_by_device: DeviceTypeStat[]
  daily_stats: DailyStat[]
}

interface TopProperty {
  property_id: number
  title: string
  metric_value: number
  unique_views: number
  leads: number
}

interface LeadSourceStat {
  source_id: number
  source_name: string
  leads_count: number
  conversion_rate: number
}

interface DeviceTypeStat {
  device_type: string
  sessions: number
  percentage: number
}

interface DailyStat {
  date: string
  sessions: number
  views: number
  leads: number
}

interface PropertyMetrics {
  property_id: number
  total_views: number
  unique_views: number
  avg_time_on_page: number | null
  avg_scroll_depth: number | null
  contact_rate: number | null
  leads_generated: number
  conversion_rate: number | null
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedDateRange, setSelectedDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [error, setError] = useState<string | null>(null)

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        start_date: selectedDateRange.start,
        end_date: selectedDateRange.end
      })

      const response = await fetch(`/api/analytics/dashboard?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setDashboardData(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch analytics data')
      }
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar datos de analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedDateRange])

  useEffect(() => {
    // Update date range when period changes
    const now = new Date()
    const daysMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }
    
    const days = daysMap[selectedPeriod as keyof typeof daysMap] || 30
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    setSelectedDateRange({
      start: startDate.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    })
  }, [selectedPeriod])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      case 'desktop':
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getTrendIcon = (value: number, isInverted: boolean = false) => {
    const isPositive = isInverted ? value < 0 : value > 0
    return isPositive ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    )
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <div className="animate-spin">
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error al cargar Analytics</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchAnalyticsData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No hay datos disponibles</h3>
            <p className="text-gray-400">Aún no hay datos de analytics para mostrar.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400">
            Desde {new Date(selectedDateRange.start).toLocaleDateString('es-AR')} hasta{' '}
            {new Date(selectedDateRange.end).toLocaleDateString('es-AR')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={fetchAnalyticsData}
            variant="outline" 
            size="sm"
            className="border-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sesiones Totales</p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(dashboardData.total_sessions)}
                </p>
                <p className="text-xs text-blue-400 flex items-center mt-1">
                  <Users className="w-3 h-3 mr-1" />
                  Visitantes únicos
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Vistas de Propiedades</p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(dashboardData.total_property_views)}
                </p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <Eye className="w-3 h-3 mr-1" />
                  {formatNumber(dashboardData.unique_property_views)} únicas
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Leads</p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(dashboardData.total_leads)}
                </p>
                <p className="text-xs text-purple-400 flex items-center mt-1">
                  <Target className="w-3 h-3 mr-1" />
                  Conversiones
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tasa de Conversión</p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.conversion_rate.toFixed(1)}%
                </p>
                <p className="text-xs text-orange-400 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDuration(Math.round(dashboardData.avg_time_on_page))} prom.
                </p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">Resumen</TabsTrigger>
          <TabsTrigger value="properties" className="data-[state=active]:bg-gray-700">Propiedades</TabsTrigger>
          <TabsTrigger value="sources" className="data-[state=active]:bg-gray-700">Fuentes</TabsTrigger>
          <TabsTrigger value="devices" className="data-[state=active]:bg-gray-700">Dispositivos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic by Device */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Tráfico por Dispositivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.traffic_by_device.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(device.device_type)}
                        <span className="text-white capitalize">{device.device_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{formatNumber(device.sessions)}</span>
                        <Badge variant="outline" className="text-xs">
                          {device.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lead Sources */}
            <LeadSourceStats className="bg-gray-800 border-gray-700" />
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Propiedades Más Vistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.top_properties.slice(0, 10).map((property, index) => (
                  <div key={property.property_id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="w-6 h-6 flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                      <div>
                        <h4 className="text-white font-medium">{property.title}</h4>
                        <p className="text-sm text-gray-400">ID: {property.property_id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{formatNumber(property.metric_value)} vistas</p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{formatNumber(property.unique_views)} únicas</span>
                        <span>•</span>
                        <span>{property.leads} leads</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Rendimiento por Fuente de Lead
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.top_lead_sources.map((source, index) => (
                  <div key={source.source_id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-white">{source.source_name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white font-semibold">{source.leads_count} leads</p>
                        <p className="text-sm text-gray-400">
                          {source.conversion_rate.toFixed(1)}% conversión
                        </p>
                      </div>
                      {getTrendIcon(source.conversion_rate - 2)} {/* Mock trend */}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Análisis por Dispositivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.traffic_by_device.map((device, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device.device_type)}
                          <span className="text-white capitalize">{device.device_type}</span>
                        </div>
                        <span className="text-gray-400">{device.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${device.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>{formatNumber(device.sessions)} sesiones</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Métricas de Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Tiempo Promedio en Página</span>
                      <span className="text-white font-semibold">
                        {formatDuration(Math.round(dashboardData.avg_time_on_page))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Tasa de Conversión</span>
                      <span className="text-white font-semibold">
                        {dashboardData.conversion_rate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Vistas por Sesión</span>
                      <span className="text-white font-semibold">
                        {dashboardData.total_sessions > 0 
                          ? (dashboardData.total_property_views / dashboardData.total_sessions).toFixed(1)
                          : '0'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}