/**
 * MapLoadingState - Componente de estado de carga para el mapa
 *
 * Muestra un skeleton loader mientras se cargan las propiedades del mapa.
 * Diseño consistente con el sistema de diseño premium del sitio.
 */

'use client'

import { Loader2, MapPin } from 'lucide-react'

interface MapLoadingStateProps {
  /** Altura del contenedor (CSS value) */
  height?: string | number
}

export default function MapLoadingState({ height = '600px' }: MapLoadingStateProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className="relative w-full bg-night-blue rounded-xl overflow-hidden flex items-center justify-center"
      style={{ height: heightStyle }}
      role="status"
      aria-live="polite"
      aria-label="Cargando mapa de propiedades"
    >
      {/* Background con patrón sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-night-blue via-night-blue/95 to-support-gray/10" />

      {/* Skeleton loader */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 p-8">
        {/* Icono animado */}
        <div className="relative">
          <MapPin className="w-16 h-16 text-vibrant-orange animate-pulse" />
          <Loader2 className="w-16 h-16 text-vibrant-orange/60 animate-spin absolute top-0 left-0" />
        </div>

        {/* Texto de carga */}
        <div className="text-center space-y-2">
          <p className="text-bone-white text-lg font-medium">Cargando mapa de propiedades</p>
          <p className="text-support-gray text-sm">Obteniendo ubicaciones disponibles...</p>
        </div>

        {/* Skeleton pulses - simulan propiedades cargando */}
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-vibrant-orange/40 rounded-full animate-pulse" />
          <div
            className="w-3 h-3 bg-vibrant-orange/40 rounded-full animate-pulse"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="w-3 h-3 bg-vibrant-orange/40 rounded-full animate-pulse"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Cargando mapa interactivo de propiedades disponibles</span>
    </div>
  )
}
