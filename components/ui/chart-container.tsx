"use client"

import React, { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { AlertCircle, MoreVertical } from "lucide-react"

/**
 * Chart container variant configuration
 */
const chartContainerVariants = cva(
  "widget-container",
  {
    variants: {
      size: {
        sm: "min-h-[200px]",
        md: "min-h-[300px]",
        lg: "min-h-[400px]",
        xl: "min-h-[500px]"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
)

/**
 * Chart Container component props
 */
export interface ChartContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartContainerVariants> {
  /** Chart title */
  title: string
  /** Optional subtitle */
  subtitle?: string
  /** Chart content (usually a chart component) */
  children: React.ReactNode
  /** Loading state */
  loading?: boolean
  /** Error message */
  error?: string
  /** Action buttons or controls */
  actions?: React.ReactNode
}

/**
 * Loading skeleton for charts
 */
const ChartSkeleton = ({ size }: { size?: "sm" | "md" | "lg" | "xl" }) => {
  const height = {
    sm: "h-32",
    md: "h-48",
    lg: "h-64",
    xl: "h-80"
  }[size || "md"]

  return (
    <div className="chart-container">
      <div className={cn("analytics-skeleton w-full rounded-lg", height)} />
      <div className="flex justify-center gap-4 mt-4">
        <div className="analytics-skeleton-text w-16 h-3" />
        <div className="analytics-skeleton-text w-20 h-3" />
        <div className="analytics-skeleton-text w-18 h-3" />
      </div>
    </div>
  )
}

/**
 * Error state for charts
 */
const ChartError = ({ error }: { error: string }) => (
  <div className="chart-container flex flex-col items-center justify-center text-center">
    <AlertCircle className="w-12 h-12 text-status-error mb-4" />
    <h4 className="text-data-md font-medium text-bone-white mb-2">
      Error al cargar el gráfico
    </h4>
    <p className="text-data-sm text-subtle-gray max-w-md">
      {error}
    </p>
  </div>
)

/**
 * Chart Container Component
 *
 * A wrapper component for charts that provides consistent styling,
 * loading states, error handling, and header actions.
 *
 * @example
 * ```tsx
 * <ChartContainer
 *   title="Property Views Over Time"
 *   subtitle="Daily views for the last 30 days"
 *   size="lg"
 *   actions={
 *     <Button variant="ghost" size="sm">
 *       <MoreVertical className="w-4 h-4" />
 *     </Button>
 *   }
 * >
 *   <LineChart data={chartData} />
 * </ChartContainer>
 * ```
 */
export const ChartContainer = forwardRef<HTMLDivElement, ChartContainerProps>(
  ({
    className,
    title,
    subtitle,
    children,
    loading = false,
    error,
    actions,
    size,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(chartContainerVariants({ size }), className)}
        role="region"
        aria-label={`Chart: ${title}`}
        {...props}
      >
        {/* Header */}
        <div className="widget-header">
          <div className="flex-1 min-w-0">
            <h3 className="widget-title truncate">{title}</h3>
            {subtitle && (
              <p className="text-data-sm text-support-gray mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="widget-content flex-1">
          {loading ? (
            <ChartSkeleton size={size} />
          ) : error ? (
            <ChartError error={error} />
          ) : (
            <div className="chart-container">
              {children}
            </div>
          )}
        </div>
      </div>
    )
  }
)

ChartContainer.displayName = "ChartContainer"

export default ChartContainer