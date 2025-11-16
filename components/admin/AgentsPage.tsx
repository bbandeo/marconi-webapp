"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Users, Mail, Phone, MessageCircle, User, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { getOptimizedImageUrl } from "@/lib/cloudinary"
import AgentForm from "./AgentForm"
import type { Agent } from "@/lib/supabase"
import type { AgentFormData } from "@/types/agent"

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/agents")
      if (!response.ok) throw new Error("Error al obtener agentes")

      const data = await response.json()
      setAgents(data.agents || [])
    } catch (error) {
      console.error("Error fetching agents:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los agentes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingAgent(null)
    setIsModalOpen(true)
  }

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent)
    setIsModalOpen(true)
  }

  const handleDelete = (agent: Agent) => {
    setAgentToDelete(agent)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!agentToDelete) return

    try {
      const response = await fetch(`/api/agents/${agentToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar agente")
      }

      toast({
        title: "Éxito",
        description: "Agente eliminado correctamente",
      })

      setAgents((prev) => prev.filter((a) => a.id !== agentToDelete.id))
      setDeleteDialogOpen(false)
      setAgentToDelete(null)
    } catch (error) {
      console.error("Error deleting agent:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el agente",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (agent: Agent) => {
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !agent.active }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar agente")
      }

      const updatedAgent = await response.json()

      toast({
        title: "Éxito",
        description: `Agente ${updatedAgent.active ? "activado" : "desactivado"} correctamente`,
      })

      setAgents((prev) => prev.map((a) => (a.id === updatedAgent.id ? updatedAgent : a)))
    } catch (error) {
      console.error("Error toggling agent active status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el agente",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (data: AgentFormData) => {
    setIsSubmitting(true)

    try {
      let photoUrl = editingAgent?.photo_url || null
      let photoPublicId = editingAgent?.photo_public_id || null

      // Upload photo if a new one was selected
      if (data.photo && data.photo.size > 0) {
        const formData = new FormData()
        formData.append("file", data.photo)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) throw new Error("Error al subir la foto")

        const uploadResult = await uploadResponse.json()
        photoUrl = uploadResult.url
        photoPublicId = uploadResult.public_id
      }

      // Prepare agent data
      const agentData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        bio: data.bio || null,
        specialty: data.specialty || null,
        years_of_experience: data.years_of_experience || null,
        photo_url: photoUrl,
        photo_public_id: photoPublicId,
      }

      // Create or update agent
      const url = editingAgent ? `/api/agents/${editingAgent.id}` : "/api/agents"
      const method = editingAgent ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al guardar agente")
      }

      const savedAgent = await response.json()

      toast({
        title: "Éxito",
        description: editingAgent ? "Agente actualizado correctamente" : "Agente creado correctamente",
      })

      // Update local state
      if (editingAgent) {
        setAgents((prev) => prev.map((a) => (a.id === savedAgent.id ? savedAgent : a)))
      } else {
        setAgents((prev) => [savedAgent, ...prev])
      }

      setIsModalOpen(false)
      setEditingAgent(null)
    } catch (error) {
      console.error("Error saving agent:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar el agente",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredAgents = agents.filter((agent) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      agent.name.toLowerCase().includes(search) ||
      agent.email.toLowerCase().includes(search) ||
      agent.phone?.toLowerCase().includes(search) ||
      agent.specialty?.toLowerCase().includes(search)
    )
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-700 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse" />
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
          <h1 className="text-2xl font-bold text-white">Gestión de Agentes</h1>
          <p className="text-gray-300">Administra los agentes de Marconi Inmobiliaria</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-brand-orange hover:bg-orange-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Agente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Agentes",
            value: agents.length.toString(),
            color: "bg-blue-500",
            icon: Users,
          },
          {
            label: "Activos",
            value: agents.filter((a) => a.active).length.toString(),
            color: "bg-green-500",
            icon: Users,
          },
          {
            label: "Inactivos",
            value: agents.filter((a) => !a.active).length.toString(),
            color: "bg-gray-500",
            icon: Users,
          },
        ].map((stat, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, email, teléfono o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-brand-orange focus:ring-brand-orange"
            />
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              {searchTerm ? "No se encontraron agentes" : "No hay agentes registrados"}
            </h3>
            <p className="text-gray-400 mb-4">
              {searchTerm
                ? "Intenta con otro término de búsqueda"
                : "Comienza creando tu primer agente"}
            </p>
            {!searchTerm && (
              <Button
                onClick={handleCreate}
                className="bg-brand-orange hover:bg-orange-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Agente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => {
            const photoUrl = agent.photo_public_id
              ? getOptimizedImageUrl(agent.photo_public_id, {
                  width: 96,
                  height: 96,
                  crop: "fill",
                  gravity: "face",
                })
              : agent.photo_url

            return (
              <Card key={agent.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Photo */}
                    <div className="relative">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={agent.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-700"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-700 border-4 border-gray-600 flex items-center justify-center">
                          <User className="w-12 h-12 text-gray-500" />
                        </div>
                      )}
                      <Badge
                        variant={agent.active ? "default" : "secondary"}
                        className={`absolute -bottom-1 -right-1 ${
                          agent.active ? "bg-green-500" : "bg-gray-500"
                        }`}
                      >
                        {agent.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>

                  {/* Name and Specialty */}
                  <div className="w-full">
                    <h3 className="text-lg font-semibold text-white mb-1">{agent.name}</h3>
                    {agent.specialty && (
                      <p className="text-sm text-gray-400">{agent.specialty}</p>
                    )}
                    {agent.years_of_experience !== null && agent.years_of_experience > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {agent.years_of_experience} {agent.years_of_experience === 1 ? "año" : "años"} de experiencia
                      </p>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-center text-sm text-gray-300">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{agent.email}</span>
                    </div>
                    <div className="flex items-center justify-center text-sm text-gray-300">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{agent.phone}</span>
                    </div>
                    {agent.whatsapp && (
                      <div className="flex items-center justify-center text-sm text-gray-300">
                        <MessageCircle className="w-4 h-4 mr-2 text-green-400" />
                        <span>{agent.whatsapp}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 w-full pt-4 border-t border-gray-700">
                    <Button
                      onClick={() => handleToggleActive(agent)}
                      variant="outline"
                      className={`w-full ${
                        agent.active
                          ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                          : "bg-green-700 border-green-600 text-white hover:bg-green-600"
                      }`}
                    >
                      <Power className="w-4 h-4 mr-2" />
                      {agent.active ? "Desactivar" : "Activar"}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(agent)}
                        variant="outline"
                        className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDelete(agent)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingAgent ? "Editar Agente" : "Crear Nuevo Agente"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingAgent
                ? "Actualiza la información del agente"
                : "Completa el formulario para crear un nuevo agente"}
            </DialogDescription>
          </DialogHeader>
          <AgentForm
            agent={editingAgent}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false)
              setEditingAgent(null)
            }}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">¿Eliminar agente?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              ¿Estás seguro de que deseas eliminar a <strong className="text-white">{agentToDelete?.name}</strong>?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
