// Analytics Layout Examples
// Integration examples showing how to use layout components with T1.3 analytics components

export { default as AnalyticsDashboardDemo } from './analytics-dashboard-demo'
export { default as SalesModuleDemo } from './sales-module-demo'
export { default as MarketingModuleDemo } from './marketing-module-demo'

// Example configurations for each module
export const DEMO_CONFIGS = {
  overview: {
    title: 'Overview Dashboard Demo',
    description: 'Complete analytics dashboard with KPIs, charts, and responsive layout',
    component: 'AnalyticsDashboardDemo',
    features: [
      'Responsive design (mobile, tablet, desktop)',
      'Sidebar navigation with module selection',
      'KPI cards with trend indicators',
      'Chart containers with mock data',
      'Data table with sorting and pagination',
      'Filter bar with date range and quick filters'
    ],
    usedComponents: [
      'AnalyticsDashboardLayout',
      'ModuleContainer',
      'WidgetGrid',
      'SidebarNavigation',
      'FilterBar',
      'ResponsiveWrapper',
      'KPICard',
      'ChartContainer',
      'DataTable',
      'TrendIndicator',
      'MetricsBadge'
    ]
  },

  sales: {
    title: 'Sales Performance Demo',
    description: 'Sales-focused dashboard with pipeline analysis and agent performance',
    component: 'SalesModuleDemo',
    features: [
      'Sales-specific KPI metrics',
      'Pipeline funnel visualization',
      'Agent performance comparison',
      'Conversion analysis by stage',
      'Automated insights and recommendations',
      'Compact layout optimized for sales data'
    ],
    usedComponents: [
      'AnalyticsDashboardLayout',
      'ModuleContainer',
      'WidgetGrid',
      'ChartGrid',
      'KPICard',
      'ChartContainer',
      'DataTable',
      'TrendIndicator',
      'MetricsBadge'
    ]
  },

  marketing: {
    title: 'Marketing & Leads Demo',
    description: 'Marketing dashboard with campaign performance and lead funnel',
    component: 'MarketingModuleDemo',
    features: [
      'Marketing KPIs (leads, CPL, ROI)',
      'Channel performance analysis',
      'Campaign tracking and status',
      'Lead funnel visualization',
      'Sidebar with lead sources breakdown',
      'Conversion insights and recommendations'
    ],
    usedComponents: [
      'AnalyticsDashboardLayout',
      'ModuleContainer',
      'WidgetGrid',
      'ContentGrid',
      'KPICard',
      'ChartContainer',
      'DataTable',
      'TrendIndicator',
      'MetricsBadge'
    ]
  }
} as const

