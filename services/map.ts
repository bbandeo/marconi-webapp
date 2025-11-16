/**
 * MapService - Servicio para operaciones de mapa
 *
 * Proporciona métodos para obtener y transformar datos de propiedades
 * optimizados para visualización en el mapa interactivo.
 */

import { supabase } from '@/lib/supabase'
import type { MapPropertyData, MapBounds } from '@/types/map'
import { ARGENTINA_BOUNDS, isValidCoordinate } from '@/types/map'
import type { LatLngBoundsExpression } from 'leaflet'

/**
 * Servicio de mapas para consultas y transformaciones de datos
 */
export class MapService {
  /**
   * Obtiene todas las propiedades disponibles con coordenadas válidas
   * para mostrar en el mapa
   *
   * Filtra:
   * - Solo propiedades con status = 'available'
   * - Solo propiedades con latitude y longitude no nulos
   * - Solo propiedades con coordenadas dentro de Argentina
   *
   * @returns Array de propiedades optimizadas para el mapa
   */
  static async getMapProperties(): Promise<MapPropertyData[]> {
    try {
      // Query optimizada: solo seleccionar campos necesarios para el mapa
      const { data, error } = await supabase
        .from('properties')
        .select(
          `
          id,
          title,
          price,
          currency,
          latitude,
          longitude,
          property_type,
          operation_type,
          images,
          status
        `
        )
        .eq('status', 'available')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      if (error) {
        console.error('Error fetching map properties:', error)
        throw new Error(`Error al cargar propiedades: ${error.message}`)
      }

      if (!data || data.length === 0) {
        return []
      }

      // Filtrar y transformar propiedades
      const validProperties = data
        .filter((property) => {
          // Validar que las coordenadas estén dentro de Argentina
          const isValid = this.validateCoordinates(property.latitude, property.longitude)

          if (!isValid) {
            console.warn(
              `Property ${property.id} has invalid coordinates: [${property.latitude}, ${property.longitude}]`
            )
          }

          return isValid
        })
        .map((property) => this.transformPropertyForMap(property))

      return validProperties
    } catch (error) {
      console.error('MapService.getMapProperties error:', error)
      throw error
    }
  }

  /**
   * Valida que las coordenadas estén dentro de los límites de Argentina
   *
   * @param latitude - Latitud a validar
   * @param longitude - Longitud a validar
   * @returns true si las coordenadas son válidas
   */
  static validateCoordinates(latitude: number | null, longitude: number | null): boolean {
    if (latitude === null || longitude === null) {
      return false
    }

    return isValidCoordinate(latitude, longitude)
  }

  /**
   * Calcula los límites geográficos (bounds) para ajustar el mapa
   * automáticamente a todas las propiedades
   *
   * @param properties - Array de propiedades con coordenadas
   * @returns Bounds en formato Leaflet o null si no hay propiedades
   */
  static calculateBounds(properties: MapPropertyData[]): LatLngBoundsExpression | null {
    if (!properties || properties.length === 0) {
      return null
    }

    // Si solo hay una propiedad, no calcular bounds (usar zoom predeterminado)
    if (properties.length === 1) {
      return null
    }

    let minLat = Infinity
    let maxLat = -Infinity
    let minLng = Infinity
    let maxLng = -Infinity

    properties.forEach((property) => {
      const { latitude, longitude } = property

      if (latitude < minLat) minLat = latitude
      if (latitude > maxLat) maxLat = latitude
      if (longitude < minLng) minLng = longitude
      if (longitude > maxLng) maxLng = longitude
    })

    // Agregar un pequeño padding (5%) para que los marcadores no estén en el borde
    const latPadding = (maxLat - minLat) * 0.05
    const lngPadding = (maxLng - minLng) * 0.05

    return [
      [minLat - latPadding, minLng - lngPadding], // Suroeste
      [maxLat + latPadding, maxLng + lngPadding], // Noreste
    ]
  }

  /**
   * Transforma los datos de propiedad de Supabase al formato optimizado
   * para el mapa
   *
   * @param property - Propiedad raw de Supabase
   * @returns Propiedad transformada para el mapa
   */
  static transformPropertyForMap(property: any): MapPropertyData {
    return {
      id: property.id,
      title: property.title || 'Sin título',
      price: property.price || 0,
      currency: property.currency || 'ARS',
      latitude: property.latitude,
      longitude: property.longitude,
      property_type: property.property_type || 'Casa',
      operation_type: property.operation_type || 'Venta',
      images: Array.isArray(property.images) ? property.images : [],
      status: property.status || 'available',
    }
  }

  /**
   * Obtiene una propiedad específica por ID
   *
   * @param id - ID de la propiedad
   * @returns Propiedad o null si no existe
   */
  static async getPropertyById(id: number): Promise<MapPropertyData | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(
          `
          id,
          title,
          price,
          currency,
          latitude,
          longitude,
          property_type,
          operation_type,
          images,
          status
        `
        )
        .eq('id', id)
        .single()

      if (error) {
        console.error(`Error fetching property ${id}:`, error)
        return null
      }

      if (!data) {
        return null
      }

      // Validar coordenadas
      if (!this.validateCoordinates(data.latitude, data.longitude)) {
        console.warn(`Property ${id} has invalid coordinates`)
        return null
      }

      return this.transformPropertyForMap(data)
    } catch (error) {
      console.error(`MapService.getPropertyById(${id}) error:`, error)
      return null
    }
  }

  /**
   * Verifica si una coordenada está dentro de los límites de Argentina
   * (método de utilidad pública)
   *
   * @param lat - Latitud
   * @param lng - Longitud
   * @returns true si está dentro de Argentina
   */
  static isInArgentina(lat: number, lng: number): boolean {
    return (
      lat >= ARGENTINA_BOUNDS.south &&
      lat <= ARGENTINA_BOUNDS.north &&
      lng >= ARGENTINA_BOUNDS.west &&
      lng <= ARGENTINA_BOUNDS.east
    )
  }

  /**
   * Calcula la distancia aproximada entre dos coordenadas (en km)
   * Usa la fórmula de Haversine
   *
   * @param lat1 - Latitud del punto 1
   * @param lng1 - Longitud del punto 1
   * @param lat2 - Latitud del punto 2
   * @param lng2 - Longitud del punto 2
   * @returns Distancia en kilómetros
   */
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1)
    const dLng = this.toRad(lng2 - lng1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance
  }

  /**
   * Convierte grados a radianes
   *
   * @param degrees - Grados
   * @returns Radianes
   */
  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180
  }
}
