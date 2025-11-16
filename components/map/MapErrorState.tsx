/**
 * MapErrorState - Componente de estado de error para el mapa
 *
 * Muestra un mensaje de error cuando falla la carga del mapa o las propiedades.
 * Incluye botón para reintentar la carga.
 */

'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapErrorStateProps {
  /** Altura del contenedor (CSS value) */
  height?: string | number
  /** Mensaje de error personalizado */
  message?: string
  /** Callback cuando se hace clic en "Reintentar" */
  onRetry?: () => void
}

export default function MapErrorState({
  height = '600px',
  message = 'Error al cargar el mapa. Por favor, intenta nuevamente.',
  onRetry,
}: MapErrorStateProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className="relative w-full bg-night-blue rounded-xl overflow-hidden flex items-center justify-center border border-support-gray/20"
      style={{ height: heightStyle }}
      role="alert"
      aria-live="assertive"
    >
      {/* Background con patrón sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-night-blue via-night-blue/95 to-red-900/10" />

      {/* Contenido del error */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 p-8 max-w-md text-center">
        {/* Icono de error */}
        <div className="flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full border-2 border-red-500/30">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>

        {/* Mensaje de error */}
        <div className="space-y-2">
          <h3 className="text-bone-white text-xl font-semibold">No se pudo cargar el mapa</h3>
          <p className="text-support-gray text-sm leading-relaxed">{message}</p>
        </div>

        {/* Botón de reintento */}
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-bone-white font-medium px-6 py-3 rounded-lg transition-all hover-lift"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        )}

        {/* Sugerencias adicionales */}
        <div className="text-xs text-subtle-gray space-y-1">
          <p>Sugerencias:</p>
          <ul className="list-disc list-inside text-left space-y-1">
            <li>Verifica tu conexión a internet</li>
            <li>Recarga la página</li>
            <li>Intenta nuevamente en unos momentos</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
