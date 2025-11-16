"use client"

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SidebarNavigation } from '@/components/layouts/sidebar-navigation'
import MobileBottomNav from './mobile-bottom-nav'
import CommandPalette from './command-palette'
import {
  BarChart3,
  TrendingUp,
  Target,
  Building,
  Users
} from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
  active?: boolean
  children?: NavigationItem[]
}

interface AnalyticsLayoutWrapperProps {
  children: React.ReactNode
}

/**
 * Analytics Layout Wrapper
 * Wraps all analytics pages with the SidebarNavigation component
 * Automatically detects active module based on current pathname
 */
export default function AnalyticsLayoutWrapper({
  children
}: AnalyticsLayoutWrapperProps) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Analytics navigation items with active state detection
  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Overview Ejecutivo',
      icon: BarChart3,
      href: '/admin/analytics',
      badge: 4,
      active: pathname === '/admin/analytics'
    },
    {
      id: 'sales',
      label: 'Sales Performance',
      icon: TrendingUp,
      href: '/admin/analytics/sales',
      active: pathname.startsWith('/admin/analytics/sales')
    },
    {
      id: 'marketing',
      label: 'Marketing & Leads',
      icon: Target,
      href: '/admin/analytics/marketing',
      badge: 12,
      active: pathname.startsWith('/admin/analytics/marketing')
    },
    {
      id: 'properties',
      label: 'Property Analytics',
      icon: Building,
      href: '/admin/analytics/properties',
      active: pathname.startsWith('/admin/analytics/properties')
    },
    {
      id: 'customers',
      label: 'Customer Insights',
      icon: Users,
      href: '/admin/analytics/customers',
      active: pathname.startsWith('/admin/analytics/customers')
    }
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation - Desktop & Mobile */}
      <SidebarNavigation
        items={navigationItems}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        defaultCollapsed={false}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          // Add left padding on desktop to account for sidebar
          "lg:ml-0", // Sidebar is position:fixed, so no margin needed
          // Add bottom padding on mobile to prevent content being hidden by bottom nav
          "pb-20 lg:pb-0"
        )}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation - Mobile only */}
      <MobileBottomNav />

      {/* Command Palette - Global search (Cmd+K) */}
      <CommandPalette />
    </div>
  )
}
