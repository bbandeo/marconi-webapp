"use client"

// =====================================================================================
// MARCONI INMOBILIARIA - ANALYTICS DASHBOARD HOOK
// =====================================================================================
// Hook especializado para data fetching del dashboard analytics
// Integra con React Query para cache optimizado y real-time updates
// =====================================================================================

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { queryKeys, cacheStrategies, handleQueryError, type ApiError } from '@/lib/react-query-config'
import type { DashboardStats } from '@/types/analytics'

// =====================================================================================
// TYPES
// =====================================================================================

export interface DashboardPeriod {
  value: string
  label: string
  days: number
}

export interface DashboardMetrics {
  overview: {
    totalViews: number
    uniqueSessions: number
    totalLeads: number
    conversionRate: number
    avgSessionDuration: number
  }
  trends: {
    viewsChange: number
    leadsChange: number
    conversionChange: number
    sessionsChange: number
  }
  topProperties: Array<{
    id: number
    title: string
    views: number
    leads: number
    conversionRate: number
  }>
  leadSources: Array<{
    source: string
    count: number
    percentage: number
    conversionRate: number
  }>
  recentActivity: Array<{
    type: 'view' | 'lead' | 'interaction'
    propertyId?: number
    propertyTitle?: string
    timestamp: string
    source?: string
  }>
}

export interface UseDashboardOptions {
  period?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

// =====================================================================================
// CONSTANTS
// =====================================================================================

export const DASHBOARD_PERIODS: DashboardPeriod[] = [
  { value: '24h', label: 'Últimas 24 horas', days: 1 },
  { value: '7d', label: 'Últimos 7 días', days: 7 },
  { value: '30d', label: 'Últimos 30 días', days: 30 },
  { value: '90d', label: 'Últimos 90 días', days: 90 },
  { value: '1y', label: 'Último año', days: 365 },
] as const

// =====================================================================================
// MAIN HOOK
// =====================================================================================

export function useAnalyticsDashboard(options: UseDashboardOptions = {}) {
  const {
    period = '30d',
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
  } = options

  // Main dashboard query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  }: UseQueryResult<DashboardMetrics, ApiError> = useQuery({
    queryKey: queryKeys.analytics.dashboard(period),
    queryFn: async (): Promise<DashboardMetrics> => {
      const response = await fetch(`/api/analytics/dashboard?period=${period}`)

      if (!response.ok) {
        throw new Error(`Dashboard fetch failed: ${response.status} ${response.statusText}`)
      }

      const rawData = await response.json()

      if (!rawData.success) {
        throw new Error(rawData.error || 'Dashboard data fetch failed')
      }

      // Transform API response to dashboard metrics
      return transformDashboardData(rawData.data, period)
    },

    // Cache strategy based on period
    ...(period === '24h' ? cacheStrategies.realtime : cacheStrategies.standard),

    // Auto-refresh if enabled
    refetchInterval: autoRefresh ? refreshInterval : false,
    refetchOnWindowFocus: period === '24h', // Only for real-time data

    // Error handling
    throwOnError: false,
    retry: (failureCount, error: any) => {
      // Don't retry client errors
      if (error?.status >= 400 && error?.status < 500) {
        return false
      }
      return failureCount < 3
    },
  })

  // Computed properties
  const isRealTime = period === '24h'
  const hasData = !!data && !isLoading
  const isEmpty = hasData && data.overview.totalViews === 0

  return {
    // Data
    data,
    metrics: data,

    // States
    isLoading,
    isError,
    error: error ? handleQueryError(error) : null,
    isRefetching,
    hasData,
    isEmpty,
    isRealTime,

    // Actions
    refetch,
    period,

    // Helpers
    formatMetric: (value: number, type: 'number' | 'currency' | 'percentage' = 'number') =>
      formatMetricValue(value, type),
    getTrendDirection: (value: number) =>
      value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral',
  }
}

// =====================================================================================
// HELPER FUNCTIONS
// =====================================================================================

function transformDashboardData(rawData: any, period: string): DashboardMetrics {
  return {
    overview: {
      totalViews: rawData.total_views || 0,
      uniqueSessions: rawData.unique_sessions || 0,
      totalLeads: rawData.total_leads || 0,
      conversionRate: rawData.conversion_rate || 0,
      avgSessionDuration: rawData.avg_session_duration || 0,
    },
    trends: {
      viewsChange: rawData.views_change || 0,
      leadsChange: rawData.leads_change || 0,
      conversionChange: rawData.conversion_change || 0,
      sessionsChange: rawData.sessions_change || 0,
    },
    topProperties: (rawData.top_properties || []).map((prop: any) => ({
      id: prop.id,
      title: prop.title,
      views: prop.views || 0,
      leads: prop.leads || 0,
      conversionRate: prop.conversion_rate || 0,
    })),
    leadSources: (rawData.lead_sources || []).map((source: any) => ({
      source: source.display_name || source.name,
      count: source.count || 0,
      percentage: source.percentage || 0,
      conversionRate: source.conversion_rate || 0,
    })),
    recentActivity: (rawData.recent_activity || []).map((activity: any) => ({
      type: activity.type,
      propertyId: activity.property_id,
      propertyTitle: activity.property_title,
      timestamp: activity.timestamp,
      source: activity.source,
    })),
  }
}

function formatMetricValue(value: number, type: 'number' | 'currency' | 'percentage' = 'number'): string {
  if (isNaN(value) || value === null || value === undefined) {
    return '0'
  }

  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)

    case 'percentage':
      return new Intl.NumberFormat('es-AR', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(value / 100)

    case 'number':
    default:
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`
      }
      return new Intl.NumberFormat('es-AR').format(value)
  }
}

// =====================================================================================
// ADDITIONAL HOOKS
// =====================================================================================

// Hook for real-time dashboard updates
export function useRealTimeDashboard() {
  return useAnalyticsDashboard({
    period: '24h',
    autoRefresh: true,
    refreshInterval: 30 * 1000, // 30 seconds
  })
}

// Hook for dashboard overview with multiple periods
export function useDashboardOverview() {
  const current = useAnalyticsDashboard({ period: '30d' })
  const previous = useAnalyticsDashboard({ period: '60d' }) // For comparison

  return {
    current,
    previous,
    comparison: {
      viewsChange: calculateChange(current.data?.overview.totalViews, previous.data?.overview.totalViews),
      leadsChange: calculateChange(current.data?.overview.totalLeads, previous.data?.overview.totalLeads),
      conversionChange: calculateChange(current.data?.overview.conversionRate, previous.data?.overview.conversionRate),
    }
  }
}

function calculateChange(current?: number, previous?: number): number {
  if (!current || !previous || previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// =====================================================================================
// EXPORTS
// =====================================================================================

export default useAnalyticsDashboard
export type {
  DashboardMetrics,
  DashboardPeriod,
  UseDashboardOptions,
}