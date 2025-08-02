"use client"

import { useState } from "react"
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Search,
  Eye,
  MoreHorizontal,
  Users,
  TrendingUp,
  Clock,
  Star,
  Grid3X3,
  List,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { useContacts } from "@/hooks/useContacts"
import { useContactFilters } from "@/hooks/useContactFilters"
import { useContactActions } from "@/hooks/useContactActions"
import ContactDetailModal from "@/components/admin/ContactDetailModal"
import ContactKanban from "@/components/admin/ContactKanban"

export default function ContactsPage() {
  const { contacts, loading, updateContact, deleteContact } = useContacts()
  const { openWhatsApp, openEmail, callContact } = useContactActions()
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    priorityFilter,
    setPriorityFilter,
    dateFilter,
    setDateFilter,
    filteredContacts,
  } = useContactFilters(contacts)

  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table")

  const handleContactClick = (contact: any) => {
    setSelectedContact(contact)
    setIsModalOpen(true)
  }

  const handleStatusChange = async (contactId: number, newStatus: any) => {
    try {
      await updateContact(contactId, { status: newStatus })
    } catch (error) {
      console.error("Error updating contact status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "contacted":
        return "bg-yellow-100 text-yellow-800"
      case "qualified":
        return "bg-purple-100 text-purple-800"
      case "converted":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "Nuevo"
      case "contacted":
        return "Contactado"
      case "qualified":
        return "Calificado"
      case "converted":
        return "Convertido"
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta"
      case "medium":
        return "Media"
      case "low":
        return "Baja"
      default:
        return priority
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

  const stats = {
    total: contacts.length,
    new: contacts.filter((c) => c.status === "new").length,
    contacted: contacts.filter((c) => c.status === "contacted").length,
    qualified: contacts.filter((c) => c.status === "qualified").length,
    converted: contacts.filter((c) => c.status === "converted").length,
    highPriority: contacts.filter((c) => c.priority === "high").length,
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contactos y Leads</h1>
          <p className="text-gray-600">Gestiona todas las consultas y potenciales clientes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant={viewMode === "table" ? "default" : "outline"} size="sm" onClick={() => setViewMode("table")}>
            <List className="w-4 h-4 mr-2" />
            Tabla
          </Button>
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("kanban")}
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Pipeline
          </Button>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {[
          { label: "Total Contactos", value: stats.total, color: "bg-blue-500", icon: Users },
          { label: "Nuevos", value: stats.new, color: "bg-blue-500", icon: Plus },
          { label: "Contactados", value: stats.contacted, color: "bg-yellow-500", icon: Phone },
          { label: "Calificados", value: stats.qualified, color: "bg-purple-500", icon: Star },
          { label: "Convertidos", value: stats.converted, color: "bg-green-500", icon: TrendingUp },
          { label: "Alta Prioridad", value: stats.highPriority, color: "bg-red-500", icon: Clock },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar contactos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="new">Nuevo</SelectItem>
                <SelectItem value="contacted">Contactado</SelectItem>
                <SelectItem value="qualified">Calificado</SelectItem>
                <SelectItem value="converted">Convertido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Fuente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fuentes</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === "kanban" ? (
        <ContactKanban
          contacts={filteredContacts}
          onContactClick={handleContactClick}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Contacto</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Propiedad</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Estado</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Prioridad</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Puntuación</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Fuente</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Fecha</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleContactClick(contact)}
                    >
                      <td className="py-4 px-6">
                        <div>
                          <h3 className="font-medium text-gray-900">{contact.name}</h3>
                          <div className="text-sm text-gray-500 space-y-1">
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {contact.email}
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {contact.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-medium text-gray-900">{contact.property}</p>
                        <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">{contact.message}</p>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={getStatusColor(contact.status)}>{getStatusLabel(contact.status)}</Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={getPriorityColor(contact.priority)}>
                          {getPriorityLabel(contact.priority)}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1">
                          {getScoreStars(contact.score)}
                          <span className="text-xs text-gray-500 ml-2">({contact.score}/10)</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-900">{contact.source}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-500">
                          <span>{new Date(contact.createdAt).toLocaleDateString("es-AR")}</span>
                          {contact.nextActionDate && (
                            <div className="flex items-center text-orange-600 mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span className="text-xs">
                                {new Date(contact.nextActionDate).toLocaleDateString("es-AR")}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              callContact(contact)
                            }}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEmail(contact)
                            }}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              openWhatsApp(contact)
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="p-1" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleContactClick(contact)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalle
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteContact(contact.id)} className="text-red-600">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredContacts.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron contactos</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  sourceFilter !== "all" ||
                  priorityFilter !== "all" ||
                  dateFilter !== "all"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Los contactos aparecerán aquí cuando lleguen consultas"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contact Detail Modal */}
      <ContactDetailModal
        contact={selectedContact}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={updateContact}
      />
    </div>
  )
}
