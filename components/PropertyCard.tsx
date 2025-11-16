'use client'

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Mail, ArrowRight, MapPin, Bed, Bath, Square, Eye } from "lucide-react"
import Link from "next/link"
import type { Property as PropertyType } from "@/lib/supabase"
import PropertyImageCarousel from "@/components/PropertyImageCarousel"

interface Property extends PropertyType {
  operation: "sale" | "rent"
  type: "house" | "apartment" | "commercial" | "terreno" | "local"
}

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const shouldShowRoomInfo = property.type !== 'terreno';

  return (
    <Card className="group overflow-hidden bg-premium-card backdrop-blur-md border border-vibrant-orange/10 shadow-lg hover:shadow-2xl hover:shadow-vibrant-orange/20 transition-all duration-700 rounded-2xl">
      {/* LAYOUT VERTICAL - CARRUSEL ARRIBA + CONTENIDO ABAJO */}

      {/* CARRUSEL DE IMÁGENES - Ocupa parte superior de la tarjeta */}
      <div className="relative">
        <PropertyImageCarousel
          images={property.images || []}
          propertyTitle={property.title}
          propertyId={property.id}
        />

        {/* OVERLAYS SOBRE EL CARRUSEL */}
        {/* ETIQUETA VENTA/ALQUILER - SUPERIOR IZQUIERDA */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-gradient-to-r from-vibrant-orange via-orange-600 to-red-600 text-bone-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-2xl shadow-vibrant-orange/40 border border-white/20 backdrop-blur-sm">
            {property.operation === "sale" ? "VENTA" : "ALQUILER"}
          </div>
        </div>

        {/* CTAs COMO ÍCONOS - SUPERIOR DERECHA */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => e.stopPropagation()}
            className="bg-black/70 hover:bg-vibrant-orange/80 text-bone-white hover:text-bone-white backdrop-blur-md rounded-full p-2.5 shadow-lg hover:scale-110 transition-all duration-300 border border-white/10"
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => e.stopPropagation()}
            className="bg-black/70 hover:bg-vibrant-orange/80 text-bone-white hover:text-bone-white backdrop-blur-md rounded-full p-2.5 shadow-lg hover:scale-110 transition-all duration-300 border border-white/10"
          >
            <Mail className="w-4 h-4" />
          </Button>
        </div>

        {/* Featured badge - INFERIOR DERECHA */}
        {property.featured && (
          <div className="absolute bottom-4 right-4 z-20 bg-gradient-to-r from-yellow-500 to-yellow-600 text-night-blue px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/20">
            <Eye className="w-3.5 h-3.5" />
            DESTACADA
          </div>
        )}
      </div>

      {/* CONTENIDO DE LA PROPIEDAD */}
      <CardContent className="p-6">
        {/* SECCIÓN SUPERIOR: PRECIO Y TÍTULO */}
        <div className="mb-4">
          {/* Precio destacado */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium text-meta mb-1">{property.currency}</div>
              <div className="text-3xl font-black heading-primary tracking-tight">
                ${property.price.toLocaleString()}
              </div>
              {property.operation === "rent" && (
                <div className="text-xs secondary-text">por mes</div>
              )}
            </div>
          </div>

          {/* Título y ubicación */}
          <Link href={`/propiedades/${property.id}`}>
            <h3 className="font-bold heading-primary text-xl mb-2 hover:text-vibrant-orange transition-colors cursor-pointer line-clamp-2">
              {property.title}
            </h3>
          </Link>
          <div className="flex items-center text-secondary font-medium text-sm mb-4">
            <MapPin className="w-4 h-4 mr-1.5 text-vibrant-orange flex-shrink-0" />
            <span className="line-clamp-1">{property.neighborhood}, Reconquista</span>
          </div>
        </div>

        {/* CARACTERÍSTICAS ESENCIALES */}
        {(() => {
          const hasCharacteristics = property.bedrooms || property.bathrooms || property.area_m2;
          return hasCharacteristics && (
            <div className="flex items-center gap-4 mb-4 text-premium-primary flex-wrap">
              {property.area_m2 && (
                <div className="flex items-center secondary-text text-sm">
                  <Square className="w-4 h-4 mr-1.5 text-support-gray" />
                  <span className="font-medium">{property.area_m2}m²</span>
                </div>
              )}
              {shouldShowRoomInfo && property.bedrooms && (
                <div className="flex items-center secondary-text text-sm">
                  <Bed className="w-4 h-4 mr-1.5 text-support-gray" />
                  <span className="font-medium">{property.bedrooms} dorm.</span>
                </div>
              )}
              {shouldShowRoomInfo && property.bathrooms && (
                <div className="flex items-center secondary-text text-sm">
                  <Bath className="w-4 h-4 mr-1.5 text-support-gray" />
                  <span className="font-medium">{property.bathrooms} baños</span>
                </div>
              )}
            </div>
          );
        })()}

        {/* FEATURES BADGES */}
        {property.features && property.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {property.features.slice(0, 3).map((feature, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-support-gray/10 text-meta border border-support-gray/25 px-2.5 py-0.5 rounded-lg text-xs font-medium"
                >
                  {feature}
                </Badge>
              ))}
              {property.features.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-meta border-support-gray/30 px-2.5 py-0.5 rounded-lg text-xs"
                >
                  +{property.features.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* BOTÓN CTA */}
        <Link href={`/propiedades/${property.id}`} className="block">
          <Button className="w-full bg-gradient-to-r from-vibrant-orange to-orange-600 hover:from-orange-600 hover:to-red-600 text-bone-white font-semibold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm">
            Ver detalles completos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default PropertyCard
