// =====================================================================================
// MARCONI INMOBILIARIA - REACT QUERY CONFIGURATION
// =====================================================================================
// Configuración optimizada de React Query para analytics dashboard
// Incluye cache strategies, error handling y performance optimizations
// =====================================================================================

import { QueryClient } from '@tanstack/react-query'

// =====================================================================================
// QUERY CLIENT CONFIGURATION
// =====================================================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache Configuration
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (formerly cacheTime)

      // Error Handling
      retry: (failureCount, error: any) => {
        // Don't retry for 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Performance
      refetchOnWindowFocus: false, // Disable refetch on window focus for better UX
      refetchOnReconnect: 'always', // Always refetch when coming back online
      refetchOnMount: true, // Refetch when component mounts
    },
    mutations: {
      // Error handling for mutations
      retry: false, // Don't retry mutations by default
      onError: (error) => {
        console.error('Mutation error:', error)
        // Could add toast notification here
      },
    },
  },
})

// =====================================================================================
// QUERY KEYS - Centralized key management
// =====================================================================================

export const queryKeys = {
  // Analytics Dashboard
  analytics: {
    all: ['analytics'] as const,
    dashboard: (period: string) => ['analytics', 'dashboard', period] as const,
    overview: (period: string) => ['analytics', 'overview', period] as const,
  },

  // Property Metrics
  properties: {
    all: ['properties'] as const,
    metrics: (id: number, daysBack: number) =>
      ['properties', 'metrics', id, daysBack] as const,
    performance: (period: string) =>
      ['properties', 'performance', period] as const,
    rankings: (period: string, limit: number) =>
      ['properties', 'rankings', period, limit] as const,
  },

  // Lead Analytics
  leads: {
    all: ['leads'] as const,
    analytics: (period: string) => ['leads', 'analytics', period] as const,
    sources: (period: string) => ['leads', 'sources', period] as const,
    conversion: (period: string) => ['leads', 'conversion', period] as const,
  },

  // Campaign & Marketing
  campaigns: {
    all: ['campaigns'] as const,
    performance: (period: string) => ['campaigns', 'performance', period] as const,
    roi: (period: string) => ['campaigns', 'roi', period] as const,
  },

  // Real-time data (shorter cache)
  realtime: {
    all: ['realtime'] as const,
    active: () => ['realtime', 'active'] as const,
    events: () => ['realtime', 'events'] as const,
  },
} as const

// =====================================================================================
// CACHE STRATEGIES - Different strategies for different data types
// =====================================================================================

export const cacheStrategies = {
  // Fast-changing data (real-time metrics)
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  },

  // Medium-changing data (daily/weekly analytics)
  standard: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: false, // No auto-refetch
  },

  // Slow-changing data (configuration, static data)
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: false,
  },

  // Critical data (always fresh)
  critical: {
    staleTime: 0, // Always stale, always refetch
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
  },
} as const

// =====================================================================================
// QUERY INVALIDATION HELPERS
// =====================================================================================

