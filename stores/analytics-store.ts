"use client"

// =====================================================================================
// MARCONI INMOBILIARIA - ANALYTICS GLOBAL STATE STORE
// =====================================================================================
// Store global para filtros, preferencias y estado del dashboard analytics
// Implementado con Zustand para gestión de estado eficiente
// =====================================================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'

// =====================================================================================
// TYPES
// =====================================================================================

export interface AnalyticsFilters {
  period: string
  dateRange: {
    from: string | null
    to: string | null
  } | null
  propertyIds: number[]
  sourceIds: number[]
  deviceTypes: string[]
  agentIds: number[]
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  defaultPeriod: string
  autoRefresh: boolean
  refreshInterval: number
  notificationsEnabled: boolean
  emailReports: boolean
  dashboardLayout: 'grid' | 'list'
  chartsType: 'line' | 'bar' | 'area'
  compactMode: boolean
}

export interface DashboardState {
  activeModule: string
  sidebarCollapsed: boolean
  filtersVisible: boolean
  fullscreenChart: string | null
  selectedKPIs: string[]
  customDateRanges: Array<{
    id: string
    name: string
    from: string
    to: string
  }>
}

export interface AnalyticsStore {
  // State
  filters: AnalyticsFilters
  preferences: UserPreferences
  dashboard: DashboardState

  // Loading states
  isLoading: boolean
  isSaving: boolean

  // Actions - Filters
  setFilters: (filters: Partial<AnalyticsFilters>) => void
  resetFilters: () => void
  setPeriod: (period: string) => void
  setDateRange: (from: string | null, to: string | null) => void
  addPropertyFilter: (propertyId: number) => void
  removePropertyFilter: (propertyId: number) => void
  setPropertyFilters: (propertyIds: number[]) => void
  addSourceFilter: (sourceId: number) => void
  removeSourceFilter: (sourceId: number) => void

  // Actions - Preferences
  setPreferences: (preferences: Partial<UserPreferences>) => void
  resetPreferences: () => void
  toggleAutoRefresh: () => void
  setRefreshInterval: (interval: number) => void
  toggleNotifications: () => void
  setDashboardLayout: (layout: 'grid' | 'list') => void
  setChartsType: (type: 'line' | 'bar' | 'area') => void

  // Actions - Dashboard
  setActiveModule: (module: string) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleFilters: () => void
  setFullscreenChart: (chartId: string | null) => void
  setSelectedKPIs: (kpis: string[]) => void
  addCustomDateRange: (range: { name: string; from: string; to: string }) => void
  removeCustomDateRange: (id: string) => void

  // Utilities
  hasActiveFilters: () => boolean
  getActiveFiltersCount: () => number
  exportPreferences: () => string
  importPreferences: (data: string) => void
}

// =====================================================================================
// DEFAULT VALUES
// =====================================================================================

const defaultFilters: AnalyticsFilters = {
  period: '30d',
  dateRange: null,
  propertyIds: [],
  sourceIds: [],
  deviceTypes: [],
  agentIds: [],
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'es',
  timezone: 'America/Santiago',
  defaultPeriod: '30d',
  autoRefresh: false,
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  notificationsEnabled: false,
  emailReports: false,
  dashboardLayout: 'grid',
  chartsType: 'line',
  compactMode: false,
}

const defaultDashboard: DashboardState = {
  activeModule: 'overview',
  sidebarCollapsed: false,
  filtersVisible: false,
  fullscreenChart: null,
  selectedKPIs: ['totalLeads', 'conversionRate', 'totalRevenue', 'activeProperties'],
  customDateRanges: [],
}

// =====================================================================================
// STORE IMPLEMENTATION
// =====================================================================================

