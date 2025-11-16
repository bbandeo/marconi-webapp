'use client'

// =====================================================================================
// INTERACTIVE CHART COMPONENT v4
// =====================================================================================
// Chart component optimizado para dashboard analytics v4
// Incluye interactividad, tooltips, zoom y responsive design
// =====================================================================================

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, MoreVertical, ZoomIn, ZoomOut, Download } from 'lucide-react'

// =====================================================================================
// TYPES
// =====================================================================================

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
  metadata?: Record<string, any>
}

export interface ChartSeries {
  id: string
  name: string
  data: ChartDataPoint[]
  color: string
  type?: 'line' | 'area' | 'bar'
}

export interface InteractiveChartProps {
  series: ChartSeries[]
  width?: number
  height?: number
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  allowZoom?: boolean
  allowPan?: boolean
  className?: string
  onPointClick?: (point: ChartDataPoint, series: ChartSeries) => void
}

// =====================================================================================
// CONFIGURATION
// =====================================================================================

const CHART_CONFIG = {
  padding: { top: 20, right: 20, bottom: 40, left: 60 },
  gridColor: 'rgba(156, 163, 175, 0.1)',
  tooltipBg: 'rgba(17, 24, 39, 0.95)',
  colors: {
    primary: '#F37321',
    secondary: '#3B82F6',
    tertiary: '#10B981',
    quaternary: '#F59E0B',
    grid: 'rgba(156, 163, 175, 0.1)',
    axis: 'rgba(156, 163, 175, 0.3)'
  }
}

// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================

function getMinMax(series: ChartSeries[]): { min: number; max: number } {
  let min = Infinity
  let max = -Infinity

  series.forEach(s => {
    s.data.forEach(point => {
      min = Math.min(min, point.value)
      max = Math.max(max, point.value)
    })
  })

  // Add 10% padding
  const padding = (max - min) * 0.1
  return {
    min: min - padding,
    max: max + padding
  }
}

