"use client"

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar,
  Filter,
  RefreshCw,
  X,
  ChevronDown,
  CalendarDays
} from 'lucide-react'

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export interface QuickFilter {
  id: string
  label: string
  value: string | number
  active?: boolean
  count?: number
}

export interface FilterOption {
  id: string
  label: string
  type: 'select' | 'input' | 'date' | 'multiselect'
  options?: Array<{ value: string; label: string }>
  value?: any
  placeholder?: string
}

interface FilterBarProps {
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange) => void
  quickFilters?: QuickFilter[]
  onQuickFilterToggle?: (filterId: string) => void
  customFilters?: FilterOption[]
  onCustomFilterChange?: (filterId: string, value: any) => void
  onReset?: () => void
  className?: string
  compact?: boolean
  hideQuickFilters?: boolean
  hideDateRange?: boolean
}

const predefinedRanges = [
  { label: 'Últimos 7 días', days: 7 },
  { label: 'Últimos 30 días', days: 30 },
  { label: 'Últimos 90 días', days: 90 },
  { label: 'Este año', days: 365 },
]

export function FilterBar({
  dateRange,
  onDateRangeChange,
  quickFilters = [],
  onQuickFilterToggle,
  customFilters = [],
  onCustomFilterChange,
  onReset,
  className,
  compact = false,
  hideQuickFilters = false,
  hideDateRange = false
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const activeFiltersCount = quickFilters.filter(f => f.active).length +
    customFilters.filter(f => f.value !== undefined && f.value !== '').length

  const handleDateRangeSelect = (days: number) => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)

    onDateRangeChange?.({ from, to })
  }

  const hasActiveFilters = activeFiltersCount > 0 ||
    (dateRange?.from && dateRange?.to)

  return (
    <div className={cn(
      "filter-bar space-y-4",
      compact && "space-y-2",
      className
    )}>
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Picker */}
          {!hideDateRange && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[200px] justify-start">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                    ) : (
                      dateRange.from.toLocaleDateString()
                    )
                  ) : (
                    "Seleccionar período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Rangos rápidos</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {predefinedRanges.map((range) => (
                        <Button
                          key={range.days}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDateRangeSelect(range.days)}
                        >
                          {range.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {/* Aquí iría un date picker real como react-day-picker */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Desde</Label>
                        <Input
                          type="date"
                          value={dateRange?.from?.toISOString().split('T')[0] || ''}
                          onChange={(e) => {
                            const newDate = e.target.value ? new Date(e.target.value) : undefined
                            onDateRangeChange?.({
                              from: newDate,
                              to: dateRange?.to
                            })
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Hasta</Label>
                        <Input
                          type="date"
                          value={dateRange?.to?.toISOString().split('T')[0] || ''}
                          onChange={(e) => {
                            const newDate = e.target.value ? new Date(e.target.value) : undefined
                            onDateRangeChange?.({
                              from: dateRange?.from,
                              to: newDate
                            })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Advanced Filters Toggle */}
          {customFilters.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform",
                showAdvanced && "rotate-180"
              )} />
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RefreshCw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Quick Filters */}
      {!hideQuickFilters && quickFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <FilterChip
              key={filter.id}
              filter={filter}
              onToggle={() => onQuickFilterToggle?.(filter.id)}
            />
          ))}
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && customFilters.length > 0 && (
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {customFilters.map((filter) => (
              <CustomFilterField
                key={filter.id}
                filter={filter}
                onChange={(value) => onCustomFilterChange?.(filter.id, value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FilterChip({
  filter,
  onToggle
}: {
  filter: QuickFilter
  onToggle: () => void
}) {
  return (
    <Button
      variant={filter.active ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className="h-8 gap-2"
    >
      {filter.label}
      {filter.count !== undefined && (
        <Badge variant={filter.active ? "secondary" : "outline"} className="h-4 text-xs">
          {filter.count}
        </Badge>
      )}
      {filter.active && (
        <X className="h-3 w-3" />
      )}
    </Button>
  )
}

function CustomFilterField({
  filter,
  onChange
}: {
  filter: FilterOption
  onChange: (value: any) => void
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">{filter.label}</Label>

      {filter.type === 'select' && (
        <Select value={filter.value || ''} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={filter.placeholder || `Seleccionar ${filter.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {filter.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {filter.type === 'input' && (
        <Input
          value={filter.value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={filter.placeholder}
        />
      )}

      {filter.type === 'date' && (
        <Input
          type="date"
          value={filter.value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}

// Preset filters para diferentes módulos
export const salesFilters: QuickFilter[] = [
  { id: 'hot-leads', label: 'Hot Leads', value: 'hot', count: 12 },
  { id: 'closed-won', label: 'Cerrados', value: 'won', count: 8 },
  { id: 'pipeline', label: 'En Pipeline', value: 'pipeline', count: 24 },
]

export const marketingFilters: QuickFilter[] = [
  { id: 'organic', label: 'Orgánico', value: 'organic', count: 156 },
  { id: 'paid', label: 'Pagado', value: 'paid', count: 89 },
  { id: 'social', label: 'Social Media', value: 'social', count: 45 },
  { id: 'email', label: 'Email', value: 'email', count: 23 },
]

export const propertyFilters: QuickFilter[] = [
  { id: 'high-performance', label: 'Alto Rendimiento', value: 'high', count: 15 },
  { id: 'new-listings', label: 'Nuevos', value: 'new', count: 8 },
  { id: 'price-reduced', label: 'Precio Reducido', value: 'reduced', count: 5 },
]

export default FilterBar