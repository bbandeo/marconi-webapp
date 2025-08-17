
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MapPin, Bed, Bath, Square, Heart, Eye, ChevronLeft, ChevronRight, Home, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/Header"
import { getOptimizedImageUrl } from "@/lib/cloudinary"
import { PropertyService } from "@/services/properties"
import type { Property as PropertyType } from "@/lib/supabase"

interface Property extends PropertyType {
  operation: "sale" | "rent"
  type: "house" | "apartment" | "commercial" | "terreno" | "local"
}

const ITEMS_PER_PAGE = 12

export default function PropiedadesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [operationFilter, setOperationFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [bedroomsFilter, setBedroomsFilter] = useState("all")
  const [bathroomsFilter, setBathroomsFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Fetch properties from Supabase
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const result = await PropertyService.getProperties({
          limit: 100, // Get all properties
          sort_by: "created_at",
          sort_order: "desc"
        })

        // Map properties to match the expected interface
        const mappedProperties = result.properties.map((property): Property => ({
          ...property,
          operation: property.operation_type === "venta" ? "sale" : "rent",
          type: property.property_type === "casa" ? "house" 
               : property.property_type === "departamento" ? "apartment"
               : property.property_type === "terreno" ? "terreno"
               : property.property_type === "local" ? "commercial"
               : "house"
        }))

        setProperties(mappedProperties)
        setFilteredProperties(mappedProperties)
      } catch (error) {
        console.error("Error fetching properties:", error)
        setProperties([])
        setFilteredProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...properties]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (property.address && property.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (property.neighborhood && property.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())),
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
      filtered = filtered.filter((property) => property.bedrooms && property.bedrooms >= Number.parseInt(bedroomsFilter))
    }

    // Bathrooms filter
    if (bathroomsFilter !== "all") {
      filtered = filtered.filter((property) => property.bathrooms && property.bathrooms >= Number.parseInt(bathroomsFilter))
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
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "views":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
    }

    setFilteredProperties(filtered)
    setCurrentPage(1)
  }, [properties, searchTerm, operationFilter, typeFilter, minPrice, maxPrice, bedroomsFilter, bathroomsFilter, sortBy])

  // Pagination
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

  // Helper function to get property type display name
  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case "house":
        return "Casa"
      case "apartment":
        return "Departamento"
      case "terreno":
        return "Terreno"
      case "commercial":
        return "Comercial"
      default:
        return "Propiedad"
    }
  }

  // Helper function to get status display name
  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "available":
        return "Disponible"
      case "sold":
        return "Vendida"
      case "rented":
        return "Alquilada"
      case "reserved":
        return "Reservada"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-premium-main">
        <Header />
        <section className="section-premium">
          <div className="container-premium">
            <div className="text-center py-premium-xl">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-support-gray/20 border-t-vibrant-orange mx-auto mb-premium-md shadow-xl"></div>
              <p className="body-lg text-premium-primary pulse-premium">Cargando propiedades...</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-premium-main">
      {/* Header Premium */}
      <Header />

      {/* Hero Section - PREMIUM DESIGN */}
      <section className="relative section-premium overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/assets/hero/casa_llaves.png"
            alt="Casa con llaves - Marconi Inmobiliaria"
            fill
            className="object-cover"
            priority
          />
          {/* Premium overlay */}
          <div className="absolute inset-0 bg-night-blue/50" />
          {/* Orange fade overlay - imported effect */}
          <div className="absolute inset-x-0 bottom-0 h-32 md:h-48 bg-gradient-to-t from-orange-600/80 via-orange-500/40 to-transparent" />
        </div>

        <div className="container-premium relative z-10">
          {/* Page Title - PREMIUM TYPOGRAPHY */}
          <div className="text-center mb-premium-xl">
            <h1 className="display-lg text-premium-primary mb-premium-md">
              NUESTRAS <span className="accent-premium">PROPIEDADES</span>
            </h1>
            <p className="body-xl text-premium-secondary mb-premium-lg max-w-4xl mx-auto">
              Descubrí las mejores propiedades cuidadosamente seleccionadas por nuestro equipo  
              y encontrá tu propiedad ideal con nuestro acompañamiento profesional.
            </p>
            <div className="caption-lg text-premium-secondary">
              <p>{filteredProperties.length} propiedades disponibles</p>
            </div>
          </div>

          {/* Filters - Premium Design */}
          <div className="max-w-7xl mx-auto">
            <div className="bg-premium-card backdrop-blur-md rounded-2xl p-premium-lg border border-vibrant-orange/20 shadow-2xl">
              <div className="flex items-center mb-premium-md">
                <Filter className="w-6 h-6 text-vibrant-orange mr-3" />
                <h2 className="heading-md text-premium-primary">Filtros de búsqueda</h2>
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
                      className="pl-10 bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary focus:border-vibrant-orange backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Operation */}
                <Select value={operationFilter} onValueChange={setOperationFilter}>
                  <SelectTrigger className="bg-premium-card border-support-gray/30 text-premium-primary backdrop-blur-sm">
                    <SelectValue placeholder="Operación" />
                  </SelectTrigger>
                  <SelectContent className="bg-premium-card border-support-gray/30">
                    <SelectItem value="all">Alquiler/Venta</SelectItem>
                    <SelectItem value="sale">Venta</SelectItem>
                    <SelectItem value="rent">Alquiler</SelectItem>
                  </SelectContent>
                </Select>

                {/* Type */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="bg-premium-card border-support-gray/30 text-premium-primary backdrop-blur-sm">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-premium-card border-support-gray/30">
                    <SelectItem value="all">Tipo de propiedad</SelectItem>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="apartment">Departamento</SelectItem>
                    <SelectItem value="terreno">Terreno</SelectItem>
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
                  className="bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary backdrop-blur-sm"
                />
                <Input
                  placeholder="Precio máx."
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary backdrop-blur-sm"
                />

                {/* Bedrooms */}
                <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
                  <SelectTrigger className="bg-premium-card border-support-gray/30 text-premium-primary backdrop-blur-sm">
                    <SelectValue placeholder="Dormitorios" />
                  </SelectTrigger>
                  <SelectContent className="bg-premium-card border-support-gray/30">
                    <SelectItem value="all">Habitaciones</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>

                {/* Bathrooms */}
                <Select value={bathroomsFilter} onValueChange={setBathroomsFilter}>
                  <SelectTrigger className="bg-premium-card border-support-gray/30 text-premium-primary backdrop-blur-sm">
                    <SelectValue placeholder="Baños" />
                  </SelectTrigger>
                  <SelectContent className="bg-premium-card border-support-gray/30">
                    <SelectItem value="all">Baños</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-premium-card border-support-gray/30 text-premium-primary backdrop-blur-sm">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent className="bg-premium-card border-support-gray/30">
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
                  className="hover:bg-vibrant-orange/80 hover:text-bone-white hover:border-vibrant-orange/60 transition-all duration-300"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results - PREMIUM DESIGN */}
      <section className="section-premium bg-premium-main">
        <div className="container-premium">
          {/* Results count */}
          <div className="flex items-center justify-between mb-premium-lg">
            <p className="body-lg text-premium-secondary">{filteredProperties.length} propiedades encontradas</p>
          </div>

          {/* Properties List */}
          {currentProperties.length > 0 ? (
            <div className="space-y-premium-lg mb-premium-xl">
            {currentProperties.map((property) => (
              <Card
                key={property.id}
                className="group overflow-hidden hover-lift"
              >
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                  {/* Image Section */}
                  <div className="lg:col-span-2 relative">
                    <Link href={`/propiedades/${property.id}`}>
                      <div className="relative cursor-pointer h-64 lg:h-80">
                        {property.images && property.images.length > 0 ? (
                          <Image
                            src={property.images[0]}
                            alt={property.title}
                            fill
                            className="object-cover hover-scale"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <div className="text-gray-400 text-center">
                              <div className="w-16 h-16 bg-gray-600 rounded mx-auto mb-3"></div>
                              <p>Sin imagen</p>
                            </div>
                          </div>
                        )}

                        {/* Status badges */}
                        <div className="absolute top-premium-sm left-premium-sm">
                          <div className="bg-night-blue/90 text-bone-white px-premium-sm py-2 rounded-xl caption-lg font-semibold backdrop-blur-md border border-vibrant-orange/30">
                            {property.operation === "sale" ? "VENTA" : "ALQUILER"}
                          </div>
                        </div>

                        {/* Featured badge */}
                        {property.featured && (
                          <div className="absolute top-premium-sm right-premium-sm bg-gradient-to-r from-vibrant-orange/90 to-vibrant-orange/70 text-bone-white px-premium-sm py-2 rounded-xl caption-lg flex items-center gap-2 backdrop-blur-md shadow-lg">
                            <Eye className="w-4 h-4" />
                            DESTACADA
                          </div>
                        )}

                        {/* Favorite button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute bottom-premium-sm right-premium-sm bg-night-blue/80 hover:bg-night-blue text-bone-white hover:text-vibrant-orange backdrop-blur-md rounded-xl p-3 shadow-lg"
                        >
                          <Heart className="w-5 h-5" />
                        </Button>
                      </div>
                    </Link>
                  </div>

                  {/* Content Section */}
                  <div className="lg:col-span-3 p-premium-md lg:p-premium-lg flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-premium-md">
                        <div className="flex-1">
                          <Link href={`/propiedades/${property.id}`}>
                            <h3 className="heading-lg text-premium-primary mb-premium-sm hover:text-vibrant-orange transition-colors cursor-pointer">
                              {property.title}
                            </h3>
                          </Link>
                          <div className="flex items-center text-vibrant-orange body-md mb-premium-sm">
                            <MapPin className="w-5 h-5 mr-2" />
                            {property.neighborhood}, Reconquista
                          </div>
                        </div>
                        <div className="text-right ml-premium-md">
                          <div className="display-sm text-premium-primary mb-premium-sm">
                            {property.currency}$ {property.price.toLocaleString()}
                          </div>
                          <div className="caption-lg text-premium-secondary">
                            {property.operation === "rent" ? "por mes" : ""}
                          </div>
                        </div>
                      </div>

                      {/* Property Details */}
                      {(property.bedrooms || property.bathrooms || property.area_m2) && (
                        <div className="flex items-center gap-premium-md text-premium-primary mb-premium-lg">
                          {property.bedrooms && (
                            <div className="flex items-center bg-support-gray/10 px-premium-sm py-2 rounded-xl">
                              <Bed className="w-5 h-5 mr-2 text-vibrant-orange" />
                              <span className="body-md font-medium">{property.bedrooms} dormitorios</span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center bg-support-gray/10 px-premium-sm py-2 rounded-xl">
                              <Bath className="w-5 h-5 mr-2 text-vibrant-orange" />
                              <span className="body-md font-medium">{property.bathrooms} baños</span>
                            </div>
                          )}
                          <div className="flex items-center bg-support-gray/10 px-premium-sm py-2 rounded-xl">
                            <Square className="w-5 h-5 mr-2 text-vibrant-orange" />
                            <span className="body-md font-medium">{property.area_m2}m²</span>
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      {property.features && property.features.length > 0 && (
                        <div className="mb-premium-lg">
                          <h4 className="heading-sm text-premium-primary mb-premium-sm">Características:</h4>
                          <div className="flex flex-wrap gap-2">
                            {property.features.slice(0, 5).map((feature, i) => (
                              <span key={i} className="bg-vibrant-orange/15 text-vibrant-orange border border-vibrant-orange/25 px-3 py-1 rounded-xl caption-lg font-medium">
                                {feature}
                              </span>
                            ))}
                            {property.features.length > 5 && (
                              <span className="text-premium-secondary caption-lg px-3 py-1">+{property.features.length - 5} más</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-premium-sm pt-premium-md border-t border-support-gray/20">
                      <Link href={`/propiedades/${property.id}`} className="flex-1">
                        <Button className="w-full" size="lg">
                          Ver detalles completos <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="lg"
                        className="px-premium-md"
                      >
                        <Heart className="w-5 h-5 mr-2" />
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="px-premium-md"
                      >
                        Contactar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            </div>
          ) : (
            <div className="text-center py-premium-xl">
              <Home className="w-16 h-16 text-premium-secondary mx-auto mb-premium-md opacity-40" />
              <h3 className="heading-lg text-premium-primary mb-premium-sm">
                No se encontraron propiedades
              </h3>
              <p className="body-md text-premium-secondary mb-premium-lg">
                No se encontraron propiedades con los filtros seleccionados
              </p>
              <Button onClick={clearFilters}>
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
                className="disabled:opacity-50"
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
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="disabled:opacity-50"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer - PREMIUM DESIGN */}
      <footer className="bg-premium-main border-t border-support-gray/20 section-premium">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-premium-lg">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-premium-md">
                <Image
                  src="/assets/logos/marconi_title.svg"
                  alt="Marconi Inmobiliaria"
                  width={140}
                  height={45}
                  className="h-10 w-auto"
                />
              </div>
              <p className="body-lg text-premium-secondary mb-premium-md max-w-md">
                Experiencia premium en bienes raíces. Comprometidos con encontrar 
                la propiedad perfecta para cada familia.
              </p>
            </div>

            <div>
              <h3 className="heading-sm text-premium-primary mb-premium-md">Enlaces</h3>
              <ul className="space-y-3 text-premium-secondary">
                <li>
                  <Link
                    href="/propiedades"
                    className="body-md hover:text-vibrant-orange transition-colors accent-premium"
                  >
                    Propiedades
                  </Link>
                </li>
                <li>
                  <Link
                    href="/agentes"
                    className="body-md hover:text-vibrant-orange transition-colors"
                  >
                    Agentes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="body-md hover:text-vibrant-orange transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="body-md hover:text-vibrant-orange transition-colors"
                  >
                    Inicio
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="heading-sm text-premium-primary mb-premium-md">Contacto</h3>
              <ul className="space-y-3 text-premium-secondary">
                <li className="body-md">Reconquista, Santa Fe</li>
                <li className="body-md">+54 9 3482 308100</li>
                <li className="body-md">marconinegociosinmobiliarios@hotmail.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-support-gray/20 mt-premium-xl pt-premium-lg text-center">
            <p className="caption-lg text-premium-secondary">
              &copy; 2025 Marconi Inmobiliaria. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
