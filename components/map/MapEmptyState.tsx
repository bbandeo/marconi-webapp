/**
 * MapEmptyState - Componente de estado vacío para el mapa
 *
 * Muestra un mensaje cuando no hay propiedades disponibles para mostrar.
 * Diseño amigable y consistente con el sistema de diseño del sitio.
 */

'use client'

import { MapPin, Search, Home } from 'lucide-react'

interface MapEmptyStateProps {
  /** Altura del contenedor (CSS value) */
  height?: string | number
  /** Mensaje personalizado (opcional) */
  message?: string
}

export default function MapEmptyState({
  height = '600px',
  message = 'No hay propiedades disponibles en este momento',
}: MapEmptyStateProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className="relative w-full bg-night-blue rounded-xl overflow-hidden flex items-center justify-center border border-support-gray/20"
      style={{ height: heightStyle }}
      role="status"
      aria-live="polite"
    >
      {/* Background con patrón sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-night-blue via-night-blue/95 to-support-gray/10" />

      {/* Contenido vacío */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 p-8 max-w-md text-center">
        {/* Iconos ilustrativos */}
        <div className="relative">
          <div className="flex items-center justify-center w-24 h-24 bg-support-gray/10 rounded-full">
            <MapPin className="w-12 h-12 text-support-gray/60" />
          </div>
          <div className="absolute -top-2 -right-2 flex items-center justify-center w-10 h-10 bg-night-blue border-2 border-support-gray/30 rounded-full">
            <Search className="w-5 h-5 text-subtle-gray" />
          </div>
        </div>

        {/* Mensaje principal */}
        <div className="space-y-2">
          <h3 className="text-bone-white text-xl font-semibold">Sin propiedades disponibles</h3>
          <p className="text-support-gray text-sm leading-relaxed">{message}</p>
        </div>

        {/* Mensaje informativo adicional */}
        <div className="flex items-start gap-3 bg-support-gray/5 rounded-lg p-4 border border-support-gray/10">
          <Home className="w-5 h-5 text-vibrant-orange flex-shrink-0 mt-0.5" />
          <div className="text-left space-y-1">
            <p className="text-subtle-gray text-xs leading-relaxed">
              Estamos actualizando nuestro catálogo constantemente. Vuelve pronto para ver nuevas propiedades con
              ubicación en el mapa.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 bg-support-gray/20 rounded-full" />
          <div className="w-2 h-2 bg-support-gray/20 rounded-full" />
          <div className="w-2 h-2 bg-support-gray/20 rounded-full" />
        </div>
      </div>
    </div>
  )
}
