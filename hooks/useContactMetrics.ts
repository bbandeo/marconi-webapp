"use client"

import { useMemo } from "react"
import type { Contact } from "./useContacts"

export function useContactMetrics(contacts: Contact[]) {
  return useMemo(() => {
    const totalContacts = contacts.length
    const newContacts = contacts.filter((c) => c.status === "new").length
    const contactedContacts = contacts.filter((c) => c.status === "contacted").length
    const qualifiedContacts = contacts.filter((c) => c.status === "qualified").length
    const convertedContacts = contacts.filter((c) => c.status === "converted").length

    const conversionRate = totalContacts > 0 ? (convertedContacts / totalContacts) * 100 : 0

    const averageScore =
      contacts.length > 0 ? contacts.reduce((sum, c) => sum + (c.score || 0), 0) / contacts.length : 0

    // Calculate contacts this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const contactsThisWeek = contacts.filter((c) => new Date(c.createdAt) >= oneWeekAgo).length

    // Calculate overdue actions
    const today = new Date()
    const overdueActions = contacts.filter((c) => c.nextActionDate && new Date(c.nextActionDate) < today).length

    // Source statistics
    const sourceStats = contacts.reduce(
      (acc, contact) => {
        const source = contact.source || "Unknown"
        acc[source] = (acc[source] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Priority statistics
    const priorityStats = contacts.reduce(
      (acc, contact) => {
        const priority = contact.priority || "medium"
        acc[priority] = (acc[priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Weekly data for chart
    const weeklyData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayContacts = contacts.filter((c) => c.createdAt.startsWith(dateStr)).length

      const dayConverted = contacts.filter((c) => c.createdAt.startsWith(dateStr) && c.status === "converted").length

      weeklyData.push({
        date: date.toLocaleDateString("es-AR", { month: "short", day: "numeric" }),
        contacts: dayContacts,
        converted: dayConverted,
      })
    }

    return {
      totalContacts,
      newContacts,
      contactedContacts,
      qualifiedContacts,
      convertedContacts,
      conversionRate,
      averageScore,
      contactsThisWeek,
      overdueActions,
      sourceStats,
      priorityStats,
      weeklyData,
    }
  }, [contacts])
}
