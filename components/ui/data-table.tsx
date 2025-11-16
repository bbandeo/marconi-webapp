"use client"

import React, { forwardRef, useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown, Search, ChevronsUpDown } from "lucide-react"
import { Input } from "./input"

/**
 * Column definition interface
 */
export interface ColumnDef<T> {
  /** Unique column identifier */
  id: string
  /** Column header text */
  header: string
  /** Function to extract cell value from row data */
  accessorFn: (row: T) => React.ReactNode
  /** Whether this column is sortable */
  sortable?: boolean
  /** Custom cell renderer */
  cell?: (props: { value: React.ReactNode; row: T }) => React.ReactNode
  /** Column width classes */
  className?: string
  /** Whether to center align the column */
  center?: boolean
}

/**
 * Sort direction type
 */
type SortDirection = "asc" | "desc" | null

/**
 * Data Table component props
 */
export interface DataTableProps<T>
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Table data */
  data: T[]
  /** Column definitions */
  columns: ColumnDef<T>[]
  /** Loading state */
  loading?: boolean
  /** Enable pagination */
  pagination?: boolean
  /** Items per page (when pagination is enabled) */
  pageSize?: number
  /** Enable sorting */
  sorting?: boolean
  /** Enable filtering/search */
  filtering?: boolean
  /** Search placeholder text */
  searchPlaceholder?: string
  /** Empty state message */
  emptyMessage?: string
  /** Function to get unique row identifier */
  getRowId?: (row: T, index: number) => string
}

/**
 * Data Table Component
 *
 * A flexible and accessible data table with sorting, filtering, and pagination.
 * Designed specifically for analytics dashboards with consistent styling.
 *
 * @example
 * ```tsx
 * const columns: ColumnDef<PropertyData>[] = [
 *   {
 *     id: "name",
 *     header: "Property Name",
 *     accessorFn: (row) => row.name,
 *     sortable: true
 *   },
 *   {
 *     id: "views",
 *     header: "Views",
 *     accessorFn: (row) => row.views,
 *     sortable: true,
 *     center: true,
 *     cell: ({ value }) => <KPICard value={value} format="number" />
 *   }
 * ]
 *
 * <DataTable
 *   data={properties}
 *   columns={columns}
 *   sorting
 *   filtering
 *   pagination
 *   searchPlaceholder="Search properties..."
 * />
 * ```
 */
export const DataTable = forwardRef<HTMLDivElement, DataTableProps<any>>(
  ({
    className,
    data,
    columns,
    loading = false,
    pagination = false,
    pageSize = 10,
    sorting = false,
    filtering = false,
    searchPlaceholder = "Buscar...",
    emptyMessage = "No hay datos disponibles",
    getRowId = (row, index) => index.toString(),
    ...props
  }, ref) => {
    const [sortColumn, setSortColumn] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    // Filter data based on search term
    const filteredData = useMemo(() => {
      if (!filtering || !searchTerm.trim()) return data

      return data.filter((row) =>
        columns.some((column) => {
          const value = column.accessorFn(row)
          return value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }, [data, columns, filtering, searchTerm])

    // Sort data
    const sortedData = useMemo(() => {
      if (!sorting || !sortColumn || !sortDirection) return filteredData

      const column = columns.find((col) => col.id === sortColumn)
      if (!column) return filteredData

      return [...filteredData].sort((a, b) => {
        const aValue = column.accessorFn(a)
        const bValue = column.accessorFn(b)

        // Handle different data types
        let comparison = 0
        if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue
        } else {
          const aStr = (aValue || "").toString()
          const bStr = (bValue || "").toString()
          comparison = aStr.localeCompare(bStr, "es")
        }

        return sortDirection === "asc" ? comparison : -comparison
      })
    }, [filteredData, sortColumn, sortDirection, columns, sorting])

    // Paginate data
    const paginatedData = useMemo(() => {
      if (!pagination) return sortedData

      const startIndex = (currentPage - 1) * pageSize
      return sortedData.slice(startIndex, startIndex + pageSize)
    }, [sortedData, pagination, currentPage, pageSize])

    // Calculate pagination info
    const totalPages = Math.ceil(sortedData.length / pageSize)

    // Handle sorting
    const handleSort = (columnId: string) => {
      if (!sorting) return

      const column = columns.find((col) => col.id === columnId)
      if (!column?.sortable) return

      if (sortColumn === columnId) {
        if (sortDirection === "asc") {
          setSortDirection("desc")
        } else if (sortDirection === "desc") {
          setSortDirection(null)
          setSortColumn(null)
        } else {
          setSortDirection("asc")
        }
      } else {
        setSortColumn(columnId)
        setSortDirection("asc")
      }
    }

    // Get sort icon
    const getSortIcon = (columnId: string) => {
      if (sortColumn !== columnId) return ChevronsUpDown
      if (sortDirection === "asc") return ChevronUp
      if (sortDirection === "desc") return ChevronDown
      return ChevronsUpDown
    }

    // Loading skeleton
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn("widget-container", className)}
          {...props}
        >
          {filtering && (
            <div className="mb-4">
              <div className="analytics-skeleton-text w-64 h-10" />
            </div>
          )}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                {columns.map((_, j) => (
                  <div
                    key={j}
                    className="analytics-skeleton-text h-4 flex-1"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn("widget-container", className)}
        {...props}
      >
        {/* Search */}
        {filtering && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-support-gray" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // Reset to first page when filtering
                }}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={cn(
                      column.className,
                      column.center && "text-center",
                      column.sortable && sorting && "cursor-pointer hover:bg-support-gray/10 transition-colors"
                    )}
                    onClick={() => handleSort(column.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {column.sortable && sorting && (
                        <span className="text-support-gray">
                          {React.createElement(getSortIcon(column.id), {
                            className: "w-4 h-4"
                          })}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-8 text-support-gray"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => {
                  const rowId = getRowId(row, index)
                  return (
                    <tr key={rowId}>
                      {columns.map((column) => {
                        const value = column.accessorFn(row)
                        const cellContent = column.cell
                          ? column.cell({ value, row })
                          : value

                        return (
                          <td
                            key={column.id}
                            className={cn(
                              column.className,
                              column.center && "text-center"
                            )}
                          >
                            {cellContent}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-support-gray/20">
            <div className="text-data-sm text-support-gray">
              Página {currentPage} de {totalPages}
              ({sortedData.length} elementos total)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-data-sm border border-support-gray/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-support-gray/10 transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-data-sm border border-support-gray/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-support-gray/10 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
)

DataTable.displayName = "DataTable"

export default DataTable