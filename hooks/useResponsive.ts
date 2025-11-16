"use client"

import { useState, useEffect } from 'react'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide'

export interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isWide: boolean
  currentBreakpoint: Breakpoint
  width: number | null
  height: number | null
}

const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440
} as const

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isWide: false,
    currentBreakpoint: 'desktop',
    width: null,
    height: null
  })

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      let currentBreakpoint: Breakpoint = 'desktop'
      if (width >= breakpoints.wide) {
        currentBreakpoint = 'wide'
      } else if (width >= breakpoints.desktop) {
        currentBreakpoint = 'desktop'
      } else if (width >= breakpoints.tablet) {
        currentBreakpoint = 'tablet'
      } else {
        currentBreakpoint = 'mobile'
      }

      setState({
        isMobile: width < breakpoints.tablet,
        isTablet: width >= breakpoints.tablet && width < breakpoints.desktop,
        isDesktop: width >= breakpoints.desktop && width < breakpoints.wide,
        isWide: width >= breakpoints.wide,
        currentBreakpoint,
        width,
        height
      })
    }

    // Initial call
    updateDimensions()

    // Add resize listener with debounce
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateDimensions, 100)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return state
}

// Hook para detectar cambios de breakpoint específicos
export function useBreakpoint(targetBreakpoint: Breakpoint): boolean {
  const { currentBreakpoint } = useResponsive()
  return currentBreakpoint === targetBreakpoint
}

// Hook para detectar si estamos en o por encima de un breakpoint
export function useMinBreakpoint(minBreakpoint: Breakpoint): boolean {
  const { width } = useResponsive()

  if (width === null) return false

  return width >= breakpoints[minBreakpoint]
}

// Hook para detectar si estamos en o por debajo de un breakpoint
export function useMaxBreakpoint(maxBreakpoint: Breakpoint): boolean {
  const { width } = useResponsive()

  if (width === null) return false

  const breakpointValues = Object.entries(breakpoints).sort(([,a], [,b]) => a - b)
  const targetIndex = breakpointValues.findIndex(([key]) => key === maxBreakpoint)

  if (targetIndex === -1 || targetIndex === breakpointValues.length - 1) {
    return width < breakpoints[maxBreakpoint]
  }

  const nextBreakpoint = breakpointValues[targetIndex + 1][1]
  return width < nextBreakpoint
}

// Utility para generar clases CSS responsivas
export function useResponsiveClasses(classes: Partial<Record<Breakpoint, string>>): string {
  const { currentBreakpoint } = useResponsive()
  return classes[currentBreakpoint] || ''
}

export default useResponsive