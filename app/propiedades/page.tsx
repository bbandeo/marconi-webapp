
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MapPin, Bed, Bath, Square, Heart, Eye, ChevronLeft, ChevronRight, Home, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PropertyCard from "@/components/PropertyCard"
import Hero from "@/components/Hero"
import { getOptimizedImageUrl } from "@/lib/cloudinary"
import { PropertyService } from "@/services/properties"
import type { Property as PropertyType } from "@/lib/supabase"
import { useAnalytics } from "@/hooks/useAnalytics"

interface Property extends PropertyType {
  operation: "sale" | "rent"
  type: "house" | "apartment" | "commercial" | "terreno" | "local"
}

const ITEMS_PER_PAGE = 12

export default function PropiedadesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [uniqueNeighborhoods, setUniqueNeighborhoods] = useState<string[]>([])

  // Analytics tracking
  const analytics = useAnalytics({ enableAutoTracking: true })

  // Filters - Initialize from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [operationFilter, setOperationFilter] = useState(searchParams.get("operation") || "all")
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
  const [minArea, setMinArea] = useState(searchParams.get("minArea") || "")
  const [maxArea, setMaxArea] = useState(searchParams.get("maxArea") || "")
  const [bedroomsFilter, setBedroomsFilter] = useState(searchParams.get("bedrooms") || "all")
  const [bathroomsFilter, setBathroomsFilter] = useState(searchParams.get("bathrooms") || "all")
  const [neighborhoodFilter, setNeighborhoodFilter] = useState(searchParams.get("neighborhood") || "all")
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Fetch properties from Supabase
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const result = await PropertyService.getProperties({
          limit: 100, // Get all properties
          sort_by: "created_at",
          sort_order: "desc",
          status: "available" // Only show available properties
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

        // Extract unique neighborhoods
        const neighborhoods = [...new Set(mappedProperties
          .map(p => p.neighborhood)
          .filter(n => n && n.trim() !== "")
        )].sort()
        setUniqueNeighborhoods(neighborhoods)
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

    // Area filters
    if (minArea) {
      filtered = filtered.filter((property) => property.area_m2 && property.area_m2 >= Number.parseInt(minArea))
    }
    if (maxArea) {
      filtered = filtered.filter((property) => property.area_m2 && property.area_m2 <= Number.parseInt(maxArea))
    }

    // Bedrooms filter
    if (bedroomsFilter !== "all") {
      filtered = filtered.filter((property) => property.bedrooms && property.bedrooms >= Number.parseInt(bedroomsFilter))
    }

    // Bathrooms filter
    if (bathroomsFilter !== "all") {
      filtered = filtered.filter((property) => property.bathrooms && property.bathrooms >= Number.parseInt(bathroomsFilter))
    }

    // Neighborhood filter
    if (neighborhoodFilter !== "all") {
      filtered = filtered.filter((property) => property.neighborhood === neighborhoodFilter)
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
  }, [properties, searchTerm, operationFilter, typeFilter, minPrice, maxPrice, minArea, maxArea, bedroomsFilter, bathroomsFilter, neighborhoodFilter, sortBy])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    if (searchTerm) params.set("search", searchTerm)
    if (operationFilter !== "all") params.set("operation", operationFilter)
    if (typeFilter !== "all") params.set("type", typeFilter)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    if (minArea) params.set("minArea", minArea)
    if (maxArea) params.set("maxArea", maxArea)
    if (bedroomsFilter !== "all") params.set("bedrooms", bedroomsFilter)
    if (bathroomsFilter !== "all") params.set("bathrooms", bathroomsFilter)
    if (neighborhoodFilter !== "all") params.set("neighborhood", neighborhoodFilter)
    if (sortBy !== "newest") params.set("sortBy", sortBy)

    const queryString = params.toString()
    const newUrl = queryString ? `/propiedades?${queryString}` : "/propiedades"

    router.replace(newUrl, { scroll: false })
  }, [searchTerm, operationFilter, typeFilter, minPrice, maxPrice, minArea, maxArea, bedroomsFilter, bathroomsFilter, neighborhoodFilter, sortBy, router])

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
    setMinArea("")
    setMaxArea("")
    setBedroomsFilter("all")
    setBathroomsFilter("all")
    setNeighborhoodFilter("all")
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

      <Hero
        backgroundImage="/assets/hero/casa_llaves.png"
        alt="Casa con llaves - Marconi Inmobiliaria"
        title="NUESTRAS PROPIEDADES"
        description=""
        showCounter={false}
      >
        {/* Filters - Compact with Expandable Design */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-premium-card backdrop-blur-md rounded-2xl p-6 border border-support-gray/20 shadow-xl">

            {/* Basic Filters - Always Visible */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search - Full width on mobile */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-support-gray w-4 h-4" />
                  <Input
                    placeholder="Buscar propiedades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-night-blue/60 border-support-gray/30 text-bone-white placeholder:text-subtle-gray focus:border-vibrant-orange backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300 h-11"
                  />
                </div>
              </div>

              {/* Operation */}
              <Select value={operationFilter} onValueChange={setOperationFilter}>
                <SelectTrigger className="bg-night-blue/60 border-support-gray/30 text-bone-white backdrop-blur-sm rounded-xl focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300 h-11">
                  <SelectValue placeholder="Alquiler/Venta" />
                </SelectTrigger>
                <SelectContent className="bg-night-blue border-support-gray/30">
                  <SelectItem value="all">Alquiler/Venta</SelectItem>
                  <SelectItem value="sale">Venta</SelectItem>
                  <SelectItem value="rent">Alquiler</SelectItem>
                </SelectContent>
              </Select>

              {/* Type */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-night-blue/60 border-support-gray/30 text-bone-white backdrop-blur-sm rounded-xl focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300 h-11">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-night-blue border-support-gray/30">
                  <SelectItem value="all">Tipo de propiedad</SelectItem>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="apartment">Departamento</SelectItem>
                  <SelectItem value="terreno">Terreno</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expand/Collapse Button - Only show when collapsed */}
            {!showAdvancedFilters && (
              <div className="flex justify-center mb-4">
                <Button
                  onClick={() => setShowAdvancedFilters(true)}
                  variant="outline"
                  className="bg-night-blue/60 border-support-gray/30 text-bone-white hover:bg-vibrant-orange hover:border-vibrant-orange hover:text-white transition-all duration-300 rounded-xl px-4 py-2 flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Más filtros
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Advanced Filters - Collapsible */}
            {showAdvancedFilters && (
              <div className="space-y-4 border-t border-support-gray/20 pt-4">
                {/* Price and Area */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="secondary-text block mb-2 text-sm">Precio mínimo</label>
                    <Input
                      placeholder="Ej: 50000"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="bg-night-blue/60 border-support-gray/30 text-bone-white placeholder:text-subtle-gray rounded-xl h-11 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="secondary-text block mb-2 text-sm">Precio máximo</label>
                    <Input
                      placeholder="Ej: 200000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="bg-night-blue/60 border-support-gray/30 text-bone-white placeholder:text-subtle-gray rounded-xl h-11 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="secondary-text block mb-2 text-sm">Metros² mín.</label>
                    <Input
                      placeholder="Ej: 50"
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      className="bg-night-blue/60 border-support-gray/30 text-bone-white placeholder:text-subtle-gray rounded-xl h-11 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="secondary-text block mb-2 text-sm">Metros² máx.</label>
                    <Input
                      placeholder="Ej: 200"
                      value={maxArea}
                      onChange={(e) => setMaxArea(e.target.value)}
                      className="bg-night-blue/60 border-support-gray/30 text-bone-white placeholder:text-subtle-gray rounded-xl h-11 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Features and Location */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {/* Neighborhood */}
                  <div className="col-span-2">
                    <Select value={neighborhoodFilter} onValueChange={setNeighborhoodFilter}>
                      <SelectTrigger className="bg-night-blue/60 border-support-gray/30 text-bone-white rounded-xl h-11 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300">
                        <SelectValue placeholder="Barrio" />
                      </SelectTrigger>
                      <SelectContent className="bg-night-blue border-support-gray/30">
                        <SelectItem value="all">Todos los barrios</SelectItem>
                        {uniqueNeighborhoods.map((neighborhood) => (
                          <SelectItem key={neighborhood} value={neighborhood}>
                            {neighborhood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bedrooms - Compact */}
                  <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
                    <SelectTrigger className="bg-night-blue/60 border-support-gray/30 text-bone-white rounded-xl h-11 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300">
                      <SelectValue placeholder="Hab." />
                    </SelectTrigger>
                    <SelectContent className="bg-night-blue border-support-gray/30">
                      <SelectItem value="all">Hab.</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Bathrooms - Compact */}
                  <Select value={bathroomsFilter} onValueChange={setBathroomsFilter}>
                    <SelectTrigger className="bg-night-blue/60 border-support-gray/30 text-bone-white rounded-xl h-11 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300">
                      <SelectValue placeholder="Baños" />
                    </SelectTrigger>
                    <SelectContent className="bg-night-blue border-support-gray/30">
                      <SelectItem value="all">Baños</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-night-blue/60 border-support-gray/30 text-bone-white rounded-xl h-11 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent className="bg-night-blue border-support-gray/30">
                      <SelectItem value="newest">Más recientes</SelectItem>
                      <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                      <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                      <SelectItem value="views">Más populares</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Collapse Button - Moved to end */}
                  <Button
                    onClick={() => setShowAdvancedFilters(false)}
                    variant="outline"
                    className="bg-night-blue/60 border-support-gray/30 text-bone-white hover:bg-vibrant-orange hover:border-vibrant-orange hover:text-white transition-all duration-300 rounded-xl px-3 py-2 flex items-center gap-2 h-11"
                  >
                    <Filter className="w-4 h-4" />
                    Menos filtros
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Hero>

      {/* Properties Counter - Below filters */}
      <div className="bg-premium-main py-6">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-premium-card/50 backdrop-blur-sm rounded-xl px-6 py-4 border border-support-gray/20 shadow-lg inline-block">
              <p className="text-vibrant-orange font-semibold text-lg">
                {filteredProperties.length} propiedades disponibles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results - PREMIUM DESIGN */}
      <section className="section-spacing bg-premium-main">
        <div className="container-premium">
          {/* Results header */}
          <div className="component-spacing">
            <h2 className="component-title mb-2">Resultados</h2>
          </div>

          {/* Properties Grid - DISEÑO EN MOSAICO RESPONSIVE */}
          {currentProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-premium-xl">
              {currentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
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

          {/* Pagination - Enhanced */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-premium-card/50 backdrop-blur-sm rounded-xl p-6 border border-vibrant-orange/10">
              {/* Pagination Info */}
              <div className="text-premium-secondary text-sm">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProperties.length)} de {filteredProperties.length} propiedades
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="disabled:opacity-50 hover:bg-vibrant-orange/10 hover:border-vibrant-orange/30"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                {/* Smart pagination - show only relevant pages */}
                {(() => {
                  const pagesToShow = []
                  const maxVisiblePages = 5

                  if (totalPages <= maxVisiblePages) {
                    // Show all pages if total is small
                    for (let i = 1; i <= totalPages; i++) {
                      pagesToShow.push(i)
                    }
                  } else {
                    // Smart pagination logic
                    let startPage = Math.max(1, currentPage - 2)
                    let endPage = Math.min(totalPages, currentPage + 2)

                    // Adjust if we're near the start or end
                    if (currentPage <= 3) {
                      endPage = Math.min(5, totalPages)
                    }
                    if (currentPage > totalPages - 3) {
                      startPage = Math.max(1, totalPages - 4)
                    }

                    // Add first page and ellipsis if needed
                    if (startPage > 1) {
                      pagesToShow.push(1)
                      if (startPage > 2) pagesToShow.push('...')
                    }

                    // Add middle pages
                    for (let i = startPage; i <= endPage; i++) {
                      pagesToShow.push(i)
                    }

                    // Add ellipsis and last page if needed
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) pagesToShow.push('...')
                      pagesToShow.push(totalPages)
                    }
                  }

                  return pagesToShow.map((page, index) => {
                    if (page === '...') {
                      return <span key={`ellipsis-${index}`} className="px-2 text-premium-secondary">...</span>
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page as number)}
                        className={currentPage === page
                          ? "bg-gradient-to-r from-vibrant-orange to-orange-600 text-bone-white"
                          : "hover:bg-vibrant-orange/10 hover:border-vibrant-orange/30"
                        }
                      >
                        {page}
                      </Button>
                    )
                  })
                })()}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="disabled:opacity-50 hover:bg-vibrant-orange/10 hover:border-vibrant-orange/30"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
