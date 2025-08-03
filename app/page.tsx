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
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/assets/logos/logocasa.svg"
                alt="Logo Casa"
                width={32}
                height={32}
                className="h-8 w-8 md:h-10 md:w-10"
                priority
              />
              <Image
                src="/assets/logos/marconi_title.svg"
                alt="Marconi Inmobiliaria"
                width={140}
                height={45}
                className="h-8 md:h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/propiedades" className="text-gray-300 hover:text-white transition-colors">
                PROPIEDADES
              </Link>
              <Link href="/agentes" className="text-gray-300 hover:text-white transition-colors">
                AGENTES
              </Link>
              <Link href="/contacto" className="text-gray-300 hover:text-white transition-colors">
                CONTACTO
              </Link>
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
      <section className="relative h-screen flex flex-col">
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
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center px-4">
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
      <section className="py-24 bg-gradient-to-b from-gray-800 to-gray-850">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <span className="text-brand-orange text-sm font-semibold tracking-wider uppercase">
                Oportunidades Únicas
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-museo font-medium text-white mb-6 leading-tight">
              Propiedades Destacadas
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
                >
                  <Card className="bg-gray-750 border-gray-600 hover:border-brand-orange hover:shadow-2xl hover:shadow-brand-orange/10 transition-all duration-500 overflow-hidden group">
                    <div className="relative">
                      <div className="aspect-video relative overflow-hidden">
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
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <div className="absolute top-4 left-4">
                        <Badge className="bg-brand-orange/90 backdrop-blur-sm hover:bg-brand-orange text-white shadow-lg">
                          ⭐ Destacada
                        </Badge>
                      </div>

                      <div className="absolute bottom-4 left-4">
                        <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-lg font-museo font-semibold">
                          {formatPrice(property.price, property.operation_type, property.currency)}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-7">
                      <div className="space-y-5">
                        <div>
                          <h3 className="font-museo font-semibold text-white text-2xl mb-3 leading-tight">
                            {property.title}
                          </h3>
                          <div className="flex items-center text-gray-300 text-base">
                            <MapPin className="h-4 w-4 mr-2 text-brand-orange" />
                            {property.address && property.neighborhood 
                              ? `${property.address}, ${property.neighborhood}`
                              : property.neighborhood || property.address || `${property.city}, ${property.province}`
                            }
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="bg-gray-600/70 text-gray-100 px-4 py-2 rounded-full text-sm font-medium">
                            {getPropertyTypeLabel(property.property_type)}
                          </span>
                          <div className="flex items-center gap-5 text-gray-300">
                            {property.bedrooms && property.bedrooms > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Bed className="h-4 w-4 text-brand-orange" />
                                <span className="font-medium">{property.bedrooms}</span>
                              </div>
                            )}
                            {property.bathrooms && property.bathrooms > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Bath className="h-4 w-4 text-brand-orange" />
                                <span className="font-medium">{property.bathrooms}</span>
                              </div>
                            )}
                            {property.area_m2 && (
                              <div className="flex items-center gap-1.5">
                                <Square className="h-4 w-4 text-brand-orange" />
                                <span className="font-medium">{property.area_m2}m²</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button 
                          onClick={() => window.location.href = `/propiedades?id=${property.id}`}
                          className="w-full bg-gradient-to-r from-brand-orange to-orange-500 hover:from-orange-500 hover:to-brand-orange text-white font-semibold py-3 text-base transition-all duration-300 shadow-lg"
                        >
                          Ver detalles
                          <ArrowRight className="ml-2 h-5 w-5" />
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
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#F97316_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-museo font-medium text-white mb-4">
              Nuestra Trayectoria
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
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-orange/20 to-orange-500/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 border border-brand-orange/20">
                  <stat.icon className="h-9 w-9 text-brand-orange" />
                </div>
                <div className="text-4xl md:text-5xl font-museo font-semibold text-white mb-3 group-hover:text-brand-orange transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-300 text-lg font-medium leading-relaxed">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-brand-orange via-orange-500 to-orange-600 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-48 -translate-y-48" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-48 translate-y-48" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-block mb-6">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold tracking-wider uppercase">
                Comienza Hoy
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-museo font-semibold text-white mb-8 leading-tight">
              ¿Listo para encontrar tu próximo hogar?
            </h2>
            <p className="text-xl md:text-2xl text-orange-100 mb-12 leading-relaxed max-w-3xl mx-auto">
              Nuestro equipo de expertos está aquí para ayudarte en cada paso del camino
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/propiedades">
                <Button 
                  size="lg" 
                  className="bg-white text-brand-orange hover:bg-gray-100 font-semibold text-lg px-8 py-4 h-auto shadow-2xl hover:shadow-white/25 transition-all duration-300"
                >
                  Explorar Propiedades
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.open('https://wa.me/5493482123456?text=Hola,%20estoy%20interesado%20en%20sus%20servicios%20inmobiliarios', '_blank')}
                className="border-2 border-white text-white hover:bg-white hover:text-brand-orange bg-transparent font-semibold text-lg px-8 py-4 h-auto backdrop-blur-sm transition-all duration-300"
              >
                Contactar Agente
              </Button>
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
