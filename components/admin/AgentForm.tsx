"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Upload, X, Loader2, User } from "lucide-react"
import { agentFormSchema, type AgentFormData } from "@/types/agent"
import type { Agent } from "@/lib/supabase"

interface AgentFormProps {
  agent?: Agent | null
  onSubmit: (data: AgentFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export default function AgentForm({ agent, onSubmit, onCancel, isSubmitting = false }: AgentFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: agent?.name || "",
      email: agent?.email || "",
      phone: agent?.phone || "",
      whatsapp: agent?.whatsapp || "",
      bio: agent?.bio || "",
      specialty: agent?.specialty || "",
      years_of_experience: agent?.years_of_experience || undefined,
    },
  })

  // Set photo preview if editing existing agent
  useEffect(() => {
    if (agent?.photo_url) {
      setPhotoPreview(agent.photo_url)
    }
  }, [agent])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      toast({
        title: "Error",
        description: "Solo se aceptan archivos JPG, PNG o WebP",
        variant: "destructive",
      })
      return
    }

    setPhotoFile(file)
    setValue("photo", file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(agent?.photo_url || null)
    setValue("photo", undefined)
  }

  const onFormSubmit = async (data: AgentFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Photo Upload */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Foto del Agente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-700"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 rounded-full h-8 w-8 p-0"
                  onClick={handleRemovePhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-gray-600 flex items-center justify-center">
                <User className="h-16 w-16 text-gray-500" />
              </div>
            )}

            <div className="flex flex-col items-center">
              <Label
                htmlFor="photo"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-brand-orange hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                {photoPreview ? "Cambiar Foto" : "Subir Foto"}
              </Label>
              <Input
                id="photo"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <span className="text-xs text-gray-400 mt-2">JPG, PNG o WebP (máx. 5MB)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200">
              Nombre Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              placeholder="Juan Pérez"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-200">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              placeholder="juan.perez@marconi.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-200">
              Teléfono <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              placeholder="+54 9 11 1234-5678"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-gray-200">
              WhatsApp
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              {...register("whatsapp")}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              placeholder="+54 9 11 1234-5678"
            />
            {errors.whatsapp && (
              <p className="text-sm text-red-500">{errors.whatsapp.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Información Profesional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Specialty */}
          <div className="space-y-2">
            <Label htmlFor="specialty" className="text-gray-200">
              Especialidad
            </Label>
            <Input
              id="specialty"
              {...register("specialty")}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              placeholder="Propiedades residenciales"
            />
            {errors.specialty && (
              <p className="text-sm text-red-500">{errors.specialty.message}</p>
            )}
          </div>

          {/* Years of Experience */}
          <div className="space-y-2">
            <Label htmlFor="years_of_experience" className="text-gray-200">
              Años de Experiencia
            </Label>
            <Input
              id="years_of_experience"
              type="number"
              min="0"
              {...register("years_of_experience", { valueAsNumber: true })}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              placeholder="5"
            />
            {errors.years_of_experience && (
              <p className="text-sm text-red-500">{errors.years_of_experience.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-gray-200">
              Biografía
            </Label>
            <Textarea
              id="bio"
              {...register("bio")}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 min-h-32"
              placeholder="Cuéntanos sobre tu experiencia y especialización..."
            />
            {errors.bio && (
              <p className="text-sm text-red-500">{errors.bio.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-orange hover:bg-orange-600 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>{agent ? "Actualizar Agente" : "Crear Agente"}</>
          )}
        </Button>
      </div>
    </form>
  )
}
