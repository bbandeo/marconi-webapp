"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  Target,
  Building,
  Users
} from 'lucide-react'

interface MobileNavItem {
  id: string
  label: string
  shortLabel: string // Shorter label for mobile
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    shortLabel: 'Home',
    href: '/admin/analytics',
    icon: BarChart3,
    badge: 4
  },
  {
    id: 'sales',
    label: 'Sales',
    shortLabel: 'Sales',
    href: '/admin/analytics/sales',
    icon: TrendingUp
  },
  {
    id: 'marketing',
    label: 'Marketing',
    shortLabel: 'Leads',
    href: '/admin/analytics/marketing',
    icon: Target,
    badge: 12
  },
  {
    id: 'properties',
    label: 'Properties',
    shortLabel: 'Props',
    href: '/admin/analytics/properties',
    icon: Building
  },
  {
    id: 'customers',
    label: 'Customers',
    shortLabel: 'Users',
    href: '/admin/analytics/customers',
    icon: Users
  }
]

/**
 * MobileBottomNav Component
 * Fixed bottom navigation bar for mobile devices
 * Provides quick access to all 5 analytics modules
 * Hidden on desktop/tablet (≥lg breakpoint)
 */
export default function MobileBottomNav() {
  const pathname = usePathname()

  // Determine active item based on current pathname
  const getActiveItem = (): string => {
    if (pathname === '/admin/analytics') return 'overview'
    if (pathname.startsWith('/admin/analytics/sales')) return 'sales'
    if (pathname.startsWith('/admin/analytics/marketing')) return 'marketing'
    if (pathname.startsWith('/admin/analytics/properties')) return 'properties'
    if (pathname.startsWith('/admin/analytics/customers')) return 'customers'
    return 'overview'
  }

  const activeItem = getActiveItem()

  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 inset-x-0 z-50",
        "bg-card/95 backdrop-blur-sm border-t shadow-lg",
        // Safe area padding for iOS devices (notch/home indicator)
        "pb-safe"
      )}
    >
      <div className="grid grid-cols-5 gap-0.5 px-1 py-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.id
          const Icon = item.icon

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-1",
                "rounded-lg transition-colors",
                "min-h-[56px]", // Minimum touch target size
                isActive
                  ? "text-brand-orange"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {/* Icon with badge */}
              <div className="relative flex items-center justify-center">
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive && "text-brand-orange"
                )} />

                {/* Badge indicator */}
                {item.badge && (
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={cn(
                      "absolute -top-2 -right-2 h-4 min-w-[16px] text-[10px] px-1",
                      "flex items-center justify-center",
                      isActive && "bg-brand-orange hover:bg-brand-orange/90"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>

              {/* Label */}
              <span className={cn(
                "text-[10px] font-medium leading-tight text-center",
                isActive && "text-brand-orange"
              )}>
                {item.shortLabel}
              </span>

              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-orange rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
