"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { useResponsive, type Breakpoint } from '@/hooks/useResponsive'

export type ResponsiveBreakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide'

interface ResponsiveWrapperProps {
  children: React.ReactNode
  mobile?: React.ReactNode
  tablet?: React.ReactNode
  desktop: React.ReactNode
  wide?: React.ReactNode
  className?: string
  fallbackToChildren?: boolean
}

interface ResponsiveContainerProps {
  children: React.ReactNode
  breakpoint: ResponsiveBreakpoint
  className?: string
}

interface ResponsiveShowProps {
  children: React.ReactNode
  on: ResponsiveBreakpoint | ResponsiveBreakpoint[]
  className?: string
}

interface ResponsiveHideProps {
  children: React.ReactNode
  on: ResponsiveBreakpoint | ResponsiveBreakpoint[]
  className?: string
}

// Re-export hooks with improved implementation
export function useBreakpoint(): ResponsiveBreakpoint {
  const { currentBreakpoint } = useResponsive()
  return currentBreakpoint
}

export function useIsMobile(): boolean {
  const { isMobile } = useResponsive()
  return isMobile
}

export function useIsTabletOrMobile(): boolean {
  const { isMobile, isTablet } = useResponsive()
  return isMobile || isTablet
}

export function useIsDesktopOrWide(): boolean {
  const { isDesktop, isWide } = useResponsive()
  return isDesktop || isWide
}

// Wrapper principal que renderiza contenido según breakpoint
export function ResponsiveWrapper({
  children,
  mobile,
  tablet,
  desktop,
  wide,
  className,
  fallbackToChildren = true
}: ResponsiveWrapperProps) {
  const breakpoint = useBreakpoint()

  const renderContent = () => {
    switch (breakpoint) {
      case 'mobile':
        return mobile || (fallbackToChildren ? children : null)
      case 'tablet':
        return tablet || mobile || (fallbackToChildren ? children : null)
      case 'desktop':
        return desktop || (fallbackToChildren ? children : null)
      case 'wide':
        return wide || desktop || (fallbackToChildren ? children : null)
      default:
        return fallbackToChildren ? children : desktop
    }
  }

  return (
    <div className={cn("responsive-wrapper", className)}>
      {renderContent()}
    </div>
  )
}

// Contenedor que muestra/oculta según breakpoint
export function ResponsiveContainer({
  children,
  breakpoint,
  className
}: ResponsiveContainerProps) {
  const currentBreakpoint = useBreakpoint()
  const shouldShow = currentBreakpoint === breakpoint

  if (!shouldShow) return null

  return (
    <div className={cn("responsive-container", className)}>
      {children}
    </div>
  )
}

// Componente que muestra contenido solo en breakpoints específicos
export function ResponsiveShow({
  children,
  on,
  className
}: ResponsiveShowProps) {
  const currentBreakpoint = useBreakpoint()
  const breakpoints = Array.isArray(on) ? on : [on]
  const shouldShow = breakpoints.includes(currentBreakpoint)

  if (!shouldShow) return null

  return (
    <div className={cn("responsive-show", className)}>
      {children}
    </div>
  )
}

// Componente que oculta contenido en breakpoints específicos
export function ResponsiveHide({
  children,
  on,
  className
}: ResponsiveHideProps) {
  const currentBreakpoint = useBreakpoint()
  const breakpoints = Array.isArray(on) ? on : [on]
  const shouldHide = breakpoints.includes(currentBreakpoint)

  if (shouldHide) return null

  return (
    <div className={cn("responsive-hide", className)}>
      {children}
    </div>
  )
}

// Componentes específicos para diferentes breakpoints
export function MobileOnly({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <ResponsiveShow on="mobile" className={className}>
      {children}
    </ResponsiveShow>
  )
}

export function TabletOnly({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <ResponsiveShow on="tablet" className={className}>
      {children}
    </ResponsiveShow>
  )
}

export function DesktopOnly({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <ResponsiveShow on="desktop" className={className}>
      {children}
    </ResponsiveShow>
  )
}

export function WideOnly({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <ResponsiveShow on="wide" className={className}>
      {children}
    </ResponsiveShow>
  )
}

// Componente que oculta en mobile
export function HideOnMobile({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <ResponsiveHide on="mobile" className={className}>
      {children}
    </ResponsiveHide>
  )
}

// Componente que oculta en desktop y wide
export function HideOnDesktop({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <ResponsiveHide on={["desktop", "wide"]} className={className}>
      {children}
    </ResponsiveHide>
  )
}

