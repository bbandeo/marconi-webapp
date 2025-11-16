'use client'

// =====================================================================================
// MARKETING ANALYTICS DASHBOARD v4 - T3.3 MÓDULO MARKETING & LEADS
// =====================================================================================
// Dashboard de marketing y generación de leads con análisis de canales, campañas
// ROI y website analytics. Sigue patrones de dashboard v4.
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
  Target,
  DollarSign,
  Clock,
  RefreshCw,
  BarChart3,
  PieChart,
  Globe,
  Megaphone,
  MousePointer,
  Eye,
  Search,
  Facebook,
  Instagram,
  MessageCircle,
  Mail,
  Phone,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  TestTube
} from 'lucide-react'
import { useAnalyticsDashboard } from '@/hooks/useAnalyticsDashboard'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'

// =====================================================================================
// TYPES & INTERFACES ESPECÍFICOS PARA MARKETING
// =====================================================================================

interface MarketingKPIs {
  totalLeads: {
    value: number
    change: number
    cost: number
  }
  leadQuality: {
    value: number // percentage
    change: number
    benchmark: number
  }
  costPerLead: {
    value: number
    change: number
    target: number
  }
  websiteTraffic: {
    value: number
    change: number
    conversionRate: number
  }
}

interface ChannelPerformance {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  leads: number
  cost: number
  cpl: number // cost per lead
  conversionRate: number
  roi: number
  trend: number
  color: string
  status: 'active' | 'paused' | 'testing'
}

interface CampaignData {
  id: string
  name: string
  channel: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  startDate: string
  endDate: string
  budget: number
  spent: number
  leads: number
  conversions: number
  revenue: number
  roi: number
  cpl: number
  conversionRate: number
  clickThroughRate: number
  status: 'active' | 'paused' | 'completed' | 'draft'
  performance: 'excellent' | 'good' | 'average' | 'poor'
}

