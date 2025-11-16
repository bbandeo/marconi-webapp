/**
 * Tests de integración para MapService
 */

import { MapService } from '../map'
import type { MapPropertyData } from '@/types/map'

// Mock de Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          not: jest.fn(() => ({
            not: jest.fn(() => ({
              data: mockProperties,
              error: null,
            })),
          })),
        })),
      })),
    })),
  },
}))

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
  {
    id: 2,
    title: 'Depto Test',
    price: 50000,
    currency: 'USD',
    latitude: -29.16,
    longitude: -59.66,
    property_type: 'apartment',
    operation_type: 'rent',
    images: ['image2.jpg'],
    status: 'available',
  },
]

describe('MapService', () => {
  describe('getMapProperties', () => {
    it('debe retornar propiedades disponibles con coordenadas válidas', async () => {
      const properties = await MapService.getMapProperties()

      expect(properties).toBeDefined()
      expect(Array.isArray(properties)).toBe(true)
      expect(properties.length).toBeGreaterThan(0)
    })

    it('debe transformar propiedades correctamente', async () => {
      const properties = await MapService.getMapProperties()
      const property = properties[0]

      expect(property).toHaveProperty('id')
      expect(property).toHaveProperty('title')
      expect(property).toHaveProperty('price')
      expect(property).toHaveProperty('currency')
      expect(property).toHaveProperty('latitude')
      expect(property).toHaveProperty('longitude')
      expect(property).toHaveProperty('property_type')
      expect(property).toHaveProperty('operation_type')
    })
  })

  describe('validateCoordinates', () => {
    it('debe validar coordenadas válidas dentro de Argentina', () => {
      expect(MapService.validateCoordinates(-29.15, -59.65)).toBe(true)
      expect(MapService.validateCoordinates(-34.6037, -58.3816)).toBe(true) // Buenos Aires
      expect(MapService.validateCoordinates(-31.4201, -64.1888)).toBe(true) // Córdoba
    })

    it('debe rechazar coordenadas inválidas', () => {
      expect(MapService.validateCoordinates(null, -59.65)).toBe(false)
      expect(MapService.validateCoordinates(-29.15, null)).toBe(false)
      expect(MapService.validateCoordinates(null, null)).toBe(false)
      expect(MapService.validateCoordinates(91, 0)).toBe(false) // Lat fuera de rango
      expect(MapService.validateCoordinates(0, 181)).toBe(false) // Lng fuera de rango
    })
  })

  describe('calculateBounds', () => {
    it('debe calcular bounds correctamente para múltiples propiedades', () => {
      const properties: MapPropertyData[] = [
        {
          id: 1,
          title: 'Test 1',
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
          title: 'Test 2',
          price: 50000,
          currency: 'USD',
          latitude: -29.20,
          longitude: -59.70,
          property_type: 'apartment',
          operation_type: 'rent',
          images: [],
          status: 'available',
        },
      ]

      const bounds = MapService.calculateBounds(properties)

      expect(bounds).not.toBeNull()
      expect(Array.isArray(bounds)).toBe(true)
      expect(bounds).toHaveLength(2)
    })

    it('debe retornar null para array vacío', () => {
      const bounds = MapService.calculateBounds([])
      expect(bounds).toBeNull()
    })

    it('debe retornar null para una sola propiedad', () => {
      const properties: MapPropertyData[] = [
        {
          id: 1,
          title: 'Test',
          price: 100000,
          currency: 'USD',
          latitude: -29.15,
          longitude: -59.65,
          property_type: 'house',
          operation_type: 'sale',
          images: [],
          status: 'available',
        },
      ]

      const bounds = MapService.calculateBounds(properties)
      expect(bounds).toBeNull()
    })
  })

  describe('transformPropertyForMap', () => {
    it('debe transformar propiedad correctamente', () => {
      const rawProperty = {
        id: 1,
        title: 'Casa Test',
        price: 100000,
        currency: 'USD',
        latitude: -29.15,
        longitude: -59.65,
        property_type: 'house',
        operation_type: 'sale',
        images: ['image1.jpg', 'image2.jpg'],
        status: 'available',
      }

      const transformed = MapService.transformPropertyForMap(rawProperty)

      expect(transformed.id).toBe(rawProperty.id)
      expect(transformed.title).toBe(rawProperty.title)
      expect(transformed.price).toBe(rawProperty.price)
      expect(transformed.latitude).toBe(rawProperty.latitude)
      expect(transformed.longitude).toBe(rawProperty.longitude)
    })

    it('debe manejar imágenes null', () => {
      const rawProperty = {
        id: 1,
        title: 'Casa Test',
        price: 100000,
        currency: 'USD',
        latitude: -29.15,
        longitude: -59.65,
        property_type: 'house',
        operation_type: 'sale',
        images: null,
        status: 'available',
      }

      const transformed = MapService.transformPropertyForMap(rawProperty)
      expect(transformed.images).toEqual([])
    })
  })
})
