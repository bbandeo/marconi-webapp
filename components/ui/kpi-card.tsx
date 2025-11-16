"use client"

import React, { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

/**
 * KPI Card variant configuration using design tokens
 */
const kpiCardVariants = cva(
  "widget-container",
  {
    variants: {
      size: {
        sm: "p-widget-sm min-h-[120px]",
        md: "p-widget-md min-h-[160px]",
        lg: "p-widget-lg min-h-[200px]"
      },
      color: {
        primary: "border-chart-primary/30 hover:border-chart-primary/50",
        secondary: "border-chart-secondary/30 hover:border-chart-secondary/50",
        tertiary: "border-chart-tertiary/30 hover:border-chart-tertiary/50",
        quaternary: "border-chart-quaternary/30 hover:border-chart-quaternary/50"
      }
    },
    defaultVariants: {
      size: "md",
      color: "primary"
    }
  }
)

const trendVariants = cva(
  "trend-indicator",
  {
    variants: {
      direction: {
        positive: "trend-positive",
        negative: "trend-negative",
        neutral: "trend-neutral"
      },
      size: {
        sm: "text-data-xs gap-1",
        md: "text-data-sm gap-1.5",
        lg: "text-data-md gap-2"
      }
    },
    defaultVariants: {
      direction: "neutral",
      size: "md"
    }
  }
)

/**
 * Trend configuration interface
 */
export interface TrendConfig {
  /** Trend value (can be percentage or absolute number) */
  value: number
  /** Time period for the trend (e.g., "vs last month", "30d") */
  period: string
  /** Trend direction */
  direction: "positive" | "negative" | "neutral"
}

/**
 * KPI Card component props
 */
export interface KPICardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof kpiCardVariants> {
  /** KPI title/label */
  title: string
  /** Main KPI value */
  value: string | number
  /** Value formatting type */
  format?: "number" | "currency" | "percentage"
  /** Trend indicator configuration */
  trend?: TrendConfig
  /** Optional icon component */
  icon?: React.ComponentType<{ className?: string }>
  /** Loading state */
  loading?: boolean
  /** Description or subtitle */
  description?: string
}

/**
 * Format value based on type
 */
const formatValue = (value: string | number, format?: string): string => {
  if (typeof value === "string") return value

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0
      }).format(value)
    case "percentage":
      return `${value}%`
    case "number":
    default:
      return new Intl.NumberFormat("es-CL").format(value)
  }
}

/**
 * Get trend icon based on direction
 */
const getTrendIcon = (direction: TrendConfig["direction"]) => {
  switch (direction) {
    case "positive":
      return TrendingUp
    case "negative":
      return TrendingDown
    case "neutral":
    default:
      return Minus
  }
}

/**
 * KPI Card Component
 *
 * A reusable component for displaying key performance indicators with trend data.
 * Uses the analytics design system tokens for consistent styling.
 *
 * @example
 * ```tsx
 * <KPICard
 *   title="Total Properties"
 *   value={1234}
 *   format="number"
 *   trend={{
 *     value: 12.5,
 *     period: "vs last month",
 *     direction: "positive"
 *   }}
 *   icon={Home}
 *   size="lg"
 * />
 * ```
 */
export const KPICard = forwardRef<HTMLDivElement, KPICardProps>(
  ({
    className,
    title,
    value,
    format = "number",
    trend,
    icon: Icon,
    loading = false,
    description,
    size,
    color,
    ...props
  }, ref) => {
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(kpiCardVariants({ size, color }), className)}
          {...props}
        >
          <div className="widget-header">
            <div className="analytics-skeleton-text w-24 h-4" />
            {Icon && (
              <div className="analytics-skeleton w-5 h-5 rounded" />
            )}
          </div>
          <div className="widget-content">
            <div className="analytics-skeleton-number mb-2" />
            {trend && (
              <div className="analytics-skeleton-text w-20 h-3" />
            )}
            {description && (
              <div className="analytics-skeleton-text w-full h-3 mt-2" />
            )}
          </div>
        </div>
      )
    }

    const formattedValue = formatValue(value, format)
    const TrendIcon = trend ? getTrendIcon(trend.direction) : null

    return (
      <div
        ref={ref}
        className={cn(kpiCardVariants({ size, color }), className)}
        role="region"
        aria-label={`KPI: ${title}`}
        {...props}
      >
        <div className="widget-header">
          <h3 className="widget-title">{title}</h3>
          {Icon && (
            <Icon
              className="w-5 h-5 text-support-gray flex-shrink-0"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="widget-content">
          <div
            className={cn(
              "kpi-number-large mb-2",
              size === "sm" && "kpi-number"
            )}
            aria-label={`Value: ${formattedValue}`}
          >
            {formattedValue}
          </div>

          {trend && (
            <div
              className={cn(
                trendVariants({
                  direction: trend.direction,
                  size
                })
              )}
              aria-label={`Trend: ${trend.value > 0 ? '+' : ''}${trend.value}% ${trend.period}`}
            >
              {TrendIcon && (
                <TrendIcon
                  className="w-3 h-3 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              <span className="font-medium">
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-subtle-gray">
                {trend.period}
              </span>
            </div>
          )}

          {description && (
            <p className="kpi-description mt-2">
              {description}
            </p>
          )}
        </div>
      </div>
    )
  }
)

KPICard.displayName = "KPICard"

export default KPICard