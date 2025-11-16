/**
 * Tipos TypeScript para el Mapa Interactivo de Propiedades
 *
 * Define todas las interfaces y tipos necesarios para el sistema de mapas,
 * incluyendo datos de propiedades, configuración, eventos y estados.
 */

import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet'

/**
 * Datos de una propiedad optimizados para mostrar en el mapa
 * Solo incluye los campos necesarios para el mapa (no todos los datos de la propiedad)
 */
export interface MapPropertyData {
  id: number
  title: string
  price: number
  currency: string
  latitude: number
  longitude: number
  property_type: string
  operation_type: string
  images: string[]
  status: string
}

/**
 * Configuración general del mapa
 * Define parámetros de comportamiento y visualización
 */
export interface MapConfig {
  /** Centro inicial del mapa [latitude, longitude] */
  defaultCenter: LatLngExpression
  /** Nivel de zoom inicial (1-18) */
  defaultZoom: number
  /** Nivel de zoom mínimo permitido */
  minZoom: number
  /** Nivel de zoom máximo permitido */
  maxZoom: number
  /** Límites geográficos del mapa (bounds de Argentina) */
  maxBounds: LatLngBoundsExpression
  /** URL del tile layer (OpenStreetMap) */
  tileLayerUrl: string
  /** Texto de atribución del mapa */
  attribution: string
  /** Umbral de propiedades para activar clustering automático */
  clusteringThreshold: number
  /** Radio máximo de clustering en pixels */
  maxClusterRadius: number
}

/**
 * Tipos de error específicos del mapa
 */
export enum MapErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  LOADING_ERROR = 'LOADING_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NO_DATA = 'NO_DATA',
  GEOLOCATION_ERROR = 'GEOLOCATION_ERROR',
}

/**
 * Clase de error personalizada para errores del mapa
 */
export class MapError extends Error {
  type: MapErrorType
  originalError?: Error

  constructor(type: MapErrorType, message: string, originalError?: Error) {
    super(message)
    this.name = 'MapError'
    this.type = type
    this.originalError = originalError
  }
}

/**
 * Evento de interacción con el mapa
 * Se dispara cuando el usuario interactúa con marcadores o el mapa
 */
export interface MapInteractionEvent {
  type: 'pin_click' | 'view_details' | 'zoom' | 'pan'
  propertyId?: number
  timestamp: Date
  metadata?: Record<string, any>
}

/**
 * Props del componente principal InteractivePropertyMap
 */
export interface InteractivePropertyMapProps {
  /** Altura del contenedor del mapa (CSS value) */
  height?: string | number
  /** Nivel de zoom inicial (sobrescribe defaultZoom de config) */
  initialZoom?: number
  /** Centro inicial (sobrescribe defaultCenter de config) */
  initialCenter?: LatLngExpression
  /** Forzar activación de clustering independientemente del número de propiedades */
  enableClustering?: boolean
  /** Número máximo de propiedades a mostrar (para optimización) */
  maxProperties?: number
  /** Clase CSS adicional para el contenedor */
  className?: string
  /** Callback cuando se hace clic en una propiedad */
  onPropertyClick?: (propertyId: number) => void
}

/**
 * Props del componente PropertyMapMarker
 */
export interface PropertyMapMarkerProps {
  /** Datos de la propiedad a mostrar */
  property: MapPropertyData
  /** Callback cuando se hace clic en el marcador */
  onClick?: (property: MapPropertyData) => void
  /** Si el marcador está seleccionado actualmente */
  isSelected?: boolean
}

/**
 * Props del componente PropertyMapPopup
 */
export interface PropertyMapPopupProps {
  /** Datos de la propiedad a mostrar en el popup */
  property: MapPropertyData
  /** Callback cuando se hace clic en "Ver Detalles" */
  onViewDetails?: (propertyId: number) => void
}

/**
 * Resultado del hook usePropertyMap
 */
export interface UsePropertyMapResult {
  /** Array de propiedades con coordenadas válidas */
  properties: MapPropertyData[]
  /** Estado de carga */
  loading: boolean
  /** Error si ocurrió alguno */
  error: MapError | null
  /** Límites geográficos calculados basados en las propiedades */
  bounds: LatLngBoundsExpression | null
  /** Indica si no hay propiedades disponibles */
  isEmpty: boolean
  /** Función para recargar las propiedades */
  refresh: () => Promise<void>
}

/**
 * Opciones para el hook usePropertyMap
 */
export interface UsePropertyMapOptions {
  /** Intervalo de actualización automática en milisegundos (0 = desactivado) */
  refreshInterval?: number
  /** Número máximo de propiedades a cargar */
  maxProperties?: number
  /** Callback cuando las propiedades se cargan exitosamente */
  onSuccess?: (properties: MapPropertyData[]) => void
  /** Callback cuando ocurre un error */
  onError?: (error: MapError) => void
}

/**
 * Configuración responsive del mapa según el tamaño de pantalla
 */
export interface MapResponsiveConfig {
  /** Ancho mínimo de pantalla para esta configuración (px) */
  minWidth: number
  /** Altura del mapa en esta resolución */
  height: string | number
  /** Nivel de zoom predeterminado */
  defaultZoom: number
  /** Tamaño de controles (zoom buttons) */
  controlSize: 'small' | 'medium' | 'large'
  /** Mostrar atribución */
  showAttribution: boolean
}

/**
 * Límites geográficos del mapa
 */
export interface MapBounds {
  /** Límite norte (latitud máxima) */
  north: number
  /** Límite sur (latitud mínima) */
  south: number
  /** Límite este (longitud máxima) */
  east: number
  /** Límite oeste (longitud mínima) */
  west: number
}

/**
 * Límites geográficos de Argentina para validación
 */
export const ARGENTINA_BOUNDS: MapBounds = {
  north: -21.781277,
  south: -55.061314,
  east: -53.591835,
  west: -73.560562,
}

/**
 * Coordenadas del centro de Reconquista, Santa Fe
 */
export const RECONQUISTA_CENTER: LatLngExpression = [-29.15, -59.65]

/**
 * Type guard para verificar si las coordenadas son válidas
 */
export function isValidCoordinate(lat: number | null | undefined, lng: number | null | undefined): lat is number {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return false
  }

  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= ARGENTINA_BOUNDS.south &&
    lat <= ARGENTINA_BOUNDS.north &&
    lng >= ARGENTINA_BOUNDS.west &&
    lng <= ARGENTINA_BOUNDS.east
  )
}

/**
 * Type guard para verificar si una propiedad tiene coordenadas válidas
 */
export function hasValidCoordinates(property: Partial<MapPropertyData>): property is MapPropertyData {
  return (
    typeof property.latitude === 'number' &&
    typeof property.longitude === 'number' &&
    isValidCoordinate(property.latitude, property.longitude)
  )
}
