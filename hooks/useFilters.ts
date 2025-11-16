"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { DateRange, QuickFilter, FilterOption } from '@/components/layouts/filter-bar'

export interface FilterValue {
  [key: string]: any
}

export interface FilterState {
  dateRange: DateRange
  quickFilters: QuickFilter[]
  customFilters: FilterOption[]
  searchQuery: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export interface FilterActions {
  setDateRange: (range: DateRange) => void
  toggleQuickFilter: (filterId: string) => void
  setQuickFilterActive: (filterId: string, active: boolean) => void
  setCustomFilter: (filterId: string, value: any) => void
  setSearchQuery: (query: string) => void
  setSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void
  resetFilters: () => void
  resetDateRange: () => void
  resetQuickFilters: () => void
  resetCustomFilters: () => void
  clearSearch: () => void
}

export interface FilterConfig {
  persistState?: boolean
  storageKey?: string
  debounceMs?: number
  autoSave?: boolean
}

export interface UseFiltersOptions {
  initialDateRange?: DateRange
  initialQuickFilters?: QuickFilter[]
  initialCustomFilters?: FilterOption[]
  initialSearchQuery?: string
  initialSortBy?: string
  initialSortOrder?: 'asc' | 'desc'
  config?: FilterConfig
}

const DEFAULT_CONFIG: Required<FilterConfig> = {
  persistState: true,
  storageKey: 'filters-state',
  debounceMs: 300,
  autoSave: true
}

export function useFilters(options: UseFiltersOptions = {}): FilterState & FilterActions & {
  activeFilterCount: number
  hasActiveFilters: boolean
  filterValues: FilterValue
  isLoading: boolean
} {
  const config = { ...DEFAULT_CONFIG, ...options.config }

  const getInitialState = (): FilterState => {
    let state: FilterState = {
      dateRange: options.initialDateRange || { from: undefined, to: undefined },
      quickFilters: options.initialQuickFilters || [],
      customFilters: options.initialCustomFilters || [],
      searchQuery: options.initialSearchQuery || '',
      sortBy: options.initialSortBy || 'created_at',
      sortOrder: options.initialSortOrder || 'desc'
    }

    // Load from localStorage if enabled
    if (config.persistState && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(config.storageKey)
        if (stored) {
          const parsedState = JSON.parse(stored)
          state = {
            ...state,
            ...parsedState,
            // Merge filters to preserve new ones
            quickFilters: mergeFilters(state.quickFilters, parsedState.quickFilters || []),
            customFilters: mergeFilters(state.customFilters, parsedState.customFilters || [])
          }
        }
      } catch (error) {
        console.warn('Failed to load filters from localStorage:', error)
      }
    }

    return state
  }

  const [state, setState] = useState<FilterState>(getInitialState)
  const [isLoading, setIsLoading] = useState(false)

