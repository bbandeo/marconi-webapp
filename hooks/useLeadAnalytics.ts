"use client"

// =====================================================================================
// MARCONI INMOBILIARIA - LEAD ANALYTICS HOOK
// =====================================================================================
// Hook especializado para análisis de leads y conversiones
// Incluye tracking de fuentes, ROI y análisis de funnel de conversión
// =====================================================================================

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { queryKeys, cacheStrategies, handleQueryError, type ApiError } from '@/lib/react-query-config'

// =====================================================================================
// TYPES
// =====================================================================================

export interface LeadAnalytics {
  overview: {
    totalLeads: number
    qualifiedLeads: number
    convertedLeads: number
    qualificationRate: number
    conversionRate: number
    avgLeadValue: number
    totalRevenue: number
  }
  trends: {
    leadsChange: number
    qualificationChange: number
    conversionChange: number
    revenueChange: number
  }
  funnel: {
    visitors: number
    propertyViews: number
    interactions: number
    leadGeneration: number
    qualification: number
    conversion: number
    dropoffRates: {
      visitorsToViews: number
      viewsToInteractions: number
      interactionsToLeads: number
      leadsToQualification: number
      qualificationToConversion: number
    }
  }
  sources: Array<{
    id: number
    name: string
    displayName: string
    category: string
    leadsCount: number
    qualifiedCount: number
    convertedCount: number
    qualificationRate: number
    conversionRate: number
    avgLeadValue: number
    costPerLead: number
    roi: number
  }>
  timeline: Array<{
    date: string
    leads: number
    qualified: number
    converted: number
    revenue: number
  }>
}

export interface LeadSourcePerformance {
  sourceId: number
  sourceName: string
  displayName: string
  category: string
  metrics: {
    totalLeads: number
    qualifiedLeads: number
    convertedLeads: number
    qualificationRate: number
    conversionRate: number
    avgLeadValue: number
    totalRevenue: number
    costPerLead: number
    roi: number
  }
  trends: {
    leadsChange: number
    conversionChange: number
    revenueChange: number
  }
  demographics: {
    deviceTypes: Array<{ type: string; count: number; percentage: number }>
    propertyTypes: Array<{ type: string; count: number; percentage: number }>
    timeDistribution: Array<{ hour: number; leads: number }>
  }
}

export interface ConversionFunnel {
  stages: Array<{
    name: string
    count: number
    percentage: number
    dropoffRate: number
  }>
  insights: Array<{
    stage: string
    issue: string
    recommendation: string
    priority: 'high' | 'medium' | 'low'
  }>
}

export interface UseLeadAnalyticsOptions {
  period?: string
  sourceId?: number
  includeRevenue?: boolean
  includeFunnel?: boolean
}

// =====================================================================================
// MAIN LEAD ANALYTICS HOOK
// =====================================================================================

export function useLeadAnalytics(options: UseLeadAnalyticsOptions = {}) {
  const {
    period = '30d',
    includeRevenue = true,
    includeFunnel = true,
  } = options

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  }: UseQueryResult<LeadAnalytics, ApiError> = useQuery({
    queryKey: queryKeys.leads.analytics(period),
    queryFn: async (): Promise<LeadAnalytics> => {
      const params = new URLSearchParams({
        period,
        include_revenue: includeRevenue.toString(),
        include_funnel: includeFunnel.toString(),
      })

      const response = await fetch(`/api/analytics/leads/analytics?${params}`)

      if (!response.ok) {
        throw new Error(`Lead analytics fetch failed: ${response.status}`)
      }

      const rawData = await response.json()

      if (!rawData.success) {
        throw new Error(rawData.error || 'Lead analytics fetch failed')
      }

      return transformLeadAnalytics(rawData.data)
    },

    ...cacheStrategies.standard,
    throwOnError: false,
  })

  return {
    data,
    analytics: data,
    isLoading,
    isError,
    error: error ? handleQueryError(error) : null,
    isRefetching,
    refetch,
    hasData: !!data && !isLoading,
    isEmpty: !!data && data.overview.totalLeads === 0,
  }
}

// =====================================================================================
// LEAD SOURCES PERFORMANCE HOOK
// =====================================================================================

