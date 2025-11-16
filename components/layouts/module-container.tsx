"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ModuleType = 'overview' | 'sales' | 'marketing' | 'properties' | 'customers'

interface ModuleContainerProps {
  module: ModuleType
  title: string
  subtitle?: string
  icon?: LucideIcon
  children: React.ReactNode
  headerActions?: React.ReactNode
  footerActions?: React.ReactNode
  badge?: string | number
  variant?: 'default' | 'bordered' | 'elevated'
  className?: string
}

const moduleStyles: Record<ModuleType, string> = {
  overview: 'border-l-chart-primary bg-gradient-to-r from-chart-primary/5 to-transparent',
  sales: 'border-l-chart-secondary bg-gradient-to-r from-chart-secondary/5 to-transparent',
  marketing: 'border-l-chart-tertiary bg-gradient-to-r from-chart-tertiary/5 to-transparent',
  properties: 'border-l-chart-quaternary bg-gradient-to-r from-chart-quaternary/5 to-transparent',
  customers: 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20'
}

const moduleIconColors: Record<ModuleType, string> = {
  overview: 'text-chart-primary',
  sales: 'text-chart-secondary',
  marketing: 'text-chart-tertiary',
  properties: 'text-chart-quaternary',
  customers: 'text-blue-500'
}

export function ModuleContainer({
  module,
  title,
  subtitle,
  icon: Icon,
  children,
  headerActions,
  footerActions,
  badge,
  variant = 'default',
  className
}: ModuleContainerProps) {
  return (
    <div className={cn(
      "module-container",
      variant === 'elevated' && "shadow-lg",
      className
    )}>
      <Card className={cn(
        "border-l-4 transition-all duration-200 hover:shadow-md",
        moduleStyles[module],
        variant === 'bordered' && "border-2",
        variant === 'elevated' && "shadow-md"
      )}>
        {/* Module Header */}
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {Icon && (
                <div className={cn(
                  "flex-shrink-0 p-2 rounded-lg bg-background/50",
                  moduleIconColors[module]
                )}>
                  <Icon className="h-5 w-5" />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold tracking-tight">
                    {title}
                  </h3>
                  {badge && (
                    <Badge variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  )}
                </div>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {headerActions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>

        {/* Module Content */}
        <CardContent className="pt-0">
          {children}
        </CardContent>

        {/* Module Footer */}
        {footerActions && (
          <div className="px-6 pb-6">
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                {footerActions}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// Variante compacta para dashboards densos
export function CompactModuleContainer({
  module,
  title,
  children,
  icon: Icon,
  badge,
  className
}: Pick<ModuleContainerProps, 'module' | 'title' | 'children' | 'icon' | 'badge' | 'className'>) {
  return (
    <Card className={cn(
      "border-l-4 transition-all duration-200",
      moduleStyles[module],
      className
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {Icon && (
              <Icon className={cn("h-4 w-4", moduleIconColors[module])} />
            )}
            <h4 className="font-medium text-sm">
              {title}
            </h4>
            {badge && (
              <Badge variant="outline" className="text-xs h-5">
                {badge}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {children}
        </div>
      </div>
    </Card>
  )
}

export default ModuleContainer