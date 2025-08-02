"use client"

import { useState, useMemo } from "react"
import type { Contact } from "./useContacts"

export interface ContactFilters {
  search: string
  status: string
  source: string
  priority: string
  dateFrom: string
  dateTo: string
}

export function useContactFilters(contacts: Contact[]) {
  const [filters, setFilters] = useState<ContactFilters>({
    search: "",
    status: "",
    source: "",
    priority: "",
    dateFrom: "",
    dateTo: "",
  })

  const [sortBy, setSortBy] = useState<keyof Contact>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const filteredContacts = useMemo(() => {
    let filtered = [...contacts]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower) ||
          contact.phone.includes(filters.search) ||
          contact.property.toLowerCase().includes(searchLower) ||
          (contact.message && contact.message.toLowerCase().includes(searchLower)),
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((contact) => contact.status === filters.status)
    }

    // Source filter
    if (filters.source) {
      filtered = filtered.filter((contact) => contact.source === filters.source)
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter((contact) => contact.priority === filters.priority)
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter((contact) => new Date(contact.createdAt) >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      filtered = filtered.filter((contact) => new Date(contact.createdAt) <= new Date(filters.dateTo))
    }

    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]

      if (aValue === bValue) return 0

      let comparison = 0
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [contacts, filters, sortBy, sortOrder])

  const updateFilter = (key: keyof ContactFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      source: "",
      priority: "",
      dateFrom: "",
      dateTo: "",
    })
  }

  const updateSort = (field: keyof Contact) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  // Get unique values for filter options
  const filterOptions = useMemo(
    () => ({
      statuses: [...new Set(contacts.map((c) => c.status))],
      sources: [...new Set(contacts.map((c) => c.source))],
      priorities: [...new Set(contacts.map((c) => c.priority))],
    }),
    [contacts],
  )

  return {
    filters,
    filteredContacts,
    sortBy,
    sortOrder,
    updateFilter,
    clearFilters,
    updateSort,
    filterOptions,
  }
}
