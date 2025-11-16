'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Property } from '@/lib/supabase'
import { geocodeAddress, formatAddress, RECONQUISTA_CENTER } from '@/lib/map-config'
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

interface PropertyMiniMapProps {
  property: Pick<Property, 'address' | 'neighborhood' | 'city' | 'title'>
  className?: string
}

export function PropertyMiniMap({ property, className = "h-32 w-full" }: PropertyMiniMapProps) {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const getCoordinates = async () => {
      const address = formatAddress(property)
      const coords = await geocodeAddress(address)
      setCoordinates(coords || RECONQUISTA_CENTER)
    }

    getCoordinates()
  }, [property, isClient])

  // Always render placeholder during SSR and initial client render
  if (!isClient || !coordinates) {
    return (
      <div className={`${className} rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700/30 flex items-center justify-center`}>
        <div className="text-gray-400 text-xs">
          {!isClient ? 'Cargando mapa...' : !coordinates ? 'Mapa no disponible' : 'Cargando...'}
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700/30`}>
      <MapContainer
        center={coordinates}
        zoom={13}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coordinates} />
      </MapContainer>
    </div>
  )
}