// Mock data generators for demos
export const mockDataGenerators = {
  // Generate KPI data
  generateKPIs: (count: number, module: 'sales' | 'marketing' | 'properties' | 'customers' = 'sales') => {
    const kpiTemplates = {
      sales: [
        { title: 'Pipeline Total', baseValue: 4000000, format: 'currency' },
        { title: 'Deals Cerrados', baseValue: 25, format: 'number' },
        { title: 'Tasa de Cierre', baseValue: 22, format: 'percentage' },
        { title: 'Tiempo Prom. Cierre', baseValue: 45, format: 'number', unit: 'días' }
      ],
      marketing: [
        { title: 'Leads Generados', baseValue: 850, format: 'number' },
        { title: 'Costo por Lead', baseValue: 125, format: 'currency' },
        { title: 'Tasa de Conversión', baseValue: 18, format: 'percentage' },
        { title: 'ROI Campaigns', baseValue: 340, format: 'percentage' }
      ],
      properties: [
        { title: 'Propiedades Activas', baseValue: 156, format: 'number' },
        { title: 'Precio Promedio', baseValue: 1850000, format: 'currency' },
        { title: 'Días en Mercado', baseValue: 42, format: 'number' },
        { title: 'Vistas Totales', baseValue: 12450, format: 'number' }
      ],
      customers: [
        { title: 'Clientes Activos', baseValue: 1247, format: 'number' },
        { title: 'Satisfacción', baseValue: 87, format: 'percentage' },
        { title: 'Tiempo de Respuesta', baseValue: 2.5, format: 'number', unit: 'hrs' },
        { title: 'Retención', baseValue: 94, format: 'percentage' }
      ]
    }

    return kpiTemplates[module].slice(0, count).map(template => ({
      ...template,
      value: Math.round(template.baseValue * (0.8 + Math.random() * 0.4)),
      change: Math.round((Math.random() - 0.5) * 40 * 100) / 100,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }))
  },

  // Generate table data
  generateTableData: (rows: number, type: 'pipeline' | 'agents' | 'campaigns' | 'properties') => {
    const generators = {
      pipeline: () => ({
        stage: ['Prospecto', 'Calificado', 'Propuesta', 'Negociación', 'Cerrado'][Math.floor(Math.random() * 5)],
        count: Math.floor(Math.random() * 50) + 10,
        value: Math.floor(Math.random() * 1000000) + 500000,
        conversion: Math.floor(Math.random() * 50) + 25
      }),

      agents: () => ({
        agent: ['María García', 'Juan López', 'Ana Rodríguez', 'Carlos Mendoza'][Math.floor(Math.random() * 4)],
        deals: Math.floor(Math.random() * 10) + 3,
        revenue: Math.floor(Math.random() * 500000) + 300000,
        conversion: Math.round((Math.random() * 30 + 15) * 100) / 100,
        avgDays: Math.floor(Math.random() * 30) + 25
      }),

      campaigns: () => ({
        campaign: ['Primavera 2024', 'Departamentos Premium', 'Inversores'][Math.floor(Math.random() * 3)],
        status: Math.random() > 0.7 ? 'paused' : 'active',
        budget: Math.floor(Math.random() * 20000) + 10000,
        spent: Math.floor(Math.random() * 15000) + 5000,
        leads: Math.floor(Math.random() * 100) + 50,
        conversion: Math.round((Math.random() * 25 + 10) * 100) / 100,
        performance: ['excellent', 'good', 'average'][Math.floor(Math.random() * 3)]
      }),

      properties: () => ({
        property: ['Casa Moderna', 'Depto Céntrico', 'Oficina Premium'][Math.floor(Math.random() * 3)],
        type: ['Casa', 'Departamento', 'Comercial'][Math.floor(Math.random() * 3)],
        price: `$${(Math.floor(Math.random() * 2000000) + 500000).toLocaleString()}`,
        agent: ['María García', 'Juan López', 'Ana Rodríguez'][Math.floor(Math.random() * 3)],
        views: Math.floor(Math.random() * 200) + 50,
        leads: Math.floor(Math.random() * 15) + 3,
        status: Math.random() > 0.3 ? 'Activa' : 'Vendida'
      })
    }

    return Array.from({ length: rows }, () => generators[type]())
  },

  // Generate navigation items
  generateNavigation: (activeModule?: string) => [
    {
      id: 'overview',
      label: 'Overview Ejecutivo',
      icon: 'BarChart3',
      href: '/admin/analytics',
      active: activeModule === 'overview',
      badge: 4
    },
    {
      id: 'sales',
      label: 'Sales Performance',
      icon: 'TrendingUp',
      href: '/admin/analytics/sales',
      active: activeModule === 'sales',
      children: [
        { id: 'pipeline', label: 'Pipeline', icon: 'TrendingUp', href: '/admin/analytics/sales/pipeline' },
        { id: 'funnel', label: 'Funnel', icon: 'TrendingUp', href: '/admin/analytics/sales/funnel' }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing & Leads',
      icon: 'Target',
      href: '/admin/analytics/marketing',
      active: activeModule === 'marketing',
      badge: 12
    },
    {
      id: 'properties',
      label: 'Property Analytics',
      icon: 'Building',
      href: '/admin/analytics/properties',
      active: activeModule === 'properties'
    },
    {
      id: 'customers',
      label: 'Customer Insights',
      icon: 'Users',
      href: '/admin/analytics/customers',
      active: activeModule === 'customers'
    }
  ]
}

// Utility functions for demo usage
export const demoUtils = {
  // Format values for display
  formatValue: (value: number, format: 'currency' | 'number' | 'percentage', unit?: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)

      case 'percentage':
        return `${value}%`

      case 'number':
        return unit ? `${value.toLocaleString()} ${unit}` : value.toLocaleString()

      default:
        return value.toString()
    }
  },

  // Generate random color for charts
  getRandomColor: (index: number) => {
    const colors = [
      'hsl(var(--chart-primary))',
      'hsl(var(--chart-secondary))',
      'hsl(var(--chart-tertiary))',
      'hsl(var(--chart-quaternary))',
      'hsl(var(--chart-quinary))'
    ]
    return colors[index % colors.length]
  },

  // Generate chart data
  generateChartData: (points: number = 12, baseValue: number = 100) => {
    return Array.from({ length: points }, (_, i) => ({
      month: new Date(2024, i, 1).toLocaleDateString('es-MX', { month: 'short' }),
      value: Math.round(baseValue * (0.7 + Math.random() * 0.6)),
      previousValue: Math.round(baseValue * (0.6 + Math.random() * 0.5))
    }))
  }
}

// Demo page component for testing all examples
export function AllDemosPage() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Layout Examples</h1>
        <p className="text-muted-foreground mt-2">
          Integration examples showing T1.3 analytics components with the layout system
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(DEMO_CONFIGS).map(([key, config]) => (
          <div key={key} className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{config.description}</p>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Features:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {config.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Components Used:</h4>
              <div className="flex flex-wrap gap-1">
                {config.usedComponents.map((component, index) => (
                  <span
                    key={index}
                    className="text-xs bg-muted px-2 py-1 rounded"
                  >
                    {component}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default {
  AnalyticsDashboardDemo,
  SalesModuleDemo,
  MarketingModuleDemo,
  AllDemosPage,
  DEMO_CONFIGS,
  mockDataGenerators,
  demoUtils
}