export function useLeadSourcesPerformance(period: string = '30d') {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }: UseQueryResult<LeadSourcePerformance[], ApiError> = useQuery({
    queryKey: queryKeys.leads.sources(period),
    queryFn: async (): Promise<LeadSourcePerformance[]> => {
      const response = await fetch(`/api/analytics/leads/sources?period=${period}`)

      if (!response.ok) {
        throw new Error(`Lead sources fetch failed: ${response.status}`)
      }

      const rawData = await response.json()

      if (!rawData.success) {
        throw new Error(rawData.error || 'Lead sources fetch failed')
      }

      return (rawData.data || []).map(transformLeadSourcePerformance)
    },

    ...cacheStrategies.standard,
    throwOnError: false,
  })

  // Calculate best and worst performers
  const bestPerformer = data?.reduce((best, current) =>
    current.metrics.conversionRate > best.metrics.conversionRate ? current : best
  )

  const worstPerformer = data?.reduce((worst, current) =>
    current.metrics.conversionRate < worst.metrics.conversionRate ? current : worst
  )

  const highestROI = data?.reduce((highest, current) =>
    current.metrics.roi > highest.metrics.roi ? current : highest
  )

  return {
    sources: data || [],
    bestPerformer,
    worstPerformer,
    highestROI,
    isLoading,
    isError,
    error: error ? handleQueryError(error) : null,
    refetch,
    hasData: !!data && data.length > 0,
  }
}

// =====================================================================================
// CONVERSION FUNNEL HOOK
// =====================================================================================

export function useConversionFunnel(period: string = '30d') {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }: UseQueryResult<ConversionFunnel, ApiError> = useQuery({
    queryKey: queryKeys.leads.conversion(period),
    queryFn: async (): Promise<ConversionFunnel> => {
      const response = await fetch(`/api/analytics/leads/funnel?period=${period}`)

      if (!response.ok) {
        throw new Error(`Conversion funnel fetch failed: ${response.status}`)
      }

      const rawData = await response.json()

      if (!rawData.success) {
        throw new Error(rawData.error || 'Conversion funnel fetch failed')
      }

      return transformConversionFunnel(rawData.data)
    },

    ...cacheStrategies.standard,
    throwOnError: false,
  })

  // Calculate funnel efficiency
  const efficiency = data ? calculateFunnelEfficiency(data.stages) : 0
  const biggestDropoff = data ? findBiggestDropoff(data.stages) : null

  return {
    funnel: data,
    stages: data?.stages || [],
    insights: data?.insights || [],
    efficiency,
    biggestDropoff,
    isLoading,
    isError,
    error: error ? handleQueryError(error) : null,
    refetch,
    hasData: !!data,
  }
}

// =====================================================================================
// LEAD QUALITY SCORING HOOK
// =====================================================================================

export function useLeadQualityScoring(period: string = '30d') {
  const { data: leadAnalytics } = useLeadAnalytics({ period })
  const { sources } = useLeadSourcesPerformance(period)

  // Calculate lead quality scores
  const qualityScores = sources.map(source => {
    const qualityScore = calculateQualityScore({
      conversionRate: source.metrics.conversionRate,
      avgLeadValue: source.metrics.avgLeadValue,
      roi: source.metrics.roi,
      costPerLead: source.metrics.costPerLead,
    })

    return {
      sourceId: source.sourceId,
      sourceName: source.sourceName,
      displayName: source.displayName,
      qualityScore,
      grade: getQualityGrade(qualityScore),
      recommendation: getSourceRecommendation(qualityScore, source.metrics),
    }
  })

  return {
    scores: qualityScores,
    averageScore: qualityScores.reduce((sum, s) => sum + s.qualityScore, 0) / qualityScores.length,
    bestSources: qualityScores.filter(s => s.grade === 'A' || s.grade === 'B'),
    poorSources: qualityScores.filter(s => s.grade === 'D' || s.grade === 'F'),
  }
}

// =====================================================================================
// HELPER FUNCTIONS
// =====================================================================================