  // Debounced save to localStorage
  useEffect(() => {
    if (!config.persistState || !config.autoSave) return

    const timeoutId = setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(config.storageKey, JSON.stringify(state))
        } catch (error) {
          console.warn('Failed to save filters to localStorage:', error)
        }
      }
    }, config.debounceMs)

    return () => clearTimeout(timeoutId)
  }, [state, config.persistState, config.autoSave, config.storageKey, config.debounceMs])

  const setDateRange = useCallback((dateRange: DateRange) => {
    setState(prev => ({ ...prev, dateRange }))
  }, [])

  const toggleQuickFilter = useCallback((filterId: string) => {
    setState(prev => ({
      ...prev,
      quickFilters: prev.quickFilters.map(filter =>
        filter.id === filterId
          ? { ...filter, active: !filter.active }
          : filter
      )
    }))
  }, [])

  const setQuickFilterActive = useCallback((filterId: string, active: boolean) => {
    setState(prev => ({
      ...prev,
      quickFilters: prev.quickFilters.map(filter =>
        filter.id === filterId
          ? { ...filter, active }
          : filter
      )
    }))
  }, [])

  const setCustomFilter = useCallback((filterId: string, value: any) => {
    setState(prev => ({
      ...prev,
      customFilters: prev.customFilters.map(filter =>
        filter.id === filterId
          ? { ...filter, value }
          : filter
      )
    }))
  }, [])

  const setSearchQuery = useCallback((searchQuery: string) => {
    setState(prev => ({ ...prev, searchQuery }))
  }, [])

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
    setState(prev => ({ ...prev, sortBy, sortOrder }))
  }, [])

  const resetFilters = useCallback(() => {
    setState({
      dateRange: { from: undefined, to: undefined },
      quickFilters: state.quickFilters.map(filter => ({ ...filter, active: false })),
      customFilters: state.customFilters.map(filter => ({ ...filter, value: undefined })),
      searchQuery: '',
      sortBy: options.initialSortBy || 'created_at',
      sortOrder: options.initialSortOrder || 'desc'
    })

    // Clear localStorage if enabled
    if (config.persistState && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(config.storageKey)
      } catch (error) {
        console.warn('Failed to clear filters from localStorage:', error)
      }
    }
  }, [state.quickFilters, state.customFilters, options.initialSortBy, options.initialSortOrder, config.persistState, config.storageKey])

  const resetDateRange = useCallback(() => {
    setDateRange({ from: undefined, to: undefined })
  }, [setDateRange])

  const resetQuickFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      quickFilters: prev.quickFilters.map(filter => ({ ...filter, active: false }))
    }))
  }, [])

  const resetCustomFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      customFilters: prev.customFilters.map(filter => ({ ...filter, value: undefined }))
    }))
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [setSearchQuery])

  // Computed values
  const activeFilterCount = useMemo(() => {
    let count = 0

    // Date range
    if (state.dateRange.from || state.dateRange.to) count++

    // Quick filters
    count += state.quickFilters.filter(f => f.active).length

    // Custom filters
    count += state.customFilters.filter(f =>
      f.value !== undefined &&
      f.value !== '' &&
      f.value !== null &&
      (Array.isArray(f.value) ? f.value.length > 0 : true)
    ).length

    // Search query
    if (state.searchQuery.trim()) count++

    return count
  }, [state.dateRange, state.quickFilters, state.customFilters, state.searchQuery])

  const hasActiveFilters = useMemo(() => activeFilterCount > 0, [activeFilterCount])

  const filterValues = useMemo(() => {
    const values: FilterValue = {
      dateRange: state.dateRange,
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder
    }

    // Add active quick filters
    state.quickFilters
      .filter(f => f.active)
      .forEach(filter => {
        values[filter.id] = filter.value
      })

    // Add custom filters with values
    state.customFilters
      .filter(f => f.value !== undefined && f.value !== '' && f.value !== null)
      .forEach(filter => {
        values[filter.id] = filter.value
      })

    return values
  }, [state])

  return {
    ...state,
    activeFilterCount,
    hasActiveFilters,
    filterValues,
    isLoading,
    setDateRange,
    toggleQuickFilter,
    setQuickFilterActive,
    setCustomFilter,
    setSearchQuery,
    setSorting,
    resetFilters,
    resetDateRange,
    resetQuickFilters,
    resetCustomFilters,
    clearSearch
  }
}

// Utility function to merge filter arrays preserving state
function mergeFilters<T extends { id: string }>(current: T[], stored: T[]): T[] {
  const storedMap = new Map(stored.map(f => [f.id, f]))

  return current.map(filter => {
    const storedFilter = storedMap.get(filter.id)
    return storedFilter ? { ...filter, ...storedFilter } : filter
  })
}

// Specialized hook for analytics filters
export function useAnalyticsFilters(moduleId: string) {
  return useFilters({
    config: {
      storageKey: `analytics-filters-${moduleId}`,
      persistState: true,
      debounceMs: 300
    }
  })
}

// Hook for property listing filters
export function usePropertyFilters() {
  const quickFilters: QuickFilter[] = [
    { id: 'featured', label: 'Destacadas', value: 'featured', active: false },
    { id: 'new', label: 'Nuevas', value: 'new', active: false },
    { id: 'sale', label: 'En Venta', value: 'sale', active: false },
    { id: 'rent', label: 'En Alquiler', value: 'rent', active: false }
  ]

  const customFilters: FilterOption[] = [
    {
      id: 'property_type',
      label: 'Tipo de Propiedad',
      type: 'select',
      options: [
        { value: 'apartment', label: 'Departamento' },
        { value: 'house', label: 'Casa' },
        { value: 'townhouse', label: 'Casa Adosada' },
        { value: 'commercial', label: 'Comercial' }
      ]
    },
    {
      id: 'price_range',
      label: 'Rango de Precio',
      type: 'select',
      options: [
        { value: '0-100000', label: 'Hasta $100,000' },
        { value: '100000-300000', label: '$100,000 - $300,000' },
        { value: '300000-500000', label: '$300,000 - $500,000' },
        { value: '500000+', label: 'Más de $500,000' }
      ]
    }
  ]

  return useFilters({
    initialQuickFilters: quickFilters,
    initialCustomFilters: customFilters,
    config: {
      storageKey: 'property-filters',
      persistState: true
    }
  })
}

export default useFilters