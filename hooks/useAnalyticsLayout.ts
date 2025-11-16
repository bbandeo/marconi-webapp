"use client"

import { useState, useEffect } from 'react'
import { DateRange, QuickFilter, FilterOption } from '@/components/layouts/filter-bar'

export interface LayoutState {
  sidebarCollapsed: boolean
  density: 'compact' | 'comfortable' | 'spacious'
  gridColumns: 'auto' | 1 | 2 | 3 | 4 | 6
  dateRange: DateRange
  quickFilters: QuickFilter[]
  customFilters: FilterOption[]
  viewMode: 'grid' | 'list' | 'cards'
}

export interface LayoutActions {
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setDensity: (density: LayoutState['density']) => void
  setGridColumns: (columns: LayoutState['gridColumns']) => void
  setDateRange: (range: DateRange) => void
  toggleQuickFilter: (filterId: string) => void
  setCustomFilter: (filterId: string, value: any) => void
  resetFilters: () => void
  setViewMode: (mode: LayoutState['viewMode']) => void
  resetLayout: () => void
}

export interface LayoutPreferences {
  persistToLocalStorage?: boolean
  storageKey?: string
  defaultSidebarCollapsed?: boolean
  defaultDensity?: LayoutState['density']
  defaultGridColumns?: LayoutState['gridColumns']
  defaultViewMode?: LayoutState['viewMode']
}

const DEFAULT_STATE: LayoutState = {
  sidebarCollapsed: false,
  density: 'comfortable',
  gridColumns: 'auto',
  dateRange: {
    from: undefined,
    to: undefined
  },
  quickFilters: [],
  customFilters: [],
  viewMode: 'grid'
}

const DEFAULT_PREFERENCES: Required<LayoutPreferences> = {
  persistToLocalStorage: true,
  storageKey: 'analytics-layout',
  defaultSidebarCollapsed: false,
  defaultDensity: 'comfortable',
  defaultGridColumns: 'auto',
  defaultViewMode: 'grid'
}

export function useAnalyticsLayout(
  initialFilters: {
    quickFilters?: QuickFilter[]
    customFilters?: FilterOption[]
  } = {},
  preferences: LayoutPreferences = {}
): LayoutState & LayoutActions {
  const config = { ...DEFAULT_PREFERENCES, ...preferences }

  // Initialize state with defaults and preferences
  const getInitialState = (): LayoutState => {
    let state = {
      ...DEFAULT_STATE,
      sidebarCollapsed: config.defaultSidebarCollapsed,
      density: config.defaultDensity,
      gridColumns: config.defaultGridColumns,
      viewMode: config.defaultViewMode,
      quickFilters: initialFilters.quickFilters || [],
      customFilters: initialFilters.customFilters || []
    }

    // Load from localStorage if enabled
    if (config.persistToLocalStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(config.storageKey)
        if (stored) {
          const parsedState = JSON.parse(stored)
          state = {
            ...state,
            ...parsedState,
            // Don't persist filters, they should be module-specific
            quickFilters: initialFilters.quickFilters || [],
            customFilters: initialFilters.customFilters || []
          }
        }
      } catch (error) {
        console.warn('Failed to load layout state from localStorage:', error)
      }
    }

    return state
  }

  const [state, setState] = useState<LayoutState>(getInitialState)

  // Persist state changes to localStorage
  useEffect(() => {
    if (config.persistToLocalStorage && typeof window !== 'undefined') {
      try {
        const stateToStore = {
          sidebarCollapsed: state.sidebarCollapsed,
          density: state.density,
          gridColumns: state.gridColumns,
          viewMode: state.viewMode
          // Don't store dateRange and filters
        }
        localStorage.setItem(config.storageKey, JSON.stringify(stateToStore))
      } catch (error) {
        console.warn('Failed to save layout state to localStorage:', error)
      }
    }
  }, [state, config.persistToLocalStorage, config.storageKey])

  // Update filters when initialFilters change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      quickFilters: initialFilters.quickFilters || [],
      customFilters: initialFilters.customFilters || []
    }))
  }, [initialFilters.quickFilters, initialFilters.customFilters])

  // Actions
  const toggleSidebar = () => {
    setState(prev => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed
    }))
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    setState(prev => ({
      ...prev,
      sidebarCollapsed: collapsed
    }))
  }

  const setDensity = (density: LayoutState['density']) => {
    setState(prev => ({
      ...prev,
      density
    }))
  }

  const setGridColumns = (gridColumns: LayoutState['gridColumns']) => {
    setState(prev => ({
      ...prev,
      gridColumns
    }))
  }

  const setDateRange = (dateRange: DateRange) => {
    setState(prev => ({
      ...prev,
      dateRange
    }))
  }

  const toggleQuickFilter = (filterId: string) => {
    setState(prev => ({
      ...prev,
      quickFilters: prev.quickFilters.map(filter =>
        filter.id === filterId
          ? { ...filter, active: !filter.active }
          : filter
      )
    }))
  }

  const setCustomFilter = (filterId: string, value: any) => {
    setState(prev => ({
      ...prev,
      customFilters: prev.customFilters.map(filter =>
        filter.id === filterId
          ? { ...filter, value }
          : filter
      )
    }))
  }

  const resetFilters = () => {
    setState(prev => ({
      ...prev,
      dateRange: { from: undefined, to: undefined },
      quickFilters: prev.quickFilters.map(filter => ({
        ...filter,
        active: false
      })),
      customFilters: prev.customFilters.map(filter => ({
        ...filter,
        value: undefined
      }))
    }))
  }

  const setViewMode = (viewMode: LayoutState['viewMode']) => {
    setState(prev => ({
      ...prev,
      viewMode
    }))
  }

  const resetLayout = () => {
    setState({
      ...DEFAULT_STATE,
      quickFilters: initialFilters.quickFilters || [],
      customFilters: initialFilters.customFilters || []
    })

    // Clear localStorage
    if (config.persistToLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(config.storageKey)
      } catch (error) {
        console.warn('Failed to clear layout state from localStorage:', error)
      }
    }
  }

  return {
    ...state,
    toggleSidebar,
    setSidebarCollapsed,
    setDensity,
    setGridColumns,
    setDateRange,
    toggleQuickFilter,
    setCustomFilter,
    resetFilters,
    setViewMode,
    resetLayout
  }
}