export const useAnalyticsStore = create<AnalyticsStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        filters: defaultFilters,
        preferences: defaultPreferences,
        dashboard: defaultDashboard,
        isLoading: false,
        isSaving: false,

        // =====================================================================================
        // FILTER ACTIONS
        // =====================================================================================

        setFilters: (newFilters) =>
          set(
            (state) => ({
              filters: { ...state.filters, ...newFilters },
            }),
            false,
            'setFilters'
          ),

        resetFilters: () =>
          set(
            { filters: defaultFilters },
            false,
            'resetFilters'
          ),

        setPeriod: (period) =>
          set(
            (state) => ({
              filters: { ...state.filters, period, dateRange: null },
            }),
            false,
            'setPeriod'
          ),

        setDateRange: (from, to) =>
          set(
            (state) => ({
              filters: {
                ...state.filters,
                dateRange: from && to ? { from, to } : null,
                period: from && to ? 'custom' : state.filters.period,
              },
            }),
            false,
            'setDateRange'
          ),

        addPropertyFilter: (propertyId) =>
          set(
            (state) => ({
              filters: {
                ...state.filters,
                propertyIds: state.filters.propertyIds.includes(propertyId)
                  ? state.filters.propertyIds
                  : [...state.filters.propertyIds, propertyId],
              },
            }),
            false,
            'addPropertyFilter'
          ),

        removePropertyFilter: (propertyId) =>
          set(
            (state) => ({
              filters: {
                ...state.filters,
                propertyIds: state.filters.propertyIds.filter(id => id !== propertyId),
              },
            }),
            false,
            'removePropertyFilter'
          ),

        setPropertyFilters: (propertyIds) =>
          set(
            (state) => ({
              filters: { ...state.filters, propertyIds },
            }),
            false,
            'setPropertyFilters'
          ),

        addSourceFilter: (sourceId) =>
          set(
            (state) => ({
              filters: {
                ...state.filters,
                sourceIds: state.filters.sourceIds.includes(sourceId)
                  ? state.filters.sourceIds
                  : [...state.filters.sourceIds, sourceId],
              },
            }),
            false,
            'addSourceFilter'
          ),

        removeSourceFilter: (sourceId) =>
          set(
            (state) => ({
              filters: {
                ...state.filters,
                sourceIds: state.filters.sourceIds.filter(id => id !== sourceId),
              },
            }),
            false,
            'removeSourceFilter'
          ),

        // =====================================================================================
        // PREFERENCES ACTIONS
        // =====================================================================================

        setPreferences: (newPreferences) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, ...newPreferences },
            }),
            false,
            'setPreferences'
          ),

        resetPreferences: () =>
          set(
            { preferences: defaultPreferences },
            false,
            'resetPreferences'
          ),

        toggleAutoRefresh: () =>
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                autoRefresh: !state.preferences.autoRefresh,
              },
            }),
            false,
            'toggleAutoRefresh'
          ),

        setRefreshInterval: (interval) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, refreshInterval: interval },
            }),
            false,
            'setRefreshInterval'
          ),

        toggleNotifications: () =>
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                notificationsEnabled: !state.preferences.notificationsEnabled,
              },
            }),
            false,
            'toggleNotifications'
          ),

        setDashboardLayout: (layout) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, dashboardLayout: layout },
            }),
            false,
            'setDashboardLayout'
          ),

        setChartsType: (type) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, chartsType: type },
            }),
            false,
            'setChartsType'
          ),

        // =====================================================================================
        // DASHBOARD ACTIONS
        // =====================================================================================

        setActiveModule: (module) =>
          set(
            (state) => ({
              dashboard: { ...state.dashboard, activeModule: module },
            }),
            false,
            'setActiveModule'
          ),

        toggleSidebar: () =>
          set(
            (state) => ({
              dashboard: {
                ...state.dashboard,
                sidebarCollapsed: !state.dashboard.sidebarCollapsed,
              },
            }),
            false,
            'toggleSidebar'
          ),

        setSidebarCollapsed: (collapsed) =>
          set(
            (state) => ({
              dashboard: { ...state.dashboard, sidebarCollapsed: collapsed },
            }),
            false,
            'setSidebarCollapsed'
          ),

        toggleFilters: () =>
          set(
            (state) => ({
              dashboard: {
                ...state.dashboard,
                filtersVisible: !state.dashboard.filtersVisible,
              },
            }),
            false,
            'toggleFilters'
          ),

        setFullscreenChart: (chartId) =>
          set(
            (state) => ({
              dashboard: { ...state.dashboard, fullscreenChart: chartId },
            }),
            false,
            'setFullscreenChart'
          ),

        setSelectedKPIs: (kpis) =>
          set(
            (state) => ({
              dashboard: { ...state.dashboard, selectedKPIs: kpis },
            }),
            false,
            'setSelectedKPIs'
          ),

        addCustomDateRange: (range) => {
          const id = `custom-${Date.now()}`
          set(
            (state) => ({
              dashboard: {
                ...state.dashboard,
                customDateRanges: [
                  ...state.dashboard.customDateRanges,
                  { ...range, id },
                ],
              },
            }),
            false,
            'addCustomDateRange'
          )
        },

        removeCustomDateRange: (id) =>
          set(
            (state) => ({
              dashboard: {
                ...state.dashboard,
                customDateRanges: state.dashboard.customDateRanges.filter(
                  range => range.id !== id
                ),
              },
            }),
            false,
            'removeCustomDateRange'
          ),

        // =====================================================================================
        // UTILITY FUNCTIONS
        // =====================================================================================

        hasActiveFilters: () => {
          const { filters } = get()
          return (
            filters.period !== '30d' ||
            filters.dateRange !== null ||
            filters.propertyIds.length > 0 ||
            filters.sourceIds.length > 0 ||
            filters.deviceTypes.length > 0 ||
            filters.agentIds.length > 0
          )
        },

        getActiveFiltersCount: () => {
          const { filters } = get()
          let count = 0

          if (filters.period !== '30d') count++
          if (filters.dateRange !== null) count++
          if (filters.propertyIds.length > 0) count++
          if (filters.sourceIds.length > 0) count++
          if (filters.deviceTypes.length > 0) count++
          if (filters.agentIds.length > 0) count++

          return count
        },

        exportPreferences: () => {
          const { preferences, dashboard } = get()
          return JSON.stringify({ preferences, dashboard }, null, 2)
        },

        importPreferences: (data) => {
          try {
            const parsed = JSON.parse(data)
            if (parsed.preferences) {
              set(
                (state) => ({
                  preferences: { ...defaultPreferences, ...parsed.preferences },
                }),
                false,
                'importPreferences'
              )
            }
            if (parsed.dashboard) {
              set(
                (state) => ({
                  dashboard: { ...defaultDashboard, ...parsed.dashboard },
                }),
                false,
                'importDashboard'
              )
            }
          } catch (error) {
            console.error('Failed to import preferences:', error)
          }
        },
      }),
      {
        name: 'marconi-analytics-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          filters: state.filters,
          preferences: state.preferences,
          dashboard: {
            ...state.dashboard,
            // Don't persist UI state
            fullscreenChart: null,
            filtersVisible: false,
          },
        }),
      }
    ),
    {
      name: 'AnalyticsStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)

// =====================================================================================
// SELECTORS (Optional - for performance optimization)
// =====================================================================================

export const useAnalyticsFilters = () => useAnalyticsStore(state => state.filters)
export const useUserPreferences = () => useAnalyticsStore(state => state.preferences)
export const useDashboardState = () => useAnalyticsStore(state => state.dashboard)
export const useFilterActions = () => useAnalyticsStore(state => ({
  setFilters: state.setFilters,
  resetFilters: state.resetFilters,
  setPeriod: state.setPeriod,
  setDateRange: state.setDateRange,
  addPropertyFilter: state.addPropertyFilter,
  removePropertyFilter: state.removePropertyFilter,
}))

// =====================================================================================
// EXPORTS
// =====================================================================================

export default useAnalyticsStore
export type {
  AnalyticsFilters,
  UserPreferences,
  DashboardState,
  AnalyticsStore,
}