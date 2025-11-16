"use client"

// =====================================================================================
// MARCONI INMOBILIARIA - PROPERTY METRICS HOOK
// =====================================================================================
// Hook especializado para métricas de propiedades individuales y comparaciones
// Integra con React Query para cache optimizado y real-time updates
// =====================================================================================

import { useQuery, useQueries, UseQueryResult } from '@tanstack/react-query'
import { queryKeys, cacheStrategies, handleQueryError, type ApiError } from '@/lib/react-query-config'
import type { PropertyMetrics } from '@/types/analytics'

// =====================================================================================
// TYPES
// =====================================================================================

export interface PropertyPerformance {
  id: number
  title: string
  metrics: {
    totalViews: number
    uniqueSessions: number
    avgDuration: number
    totalInteractions: number
    leadsGenerated: number
    conversionRate: number
    bounceRate: number
  }
  trends: {
    viewsChange: number
    leadsChange: number
    conversionChange: number
  }
  engagement: {
    phoneClicks: number
    whatsappClicks: number
    emailClicks: number
    imageViews: number
    contactFormOpened: number
    contactFormSubmitted: number
  }
  demographics: {
    deviceTypes: Array<{ type: string; count: number; percentage: number }>
    referrerSources: Array<{ source: string; count: number; percentage: number }>
    timeDistribution: Array<{ hour: number; views: number }>
  }
}

export interface PropertyRanking {
  id: number
  title: string
  rank: number
  views: number
  leads: number
  conversionRate: number
  change: number
}

export interface UsePropertyMetricsOptions {
  daysBack?: number
  includeEngagement?: boolean
  includeDemographics?: boolean
  autoRefresh?: boolean
}

// =====================================================================================
// INDIVIDUAL PROPERTY METRICS HOOK
// =====================================================================================

export function usePropertyMetrics(
  propertyId: number,
  options: UsePropertyMetricsOptions = {}
) {
  const {
    daysBack = 30,
    includeEngagement = true,
    includeDemographics = false,
    autoRefresh = false,
  } = options

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  }: UseQueryResult<PropertyPerformance, ApiError> = useQuery({
    queryKey: queryKeys.properties.metrics(propertyId, daysBack),
    queryFn: async (): Promise<PropertyPerformance> => {
      const params = new URLSearchParams({
        days_back: daysBack.toString(),
        include_engagement: includeEngagement.toString(),
        include_demographics: includeDemographics.toString(),
      })

      const response = await fetch(`/api/analytics/property-metrics/${propertyId}?${params}`)

      if (!response.ok) {
        throw new Error(`Property metrics fetch failed: ${response.status}`)
      }

      const rawData = await response.json()

      if (!rawData.success) {
        throw new Error(rawData.error || 'Property metrics fetch failed')
      }

      return transformPropertyMetrics(rawData.data, propertyId)
    },

    // Cache strategy
    ...cacheStrategies.standard,

    // Auto-refresh if enabled
    refetchInterval: autoRefresh ? 2 * 60 * 1000 : false, // 2 minutes

    // Error handling
    enabled: !!propertyId && propertyId > 0,
    throwOnError: false,
  })

  return {
    data,
    metrics: data,
    isLoading,
    isError,
    error: error ? handleQueryError(error) : null,
    isRefetching,
    refetch,
    hasData: !!data && !isLoading,
    isEmpty: !!data && data.metrics.totalViews === 0,
  }
}

// =====================================================================================
// MULTIPLE PROPERTIES COMPARISON HOOK
// =====================================================================================

export function usePropertiesComparison(
  propertyIds: number[],
  daysBack: number = 30
) {
  const queries = useQueries({
    queries: propertyIds.map((id) => ({
      queryKey: queryKeys.properties.metrics(id, daysBack),
      queryFn: async () => {
        const response = await fetch(`/api/analytics/property-metrics/${id}?days_back=${daysBack}`)
        const data = await response.json()
        return data.success ? transformPropertyMetrics(data.data, id) : null
      },
      ...cacheStrategies.standard,
      enabled: !!id && id > 0,
    }))
  })

  const allData = queries.map((query, index) => ({
    propertyId: propertyIds[index],
    ...query,
  }))

  const isLoading = queries.some(query => query.isLoading)
  const isError = queries.some(query => query.isError)
  const hasData = queries.every(query => query.data)

  // Create comparison matrix
  const comparison = hasData ? createComparisonMatrix(queries.map(q => q.data!)) : null

  return {
    properties: allData,
    comparison,
    isLoading,
    isError,
    hasData,
    refetchAll: () => queries.forEach(query => query.refetch()),
  }
}

// =====================================================================================
// PROPERTY RANKINGS HOOK
// =====================================================================================

