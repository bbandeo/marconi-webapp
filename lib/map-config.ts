import type { MapConfig, MapResponsiveConfig, MapBounds } from '@/types/map'
import type { DivIcon } from 'leaflet'

/**
 * CONFIGURACIÓN PRINCIPAL DEL MAPA INTERACTIVO
 * Define todos los parámetros de comportamiento y visualización
 */
export const MAP_CONFIG: MapConfig = {
  // Centro inicial en Reconquista, Santa Fe, Argentina
  defaultCenter: [-29.15, -59.65],
  // Zoom inicial (ciudad completa visible)
  defaultZoom: 13,
  // Zoom mínimo (permite ver toda Argentina)
  minZoom: 5,
  // Zoom máximo (nivel de calle)
  maxZoom: 18,
  // Límites geográficos de Argentina
  maxBounds: [
    [-55.061314, -73.560562], // Suroeste
    [-21.781277, -53.591835], // Noreste
  ],
  // CartoDB Voyager tile layer - Estilo con colores sutiles que armoniza con la paleta del sitio
  // OPCIONES ALTERNATIVAS:
  // 1. Voyager (actual): 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
  // 2. Positron (gris claro): 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
  // 3. Humanitarian HOT: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
  //    (requiere attribution: '© OpenStreetMap Contributors. Tiles courtesy of Humanitarian OpenStreetMap Team')
  tileLayerUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  // Atribución requerida por CartoDB y OpenStreetMap
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  // Activar clustering cuando hay más de 50 propiedades
  clusteringThreshold: 50,
  // Radio máximo de clustering (80px)
  maxClusterRadius: 80,
}

/**
 * LÍMITES GEOGRÁFICOS DE ARGENTINA
 * Para validación de coordenadas
 */
export const ARGENTINA_BOUNDS: MapBounds = {
  north: -21.781277,
  south: -55.061314,
  east: -53.591835,
  west: -73.560562,
}

/**
 * COORDENADAS DE RECONQUISTA, SANTA FE
 * Centro predeterminado del mapa
 */
export const RECONQUISTA_CENTER: [number, number] = [-29.15, -59.65]

/**
 * CONFIGURACIÓN RESPONSIVE DEL MAPA
 * Ajusta altura, zoom y controles según el tamaño de pantalla
 */
export const MAP_RESPONSIVE_CONFIG: MapResponsiveConfig[] = [
  {
    // Móvil (< 768px)
    minWidth: 0,
    height: '400px',
    defaultZoom: 12,
    controlSize: 'large', // Controles táctiles grandes (44x44px WCAG)
    showAttribution: true,
  },
  {
    // Tablet (768px - 1024px)
    minWidth: 768,
    height: '500px',
    defaultZoom: 13,
    controlSize: 'medium',
    showAttribution: true,
  },
  {
    // Desktop (> 1024px)
    minWidth: 1024,
    height: '600px',
    defaultZoom: 13,
    controlSize: 'medium',
    showAttribution: true,
  },
]

/**
 * ESTILOS DE MARCADORES
 * Define los colores y estilos para diferentes estados
 */
export const MARKER_STYLES = {
  default: {
    fillColor: '#F37321', // vibrant-orange
    color: '#fff', // borde blanco
    fillOpacity: 1,
    weight: 3,
    radius: 8,
  },
  selected: {
    fillColor: '#ff8c42', // naranja más claro
    color: '#fff',
    fillOpacity: 1,
    weight: 4,
    radius: 10,
  },
  hover: {
    fillColor: '#e86820', // naranja más oscuro
    color: '#fff',
    fillOpacity: 1,
    weight: 4,
    radius: 9,
  },
}

/**
 * COLORES DE MARCADORES SEGÚN TIPO DE PROPIEDAD
 */
export const MARKER_COLORS = {
  Casa: 'red',
  casa: 'red',
  house: 'red',
  Departamento: 'blue',
  departamento: 'blue',
  apartment: 'blue',
  Terreno: 'green',
  terreno: 'green',
  land: 'green',
  Comercial: 'orange',
  comercial: 'orange',
  commercial: 'orange',
  default: 'orange',
}

/**
 * Obtiene el color del marcador según el tipo de propiedad
 *
 * @param propertyType - Tipo de propiedad (Casa, Departamento, Terreno, etc.)
 * @returns Color del marcador (red, green, blue, orange)
 */
export const getMarkerColor = (propertyType: string): string => {
  return MARKER_COLORS[propertyType as keyof typeof MARKER_COLORS] || MARKER_COLORS.default
}

/**
 * Crea un icono personalizado para marcadores de propiedades
 * El color varía según el tipo de propiedad:
 * - Rojo: Casa
 * - Verde: Terreno
 * - Azul: Departamento
 * - Naranja: Otros/Comercial
 *
 * @param propertyType - Tipo de propiedad
 * @returns Icono de Leaflet o null si se ejecuta en servidor
 */
export const createPropertyMarkerIcon = (propertyType?: string) => {
  if (typeof window === 'undefined') return null

  const L = require('leaflet')
  require('leaflet-defaulticon-compatibility')
  require('leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css')

  const color = propertyType ? getMarkerColor(propertyType) : 'orange'

  // Icono personalizado con color según tipo de propiedad
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

/**
 * Crea un icono personalizado para clusters
 * Estilo premium consistente con el diseño del sitio
 *
 * @param cluster - Cluster de Leaflet con información de marcadores
 * @returns DivIcon personalizado
 */
export const createClusterIcon = (cluster: any): DivIcon => {
  if (typeof window === 'undefined') return null as any

  const L = require('leaflet')
  const childCount = cluster.getChildCount()

  // Determinar tamaño del cluster según cantidad de propiedades
  let sizeClass = 'marker-cluster-small'
  if (childCount >= 100) {
    sizeClass = 'marker-cluster-large'
  } else if (childCount >= 10) {
    sizeClass = 'marker-cluster-medium'
  }

  return new L.DivIcon({
    html: `<div class="custom-cluster-icon ${sizeClass}"><span>${childCount}</span></div>`,
    className: 'custom-cluster-container',
    iconSize: [40, 40],
  })
}

/**
 * Instancia del icono de marcador (se crea una sola vez en cliente)
 */
export const propertyMarkerIcon = createPropertyMarkerIcon()

// Geocoding service for Spanish addresses - using internal API to avoid CORS
export const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  if (!address || address.trim() === '') {
    return RECONQUISTA_CENTER
  }

  try {
    const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data && data.lat && data.lng) {
      return [data.lat, data.lng]
    }
  } catch (error) {
    console.error('Geocoding error:', error)
  }
  
  // Fallback to Reconquista, Santa Fe coordinates
  return RECONQUISTA_CENTER
}

// Reverse geocoding service - get address from coordinates
export const reverseGeocodeCoordinates = async (lat: number, lng: number): Promise<{
  address: string
  neighborhood: string
  city: string
  province: string
  country: string
  display_name: string
  formatted_address: string
} | null> => {
  try {
    const response = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`)

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

// Format address for display
export const formatAddress = (property: {
  address?: string | null
  neighborhood?: string | null
  city?: string
}) => {
  const parts = []

  if (property.address) parts.push(property.address)
  if (property.neighborhood) parts.push(property.neighborhood)
  if (property.city) parts.push(property.city)

  return parts.join(', ')
}