"use client"

import React, { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { useCommandPalette, useRecentSearches } from '@/stores/navigation-store'
import { toast } from 'sonner'
import {
  BarChart3,
  TrendingUp,
  Target,
  Building,
  Users,
  RefreshCw,
  Download,
  FileText,
  Clock,
  HelpCircle,
  Sparkles
} from 'lucide-react'

// =====================================================================================
// COMMAND DEFINITIONS
// =====================================================================================

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  keywords?: string[] // For fuzzy search
  onSelect: () => void
  shortcut?: string
}

// =====================================================================================
// COMMAND PALETTE COMPONENT
// =====================================================================================

export default function CommandPalette() {
  const router = useRouter()
  const { open, closePalette } = useCommandPalette()
  const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches()

  // Navigation commands
  const navigationCommands: CommandItem[] = [
    {
      id: 'nav-overview',
      label: 'Overview Ejecutivo',
      description: 'Vista general de métricas clave',
      icon: BarChart3,
      keywords: ['overview', 'home', 'dashboard', 'inicio', 'principal'],
      shortcut: '⌘1',
      onSelect: () => {
        router.push('/admin/analytics')
        addRecentSearch({ label: 'Overview Ejecutivo', href: '/admin/analytics' })
        closePalette()
      }
    },
    {
      id: 'nav-sales',
      label: 'Sales Performance',
      description: 'Rendimiento de ventas y pipeline',
      icon: TrendingUp,
      keywords: ['sales', 'ventas', 'pipeline', 'performance'],
      shortcut: '⌘2',
      onSelect: () => {
        router.push('/admin/analytics/sales')
        addRecentSearch({ label: 'Sales Performance', href: '/admin/analytics/sales' })
        closePalette()
      }
    },
    {
      id: 'nav-marketing',
      label: 'Marketing & Leads',
      description: 'Generación de leads y campañas',
      icon: Target,
      keywords: ['marketing', 'leads', 'campaigns', 'campañas', 'prospectos'],
      shortcut: '⌘3',
      onSelect: () => {
        router.push('/admin/analytics/marketing')
        addRecentSearch({ label: 'Marketing & Leads', href: '/admin/analytics/marketing' })
        closePalette()
      }
    },
    {
      id: 'nav-properties',
      label: 'Property Analytics',
      description: 'Análisis de propiedades y mercado',
      icon: Building,
      keywords: ['properties', 'propiedades', 'real estate', 'inmuebles'],
      shortcut: '⌘4',
      onSelect: () => {
        router.push('/admin/analytics/properties')
        addRecentSearch({ label: 'Property Analytics', href: '/admin/analytics/properties' })
        closePalette()
      }
    },
    {
      id: 'nav-customers',
      label: 'Customer Insights',
      description: 'Comportamiento y journey de clientes',
      icon: Users,
      keywords: ['customers', 'clientes', 'users', 'usuarios', 'insights'],
      shortcut: '⌘5',
      onSelect: () => {
        router.push('/admin/analytics/customers')
        addRecentSearch({ label: 'Customer Insights', href: '/admin/analytics/customers' })
        closePalette()
      }
    }
  ]

  // Quick action commands
  const actionCommands: CommandItem[] = [
    {
      id: 'action-refresh',
      label: 'Actualizar datos',
      description: 'Refrescar métricas y reportes',
      icon: RefreshCw,
      keywords: ['refresh', 'actualizar', 'reload', 'recargar'],
      shortcut: '⌘R',
      onSelect: () => {
        toast.success('Datos actualizados', {
          description: 'Métricas y reportes refrescados correctamente'
        })
        closePalette()
        // TODO: Trigger actual data refresh via React Query invalidation
      }
    },
    {
      id: 'action-export-pdf',
      label: 'Exportar a PDF',
      description: 'Descargar reporte en formato PDF',
      icon: FileText,
      keywords: ['export', 'exportar', 'pdf', 'download', 'descargar'],
      onSelect: () => {
        toast.info('Generando PDF...', {
          description: 'El reporte se descargará en breve'
        })
        closePalette()
        // TODO: Trigger PDF export
      }
    },
    {
      id: 'action-export-excel',
      label: 'Exportar a Excel',
      description: 'Descargar datos en formato Excel',
      icon: Download,
      keywords: ['export', 'exportar', 'excel', 'xlsx', 'download', 'descargar'],
      onSelect: () => {
        toast.info('Generando Excel...', {
          description: 'Los datos se descargarán en breve'
        })
        closePalette()
        // TODO: Trigger Excel export
      }
    },
    {
      id: 'action-help',
      label: 'Mostrar atajos de teclado',
      description: 'Ver lista de keyboard shortcuts',
      icon: HelpCircle,
      keywords: ['help', 'ayuda', 'shortcuts', 'atajos', 'keyboard'],
      shortcut: '?',
      onSelect: () => {
        toast.info('Atajos de teclado', {
          description: 'Presiona ? para ver todos los atajos disponibles'
        })
        closePalette()
        // TODO: Show shortcuts help modal
      }
    }
  ]

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!open) {
          useCommandPalette.getState().openCommandPalette()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <CommandDialog open={open} onOpenChange={closePalette}>
      <CommandInput placeholder="Buscar módulos, acciones..." />

      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>

        {/* Navigation Commands */}
        <CommandGroup heading="Navegación">
          {navigationCommands.map((command) => {
            const Icon = command.icon
            return (
              <CommandItem
                key={command.id}
                value={`${command.label} ${command.keywords?.join(' ')}`}
                onSelect={command.onSelect}
              >
                <Icon className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{command.label}</span>
                  {command.description && (
                    <span className="text-xs text-muted-foreground">
                      {command.description}
                    </span>
                  )}
                </div>
                {command.shortcut && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {command.shortcut}
                  </span>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="Acciones Rápidas">
          {actionCommands.map((command) => {
            const Icon = command.icon
            return (
              <CommandItem
                key={command.id}
                value={`${command.label} ${command.keywords?.join(' ')}`}
                onSelect={command.onSelect}
              >
                <Icon className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{command.label}</span>
                  {command.description && (
                    <span className="text-xs text-muted-foreground">
                      {command.description}
                    </span>
                  )}
                </div>
                {command.shortcut && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {command.shortcut}
                  </span>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recientes">
              {recentSearches.map((search) => (
                <CommandItem
                  key={search.id}
                  value={search.label}
                  onSelect={() => {
                    router.push(search.href)
                    closePalette()
                  }}
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{search.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      {/* Footer with hints */}
      <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>Presiona <kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd> para cerrar</span>
        <span>Navegación con <kbd className="px-1.5 py-0.5 bg-muted rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-muted rounded">↓</kbd></span>
      </div>
    </CommandDialog>
  )
}
