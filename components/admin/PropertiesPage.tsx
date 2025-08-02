"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Home, Plus, Search, Edit, Trash2, Star, Eye, MoreHorizontal, MapPin, Bed, Bath, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getOptimizedImageUrl } from "@/lib/cloudinary"
import type { Property } from "@/lib/supabase"

interface PropertyWithStats extends Property {
  views?: number
  leads?: number
}

interface PropertyImageProps {
  images: string[]
  title: string
}

function PropertyImage({ images, title }: PropertyImageProps) {
  const [imageError, setImageError] = useState(false)
  const firstImage = images && images.length > 0 ? images[0] : null

  if (!firstImage || imageError) {
    return (
      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
        <Home className="w-6 h-6 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700">
      <img
        src={
          getOptimizedImageUrl(firstImage, { width: 48, height: 48, crop: "fill" || "/placeholder.svg" }) ||
          "/placeholder.svg"
        }
        alt={title}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  )
}

export default function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<PropertyWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties")
      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || [])
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFeatured = async (propertyId: number, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          featured: !currentFeatured,
        }),
      })

      if (response.ok) {
        setProperties((prev) =>
          prev.map((property) => (property.id === propertyId ? { ...property, featured: !currentFeatured } : property)),
        )
      }
    } catch (error) {
      console.error("Error toggling featured status:", error)
    }
  }

  const deleteProperty = async (propertyId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) {
      return
    }

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProperties((prev) => prev.filter((property) => property.id !== propertyId))
      }
    } catch (error) {
      console.error("Error deleting property:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
      case "Disponible":
        return "bg-green-500 text-white"
      case "sold":
      case "Vendido":
        return "bg-red-500 text-white"
      case "rented":
      case "Alquilado":
        return "bg-blue-500 text-white"
      case "reserved":
      case "Reservado":
        return "bg-yellow-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getPropertyTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      casa: "Casa",
      departamento: "Departamento",
      terreno: "Terreno",
      local: "Local",
    }
    return typeMap[type] || type
  }

  const getOperationTypeLabel = (type: string) => {
    const operationMap: { [key: string]: string } = {
      venta: "Venta",
      alquiler: "Alquiler",
    }
    return operationMap[type] || type
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || property.status === statusFilter
    const matchesType = typeFilter === "all" || property.property_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Propiedades</h1>
          <p className="text-gray-300">Administra todas las propiedades del sistema</p>
        </div>
        <Button
          onClick={() => router.push("/admin/properties/new")}
          className="bg-brand-orange hover:bg-brand-orange/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Propiedad
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Propiedades",
            value: properties.length.toString(),
            color: "bg-blue-500",
            icon: Home,
          },
          {
            label: "Disponibles",
            value: properties.filter((p) => p.status === "available").length.toString(),
            color: "bg-green-500",
            icon: Home,
          },
          {
            label: "Vendidas",
            value: properties.filter((p) => p.status === "sold").length.toString(),
            color: "bg-red-500",
            icon: Home,
          },
          {
            label: "Destacadas",
            value: properties.filter((p) => p.featured).length.toString(),
            color: "bg-brand-orange",
            icon: Star,
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

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar propiedades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-brand-orange focus:ring-brand-orange"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white focus:border-brand-orange focus:ring-brand-orange">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-600">
                    Todos
                  </SelectItem>
                  <SelectItem value="available" className="text-white hover:bg-gray-600">
                    Disponible
                  </SelectItem>
                  <SelectItem value="sold" className="text-white hover:bg-gray-600">
                    Vendido
                  </SelectItem>
                  <SelectItem value="rented" className="text-white hover:bg-gray-600">
                    Alquilado
                  </SelectItem>
                  <SelectItem value="reserved" className="text-white hover:bg-gray-600">
                    Reservado
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white focus:border-brand-orange focus:ring-brand-orange">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-600">
                    Todos
                  </SelectItem>
                  <SelectItem value="casa" className="text-white hover:bg-gray-600">
                    Casa
                  </SelectItem>
                  <SelectItem value="departamento" className="text-white hover:bg-gray-600">
                    Departamento
                  </SelectItem>
                  <SelectItem value="terreno" className="text-white hover:bg-gray-600">
                    Terreno
                  </SelectItem>
                  <SelectItem value="local" className="text-white hover:bg-gray-600">
                    Local
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-gray-400">{filteredProperties.length} propiedades encontradas</p>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-200">Propiedad</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-200">Tipo</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-200">Precio</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-200">Estado</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-200">Ubicación</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-200">Estadísticas</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-200">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <PropertyImage images={property.images || []} title={property.title} />
                        <div>
                          <h3 className="font-medium text-white">{property.title}</h3>
                          <div className="flex items-center text-sm text-gray-400 space-x-4">
                            {property.bedrooms && (
                              <span className="flex items-center">
                                <Bed className="w-3 h-3 mr-1" />
                                {property.bedrooms}
                              </span>
                            )}
                            {property.bathrooms && (
                              <span className="flex items-center">
                                <Bath className="w-3 h-3 mr-1" />
                                {property.bathrooms}
                              </span>
                            )}
                            {property.area_m2 && (
                              <span className="flex items-center">
                                <Square className="w-3 h-3 mr-1" />
                                {property.area_m2}m²
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-white">{getPropertyTypeLabel(property.property_type)}</p>
                        <p className="text-xs text-gray-400">{getOperationTypeLabel(property.operation_type)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-white">{formatPrice(property.price)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-sm text-gray-400">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{property.neighborhood || property.city}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-400 space-y-1">
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {property.views || 0} vistas
                        </div>
                        <div>{property.leads || 0} consultas</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeatured(property.id, property.featured)}
                          className="p-1 hover:bg-gray-600"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              property.featured ? "text-brand-orange fill-current" : "text-gray-400"
                            }`}
                          />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-1 hover:bg-gray-600 text-gray-300">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-700 border-gray-600">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/properties/${property.id}/edit`)}
                              className="text-white hover:bg-gray-600"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteProperty(property.id)}
                              className="text-red-400 hover:bg-gray-600 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
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

          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No se encontraron propiedades</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza agregando tu primera propiedad"}
              </p>
              {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
                <Button
                  onClick={() => router.push("/admin/properties/new")}
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Propiedad
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
