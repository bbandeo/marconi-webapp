/**
 * PropertyMapPopup - Componente de popup para propiedades en el mapa
 *
 * Muestra información detallada de una propiedad cuando se hace clic en su marcador.
 * Incluye imagen, precio, tipo y enlace para ver detalles completos.
 */

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Home, DollarSign, ArrowRight } from 'lucide-react'
import type { PropertyMapPopupProps } from '@/types/map'
import { getOptimizedImageUrl } from '@/lib/cloudinary'

export default function PropertyMapPopup({ property, onViewDetails }: PropertyMapPopupProps) {
  // Formatear precio
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Obtener primera imagen optimizada
  const firstImage = property.images && property.images.length > 0 ? property.images[0] : null

  // Manejar tanto URLs completas como public_ids de Cloudinary
  const getImageUrl = (image: string | null): string => {
    if (!image) return '/placeholder.jpg'

    // Si ya es una URL completa (http o https), usarla directamente
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image
    }

    // Si es un public_id de Cloudinary, optimizarlo
    try {
      const optimizedUrl = getOptimizedImageUrl(image, {
        width: 400,
        height: 250,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto',
      })

      // Si getOptimizedImageUrl retorna vacío, usar placeholder
      return optimizedUrl || '/placeholder.jpg'
    } catch (error) {
      console.warn('Error optimizing image:', error)
      return '/placeholder.jpg'
    }
  }

  const imageUrl = getImageUrl(firstImage)

  // Traducir tipos y capitalizar
  const translatePropertyType = (type: string) => {
    const translations: Record<string, string> = {
      house: 'Casa',
      apartment: 'Departamento',
      land: 'Terreno',
      commercial: 'Comercial',
      casa: 'Casa',
      departamento: 'Departamento',
      terreno: 'Terreno',
      comercial: 'Comercial',
      Casa: 'Casa',
      Departamento: 'Departamento',
      Terreno: 'Terreno',
      Comercial: 'Comercial',
    }
    const translated = translations[type] || type
    // Capitalizar primera letra si no está traducido
    return translated.charAt(0).toUpperCase() + translated.slice(1).toLowerCase()
  }

  const translateOperationType = (type: string) => {
    const translations: Record<string, string> = {
      sale: 'Venta',
      rent: 'Alquiler',
      Venta: 'Venta',
      Alquiler: 'Alquiler',
    }
    return translations[type] || type
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(property.id)
    }
  }

  return (
    <div className="w-[320px] sm:w-[360px] bg-gradient-to-br from-night-blue/98 to-night-blue/95 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl border border-support-gray/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Imagen de la propiedad */}
      <div className="relative w-full h-48 bg-gradient-to-br from-support-gray/20 to-support-gray/10 overflow-hidden group">
        <Image
          src={imageUrl}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 640px) 320px, 360px"
          loading="lazy"
          unoptimized={imageUrl.startsWith('http') && !imageUrl.includes('cloudinary')}
          onError={(e) => {
            // Si la imagen falla, mostrar placeholder
            const target = e.target as HTMLImageElement
            target.src = '/placeholder.jpg'
          }}
        />

        {/* Badge de tipo de operación */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-vibrant-orange text-bone-white text-xs font-semibold uppercase tracking-wide rounded-full shadow-lg">
            {translateOperationType(property.operation_type)}
          </span>
        </div>
      </div>

      {/* Contenido del popup */}
      <div className="p-4 space-y-3">
        {/* Título */}
        <h3 className="text-bone-white text-base font-semibold line-clamp-2 leading-snug">{property.title}</h3>

        {/* Información de la propiedad */}
        <div className="space-y-2">
          {/* Precio */}
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-vibrant-orange flex-shrink-0" />
            <span className="text-bone-white text-lg font-bold">
              {formatPrice(property.price, property.currency)}
            </span>
          </div>

          {/* Tipo de propiedad */}
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-subtle-gray flex-shrink-0" />
            <span className="text-subtle-gray text-sm">{translatePropertyType(property.property_type)}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-support-gray/20 my-3" />

        {/* Botón Ver Detalles */}
        <Link
          href={`/propiedades/${property.id}`}
          onClick={handleViewDetails}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-vibrant-orange hover:bg-vibrant-orange/90 text-sm font-semibold rounded-lg transition-all hover-lift group"
          style={{ color: '#F5F5F5' }}
        >
          <span className="text-bone-white">Ver Detalles</span>
          <ArrowRight className="w-4 h-4 text-bone-white transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}
