"use client"

import { useState, useEffect, useCallback } from 'react'
import { useResponsive } from './useResponsive'

export interface SidebarState {
  isOpen: boolean
  isCollapsed: boolean
  isPinned: boolean
  isOverlay: boolean
  width: number
}

export interface SidebarActions {
  open: () => void
  close: () => void
  toggle: () => void
  collapse: () => void
  expand: () => void
  toggleCollapsed: () => void
  pin: () => void
  unpin: () => void
  togglePinned: () => void
  setWidth: (width: number) => void
}

export interface SidebarOptions {
  defaultOpen?: boolean
  defaultCollapsed?: boolean
  defaultPinned?: boolean
  defaultWidth?: number
  collapsedWidth?: number
  minWidth?: number
  maxWidth?: number
  persistState?: boolean
  storageKey?: string
  autoCollapseOnMobile?: boolean
  overlayOnTablet?: boolean
}

const DEFAULT_OPTIONS: Required<SidebarOptions> = {
  defaultOpen: true,
  defaultCollapsed: false,
  defaultPinned: true,
  defaultWidth: 280,
  collapsedWidth: 64,
  minWidth: 200,
  maxWidth: 400,
  persistState: true,
  storageKey: 'sidebar-state',
  autoCollapseOnMobile: true,
  overlayOnTablet: true
}

export function useSidebar(options: SidebarOptions = {}): SidebarState & SidebarActions {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const { isMobile, isTablet } = useResponsive()

  const getInitialState = (): SidebarState => {
    let state: SidebarState = {
      isOpen: config.defaultOpen,
      isCollapsed: config.defaultCollapsed,
      isPinned: config.defaultPinned,
      isOverlay: false,
      width: config.defaultWidth
    }

    // Auto-collapse on mobile if enabled
    if (isMobile && config.autoCollapseOnMobile) {
      state.isCollapsed = true
      state.isOpen = false
      state.isPinned = false
      state.isOverlay = true
    }

    // Use overlay on tablet if enabled
    if (isTablet && config.overlayOnTablet) {
      state.isOverlay = true
      state.isPinned = false
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
            // Override responsive settings
            isOverlay: (isMobile || (isTablet && config.overlayOnTablet)),
            isPinned: !(isMobile || (isTablet && config.overlayOnTablet))
          }
        }
      } catch (error) {
        console.warn('Failed to load sidebar state from localStorage:', error)
      }
    }

    return state
  }

  const [state, setState] = useState<SidebarState>(getInitialState)

  // Update state when responsive breakpoints change
  useEffect(() => {
    setState(prev => {
      const newState = { ...prev }

      if (isMobile && config.autoCollapseOnMobile) {
        newState.isCollapsed = true
        newState.isOpen = false
        newState.isPinned = false
        newState.isOverlay = true
      } else if (isTablet && config.overlayOnTablet) {
        newState.isOverlay = true
        newState.isPinned = false
      } else {
        // Desktop
        newState.isOverlay = false
        if (!prev.isPinned && !isMobile && !isTablet) {
          newState.isPinned = config.defaultPinned
        }
      }

      return newState
    })
  }, [isMobile, isTablet, config.autoCollapseOnMobile, config.overlayOnTablet, config.defaultPinned])

  // Persist state changes to localStorage
  useEffect(() => {
    if (config.persistState && typeof window !== 'undefined') {
      try {
        const stateToStore = {
          isOpen: state.isOpen,
          isCollapsed: state.isCollapsed,
          isPinned: state.isPinned,
          width: state.width
          // Don't store isOverlay as it's responsive
        }
        localStorage.setItem(config.storageKey, JSON.stringify(stateToStore))
      } catch (error) {
        console.warn('Failed to save sidebar state to localStorage:', error)
      }
    }
  }, [state, config.persistState, config.storageKey])

  const open = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }))
  }, [])

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const toggle = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }))
  }, [])

  const collapse = useCallback(() => {
    setState(prev => ({ ...prev, isCollapsed: true, width: config.collapsedWidth }))
  }, [config.collapsedWidth])

  const expand = useCallback(() => {
    setState(prev => ({ ...prev, isCollapsed: false, width: config.defaultWidth }))
  }, [config.defaultWidth])

  const toggleCollapsed = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCollapsed: !prev.isCollapsed,
      width: !prev.isCollapsed ? config.collapsedWidth : config.defaultWidth
    }))
  }, [config.collapsedWidth, config.defaultWidth])

  const pin = useCallback(() => {
    setState(prev => ({ ...prev, isPinned: true, isOverlay: false }))
  }, [])

  const unpin = useCallback(() => {
    setState(prev => ({ ...prev, isPinned: false, isOverlay: true }))
  }, [])

  const togglePinned = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPinned: !prev.isPinned,
      isOverlay: prev.isPinned
    }))
  }, [])

  const setWidth = useCallback((width: number) => {
    const clampedWidth = Math.max(config.minWidth, Math.min(config.maxWidth, width))
    setState(prev => ({ ...prev, width: clampedWidth }))
  }, [config.minWidth, config.maxWidth])

  return {
    ...state,
    open,
    close,
    toggle,
    collapse,
    expand,
    toggleCollapsed,
    pin,
    unpin,
    togglePinned,
    setWidth
  }
}

// Hook especializado para navigation sidebar
export function useNavigationSidebar() {
  return useSidebar({
    storageKey: 'navigation-sidebar',
    defaultWidth: 280,
    collapsedWidth: 64,
    autoCollapseOnMobile: true,
    overlayOnTablet: true
  })
}

// Hook especializado para analytics sidebar
export function useAnalyticsSidebar() {
  return useSidebar({
    storageKey: 'analytics-sidebar',
    defaultWidth: 320,
    collapsedWidth: 80,
    autoCollapseOnMobile: true,
    overlayOnTablet: false,
    defaultCollapsed: false
  })
}

export default useSidebar