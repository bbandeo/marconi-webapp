"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Mail, MessageCircle, User, Building, Clock, Star, Save } from "lucide-react"
import type { Contact } from "@/hooks/useContacts"
import { useContactActions } from "@/hooks/useContactActions"

interface ContactDetailModalProps {
  contact: Contact | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: number, updates: Partial<Contact>) => Promise<void>
}

export default function ContactDetailModal({ contact, isOpen, onClose, onUpdate }: ContactDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Contact>>({})
  const [saving, setSaving] = useState(false)

  const { openWhatsApp, openEmail, callContact } = useContactActions()

  if (!contact) return null

  const handleEdit = () => {
    setFormData({
      status: contact.status,
      priority: contact.priority,
      notes: contact.notes || "",
      nextAction: contact.nextAction || "",
      nextActionDate: contact.nextActionDate || "",
      score: contact.score,
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await onUpdate(contact.id, {
        ...formData,
        lastContact: new Date().toISOString(),
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating contact:", error)
    } finally {
      setSaving(false)
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

  const getScoreStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(score / 2) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalle del Contacto</span>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
              <Badge className={getPriorityColor(contact.priority)}>{contact.priority}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">{contact.email}</p>
                  <p className="text-sm text-gray-500">Email</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">{contact.phone}</p>
                  <p className="text-sm text-gray-500">Teléfono</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">{contact.property}</p>
                  <p className="text-sm text-gray-500">Propiedad de interés</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">{contact.source}</p>
                  <p className="text-sm text-gray-500">Fuente</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">{new Date(contact.createdAt).toLocaleDateString("es-AR")}</p>
                  <p className="text-sm text-gray-500">Fecha de contacto</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Mensaje inicial</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">{contact.message}</p>
            </div>
          </div>

          {/* Score */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Puntuación</Label>
            <div className="flex items-center space-x-2 mt-1">
              {getScoreStars(contact.score)}
              <span className="text-sm text-gray-500">({contact.score}/10)</span>
            </div>
          </div>

          {/* Editable Fields */}
          {isEditing ? (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as Contact["status"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nuevo</SelectItem>
                      <SelectItem value="contacted">Contactado</SelectItem>
                      <SelectItem value="qualified">Calificado</SelectItem>
                      <SelectItem value="converted">Convertido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, priority: value as Contact["priority"] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="nextAction">Próxima acción</Label>
                <Input
                  id="nextAction"
                  value={formData.nextAction || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nextAction: e.target.value }))}
                  placeholder="Ej: Llamar para coordinar visita"
                />
              </div>

              <div>
                <Label htmlFor="nextActionDate">Fecha de próxima acción</Label>
                <Input
                  id="nextActionDate"
                  type="datetime-local"
                  value={formData.nextActionDate || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nextActionDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="score">Puntuación (1-10)</Label>
                <Input
                  id="score"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.score || 5}
                  onChange={(e) => setFormData((prev) => ({ ...prev, score: Number.parseInt(e.target.value) }))}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Agregar notas sobre el contacto..."
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 border-t pt-4">
              {contact.nextAction && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Próxima acción</Label>
                  <p className="text-sm mt-1">{contact.nextAction}</p>
                  {contact.nextActionDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Programada para: {new Date(contact.nextActionDate).toLocaleString("es-AR")}
                    </p>
                  )}
                </div>
              )}

              {contact.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Notas</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
                  </div>
                </div>
              )}

              {contact.lastContact && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Último contacto</Label>
                  <p className="text-sm mt-1">{new Date(contact.lastContact).toLocaleString("es-AR")}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button onClick={() => callContact(contact)} variant="outline" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Llamar
            </Button>

            <Button onClick={() => openEmail(contact)} variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>

            <Button onClick={() => openWhatsApp(contact)} variant="outline" size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>

            <div className="ml-auto flex space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} size="sm" disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} size="sm">
                  Editar
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
