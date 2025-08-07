"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart,
  Share2,
  Phone,
  Mail,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Wifi,
  Car,
  TreePine,
  ShieldCheck,
  Zap,
  Home
} from "lucide-react"
import type { Property as PropertyType } from "@/lib/supabase"

interface Property extends PropertyType {
  operation: "sale" | "rent"
  type: "house" | "apartment" | "commercial" | "terreno" | "local"
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/properties/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Propiedad no encontrada")
          } else {
            setError("Error al cargar la propiedad")
          }
          return
        }

        const data = await response.json()
        
        // Map property data to match expected interface
        const mappedProperty: Property = {
          ...data,
          operation: data.operation_type === "venta" ? "sale" : "rent",
          type: data.property_type === "casa" ? "house" 
               : data.property_type === "departamento" ? "apartment"
               : data.property_type === "terreno" ? "terreno"
               : data.property_type === "local" ? "commercial"
               : "house"
        }

        setProperty(mappedProperty)
        
        // Update views count
        await fetch(`/api/properties/${params.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ views: (data.views || 0) + 1 })
        })
      } catch (err) {
        console.error("Error fetching property:", err)
        setError("Error al cargar la propiedad")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProperty()
    }
  }, [params.id])

  // Image gallery navigation
  const nextImage = () => {
    if (property?.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
    }
  }

  const prevImage = () => {
    if (property?.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
    }
  }

  // Helper functions
  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case "house": return "Casa"
      case "apartment": return "Departamento"
      case "terreno": return "Terreno"
      case "commercial": return "Comercial"
      default: return "Propiedad"
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "available": return "Disponible"
      case "sold": return "Vendida"
      case "rented": return "Alquilada"
      case "reserved": return "Reservada"
      default: return status
    }
  }

  const getOperationDisplayName = (operation: string) => {
    return operation === "sale" ? "Venta" : "Alquiler"
  }

  // Feature icons mapping
  const getFeatureIcon = (feature: string) => {
    const lowerFeature = feature.toLowerCase()
    if (lowerFeature.includes('wifi') || lowerFeature.includes('internet')) return <Wifi className="w-4 h-4" />
    if (lowerFeature.includes('garage') || lowerFeature.includes('parking') || lowerFeature.includes('cochera')) return <Car className="w-4 h-4" />
    if (lowerFeature.includes('jardín') || lowerFeature.includes('parque') || lowerFeature.includes('verde')) return <TreePine className="w-4 h-4" />
    if (lowerFeature.includes('seguridad') || lowerFeature.includes('alarma')) return <ShieldCheck className="w-4 h-4" />
    if (lowerFeature.includes('luz') || lowerFeature.includes('electricidad')) return <Zap className="w-4 h-4" />
    return <Home className="w-4 h-4" />
  }

  // Contact form handler
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement contact form submission
    console.log("Contact form submitted:", contactForm)
    alert("¡Mensaje enviado! Nos pondremos en contacto contigo pronto.")
    setShowContactForm(false)
    setContactForm({ name: "", email: "", phone: "", message: "" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-800 rounded-lg mb-6"></div>
                <div className="h-48 bg-gray-800 rounded-lg"></div>
              </div>
              <div>
                <div className="h-64 bg-gray-800 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{error || "Propiedad no encontrada"}</h1>
          <Button onClick={() => router.push("/propiedades")} className="bg-brand-orange hover:bg-brand-orange/90">
            Volver a propiedades
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Back button */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            onClick={() => router.push("/propiedades")}
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a propiedades
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-6">
              <div className="relative h-96 rounded-lg overflow-hidden bg-gray-800">
                {property.images && property.images.length > 0 ? (
                  <>
                    <Image
                      src={property.images[currentImageIndex]}
                      alt={property.title}
                      fill
                      className="object-cover"
                      priority
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg"
                      }}
                    />
                    
                    {/* Image navigation */}
                    {property.images.length > 1 && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        
                        {/* Image counter */}
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                          {currentImageIndex + 1} / {property.images.length}
                        </div>
                      </>
                    )}

                    {/* Action buttons overlay */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-400 text-center">
                      <div className="w-16 h-16 bg-gray-700 rounded mx-auto mb-4"></div>
                      <p>Sin imágenes disponibles</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Image thumbnails */}
              {property.images && property.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 relative w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? "border-brand-orange" : "border-gray-600"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Vista ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg"
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                {/* Title and Basic Info */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge
                      className={
                        property.status === "available"
                          ? "bg-green-500 text-white"
                          : property.status === "sold"
                            ? "bg-red-500 text-white"
                            : property.status === "rented"
                              ? "bg-blue-500 text-white"
                              : "bg-yellow-500 text-white"
                      }
                    >
                      {getStatusDisplayName(property.status)}
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      {getTypeDisplayName(property.type)}
                    </Badge>
                    <Badge className="bg-brand-orange text-white">
                      {getOperationDisplayName(property.operation)}
                    </Badge>
                    {property.featured && (
                      <Badge className="bg-purple-500 text-white">Destacada</Badge>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold text-white mb-4">{property.title}</h1>
                  
                  <div className="flex items-center text-gray-300 mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    {property.address}, {property.neighborhood}
                  </div>

                  <div className="text-3xl font-bold text-brand-orange mb-4">
                    {property.currency}$ {property.price.toLocaleString()}
                    {property.operation === "rent" && <span className="text-lg text-gray-400">/mes</span>}
                  </div>

                  {/* Property specs */}
                  <div className="flex items-center gap-6 text-gray-300">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <Bed className="w-5 h-5 mr-2" />
                        {property.bedrooms} dormitorios
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <Bath className="w-5 h-5 mr-2" />
                        {property.bathrooms} baños
                      </div>
                    )}
                    {property.area_m2 && (
                      <div className="flex items-center">
                        <Square className="w-5 h-5 mr-2" />
                        {property.area_m2}m²
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="w-4 h-4 mr-1" />
                      {property.views || 0} vistas
                    </div>
                  </div>
                </div>

                {/* Description */}
                {property.description && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-3">Descripción</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* Features */}
                {property.features && property.features.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Características</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-gray-300">
                          {getFeatureIcon(feature)}
                          <span className="ml-2">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Google Maps */}
            {property.address && (
              <Card className="bg-gray-800 border-gray-700 mt-6">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Ubicación</h3>
                  <div className="relative h-80 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                    {/* Static map placeholder - easily replaceable with actual Google Maps */}
                    <div className="text-center text-gray-400">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-brand-orange" />
                      <p className="font-medium text-white text-lg">{property.address}</p>
                      <p className="text-gray-300">{property.neighborhood}, {property.city}</p>
                      <p className="text-sm mt-3 text-gray-400">Mapa interactivo próximamente</p>
                      <Button 
                        className="mt-4 bg-brand-orange hover:bg-brand-orange/90"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.address}, ${property.neighborhood}, ${property.city}`)}`)}
                      >
                        Ver en Google Maps
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <Card className="bg-gray-800 border-gray-700 sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">¿Interesado en esta propiedad?</h3>
                
                {!showContactForm ? (
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowContactForm(true)}
                      className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Enviar consulta
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Llamar ahora
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar email
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar visita
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <Input
                      placeholder="Tu nombre"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Tu email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                    <Input
                      placeholder="Tu teléfono"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                    <Textarea
                      placeholder="Tu mensaje"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      rows={4}
                      required
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white"
                      >
                        Enviar
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        variant="outline"
                        className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}

                {/* Property info summary */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="text-sm text-gray-400 space-y-2">
                    <div className="flex justify-between">
                      <span>Código:</span>
                      <span className="text-white">#{property.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Publicado:</span>
                      <span className="text-white">
                        {new Date(property.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actualizado:</span>
                      <span className="text-white">
                        {new Date(property.updated_at).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}