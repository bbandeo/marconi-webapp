"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ModuleTabs from '@/components/navigation/module-tabs'

interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

interface AnalyticsDashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  actions?: React.ReactNode
  filters?: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  className?: string
  loading?: boolean
}

export function AnalyticsDashboardLayout({
  children,
  title,
  subtitle,
  actions,
  filters,
  breadcrumbs,
  className,
  loading = false
}: AnalyticsDashboardLayoutProps) {
  return (
    <div className={cn("analytics-dashboard-layout min-h-screen bg-background", className)}>
      {/* Module Tabs Navigation (Desktop/Tablet only) */}
      <ModuleTabs />

      {/* Header Section */}
      <div className="analytics-dashboard-header border-b bg-card/50">
        <div className="container mx-auto px-4 py-4 lg:px-6 lg:py-6">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
              <Home className="h-4 w-4" />
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <ChevronRight className="h-4 w-4" />
                  {item.href && !item.active ? (
                    <a
                      href={item.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className={cn(
                      item.active && "text-foreground font-medium"
                    )}>
                      {item.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Title and Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg text-muted-foreground">
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

          {/* Filters */}
          {filters && (
            <div className="mt-6 pt-4 border-t">
              {filters}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <main className="analytics-dashboard-content">
        <div className="container mx-auto px-4 py-6 lg:px-6">
          {loading ? (
            <div className="space-y-6">
              <div className="animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-muted rounded-lg h-32"></div>
                  ))}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-muted rounded-lg h-96"></div>
                  <div className="bg-muted rounded-lg h-96"></div>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  )
}

// Quick breadcrumb builder utility
export function buildAnalyticsBreadcrumbs(
  module?: string,
  subModule?: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Analytics', href: '/admin/analytics' }
  ]

  if (module) {
    breadcrumbs.push({
      label: module,
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

export default AnalyticsDashboardLayout