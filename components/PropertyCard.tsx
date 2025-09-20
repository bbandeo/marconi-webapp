'use client'

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Mail, ArrowRight, MapPin, Bed, Bath, Square, Home, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Property as PropertyType } from "@/lib/supabase"

interface Property extends PropertyType {
  operation: "sale" | "rent"
  type: "house" | "apartment" | "commercial" | "terreno" | "local"
}

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="group overflow-hidden bg-premium-card backdrop-blur-md border border-vibrant-orange/10 shadow-lg hover:shadow-2xl hover:shadow-vibrant-orange/20 transition-all duration-700 hover:-translate-y-1 rounded-2xl h-full flex flex-col [contain:layout_style]">
      {/* LINEAMIENTO 1: ESTRUCTURA VERTICAL - IMAGEN → PRECIO+OPERACIÓN → UBICACIÓN → CARACTERÍSTICAS → CTAs */}
      
      {/* IMAGEN CON OVERLAYS ESTRATÉGICOS */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <Link href={`/propiedades/${property.id}`}>
          <div className="relative cursor-pointer h-full">
            {property.images && property.images.length > 0 ? (
              <Image
                src={property.images[0]}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyEkJAUYsw9F4Bst2uHTXl2jjG+uKRZTgz0="
                priority={false}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg"
                }}
              />
            ) : (
              <div className="w-full h-full bg-night-blue/80 flex items-center justify-center">
                <div className="text-support-gray text-center">
                  <Home className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">Sin imagen disponible</p>
                </div>
              </div>
            )}

            {/* Gradiente sutil para mejorar legibilidad de overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-night-blue/60 via-transparent to-night-blue/20" />
          </div>
        </Link>

        {/* LINEAMIENTO 5: ETIQUETA VENTA/ALQUILER - POSICIÓN SUPERIOR IZQUIERDA CON CONTRASTE POTENCIADO */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-gradient-to-r from-vibrant-orange via-orange-600 to-red-600 text-bone-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-2xl shadow-vibrant-orange/40 border border-white/20 backdrop-blur-sm">
            {property.operation === "sale" ? "VENTA" : "ALQUILER"}
          </div>
        </div>

        {/* LINEAMIENTO 3: CTAs COMO ÍCONOS - ESQUINA SUPERIOR DERECHA */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="bg-black/70 hover:bg-vibrant-orange/80 text-bone-white hover:text-bone-white backdrop-blur-md rounded-full p-2.5 shadow-lg hover:scale-110 transition-all duration-300 border border-white/10"
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="bg-black/70 hover:bg-vibrant-orange/80 text-bone-white hover:text-bone-white backdrop-blur-md rounded-full p-2.5 shadow-lg hover:scale-110 transition-all duration-300 border border-white/10"
          >
            <Mail className="w-4 h-4" />
          </Button>
        </div>

        {/* Featured badge - Movido a esquina inferior derecha */}
        {property.featured && (
          <div className="absolute bottom-4 right-4 z-10 bg-gradient-to-r from-yellow-500 to-yellow-600 text-night-blue px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/20">
            <Eye className="w-3.5 h-3.5" />
            DESTACADA
          </div>
        )}
      </div>

      {/* LINEAMIENTO 4: CONTENIDO CON ESPACIADO GENEROSO PARA AIRE VISUAL PREMIUM */}
      <CardContent className="p-8 bg-premium-card/95 space-y-6 flex-1 flex flex-col">
        {/* PRECIO + OPERACIÓN - PROMINENCIA MÁXIMA */}
        <div className="text-center space-y-2">
          <div className="text-3xl md:text-4xl font-bold text-premium-primary flex items-baseline justify-center gap-2">
            <span className="text-lg font-medium text-premium-secondary">{property.currency}</span>
            <span className="font-black tracking-tight">${property.price.toLocaleString()}</span>
          </div>
          {property.operation === "rent" && (
            <div className="text-premium-secondary caption-lg font-medium">por mes</div>
          )}
        </div>

        {/* UBICACIÓN CON JERARQUÍA CLARA - ALTURA FIJA PARA CONSISTENCIA */}
        <div className="text-center h-24 flex flex-col justify-center">
          <Link href={`/propiedades/${property.id}`}>
            <h3 className="heading-lg text-premium-primary mb-3 hover:text-vibrant-orange transition-colors cursor-pointer line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
              {property.title}
            </h3>
          </Link>
          <div className="flex items-center justify-center text-gray-300 body-md font-medium">
            <MapPin className="w-5 h-5 mr-2" />
            <span>{property.neighborhood}, Reconquista</span>
          </div>
        </div>

        {/* LINEAMIENTO 2: CARACTERÍSTICAS CONSOLIDADAS EN LÍNEA HORIZONTAL - ALTURA FIJA */}
        <div className="h-16 flex items-center justify-center">
          {(() => {
            const shouldShowRoomInfo = property.type !== 'terreno';
            const hasCharacteristics = property.bedrooms || property.bathrooms || property.area_m2;

            return hasCharacteristics ? (
              <div className="flex items-center justify-center gap-6 text-premium-primary">
                {property.area_m2 && (
                  <div className="flex items-center gap-1">
                    <Square className="w-4 h-4 text-vibrant-orange" />
                    <span className="text-sm font-medium">{property.area_m2}m²</span>
                  </div>
                )}
                {shouldShowRoomInfo && property.bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4 text-vibrant-orange" />
                    <span className="text-sm font-medium">{property.bedrooms} dorm.</span>
                  </div>
                )}
                {shouldShowRoomInfo && property.bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4 text-vibrant-orange" />
                    <span className="text-sm font-medium">{property.bathrooms} baños</span>
                  </div>
                )}
              </div>
            ) : (
              <div></div>
            );
          })()}
        </div>

        {/* CARACTERÍSTICAS SECUNDARIAS COMO ETIQUETAS REFINADAS - ALTURA FIJA */}
        <div className="h-24 flex flex-col justify-center">
          {property.features && property.features.length > 0 ? (
            <div className="space-y-3">
              <h4 className="heading-sm text-premium-primary text-center">Características destacadas</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {property.features.slice(0, 4).map((feature, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-vibrant-orange/10 text-vibrant-orange border border-vibrant-orange/25 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-vibrant-orange/20 transition-colors"
                  >
                    {feature}
                  </Badge>
                ))}
                {property.features.length > 4 && (
                  <Badge
                    variant="outline"
                    className="text-premium-secondary border-premium-secondary/30 px-3 py-1.5 rounded-xl text-xs"
                  >
                    +{property.features.length - 4} más
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div></div>
          )}
        </div>

        {/* CTA PRINCIPAL - BOTÓN NARANJA PROMINENTE */}
        <div className="pt-4 border-t border-support-gray/20 mt-auto">
          <Link href={`/propiedades/${property.id}`} className="block">
            <Button 
              className="w-full bg-gradient-to-r from-vibrant-orange to-orange-600 hover:from-orange-600 hover:to-red-600 text-bone-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base"
              size="lg"
            >
              Ver detalles completos
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default PropertyCard