function formatValue(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toLocaleString('es-AR')
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================

export function InteractiveChart({
  series,
  width = 800,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  allowZoom = true,
  allowPan = false,
  className,
  onPointClick
}: InteractiveChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredPoint, setHoveredPoint] = useState<{
    point: ChartDataPoint
    series: ChartSeries
    x: number
    y: number
  } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  // Calculate dimensions
  const chartWidth = width - CHART_CONFIG.padding.left - CHART_CONFIG.padding.right
  const chartHeight = height - CHART_CONFIG.padding.top - CHART_CONFIG.padding.bottom

  // Get data ranges
  const { min: minY, max: maxY } = getMinMax(series)
  const allDates = series.length > 0 ? series[0].data.map(d => d.date) : []
  const minX = 0
  const maxX = allDates.length - 1

  // Scale functions
  const scaleX = (index: number) => (index / (maxX || 1)) * chartWidth
  const scaleY = (value: number) => chartHeight - ((value - minY) / (maxY - minY)) * chartHeight

  // Generate path for line/area charts
  const generatePath = (data: ChartDataPoint[], type: 'line' | 'area' = 'line') => {
    if (data.length === 0) return ''

    const points = data.map((point, index) => `${scaleX(index)},${scaleY(point.value)}`)
    const path = `M ${points.join(' L ')}`

    if (type === 'area') {
      const firstX = scaleX(0)
      const lastX = scaleX(data.length - 1)
      const bottomY = scaleY(minY)
      return `${path} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`
    }

    return path
  }

  // Handle mouse events
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!showTooltip) return

    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left - CHART_CONFIG.padding.left
    const y = event.clientY - rect.top

    // Find closest point
    const pointIndex = Math.round((x / chartWidth) * (allDates.length - 1))
    if (pointIndex >= 0 && pointIndex < allDates.length) {
      const closestSeries = series[0] // Use first series for tooltip
      const point = closestSeries.data[pointIndex]
      if (point) {
        setHoveredPoint({
          point,
          series: closestSeries,
          x: event.clientX,
          y: event.clientY
        })
      }
    }
  }

  const handleMouseLeave = () => {
    setHoveredPoint(null)
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5))

  return (
    <div className={cn("relative w-full", className)}>
      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-4">
        {showLegend && (
          <div className="flex items-center gap-4">
            {series.map(s => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-sm text-data-label">{s.name}</span>
              </div>
            ))}
          </div>
        )}

        {allowZoom && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-subtle-gray px-2">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative bg-surface-darker rounded-lg p-4 overflow-hidden">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full h-auto"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
          {/* Grid Lines */}
          {showGrid && (
            <g className="grid">
              {/* Horizontal grid lines */}
              {Array.from({ length: 5 }, (_, i) => {
                const y = CHART_CONFIG.padding.top + (i * chartHeight) / 4
                return (
                  <line
                    key={`h-grid-${i}`}
                    x1={CHART_CONFIG.padding.left}
                    y1={y}
                    x2={CHART_CONFIG.padding.left + chartWidth}
                    y2={y}
                    stroke={CHART_CONFIG.colors.grid}
                    strokeWidth={1}
                  />
                )
              })}

              {/* Vertical grid lines */}
              {Array.from({ length: 6 }, (_, i) => {
                const x = CHART_CONFIG.padding.left + (i * chartWidth) / 5
                return (
                  <line
                    key={`v-grid-${i}`}
                    x1={x}
                    y1={CHART_CONFIG.padding.top}
                    x2={x}
                    y2={CHART_CONFIG.padding.top + chartHeight}
                    stroke={CHART_CONFIG.colors.grid}
                    strokeWidth={1}
                  />
                )
              })}
            </g>
          )}

          {/* Y-Axis Labels */}
          <g className="y-axis">
            {Array.from({ length: 5 }, (_, i) => {
              const value = minY + (i * (maxY - minY)) / 4
              const y = CHART_CONFIG.padding.top + chartHeight - (i * chartHeight) / 4
              return (
                <text
                  key={`y-label-${i}`}
                  x={CHART_CONFIG.padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-subtle-gray text-xs"
                >
                  {formatValue(value)}
                </text>
              )
            })}
          </g>

          {/* X-Axis Labels */}
          <g className="x-axis">
            {allDates.filter((_, i) => i % Math.ceil(allDates.length / 6) === 0).map((date, i) => {
              const index = i * Math.ceil(allDates.length / 6)
              const x = CHART_CONFIG.padding.left + scaleX(index)
              return (
                <text
                  key={`x-label-${i}`}
                  x={x}
                  y={CHART_CONFIG.padding.top + chartHeight + 20}
                  textAnchor="middle"
                  className="fill-subtle-gray text-xs"
                >
                  {new Date(date).toLocaleDateString('es-AR', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </text>
              )
            })}
          </g>

          {/* Chart Series */}
          <g className="series" transform={`translate(${CHART_CONFIG.padding.left}, ${CHART_CONFIG.padding.top})`}>
            {series.map(s => (
              <g key={s.id}>
                {s.type === 'area' && (
                  <path
                    d={generatePath(s.data, 'area')}
                    fill={s.color}
                    fillOpacity={0.2}
                  />
                )}
                <path
                  d={generatePath(s.data, 'line')}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data points */}
                {s.data.map((point, index) => (
                  <circle
                    key={`${s.id}-${index}`}
                    cx={scaleX(index)}
                    cy={scaleY(point.value)}
                    r={4}
                    fill={s.color}
                    stroke="white"
                    strokeWidth={2}
                    className="cursor-pointer hover:r-6 transition-all"
                    onClick={() => onPointClick?.(point, s)}
                  />
                ))}
              </g>
            ))}
          </g>
        </svg>

        {/* Tooltip */}
        {showTooltip && hoveredPoint && (
          <div
            className="fixed z-50 bg-surface-darker border border-border-subtle rounded-lg p-3 shadow-lg pointer-events-none"
            style={{
              left: hoveredPoint.x + 10,
              top: hoveredPoint.y - 10,
              background: CHART_CONFIG.tooltipBg
            }}
          >
            <div className="text-sm">
              <div className="font-medium text-bone-white mb-1">
                {new Date(hoveredPoint.point.date).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: hoveredPoint.series.color }}
                />
                <span className="text-data-label">{hoveredPoint.series.name}:</span>
                <span className="font-semibold text-bone-white">
                  {formatCurrency(hoveredPoint.point.value)}
                </span>
              </div>
              {hoveredPoint.point.label && (
                <div className="text-xs text-subtle-gray mt-1">
                  {hoveredPoint.point.label}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chart Summary Stats */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-subtle-gray">Máximo: </span>
            <span className="font-semibold text-chart-success">
              {formatCurrency(maxY)}
            </span>
          </div>
          <div>
            <span className="text-subtle-gray">Mínimo: </span>
            <span className="font-semibold text-chart-error">
              {formatCurrency(minY)}
            </span>
          </div>
          <div>
            <span className="text-subtle-gray">Promedio: </span>
            <span className="font-semibold text-bone-white">
              {formatCurrency((maxY + minY) / 2)}
            </span>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {allDates.length} puntos de datos
        </Badge>
      </div>
    </div>
  )
}

export default InteractiveChart