"use client"

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Users,
  Building,
  Target,
  Menu,
  X
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
  active?: boolean
  children?: NavigationItem[]
}

interface SidebarNavigationProps {
  items: NavigationItem[]
  collapsed?: boolean
  onToggle?: () => void
  defaultCollapsed?: boolean
  className?: string
}

const defaultNavigationItems: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview Ejecutivo',
    icon: BarChart3,
    href: '/admin/analytics',
    badge: 4
  },
  {
    id: 'sales',
    label: 'Sales Performance',
    icon: TrendingUp,
    href: '/admin/analytics/sales',
    children: [
      { id: 'pipeline', label: 'Pipeline', icon: TrendingUp, href: '/admin/analytics/sales/pipeline' },
      { id: 'funnel', label: 'Funnel', icon: TrendingUp, href: '/admin/analytics/sales/funnel' }
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing & Leads',
    icon: Target,
    href: '/admin/analytics/marketing',
    badge: 12
  },
  {
    id: 'properties',
    label: 'Property Analytics',
    icon: Building,
    href: '/admin/analytics/properties'
  },
  {
    id: 'customers',
    label: 'Customer Insights',
    icon: Users,
    href: '/admin/analytics/customers'
  }
]

export function SidebarNavigation({
  items = defaultNavigationItems,
  collapsed: controlledCollapsed,
  onToggle,
  defaultCollapsed = false,
  className
}: SidebarNavigationProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed)
  const collapsed = controlledCollapsed ?? internalCollapsed

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalCollapsed(!collapsed)
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-card border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}>
        <SidebarContent
          items={items}
          collapsed={collapsed}
          onToggle={handleToggle}
        />
      </aside>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileSidebar items={items} />
      </div>
    </>
  )
}

function SidebarContent({
  items,
  collapsed,
  onToggle
}: {
  items: NavigationItem[]
  collapsed: boolean
  onToggle: () => void
}) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-foreground">
            Analytics
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {items.map((item) => (
            <NavigationItemComponent
              key={item.id}
              item={item}
              collapsed={collapsed}
              expanded={expandedItems.includes(item.id)}
              onToggleExpanded={() => toggleExpanded(item.id)}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        {!collapsed ? (
          <div className="text-xs text-muted-foreground">
            <p>Analytics Dashboard v4</p>
            <p>Marconi Inmobiliaria</p>
          </div>
        ) : (
          <div className="h-8" />
        )}
      </div>
    </>
  )
}

function NavigationItemComponent({
  item,
  collapsed,
  expanded,
  onToggleExpanded,
  level = 0
}: {
  item: NavigationItem
  collapsed: boolean
  expanded: boolean
  onToggleExpanded: () => void
  level?: number
}) {
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      {/* Main Item */}
      <Button
        variant={item.active ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start h-auto p-2",
          collapsed && "px-2",
          level > 0 && "ml-4 w-auto"
        )}
        onClick={hasChildren ? onToggleExpanded : undefined}
        asChild={!hasChildren}
      >
        {hasChildren ? (
          <div className="flex items-center">
            <item.icon className={cn(
              "h-4 w-4 flex-shrink-0",
              collapsed ? "mr-0" : "mr-3"
            )} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-sm">
                  {item.label}
                </span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 h-5 text-xs">
                    {item.badge}
                  </Badge>
                )}
                <ChevronRight className={cn(
                  "h-3 w-3 ml-2 transition-transform",
                  expanded && "rotate-90"
                )} />
              </>
            )}
          </div>
        ) : (
          <a href={item.href} className="flex items-center w-full">
            <item.icon className={cn(
              "h-4 w-4 flex-shrink-0",
              collapsed ? "mr-0" : "mr-3"
            )} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-sm">
                  {item.label}
                </span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 h-5 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </a>
        )}
      </Button>

      {/* Children */}
      {hasChildren && expanded && !collapsed && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child) => (
            <NavigationItemComponent
              key={child.id}
              item={child}
              collapsed={false}
              expanded={false}
              onToggleExpanded={() => {}}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MobileSidebar({ items }: { items: NavigationItem[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h2 className="text-lg font-semibold">Analytics</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <nav className="p-2 space-y-1">
              {items.map((item) => (
                <MobileNavigationItem
                  key={item.id}
                  item={item}
                  onItemClick={() => setOpen(false)}
                />
              ))}
            </nav>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MobileNavigationItem({
  item,
  onItemClick,
  level = 0
}: {
  item: NavigationItem
  onItemClick: () => void
  level?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      <Button
        variant={item.active ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start h-auto p-3",
          level > 0 && "ml-4 w-auto"
        )}
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded)
          } else {
            onItemClick()
          }
        }}
        asChild={!hasChildren}
      >
        {hasChildren ? (
          <div className="flex items-center">
            <item.icon className="h-4 w-4 mr-3" />
            <span className="flex-1 text-left">
              {item.label}
            </span>
            {item.badge && (
              <Badge variant="secondary" className="ml-2">
                {item.badge}
              </Badge>
            )}
            <ChevronRight className={cn(
              "h-3 w-3 ml-2 transition-transform",
              expanded && "rotate-90"
            )} />
          </div>
        ) : (
          <a href={item.href} className="flex items-center w-full">
            <item.icon className="h-4 w-4 mr-3" />
            <span className="flex-1 text-left">
              {item.label}
            </span>
            {item.badge && (
              <Badge variant="secondary" className="ml-2">
                {item.badge}
              </Badge>
            )}
          </a>
        )}
      </Button>

      {hasChildren && expanded && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child) => (
            <MobileNavigationItem
              key={child.id}
              item={child}
              onItemClick={onItemClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SidebarNavigation