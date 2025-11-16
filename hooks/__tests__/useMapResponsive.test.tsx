/**
 * Tests de integración para useMapResponsive hook
 */

import { renderHook, act } from '@testing-library/react'
import { useMapResponsive } from '../useMapResponsive'

describe('useMapResponsive', () => {
  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  it('debe retornar configuración desktop por defecto', () => {
    const { result } = renderHook(() => useMapResponsive())

    expect(result.current).toBeDefined()
    expect(result.current.height).toBe('600px')
    expect(result.current.defaultZoom).toBe(13)
  })

  it('debe cambiar a configuración móvil', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    const { result } = renderHook(() => useMapResponsive())

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    // El hook debería actualizar con la configuración móvil
    expect(result.current.height).toBe('400px')
    expect(result.current.defaultZoom).toBe(12)
  })

  it('debe cambiar a configuración tablet', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const { result } = renderHook(() => useMapResponsive())

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.height).toBe('500px')
    expect(result.current.defaultZoom).toBe(13)
  })

  it('debe cambiar a configuración desktop', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280,
    })

    const { result } = renderHook(() => useMapResponsive())

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.height).toBe('600px')
    expect(result.current.defaultZoom).toBe(13)
  })

  it('debe hacer debounce de eventos resize', async () => {
    const { result } = renderHook(() => useMapResponsive())

    // Cambiar a móvil
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    // Disparar múltiples resize eventos
    act(() => {
      window.dispatchEvent(new Event('resize'))
      window.dispatchEvent(new Event('resize'))
      window.dispatchEvent(new Event('resize'))
    })

    // Esperar el debounce
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(result.current.height).toBe('400px')
  })

  it('debe limpiar listeners al desmontar', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useMapResponsive())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    removeEventListenerSpy.mockRestore()
  })

  it('debe manejar SSR correctamente', () => {
    // Simular SSR (window undefined)
    const originalWindow = global.window
    // @ts-ignore
    delete global.window

    const { result } = renderHook(() => useMapResponsive())

    // Debe retornar configuración por defecto sin errores
    expect(result.current).toBeDefined()
    expect(result.current.height).toBe('600px')

    // Restaurar window
    global.window = originalWindow
  })

  it('debe incluir todas las propiedades de configuración', () => {
    const { result } = renderHook(() => useMapResponsive())

    expect(result.current).toHaveProperty('minWidth')
    expect(result.current).toHaveProperty('height')
    expect(result.current).toHaveProperty('defaultZoom')
    expect(result.current).toHaveProperty('controlSize')
    expect(result.current).toHaveProperty('showAttribution')
  })
})
