// Custom marker icons for real estate - only create on client side
export const createPropertyMarkerIcon = () => {
  if (typeof window === 'undefined') return null
  
  const L = require('leaflet')
  require('leaflet-defaulticon-compatibility')
  require('leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css')

  return new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

export const propertyMarkerIcon = createPropertyMarkerIcon()

// Argentina bounds for map restrictions
export const ARGENTINA_BOUNDS = {
  north: -21.781277,
  south: -55.061314,
  east: -53.591835,
  west: -73.560562,
}

// Reconquista, Santa Fe coordinates
export const RECONQUISTA_CENTER: [number, number] = [-29.15, -59.65]

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