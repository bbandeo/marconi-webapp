'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Phone, MessageCircle, Mail, MapPin, Bed, Bath, Square, Heart, ChevronRight, Star, TrendingUp, Users, Home, Award, ChevronDown } from 'lucide-react'
import { getOptimizedImageUrl, getPropertyMainImage } from "@/lib/cloudinary"
import { PropertyService } from "@/services/properties"
import type { Property } from "@/lib/supabase"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await PropertyService.getFeaturedProperties(3)
        setFeaturedProperties(data || [])
        setProperties(data || [])
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.location.href = `/propiedades?search=${encodeURIComponent(searchTerm)}`
    }
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
    <div className="min-h-screen bg-white">
      {/* Header with Modern Design */}
      <header className="relative bg-gradient-modern text-white shadow-modern">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-gold to-yellow-400 rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-2xl font-museo font-bold text-brand-dark">M</span>
              </div>
              <div>
                <h1 className="text-2xl font-museo font-bold">
                  <span className="text-gradient-gold">MARCONI</span>
                </h1>
                <p className="text-xs text-gray-300 font-light">ESTUDIO JURÍDICO E INMOBILIARIO</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-white font-semibold border-b-2 border-brand-gold pb-1">
                INICIO
              </Link>
              <Link href="/propiedades" className="text-gray-300 hover:text-white transition-all duration-300 hover:text-brand-gold">
                PROPIEDADES
              </Link>
              <Link href="/agentes" className="text-gray-300 hover:text-white transition-all duration-300 hover:text-brand-gold">
                AGENTES
              </Link>
              <Link href="/contacto" className="text-gray-300 hover:text-white transition-all duration-300 hover:text-brand-gold">
                CONTACTO
              </Link>
            </nav>

            {/* Contact Button */}
            <button
              onClick={() => window.open('https://wa.me/5493482123456?text=Hola,%20quiero%20más%20información', '_blank')}
              className="hidden md:flex items-center space-x-2 bg-brand-red hover:bg-red-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-red-glow hover:shadow-lg transform hover:scale-105"
            >
              <MessageCircle className="w-4 h-4" />
              <span>CONSULTAR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Modern Typography */}
      <section className="relative bg-gradient-modern text-white py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
          <div className="absolute top-20 right-20 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-brand-red/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-museo font-bold leading-tight">
              <span className="block">ENCUENTRA TU</span>
              <span className="block text-gradient-gold">HOGAR IDEAL</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light">
              Más de 15 años conectando familias con sus sueños inmobiliarios
            </p>

            {/* Modern Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative glass-effect rounded-2xl p-2 shadow-modern">
                <div className="flex items-center">
                  <Search className="w-6 h-6 text-gray-400 ml-4" />
                  <input
                    type="text"
                    placeholder="Buscar por ubicación, tipo de propiedad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-4 outline-none text-lg"
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-brand-gold hover:bg-yellow-500 text-brand-dark px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-glow"
                  >
                    BUSCAR
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center glass-effect rounded-2xl p-6 hover-lift">
                <div className="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-brand-gold" />
                </div>
                <div className="text-3xl font-museo font-bold text-gradient-gold">500+</div>
                <div className="text-gray-300">Propiedades Vendidas</div>
              </div>
              <div className="text-center glass-effect rounded-2xl p-6 hover-lift">
                <div className="w-16 h-16 bg-brand-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-brand-red" />
                </div>
                <div className="text-3xl font-museo font-bold text-brand-red">1200+</div>
                <div className="text-gray-300">Familias Satisfechas</div>
              </div>
              <div className="text-center glass-effect rounded-2xl p-6 hover-lift">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-3xl font-museo font-bold text-green-400">15+</div>
                <div className="text-gray-300">Años de Experiencia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-museo font-bold text-brand-dark mb-4">
              PROPIEDADES <span className="text-gradient-gold">DESTACADAS</span>
            </h2>
            <div className="w-24 h-1 bg-brand-gold mx-auto rounded-full"></div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl shadow-modern animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-t-3xl"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <div key={property.id} className="group bg-white rounded-3xl shadow-modern hover:shadow-xl transition-all duration-500 hover-lift overflow-hidden">
                  <div className="relative h-64 overflow-hidden">
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
                    <div className="absolute top-4 left-4 bg-brand-red text-white px-3 py-1 rounded-full text-sm font-semibold">
                      DESTACADA
                    </div>
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-museo font-bold text-brand-dark mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-brand-gold" />
                        {property.neighborhood}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
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
                        {property.area_m2}m²
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-museo font-bold text-gradient-gold">
                          {formatPrice(property.price, property.operation_type, property.currency)}
                        </p>
                        <p className="text-sm text-gray-500">{property.operation_type}</p>
                      </div>
                      <Link
                        href={`/propiedades?id=${property.id}`}
                        className="bg-brand-dark hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                      >
                        <span>VER</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/propiedades"
              className="inline-flex items-center space-x-2 bg-brand-gold hover:bg-yellow-500 text-brand-dark px-8 py-4 rounded-xl font-museo font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-glow"
            >
              <span>VER TODAS LAS PROPIEDADES</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-modern text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-museo font-bold mb-4">
              NUESTROS <span className="text-gradient-gold">SERVICIOS</span>
            </h2>
            <div className="w-24 h-1 bg-brand-gold mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Asesoramiento Legal", icon: "⚖️", desc: "Respaldo jurídico completo" },
              { title: "Tasaciones", icon: "📊", desc: "Evaluaciones precisas del mercado" },
              { title: "Financiamiento", icon: "💰", desc: "Opciones de crédito adaptadas" },
              { title: "Gestión Integral", icon: "🏠", desc: "De principio a fin" }
            ].map((service, index) => (
              <div key={index} className="text-center glass-effect rounded-2xl p-8 hover-lift group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-museo font-bold mb-2 text-brand-gold">
                  {service.title}
                </h3>
                <p className="text-gray-300">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-modern p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-museo font-bold text-brand-dark mb-6">
                  ¿LISTO PARA <span className="text-gradient-gold">INVERTIR?</span>
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Contáctanos y te ayudamos a encontrar la propiedad perfecta para ti.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-dark">Teléfono</p>
                      <p className="text-gray-600">+54 9 3482 123456</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-brand-red/20 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-brand-red" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-dark">Email</p>
                      <p className="text-gray-600">info@marconi.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => window.open('https://wa.me/5493482123456?text=Hola,%20quiero%20más%20información', '_blank')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>CONSULTAR POR WHATSAPP</span>
                </button>

                <Link
                  href="/contacto"
                  className="w-full bg-brand-dark hover:bg-gray-800 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 block text-center"
                >
                  <Mail className="w-6 h-6" />
                  <span>ENVIAR CONSULTA</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-gold to-yellow-400 rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-2xl font-museo font-bold text-brand-dark">M</span>
              </div>
              <div>
                <h1 className="text-2xl font-museo font-bold text-gradient-gold">MARCONI</h1>
                <p className="text-xs text-gray-400">ESTUDIO JURÍDICO E INMOBILIARIO</p>
              </div>
            </div>

            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Más de 15 años brindando servicios inmobiliarios y jurídicos de excelencia,
              conectando familias con sus hogares ideales.
            </p>

            <div className="border-t border-gray-700 pt-8">
              <p className="text-gray-500">
                © 2024 Marconi - Estudio Jurídico e Inmobiliario. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}