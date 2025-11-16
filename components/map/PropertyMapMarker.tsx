/**
 * PropertyMapMarker - Componente de marcador para propiedades en el mapa
 *
 * Renderiza un marcador interactivo en el mapa para cada propiedad.
 * Incluye popup con información detallada y tracking de analytics.
 */

'use client'

import { Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import type { PropertyMapMarkerProps } from '@/types/map'
import PropertyMapPopup from './PropertyMapPopup'
import { createPropertyMarkerIcon } from '@/lib/map-config'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function PropertyMapMarker({ property, onClick, isSelected = false }: PropertyMapMarkerProps) {
  const [markerIcon, setMarkerIcon] = useState<any>(null)
  const { trackInteraction } = useAnalytics()

  // Crear icono del marcador en cliente con color según tipo de propiedad
  useEffect(() => {
    const icon = createPropertyMarkerIcon(property.property_type)
    setMarkerIcon(icon)
  }, [property.property_type])

  // Handler para click en el marcador
  const handleMarkerClick = () => {
    // Callback opcional
    if (onClick) {
      onClick(property)
    }

    // Tracking de analytics
    trackInteraction('map_pin_click', `map_marker_${property.id}`, property.id, {
      property_title: property.title,
      property_type: property.property_type,
      operation_type: property.operation_type,
      source: 'interactive_map',
    })
  }

  // Handler para click en "Ver Detalles"
  const handleViewDetails = (propertyId: number) => {
    // Tracking de analytics
    trackInteraction('map_view_details', `map_view_details_${propertyId}`, propertyId, {
      source: 'interactive_map',
      action_type: 'view_details',
    })
  }

  // No renderizar si no hay icono (SSR)
  if (!markerIcon) {
    return null
  }

  return (
    <Marker
      position={[property.latitude, property.longitude]}
      icon={markerIcon}
      eventHandlers={{
        click: handleMarkerClick,
      }}
      // Atributos de accesibilidad
      aria-label={`Propiedad: ${property.title}`}
      title={property.title}
      role="button"
      tabIndex={0}
    >
      <Popup
        closeButton={true}
        className="property-map-popup"
        maxWidth={400}
        minWidth={320}
        // Atributos de accesibilidad
        aria-label={`Información de ${property.title}`}
      >
        <PropertyMapPopup property={property} onViewDetails={handleViewDetails} />
      </Popup>
    </Marker>
  )
}
