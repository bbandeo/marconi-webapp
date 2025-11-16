/**
 * API Route: /api/properties/map-locations
 *
 * Endpoint optimizado para obtener ubicaciones de propiedades para el mapa.
 * Retorna solo los campos necesarios para visualización en el mapa.
 */

import { NextResponse } from 'next/server'
import { MapService } from '@/services/map'

/**
 * GET /api/properties/map-locations
 *
 * Obtiene todas las propiedades disponibles con coordenadas válidas
 * optimizadas para el mapa interactivo.
 *
 * Respuesta:
 * {
 *   success: boolean,
 *   properties: MapPropertyData[],
 *   count: number,
 *   timestamp: string
 * }
 *
 * Códigos de respuesta:
 * - 200: Éxito (puede retornar array vacío si no hay propiedades)
 * - 500: Error del servidor
 */
export async function GET() {
  try {
    // Obtener propiedades del servicio
    const properties = await MapService.getMapProperties()

    // Retornar respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        properties,
        count: properties.length,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (error) {
    // Log del error para debugging
    console.error('API /api/properties/map-locations error:', error)

    // Determinar mensaje de error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar propiedades'

    // Retornar error
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        properties: [],
        count: 0,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      }
    )
  }
}
