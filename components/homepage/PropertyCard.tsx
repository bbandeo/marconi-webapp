"use client"

import { motion } from "framer-motion"
import { MapPin, Bed, Bath, Square, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getOptimizedImageUrl, getPropertyMainImage } from "@/lib/cloudinary"
import type { Property } from "@/lib/supabase"
import Image from "next/image"

interface PropertyCardProps {
  property: Property
  index: number
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

export default function PropertyCard({ property, index }: PropertyCardProps) {
  return (
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
  )
}