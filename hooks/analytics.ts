// =====================================================================================
// MARCONI INMOBILIARIA - ANALYTICS HOOKS BARREL EXPORT
// =====================================================================================
// Archivo barrel para exportar todos los hooks de analytics de manera centralizada
// Facilita la importación y mantiene una API limpia
// =====================================================================================

// =====================================================================================
// TRACKING HOOKS (Existing - Optimized)
// =====================================================================================

export { default as useAnalytics } from './useAnalytics'

// =====================================================================================
// DATA FETCHING HOOKS (New)
// =====================================================================================

// Dashboard & Overview
export {
  default as useAnalyticsDashboard,
  useRealTimeDashboard,
  useDashboardOverview,
  DASHBOARD_PERIODS,
  type DashboardMetrics,
  type DashboardPeriod,
  type UseDashboardOptions,
} from './useAnalyticsDashboard'

// Property Metrics
export {
  default as usePropertyMetrics,
  usePropertiesComparison,
  usePropertyRankings,
  usePropertyPerformanceOverview,
  type PropertyPerformance,
  type PropertyRanking,
  type UsePropertyMetricsOptions,
} from './usePropertyMetrics'

// Lead Analytics
export {
  default as useLeadAnalytics,
  useLeadSourcesPerformance,
  useConversionFunnel,
  useLeadQualityScoring,
  type LeadAnalytics,
  type LeadSourcePerformance,
  type ConversionFunnel,
  type UseLeadAnalyticsOptions,
} from './useLeadAnalytics'

// Real-time Updates
export {
  default as useRealTimeUpdates,
  useActiveUsers,
  useLeadNotifications,
  type RealTimeMetrics,
  type UseRealTimeOptions,
  type RealTimeEvent,
} from './useRealTimeUpdates'

// =====================================================================================
// STATE MANAGEMENT HOOKS (Phase 2)
// =====================================================================================

// Global store
export {
  useAnalyticsStore,
  useAnalyticsFilters,
  useUserPreferences,
  useDashboardState,
  useFilterActions,
  type AnalyticsFilters,
  type UserPreferences,
  type DashboardState,
} from '../stores/analytics-store'

// Optimistic updates
export {
  default as useOptimisticUpdates,
  usePropertyOptimisticUpdates,
  useDashboardOptimisticUpdates,
} from './useOptimisticUpdates'

// =====================================================================================
// LAYOUT & UI HOOKS (From Phase 1)
// =====================================================================================

export { default as useAnalyticsLayout } from './useAnalyticsLayout'
export { default as useResponsive } from './useResponsive'
export { default as useSidebar } from './useSidebar'
export { default as useFilters } from './useFilters'

// =====================================================================================
// UTILITY FUNCTIONS & CONSTANTS
// =====================================================================================

// Export query configuration and utilities
export {
  queryKeys,
  invalidateQueries,
  cacheStrategies,
  type ApiError,
} from '../lib/react-query-config'

// =====================================================================================
// HOOK COMPOSITION UTILITIES
// =====================================================================================

/**
 * Hook composition for complete dashboard data
 * Combines dashboard overview, real-time updates, and property metrics with store integration
 */
export function useCompleteDashboard(options: {
  period?: string
  autoRefresh?: boolean
  enableRealTime?: boolean
} = {}) {
  const store = useAnalyticsStore()
  const optimistic = useOptimisticUpdates()

  const {
    period = store.filters.period,
    autoRefresh = store.preferences.autoRefresh,
    enableRealTime = true,
  } = options

  const dashboard = useAnalyticsDashboard({
    period,
    autoRefresh,
    refreshInterval: store.preferences.refreshInterval
  })
  const realTime = useRealTimeUpdates({
    enabled: enableRealTime,
    enableNotifications: store.preferences.notificationsEnabled
  })
  const propertyRankings = usePropertyRankings(period, 5)

  return {
    dashboard,
    realTime,
    propertyRankings,
    isLoading: dashboard.isLoading || realTime.isLoading || propertyRankings.isLoading,
    hasError: dashboard.isError || realTime.isError || propertyRankings.isError,
    refetchAll: () => {
      dashboard.refetch()
      realTime.refetch()
      propertyRankings.refetch()
    },
    // Store actions
    store,
    optimistic,
  }
}

/**
 * Hook composition for marketing analytics
 * Combines lead analytics, source performance, and funnel analysis
 */
export function useMarketingAnalytics(period: string = '30d') {
  const leadAnalytics = useLeadAnalytics({ period })
  const sourcesPerformance = useLeadSourcesPerformance(period)
  const conversionFunnel = useConversionFunnel(period)
  const qualityScoring = useLeadQualityScoring(period)

  return {
    leadAnalytics,
    sourcesPerformance,
    conversionFunnel,
    qualityScoring,
    isLoading: leadAnalytics.isLoading || sourcesPerformance.isLoading || conversionFunnel.isLoading,
    hasError: leadAnalytics.isError || sourcesPerformance.isError || conversionFunnel.isError,
    refetchAll: () => {
      leadAnalytics.refetch()
      sourcesPerformance.refetch()
      conversionFunnel.refetch()
    },
  }
}

/**
 * Hook composition for property analytics
 * Combines property performance, rankings, and comparisons
 */
export function usePropertyAnalytics(options: {
  propertyIds?: number[]
  period?: string
  includeComparison?: boolean
} = {}) {
  const {
    propertyIds = [],
    period = '30d',
    includeComparison = false,
  } = options

  const overview = usePropertyPerformanceOverview(period)
  const rankings = usePropertyRankings(period, 10)
  const comparison = usePropertiesComparison(
    includeComparison ? propertyIds : [],
    30
  )

  return {
    overview,
    rankings,
    comparison: includeComparison ? comparison : null,
    isLoading: overview.isLoading || rankings.isLoading || (includeComparison && comparison.isLoading),
    hasError: overview.isError || rankings.isError || (includeComparison && comparison.isError),
    refetchAll: () => {
      overview.refetch()
      rankings.refetch()
      if (includeComparison) {
        comparison.refetchAll()
      }
    },
  }
}

// =====================================================================================
// TYPE AGGREGATIONS
// =====================================================================================

// Re-export all types for convenience
export type {
  // From useAnalytics (existing)
  LeadSourceCode,
} from '../types/analytics'

// Aggregate type for complete analytics data
export interface CompleteAnalyticsData {
  dashboard: DashboardMetrics
  realTime: RealTimeMetrics
  properties: PropertyPerformance[]
  leads: LeadAnalytics
  funnel: ConversionFunnel
}

// =====================================================================================
// CONSTANTS
// =====================================================================================

export const ANALYTICS_PERIODS = [
  { value: '24h', label: 'Últimas 24 horas' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '90d', label: 'Últimos 90 días' },
  { value: '1y', label: 'Último año' },
] as const

export const REFRESH_INTERVALS = {
  realTime: 30 * 1000,      // 30 seconds
  dashboard: 5 * 60 * 1000, // 5 minutes
  properties: 2 * 60 * 1000, // 2 minutes
  leads: 5 * 60 * 1000,     // 5 minutes
} as const

// =====================================================================================
// DEPRECATION NOTICES
// =====================================================================================

/**
 * @deprecated Use useAnalyticsDashboard instead
 * Legacy hook maintained for backward compatibility
 */
export function useLegacyAnalytics() {
  console.warn('useLegacyAnalytics is deprecated. Use useAnalyticsDashboard instead.')
  return useAnalyticsDashboard()
}