// Layout adaptativo que cambia la estructura según el breakpoint
export function AdaptiveLayout({
  sidebar,
  children,
  className,
  sidebarPosition = 'left',
  mobileLayout = 'stack'
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
  className?: string
  sidebarPosition?: 'left' | 'right'
  mobileLayout?: 'stack' | 'tabs' | 'drawer'
}) {
  const { isMobile, isTablet, isWide } = useResponsive()

  if (isMobile) {
    // En mobile: diferentes layouts según configuración
    if (mobileLayout === 'stack') {
      return (
        <div className={cn("adaptive-layout flex flex-col", className)}>
          <div className="adaptive-sidebar-mobile mb-4">
            {sidebar}
          </div>
          <div className="adaptive-content flex-1">
            {children}
          </div>
        </div>
      )
    }

    // Para tabs y drawer, retornamos solo el contenido principal
    // El sidebar se maneja por separado en estos casos
    return (
      <div className={cn("adaptive-layout", className)}>
        <div className="adaptive-content">
          {children}
        </div>
      </div>
    )
  }

  // En tablet/desktop: layout horizontal
  const sidebarWidth = isTablet ? "w-64" : isWide ? "w-96" : "w-80"

  return (
    <div className={cn("adaptive-layout flex gap-6", className)}>
      {sidebarPosition === 'left' && (
        <div className={cn("adaptive-sidebar flex-shrink-0", sidebarWidth)}>
          {sidebar}
        </div>
      )}

      <div className="adaptive-content flex-1 min-w-0">
        {children}
      </div>

      {sidebarPosition === 'right' && (
        <div className={cn("adaptive-sidebar flex-shrink-0", sidebarWidth)}>
          {sidebar}
        </div>
      )}
    </div>
  )
}

// Configuración de grid responsivo específico para analytics
export function AnalyticsGrid({
  children,
  className,
  variant = 'balanced'
}: {
  children: React.ReactNode
  className?: string
  variant?: 'compact' | 'balanced' | 'spacious'
}) {
  const breakpoint = useBreakpoint()

  const gridVariants = {
    compact: {
      mobile: 'grid-cols-1',
      tablet: 'grid-cols-2',
      desktop: 'grid-cols-3 xl:grid-cols-4',
      wide: 'grid-cols-4 2xl:grid-cols-6'
    },
    balanced: {
      mobile: 'grid-cols-1',
      tablet: 'grid-cols-1 sm:grid-cols-2',
      desktop: 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      wide: 'grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
    },
    spacious: {
      mobile: 'grid-cols-1',
      tablet: 'grid-cols-1 sm:grid-cols-2',
      desktop: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
      wide: 'grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
    }
  }

  return (
    <div className={cn(
      "analytics-grid grid gap-4 lg:gap-6",
      gridVariants[variant][breakpoint],
      className
    )}>
      {children}
    </div>
  )
}

// Grid específico para KPIs
export function ResponsiveKPIGrid({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <AnalyticsGrid variant="balanced" className={cn("kpi-grid", className)}>
      {children}
    </AnalyticsGrid>
  )
}

// Grid para charts
export function ResponsiveChartGrid({
  children,
  layout = 'balanced',
  className
}: {
  children: React.ReactNode
  layout?: 'single' | 'split' | 'balanced' | 'focus'
  className?: string
}) {
  const { isMobile, isTablet } = useResponsive()

  const getLayoutClasses = () => {
    if (isMobile) return 'grid-cols-1'

    const layoutClasses = {
      single: 'grid-cols-1',
      split: isTablet ? 'grid-cols-1' : 'grid-cols-2',
      balanced: isTablet ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2',
      focus: isTablet ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
    }

    return layoutClasses[layout]
  }

  return (
    <div className={cn(
      "responsive-chart-grid grid gap-4 lg:gap-6",
      getLayoutClasses(),
      className
    )}>
      {children}
    </div>
  )
}

// Utilidades CSS para breakpoints (para usar con className)
export const breakpointClasses = {
  // Display utilities
  showOnMobile: 'block sm:hidden',
  showOnTablet: 'hidden sm:block lg:hidden',
  showOnDesktop: 'hidden lg:block xl:hidden',
  showOnWide: 'hidden xl:block',
  hideOnMobile: 'hidden sm:block',
  hideOnTablet: 'block sm:hidden lg:block',
  hideOnDesktop: 'block lg:hidden xl:block',
  hideOnWide: 'block xl:hidden',

  // Grid utilities
  gridMobile: 'grid-cols-1',
  gridTablet: 'grid-cols-1 sm:grid-cols-2',
  gridDesktop: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  gridWide: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',

  // Flex utilities
  flexMobile: 'flex-col',
  flexTablet: 'flex-col sm:flex-row',
  flexDesktop: 'flex-row',

  // Spacing utilities
  gapMobile: 'gap-2 sm:gap-3',
  gapTablet: 'gap-3 sm:gap-4',
  gapDesktop: 'gap-4 lg:gap-6',
  gapWide: 'gap-6 xl:gap-8',

  // Text utilities
  textMobile: 'text-sm',
  textTablet: 'text-sm sm:text-base',
  textDesktop: 'text-base lg:text-lg',
  textWide: 'text-lg xl:text-xl',

  // Container utilities
  containerMobile: 'px-4',
  containerTablet: 'px-4 sm:px-6',
  containerDesktop: 'px-6 lg:px-8',
  containerWide: 'px-8 xl:px-10'
}

export default ResponsiveWrapper