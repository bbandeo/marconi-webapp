"use client"

// =====================================================================================
// MARCONI INMOBILIARIA - OPTIMISTIC UPDATES HOOK
// =====================================================================================
// Hook para implementar optimistic updates en interacciones de analytics
// Mejora la UX con updates inmediatos mientras sincroniza en background
// =====================================================================================

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys, invalidateQueries } from '@/lib/react-query-config'
import { useAnalyticsStore } from '@/stores/analytics-store'

// =====================================================================================
// TYPES
// =====================================================================================

interface OptimisticUpdate<T = any> {
  queryKey: string[]
  updater: (oldData: T) => T
  rollback?: (oldData: T) => T
}

interface OptimisticAction {
  id: string
  timestamp: number
  updates: OptimisticUpdate[]
  onSuccess?: () => void
  onError?: (error: any) => void
}

// =====================================================================================
// MAIN HOOK
// =====================================================================================

export function useOptimisticUpdates() {
  const queryClient = useQueryClient()
  const store = useAnalyticsStore()

  // =====================================================================================
  // CORE OPTIMISTIC UPDATE FUNCTION
  // =====================================================================================

  const performOptimisticUpdate = useCallback(
    async <T = any>(
      action: OptimisticAction,
      asyncOperation: () => Promise<T>
    ): Promise<T> => {
      // Store previous data for rollback
      const previousDataMap = new Map()

      try {
        // Apply optimistic updates
        action.updates.forEach(({ queryKey, updater }) => {
          const previousData = queryClient.getQueryData(queryKey)
          if (previousData) {
            previousDataMap.set(queryKey, previousData)
            queryClient.setQueryData(queryKey, updater)
          }
        })

        // Perform actual operation
        const result = await asyncOperation()

        // On success, invalidate relevant queries to sync with server
        await Promise.all(
          action.updates.map(({ queryKey }) =>
            queryClient.invalidateQueries({ queryKey })
          )
        )

        action.onSuccess?.(result)
        return result

      } catch (error) {
        // Rollback optimistic updates on error
        action.updates.forEach(({ queryKey, rollback }) => {
          const previousData = previousDataMap.get(queryKey)
          if (previousData) {
            if (rollback) {
              queryClient.setQueryData(queryKey, rollback(previousData))
            } else {
              queryClient.setQueryData(queryKey, previousData)
            }
          }
        })

        action.onError?.(error)
        throw error
      }
    },
    [queryClient]
  )

  // =====================================================================================
  // SPECIFIC OPTIMISTIC ACTIONS
  // =====================================================================================

  // Property metrics optimistic update
  const updatePropertyMetrics = useCallback(
    async (propertyId: number, metricUpdate: any) => {
      const actionId = `property-metrics-${propertyId}-${Date.now()}`

      return performOptimisticUpdate(
        {
          id: actionId,
          timestamp: Date.now(),
          updates: [
            {
              queryKey: queryKeys.properties.metrics(propertyId, 30),
              updater: (oldData: any) => ({
                ...oldData,
                metrics: {
                  ...oldData.metrics,
                  ...metricUpdate,
                },
              }),
            },
          ],
        },
        async () => {
          // This would be the actual API call
          const response = await fetch(`/api/analytics/property-metrics/${propertyId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metricUpdate),
          })

          if (!response.ok) {
            throw new Error('Failed to update property metrics')
          }

          return response.json()
        }
      )
    },
    [performOptimisticUpdate]
  )

  // Lead analytics optimistic update
  const updateLeadAnalytics = useCallback(
    async (period: string, leadUpdate: any) => {
      const actionId = `lead-analytics-${period}-${Date.now()}`

      return performOptimisticUpdate(
        {
          id: actionId,
          timestamp: Date.now(),
          updates: [
            {
              queryKey: queryKeys.leads.analytics(period),
              updater: (oldData: any) => ({
                ...oldData,
                overview: {
                  ...oldData.overview,
                  ...leadUpdate,
                },
              }),
            },
          ],
        },
        async () => {
          const response = await fetch(`/api/analytics/leads/analytics?period=${period}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadUpdate),
          })

          if (!response.ok) {
            throw new Error('Failed to update lead analytics')
          }

          return response.json()
        }
      )
    },
    [performOptimisticUpdate]
  )

  // Dashboard KPI optimistic update
  const updateDashboardKPI = useCallback(
    async (period: string, kpiUpdate: any) => {
      const actionId = `dashboard-kpi-${period}-${Date.now()}`

      return performOptimisticUpdate(
        {
          id: actionId,
          timestamp: Date.now(),
          updates: [
            {
              queryKey: queryKeys.analytics.dashboard(period),
              updater: (oldData: any) => ({
                ...oldData,
                ...kpiUpdate,
              }),
            },
          ],
        },
        async () => {
          const response = await fetch(`/api/analytics/dashboard?period=${period}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(kpiUpdate),
          })

          if (!response.ok) {
            throw new Error('Failed to update dashboard KPI')
          }

          return response.json()
        }
      )
    },
    [performOptimisticUpdate]
  )

  // =====================================================================================
  // FILTER-BASED OPTIMISTIC UPDATES
  // =====================================================================================

  // Update data when filters change (optimistically)
  const applyFiltersOptimistically = useCallback(
    async (newFilters: any) => {
      // Update store immediately
      store.setFilters(newFilters)

      // Apply optimistic updates to relevant queries
      const period = newFilters.period || store.filters.period

      return performOptimisticUpdate(
        {
          id: `filters-${Date.now()}`,
          timestamp: Date.now(),
          updates: [
            {
              queryKey: queryKeys.analytics.dashboard(period),
              updater: (oldData: any) => ({
                ...oldData,
                isFiltering: true, // Add loading state
              }),
            },
          ],
        },
        async () => {
          // Let React Query refetch with new filters
          await invalidateQueries.allAnalytics()
          return { success: true }
        }
      )
    },
    [store, performOptimisticUpdate]
  )

  // =====================================================================================
  // REAL-TIME UPDATE INTEGRATION
  // =====================================================================================

  // Apply real-time updates optimistically
  const applyRealTimeUpdate = useCallback(
    (eventType: string, eventData: any) => {
      switch (eventType) {
        case 'property_view':
          if (eventData.propertyId) {
            // Optimistically increment view count
            const queryKey = queryKeys.properties.metrics(eventData.propertyId, 30)
            const previousData = queryClient.getQueryData(queryKey)

            if (previousData) {
              queryClient.setQueryData(queryKey, (oldData: any) => ({
                ...oldData,
                metrics: {
                  ...oldData.metrics,
                  totalViews: oldData.metrics.totalViews + 1,
                },
              }))
            }
          }
          break

        case 'lead_generated':
          // Optimistically increment lead counts
          const period = store.filters.period
          const leadAnalyticsKey = queryKeys.leads.analytics(period)
          const dashboardKey = queryKeys.analytics.dashboard(period)

          queryClient.setQueryData(leadAnalyticsKey, (oldData: any) => ({
            ...oldData,
            overview: {
              ...oldData.overview,
              totalLeads: oldData.overview.totalLeads + 1,
            },
          }))

          queryClient.setQueryData(dashboardKey, (oldData: any) => ({
            ...oldData,
            totalLeads: oldData.totalLeads + 1,
          }))
          break

        default:
          console.log('Unknown real-time event type:', eventType)
      }
    },
    [queryClient, store]
  )

  // =====================================================================================
  // UTILITIES
  // =====================================================================================

  const invalidateAllOptimisticData = useCallback(() => {
    invalidateQueries.allAnalytics()
    invalidateQueries.propertyMetrics()
    invalidateQueries.leadAnalytics()
  }, [])

  const refreshDataAfterDelay = useCallback(
    (delay: number = 5000) => {
      setTimeout(() => {
        invalidateAllOptimisticData()
      }, delay)
    },
    [invalidateAllOptimisticData]
  )

  // =====================================================================================
  // RETURN INTERFACE
  // =====================================================================================

  return {
    // Core functions
    performOptimisticUpdate,

    // Specific update functions
    updatePropertyMetrics,
    updateLeadAnalytics,
    updateDashboardKPI,

    // Filter updates
    applyFiltersOptimistically,

    // Real-time integration
    applyRealTimeUpdate,

    // Utilities
    invalidateAllOptimisticData,
    refreshDataAfterDelay,
  }
}

// =====================================================================================
// SPECIALIZED HOOKS
// =====================================================================================

// Hook for property-specific optimistic updates
export function usePropertyOptimisticUpdates(propertyId: number) {
  const { updatePropertyMetrics, applyRealTimeUpdate } = useOptimisticUpdates()

  const incrementViews = useCallback(() => {
    applyRealTimeUpdate('property_view', { propertyId })
  }, [propertyId, applyRealTimeUpdate])

  const incrementLeads = useCallback(() => {
    applyRealTimeUpdate('lead_generated', { propertyId })
  }, [propertyId, applyRealTimeUpdate])

  const updateMetrics = useCallback(
    (metrics: any) => updatePropertyMetrics(propertyId, metrics),
    [propertyId, updatePropertyMetrics]
  )

  return {
    incrementViews,
    incrementLeads,
    updateMetrics,
  }
}

// Hook for dashboard-specific optimistic updates
export function useDashboardOptimisticUpdates() {
  const { updateDashboardKPI, applyFiltersOptimistically } = useOptimisticUpdates()
  const store = useAnalyticsStore()

  const updateKPI = useCallback(
    (kpiUpdate: any) => updateDashboardKPI(store.filters.period, kpiUpdate),
    [store.filters.period, updateDashboardKPI]
  )

  const applyFilters = useCallback(
    (filters: any) => applyFiltersOptimistically(filters),
    [applyFiltersOptimistically]
  )

  return {
    updateKPI,
    applyFilters,
  }
}

export default useOptimisticUpdates