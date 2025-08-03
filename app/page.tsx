
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Phone, MessageCircle, Mail, MapPin, Bed, Bath, Square, Heart, ChevronRight, Star, TrendingUp, Users, Home, Award, ChevronDown } from 'lucide-react'
import { getOptimizedImageUrl, getPropertyMainImage } from "@/lib/cloudinary"
import { PropertyService } from "@/services/properties"
import type { Property } from "@/lib/supabase"
import Image from "next/image"

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xl font-museo font-bold">M</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-museo font-bold text-gray-900">MARCONI</h1>
                <p className="text-xs text-gray-500">ESTUDIO JURÍDICO E INMOBILIARIO</p>
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="w-full flex">
                <input
                  type="text"
                  placeholder="Buscar propiedades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-900 font-semibold">
                INICIO
              </Link>
              <Link href="/propiedades" className="text-gray-600 hover:text-gray-900">
                PROPIEDADES
              </Link>
              <Link href="/agentes" className="text-gray-600 hover:text-gray-900">
                AGENTES
              </Link>
              <Link href="/contacto" className="text-gray-600 hover:text-gray-900">
                CONTACTO
              </Link>
            </nav>

            {/* Mobile Search Bar */}
            <div className="md:hidden flex-1 max-w-xs mx-4">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contact Button */}
            <button
              onClick={() => window.open('https://wa.me/5493482123456?text=Hola,%20quiero%20más%20información', '_blank')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold flex items-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">CONSULTAR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-museo font-bold mb-6">
              Encuentra tu hogar ideal
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              La mejor selección de propiedades en Reconquista
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-museo font-bold">500+</div>
                <div className="text-blue-200">Propiedades Vendidas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-museo font-bold">1200+</div>
                <div className="text-blue-200">Familias Satisfechas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-museo font-bold">15+</div>
                <div className="text-blue-200">Años de Experiencia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-museo font-bold text-gray-900 mb-4">
              Propiedades Destacadas
            </h2>
            <p className="text-gray-600">Las mejores oportunidades del mercado</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
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
                <div key={property.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={getOptimizedImageUrl(
                        getPropertyMainImage(property.images),
                        {
                          width: 400,
                          height: 200,
                          crop: "fill",
                          quality: "auto",
                          format: "auto",
                        }
                      ) || "/placeholder.svg"}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      DESTACADA
                    </div>
                    <button className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-red-500">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-museo font-semibold text-gray-900 mb-2">
                      {property.title}
                    </h3>
                    <p className="text-gray-600 flex items-center mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.neighborhood}
                    </p>

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
                        <p className="text-2xl font-museo font-bold text-blue-600">
                          {formatPrice(property.price, property.operation_type, property.currency)}
                        </p>
                        <p className="text-sm text-gray-500">{property.operation_type}</p>
                      </div>
                      <Link
                        href={`/propiedades?id=${property.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                      >
                        Ver Detalles
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
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-museo font-semibold"
            >
              Ver Todas las Propiedades
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-museo font-bold mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-gray-300">Soluciones integrales para todas tus necesidades inmobiliarias</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: "Asesoramiento Legal", icon: "⚖️", desc: "Respaldo jurídico completo" },
              { title: "Tasaciones", icon: "📊", desc: "Evaluaciones precisas del mercado" },
              { title: "Financiamiento", icon: "💰", desc: "Opciones de crédito adaptadas" },
              { title: "Gestión Integral", icon: "🏠", desc: "De principio a fin" }
            ].map((service, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-museo font-bold mb-2">{service.title}</h3>
                <p className="text-gray-300">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-museo font-bold text-gray-900 mb-4">
                  ¿Listo para invertir?
                </h2>
                <p className="text-gray-600 mb-6">
                  Contáctanos y te ayudamos a encontrar la propiedad perfecta para ti.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-blue-600 mr-3" />
                    <span>+54 9 3482 123456</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-3" />
                    <span>info@marconi.com</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => window.open('https://wa.me/5493482123456?text=Hola,%20quiero%20más%20información', '_blank')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold"
                >
                  Consultar por WhatsApp
                </button>
                <Link
                  href="/contacto"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold block text-center"
                >
                  Enviar Consulta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                <span className="text-white text-xl font-museo font-bold">M</span>
              </div>
              <div>
                <h1 className="text-xl font-museo font-bold">MARCONI</h1>
                <p className="text-xs text-gray-400">ESTUDIO JURÍDICO E INMOBILIARIO</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Más de 15 años brindando servicios inmobiliarios y jurídicos de excelencia.
            </p>
            <div className="border-t border-gray-700 pt-6">
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
