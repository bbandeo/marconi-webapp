/**
 * Analytics Dashboard Components Export Barrel
 *
 * Centralized exports for all analytics-specific UI components.
 * These components follow the design system tokens and provide
 * consistent styling for dashboard layouts.
 */

// Core Analytics Components
export { KPICard, type KPICardProps, type TrendConfig } from "./kpi-card"
export { ChartContainer, type ChartContainerProps } from "./chart-container"
export { TrendIndicator, type TrendIndicatorProps } from "./trend-indicator"
export { MetricsBadge, type MetricsBadgeProps } from "./metrics-badge"
export { DataTable, type DataTableProps, type ColumnDef } from "./data-table"

// Loading States
export {
  Skeleton,
  SkeletonKPI,
  SkeletonChart,
  SkeletonTable,
  SkeletonGrid,
  type SkeletonProps,
  type SkeletonKPIProps,
  type SkeletonChartProps,
  type SkeletonTableProps,
  type SkeletonGridProps
} from "./loading-skeleton"

// Re-export commonly used base components that work well with analytics
export { Button } from "./button"
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"
export { Input } from "./input"
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
export { Badge } from "./badge"