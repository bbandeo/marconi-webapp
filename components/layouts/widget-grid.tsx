"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface WidgetGridProps {
  children: React.ReactNode
  columns?: 'auto' | 1 | 2 | 3 | 4 | 6
  gap?: 'sm' | 'md' | 'lg'
  responsive?: boolean
  className?: string
  density?: 'compact' | 'comfortable' | 'spacious'
}

const gridColumns = {
  auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
}

const gridGaps = {
  sm: 'gap-3',
  md: 'gap-4 lg:gap-6',
  lg: 'gap-6 lg:gap-8'
}

const densityClasses = {
  compact: 'widget-gap-compact',
  comfortable: 'widget-gap-comfortable',
  spacious: 'widget-gap-spacious'
}

export function WidgetGrid({
  children,
  columns = 'auto',
  gap = 'md',
  responsive = true,
  className,
  density = 'comfortable'
}: WidgetGridProps) {
  return (
    <div
      className={cn(
        "widget-grid grid",
        responsive && gridColumns[columns],
        !responsive && `grid-cols-${columns}`,
        gridGaps[gap],
        densityClasses[density],
        className
      )}
      style={{
        gridAutoRows: 'minmax(min-content, max-content)'
      }}
    >
      {children}
    </div>
  )
}

// Grid específico para KPIs
export function KPIGrid({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <WidgetGrid
      columns="auto"
      gap="md"
      className={cn("kpi-grid mb-6", className)}
    >
      {children}
    </WidgetGrid>
  )
}

// Grid para charts principales
export function ChartGrid({
  children,
  layout = 'balanced',
  className
}: {
  children: React.ReactNode
  layout?: 'single' | 'split' | 'balanced' | 'focus'
  className?: string
}) {
  const layoutClasses = {
    single: 'grid-cols-1',
    split: 'grid-cols-1 xl:grid-cols-2',
    balanced: 'grid-cols-1 lg:grid-cols-2',
    focus: 'grid-cols-1 lg:grid-cols-3'
  }

  return (
    <div className={cn(
      "chart-grid grid gap-6",
      layoutClasses[layout],
      className
    )}>
      {children}
    </div>
  )
}

// Grid para tablas y contenido complejo
export function ContentGrid({
  children,
  sidebar,
  sidebarPosition = 'right',
  sidebarSize = '1/3',
  className
}: {
  children: React.ReactNode
  sidebar?: React.ReactNode
  sidebarPosition?: 'left' | 'right'
  sidebarSize?: '1/4' | '1/3' | '2/5'
  className?: string
}) {
  if (!sidebar) {
    return (
      <div className={cn("content-grid w-full", className)}>
        {children}
      </div>
    )
  }

  const sidebarSizes = {
    '1/4': 'lg:grid-cols-4',
    '1/3': 'lg:grid-cols-3',
    '2/5': 'lg:grid-cols-5'
  }

  const mainSpan = {
    '1/4': 'lg:col-span-3',
    '1/3': 'lg:col-span-2',
    '2/5': 'lg:col-span-3'
  }

  const sidebarSpan = {
    '1/4': 'lg:col-span-1',
    '1/3': 'lg:col-span-1',
    '2/5': 'lg:col-span-2'
  }

  return (
    <div className={cn(
      "content-grid grid gap-6 grid-cols-1",
      sidebarSizes[sidebarSize],
      className
    )}>
      {sidebarPosition === 'left' && (
        <aside className={cn("content-sidebar order-2 lg:order-1", sidebarSpan[sidebarSize])}>
          {sidebar}
        </aside>
      )}

      <main className={cn("content-main order-1 lg:order-2", mainSpan[sidebarSize])}>
        {children}
      </main>

      {sidebarPosition === 'right' && (
        <aside className={cn("content-sidebar order-2", sidebarSpan[sidebarSize])}>
          {sidebar}
        </aside>
      )}
    </div>
  )
}

// Grid masonry para widgets de diferentes alturas
export function MasonryGrid({
  children,
  columns = 'auto',
  className
}: {
  children: React.ReactNode
  columns?: 'auto' | 2 | 3 | 4
  className?: string
}) {
  const columnClasses = {
    auto: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4',
    2: 'columns-1 md:columns-2',
    3: 'columns-1 md:columns-2 lg:columns-3',
    4: 'columns-1 md:columns-2 lg:columns-3 xl:columns-4'
  }

  return (
    <div className={cn(
      "masonry-grid",
      columnClasses[columns],
      "gap-4 lg:gap-6 space-y-4 lg:space-y-6",
      className
    )}>
      {React.Children.map(children, (child, index) => (
        <div key={index} className="break-inside-avoid">
          {child}
        </div>
      ))}
    </div>
  )
}

export default WidgetGrid