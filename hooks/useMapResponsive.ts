/**
 * useMapResponsive - Hook para configuración responsive del mapa
 *
 * Detecta el tamaño de la ventana y retorna la configuración apropiada
 * del mapa según el dispositivo (móvil, tablet, desktop).
 */

'use client'

import { useState, useEffect } from 'react'
import type { MapResponsiveConfig } from '@/types/map'
import { MAP_RESPONSIVE_CONFIG } from '@/lib/map-config'

/**
 * Hook que detecta el tamaño de ventana y retorna configuración responsive
 *
 * @returns Configuración del mapa apropiada para el tamaño de pantalla actual
 *
 * @example
 * ```tsx
 * const config = useMapResponsive()
 * // config.height, config.defaultZoom, config.controlSize, etc.
 * ```
 */
export function useMapResponsive(): MapResponsiveConfig {
  // Estado para la configuración actual
  const [config, setConfig] = useState<MapResponsiveConfig>(() => {
    // Default para SSR (desktop)
    return MAP_RESPONSIVE_CONFIG[MAP_RESPONSIVE_CONFIG.length - 1]
  })

  useEffect(() => {
    // Solo ejecutar en cliente
    if (typeof window === 'undefined') return

    /**
     * Determina la configuración apropiada según el ancho de ventana
     */
    const getResponsiveConfig = (): MapResponsiveConfig => {
      const width = window.innerWidth

      // Buscar la configuración apropiada
      // Itera en reversa para obtener la configuración más grande que aplique
      for (let i = MAP_RESPONSIVE_CONFIG.length - 1; i >= 0; i--) {
        if (width >= MAP_RESPONSIVE_CONFIG[i].minWidth) {
          return MAP_RESPONSIVE_CONFIG[i]
        }
      }

      // Fallback a la primera configuración (móvil)
      return MAP_RESPONSIVE_CONFIG[0]
    }

    /**
     * Handler para cambios en el tamaño de ventana
     * Usa debounce para optimizar rendimiento
     */
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const newConfig = getResponsiveConfig()
        setConfig(newConfig)
      }, 150) // Debounce de 150ms
    }

    // Establecer configuración inicial
    setConfig(getResponsiveConfig())

    // Agregar listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return config
}
