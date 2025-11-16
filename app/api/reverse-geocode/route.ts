import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache para evitar demasiadas peticiones
const reverseGeocodeCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas
const RATE_LIMIT_DELAY = 1000 // 1 segundo entre peticiones

let lastRequestTime = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!lat || !lng) {
      return NextResponse.json({
        error: 'Latitude and longitude parameters are required'
      }, { status: 400 })
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({
        error: 'Invalid latitude or longitude values'
      }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}`
    const cachedResult = reverseGeocodeCache.get(cacheKey)

    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedResult.data)
    }

    // Rate limiting - esperar si es necesario
    const now = Date.now()
    if (now - lastRequestTime < RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY))
    }
    lastRequestTime = now

    // Hacer la petición al servicio de geocodificación inversa
    const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&countrycodes=AR`

    const response = await fetch(reverseGeocodeUrl, {
      headers: {
        'User-Agent': 'Marconi-Inmobiliaria/1.0 (contact@marconi-inmobiliaria.com)'
      }
    })

    if (!response.ok) {
      throw new Error(`Reverse geocoding service returned ${response.status}`)
    }

    const data = await response.json()

    // Procesar la respuesta
    let result = null
    if (data && data.address) {
      const address = data.address

      result = {
        address: [
          address.house_number,
          address.road
        ].filter(Boolean).join(' ') || '',
        neighborhood: address.neighbourhood ||
                     address.suburb ||
                     address.quarter ||
                     address.city_district || '',
        city: address.city ||
              address.town ||
              address.village ||
              address.municipality ||
              'Reconquista',
        province: address.state ||
                 address.province ||
                 'Santa Fe',
        country: address.country || 'Argentina',
        display_name: data.display_name,
        formatted_address: `${[
          address.house_number,
          address.road,
          address.neighbourhood || address.suburb,
          address.city || address.town,
          address.state
        ].filter(Boolean).join(', ')}`
      }
    } else {
      // Fallback when no address found
      result = {
        address: '',
        neighborhood: '',
        city: 'Reconquista',
        province: 'Santa Fe',
        country: 'Argentina',
        display_name: 'Ubicación no encontrada',
        formatted_address: 'Dirección no disponible'
      }
    }

    // Guardar en cache
    reverseGeocodeCache.set(cacheKey, {
      data: result,
      timestamp: now
    })

    // Limpiar cache viejo ocasionalmente
    if (reverseGeocodeCache.size > 1000) {
      const cutoff = now - CACHE_DURATION
      for (const [key, value] of reverseGeocodeCache.entries()) {
        if (value.timestamp < cutoff) {
          reverseGeocodeCache.delete(key)
        }
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Reverse geocoding API error:', error)

    // Fallback en caso de error
    const fallbackResult = {
      address: '',
      neighborhood: '',
      city: 'Reconquista',
      province: 'Santa Fe',
      country: 'Argentina',
      display_name: 'Error al obtener dirección',
      formatted_address: 'Error al obtener dirección'
    }

    return NextResponse.json(fallbackResult)
  }
}