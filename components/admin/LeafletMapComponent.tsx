'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { createPropertyMarkerIcon, ARGENTINA_BOUNDS } from '@/lib/map-config'
import { toast } from '@/hooks/use-toast'

interface LeafletMapComponentProps {
  center: [number, number]
  coordinates: [number, number] | null
  onLocationChange: (lat: number, lng: number) => void
  className?: string
}

// Component to handle map clicks
function LocationSelector({ onLocationChange }: {
  onLocationChange: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng

      // Check if coordinates are within Argentina bounds
      if (lat > ARGENTINA_BOUNDS.north ||
          lat < ARGENTINA_BOUNDS.south ||
          lng > ARGENTINA_BOUNDS.east ||
          lng < ARGENTINA_BOUNDS.west) {
        toast({
          title: "Ubicación fuera de Argentina",
          description: "Solo se pueden seleccionar ubicaciones dentro de Argentina",
          variant: "destructive"
        })
        return
      }

      onLocationChange(lat, lng)

      toast({
        title: "Ubicación actualizada",
        description: `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      })
    },
  })

  return null
}

export default function LeafletMapComponent({
  center,
  coordinates,
  onLocationChange,
  className = "h-full w-full"
}: LeafletMapComponentProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center rounded-2xl`}>
        <div className="text-gray-500">Cargando mapa...</div>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={15}
      className={className}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {coordinates && (
        <Marker
          position={coordinates}
          icon={createPropertyMarkerIcon() || undefined}
        />
      )}
      <LocationSelector onLocationChange={onLocationChange} />
    </MapContainer>
  )
}