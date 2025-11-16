/**
 * InteractivePropertyMap - Componente principal del mapa interactivo de propiedades
 *
 * Mapa completo con marcadores de propiedades, clustering automático,
 * popups informativos y responsive design.
 *
 * Características:
 * - Integración con React Leaflet y OpenStreetMap
 * - Clustering automático para 50+ propiedades
 * - Popups con información detallada
 * - Estados de carga, error y vacío
 * - Analytics integration
 * - Accesibilidad WCAG 2.1 AA
 * - Responsive (móvil, tablet, desktop)
 */

'use client'

import { useEffect, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import type { InteractivePropertyMapProps } from '@/types/map'
import { MAP_CONFIG } from '@/lib/map-config'
import { createClusterIcon } from '@/lib/map-config'
import { usePropertyMap } from '@/hooks/usePropertyMap'
import { useMapResponsive } from '@/hooks/useMapResponsive'
import { useAnalytics } from '@/hooks/useAnalytics'
import MapLoadingState from './MapLoadingState'
import MapErrorState from './MapErrorState'
import MapEmptyState from './MapEmptyState'
import PropertyMapMarker from './PropertyMapMarker'

/**
 * Componente auxiliar para ajustar bounds del mapa
 */
function FitBoundsToProperties({ bounds }: { bounds: any }) {
  const map = useMap()

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
      })
    }
  }, [map, bounds])

  return null
}

/**
 * Componente principal del mapa interactivo
 */
export default function InteractivePropertyMap({
  height,
  initialZoom,
  initialCenter,
  enableClustering = false,
  maxProperties,
  className = '',
  onPropertyClick,
}: InteractivePropertyMapProps) {
  // Hooks
  const { properties, loading, error, bounds, isEmpty, refresh } = usePropertyMap({
    maxProperties,
  })
  const responsiveConfig = useMapResponsive()
  const { trackInteraction } = useAnalytics()

  // Configuración del mapa - memoizada para evitar re-renderizados innecesarios
  const mapHeight = useMemo(() => height || responsiveConfig.height, [height, responsiveConfig.height])
  const mapZoom = useMemo(() => initialZoom || responsiveConfig.defaultZoom, [initialZoom, responsiveConfig.defaultZoom])
  const mapCenter = useMemo(() => initialCenter || MAP_CONFIG.defaultCenter, [initialCenter])

  // Determinar si activar clustering - memoizado
  const shouldCluster = useMemo(
    () => enableClustering || properties.length >= MAP_CONFIG.clusteringThreshold,
    [enableClustering, properties.length]
  )

  // Memoizar handler de click de propiedad
  const handlePropertyClick = useCallback(
    (propertyId: number) => {
      if (onPropertyClick) {
        onPropertyClick(propertyId)
      }
    },
    [onPropertyClick]
  )

  // Tracking de carga exitosa
  useEffect(() => {
    if (!loading && !error && properties.length > 0) {
      trackInteraction('map_loaded', 'interactive_map', undefined, {
        properties_count: properties.length,
        clustering_enabled: shouldCluster,
        source: 'interactive_map',
      })
    }
  }, [loading, error, properties.length, shouldCluster, trackInteraction])

  // Tracking de errores
  useEffect(() => {
    if (error) {
      trackInteraction('map_error', 'interactive_map', undefined, {
        error_type: error.type,
        error_message: error.message,
        source: 'interactive_map',
      })
    }
  }, [error, trackInteraction])

  // Estado de carga
  if (loading) {
    return <MapLoadingState height={mapHeight} />
  }

  // Estado de error
  if (error) {
    return <MapErrorState height={mapHeight} message={error.message} onRetry={refresh} />
  }

  // Estado vacío
  if (isEmpty) {
    return <MapEmptyState height={mapHeight} />
  }

  // Renderizar mapa
  return (
    <div
      className={`relative w-full ${className}`}
      style={{ height: typeof mapHeight === 'number' ? `${mapHeight}px` : mapHeight }}
      role="region"
      aria-label="Mapa interactivo de propiedades disponibles"
      aria-describedby="map-description"
    >
      {/* Descripción para screen readers */}
      <p id="map-description" className="sr-only">
        Mapa interactivo mostrando {properties.length} {properties.length === 1 ? 'propiedad disponible' : 'propiedades disponibles'}.
        Haz clic en los marcadores para ver más información sobre cada propiedad.
      </p>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        maxBounds={MAP_CONFIG.maxBounds}
        scrollWheelZoom={true}
        className="w-full h-full rounded-xl z-10"
        zoomControl={true}
      >
        {/* Tile Layer de OpenStreetMap */}
        <TileLayer url={MAP_CONFIG.tileLayerUrl} attribution={MAP_CONFIG.attribution} />

        {/* Ajustar bounds automáticamente si existen */}
        {bounds && <FitBoundsToProperties bounds={bounds} />}

        {/* Marcadores con o sin clustering */}
        {shouldCluster ? (
          // Con clustering
          <MarkerClusterGroup
            chunkedLoading
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            maxClusterRadius={MAP_CONFIG.maxClusterRadius}
            iconCreateFunction={createClusterIcon}
          >
            {properties.map((property) => (
              <PropertyMapMarker key={property.id} property={property} onClick={handlePropertyClick} />
            ))}
          </MarkerClusterGroup>
        ) : (
          // Sin clustering
          <>
            {properties.map((property) => (
              <PropertyMapMarker key={property.id} property={property} onClick={handlePropertyClick} />
            ))}
          </>
        )}
      </MapContainer>
    </div>
  )
}
