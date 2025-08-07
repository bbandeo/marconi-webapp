"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { X, Plus, Upload, GripVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const propertySchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  currency: z.enum(["USD", "ARS"]),
  property_type: z.enum(["casa", "departamento", "terreno", "local"]),
  operation_type: z.enum(["venta", "alquiler"]),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  area_m2: z.number().min(1, "El área es requerida"),
  address: z.string().min(1, "La dirección es requerida"),
  neighborhood: z.string().min(1, "El barrio es requerido"),
  city: z.string().default("Reconquista"),
  province: z.string().default("Santa Fe"),
  featured: z.boolean().default(false),
  status: z.enum(["available", "sold", "rented", "reserved"]).default("available"),
})

type PropertyFormData = z.infer<typeof propertySchema>

interface PropertyFormProps {
  property?: any
  onSubmit?: (data: PropertyFormData) => void
}

interface SortableImageItemProps {
  id: string
  image: string
  index: number
  onRemove: (index: number) => void
  isFirst: boolean
}

function SortableImageItem({ id, image, index, onRemove, isFirst }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-white rounded-lg border shadow-sm"
    >
      <div className="relative">
        <img
          src={image || "/placeholder.svg"}
          alt={`Imagen ${index + 1}`}
          className="w-full h-32 object-cover rounded-t-lg"
        />
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 p-1 bg-black bg-opacity-50 rounded cursor-move hover:bg-opacity-70 transition-colors"
        >
          <GripVertical className="h-4 w-4 text-white" />
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
          onClick={() => onRemove(index)}
        >
          <X className="h-4 w-4" />
        </Button>
        {isFirst && (
          <Badge className="absolute bottom-2 left-2 bg-blue-600">
            Principal
          </Badge>
        )}
      </div>
      <div className="p-2 text-center">
        <span className="text-xs text-gray-500">Imagen {index + 1}</span>
      </div>
    </div>
  )
}

