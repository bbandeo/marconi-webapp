"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MessageCircle, User, Calendar, Star } from "lucide-react"
import type { Contact } from "@/hooks/useContacts"
import { useContactActions } from "@/hooks/useContactActions"

interface ContactKanbanProps {
  contacts: Contact[]
  onContactClick: (contact: Contact) => void
  onStatusChange: (contactId: number, newStatus: Contact["status"]) => void
}

const statusConfig = {
  new: { label: "Nuevos", color: "bg-blue-500", count: 0 },
  contacted: { label: "Contactados", color: "bg-yellow-500", count: 0 },
  qualified: { label: "Calificados", color: "bg-purple-500", count: 0 },
  converted: { label: "Convertidos", color: "bg-green-500", count: 0 },
}

export default function ContactKanban({ contacts, onContactClick, onStatusChange }: ContactKanbanProps) {
  const [draggedContact, setDraggedContact] = useState<Contact | null>(null)
  const { openWhatsApp, openEmail, callContact } = useContactActions()

  const contactsByStatus = contacts.reduce(
    (acc, contact) => {
      if (!acc[contact.status]) acc[contact.status] = []
      acc[contact.status].push(contact)
      return acc
    },
    {} as Record<Contact["status"], Contact[]>,
  )

  const handleDragStart = (e: React.DragEvent, contact: Contact) => {
    setDraggedContact(contact)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, newStatus: Contact["status"]) => {
    e.preventDefault()
    if (draggedContact && draggedContact.status !== newStatus) {
      onStatusChange(draggedContact.id, newStatus)
    }
    setDraggedContact(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-300"
    }
  }

  const getScoreStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(score / 2) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(statusConfig).map(([status, config]) => {
        const statusContacts = contactsByStatus[status as Contact["status"]] || []

        return (
          <div
            key={status}
            className="space-y-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status as Contact["status"])}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>{config.label}</span>
                  <Badge variant="secondary">{statusContacts.length}</Badge>
                </CardTitle>
                <div className={`h-1 ${config.color} rounded-full`} />
              </CardHeader>
            </Card>

            <div className="space-y-3 min-h-[400px]">
              {statusContacts.map((contact) => (
                <Card
                  key={contact.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(contact.priority)}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, contact)}
                  onClick={() => onContactClick(contact)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <h3 className="font-medium text-sm">{contact.name}</h3>
                        </div>
                        <div className="flex items-center space-x-1">{getScoreStars(contact.score)}</div>
                      </div>

                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{contact.phone}</span>
                        </div>
                      </div>

                      <div className="text-xs">
                        <p className="font-medium text-gray-700 truncate">{contact.property}</p>
                        <p className="text-gray-500">{new Date(contact.createdAt).toLocaleDateString("es-AR")}</p>
                      </div>

                      {contact.nextActionDate && (
                        <div className="flex items-center space-x-1 text-xs text-orange-600">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(contact.nextActionDate).toLocaleDateString("es-AR")}</span>
                        </div>
                      )}

                      <div className="flex space-x-1 pt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            callContact(contact)
                          }}
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEmail(contact)
                          }}
                        >
                          <Mail className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            openWhatsApp(contact)
                          }}
                        >
                          <MessageCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