interface WebsiteAnalyticsData {
  trafficSources: {
    source: string
    sessions: number
    percentage: number
    bounceRate: number
    avgSessionDuration: number
    conversions: number
    conversionRate: number
  }[]
  topPages: {
    page: string
    title: string
    pageviews: number
    uniquePageviews: number
    avgTimeOnPage: number
    bounceRate: number
    exitRate: number
    conversions: number
  }[]
  overallMetrics: {
    totalSessions: number
    totalPageviews: number
    avgSessionDuration: number
    bounceRate: number
    newUsersPercentage: number
    totalConversions: number
    overallConversionRate: number
  }
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
// CHANNEL PERFORMANCE COMPONENT
// =====================================================================================

interface ChannelPerformanceProps {
  period: string
  loading: boolean
}

function ChannelPerformanceWidget({ period, loading }: ChannelPerformanceProps) {
  // Mock data de canales de marketing - En el futuro vendrá de analytics API
  const channelsData: ChannelPerformance[] = [
    {
      id: 'google-ads',
      name: 'Google Ads',
      icon: Search,
      leads: 45,
      cost: 32000,
      cpl: 711,
      conversionRate: 3.2,
      roi: 185,
      trend: 12.5,
      color: '#4285F4',
      status: 'active'
    },
    {
      id: 'facebook-ads',
      name: 'Facebook Ads',
      icon: Facebook,
      leads: 38,
      cost: 28000,
      cpl: 737,
      conversionRate: 2.8,
      roi: 165,
      trend: -5.3,
      color: '#1877F2',
      status: 'active'
    },
    {
      id: 'instagram-ads',
      name: 'Instagram Ads',
      icon: Instagram,
      leads: 25,
      cost: 18000,
      cpl: 720,
      conversionRate: 2.1,
      roi: 142,
      trend: 18.7,
      color: '#E4405F',
      status: 'active'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      leads: 32,
      cost: 5000,
      cpl: 156,
      conversionRate: 8.5,
      roi: 320,
      trend: 25.8,
      color: '#25D366',
      status: 'active'
    },
    {
      id: 'email',
      name: 'Email Marketing',
      icon: Mail,
      leads: 18,
      cost: 3500,
      cpl: 194,
      conversionRate: 4.2,
      roi: 280,
      trend: 8.2,
      color: '#EA4335',
      status: 'active'
    },
    {
      id: 'referrals',
      name: 'Referidos',
      icon: UserPlus,
      leads: 12,
      cost: 2000,
      cpl: 167,
      conversionRate: 12.5,
      roi: 450,
      trend: 35.2,
      color: '#34A853',
      status: 'testing'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-darker/30">
              <div className="w-10 h-10 bg-surface-darker rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-darker rounded w-24"></div>
                <div className="h-3 bg-surface-darker rounded w-16"></div>
              </div>
              <div className="w-20 h-4 bg-surface-darker rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Calcular totales
  const totals = channelsData.reduce((acc, channel) => ({
    leads: acc.leads + channel.leads,
    cost: acc.cost + channel.cost,
    avgROI: acc.avgROI + channel.roi
  }), { leads: 0, cost: 0, avgROI: 0 })

  totals.avgROI = totals.avgROI / channelsData.length

  return (
    <div className="space-y-4">
      {/* Enhanced Summary Row */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-chart-primary/10 via-chart-secondary/10 to-chart-success/10 rounded-2xl blur-sm"></div>
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 p-8 rounded-2xl bg-gradient-to-r from-surface-darker/60 to-surface-darker/40 border border-border-subtle/80 backdrop-blur-md">
          <div className="text-center space-y-3 group">
            <div className="text-3xl lg:text-4xl font-bold text-chart-primary tracking-tight group-hover:scale-105 transition-transform duration-200">{totals.leads}</div>
            <div className="text-sm font-semibold text-bone-white/80 uppercase tracking-wider">Total Leads</div>
            <div className="w-12 h-1 bg-gradient-to-r from-chart-primary/60 to-chart-primary/20 rounded-full mx-auto"></div>
          </div>
          <div className="text-center space-y-3 group">
            <div className="text-3xl lg:text-4xl font-bold text-chart-secondary tracking-tight group-hover:scale-105 transition-transform duration-200">
              {new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 0,
                notation: 'compact'
              }).format(totals.cost)}
            </div>
            <div className="text-sm font-semibold text-bone-white/80 uppercase tracking-wider">Inversión Total</div>
            <div className="w-12 h-1 bg-gradient-to-r from-chart-secondary/60 to-chart-secondary/20 rounded-full mx-auto"></div>
          </div>
          <div className="text-center space-y-3 group">
            <div className="text-3xl lg:text-4xl font-bold text-chart-success tracking-tight group-hover:scale-105 transition-transform duration-200">{Math.round(totals.avgROI)}%</div>
            <div className="text-sm font-semibold text-bone-white/80 uppercase tracking-wider">ROI Promedio</div>
            <div className="w-12 h-1 bg-gradient-to-r from-chart-success/60 to-chart-success/20 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Channels List */}
      <div className="space-y-5">
        {channelsData
          .sort((a, b) => b.roi - a.roi) // Ordenar por ROI descendente
          .map((channel) => (
            <div
              key={channel.id}
              className="group relative p-6 lg:p-7 rounded-2xl bg-gradient-to-r from-surface-darker/50 to-surface-darker/30 hover:from-surface-darker/70 hover:to-surface-darker/50 transition-all duration-500 border border-border-subtle/60 hover:border-border-subtle hover:shadow-2xl hover:shadow-black/20 backdrop-blur-md"
            >
              {/* Enhanced Status Indicator Bar */}
              <div
                className="absolute top-0 left-0 w-full h-1.5 rounded-t-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, ${channel.color}, ${channel.color}80)`,
                  boxShadow: `0 0 8px ${channel.color}40`
                }}
              />

              <div className="flex items-center justify-between">
                {/* Channel Icon & Name */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300"
                    style={{
                      backgroundColor: `${channel.color}20`,
                      border: `2px solid ${channel.color}40`,
                      boxShadow: `0 8px 16px ${channel.color}20, 0 0 0 1px ${channel.color}10`
                    }}
                  >
                    <channel.icon className="w-7 h-7" style={{ color: channel.color }} />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-4">
                      <h4 className="font-bold text-bone-white text-lg tracking-tight truncate">{channel.name}</h4>
                      <div className="flex items-center gap-1">
                        {channel.status === 'active' && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-success/20 border border-chart-success/30">
                            <Play className="w-3 h-3 text-chart-success" />
                            <span className="text-xs font-medium text-chart-success">Activo</span>
                          </div>
                        )}
                        {channel.status === 'paused' && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-warning/20 border border-chart-warning/30">
                            <Pause className="w-3 h-3 text-chart-warning" />
                            <span className="text-xs font-medium text-chart-warning">Pausado</span>
                          </div>
                        )}
                        {channel.status === 'testing' && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-info/20 border border-chart-info/30">
                            <TestTube className="w-3 h-3 text-chart-info" />
                            <span className="text-xs font-medium text-chart-info">Prueba</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-8 text-sm text-bone-white/70">
                      <span className="font-semibold">{channel.leads} leads</span>
                      <span className="font-medium">{channel.conversionRate}% conversión</span>
                      <span className="hidden md:inline font-mono text-xs bg-surface-darker/40 px-2 py-1 rounded-md">CPL: {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                        minimumFractionDigits: 0,
                        notation: 'compact'
                      }).format(channel.cpl)}</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Performance Metrics */}
                <div className="flex items-center gap-6 lg:gap-10">
                  <div className="hidden lg:flex items-center gap-8 text-right">
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-bone-white tracking-tight">
                        {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: 'ARS',
                          minimumFractionDigits: 0,
                          notation: 'compact'
                        }).format(channel.cost)}
                      </div>
                      <div className="text-xs font-semibold text-bone-white/60 uppercase tracking-wider">Inversión</div>
                    </div>

                    <div className="space-y-2">
                      <div className={`text-2xl font-bold tracking-tight ${
                        channel.roi >= 300 ? 'text-chart-success drop-shadow-lg' :
                        channel.roi >= 200 ? 'text-chart-info drop-shadow-lg' :
                        channel.roi >= 150 ? 'text-chart-warning drop-shadow-lg' : 'text-chart-error drop-shadow-lg'
                      }`}>
                        {channel.roi}%
                      </div>
                      <div className="text-xs font-semibold text-bone-white/60 uppercase tracking-wider">ROI</div>
                    </div>
                  </div>

                  {/* Enhanced Trend Indicator */}
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 ${
                    channel.trend > 0
                      ? 'bg-gradient-to-r from-chart-success/20 to-chart-success/10 border border-chart-success/30 group-hover:border-chart-success/50'
                      : 'bg-gradient-to-r from-chart-error/20 to-chart-error/10 border border-chart-error/30 group-hover:border-chart-error/50'
                  }`}>
                    <div className={`transition-transform duration-200 group-hover:scale-110 ${
                      channel.trend > 0 ? 'text-chart-success' : 'text-chart-error'
                    }`}>
                      {channel.trend > 0 ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-base font-bold tracking-tight ${
                      channel.trend > 0 ? 'text-chart-success' : 'text-chart-error'
                    }`}>
                      {Math.abs(channel.trend)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Enhanced Performance Insights */}
      <div className="mt-8 relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-chart-success/40 to-chart-info/40 rounded-2xl blur opacity-60 group-hover:opacity-80 transition duration-500"></div>
        <div className="relative p-6 lg:p-8 rounded-2xl bg-gradient-to-r from-chart-success/10 via-chart-success/5 to-chart-info/10 border border-chart-success/40 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-chart-success/30 to-chart-success/20 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-chart-success" />
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-chart-success tracking-tight">💡 Insight de Rendimiento</div>
                <div className="px-2 py-1 bg-chart-success/20 rounded-full text-xs font-semibold text-chart-success">AI-Powered</div>
              </div>
              <div className="text-bone-white text-base leading-relaxed">
                <strong className="text-chart-success">WhatsApp</strong> lidera con <span className="text-chart-success font-bold text-lg">${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(156)} CPL</span> y <span className="text-chart-success font-bold">320% ROI</span>.
                <br />
                <span className="text-chart-info font-semibold">Recomendación:</span> <span className="text-bone-white/90">Aumentar presupuesto en WhatsApp (+40%) y Email Marketing (+25%) para maximizar el retorno de inversión.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =====================================================================================
