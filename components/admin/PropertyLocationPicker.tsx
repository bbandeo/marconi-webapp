'use client'

import React, { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { geocodeAddress, reverseGeocodeCoordinates, formatAddress, createPropertyMarkerIcon, RECONQUISTA_CENTER, ARGENTINA_BOUNDS } from '@/lib/map-config'
import { MapPin, RotateCcw, Navigation } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import 'leaflet/dist/leaflet.css'

// Import all Leaflet components dynamically including useMapEvents
const LeafletMap = dynamic(() => import('./LeafletMapComponent'), { ssr: false })

interface PropertyLocationPickerProps {
  address?: string
  neighborhood?: string
  city?: string
  province?: string
  latitude?: number
  longitude?: number
  onLocationChange?: (lat: number, lng: number) => void
  onAddressChange?: (address: string, neighborhood: string, city: string, province: string) => void
  className?: string
}


export function PropertyLocationPicker({
  address,
  neighborhood,
  city = "Reconquista",
  province = "Santa Fe",
  latitude,
  longitude,
  onLocationChange,
  onAddressChange,
  className = "h-80"
}: PropertyLocationPickerProps) {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  )
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isReverseSyncing, setIsReverseSyncing] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (latitude && longitude) {
      setCoordinates([latitude, longitude])
    }
  }, [latitude, longitude])

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setCoordinates([lat, lng])
    onLocationChange?.(lat, lng)
  }, [onLocationChange])

  const handleSyncFromAddress = async () => {
    if (!address || !address.trim()) {
      toast({
        title: "Dirección requerida",
        description: "Complete la dirección antes de sincronizar",
        variant: "destructive"
      })
      return
    }

    setIsSyncing(true)

    try {
      // Format address similar to how it's done in map-config
      const parts = []
      if (address) parts.push(address)
      if (neighborhood) parts.push(neighborhood)
      if (city) parts.push(city)
      if (province) parts.push(province)
      parts.push("Argentina") // Always add Argentina for better geocoding

      const fullAddress = parts.join(', ')

      const coords = await geocodeAddress(fullAddress)

      if (coords) {
        setCoordinates(coords)
        onLocationChange?.(coords[0], coords[1])

        toast({
          title: "Ubicación sincronizada",
          description: `Ubicación encontrada para: ${fullAddress}`,
        })
      } else {
        toast({
          title: "No se pudo geocodificar",
          description: "No se encontró la ubicación. Se usará ubicación por defecto.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error syncing location:', error)
      toast({
        title: "Error al sincronizar",
        description: "Hubo un error al obtener la ubicación",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSyncFromMap = async () => {
    if (!coordinates) {
      toast({
        title: "Sin ubicación seleccionada",
        description: "Primero seleccione una ubicación en el mapa",
        variant: "destructive"
      })
      return
    }

    setIsReverseSyncing(true)

    try {
      const [lat, lng] = coordinates
      const addressData = await reverseGeocodeCoordinates(lat, lng)

      if (addressData && onAddressChange) {
        onAddressChange(
          addressData.address,
          addressData.neighborhood,
          addressData.city,
          addressData.province
        )

        toast({
          title: "Dirección sincronizada",
          description: `Dirección actualizada: ${addressData.formatted_address}`,
        })
      } else {
        toast({
          title: "No se pudo obtener la dirección",
          description: "No se encontró información de dirección para esta ubicación",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error syncing from map:', error)
      toast({
        title: "Error al sincronizar",
        description: "Hubo un error al obtener la dirección desde el mapa",
        variant: "destructive"
      })
    } finally {
      setIsReverseSyncing(false)
    }
  }

  const handleResetLocation = () => {
    setCoordinates(RECONQUISTA_CENTER)
    onLocationChange?.(RECONQUISTA_CENTER[0], RECONQUISTA_CENTER[1])

    toast({
      title: "Ubicación restablecida",
      description: "Se restableció la ubicación a Reconquista, Santa Fe",
    })
  }

  // Show loading placeholder during SSR
  if (!isClient) {
    return (
      <div className={`${className} rounded-2xl overflow-hidden bg-premium-card border border-support-gray/20 flex items-center justify-center`}>
        <div className="text-center text-premium-secondary">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-support-gray/20 border-t-vibrant-orange mx-auto mb-2"></div>
          <p className="text-sm">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  const currentCoords = coordinates || RECONQUISTA_CENTER

  return (
    <div className="space-y-4">
      {/* Control buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          onClick={handleSyncFromAddress}
          disabled={isSyncing || !address?.trim()}
          className="flex items-center gap-2"
          variant="outline"
        >
          <MapPin className="w-4 h-4" />
          {isSyncing ? "Sincronizando..." : "Sincronizar desde dirección"}
        </Button>

        <Button
          type="button"
          onClick={handleSyncFromMap}
          disabled={isReverseSyncing || !coordinates}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Navigation className="w-4 h-4" />
          {isReverseSyncing ? "Sincronizando..." : "Sincronizar desde mapa"}
        </Button>

        <Button
          type="button"
          onClick={handleResetLocation}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Restablecer
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-sm text-premium-secondary bg-premium-card/30 rounded-lg p-3 border border-support-gray/20">
        <p className="mb-1"><strong>Instrucciones:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li><strong>Sincronizar desde dirección:</strong> Usa los campos de dirección para ubicar en el mapa</li>
          <li><strong>Selección manual:</strong> Haz clic directamente en el mapa para seleccionar ubicación</li>
          <li><strong>Sincronizar desde mapa:</strong> Completa los campos de dirección desde la ubicación del mapa</li>
          <li>Solo se permiten ubicaciones dentro de Argentina</li>
        </ul>
      </div>

      {/* Map container */}
      <div className={`${className} rounded-2xl overflow-hidden relative border border-support-gray/20`}>
        <LeafletMap
          center={currentCoords}
          coordinates={coordinates}
          onLocationChange={handleLocationChange}
          className="h-full w-full"
        />

        {/* Coordinates display overlay */}
        {coordinates && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm">
            <div>Lat: {coordinates[0].toFixed(6)}</div>
            <div>Lng: {coordinates[1].toFixed(6)}</div>
          </div>
        )}
      </div>
    </div>
  )
}