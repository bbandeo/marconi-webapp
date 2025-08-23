"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PropertyDetailMap } from "@/components/PropertyDetailMap"
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
import Header from "@/components/Header"

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
      <div className="min-h-screen bg-premium-main">
        <Header />
        <section className="section-premium">
          <div className="container-premium">
            <div className="animate-pulse">
              <div className="h-8 bg-premium-card rounded mb-premium-lg"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-premium-lg">
                <div className="lg:col-span-2">
                  <div className="h-96 bg-premium-card rounded-2xl mb-premium-lg"></div>
                  <div className="h-48 bg-premium-card rounded-2xl"></div>
                </div>
                <div>
                  <div className="h-64 bg-premium-card rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-premium-main">
        <Header />
        <section className="section-premium flex items-center justify-center">
          <div className="text-center">
            <h1 className="heading-xl text-premium-primary mb-premium-md">{error || "Propiedad no encontrada"}</h1>
            <Button onClick={() => router.push("/propiedades")} size="lg">
              Volver a propiedades
            </Button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-premium-main">
      {/* Header Premium */}
      <Header />
      
      {/* Back button */}
      <div className="bg-premium-main border-b border-support-gray/20">
        <div className="container-premium py-premium-md">
          <Button
            onClick={() => router.push("/propiedades")}
            variant="ghost"
            className="text-premium-secondary hover:text-premium-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a propiedades
          </Button>
        </div>
      </div>

      <section className="section-premium">
        <div className="container-premium">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-premium-lg">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-premium-lg">
              <div className="relative h-96 rounded-2xl overflow-hidden bg-premium-card hover-lift">
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
            <Card className="hover-lift">
              <CardContent className="card-premium">
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

                  <h1 className="display-md text-premium-primary mb-premium-md">{property.title}</h1>
                  
                  <div className="flex items-center text-premium-secondary mb-premium-md">
                    <MapPin className="w-5 h-5 mr-2 text-vibrant-orange" />
                    {property.address}, {property.neighborhood}
                  </div>

                  <div className="display-lg text-vibrant-orange mb-premium-md">
                    {property.currency}$ {property.price.toLocaleString()}
                    {property.operation === "rent" && <span className="body-lg text-premium-secondary">/mes</span>}
                  </div>

                  {/* Property specs */}
                  <div className="flex items-center gap-6 text-premium-secondary">
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
                  <div className="mb-premium-lg">
                    <h3 className="heading-lg text-premium-primary mb-premium-md">Descripción</h3>
                    <p className="body-md text-premium-secondary leading-relaxed whitespace-pre-wrap">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* Features */}
                {property.features && property.features.length > 0 && (
                  <div>
                    <h3 className="heading-lg text-premium-primary mb-premium-md">Características</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-premium-sm">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-premium-secondary">
                          {getFeatureIcon(feature)}
                          <span className="ml-2 body-md">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Google Maps */}
            {property.address && (
              <Card className="hover-lift mt-premium-lg">
                <CardContent className="card-premium">
                  <h3 className="heading-lg text-premium-primary mb-premium-md">Ubicación</h3>
                  <PropertyDetailMap property={property} className="h-80" />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <Card className="hover-lift sticky top-8">
              <CardContent className="card-premium">
                <h3 className="heading-lg text-premium-primary mb-premium-md">¿Interesado en esta propiedad?</h3>
                
                {!showContactForm ? (
                  <div className="space-y-premium-sm">
                    <Button
                      onClick={() => setShowContactForm(true)}
                      className="w-full"
                      size="lg"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Enviar consulta
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Llamar ahora
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar email
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar visita
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-premium-md">
                    <Input
                      placeholder="Tu nombre"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary focus:border-vibrant-orange"
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Tu email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary focus:border-vibrant-orange"
                      required
                    />
                    <Input
                      placeholder="Tu teléfono"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary focus:border-vibrant-orange"
                    />
                    <Textarea
                      placeholder="Tu mensaje"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary focus:border-vibrant-orange"
                      rows={4}
                      required
                    />
                    <div className="flex gap-premium-sm">
                      <Button
                        type="submit"
                        className="flex-1"
                        size="lg"
                      >
                        Enviar
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        variant="outline"
                        size="lg"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}

                {/* Property info summary */}
                <div className="mt-premium-lg pt-premium-lg border-t border-support-gray/20">
                  <div className="caption-lg text-premium-secondary space-y-premium-sm">
                    <div className="flex justify-between">
                      <span>Código:</span>
                      <span className="text-premium-primary">#{property.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Publicado:</span>
                      <span className="text-premium-primary">
                        {new Date(property.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actualizado:</span>
                      <span className="text-premium-primary">
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
      </section>
    </div>
  )
}