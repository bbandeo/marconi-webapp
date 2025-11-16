/**
 * Script para poblar coordenadas de propiedades existentes
 *
 * Este script:
 * 1. Obtiene todas las propiedades sin coordenadas
 * 2. Usa el servicio de geocoding para obtener lat/lng desde la dirección
 * 3. Actualiza las propiedades con las coordenadas
 */

import { createClient } from '@supabase/supabase-js'
console.log(`📁 Buscando variables de entorno en la carpeta: ${process.cwd()}`)
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY)
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

// Configuración de Supabase
const supabaseUrl = "https://uutffduomvmyuqmeqjbw.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1dGZmZHVvbXZteXVxbWVxamJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA0OTQwOSwiZXhwIjoyMDY2NjI1NDA5fQ.2cDZpzcKUud3qIFmSKUe9sCSO3rRkUmYMkMEHo8C2Ag"

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables55 de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Geocodifica una dirección usando Nominatim (OpenStreetMap)
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Agregar ", Argentina" si no está en la dirección
    const fullAddress = address.includes('Argentina') ? address : `${address}, Argentina`

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&countrycodes=AR&limit=1`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Marconi Inmobiliaria Geocoding Script',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat)
      const lng = parseFloat(data[0].lon)

      // Validar que las coordenadas estén en Argentina
      if (
        lat >= -55.061314 &&
        lat <= -21.781277 &&
        lng >= -73.560562 &&
        lng <= -53.591835
      ) {
        return { lat, lng }
      } else {
        console.warn(`⚠️  Coordenadas fuera de Argentina: ${address} -> [${lat}, ${lng}]`)
        return null
      }
    }

    return null
  } catch (error) {
    console.error(`Error geocodificando "${address}":`, error)
    return null
  }
}

/**
 * Procesa una propiedad individual
 */
async function processProperty(property: any): Promise<boolean> {
  // Construir dirección completa
  const addressParts = [
    property.address,
    property.neighborhood,
    property.city || 'Reconquista',
    'Santa Fe',
    'Argentina',
  ].filter(Boolean)

  const fullAddress = addressParts.join(', ')

  console.log(`\n📍 Procesando: ${property.title}`)
  console.log(`   Dirección: ${fullAddress}`)

  // Geocodificar
  const coords = await geocodeAddress(fullAddress)

  if (!coords) {
    console.log(`   ❌ No se pudieron obtener coordenadas`)
    return false
  }

  console.log(`   ✅ Coordenadas: [${coords.lat}, ${coords.lng}]`)

  // Actualizar en Supabase
  const { error } = await supabase
    .from('properties')
    .update({
      latitude: coords.lat,
      longitude: coords.lng,
    })
    .eq('id', property.id)

  if (error) {
    console.error(`   ❌ Error actualizando:`, error.message)
    return false
  }

  console.log(`   💾 Guardado exitosamente`)
  return true
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 Iniciando geocodificación de propiedades...\n')

  // Obtener propiedades sin coordenadas
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, title, address, neighborhood, city, latitude, longitude')
    .or('latitude.is.null,longitude.is.null')
    .eq('status', 'available')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('❌ Error obteniendo propiedades:', error)
    process.exit(1)
  }

  if (!properties || properties.length === 0) {
    console.log('✅ Todas las propiedades ya tienen coordenadas')
    process.exit(0)
  }

  console.log(`📊 Propiedades sin coordenadas: ${properties.length}\n`)
  console.log('─'.repeat(60))

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i]

    const success = await processProperty(property)

    if (success) {
      successCount++
    } else {
      failCount++
    }

    // Delay de 1 segundo entre requests para respetar rate limits de Nominatim
    if (i < properties.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  console.log('\n' + '─'.repeat(60))
  console.log('\n📊 Resumen:')
  console.log(`   ✅ Exitosas: ${successCount}`)
  console.log(`   ❌ Fallidas: ${failCount}`)
  console.log(`   📍 Total procesadas: ${properties.length}`)

  console.log('\n✨ Proceso completado')
}

// Ejecutar
main().catch((error) => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
