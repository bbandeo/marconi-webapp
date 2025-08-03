"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MapPin, Bed, Bath, Square, Heart, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { getOptimizedImageUrl } from "@/lib/cloudinary"

interface Property {
  id: string
  title: string
  price: number
  currency: string
  operation: "sale" | "rent"
  type: "house" | "apartment" | "commercial"
  address: string
  neighborhood: string
  bedrooms: number
  bathrooms: number
  area: number
  images: string[]
  featured: boolean
  status: "available" | "sold" | "rented"
  views: number
  createdAt: string
}

const ITEMS_PER_PAGE = 12

export default function PropiedadesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [operationFilter, setOperationFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [bedroomsFilter, setBedroomsFilter] = useState("all")
  const [bathroomsFilter, setBathroomsFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockProperties: Property[] = [
      {
        id: "1",
        title: "Casa moderna en centro",
        price: 85000,
        currency: "USD",
        operation: "sale",
        type: "house",
        address: "San Martín 1234",
        neighborhood: "Centro",
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        images: ["gustavo-papasergio-emoKYb99CRI-unsplash_w6gipy"],
        featured: true,
        status: "available",
        views: 245,
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        title: "Departamento luminoso",
        price: 95000,
        currency: "USD",
        operation: "sale",
        type: "apartment",
        address: "Rivadavia 567",
        neighborhood: "Centro",
        bedrooms: 2,
        bathrooms: 1,
        area: 85,
        images: ["gustavo-papasergio-emoKYb99CRI-unsplash_w6gipy"],
        featured: true,
        status: "available",
        views: 189,
        createdAt: "2024-01-10",
      },
      // Add more mock properties...
    ]

    setProperties(mockProperties)
    setFilteredProperties(mockProperties)
    setLoading(false)
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...properties]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Operation filter
    if (operationFilter !== "all") {
      filtered = filtered.filter((property) => property.operation === operationFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((property) => property.type === typeFilter)
    }

    // Price filters
    if (minPrice) {
      filtered = filtered.filter((property) => property.price >= Number.parseInt(minPrice))
    }
    if (maxPrice) {
      filtered = filtered.filter((property) => property.price <= Number.parseInt(maxPrice))
    }

    // Bedrooms filter
    if (bedroomsFilter !== "all") {
      filtered = filtered.filter((property) => property.bedrooms >= Number.parseInt(bedroomsFilter))
    }

    // Bathrooms filter
    if (bathroomsFilter !== "all") {
      filtered = filtered.filter((property) => property.bathrooms >= Number.parseInt(bathroomsFilter))
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "views":
        filtered.sort((a, b) => b.views - a.views)
        break
    }

    setFilteredProperties(filtered)
    setCurrentPage(1)
  }, [properties, searchTerm, operationFilter, typeFilter, minPrice, maxPrice, bedroomsFilter, bathroomsFilter, sortBy])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentProperties = filteredProperties.slice(startIndex, endIndex)

  const clearFilters = () => {
    setSearchTerm("")
    setOperationFilter("all")
    setTypeFilter("all")
    setMinPrice("")
    setMaxPrice("")
    setBedroomsFilter("all")
    setBathroomsFilter("all")
    setSortBy("newest")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Propiedades en Reconquista</h1>
            <p className="text-lg text-gray-300">Encuentra tu próximo hogar o inversión</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <Filter className="w-5 h-5 text-brand-orange mr-2" />
              <h2 className="text-lg font-semibold text-white">Filtros de búsqueda</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por título, dirección o barrio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-brand-orange"
                  />
                </div>
              </div>

              {/* Operation */}
              <Select value={operationFilter} onValueChange={setOperationFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Operación" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="sale">Venta</SelectItem>
                  <SelectItem value="rent">Alquiler</SelectItem>
                </SelectContent>
              </Select>

              {/* Type */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="apartment">Departamento</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Price Range */}
              <Input
                placeholder="Precio mín."
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              <Input
                placeholder="Precio máx."
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />

              {/* Bedrooms */}
              <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Dormitorios" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>

              {/* Bathrooms */}
              <Select value={bathroomsFilter} onValueChange={setBathroomsFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Baños" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="price-low">Precio menor</SelectItem>
                  <SelectItem value="price-high">Precio mayor</SelectItem>
                  <SelectItem value="views">Más vistas</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                onClick={clearFilters}
                variant="outline"
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-300">{filteredProperties.length} propiedades encontradas</p>
        </div>

        {/* Properties Grid */}
        {currentProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {currentProperties.map((property) => (
              <Card
                key={property.id}
                className="bg-gray-800 border-gray-700 overflow-hidden hover:border-brand-orange transition-colors group"
              >
                <div className="relative">
                  <Image
                    src={getOptimizedImageUrl(property.images[0], {
                      width: 400,
                      height: 250,
                      quality: "auto",
                      format: "auto",
                      crop: "fill" || "/placeholder.svg",
                    })}
                    alt={property.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />

                  {/* Status badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {property.featured && <Badge className="bg-brand-orange text-white">Destacada</Badge>}
                    <Badge
                      className={
                        property.status === "available"
                          ? "bg-green-500 text-white"
                          : property.status === "sold"
                            ? "bg-red-500 text-white"
                            : "bg-yellow-500 text-white"
                      }
                    >
                      {property.status === "available"
                        ? "Disponible"
                        : property.status === "sold"
                          ? "Vendida"
                          : "Alquilada"}
                    </Badge>
                  </div>

                  {/* Favorite button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>

                  {/* Price overlay */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-black/70 text-white px-3 py-1 rounded-lg font-bold">
                      {property.currency}$ {property.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-1">{property.title}</h3>

                  <div className="flex items-center text-gray-400 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.address}, {property.neighborhood}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      {property.type === "house"
                        ? "Casa"
                        : property.type === "apartment"
                          ? "Departamento"
                          : "Comercial"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        {property.bedrooms}
                      </div>
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        {property.bathrooms}
                      </div>
                      <div className="flex items-center">
                        <Square className="w-4 h-4 mr-1" />
                        {property.area}m²
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Eye className="w-3 h-3 mr-1" />
                      {property.views} vistas
                    </div>
                    <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                      Ver detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No se encontraron propiedades con los filtros seleccionados</p>
            <Button onClick={clearFilters} className="bg-brand-orange hover:bg-brand-orange/90">
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                className={
                  currentPage === i + 1
                    ? "bg-brand-orange hover:bg-brand-orange/90"
                    : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                }
              >
                {i + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}