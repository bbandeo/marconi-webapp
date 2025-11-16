"use client"

import React, { useState } from "react"
import {
  KPICard,
  ChartContainer,
  TrendIndicator,
  MetricsBadge,
  DataTable,
  SkeletonKPI,
  SkeletonChart,
  SkeletonTable,
  type ColumnDef
} from "./analytics"
import { Home, Eye, Users, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

/**
 * Demo data types
 */
interface PropertyData {
  id: string
  name: string
  views: number
  leads: number
  status: "active" | "inactive" | "pending"
  price: number
}

/**
 * Mock data
 */
const mockProperties: PropertyData[] = [
  {
    id: "1",
    name: "Casa Premium Providencia",
    views: 1250,
    leads: 45,
    status: "active",
    price: 250000000
  },
  {
    id: "2",
    name: "Depto Moderno Las Condes",
    views: 980,
    leads: 32,
    status: "active",
    price: 180000000
  },
  {
    id: "3",
    name: "Casa Familiar Ñuñoa",
    views: 756,
    leads: 18,
    status: "pending",
    price: 150000000
  },
  {
    id: "4",
    name: "Oficina Centro Santiago",
    views: 445,
    leads: 12,
    status: "inactive",
    price: 120000000
  }
]

/**
 * Table column definitions
 */
const propertyColumns: ColumnDef<PropertyData>[] = [
  {
    id: "name",
    header: "Propiedad",
    accessorFn: (row) => row.name,
    sortable: true,
    className: "min-w-[200px]"
  },
  {
    id: "views",
    header: "Visualizaciones",
    accessorFn: (row) => row.views,
    sortable: true,
    center: true,
    cell: ({ value }) => (
      <span className="kpi-number text-data-sm">
        {new Intl.NumberFormat("es-CL").format(value as number)}
      </span>
    )
  },
  {
    id: "leads",
    header: "Leads",
    accessorFn: (row) => row.leads,
    sortable: true,
    center: true,
    cell: ({ value }) => (
      <span className="kpi-number text-data-sm">
        {value}
      </span>
    )
  },
  {
    id: "status",
    header: "Estado",
    accessorFn: (row) => row.status,
    center: true,
    cell: ({ value, row }) => {
      const statusConfig = {
        active: { status: "success" as const, label: "Activa", icon: CheckCircle },
        pending: { status: "warning" as const, label: "Pendiente", icon: AlertTriangle },
        inactive: { status: "neutral" as const, label: "Inactiva", icon: AlertTriangle }
      }

      const config = statusConfig[row.status]
      return (
        <MetricsBadge
          status={config.status}
          icon={config.icon}
          size="sm"
        >
          {config.label}
        </MetricsBadge>
      )
    }
  },
  {
    id: "price",
    header: "Precio",
    accessorFn: (row) => row.price,
    sortable: true,
    cell: ({ value }) => (
      <span className="text-data-sm font-medium">
        {new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
          minimumFractionDigits: 0
        }).format(value as number)}
      </span>
    )
  }
]

/**
 * Analytics Demo Component
 *
 * Demonstrates all analytics components working together
 * with proper styling and functionality.
 */