export function usePropertyRankings(period: string = '30d', limit: number = 10) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }: UseQueryResult<PropertyRanking[], ApiError> = useQuery({
    queryKey: queryKeys.properties.rankings(period, limit),
    queryFn: async (): Promise<PropertyRanking[]> => {
      const response = await fetch(
        `/api/analytics/properties/rankings?period=${period}&limit=${limit}`
      )

      if (!response.ok) {
        throw new Error(`Rankings fetch failed: ${response.status}`)
      }

      const rawData = await response.json()

      if (!rawData.success) {
        throw new Error(rawData.error || 'Rankings fetch failed')
      }

      return (rawData.data || []).map((item: any, index: number) => ({
        id: item.id,
        title: item.title,
        rank: index + 1,
        views: item.views || 0,
        leads: item.leads || 0,
        conversionRate: item.conversion_rate || 0,
        change: item.rank_change || 0,
      }))
    },

    ...cacheStrategies.standard,
    throwOnError: false,
  })

  return {
    rankings: data || [],
    isLoading,
    isError,
    error: error ? handleQueryError(error) : null,
    refetch,
    hasData: !!data && data.length > 0,
  }
}

// =====================================================================================
// PROPERTY PERFORMANCE OVERVIEW HOOK
// =====================================================================================

export function usePropertyPerformanceOverview(period: string = '30d') {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.properties.performance(period),
    queryFn: async () => {
      const response = await fetch(`/api/analytics/properties/performance?period=${period}`)
      const rawData = await response.json()

      if (!rawData.success) {
        throw new Error(rawData.error || 'Performance overview fetch failed')
      }

      return {
        totalProperties: rawData.data.total_properties || 0,
        activeProperties: rawData.data.active_properties || 0,
        avgViewsPerProperty: rawData.data.avg_views_per_property || 0,
        avgLeadsPerProperty: rawData.data.avg_leads_per_property || 0,
        topPerformers: rawData.data.top_performers || [],
        underPerformers: rawData.data.under_performers || [],
        insights: rawData.data.insights || [],
      }
    },

    ...cacheStrategies.standard,
    throwOnError: false,
  })

  return {
    overview: data,
    isLoading,
    isError,
    error: error ? handleQueryError(error) : null,
    refetch,
    hasData: !!data,
  }
}

// =====================================================================================
// HELPER FUNCTIONS
// =====================================================================================

function transformPropertyMetrics(rawData: any, propertyId: number): PropertyPerformance {
  return {
    id: propertyId,
    title: rawData.title || 'Propiedad sin título',
    metrics: {
      totalViews: rawData.total_views || 0,
      uniqueSessions: rawData.unique_sessions || 0,
      avgDuration: rawData.avg_duration || 0,
      totalInteractions: rawData.total_interactions || 0,
      leadsGenerated: rawData.leads_generated || 0,
      conversionRate: rawData.conversion_rate || 0,
      bounceRate: rawData.bounce_rate || 0,
    },
    trends: {
      viewsChange: rawData.views_change || 0,
      leadsChange: rawData.leads_change || 0,
      conversionChange: rawData.conversion_change || 0,
    },
    engagement: {
      phoneClicks: rawData.phone_clicks || 0,
      whatsappClicks: rawData.whatsapp_clicks || 0,
      emailClicks: rawData.email_clicks || 0,
      imageViews: rawData.image_views || 0,
      contactFormOpened: rawData.contact_form_opened || 0,
      contactFormSubmitted: rawData.contact_form_submitted || 0,
    },
    demographics: {
      deviceTypes: rawData.device_types || [],
      referrerSources: rawData.referrer_sources || [],
      timeDistribution: rawData.time_distribution || [],
    },
  }
}

function createComparisonMatrix(properties: PropertyPerformance[]) {
  if (properties.length === 0) return null

  const metrics = [
    'totalViews',
    'uniqueSessions',
    'leadsGenerated',
    'conversionRate',
  ] as const

  const comparison: Record<string, any> = {}

  metrics.forEach(metric => {
    const values = properties.map(p => p.metrics[metric])
    const max = Math.max(...values)
    const min = Math.min(...values)
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length

    comparison[metric] = {
      max,
      min,
      avg,
      leader: properties.find(p => p.metrics[metric] === max)?.id,
      values: properties.map(p => ({
        propertyId: p.id,
        value: p.metrics[metric],
        rank: values.sort((a, b) => b - a).indexOf(p.metrics[metric]) + 1,
      }))
    }
  })

  return comparison
}

// =====================================================================================
// EXPORTS
// =====================================================================================

export default usePropertyMetrics
export type {
  PropertyPerformance,
  PropertyRanking,
  UsePropertyMetricsOptions,
}