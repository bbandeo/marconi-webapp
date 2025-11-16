// Analytics Layout System
// Complete layout system for analytics dashboards with responsive design

// Main Layout Components
export {
  default as AnalyticsDashboardLayout,
  buildAnalyticsBreadcrumbs,
  type BreadcrumbItem
} from './analytics-dashboard-layout'

export {
  ModuleContainer,
  type ModuleType
} from './module-container'

// Grid System Components
export {
  default as WidgetGrid,
  KPIGrid,
  ChartGrid,
  ContentGrid,
  MasonryGrid
} from './widget-grid'

// Navigation Components
export {
  SidebarNavigation,
  type NavigationItem
} from './sidebar-navigation'

// Filter System
export {
  FilterBar,
  type DateRange,
  type QuickFilter,
  type FilterOption
} from './filter-bar'

// Responsive System
export {
  default as ResponsiveWrapper,
  ResponsiveContainer,
  ResponsiveShow,
  ResponsiveHide,
  MobileOnly,
  TabletOnly,
  DesktopOnly,
  WideOnly,
  HideOnMobile,
  HideOnDesktop,
  AdaptiveLayout,
  AnalyticsGrid,
  ResponsiveKPIGrid,
  ResponsiveChartGrid,
  useBreakpoint,
  useIsMobile,
  useIsTabletOrMobile,
  useIsDesktopOrWide,
  breakpointClasses,
  type ResponsiveBreakpoint
} from './responsive-wrapper'

// Note: Individual hooks are available in their respective files
// Import them directly when needed to avoid circular dependencies

// Layout Constants and Utilities
export const LAYOUT_CONSTANTS = {
  // Breakpoints (must match tailwind.config.ts)
  BREAKPOINTS: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440
  },

  // Sidebar widths
  SIDEBAR_WIDTHS: {
    collapsed: 64,
    mobile: 280,
    tablet: 240,
    desktop: 280,
    wide: 320
  },

  // Grid gaps
  GRID_GAPS: {
    sm: 'gap-3',
    md: 'gap-4 lg:gap-6',
    lg: 'gap-6 lg:gap-8'
  },

  // Container padding
  CONTAINER_PADDING: {
    mobile: 'px-4',
    tablet: 'px-4 sm:px-6',
    desktop: 'px-6 lg:px-8',
    wide: 'px-8 xl:px-10'
  }
} as const

// Pre-configured layout presets for common use cases
export const LAYOUT_PRESETS = {
  // Overview Dashboard - 4 KPIs + 2 main charts
  overview: {
    kpis: { columns: 'auto', gap: 'md', density: 'comfortable' },
    charts: { layout: 'balanced', gap: 'lg' },
    sidebar: { defaultCollapsed: false, width: 280 }
  },

  // Sales Dashboard - focus on performance metrics
  sales: {
    kpis: { columns: 4, gap: 'md', density: 'compact' },
    charts: { layout: 'focus', gap: 'md' },
    sidebar: { defaultCollapsed: true, width: 240 }
  },

  // Marketing Dashboard - campaign and lead focus
  marketing: {
    kpis: { columns: 'auto', gap: 'lg', density: 'spacious' },
    charts: { layout: 'split', gap: 'lg' },
    sidebar: { defaultCollapsed: false, width: 320 }
  },

  // Properties Dashboard - map integration focus
  properties: {
    kpis: { columns: 3, gap: 'md', density: 'comfortable' },
    charts: { layout: 'single', gap: 'lg' },
    sidebar: { defaultCollapsed: true, width: 280 }
  },

  // Customer Dashboard - detailed analytics
  customers: {
    kpis: { columns: 'auto', gap: 'md', density: 'comfortable' },
    charts: { layout: 'balanced', gap: 'md' },
    sidebar: { defaultCollapsed: false, width: 300 }
  }
} as const

// Utility functions for layout configuration
export const layoutUtils = {
  // Get responsive grid classes based on content type
  getGridClasses: (contentType: 'kpi' | 'chart' | 'table', breakpoint: string) => {
    const gridMap = {
      kpi: {
        mobile: 'grid-cols-1',
        tablet: 'grid-cols-2',
        desktop: 'grid-cols-2 lg:grid-cols-4',
        wide: 'grid-cols-4 2xl:grid-cols-6'
      },
      chart: {
        mobile: 'grid-cols-1',
        tablet: 'grid-cols-1',
        desktop: 'grid-cols-1 lg:grid-cols-2',
        wide: 'grid-cols-2 2xl:grid-cols-3'
      },
      table: {
        mobile: 'grid-cols-1',
        tablet: 'grid-cols-1',
        desktop: 'grid-cols-1',
        wide: 'grid-cols-1'
      }
    }

    return gridMap[contentType][breakpoint as keyof typeof gridMap[typeof contentType]] || gridMap[contentType].desktop
  },

  // Get sidebar configuration for module
  getSidebarConfig: (moduleId: keyof typeof LAYOUT_PRESETS) => {
    return LAYOUT_PRESETS[moduleId].sidebar
  },

  // Generate breadcrumbs for analytics pages
  generateBreadcrumbs: (module: string, subModule?: string) => {
    const breadcrumbs = [
      { label: 'Admin', href: '/admin' },
      { label: 'Analytics', href: '/admin/analytics' }
    ]

    if (module) {
      breadcrumbs.push({
        label: module.charAt(0).toUpperCase() + module.slice(1),
        href: `/admin/analytics/${module.toLowerCase()}`,
        active: !subModule
      })
    }

    if (subModule) {
      breadcrumbs.push({
        label: subModule,
        active: true
      })
    }

    return breadcrumbs
  }
}

// Module-specific navigation items
export const ANALYTICS_MODULES = [
  {
    id: 'overview',
    label: 'Overview Ejecutivo',
    icon: 'BarChart3',
    href: '/admin/analytics',
    description: 'Vista general de métricas clave',
    badge: 4
  },
  {
    id: 'sales',
    label: 'Sales Performance',
    icon: 'TrendingUp',
    href: '/admin/analytics/sales',
    description: 'Rendimiento de ventas y pipeline',
    children: [
      { id: 'pipeline', label: 'Pipeline', href: '/admin/analytics/sales/pipeline' },
      { id: 'funnel', label: 'Funnel', href: '/admin/analytics/sales/funnel' },
      { id: 'agents', label: 'Agentes', href: '/admin/analytics/sales/agents' }
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing & Leads',
    icon: 'Target',
    href: '/admin/analytics/marketing',
    description: 'Generación de leads y campañas',
    badge: 12
  },
  {
    id: 'properties',
    label: 'Property Analytics',
    icon: 'Building',
    href: '/admin/analytics/properties',
    description: 'Análisis de propiedades y mercado'
  },
  {
    id: 'customers',
    label: 'Customer Insights',
    icon: 'Users',
    href: '/admin/analytics/customers',
    description: 'Comportamiento y journey de clientes'
  }
] as const

// Type exports for convenience
export type LayoutPresetKey = keyof typeof LAYOUT_PRESETS
export type AnalyticsModuleId = typeof ANALYTICS_MODULES[number]['id']