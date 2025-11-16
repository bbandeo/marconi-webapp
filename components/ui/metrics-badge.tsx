"use client"

import React, { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Metrics badge variant configuration using design tokens
 */
const metricsBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
  {
    variants: {
      status: {
        success: "status-success",
        warning: "status-warning",
        error: "status-error",
        info: "status-info",
        neutral: "status-neutral"
      },
      size: {
        sm: "px-2 py-1 text-data-xxs min-h-[20px]",
        md: "px-2.5 py-1.5 text-data-xs min-h-[24px]",
        lg: "px-3 py-2 text-data-sm min-h-[28px]"
      },
      variant: {
        solid: "",
        outline: "bg-transparent",
        soft: "border-0"
      }
    },
    compoundVariants: [
      // Solid variants
      {
        status: "success",
        variant: "solid",
        className: "bg-status-success text-white border-0"
      },
      {
        status: "warning",
        variant: "solid",
        className: "bg-status-warning text-white border-0"
      },
      {
        status: "error",
        variant: "solid",
        className: "bg-status-error text-white border-0"
      },
      {
        status: "info",
        variant: "solid",
        className: "bg-status-info text-white border-0"
      },
      {
        status: "neutral",
        variant: "solid",
        className: "bg-status-neutral text-white border-0"
      },
      // Outline variants
      {
        status: "success",
        variant: "outline",
        className: "border-2 border-status-success text-status-success"
      },
      {
        status: "warning",
        variant: "outline",
        className: "border-2 border-status-warning text-status-warning"
      },
      {
        status: "error",
        variant: "outline",
        className: "border-2 border-status-error text-status-error"
      },
      {
        status: "info",
        variant: "outline",
        className: "border-2 border-status-info text-status-info"
      },
      {
        status: "neutral",
        variant: "outline",
        className: "border-2 border-status-neutral text-status-neutral"
      },
      // Soft variants (already defined in CSS utilities)
      {
        status: "success",
        variant: "soft",
        className: "bg-status-success/10 text-status-success"
      },
      {
        status: "warning",
        variant: "soft",
        className: "bg-status-warning/10 text-status-warning"
      },
      {
        status: "error",
        variant: "soft",
        className: "bg-status-error/10 text-status-error"
      },
      {
        status: "info",
        variant: "soft",
        className: "bg-status-info/10 text-status-info"
      },
      {
        status: "neutral",
        variant: "soft",
        className: "bg-status-neutral/10 text-status-neutral"
      }
    ],
    defaultVariants: {
      status: "neutral",
      size: "md",
      variant: "soft"
    }
  }
)

/**
 * Metrics Badge component props
 */
export interface MetricsBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof metricsBadgeVariants> {
  /** Badge content */
  children: React.ReactNode
  /** Optional icon to display before text */
  icon?: React.ComponentType<{ className?: string }>
  /** Loading state */
  loading?: boolean
}

/**
 * Get semantic color based on status for screen readers
 */
const getStatusLabel = (status: string): string => {
  switch (status) {
    case "success":
      return "Exitoso"
    case "warning":
      return "Advertencia"
    case "error":
      return "Error"
    case "info":
      return "Información"
    case "neutral":
    default:
      return "Neutral"
  }
}

/**
 * Metrics Badge Component
 *
 * A versatile badge component for displaying status indicators, metrics,
 * and categorical information with consistent styling and accessibility.
 *
 * @example
 * ```tsx
 * <MetricsBadge status="success" variant="soft" size="md">
 *   Active
 * </MetricsBadge>
 *
 * <MetricsBadge
 *   status="warning"
 *   variant="outline"
 *   icon={AlertTriangle}
 * >
 *   Pending Review
 * </MetricsBadge>
 * ```
 */
export const MetricsBadge = forwardRef<HTMLSpanElement, MetricsBadgeProps>(
  ({
    className,
    children,
    status,
    size,
    variant,
    icon: Icon,
    loading = false,
    ...props
  }, ref) => {
    if (loading) {
      return (
        <span
          ref={ref}
          className={cn(
            metricsBadgeVariants({ size, variant: "soft", status: "neutral" }),
            "animate-pulse",
            className
          )}
          {...props}
        >
          <span className="analytics-skeleton-text w-12 h-3" />
        </span>
      )
    }

    const statusLabel = getStatusLabel(status || "neutral")

    return (
      <span
        ref={ref}
        className={cn(metricsBadgeVariants({ status, size, variant }), className)}
        role="status"
        aria-label={`${statusLabel}: ${typeof children === "string" ? children : ""}`}
        {...props}
      >
        {Icon && (
          <Icon
            className={cn(
              "flex-shrink-0 mr-1",
              size === "sm" && "w-3 h-3",
              size === "md" && "w-3.5 h-3.5",
              size === "lg" && "w-4 h-4"
            )}
            aria-hidden="true"
          />
        )}
        <span className="whitespace-nowrap">{children}</span>
      </span>
    )
  }
)

MetricsBadge.displayName = "MetricsBadge"

export default MetricsBadge