// CAMPAIGN ROI ANALYSIS COMPONENT
// =====================================================================================

interface CampaignROIProps {
  period: string
  loading: boolean
}

function CampaignROIWidget({ period, loading }: CampaignROIProps) {
  // Mock data de campañas - En el futuro vendrá de analytics API con UTM tracking
  const campaignsData: CampaignData[] = [
    {
      id: 'google-search-2024-q1',
      name: 'Google Search - Propiedades Premium',
      channel: 'Google Ads',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'propiedades-premium-2024',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      budget: 25000,
      spent: 22500,
      leads: 38,
      conversions: 12,
      revenue: 450000,
      roi: 1900,
      cpl: 592,
      conversionRate: 31.6,
      clickThroughRate: 4.2,
      status: 'active',
      performance: 'excellent'
    },
    {
      id: 'facebook-lookalike-q1',
      name: 'Facebook Lookalike - Inversores',
      channel: 'Facebook Ads',
      utmSource: 'facebook',
      utmMedium: 'social',
      utmCampaign: 'lookalike-inversores-2024',
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      budget: 18000,
      spent: 16200,
      leads: 25,
      conversions: 6,
      revenue: 280000,
      roi: 1630,
      cpl: 648,
      conversionRate: 24.0,
      clickThroughRate: 3.1,
      status: 'active',
      performance: 'excellent'
    },
    {
      id: 'instagram-stories-q1',
      name: 'Instagram Stories - Jóvenes Profesionales',
      channel: 'Instagram Ads',
      utmSource: 'instagram',
      utmMedium: 'social',
      utmCampaign: 'jovenes-profesionales-2024',
      startDate: '2024-01-20',
      endDate: '2024-03-20',
      budget: 12000,
      spent: 11400,
      leads: 18,
      conversions: 3,
      revenue: 165000,
      roi: 1347,
      cpl: 633,
      conversionRate: 16.7,
      clickThroughRate: 2.8,
      status: 'completed',
      performance: 'good'
    },
    {
      id: 'google-display-retargeting',
      name: 'Google Display - Retargeting',
      channel: 'Google Ads',
      utmSource: 'google',
      utmMedium: 'display',
      utmCampaign: 'retargeting-visitantes-2024',
      startDate: '2024-02-10',
      endDate: '2024-05-10',
      budget: 8000,
      spent: 6800,
      leads: 14,
      conversions: 2,
      revenue: 95000,
      roi: 1297,
      cpl: 486,
      conversionRate: 14.3,
      clickThroughRate: 1.9,
      status: 'active',
      performance: 'good'
    },
    {
      id: 'email-nurturing-q1',
      name: 'Email Nurturing - Base Existente',
      channel: 'Email Marketing',
      utmSource: 'email',
      utmMedium: 'email',
      utmCampaign: 'nurturing-base-2024',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      budget: 3500,
      spent: 2800,
      leads: 12,
      conversions: 4,
      revenue: 180000,
      roi: 6329,
      cpl: 233,
      conversionRate: 33.3,
      clickThroughRate: 8.5,
      status: 'completed',
      performance: 'excellent'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between p-4 rounded-lg bg-surface-darker/30">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-darker rounded w-48"></div>
                <div className="h-3 bg-surface-darker rounded w-32"></div>
              </div>
              <div className="space-y-1 text-right">
                <div className="h-4 bg-surface-darker rounded w-16"></div>
                <div className="h-3 bg-surface-darker rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Calcular métricas agregadas
  const totalBudget = campaignsData.reduce((sum, campaign) => sum + campaign.budget, 0)
  const totalSpent = campaignsData.reduce((sum, campaign) => sum + campaign.spent, 0)
  const totalLeads = campaignsData.reduce((sum, campaign) => sum + campaign.leads, 0)
  const totalRevenue = campaignsData.reduce((sum, campaign) => sum + campaign.revenue, 0)
  const avgROI = campaignsData.reduce((sum, campaign) => sum + campaign.roi, 0) / campaignsData.length

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-chart-success'
      case 'good': return 'text-chart-info'
      case 'average': return 'text-chart-warning'
      case 'poor': return 'text-chart-error'
      default: return 'text-subtle-gray'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-chart-success'
      case 'paused': return 'text-chart-warning'
      case 'completed': return 'text-chart-info'
      case 'draft': return 'text-subtle-gray'
      default: return 'text-subtle-gray'
    }
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Campaign Summary Metrics */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-chart-primary/8 via-chart-secondary/8 via-chart-tertiary/8 to-chart-success/8 rounded-2xl blur-sm"></div>
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6 p-7 rounded-2xl bg-gradient-to-br from-surface-darker/60 to-surface-darker/40 border border-border-subtle/80 backdrop-blur-md">
          <div className="text-center space-y-3 group">
            <div className="text-2xl lg:text-3xl font-bold text-chart-primary tracking-tight group-hover:scale-105 transition-transform duration-200">{totalLeads}</div>
            <div className="text-xs font-semibold text-bone-white/70 uppercase tracking-wider">Total Leads</div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-chart-primary/60 to-chart-primary/20 rounded-full mx-auto"></div>
          </div>
          <div className="text-center space-y-3 group">
            <div className="text-2xl lg:text-3xl font-bold text-chart-secondary tracking-tight group-hover:scale-105 transition-transform duration-200">
              {Math.round(avgROI)}%
            </div>
            <div className="text-xs font-semibold text-bone-white/70 uppercase tracking-wider">ROI Promedio</div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-chart-secondary/60 to-chart-secondary/20 rounded-full mx-auto"></div>
          </div>
          <div className="text-center space-y-3 group">
            <div className="text-2xl lg:text-3xl font-bold text-chart-tertiary tracking-tight group-hover:scale-105 transition-transform duration-200">
              {new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 0,
                notation: 'compact'
              }).format(totalSpent)}
            </div>
            <div className="text-xs font-semibold text-bone-white/70 uppercase tracking-wider">Gastado</div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-chart-tertiary/60 to-chart-tertiary/20 rounded-full mx-auto"></div>
          </div>
          <div className="text-center space-y-3 group">
            <div className="text-2xl lg:text-3xl font-bold text-chart-success tracking-tight group-hover:scale-105 transition-transform duration-200">
              {new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 0,
                notation: 'compact'
              }).format(totalRevenue)}
            </div>
            <div className="text-xs font-semibold text-bone-white/70 uppercase tracking-wider">Revenue</div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-chart-success/60 to-chart-success/20 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Campaigns List */}
      <div className="space-y-4">
        {campaignsData
          .sort((a, b) => b.roi - a.roi) // Ordenar por ROI descendente
          .map((campaign) => (
            <div
              key={campaign.id}
              className="group p-6 rounded-2xl bg-gradient-to-r from-surface-darker/40 to-surface-darker/25 hover:from-surface-darker/60 hover:to-surface-darker/45 transition-all duration-500 border border-border-subtle/60 hover:border-border-subtle hover:shadow-xl hover:shadow-black/20 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                {/* Campaign Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-4">
                    <h4 className="font-bold text-bone-white text-lg tracking-tight truncate">{campaign.name}</h4>
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${
                        campaign.status === 'active' ? 'bg-chart-success shadow-lg shadow-chart-success/30' :
                        campaign.status === 'paused' ? 'bg-chart-warning shadow-lg shadow-chart-warning/30' :
                        campaign.status === 'completed' ? 'bg-chart-info shadow-lg shadow-chart-info/30' : 'bg-subtle-gray'
                      }`}></div>
                      <span className={`text-sm font-medium capitalize ${getStatusColor(campaign.status)}`}>
                        {campaign.status === 'active' ? 'Activa' :
                         campaign.status === 'completed' ? 'Completada' :
                         campaign.status === 'paused' ? 'Pausada' : campaign.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-sm text-bone-white/70">
                    <span className="font-semibold text-bone-white/90">{campaign.channel}</span>
                    <span className="font-medium">{campaign.leads} leads</span>
                    <span className="font-medium">{campaign.conversionRate}% conversión</span>
                    <span className="hidden lg:inline font-mono text-xs bg-surface-darker/50 px-3 py-1.5 rounded-lg border border-border-subtle/30">
                      {campaign.utmSource}/{campaign.utmMedium}
                    </span>
                  </div>
                </div>

                {/* Enhanced Performance Metrics */}
                <div className="flex items-center gap-8">
                  <div className="hidden md:block text-right space-y-2">
                    <div className="text-lg font-bold text-bone-white tracking-tight">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                        minimumFractionDigits: 0,
                        notation: 'compact'
                      }).format(campaign.spent)}
                    </div>
                    <div className="text-xs text-bone-white/60 font-medium">
                      de {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                        minimumFractionDigits: 0,
                        notation: 'compact'
                      }).format(campaign.budget)}
                    </div>
                  </div>

                  <div className={`text-right space-y-2 px-4 py-3 rounded-xl border transition-all duration-300 ${
                    campaign.performance === 'excellent' ? 'bg-chart-success/10 border-chart-success/30 group-hover:border-chart-success/50' :
                    campaign.performance === 'good' ? 'bg-chart-info/10 border-chart-info/30 group-hover:border-chart-info/50' :
                    campaign.performance === 'average' ? 'bg-chart-warning/10 border-chart-warning/30 group-hover:border-chart-warning/50' : 'bg-chart-error/10 border-chart-error/30 group-hover:border-chart-error/50'
                  }`}>
                    <div className={`text-2xl font-bold tracking-tight ${
                      campaign.performance === 'excellent' ? 'text-chart-success drop-shadow-lg' :
                      campaign.performance === 'good' ? 'text-chart-info drop-shadow-lg' :
                      campaign.performance === 'average' ? 'text-chart-warning drop-shadow-lg' : 'text-chart-error drop-shadow-lg'
                    }`}>
                      {campaign.roi}%
                    </div>
                    <div className="text-xs font-semibold text-bone-white/60 uppercase tracking-wider">ROI</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Enhanced Campaign Insight */}
      <div className="mt-6 relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-chart-info/30 to-chart-tertiary/30 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
        <div className="relative p-5 lg:p-6 rounded-2xl bg-gradient-to-r from-chart-info/10 to-chart-tertiary/10 border border-chart-info/30 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-chart-info/30 to-chart-info/20 flex items-center justify-center shadow-lg">
              <PieChart className="w-5 h-5 text-chart-info" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="text-base font-bold text-chart-info tracking-tight">📊 Insight de Campañas</div>
                <div className="px-2 py-0.5 bg-chart-info/20 rounded-full text-xs font-semibold text-chart-info">Optimized</div>
              </div>
              <div className="text-bone-white text-sm leading-relaxed">
                <strong className="text-chart-info">Email Marketing</strong> lidera con <span className="text-chart-success font-bold">6329% ROI</span>. Las campañas de <strong className="text-chart-primary">Google Search</strong> generan más volumen con ROI sólido (+1900%).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =====================================================================================
// WEBSITE ANALYTICS COMPONENT
// =====================================================================================

interface WebsiteAnalyticsProps {
  period: string
  loading: boolean
}

function WebsiteAnalyticsWidget({ period, loading }: WebsiteAnalyticsProps) {
  // Mock data de website analytics - En el futuro vendrá de Google Analytics API o similar
  const websiteData: WebsiteAnalyticsData = {
    trafficSources: [
      {
        source: 'Organic Search',
        sessions: 3250,
        percentage: 52.3,
        bounceRate: 34.2,
        avgSessionDuration: 185,
        conversions: 48,
        conversionRate: 1.48
      },
      {
        source: 'Direct',
        sessions: 1850,
        percentage: 29.7,
        bounceRate: 28.1,
        avgSessionDuration: 220,
        conversions: 35,
        conversionRate: 1.89
      },
      {
        source: 'Social Media',
        sessions: 680,
        percentage: 10.9,
        bounceRate: 45.8,
        avgSessionDuration: 142,
        conversions: 12,
        conversionRate: 1.76
      },
      {
        source: 'Paid Search',
        sessions: 285,
        percentage: 4.6,
        bounceRate: 31.5,
        avgSessionDuration: 195,
        conversions: 8,
        conversionRate: 2.81
      },
      {
        source: 'Email',
        sessions: 160,
        percentage: 2.5,
        bounceRate: 22.5,
        avgSessionDuration: 280,
        conversions: 6,
        conversionRate: 3.75
      }
    ],
    topPages: [
      {
        page: '/propiedades',
        title: 'Listado de Propiedades',
        pageviews: 8420,
        uniquePageviews: 6850,
        avgTimeOnPage: 195,
        bounceRate: 42.3,
        exitRate: 35.2,
        conversions: 38
      },
      {
        page: '/',
        title: 'Inicio - Marconi Inmobiliaria',
        pageviews: 6280,
        uniquePageviews: 5120,
        avgTimeOnPage: 125,
        bounceRate: 38.7,
        exitRate: 28.4,
        conversions: 22
      },
      {
        page: '/propiedades/departamentos',
        title: 'Departamentos en Venta',
        pageviews: 4150,
        uniquePageviews: 3420,
        avgTimeOnPage: 210,
        bounceRate: 35.8,
        exitRate: 32.1,
        conversions: 25
      },
      {
        page: '/propiedades/casas',
        title: 'Casas en Venta',
        pageviews: 3680,
        uniquePageviews: 2950,
        avgTimeOnPage: 225,
        bounceRate: 33.2,
        exitRate: 29.8,
        conversions: 18
      },
      {
        page: '/contacto',
        title: 'Contacto',
        pageviews: 2340,
        uniquePageviews: 1890,
        avgTimeOnPage: 95,
        bounceRate: 25.4,
        exitRate: 45.7,
        conversions: 15
      }
    ],
    overallMetrics: {
      totalSessions: 6225,
      totalPageviews: 18750,
      avgSessionDuration: 187,
      bounceRate: 35.8,
      newUsersPercentage: 68.4,
      totalConversions: 109,
      overallConversionRate: 1.75
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="p-3 rounded-lg bg-surface-darker/30">
                <div className="h-3 bg-surface-darker rounded w-20 mb-2"></div>
                <div className="h-5 bg-surface-darker rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex justify-between items-center p-3 rounded-lg bg-surface-darker/30">
                <div className="h-4 bg-surface-darker rounded w-32"></div>
                <div className="h-4 bg-surface-darker rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Website Metrics Summary */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-bl from-chart-primary/8 via-chart-secondary/8 via-chart-tertiary/8 to-chart-quaternary/8 rounded-2xl blur-sm"></div>
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6 p-7 rounded-2xl bg-gradient-to-bl from-surface-darker/60 to-surface-darker/40 border border-border-subtle/80 backdrop-blur-md">
          <div className="text-center space-y-3 group">
            <div className="text-2xl lg:text-3xl font-bold text-chart-primary tracking-tight group-hover:scale-105 transition-transform duration-200">
              {websiteData.overallMetrics.totalSessions.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-bone-white/70 uppercase tracking-wider">Sesiones</div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-chart-primary/60 to-chart-primary/20 rounded-full mx-auto"></div>
          </div>
          <div className="text-center space-y-3 group">
            <div className="text-2xl lg:text-3xl font-bold text-chart-secondary tracking-tight group-hover:scale-105 transition-transform duration-200">
              {websiteData.overallMetrics.overallConversionRate}%
            </div>
            <div className="text-xs font-semibold text-bone-white/70 uppercase tracking-wider">Conversión</div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-chart-secondary/60 to-chart-secondary/20 rounded-full mx-auto"></div>
          </div>
          <div className="text-center space-y-3 group">
            <div className="text-2xl lg:text-3xl font-bold text-chart-tertiary tracking-tight group-hover:scale-105 transition-transform duration-200">
              {formatDuration(websiteData.overallMetrics.avgSessionDuration)}
            </div>
            <div className="text-xs font-semibold text-bone-white/70 uppercase tracking-wider">Duración</div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-chart-tertiary/60 to-chart-tertiary/20 rounded-full mx-auto"></div>
          </div>
          <div className="text-center space-y-3 group">
            <div className="text-2xl lg:text-3xl font-bold text-chart-quaternary tracking-tight group-hover:scale-105 transition-transform duration-200">
              {websiteData.overallMetrics.bounceRate}%
            </div>
            <div className="text-xs font-semibold text-bone-white/70 uppercase tracking-wider">Rebote</div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-chart-quaternary/60 to-chart-quaternary/20 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Traffic Sources */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-chart-primary/20 flex items-center justify-center">
            <Globe className="w-4 h-4 text-chart-primary" />
          </div>
          <h4 className="text-lg font-bold text-bone-white tracking-tight">Fuentes de Tráfico</h4>
        </div>
        {websiteData.trafficSources.map((source, index) => {
          const color = index === 0 ? '#4285F4' : index === 1 ? '#34A853' : index === 2 ? '#EA4335' : index === 3 ? '#FBBC05' : '#9AA0A6'
          return (
            <div
              key={source.source}
              className="group p-5 lg:p-6 rounded-2xl bg-gradient-to-r from-surface-darker/40 to-surface-darker/25 hover:from-surface-darker/60 hover:to-surface-darker/45 transition-all duration-500 border border-border-subtle/60 hover:border-border-subtle hover:shadow-xl hover:shadow-black/20 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-6 h-6 rounded-full shadow-xl transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 16px ${color}50, 0 0 4px ${color}80`
                      }}
                    ></div>
                    <span className="text-lg font-bold text-white tracking-tight">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-8 text-sm text-bone-white/70 mt-2">
                    <span className="font-semibold text-bone-white/90">{source.sessions.toLocaleString()} sesiones</span>
                    <span className="hidden lg:inline font-medium">{source.percentage}%</span>
                    <span className="hidden xl:inline font-medium bg-surface-darker/50 px-2 py-1 rounded-md">{source.conversionRate}% conv.</span>
                  </div>
                </div>
                <div className="text-right space-y-2 px-4 py-3 rounded-xl bg-chart-success/10 border border-chart-success/30 group-hover:border-chart-success/50 transition-all duration-300">
                  <div className="text-xl font-bold text-chart-success tracking-tight drop-shadow-lg">
                    {source.conversions}
                  </div>
                  <div className="text-xs font-semibold text-bone-white/60 uppercase tracking-wider">conversiones</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enhanced Top Pages */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-chart-quaternary/20 flex items-center justify-center">
            <Eye className="w-4 h-4 text-chart-quaternary" />
          </div>
          <h4 className="text-lg font-bold text-bone-white tracking-tight">Páginas Principales</h4>
        </div>
        {websiteData.topPages.slice(0, 4).map((page, index) => (
          <div
            key={page.page}
            className="group p-5 lg:p-6 rounded-2xl bg-gradient-to-r from-surface-darker/40 to-surface-darker/25 hover:from-surface-darker/60 hover:to-surface-darker/45 transition-all duration-500 border border-border-subtle/60 hover:border-border-subtle hover:shadow-xl hover:shadow-black/20 backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chart-quaternary/30 to-chart-quaternary/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-base font-bold text-chart-quaternary tracking-tight">#{index + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-lg font-bold text-white truncate block tracking-tight">{page.title}</span>
                    <span className="text-sm text-chart-quaternary/80 font-mono bg-surface-darker/50 px-2 py-1 rounded-md inline-block mt-1">{page.page}</span>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-sm text-bone-white/70 ml-14 mt-2">
                  <span className="font-semibold text-bone-white/90">{page.pageviews.toLocaleString()} vistas</span>
                  <span className="hidden lg:inline font-medium">{formatDuration(page.avgTimeOnPage)}</span>
                  <span className="hidden xl:inline font-medium">{page.bounceRate}% rebote</span>
                </div>
              </div>
              <div className="text-right space-y-2 px-4 py-3 rounded-xl bg-chart-info/10 border border-chart-info/30 group-hover:border-chart-info/50 transition-all duration-300">
                <div className="text-xl font-bold text-chart-info tracking-tight drop-shadow-lg">
                  {page.conversions}
                </div>
                <div className="text-xs font-semibold text-bone-white/60 uppercase tracking-wider">conversiones</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Website Performance Insight */}
      <div className="mt-6 relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-chart-quaternary/30 to-chart-primary/30 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
        <div className="relative p-5 lg:p-6 rounded-2xl bg-gradient-to-r from-chart-quaternary/10 to-chart-primary/10 border border-chart-quaternary/30 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-chart-quaternary/30 to-chart-quaternary/20 flex items-center justify-center shadow-lg">
              <Eye className="w-5 h-5 text-chart-quaternary" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="text-base font-bold text-chart-quaternary tracking-tight">📊 Insight de Website</div>
                <div className="px-2 py-0.5 bg-chart-quaternary/20 rounded-full text-xs font-semibold text-chart-quaternary">Traffic</div>
              </div>
              <div className="text-bone-white text-sm leading-relaxed">
                <strong className="text-chart-primary">Búsqueda orgánica</strong> genera <span className="text-chart-success font-bold">52% del tráfico</span>. La página de <strong className="text-chart-quaternary">propiedades</strong> tiene la mejor conversión con <span className="text-chart-info font-bold">38 leads</span>.
              </div>
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

export default function MarketingAnalytics() {
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

  // ✅ REAL DATA from AnalyticsService.getDashboardStats()
  const marketingKPIs: MarketingKPIs = React.useMemo(() => {
    if (!dashboardData) {
      return {
        totalLeads: { value: 0, change: 0, cost: 0 },
        leadQuality: { value: 0, change: 0, benchmark: 65 },
        costPerLead: { value: 0, change: 0, target: 500 },
        websiteTraffic: { value: 0, change: 0, conversionRate: 0 }
      }
    }

    const totalLeads = dashboardData.total_leads || 0
    const totalSessions = dashboardData.total_sessions || 0
    const totalCost = 85000 // TODO Phase 3: Get from campaign_stats.cost
    const costPerLead = totalLeads > 0 ? Math.round(totalCost / totalLeads) : 0

    return {
      totalLeads: {
        value: totalLeads, // ✅ Real from analytics_lead_generation
        change: 0, // TODO Phase 2: Calculate trend from daily_stats
        cost: totalCost // TODO Phase 3: Sum from campaign_stats table
      },
      leadQuality: {
        value: 0, // ❌ Phase 3: Implement lead scoring algorithm
        change: 0,
        benchmark: 65
      },
      costPerLead: {
        value: costPerLead, // ⏸️ Calculated: cost / leads
        change: 0, // TODO Phase 2: Calculate trend
        target: 500
      },
      websiteTraffic: {
        value: totalSessions, // ✅ Real from analytics_sessions
        change: 0, // TODO Phase 2: Calculate trend
        conversionRate: dashboardData.conversion_rate || 0 // ✅ Real
      }
    }
  }, [dashboardData])

  // Breadcrumbs
  const breadcrumbs = buildAnalyticsBreadcrumbs('marketing', 'Marketing & Leads')

  // Enhanced Header actions with better accessibility
  const headerActions = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
      <div className="flex items-center gap-3 text-sm text-bone-white/70 order-2 sm:order-1">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-darker/40 border border-border-subtle/30">
          <Clock className="w-4 h-4 text-chart-quaternary" />
          <span className="hidden sm:inline font-medium">Última actualización: <span className="text-bone-white font-semibold">{lastRefresh.toLocaleTimeString('es-AR')}</span></span>
          <span className="sm:hidden font-medium text-bone-white">{lastRefresh.toLocaleTimeString('es-AR', { timeStyle: 'short' })}</span>
        </div>
        {realtimeConnected && (
          <Badge variant="outline" className="text-chart-success border-chart-success/40 bg-chart-success/5 px-3 py-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-chart-success rounded-full animate-pulse shadow-lg shadow-chart-success/50"></div>
              <span className="font-semibold text-xs uppercase tracking-wider">{isWebSocket ? 'WebSocket' : 'Polling'}</span>
            </div>
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3 order-1 sm:order-2">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32 sm:w-36 filter-input bg-surface-darker/60 border-border-subtle/60 hover:border-border-subtle focus:border-chart-primary/50 focus:ring-chart-primary/20">
            <SelectValue className="font-semibold" />
          </SelectTrigger>
          <SelectContent className="filter-panel bg-surface-darker/95 border-border-subtle/60 backdrop-blur-md">
            {PERIOD_OPTIONS.map(period => (
              <SelectItem key={period.value} value={period.value} className="hover:bg-chart-primary/10 focus:bg-chart-primary/10">
                <span className="font-medium">{period.label}</span>
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
          className="gap-2 bg-chart-primary/10 border-chart-primary/40 text-chart-primary hover:bg-chart-primary/20 hover:border-chart-primary/60 focus:ring-chart-primary/30 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2"
          aria-label="Actualizar datos del dashboard"
        >
          <RefreshCw className={`w-4 h-4 ${dashboardLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline font-semibold">Actualizar</span>
        </Button>
      </div>
    </div>
  )

  return (
    <AnalyticsDashboardLayout
      title="Marketing & Leads"
      subtitle="Análisis de generación de leads, canales y ROI de marketing"
      breadcrumbs={breadcrumbs}
      actions={headerActions}
      loading={dashboardLoading}
      className="space-y-dashboard"
    >
      {/* Marketing KPI Cards Row - Enhanced Visual Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
        {/* Total Leads Generated - Primary Focus */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-chart-primary/50 to-chart-primary/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative">
            <KPICard
              title="Leads Generados"
              value={marketingKPIs.totalLeads.value}
              format="number"
              trend={{
                value: marketingKPIs.totalLeads.change,
                period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
                direction: marketingKPIs.totalLeads.change > 0 ? 'positive' : 'negative'
              }}
              icon={Users}
              color="primary"
              size="lg"
              description={`Inversión: ${new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 0
              }).format(marketingKPIs.totalLeads.cost)}`}
              className="border-chart-primary/40 bg-gradient-to-br from-chart-primary/5 to-transparent"
            />
          </div>
        </div>

        {/* Lead Quality Score - Enhanced */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-chart-secondary/40 to-chart-secondary/20 rounded-2xl blur opacity-60 group-hover:opacity-90 transition duration-300"></div>
          <div className="relative">
            <KPICard
              title="Calidad de Leads"
              value={marketingKPIs.leadQuality.value}
              format="percentage"
              trend={{
                value: marketingKPIs.leadQuality.change,
                period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
                direction: marketingKPIs.leadQuality.change > 0 ? 'positive' : 'negative'
              }}
              icon={Target}
              color="secondary"
              size="lg"
              description={`Benchmark del sector: ${marketingKPIs.leadQuality.benchmark}%`}
              className="border-chart-secondary/40 bg-gradient-to-br from-chart-secondary/5 to-transparent"
            />
          </div>
        </div>

        {/* Cost Per Lead - Enhanced */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-chart-success/40 to-chart-success/20 rounded-2xl blur opacity-60 group-hover:opacity-90 transition duration-300"></div>
          <div className="relative">
            <KPICard
              title="Costo por Lead"
              value={marketingKPIs.costPerLead.value}
              format="currency"
              trend={{
                value: marketingKPIs.costPerLead.change,
                period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
                direction: marketingKPIs.costPerLead.change < 0 ? 'positive' : 'negative'
              }}
              icon={DollarSign}
              color="tertiary"
              size="lg"
              description={`Meta: ${new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 0
              }).format(marketingKPIs.costPerLead.target)}`}
              className="border-chart-success/40 bg-gradient-to-br from-chart-success/5 to-transparent"
            />
          </div>
        </div>

        {/* Website Traffic - Enhanced */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-chart-info/40 to-chart-info/20 rounded-2xl blur opacity-60 group-hover:opacity-90 transition duration-300"></div>
          <div className="relative">
            <KPICard
              title="Tráfico Web"
              value={marketingKPIs.websiteTraffic.value}
              format="number"
              trend={{
                value: marketingKPIs.websiteTraffic.change,
                period: `vs ${currentPeriod.label.toLowerCase()} anterior`,
                direction: marketingKPIs.websiteTraffic.change > 0 ? 'positive' : 'negative'
              }}
              icon={Globe}
              color="quaternary"
              size="lg"
              description={`Conversión: ${marketingKPIs.websiteTraffic.conversionRate}%`}
              className="border-chart-info/40 bg-gradient-to-br from-chart-info/5 to-transparent"
            />
          </div>
        </div>
      </div>

      {/* Analytics Widgets Section - Enhanced Layout */}
      <div className="space-y-10 mt-12">
        {/* Channel Performance - Enhanced Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-chart-secondary/30 to-chart-secondary/10 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
          <Card className="relative widget-container border-chart-secondary/30 bg-gradient-to-br from-chart-secondary/[0.02] to-transparent backdrop-blur-sm">
            <CardHeader className="widget-header pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-chart-secondary/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-chart-secondary" />
                  </div>
                  <div>
                    <CardTitle className="widget-title text-xl font-bold text-bone-white">
                      Channel Performance
                    </CardTitle>
                    <p className="text-sm text-subtle-gray mt-1">Análisis de rendimiento por canal de marketing</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs bg-chart-secondary/10 text-chart-secondary border-chart-secondary/30 px-3 py-1">
                  ROI & Costos
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="widget-content pt-0">
              <ChannelPerformanceWidget period={selectedPeriod} loading={dashboardLoading} />
            </CardContent>
          </Card>
        </div>

        {/* Campaign ROI Analysis - Enhanced Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-chart-tertiary/30 to-chart-tertiary/10 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
          <Card className="relative widget-container border-chart-tertiary/30 bg-gradient-to-br from-chart-tertiary/[0.02] to-transparent backdrop-blur-sm">
            <CardHeader className="widget-header pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-chart-tertiary/20 flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-chart-tertiary" />
                  </div>
                  <div>
                    <CardTitle className="widget-title text-xl font-bold text-bone-white">
                      Campaign ROI Analysis
                    </CardTitle>
                    <p className="text-sm text-subtle-gray mt-1">Rendimiento detallado de campañas activas</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs bg-chart-tertiary/10 text-chart-tertiary border-chart-tertiary/30 px-3 py-1">
                  UTM Tracking
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="widget-content pt-0">
              <CampaignROIWidget period={selectedPeriod} loading={dashboardLoading} />
            </CardContent>
          </Card>
        </div>

        {/* Website Analytics - Enhanced Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-chart-quaternary/30 to-chart-quaternary/10 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
          <Card className="relative widget-container border-chart-quaternary/30 bg-gradient-to-br from-chart-quaternary/[0.02] to-transparent backdrop-blur-sm">
            <CardHeader className="widget-header pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-chart-quaternary/20 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-chart-quaternary" />
                  </div>
                  <div>
                    <CardTitle className="widget-title text-xl font-bold text-bone-white">
                      Website Analytics
                    </CardTitle>
                    <p className="text-sm text-subtle-gray mt-1">Métricas de tráfico web y engagement</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs bg-chart-quaternary/10 text-chart-quaternary border-chart-quaternary/30 px-3 py-1">
                  Traffic & Engagement
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="widget-content pt-0">
              <WebsiteAnalyticsWidget period={selectedPeriod} loading={dashboardLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AnalyticsDashboardLayout>
  )
}