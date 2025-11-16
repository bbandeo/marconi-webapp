/**
 * Tests de integración para usePropertyMap hook
 */

import { renderHook, waitFor } from '@testing-library/react'
import { usePropertyMap } from '../usePropertyMap'

// Mock del fetch global
global.fetch = jest.fn()

const mockPropertiesResponse = {
  success: true,
  properties: [
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
  ],
  count: 2,
  timestamp: new Date().toISOString(),
}

describe('usePropertyMap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('debe cargar propiedades exitosamente', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPropertiesResponse,
    })

    const { result } = renderHook(() => usePropertyMap())

    // Inicialmente debe estar cargando
    expect(result.current.loading).toBe(true)
    expect(result.current.properties).toEqual([])

    // Esperar a que termine la carga
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verificar datos cargados
    expect(result.current.properties).toHaveLength(2)
    expect(result.current.error).toBeNull()
    expect(result.current.isEmpty).toBe(false)
  })

  it('debe manejar errores de red', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => usePropertyMap())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).not.toBeNull()
    expect(result.current.error?.type).toBe('NETWORK_ERROR')
    expect(result.current.properties).toEqual([])
  })

  it('debe manejar respuestas de error del servidor', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    const { result } = renderHook(() => usePropertyMap())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).not.toBeNull()
    // El error será NETWORK_ERROR porque throw new Error() crea un MapError con tipo NETWORK_ERROR
    expect(result.current.error?.type).toBe('NETWORK_ERROR')
  })

  it('debe manejar abort signal correctamente', async () => {
    const abortError = new Error('AbortError')
    abortError.name = 'AbortError'

    ;(global.fetch as jest.Mock).mockRejectedValueOnce(abortError)

    const { result } = renderHook(() => usePropertyMap())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // AbortError se ignora, por lo que no debe haber error en el estado
    // Solo verifica que el loading finalizó
    expect(result.current.loading).toBe(false)
  })

  it('debe detectar estado vacío correctamente', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockPropertiesResponse, properties: [], count: 0 }),
    })

    const { result } = renderHook(() => usePropertyMap())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isEmpty).toBe(true)
    expect(result.current.properties).toEqual([])
  })

  it('debe calcular bounds automáticamente', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPropertiesResponse,
    })

    const { result } = renderHook(() => usePropertyMap())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.bounds).not.toBeNull()
    expect(Array.isArray(result.current.bounds)).toBe(true)
  })

  it('debe respetar maxProperties', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPropertiesResponse,
    })

    const { result } = renderHook(() => usePropertyMap({ maxProperties: 1 }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.properties).toHaveLength(1)
  })

  it('debe permitir refrescar datos', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPropertiesResponse,
    })

    const { result } = renderHook(() => usePropertyMap())

    // Primera carga
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.properties).toHaveLength(2)

    // Preparar segundo mock para el refresh
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockPropertiesResponse,
        properties: mockPropertiesResponse.properties.slice(0, 1),
        count: 1,
      }),
    })

    // Refrescar
    await result.current.refresh()

    await waitFor(() => {
      expect(result.current.properties).toHaveLength(1)
    })
  })

  it('debe limpiar AbortController al desmontar', async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort')

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPropertiesResponse,
    })

    const { unmount } = renderHook(() => usePropertyMap())

    unmount()

    expect(abortSpy).toHaveBeenCalled()
    abortSpy.mockRestore()
  })

  it('debe ejecutar callback onSuccess', async () => {
    const onSuccess = jest.fn()

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPropertiesResponse,
    })

    renderHook(() => usePropertyMap({ onSuccess }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockPropertiesResponse.properties)
    })
  })

  it('debe ejecutar callback onError', async () => {
    const onError = jest.fn()

    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Test error'))

    renderHook(() => usePropertyMap({ onError }))

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
    })
  })
})
