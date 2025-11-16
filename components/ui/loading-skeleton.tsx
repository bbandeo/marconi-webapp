"use client"

import React, { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Base skeleton variant configuration
 */
const skeletonVariants = cva(
  "analytics-skeleton",
  {
    variants: {
      variant: {
        text: "analytics-skeleton-text",
        number: "analytics-skeleton-number",
        circle: "rounded-full",
        rectangle: "rounded-lg"
      },
      size: {
        sm: "h-3",
        md: "h-4",
        lg: "h-6",
        xl: "h-8"
      }
    },
    defaultVariants: {
      variant: "rectangle",
      size: "md"
    }
  }
)

/**
 * Base Skeleton component props
 */
export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Number of skeleton items to render */
  count?: number
}

/**
 * Base Skeleton Component
 *
 * A flexible skeleton loader for various content types.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, count = 1, ...props }, ref) => {
    if (count === 1) {
      return (
        <div
          ref={ref}
          className={cn(skeletonVariants({ variant, size }), className)}
          role="status"
          aria-label="Cargando..."
          {...props}
        />
      )
    }

    return (
      <div ref={ref} className="space-y-2" {...props}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(skeletonVariants({ variant, size }), className)}
            role="status"
            aria-label="Cargando..."
          />
        ))}
      </div>
    )
  }
)

Skeleton.displayName = "Skeleton"

/**
 * KPI Skeleton Component
 *
 * Specialized skeleton for KPI cards.
 */
export interface SkeletonKPIProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show trend skeleton */
  showTrend?: boolean
  /** Whether to show icon skeleton */
  showIcon?: boolean
  /** KPI size variant */
  size?: "sm" | "md" | "lg"
}

export const SkeletonKPI = forwardRef<HTMLDivElement, SkeletonKPIProps>(
  ({ className, showTrend = true, showIcon = false, size = "md", ...props }, ref) => {
    const containerClass = {
      sm: "p-widget-sm min-h-[120px]",
      md: "p-widget-md min-h-[160px]",
      lg: "p-widget-lg min-h-[200px]"
    }[size]

    const numberClass = {
      sm: "h-6 w-20",
      md: "h-8 w-24",
      lg: "h-10 w-28"
    }[size]

    return (
      <div
        ref={ref}
        className={cn("widget-container", containerClass, className)}
        role="status"
        aria-label="Cargando KPI..."
        {...props}
      >
        {/* Header */}
        <div className="widget-header">
          <Skeleton variant="text" className="w-24 h-4" />
          {showIcon && (
            <Skeleton variant="circle" className="w-5 h-5" />
          )}
        </div>

        {/* Content */}
        <div className="widget-content">
          {/* Main number */}
          <Skeleton
            variant="rectangle"
            className={cn("mb-2", numberClass)}
          />

          {/* Trend */}
          {showTrend && (
            <div className="flex items-center gap-2">
              <Skeleton variant="circle" className="w-3 h-3" />
              <Skeleton variant="text" className="w-16 h-3" />
            </div>
          )}
        </div>
      </div>
    )
  }
)

SkeletonKPI.displayName = "SkeletonKPI"

/**
 * Chart Skeleton Component
 *
 * Specialized skeleton for chart containers.
 */
export interface SkeletonChartProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Chart height variant */
  height?: "sm" | "md" | "lg" | "xl"
  /** Whether to show legend skeleton */
  showLegend?: boolean
  /** Whether to show title skeleton */
  showTitle?: boolean
}

export const SkeletonChart = forwardRef<HTMLDivElement, SkeletonChartProps>(
  ({
    className,
    height = "md",
    showLegend = true,
    showTitle = true,
    ...props
  }, ref) => {
    const heightClass = {
      sm: "h-32",
      md: "h-48",
      lg: "h-64",
      xl: "h-80"
    }[height]

    return (
      <div
        ref={ref}
        className={cn("widget-container", className)}
        role="status"
        aria-label="Cargando gráfico..."
        {...props}
      >
        {/* Header */}
        {showTitle && (
          <div className="widget-header">
            <div className="flex-1">
              <Skeleton variant="text" className="w-32 h-5 mb-1" />
              <Skeleton variant="text" className="w-48 h-3" />
            </div>
            <Skeleton variant="circle" className="w-6 h-6" />
          </div>
        )}

        {/* Chart area */}
        <div className="widget-content">
          <div className="chart-container">
            <Skeleton
              variant="rectangle"
              className={cn("w-full rounded-lg", heightClass)}
            />

            {/* Legend */}
            {showLegend && (
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Skeleton variant="circle" className="w-3 h-3" />
                  <Skeleton variant="text" className="w-16 h-3" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton variant="circle" className="w-3 h-3" />
                  <Skeleton variant="text" className="w-20 h-3" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton variant="circle" className="w-3 h-3" />
                  <Skeleton variant="text" className="w-18 h-3" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)

SkeletonChart.displayName = "SkeletonChart"

/**
 * Table Skeleton Component
 *
 * Specialized skeleton for data tables.
 */
export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns */
  columns?: number
  /** Number of rows */
  rows?: number
  /** Whether to show search skeleton */
  showSearch?: boolean
  /** Whether to show pagination skeleton */
  showPagination?: boolean
}

export const SkeletonTable = forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({
    className,
    columns = 4,
    rows = 5,
    showSearch = false,
    showPagination = false,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("widget-container", className)}
        role="status"
        aria-label="Cargando tabla..."
        {...props}
      >
        {/* Search */}
        {showSearch && (
          <div className="mb-4">
            <Skeleton variant="rectangle" className="w-64 h-10" />
          </div>
        )}

        {/* Table header */}
        <div className="flex gap-4 mb-3 pb-3 border-b border-support-gray/20">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" className="flex-1 h-4" />
          ))}
        </div>

        {/* Table rows */}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4">
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} variant="text" className="flex-1 h-4" />
              ))}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {showPagination && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-support-gray/20">
            <Skeleton variant="text" className="w-32 h-4" />
            <div className="flex gap-2">
              <Skeleton variant="rectangle" className="w-16 h-8" />
              <Skeleton variant="rectangle" className="w-16 h-8" />
            </div>
          </div>
        )}
      </div>
    )
  }
)

SkeletonTable.displayName = "SkeletonTable"

/**
 * Analytics Grid Skeleton Component
 *
 * Skeleton for a grid of analytics widgets.
 */
export interface SkeletonGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of grid items */
  items?: number
  /** Grid layout type */
  layout?: "kpi" | "mixed" | "charts"
}

export const SkeletonGrid = forwardRef<HTMLDivElement, SkeletonGridProps>(
  ({ className, items = 6, layout = "mixed", ...props }, ref) => {
    const renderItem = (index: number) => {
      if (layout === "kpi") {
        return <SkeletonKPI key={index} />
      }
      if (layout === "charts") {
        return <SkeletonChart key={index} />
      }

      // Mixed layout
      if (index < 4) {
        return <SkeletonKPI key={index} />
      }
      return <SkeletonChart key={index} />
    }

    return (
      <div
        ref={ref}
        className={cn("analytics-grid", className)}
        role="status"
        aria-label="Cargando dashboard..."
        {...props}
      >
        {Array.from({ length: items }).map((_, index) => renderItem(index))}
      </div>
    )
  }
)

SkeletonGrid.displayName = "SkeletonGrid"

export default Skeleton