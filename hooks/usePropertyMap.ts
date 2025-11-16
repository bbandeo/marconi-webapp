/**
 * usePropertyMap - Hook personalizado para gestión del mapa de propiedades
 *
 * Proporciona estado y funciones para cargar y gestionar propiedades
 * en el mapa interactivo.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  UsePropertyMapResult,
  UsePropertyMapOptions,
  MapPropertyData,
} from '@/types/map'
import { MapErrorType, MapError } from '@/types/map'
import { MapService } from '@/services/map'
import type { LatLngBoundsExpression } from 'leaflet'

/**
 * Hook para gestionar el estado y carga de propiedades del mapa
 *
 * @param options - Opciones de configuración del hook
 * @returns Estado y funciones para el mapa
 *
 * @example
 * ```tsx
 * const { properties, loading, error, refresh } = usePropertyMap({
 *   refreshInterval: 60000, // Refrescar cada minuto
 *   onSuccess: (props) => console.log(`Loaded ${props.length} properties`)
 * })
 * ```
 */
export function usePropertyMap(options: UsePropertyMapOptions = {}): UsePropertyMapResult {
  const { refreshInterval = 0, maxProperties, onSuccess, onError } = options

  // Estado
  const [properties, setProperties] = useState<MapPropertyData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<MapError | null>(null)
  const [bounds, setBounds] = useState<LatLngBoundsExpression | null>(null)

  // Referencias para control de fetch y cleanup
  const abortControllerRef = useRef<AbortController | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Función para cargar propiedades desde la API
   */
  const loadProperties = useCallback(async () => {
    // Cancelar fetch anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      // Timeout de 10 segundos
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort()
      }, 10000)

      // Fetch desde API
      const response = await fetch('/api/properties/map-locations', {
        signal: abortControllerRef.current.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error desconocido al cargar propiedades')
      }

      let loadedProperties = data.properties || []

      // Aplicar límite de propiedades si se especificó
      if (maxProperties && loadedProperties.length > maxProperties) {
        loadedProperties = loadedProperties.slice(0, maxProperties)
      }

      // Calcular bounds automáticamente
      const calculatedBounds = MapService.calculateBounds(loadedProperties)

      // Actualizar estado
      setProperties(loadedProperties)
      setBounds(calculatedBounds)
      setError(null)

      // Callback de éxito
      if (onSuccess) {
        onSuccess(loadedProperties)
      }
    } catch (err) {
      // No tratar AbortError como error real
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }

      console.error('Error loading properties for map:', err)

      // Crear MapError tipado
      const mapError = new MapError(
        MapErrorType.NETWORK_ERROR,
        err instanceof Error ? err.message : 'Error desconocido',
        err instanceof Error ? err : undefined
      )

      setError(mapError)
      setProperties([])
      setBounds(null)

      // Callback de error
      if (onError) {
        onError(mapError)
      }
    } finally {
      setLoading(false)
    }
  }, [maxProperties, onSuccess, onError])

  /**
   * Función pública para refrescar datos manualmente
   */
  const refresh = useCallback(async () => {
    await loadProperties()
  }, [loadProperties])

  // Cargar propiedades al montar el componente
  useEffect(() => {
    loadProperties()

    // Cleanup: cancelar fetch al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadProperties])

  // Configurar refresh interval si se especificó
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        loadProperties()
      }, refreshInterval)

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
      }
    }
  }, [refreshInterval, loadProperties])

  // Calcular si está vacío
  const isEmpty = !loading && !error && properties.length === 0

  return {
    properties,
    loading,
    error,
    bounds,
    isEmpty,
    refresh,
  }
}