export const invalidateQueries = {
  // Invalidate all analytics data
  allAnalytics: () => queryClient.invalidateQueries({
    queryKey: queryKeys.analytics.all
  }),

  // Invalidate analytics for specific period
  analyticsByPeriod: (period: string) => queryClient.invalidateQueries({
    queryKey: queryKeys.analytics.dashboard(period)
  }),

  // Invalidate property metrics
  propertyMetrics: (propertyId?: number) => {
    if (propertyId) {
      queryClient.invalidateQueries({
        queryKey: ['properties', 'metrics', propertyId]
      })
    } else {
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.all
      })
    }
  },

  // Invalidate lead analytics
  leadAnalytics: () => queryClient.invalidateQueries({
    queryKey: queryKeys.leads.all
  }),

  // Invalidate real-time data
  realtime: () => queryClient.invalidateQueries({
    queryKey: queryKeys.realtime.all
  }),

  // =====================================================================================
  // ADVANCED CACHE INVALIDATION STRATEGIES
  // =====================================================================================

  // Smart invalidation based on user actions
  onUserAction: (action: 'filter_change' | 'period_change' | 'property_view' | 'lead_generation') => {
    switch (action) {
      case 'filter_change':
        // Invalidate dashboard and analytics when filters change
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.properties.all })
        break

      case 'period_change':
        // Only invalidate analytics, properties metrics remain the same
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.leads.all })
        break

      case 'property_view':
        // Invalidate real-time data and potentially property rankings
        queryClient.invalidateQueries({ queryKey: queryKeys.realtime.all })
        queryClient.invalidateQueries({ queryKey: ['properties', 'rankings'] })
        break

      case 'lead_generation':
        // Invalidate leads and dashboard metrics
        queryClient.invalidateQueries({ queryKey: queryKeys.leads.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.realtime.all })
        break
    }
  },

  // Selective invalidation based on time sensitivity
  byPriority: (priority: 'critical' | 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'critical':
        // Invalidate real-time data immediately
        queryClient.invalidateQueries({ queryKey: queryKeys.realtime.all })
        break

      case 'high':
        // Invalidate dashboard and lead analytics
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.leads.all })
        break

      case 'medium':
        // Invalidate property metrics
        queryClient.invalidateQueries({ queryKey: queryKeys.properties.all })
        break

      case 'low':
        // Invalidate campaigns and static data
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all })
        break
    }
  },

  // Batch invalidation with debouncing
  batchInvalidate: (() => {
    let timeout: NodeJS.Timeout | null = null
    const pendingInvalidations = new Set<string>()

    return (queryKeys: string[], delay: number = 1000) => {
      // Add to pending
      queryKeys.forEach(key => pendingInvalidations.add(key))

      // Clear existing timeout
      if (timeout) {
        clearTimeout(timeout)
      }

      // Set new timeout
      timeout = setTimeout(() => {
        // Execute all pending invalidations
        Array.from(pendingInvalidations).forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] })
        })

        // Clear pending set
        pendingInvalidations.clear()
        timeout = null
      }, delay)
    }
  })(),

  // Cache warming strategies
  warmCache: {
    // Preload common dashboard periods
    dashboardPeriods: async () => {
      const periods = ['24h', '7d', '30d']
      await Promise.all(
        periods.map(period =>
          queryClient.prefetchQuery({
            queryKey: queryKeys.analytics.dashboard(period),
            queryFn: () => fetch(`/api/analytics/dashboard?period=${period}`).then(r => r.json())
          })
        )
      )
    },

    // Preload property rankings
    propertyRankings: async () => {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.properties.rankings('30d', 10),
        queryFn: () => fetch('/api/analytics/properties/rankings?period=30d&limit=10').then(r => r.json())
      })
    },

    // Preload lead analytics for current period
    leadAnalytics: async (period: string = '30d') => {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.leads.analytics(period),
        queryFn: () => fetch(`/api/analytics/leads/analytics?period=${period}`).then(r => r.json())
      })
    },
  },
} as const

// =====================================================================================
// ERROR HANDLING UTILITIES
// =====================================================================================

export interface ApiError {
  message: string
  status?: number
  code?: string
}

export const handleQueryError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      status: (error as any).status || 500,
      code: (error as any).code || 'UNKNOWN_ERROR',
    }
  }

  return {
    message: 'An unknown error occurred',
    status: 500,
    code: 'UNKNOWN_ERROR',
  }
}

// =====================================================================================
// CACHE WARMING - Preload critical data
// =====================================================================================

export const warmCache = {
  // Warm dashboard data for common periods
  dashboard: async () => {
    const periods = ['7d', '30d', '90d']
    const promises = periods.map(period =>
      queryClient.prefetchQuery({
        queryKey: queryKeys.analytics.dashboard(period),
        queryFn: () => fetch(`/api/analytics/dashboard?period=${period}`).then(r => r.json()),
        ...cacheStrategies.standard,
      })
    )
    await Promise.allSettled(promises)
  },

  // Warm property performance data
  properties: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.properties.performance('30d'),
      queryFn: () => fetch('/api/analytics/properties/performance?period=30d').then(r => r.json()),
      ...cacheStrategies.standard,
    })
  },
} as const

// =====================================================================================
// BACKGROUND SYNC - Keep data fresh in background
// =====================================================================================

export const backgroundSync = {
  start: () => {
    // Sync real-time data every 30 seconds
    setInterval(() => {
      invalidateQueries.realtime()
    }, 30 * 1000)

    // Sync dashboard data every 5 minutes
    setInterval(() => {
      invalidateQueries.allAnalytics()
    }, 5 * 60 * 1000)
  },

  stop: () => {
    // Clear intervals when not needed
    // Implementation would store interval IDs and clear them
  },
}

// =====================================================================================
// EXPORTS
// =====================================================================================

export {
  QueryClient,
  queryClient as default,
}

// Type exports for hooks
export type {
  QueryClient as TQueryClient,
  ApiError,
}