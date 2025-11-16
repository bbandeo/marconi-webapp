import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache para evitar demasiadas peticiones
const geocodeCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas
const RATE_LIMIT_DELAY = 1000 // 1 segundo entre peticiones

let lastRequestTime = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address || address.trim() === '') {
      return NextResponse.json({ 
        error: 'Address parameter is required' 
      }, { status: 400 })
    }

    // Check cache first
    const cacheKey = address.toLowerCase().trim()
    const cachedResult = geocodeCache.get(cacheKey)
    
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedResult.data)
    }

    // Rate limiting - esperar si es necesario
    const now = Date.now()
    if (now - lastRequestTime < RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY))
    }
    lastRequestTime = now

    // Hacer la petición al servicio de geocodificación
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=AR&limit=1&addressdetails=1`
    
    const response = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'Marconi-Inmobiliaria/1.0 (contact@marconi-inmobiliaria.com)'
      }
    })

    if (!response.ok) {
      throw new Error(`Geocoding service returned ${response.status}`)
    }

    const data = await response.json()
    
    // Procesar la respuesta
    let result = null
    if (data && data.length > 0) {
      result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name
      }
    } else {
      // Fallback a coordenadas de Reconquista, Santa Fe
      result = {
        lat: -29.15,
        lng: -59.65,
        display_name: 'Reconquista, Santa Fe, Argentina (fallback)'
      }
    }

    // Guardar en cache
    geocodeCache.set(cacheKey, {
      data: result,
      timestamp: now
    })

    // Limpiar cache viejo ocasionalmente
    if (geocodeCache.size > 1000) {
      const cutoff = now - CACHE_DURATION
      for (const [key, value] of geocodeCache.entries()) {
        if (value.timestamp < cutoff) {
          geocodeCache.delete(key)
        }
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Geocoding API error:', error)
    
    // Fallback a coordenadas de Reconquista en caso de error
    const fallbackResult = {
      lat: -29.15,
      lng: -59.65,
      display_name: 'Reconquista, Santa Fe, Argentina (error fallback)'
    }

    return NextResponse.json(fallbackResult)
  }
}