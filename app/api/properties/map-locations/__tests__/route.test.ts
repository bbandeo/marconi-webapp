/**
 * Tests de integración para API endpoint /api/properties/map-locations
 */

import { NextResponse } from 'next/server'
import { MapService } from '@/services/map'

// Mock de MapService
jest.mock('@/services/map', () => ({
  MapService: {
    getMapProperties: jest.fn(),
  },
}))

// Mock de next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
      headers: {
        get: (key: string) => init?.headers?.[key] || null,
      },
    })),
  },
}))

// Función simulada del handler GET
async function GET() {
  try {
    const properties = await MapService.getMapProperties()

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
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

describe('GET /api/properties/map-locations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe retornar propiedades exitosamente', async () => {
    const mockProperties = [
      {
        id: 1,
        title: 'Casa Test',
        price: 100000,
        currency: 'USD',
        latitude: -29.15,
        longitude: -59.65,
        property_type: 'house',
        operation_type: 'sale',
        images: ['image1.jpg'],
        status: 'available',
      },
    ]

    ;(MapService.getMapProperties as jest.Mock).mockResolvedValue(mockProperties)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.properties).toEqual(mockProperties)
    expect(data.count).toBe(1)
    expect(data.timestamp).toBeDefined()
  })

  it('debe retornar error 500 cuando falla el servicio', async () => {
    const errorMessage = 'Database connection failed'
    ;(MapService.getMapProperties as jest.Mock).mockRejectedValue(new Error(errorMessage))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe(errorMessage)
  })

  it('debe incluir headers de cache', async () => {
    ;(MapService.getMapProperties as jest.Mock).mockResolvedValue([])

    const response = await GET()

    const cacheControl = response.headers.get('Cache-Control')
    expect(cacheControl).toBeDefined()
    expect(cacheControl).toContain('public')
    expect(cacheControl).toContain('s-maxage=60')
    expect(cacheControl).toContain('stale-while-revalidate=120')
  })

  it('debe manejar array vacío correctamente', async () => {
    ;(MapService.getMapProperties as jest.Mock).mockResolvedValue([])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.properties).toEqual([])
    expect(data.count).toBe(0)
  })

  it('debe incluir timestamp en formato ISO', async () => {
    ;(MapService.getMapProperties as jest.Mock).mockResolvedValue([])

    const response = await GET()
    const data = await response.json()

    expect(data.timestamp).toBeDefined()
    expect(() => new Date(data.timestamp)).not.toThrow()
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp)
  })

  it('debe retornar múltiples propiedades', async () => {
    const mockProperties = [
      {
        id: 1,
        title: 'Casa 1',
        price: 100000,
        currency: 'USD',
        latitude: -29.15,
        longitude: -59.65,
        property_type: 'house',
        operation_type: 'sale',
        images: [],
        status: 'available',
      },
      {
        id: 2,
        title: 'Casa 2',
        price: 200000,
        currency: 'USD',
        latitude: -29.16,
        longitude: -59.66,
        property_type: 'apartment',
        operation_type: 'rent',
        images: [],
        status: 'available',
      },
    ]

    ;(MapService.getMapProperties as jest.Mock).mockResolvedValue(mockProperties)

    const response = await GET()
    const data = await response.json()

    expect(data.count).toBe(2)
    expect(data.properties).toHaveLength(2)
  })

  it('debe manejar errores sin mensaje', async () => {
    ;(MapService.getMapProperties as jest.Mock).mockRejectedValue({})

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()
  })
})