// Hook específico para filtros de módulo
export function useModuleFilters(
  moduleId: string,
  initialFilters: {
    quickFilters?: QuickFilter[]
    customFilters?: FilterOption[]
  }
) {
  const storageKey = `analytics-filters-${moduleId}`

  const getInitialState = () => {
    let state = {
      quickFilters: initialFilters.quickFilters || [],
      customFilters: initialFilters.customFilters || [],
      dateRange: { from: undefined, to: undefined } as DateRange
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsedState = JSON.parse(stored)
          state = { ...state, ...parsedState }
        }
      } catch (error) {
        console.warn(`Failed to load ${moduleId} filters from localStorage:`, error)
      }
    }

    return state
  }

  const [filters, setFilters] = useState(getInitialState)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(filters))
      } catch (error) {
        console.warn(`Failed to save ${moduleId} filters to localStorage:`, error)
      }
    }
  }, [filters, storageKey, moduleId])

  const updateQuickFilter = (filterId: string) => {
    setFilters(prev => ({
      ...prev,
      quickFilters: prev.quickFilters.map(filter =>
        filter.id === filterId
          ? { ...filter, active: !filter.active }
          : filter
      )
    }))
  }

  const updateCustomFilter = (filterId: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      customFilters: prev.customFilters.map(filter =>
        filter.id === filterId
          ? { ...filter, value }
          : filter
      )
    }))
  }

  const updateDateRange = (dateRange: DateRange) => {
    setFilters(prev => ({
      ...prev,
      dateRange
    }))
  }

  const resetFilters = () => {
    const resetState = {
      quickFilters: (initialFilters.quickFilters || []).map(filter => ({
        ...filter,
        active: false
      })),
      customFilters: (initialFilters.customFilters || []).map(filter => ({
        ...filter,
        value: undefined
      })),
      dateRange: { from: undefined, to: undefined } as DateRange
    }

    setFilters(resetState)

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.warn(`Failed to clear ${moduleId} filters from localStorage:`, error)
      }
    }
  }

  return {
    ...filters,
    updateQuickFilter,
    updateCustomFilter,
    updateDateRange,
    resetFilters
  }
}

export default useAnalyticsLayout