function transformLeadAnalytics(rawData: any): LeadAnalytics {
  return {
    overview: {
      totalLeads: rawData.total_leads || 0,
      qualifiedLeads: rawData.qualified_leads || 0,
      convertedLeads: rawData.converted_leads || 0,
      qualificationRate: rawData.qualification_rate || 0,
      conversionRate: rawData.conversion_rate || 0,
      avgLeadValue: rawData.avg_lead_value || 0,
      totalRevenue: rawData.total_revenue || 0,
    },
    trends: {
      leadsChange: rawData.leads_change || 0,
      qualificationChange: rawData.qualification_change || 0,
      conversionChange: rawData.conversion_change || 0,
      revenueChange: rawData.revenue_change || 0,
    },
    funnel: {
      visitors: rawData.funnel?.visitors || 0,
      propertyViews: rawData.funnel?.property_views || 0,
      interactions: rawData.funnel?.interactions || 0,
      leadGeneration: rawData.funnel?.lead_generation || 0,
      qualification: rawData.funnel?.qualification || 0,
      conversion: rawData.funnel?.conversion || 0,
      dropoffRates: rawData.funnel?.dropoff_rates || {},
    },
    sources: (rawData.sources || []).map((source: any) => ({
      id: source.id,
      name: source.name,
      displayName: source.display_name,
      category: source.category,
      leadsCount: source.leads_count || 0,
      qualifiedCount: source.qualified_count || 0,
      convertedCount: source.converted_count || 0,
      qualificationRate: source.qualification_rate || 0,
      conversionRate: source.conversion_rate || 0,
      avgLeadValue: source.avg_lead_value || 0,
      costPerLead: source.cost_per_lead || 0,
      roi: source.roi || 0,
    })),
    timeline: rawData.timeline || [],
  }
}

function transformLeadSourcePerformance(rawData: any): LeadSourcePerformance {
  return {
    sourceId: rawData.source_id,
    sourceName: rawData.source_name,
    displayName: rawData.display_name,
    category: rawData.category,
    metrics: {
      totalLeads: rawData.total_leads || 0,
      qualifiedLeads: rawData.qualified_leads || 0,
      convertedLeads: rawData.converted_leads || 0,
      qualificationRate: rawData.qualification_rate || 0,
      conversionRate: rawData.conversion_rate || 0,
      avgLeadValue: rawData.avg_lead_value || 0,
      totalRevenue: rawData.total_revenue || 0,
      costPerLead: rawData.cost_per_lead || 0,
      roi: rawData.roi || 0,
    },
    trends: {
      leadsChange: rawData.leads_change || 0,
      conversionChange: rawData.conversion_change || 0,
      revenueChange: rawData.revenue_change || 0,
    },
    demographics: {
      deviceTypes: rawData.device_types || [],
      propertyTypes: rawData.property_types || [],
      timeDistribution: rawData.time_distribution || [],
    },
  }
}

function transformConversionFunnel(rawData: any): ConversionFunnel {
  return {
    stages: rawData.stages || [],
    insights: rawData.insights || [],
  }
}

function calculateFunnelEfficiency(stages: ConversionFunnel['stages']): number {
  if (stages.length === 0) return 0
  const firstStage = stages[0]
  const lastStage = stages[stages.length - 1]
  return lastStage.count / firstStage.count * 100
}

function findBiggestDropoff(stages: ConversionFunnel['stages']) {
  let maxDropoff = 0
  let dropoffStage = null

  for (let i = 1; i < stages.length; i++) {
    const dropoff = stages[i].dropoffRate
    if (dropoff > maxDropoff) {
      maxDropoff = dropoff
      dropoffStage = {
        from: stages[i - 1].name,
        to: stages[i].name,
        rate: dropoff,
      }
    }
  }

  return dropoffStage
}

function calculateQualityScore(metrics: {
  conversionRate: number
  avgLeadValue: number
  roi: number
  costPerLead: number
}): number {
  // Weighted scoring algorithm
  const conversionWeight = 0.4
  const valueWeight = 0.3
  const roiWeight = 0.2
  const costWeight = 0.1

  const normalizedConversion = Math.min(metrics.conversionRate / 10, 1) // Normalize to 0-1
  const normalizedValue = Math.min(metrics.avgLeadValue / 1000000, 1) // Normalize to 0-1
  const normalizedROI = Math.min(metrics.roi / 500, 1) // Normalize to 0-1
  const normalizedCost = Math.max(1 - (metrics.costPerLead / 100000), 0) // Inverse for cost

  return (
    normalizedConversion * conversionWeight +
    normalizedValue * valueWeight +
    normalizedROI * roiWeight +
    normalizedCost * costWeight
  ) * 100
}

function getQualityGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

function getSourceRecommendation(score: number, metrics: LeadSourcePerformance['metrics']): string {
  if (score >= 80) {
    return 'Fuente excelente - aumentar inversión'
  } else if (score >= 60) {
    return 'Fuente buena - optimizar conversión'
  } else if (score >= 40) {
    return 'Fuente regular - mejorar calidad de leads'
  } else {
    return 'Fuente pobre - considerar eliminar o rediseñar'
  }
}

// =====================================================================================
// EXPORTS
// =====================================================================================

export default useLeadAnalytics
export type {
  LeadAnalytics,
  LeadSourcePerformance,
  ConversionFunnel,
  UseLeadAnalyticsOptions,
}