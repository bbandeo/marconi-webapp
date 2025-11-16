"use client"

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  Target,
  Building,
  Users
} from 'lucide-react'

interface ModuleTab {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

interface ModuleTabsProps {
  className?: string
}

const MODULE_TABS: ModuleTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/admin/analytics',
    icon: BarChart3,
    badge: 4
  },
  {
    id: 'sales',
    label: 'Sales',
    href: '/admin/analytics/sales',
    icon: TrendingUp
  },
  {
    id: 'marketing',
    label: 'Marketing',
    href: '/admin/analytics/marketing',
    icon: Target,
    badge: 12
  },
  {
    id: 'properties',
    label: 'Properties',
    href: '/admin/analytics/properties',
    icon: Building
  },
  {
    id: 'customers',
    label: 'Customers',
    href: '/admin/analytics/customers',
    icon: Users
  }
]

/**
 * ModuleTabs Component
 * Horizontal tabs for switching between analytics modules
 * Visible on desktop/tablet, hidden on mobile (uses bottom nav instead)
 */
export default function ModuleTabs({ className }: ModuleTabsProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Determine active tab based on current pathname
  const getActiveTab = (): string => {
    if (pathname === '/admin/analytics') return 'overview'
    if (pathname.startsWith('/admin/analytics/sales')) return 'sales'
    if (pathname.startsWith('/admin/analytics/marketing')) return 'marketing'
    if (pathname.startsWith('/admin/analytics/properties')) return 'properties'
    if (pathname.startsWith('/admin/analytics/customers')) return 'customers'
    return 'overview'
  }

  const activeTab = getActiveTab()

  const handleTabClick = (href: string) => {
    router.push(href)
  }

  return (
    <div
      className={cn(
        "hidden lg:block w-full border-b bg-card/30 backdrop-blur-sm",
        className
      )}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {MODULE_TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.href)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative",
                  "border-b-2 whitespace-nowrap",
                  "hover:bg-accent/50 hover:text-foreground",
                  isActive
                    ? "border-brand-orange text-foreground bg-card"
                    : "border-transparent text-muted-foreground"
                )}
              >
                {/* Icon */}
                <Icon className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isActive && "text-brand-orange"
                )} />

                {/* Label */}
                <span>{tab.label}</span>

                {/* Badge (if present) */}
                {tab.badge && (
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={cn(
                      "h-5 min-w-[20px] text-xs",
                      isActive && "bg-brand-orange hover:bg-brand-orange/90"
                    )}
                  >
                    {tab.badge}
                  </Badge>
                )}

                {/* Active indicator line (additional visual) */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
