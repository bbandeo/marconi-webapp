'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Property } from '@/lib/supabase'
import { geocodeAddress, formatAddress, createPropertyMarkerIcon, RECONQUISTA_CENTER } from '@/lib/map-config'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Dynamically import the map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface PropertyDetailMapProps {
  property: Property
  className?: string
}

export function PropertyDetailMap({ property, className = "h-80" }: PropertyDetailMapProps) {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const getCoordinates = async () => {
      setIsLoading(true)
      const address = formatAddress(property)
      const coords = await geocodeAddress(address)
      setCoordinates(coords || RECONQUISTA_CENTER)
      setIsLoading(false)
    }

    getCoordinates()
  }, [property, isClient])

  const handleOpenInGoogleMaps = () => {
    const query = formatAddress(property)
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    window.open(url, '_blank')
  }

  // Always render placeholder during SSR and loading states
  if (!isClient || isLoading || !coordinates) {
    return (
      <div className={`${className} rounded-2xl overflow-hidden bg-gray-800/50 border border-gray-700/30 flex items-center justify-center`}>
        <div className="text-center text-gray-400">
          {!isClient || isLoading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-600 border-t-orange-500 mx-auto mb-2"></div>
              <p className="text-sm">Cargando mapa...</p>
            </>
          ) : (
            <>
              <p className="text-sm mb-4">Error al cargar el mapa</p>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleOpenInGoogleMaps}
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-orange-500/20 hover:border-orange-500"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver en Google Maps
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} rounded-2xl overflow-hidden relative border border-gray-700/30`}>
      <MapContainer
        center={coordinates}
        zoom={15}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={coordinates} icon={createPropertyMarkerIcon() || undefined}>
          <Popup>
            <div className="text-center p-2">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">{property.title}</h3>
              <p className="text-gray-700 text-xs mb-2">{formatAddress(property)}</p>
              <p className="text-orange-600 font-bold text-sm">
                {property.currency}$ {property.price.toLocaleString()}
              </p>
              {property.operation_type === "alquiler" && (
                <p className="text-gray-600 text-xs">por mes</p>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Google Maps button overlay */}
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline"
          size="sm"
          onClick={handleOpenInGoogleMaps}
          className="bg-black/70 border-gray-600 text-white hover:bg-orange-500/20 hover:border-orange-500 backdrop-blur-sm"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Google Maps
        </Button>
      </div>
    </div>
  )
}