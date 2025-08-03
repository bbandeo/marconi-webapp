"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, MapPin, Bed, Bath, Square, ArrowRight, Star, Users, Home, Award, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getOptimizedImageUrl, getPropertyMainImage } from "@/lib/cloudinary"
import { PropertyService } from "@/services/properties"
import type { Property } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [operationType, setOperationType] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        const properties = await PropertyService.getFeaturedProperties(3)
        setFeaturedProperties(properties)
      } catch (error) {
        console.error("Error loading featured properties:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedProperties()
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set("search", searchTerm)
    if (operationType) params.set("operation", operationType)
    if (propertyType) params.set("type", propertyType)

    window.location.href = `/propiedades?${params.toString()}`
  }

  const formatPrice = (price: number, operation: string, currency: string = "USD") => {
    return (
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price) + (operation === "alquiler" ? "/mes" : "")
    )
  }

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case "casa":
        return "Casa"
      case "departamento":
        return "Departamento"
      case "local":
        return "Local Comercial"
      case "terreno":
        return "Terreno"
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800/50 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Image
                  src="/assets/logos/logocasa.svg"
                  alt="Logo Casa"
                  width={32}
                  height={32}
                  className="h-8 w-8 md:h-10 md:w-10 group-hover:scale-110 transition-transform duration-300"
                  priority
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-brand-orange/20 to-orange-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <Image
                src="/assets/logos/marconi_title.svg"
                alt="Marconi Inmobiliaria"
                width={140}
                height={45}
                className="h-8 md:h-10 w-auto group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {['PROPIEDADES', 'AGENTES', 'CONTACTO'].map((item, index) => (
                <Link 
                  key={item}
                  href={`/${item.toLowerCase()}`} 
                  className="text-gray-300 hover:text-white transition-all duration-300 relative group px-3 py-2 rounded-lg hover:bg-white/5 backdrop-blur-sm"
                >
                  <span className="relative z-10 font-medium tracking-wide">{item}</span>
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-brand-orange to-orange-500 group-hover:w-full group-hover:left-0 transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Mobile Search Bar */}
            <div className="md:hidden flex-1 max-w-xs ml-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar propiedades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 text-sm focus:border-brand-orange"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[calc(100vh-5rem)] flex flex-col">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={getOptimizedImageUrl("gustavo-papasergio-emoKYb99CRI-unsplash_w6gipy", {
              width: 1920,
              height: 1080,
              crop: "fill",
              quality: "auto",
              format: "auto",
            }) || "/placeholder.svg"}
            alt="Reconquista - Marconi Inmobiliaria"
            fill
            className="object-cover"
            priority
          />
          {/* Subtle dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Smooth gradient overlay with very soft transitions */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/20 via-45% to-transparent to-90% z-10" />

          {/* Multi-layered soft blur effect with ultra-gradual transition */}
          <div className="absolute bottom-0 left-0 right-0 h-96 z-20">
            {/* First layer - extremely subtle blur with smooth fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-gray-900/15 via-70% via-gray-900/8 via-85% to-transparent backdrop-blur-sm" />

            {/* Second layer - gentle blur with extended soft edges */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-gray-900/55 via-gray-900/25 via-60% via-gray-900/12 via-80% to-transparent backdrop-blur-md" />

            {/* Third layer - concentrated blur at bottom with smooth transition */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900/70 via-gray-900/30 via-75% to-transparent backdrop-blur-lg" />

            {/* Fourth layer - final subtle enhancement at very bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900/50 via-gray-900/20 via-80% to-transparent backdrop-blur-sm" />
          </div>

          {/* Subtle frosted glass panels for modern office look */}
          <div className="absolute bottom-20 left-8 w-32 h-32 bg-white/2 backdrop-blur-sm rounded-2xl border border-white/3 z-15 hidden md:block opacity-40" />
          <div className="absolute bottom-32 right-12 w-24 h-40 bg-white/1 backdrop-blur-sm rounded-xl border border-white/2 z-15 hidden lg:block opacity-30" />
        </div>

        {/* Content */}
        <div className="relative z-30 h-full flex flex-col justify-center items-center px-4">
          <div className="container mx-auto text-center max-w-6xl">
            {/* Main Impactful Text */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="mt-16 md:mt-24"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="mb-8 md:mb-16 lg:mb-20"
                >
                  <Image
                    src="/assets/impact_text/noesperesmas_logo.svg"
                    alt="No esperes más"
                    width={2000}
                    height={500}
                    className="w-full max-w-4xl md:max-w-6xl lg:max-w-8xl xl:max-w-[120rem] h-auto"
                    priority
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="mb-8 md:mb-16 lg:mb-20"
                >
                  <Image
                    src="/assets/logos/logocasa.svg"
                    alt="Logo Casa"
                    width={120}
                    height={120}
                    className="w-16 h-16 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48"
                  />
                </motion.div>
              </div>
            </motion.div>

          </div>

          {/* Company Branding at Bottom - Minimalist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="mt-auto mb-8 md:mb-12 text-center"
          >
            <div className="text-white">
              <Image
                src="/assets/logos/marconi_title.svg"
                alt="Marconi Inmobiliaria"
                width={400}
                height={120}
                className="h-16 md:h-28 lg:h-36 xl:h-40 w-auto mx-auto mb-4"
              />
            </div>
          </motion.div>

          {/* Scroll Indicator - Minimalist */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.8 }}
            className="hidden md:flex absolute bottom-6 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="flex flex-col items-center text-white/60"
            >
              <div className="w-px h-8 bg-white/30 mb-2"></div>
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-gradient-to-b from-gray-800 to-gray-850 relative overflow-hidden">
        {/* Floating geometric elements with enhanced blur */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-48 h-48 bg-gradient-to-br from-brand-orange/15 to-orange-500/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-60 right-20 w-32 h-32 bg-gradient-to-br from-brand-orange/20 to-orange-500/20 rounded-lg rotate-45 blur-2xl" />
          <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-brand-orange/18 to-orange-500/18 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-orange-400/12 to-brand-orange/12 rounded-full blur-2xl animate-pulse" />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4 relative">
              <span className="text-brand-orange text-sm font-semibold tracking-wider uppercase relative z-10 bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-brand-orange/20">
                Oportunidades Únicas
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/10 to-orange-500/10 rounded-full blur-xl" />
            </div>
            <h2 className="text-5xl md:text-6xl font-museo font-medium text-white mb-6 leading-tight relative">
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                Propiedades Destacadas
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Descubre las mejores oportunidades inmobiliarias en Reconquista
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-600 animate-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-600 rounded animate-pulse" />
                    <div className="h-4 bg-gray-600 rounded animate-pulse w-3/4" />
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-600 rounded animate-pulse w-20" />
                      <div className="flex gap-4">
                        <div className="h-4 bg-gray-600 rounded animate-pulse w-8" />
                        <div className="h-4 bg-gray-600 rounded animate-pulse w-8" />
                        <div className="h-4 bg-gray-600 rounded animate-pulse w-12" />
                      </div>
                    </div>
                    <div className="h-10 bg-gray-600 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : featuredProperties.length > 0 ? (
              featuredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative group"
                >
                  {/* Enhanced Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange/30 to-orange-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute -inset-2 bg-gradient-to-r from-brand-orange/10 to-orange-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

                  <Card className="relative bg-gray-750/80 backdrop-blur-xl border border-gray-600/50 hover:border-brand-orange/50 hover:shadow-2xl hover:shadow-brand-orange/20 transition-all duration-500 overflow-hidden rounded-2xl">
                    <div className="relative">
                      <div className="aspect-video relative overflow-hidden rounded-t-2xl">
                        <Image
                          src={getOptimizedImageUrl(
                            getPropertyMainImage(property.images),
                            {
                              width: 400,
                              height: 250,
                              crop: "fill",
                              quality: "auto",
                              format: "auto",
                            }
                          ) || "/placeholder.svg"}
                          alt={property.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                      </div>

                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-gradient-to-r from-brand-orange to-orange-500 backdrop-blur-md hover:from-orange-500 hover:to-brand-orange text-white shadow-lg border border-orange-300/20 rounded-full px-4 py-2 font-semibold text-sm">
                          <span className="relative z-10">⭐ Destacada</span>
                          <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Badge>
                      </div>

                      <div className="absolute bottom-4 left-4 z-10">
                        <div className="bg-black/70 backdrop-blur-md border border-white/10 text-white px-5 py-3 rounded-xl text-lg font-museo font-semibold shadow-2xl">
                          <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                            {formatPrice(property.price, property.operation_type, property.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-7 relative">
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/10 pointer-events-none" />

                      <div className="space-y-5 relative z-10">
                        <div>
                          <h3 className="font-museo font-semibold text-white text-2xl mb-3 leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-200 group-hover:bg-clip-text transition-all duration-300">
                            {property.title}
                          </h3>
                          <div className="flex items-center text-gray-300 text-base group-hover:text-gray-200 transition-colors duration-300">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-orange/20 backdrop-blur-sm mr-3">
                              <MapPin className="h-3 w-3 text-brand-orange" />
                            </div>
                            {property.address && property.neighborhood 
                              ? `${property.address}, ${property.neighborhood}`
                              : property.neighborhood || property.address || `${property.city}, ${property.province}`
                            }
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="bg-gradient-to-r from-gray-700/80 to-gray-600/80 backdrop-blur-sm border border-gray-500/30 text-gray-100 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                            {getPropertyTypeLabel(property.property_type)}
                          </span>
                          <div className="flex items-center gap-5 text-gray-300">
                            {property.bedrooms && property.bedrooms > 0 && (
                              <div className="flex items-center gap-1.5 bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700/50">
                                <Bed className="h-4 w-4 text-brand-orange" />
                                <span className="font-medium">{property.bedrooms}</span>
                              </div>
                            )}
                            {property.bathrooms && property.bathrooms > 0 && (
                              <div className="flex items-center gap-1.5 bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700/50">
                                <Bath className="h-4 w-4 text-brand-orange" />
                                <span className="font-medium">{property.bathrooms}</span>
                              </div>
                            )}
                            {property.area_m2 && (
                              <div className="flex items-center gap-1.5 bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700/50">
                                <Square className="h-4 w-4 text-brand-orange" />
                                <span className="font-medium">{property.area_m2}m²</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button 
                          onClick={() => window.location.href = `/propiedades?id=${property.id}`}
                          className="w-full bg-gradient-to-r from-brand-orange to-orange-500 hover:from-orange-500 hover:to-brand-orange text-white font-semibold py-4 text-base transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-brand-orange/25 rounded-xl border border-orange-400/20 relative overflow-hidden group/btn"
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            Ver detalles
                            <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">No hay propiedades destacadas disponibles</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link href="/propiedades">
              <Button
                size="lg"
                variant="outline"
                className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white bg-transparent"
              >
                Ver todas las propiedades
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
        {/* Enhanced Background Pattern with stronger blur */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#F97316_1px,transparent_1px)] bg-[size:50px_50px] opacity-8" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,#F97316_1px,transparent_1px)] bg-[size:30px_30px] opacity-5" />
          <div className="absolute top-1/4 left-1/3 w-[32rem] h-[32rem] bg-gradient-to-br from-brand-orange/12 to-orange-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[28rem] h-[28rem] bg-gradient-to-bl from-orange-500/10 to-brand-orange/6 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-brand-orange/8 to-orange-400/8 rounded-full blur-[80px] transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-museo font-medium mb-4 relative">
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                Nuestra Trayectoria
              </span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Números que respaldan nuestra experiencia y compromiso
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
          >
            {[
              { icon: Home, number: "500+", label: "Propiedades Vendidas" },
              { icon: Users, number: "1000+", label: "Clientes Satisfechos" },
              { icon: Award, number: "15+", label: "Años de Experiencia" },
              { icon: Star, number: "4.9", label: "Calificación Promedio" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="text-center group relative"
              >
                {/* Enhanced Glow effect */}
                <div className="absolute -inset-6 bg-gradient-to-r from-brand-orange/20 to-orange-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute -inset-3 bg-gradient-to-r from-brand-orange/15 to-orange-500/15 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />

                <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 group-hover:border-brand-orange/30 transition-all duration-500">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-orange/20 to-orange-500/20 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-brand-orange/20 backdrop-blur-sm relative overflow-hidden">
                    <stat.icon className="h-9 w-9 text-brand-orange relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="text-4xl md:text-5xl font-museo font-semibold mb-3 group-hover:scale-110 transition-all duration-300">
                    <span className="bg-gradient-to-r from-white to-gray-200 group-hover:from-brand-orange group-hover:to-orange-500 bg-clip-text text-transparent">
                      {stat.number}
                    </span>
                  </div>
                  <div className="text-gray-300 text-lg font-medium leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-brand-orange via-orange-500 to-orange-600 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-48 -translate-y-48 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-48 translate-y-48 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-32 -translate-y-32" />

          {/* Geometric patterns */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_75%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
        </div>

        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-block mb-6 relative">
              <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full text-sm font-semibold tracking-wider uppercase shadow-2xl relative z-10">
                Comienza Hoy
              </span>
              <div className="absolute inset-0 bg-white/10 rounded-full blur-lg scale-110" />
            </div>
            <h2 className="text-5xl md:text-6xl font-museo font-semibold text-white mb-8 leading-tight relative">
              <span className="relative z-10">
                ¿Listo para encontrar tu próximo hogar?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-orange-100/90 mb-12 leading-relaxed max-w-3xl mx-auto">
              Nuestro equipo de expertos está aquí para ayudarte en cada paso del camino
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link href="/propiedades">
                  <Button 
                    size="lg" 
                    className="bg-white text-brand-orange hover:bg-gray-100 font-semibold text-lg px-8 py-4 h-auto shadow-2xl hover:shadow-white/25 transition-all duration-300 rounded-xl border border-white/20 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center">
                      Explorar Propiedades
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.open('https://wa.me/5493482123456?text=Hola,%20estoy%20interesado%20en%20sus%20servicios%20inmobiliarios', '_blank')}
                  className="border-2 border-white/80 text-white hover:bg-white hover:text-brand-orange bg-white/10 backdrop-blur-md font-semibold text-lg px-8 py-4 h-auto transition-all duration-300 rounded-xl relative overflow-hidden group"
                >
                  <span className="relative z-10">Contactar Agente</span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
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
                La inmobiliaria líder en Reconquista, comprometida con encontrar el hogar perfecto para cada familia.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Enlaces</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/propiedades" className="hover:text-white transition-colors">
                    Propiedades
                  </Link>
                </li>
                <li>
                  <Link href="/agentes" className="hover:text-white transition-colors">
                    Agentes
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => window.open('https://wa.me/5493482123456?text=Hola,%20quiero%20más%20información', '_blank')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Contacto
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Reconquista, Santa Fe</li>
                <li>+54 9 3482 123456</li>
                <li>info@marconiinmobiliaria.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Marconi Inmobiliaria. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}