
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
import { getOptimizedImageUrl } from "@/lib/cloudinary"
import { PropertyService } from "@/services/properties"
import type { Property as PropertyType } from "@/lib/supabase"
import { SectionDivider } from "@/components/ui/section-divider"

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
      {/* Header - matching homepage */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 shadow-md">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/assets/logos/marconi_header_orangewhite.png"
                alt="Marconi Inmobiliaria"
                width={140}
                height={45}
                className="h-8 md:h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/propiedades"
                className="text-orange-500 border-b-2 border-orange-500 pb-1 font-medium transition-colors"
              >
                PROPIEDADES
              </Link>
              <Link
                href="/agentes"
                className="text-gray-300 hover:text-white transition-colors"
              >
                AGENTES
              </Link>
              <Link
                href="/contacto"
                className="text-gray-300 hover:text-white transition-colors"
              >
                CONTACTO
              </Link>
            </nav>

            {/* Mobile Search Bar */}
            <div className="md:hidden flex-1 max-w-xs ml-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar propiedades..."
                  className="pl-10 h-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 text-sm focus:border-brand-orange"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative divider line */}
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-lg"></div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/assets/hero/casa_llaves.png"
            alt="Casa con llaves - Marconi Inmobiliaria"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              NUESTRAS <span className="text-orange-500">PROPIEDADES</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-5xl mx-auto">
              Descubrí las mejores propiedades cuidadosamente seleccionadas por nuestro equipo  <br/>
              y encontrá tu propiedad ideal con nuestro acompañamiento profesional.
            </p>
            <div className="text-gray-400">
              <p>{filteredProperties.length} propiedades disponibles</p>
            </div>
          </div>

          {/* Filters - Inside Hero Section */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30 shadow-2xl">
              <div className="flex items-center mb-4">
                <Filter className="w-5 h-5 text-orange-500 mr-2" />
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
                      className="pl-10 bg-gray-800/80 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Operation */}
                <Select value={operationFilter} onValueChange={setOperationFilter}>
                  <SelectTrigger className="bg-gray-800/80 border-gray-600 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Operación" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">Alquiler/Venta</SelectItem>
                    <SelectItem value="sale">Venta</SelectItem>
                    <SelectItem value="rent">Alquiler</SelectItem>
                  </SelectContent>
                </Select>

                {/* Type */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="bg-gray-800/80 border-gray-600 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
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
                  className="bg-gray-800/80 border-gray-600 text-white placeholder-gray-400 backdrop-blur-sm"
                />
                <Input
                  placeholder="Precio máx."
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-gray-800/80 border-gray-600 text-white placeholder-gray-400 backdrop-blur-sm"
                />

                {/* Bedrooms */}
                <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
                  <SelectTrigger className="bg-gray-800/80 border-gray-600 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Dormitorios" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">Habitaciones</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>

                {/* Bathrooms */}
                <Select value={bathroomsFilter} onValueChange={setBathroomsFilter}>
                  <SelectTrigger className="bg-gray-800/80 border-gray-600 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Baños" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">Baños</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-gray-800/80 border-gray-600 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
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
                  className="bg-gray-700/60 border-gray-500/40 text-gray-300 hover:bg-orange-500/80 hover:text-white hover:border-orange-500/60 backdrop-blur-sm transition-all duration-300"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SectionDivider variant="curve" />

      {/* Results */}
      <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-black to-gray-900">
        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-300">{filteredProperties.length} propiedades encontradas</p>
        </div>

        {/* Properties List */}
        {currentProperties.length > 0 ? (
          <div className="space-y-6 mb-8">
            {currentProperties.map((property) => (
              <Card
                key={property.id}
                className="bg-gray-800/95 border-gray-600/30 border overflow-hidden group hover:border-gray-500/50 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm"
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
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
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
                        <div className="absolute top-4 left-4">
                          <div className="bg-gray-900/90 text-orange-300 border border-orange-400/30 px-4 py-2 rounded-xl font-medium text-sm backdrop-blur-md shadow-lg">
                            {property.operation === "sale" ? "VENTA" : "ALQUILER"}
                          </div>
                        </div>

                        {/* Featured badge */}
                        {property.featured && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-600/90 to-yellow-500/90 text-white px-3 py-2 rounded-xl text-xs flex items-center gap-2 backdrop-blur-md shadow-lg">
                            <Eye className="w-4 h-4" />
                            DESTACADA
                          </div>
                        )}

                        {/* Favorite button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute bottom-4 right-4 bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white backdrop-blur-md rounded-xl p-3 shadow-lg"
                        >
                          <Heart className="w-5 h-5" />
                        </Button>
                      </div>
                    </Link>
                  </div>

                  {/* Content Section */}
                  <div className="lg:col-span-3 p-6 lg:p-8 flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <Link href={`/propiedades/${property.id}`}>
                            <h3 className="font-bold text-white text-2xl mb-2 hover:text-orange-300 transition-colors cursor-pointer">
                              {property.title}
                            </h3>
                          </Link>
                          <div className="flex items-center text-orange-300 font-medium mb-1">
                            <MapPin className="w-4 h-4 mr-2" />
                            {property.neighborhood}, Reconquista
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-3xl font-bold text-white mb-1">
                            {property.currency}$ {property.price.toLocaleString()}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {property.operation === "rent" ? "por mes" : ""}
                          </div>
                        </div>
                      </div>

                      {/* Property Details */}
                      {(property.bedrooms || property.bathrooms || property.area_m2) && (
                        <div className="flex items-center gap-6 text-gray-300 mb-6">
                          {property.bedrooms && (
                            <div className="flex items-center bg-gray-700/40 px-4 py-2 rounded-lg">
                              <Bed className="w-5 h-5 mr-2 text-orange-300" />
                              <span className="font-medium">{property.bedrooms} dormitorios</span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center bg-gray-700/40 px-4 py-2 rounded-lg">
                              <Bath className="w-5 h-5 mr-2 text-orange-300" />
                              <span className="font-medium">{property.bathrooms} baños</span>
                            </div>
                          )}
                          <div className="flex items-center bg-gray-700/40 px-4 py-2 rounded-lg">
                            <Square className="w-5 h-5 mr-2 text-orange-300" />
                            <span className="font-medium">{property.area_m2}m²</span>
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      {property.features && property.features.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-white font-medium mb-3">Características:</h4>
                          <div className="flex flex-wrap gap-2">
                            {property.features.slice(0, 5).map((feature, i) => (
                              <span key={i} className="bg-orange-500/15 text-orange-300 border border-orange-500/25 px-3 py-1 rounded-lg text-sm font-medium">
                                {feature}
                              </span>
                            ))}
                            {property.features.length > 5 && (
                              <span className="text-gray-400 text-sm px-3 py-1">+{property.features.length - 5} más</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-gray-700/50">
                      <Link href={`/propiedades/${property.id}`} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-orange-600/90 to-orange-500/90 hover:from-orange-600 hover:to-orange-500 text-white border border-orange-500/30 backdrop-blur-sm transition-all duration-300 py-3 text-base font-medium rounded-xl shadow-lg">
                          Ver detalles completos <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="border-gray-500/40 text-gray-300 hover:bg-gray-700/60 hover:text-white bg-transparent backdrop-blur-sm px-6 rounded-xl"
                      >
                        <Heart className="w-5 h-5 mr-2" />
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-500/40 text-gray-300 hover:bg-gray-700/60 hover:text-white bg-transparent backdrop-blur-sm px-6 rounded-xl"
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
      <SectionDivider variant="angled" />

      {/* Footer - matching homepage */}
      <footer className="bg-gray-800 border-t border-gray-700 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/assets/logos/marconi_title.svg"
                  alt="Marconi Inmobiliaria"
                  width={140}
                  height={45}
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-gray-400 mb-4">
                La inmobiliaria líder en Reconquista, comprometida con encontrar
                el hogar perfecto para cada familia.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Enlaces</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/propiedades"
                    className="hover:text-white transition-colors text-orange-500"
                  >
                    Propiedades
                  </Link>
                </li>
                <li>
                  <Link
                    href="/agentes"
                    className="hover:text-white transition-colors"
                  >
                    Agentes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="hover:text-white transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="hover:text-white transition-colors"
                  >
                    Inicio
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Reconquista, Santa Fe</li>
                <li>+54 9 3482 308100</li>
                <li>marconinegociosinmobiliarios@hotmail.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 Marconi Inmobiliaria. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