export function AnalyticsDemo() {
  const [loading, setLoading] = useState(false)

  const toggleLoading = () => {
    setLoading(!loading)
  }

  return (
    <div className="analytics-grid">
      {/* Control Panel */}
      <div className="widget-container col-span-full">
        <div className="widget-header">
          <h2 className="widget-title">Demo de Componentes Analytics</h2>
          <button
            onClick={toggleLoading}
            className="px-4 py-2 bg-vibrant-orange text-white rounded-lg hover:bg-vibrant-orange/90 transition-colors"
          >
            {loading ? "Mostrar Datos" : "Mostrar Loading"}
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      {loading ? (
        <>
          <SkeletonKPI showTrend showIcon />
          <SkeletonKPI showTrend />
          <SkeletonKPI showTrend />
          <SkeletonKPI showTrend />
        </>
      ) : (
        <>
          <KPICard
            title="Total Propiedades"
            value={mockProperties.length}
            format="number"
            trend={{
              value: 12.5,
              period: "vs mes anterior",
              direction: "positive"
            }}
            icon={Home}
            description="Propiedades activas en el sistema"
          />

          <KPICard
            title="Visualizaciones Totales"
            value={mockProperties.reduce((sum, prop) => sum + prop.views, 0)}
            format="number"
            trend={{
              value: -5.2,
              period: "últimos 7 días",
              direction: "negative"
            }}
            icon={Eye}
            color="secondary"
          />

          <KPICard
            title="Leads Generados"
            value={mockProperties.reduce((sum, prop) => sum + prop.leads, 0)}
            format="number"
            trend={{
              value: 8.7,
              period: "este mes",
              direction: "positive"
            }}
            icon={Users}
            color="tertiary"
          />

          <KPICard
            title="Tasa de Conversión"
            value={3.2}
            format="percentage"
            trend={{
              value: 0,
              period: "sin cambios",
              direction: "neutral"
            }}
            icon={TrendingUp}
            color="quaternary"
          />
        </>
      )}

      {/* Trend Indicators Demo */}
      <div className="widget-container col-span-full">
        <div className="widget-header">
          <h3 className="widget-title">Indicadores de Tendencia</h3>
        </div>
        <div className="widget-content">
          <div className="flex flex-wrap gap-4">
            <TrendIndicator
              value={15.3}
              direction="positive"
              period="vs mes anterior"
              asPercentage
              size="lg"
            />
            <TrendIndicator
              value={-8.1}
              direction="negative"
              period="últimos 30 días"
              asPercentage
            />
            <TrendIndicator
              value={0}
              direction="neutral"
              period="sin cambios"
              asPercentage
              size="sm"
            />
            <TrendIndicator
              value={245}
              direction="positive"
              period="nuevos leads"
              showIcon={false}
            />
          </div>
        </div>
      </div>

      {/* Metrics Badges Demo */}
      <div className="widget-container col-span-full">
        <div className="widget-header">
          <h3 className="widget-title">Badges de Estado</h3>
        </div>
        <div className="widget-content">
          <div className="flex flex-wrap gap-4">
            <MetricsBadge status="success" variant="solid" size="lg">
              Sistema Operativo
            </MetricsBadge>
            <MetricsBadge status="warning" variant="outline" icon={AlertTriangle}>
              Revision Pendiente
            </MetricsBadge>
            <MetricsBadge status="error" variant="soft" size="sm">
              Error de Conexión
            </MetricsBadge>
            <MetricsBadge status="info" variant="soft">
              Nueva Actualización
            </MetricsBadge>
            <MetricsBadge status="neutral" variant="outline">
              Estado Normal
            </MetricsBadge>
          </div>
        </div>
      </div>

      {/* Chart Container Demo */}
      <div className="col-span-full lg:col-span-2">
        {loading ? (
          <SkeletonChart height="lg" showLegend />
        ) : (
          <ChartContainer
            title="Visualizaciones por Propiedad"
            subtitle="Últimos 30 días"
            size="lg"
            actions={
              <button className="p-2 hover:bg-support-gray/20 rounded-lg transition-colors">
                <TrendingUp className="w-4 h-4 text-support-gray" />
              </button>
            }
          >
            {/* Placeholder chart content */}
            <div className="w-full h-64 bg-gradient-to-br from-chart-primary/20 to-chart-secondary/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-chart-primary mx-auto mb-4" />
                <p className="text-data-md text-bone-white">Gráfico de Ejemplo</p>
                <p className="text-data-sm text-support-gray">Aquí iría el componente de chart real</p>
              </div>
            </div>
          </ChartContainer>
        )}
      </div>

      {/* Data Table Demo */}
      <div className="col-span-full">
        {loading ? (
          <SkeletonTable
            columns={5}
            rows={4}
            showSearch
            showPagination
          />
        ) : (
          <DataTable
            data={mockProperties}
            columns={propertyColumns}
            sorting
            filtering
            pagination
            pageSize={3}
            searchPlaceholder="Buscar propiedades..."
            emptyMessage="No se encontraron propiedades"
          />
        )}
      </div>
    </div>
  )
}

export default AnalyticsDemo