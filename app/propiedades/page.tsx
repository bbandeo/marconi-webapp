
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
import Footer from "@/components/Footer"
import PropertyCard from "@/components/PropertyCard"
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
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Analytics tracking
  const analytics = useAnalytics({ enableAutoTracking: true })

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
          {/* Orange fade overlay - imported effect - Enhanced overlay for better text contrast */}
          <div className="absolute inset-x-0 bottom-0 h-32 md:h-48 bg-gradient-to-t from-orange-600/85 via-orange-500/50 to-transparent" />
        </div>

        <div className="container-premium relative z-10">
          {/* Page Title - PREMIUM TYPOGRAPHY */}
          <div className="text-center mb-premium-xl">
            <h1 className="display-lg text-premium-primary mb-premium-md">
              NUESTRAS <span className="accent-premium">PROPIEDADES</span>
            </h1>
            <div className="mb-premium-lg max-w-4xl mx-auto">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/10">
                <p className="body-xl text-white font-medium leading-relaxed text-center">
                  Descubrí las mejores propiedades cuidadosamente seleccionadas por nuestro equipo  
                  y encontrá tu propiedad ideal con nuestro acompañamiento profesional.
                </p>
              </div>
            </div>
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
                      className="pl-10 bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary focus:border-vibrant-orange backdrop-blur-sm rounded-xl py-3 focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Operation */}
                <Select value={operationFilter} onValueChange={setOperationFilter}>
                  <SelectTrigger className="bg-premium-card border-support-gray/30 text-premium-primary backdrop-blur-sm rounded-xl px-4 py-3 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300">
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
                  <SelectTrigger className="bg-premium-card border-support-gray/30 text-premium-primary backdrop-blur-sm rounded-xl px-4 py-3 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300">
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
                  className="bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary backdrop-blur-sm rounded-xl px-4 py-3 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300"
                />
                <Input
                  placeholder="Precio máx."
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary backdrop-blur-sm rounded-xl px-4 py-3 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300"
                />

                {/* Bedrooms */}
                <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
                  <SelectTrigger className="bg-premium-card border-support-gray/30 text-premium-primary backdrop-blur-sm rounded-xl px-4 py-3 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300">
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
                  <SelectTrigger className="bg-premium-card border-support-gray/30 text-premium-primary backdrop-blur-sm rounded-xl px-4 py-3 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300">
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
                  <SelectTrigger className="bg-premium-card border-support-gray/30 text-premium-primary backdrop-blur-sm rounded-xl px-4 py-3 focus:border-vibrant-orange focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-300">
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
                  className="hover:bg-vibrant-orange/80 hover:text-bone-white hover:border-vibrant-orange/60 transition-all duration-300 rounded-xl px-4 py-3 font-medium"
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

          {/* Properties List - DISEÑO VERTICAL CON IMÁGENES PROMINENTES */}
          {currentProperties.length > 0 ? (
            <div className="space-y-8 mb-premium-xl">
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

      <Footer />
    </div>
  )
}
