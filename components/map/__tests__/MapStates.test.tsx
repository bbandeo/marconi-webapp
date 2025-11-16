/**
 * Tests de integración para componentes de estado del mapa
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapLoadingState from '../MapLoadingState'
import MapErrorState from '../MapErrorState'
import MapEmptyState from '../MapEmptyState'

describe('MapLoadingState', () => {
  it('debe renderizar correctamente', () => {
    render(<MapLoadingState height="600px" />)

    expect(screen.getByText('Cargando mapa de propiedades')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('debe aplicar altura personalizada', () => {
    const { container } = render(<MapLoadingState height="800px" />)
    const loadingDiv = container.firstChild as HTMLElement

    expect(loadingDiv).toHaveStyle({ height: '800px' })
  })

  it('debe manejar altura numérica', () => {
    const { container } = render(<MapLoadingState height={500} />)
    const loadingDiv = container.firstChild as HTMLElement

    expect(loadingDiv).toHaveStyle({ height: '500px' })
  })

  it('debe mostrar iconos de carga', () => {
    const { container } = render(<MapLoadingState />)

    // Verificar que existen elementos con animaciones
    const animatedElements = container.querySelectorAll('.animate-pulse, .animate-spin')
    expect(animatedElements.length).toBeGreaterThan(0)
  })
})

describe('MapErrorState', () => {
  it('debe renderizar correctamente', () => {
    const mockRetry = jest.fn()
    render(<MapErrorState height="600px" message="Error de prueba" onRetry={mockRetry} />)

    expect(screen.getByText('No se pudo cargar el mapa')).toBeInTheDocument()
    expect(screen.getByText('Error de prueba')).toBeInTheDocument()
  })

  it('debe llamar onRetry al hacer click en reintentar', async () => {
    const user = userEvent.setup()
    const mockRetry = jest.fn()

    render(<MapErrorState height="600px" message="Error de red" onRetry={mockRetry} />)

    const retryButton = screen.getByRole('button', { name: /reintentar/i })
    await user.click(retryButton)

    expect(mockRetry).toHaveBeenCalledTimes(1)
  })

  it('debe aplicar altura personalizada', () => {
    const { container } = render(
      <MapErrorState height="700px" message="Error" onRetry={() => {}} />
    )
    const errorDiv = container.firstChild as HTMLElement

    expect(errorDiv).toHaveStyle({ height: '700px' })
  })

  it('debe mostrar mensaje personalizado', () => {
    const customMessage = 'No se pudo conectar con el servidor'
    render(<MapErrorState height="600px" message={customMessage} onRetry={() => {}} />)

    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  it('debe tener estilos de diseño correctos', () => {
    const { container } = render(
      <MapErrorState height="600px" message="Error" onRetry={() => {}} />
    )

    const errorDiv = container.firstChild as HTMLElement
    expect(errorDiv).toHaveClass('bg-night-blue')
    expect(errorDiv).toHaveClass('rounded-xl')
  })
})

describe('MapEmptyState', () => {
  it('debe renderizar correctamente', () => {
    render(<MapEmptyState height="600px" />)

    expect(screen.getByText('Sin propiedades disponibles')).toBeInTheDocument()
    expect(
      screen.getByText('No hay propiedades disponibles en este momento')
    ).toBeInTheDocument()
  })

  it('debe aplicar altura personalizada', () => {
    const { container } = render(<MapEmptyState height="550px" />)
    const emptyDiv = container.firstChild as HTMLElement

    expect(emptyDiv).toHaveStyle({ height: '550px' })
  })

  it('debe manejar altura numérica', () => {
    const { container } = render(<MapEmptyState height={650} />)
    const emptyDiv = container.firstChild as HTMLElement

    expect(emptyDiv).toHaveStyle({ height: '650px' })
  })

  it('debe tener estilos de diseño correctos', () => {
    const { container } = render(<MapEmptyState height="600px" />)

    const emptyDiv = container.firstChild as HTMLElement
    expect(emptyDiv).toHaveClass('bg-night-blue')
    expect(emptyDiv).toHaveClass('rounded-xl')
  })

  it('debe mostrar icono de mapa', () => {
    const { container } = render(<MapEmptyState height="600px" />)

    // Verificar que existe el icono (buscar por clase o SVG)
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })
})

describe('Estados del mapa - Accesibilidad', () => {
  it('MapLoadingState debe tener atributos ARIA correctos', () => {
    render(<MapLoadingState />)

    const loadingElement = screen.getByRole('status')
    expect(loadingElement).toHaveAttribute('aria-live', 'polite')
  })

  it('MapErrorState debe tener botón accesible', () => {
    render(<MapErrorState height="600px" message="Error" onRetry={() => {}} />)

    const button = screen.getByRole('button', { name: /reintentar/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
  })

  it('MapEmptyState debe tener estructura semántica', () => {
    const { container } = render(<MapEmptyState height="600px" />)

    const heading = screen.getByText('Sin propiedades disponibles')
    expect(heading.tagName).toBe('H3')
  })
})

describe('Estados del mapa - Responsive', () => {
  it('debe ajustar layout en diferentes tamaños', () => {
    const { rerender } = render(<MapLoadingState height="400px" />)
    expect(screen.getByText('Cargando mapa de propiedades')).toBeInTheDocument()

    rerender(<MapLoadingState height="800px" />)
    expect(screen.getByText('Cargando mapa de propiedades')).toBeInTheDocument()
  })
})
