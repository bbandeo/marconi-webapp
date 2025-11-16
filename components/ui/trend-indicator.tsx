"use client"

import React, { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

/**
 * Trend indicator variant configuration
 */
const trendIndicatorVariants = cva(
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
 * Trend Indicator component props
 */
export interface TrendIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof trendIndicatorVariants> {
  /** Trend value (can be percentage or absolute number) */
  value: number
  /** Time period (e.g., "vs last month", "30d") */
  period?: string
  /** Whether to show the trending icon */
  showIcon?: boolean
  /** Whether to show the numeric value */
  showValue?: boolean
  /** Custom prefix for the value (e.g., "+", "-") */
  valuePrefix?: string
  /** Custom suffix for the value (e.g., "%", "pts") */
  valueSuffix?: string
  /** Format as percentage (adds % automatically) */
  asPercentage?: boolean
}

/**
 * Get trend icon component based on direction
 */
const getTrendIcon = (direction: "positive" | "negative" | "neutral") => {
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
 * Format trend value
 */
const formatTrendValue = (
  value: number,
  options: {
    asPercentage?: boolean
    valuePrefix?: string
    valueSuffix?: string
  } = {}
): string => {
  const { asPercentage, valuePrefix = "", valueSuffix = "" } = options

  // Auto-add + sign for positive values if no prefix is specified
  const autoPrefix = value > 0 && !valuePrefix ? "+" : ""
  const finalPrefix = valuePrefix || autoPrefix

  // Format the number
  const formattedNumber = new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(Math.abs(value))

  // Add percentage or custom suffix
  const finalSuffix = asPercentage ? "%" : valueSuffix

  return `${finalPrefix}${formattedNumber}${finalSuffix}`
}

/**
 * Trend Indicator Component
 *
 * A flexible component for displaying trend information with icons,
 * values, and time periods. Automatically applies color coding based
 * on trend direction.
 *
 * @example
 * ```tsx
 * <TrendIndicator
 *   value={12.5}
 *   direction="positive"
 *   period="vs last month"
 *   size="lg"
 *   asPercentage
 * />
 * ```
 */
export const TrendIndicator = forwardRef<HTMLDivElement, TrendIndicatorProps>(
  ({
    className,
    value,
    period,
    direction = value > 0 ? "positive" : value < 0 ? "negative" : "neutral",
    size,
    showIcon = true,
    showValue = true,
    valuePrefix,
    valueSuffix,
    asPercentage = false,
    ...props
  }, ref) => {
    const TrendIcon = getTrendIcon(direction)
    const formattedValue = formatTrendValue(value, {
      asPercentage,
      valuePrefix,
      valueSuffix
    })

    // Accessibility label
    const ariaLabel = [
      showValue && `${value > 0 ? "Aumento" : value < 0 ? "Disminución" : "Sin cambio"} de ${Math.abs(value)}${asPercentage ? " por ciento" : ""}`,
      period && `comparado con ${period}`
    ].filter(Boolean).join(", ")

    return (
      <div
        ref={ref}
        className={cn(
          trendIndicatorVariants({ direction, size }),
          className
        )}
        role="status"
        aria-label={ariaLabel}
        {...props}
      >
        {showIcon && (
          <TrendIcon
            className={cn(
              "flex-shrink-0",
              size === "sm" && "w-3 h-3",
              size === "md" && "w-4 h-4",
              size === "lg" && "w-5 h-5"
            )}
            aria-hidden="true"
          />
        )}

        {showValue && (
          <span className="font-medium whitespace-nowrap">
            {formattedValue}
          </span>
        )}

        {period && (
          <span className="text-subtle-gray whitespace-nowrap">
            {period}
          </span>
        )}
      </div>
    )
  }
)

TrendIndicator.displayName = "TrendIndicator"

export default TrendIndicator