const PropertyForm = ({ property, onSubmit }: PropertyFormProps) => {
  const router = useRouter()
  const [images, setImages] = useState<string[]>([])
  const [features, setFeatures] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: property?.title || "",
      description: property?.description || "",
      price: property?.price || 0,
      currency: property?.currency || "USD",
      property_type: property?.property_type || "casa",
      operation_type: property?.operation_type || "venta",
      bedrooms: property?.bedrooms || undefined,
      bathrooms: property?.bathrooms || undefined,
      area_m2: property?.area_m2 || 0,
      address: property?.address || "",
      neighborhood: property?.neighborhood || "",
      city: property?.city || "Reconquista",
      province: property?.province || "Santa Fe",
      featured: property?.featured || false,
      status: property?.status || "available",
    },
  })

  const propertyType = watch("property_type")

  useEffect(() => {
    if (property) {
      setImages(Array.isArray(property.images) ? property.images : [])
      setFeatures(Array.isArray(property.features) ? property.features : [])
    }
  }, [property])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    const formData = new FormData()

    Array.from(files).forEach((file) => {
      formData.append("files", file)
    })

    try {
      const response = await fetch("/api/upload/multiple", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir imágenes")
      }

      const data = await response.json()

      // Check if the response has urls and it's an array
      if (data.success && Array.isArray(data.urls)) {
        setImages((prev) => [...prev, ...data.urls])
        toast({
          title: "Éxito",
          description: `${data.urls.length} imagen(es) subida(s) correctamente`,
        })
      } else {
        throw new Error("Respuesta inválida del servidor")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al subir las imágenes",
        variant: "destructive",
      })
    } finally {
      setUploadingImages(false)
      // Clear the input
      if (event.target) {
        event.target.value = ""
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const activeIndex = images.findIndex((_, index) => `image-${index}` === active.id)
      const overIndex = images.findIndex((_, index) => `image-${index}` === over.id)

      if (activeIndex !== -1 && overIndex !== -1) {
        setImages((items) => arrayMove(items, activeIndex, overIndex))
        toast({
          title: "Orden actualizado",
          description: "El orden de las imágenes ha sido actualizado. La primera imagen será la principal.",
        })
      }
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures((prev) => [...prev, newFeature.trim()])
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index))
  }

  const onFormSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true)

    try {
      const propertyData = {
        ...data,
        images,
        features,
      }

      if (onSubmit) {
        onSubmit(propertyData)
      } else {
        const url = property ? `/api/properties/${property.id}` : "/api/properties"
        const method = property ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(propertyData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al guardar la propiedad")
        }

        toast({
          title: "Éxito",
          description: property ? "Propiedad actualizada correctamente" : "Propiedad creada correctamente",
        })
        router.push("/admin/properties")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la propiedad",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
          <CardDescription>Datos principales de la propiedad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input id="title" {...register("title")} placeholder="Ej: Casa familiar en Barrio Parque" />
              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="property_type">Tipo de Propiedad *</Label>
              <Select value={watch("property_type")} onValueChange={(value) => setValue("property_type", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="departamento">Departamento</SelectItem>
                  <SelectItem value="terreno">Terreno</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                </SelectContent>
              </Select>
              {errors.property_type && <p className="text-sm text-red-600 mt-1">{errors.property_type.message}</p>}
            </div>

            <div>
              <Label htmlFor="operation_type">Tipo de Operación *</Label>
              <Select
                value={watch("operation_type")}
                onValueChange={(value) => setValue("operation_type", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar operación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venta">Venta</SelectItem>
                  <SelectItem value="alquiler">Alquiler</SelectItem>
                </SelectContent>
              </Select>
              {errors.operation_type && <p className="text-sm text-red-600 mt-1">{errors.operation_type.message}</p>}
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={watch("status")} onValueChange={(value) => setValue("status", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="sold">Vendido</SelectItem>
                  <SelectItem value="rented">Alquilado</SelectItem>
                  <SelectItem value="reserved">Reservado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descripción detallada de la propiedad..."
              rows={4}
            />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Precio y características */}
      <Card>
        <CardHeader>
          <CardTitle>Precio y Características</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Precio *</Label>
              <Input id="price" type="number" {...register("price", { valueAsNumber: true })} placeholder="0" />
              {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Select value={watch("currency")} onValueChange={(value) => setValue("currency", value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="ARS">ARS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="area_m2">Área (m²) *</Label>
              <Input id="area_m2" type="number" {...register("area_m2", { valueAsNumber: true })} placeholder="0" />
              {errors.area_m2 && <p className="text-sm text-red-600 mt-1">{errors.area_m2.message}</p>}
            </div>
          </div>

          {(propertyType === "casa" || propertyType === "departamento") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bedrooms">Dormitorios</Label>
                <Input id="bedrooms" type="number" {...register("bedrooms", { valueAsNumber: true })} placeholder="0" />
              </div>

              <div>
                <Label htmlFor="bathrooms">Baños</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  {...register("bathrooms", { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ubicación */}
      <Card>
        <CardHeader>
          <CardTitle>Ubicación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Dirección *</Label>
            <Input id="address" {...register("address")} placeholder="Ej: Belgrano 1234" />
            {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="neighborhood">Barrio *</Label>
              <Input id="neighborhood" {...register("neighborhood")} placeholder="Ej: Centro" />
              {errors.neighborhood && <p className="text-sm text-red-600 mt-1">{errors.neighborhood.message}</p>}
            </div>

            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" {...register("city")} placeholder="Reconquista" />
            </div>

            <div>
              <Label htmlFor="province">Provincia</Label>
              <Input id="province" {...register("province")} placeholder="Santa Fe" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Imágenes */}
      <Card>
        <CardHeader>
          <CardTitle>Imágenes</CardTitle>
          <CardDescription>Sube imágenes de la propiedad (máximo 10 imágenes)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="images">Subir Imágenes</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click para subir</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG o JPEG (MAX. 5MB cada una)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages || images.length >= 10}
                  />
                </label>
              </div>
              {uploadingImages && (
                <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Subiendo imágenes...
                </p>
              )}
            </div>

            {images.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GripVertical className="h-4 w-4" />
                  <span>Arrastra las imágenes para cambiar el orden. La primera será la imagen principal.</span>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={images.map((_, index) => `image-${index}`)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <SortableImageItem
                          key={`image-${index}`}
                          id={`image-${index}`}
                          image={image}
                          index={index}
                          onRemove={removeImage}
                          isFirst={index === 0}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {images.length > 0 && (
              <p className="text-sm text-gray-600">
                {images.length}/10 imágenes subidas. La primera imagen será la principal.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Características */}
      <Card>
        <CardHeader>
          <CardTitle>Características</CardTitle>
          <CardDescription>Agrega características especiales de la propiedad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Ej: Pileta, Garage, Jardín"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
              />
              <Button type="button" onClick={addFeature} disabled={!newFeature.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {feature}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Opciones adicionales */}
      <Card>
        <CardHeader>
          <CardTitle>Opciones Adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={watch("featured")}
              onCheckedChange={(checked) => setValue("featured", !!checked)}
            />
            <Label htmlFor="featured">Marcar como propiedad destacada</Label>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/properties")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : property ? "Actualizar" : "Crear"} Propiedad
        </Button>
      </div>
    </form>
  )
}

export default PropertyForm
