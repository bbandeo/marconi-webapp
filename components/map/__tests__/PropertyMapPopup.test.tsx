/**
 * Tests de integración para PropertyMapPopup
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropertyMapPopup from '../PropertyMapPopup'
import type { MapPropertyData } from '@/types/map'

// Mock de next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={src || '/placeholder.jpg'} alt={alt} {...props} />
  },
}))

// Mock de next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}))

const mockProperty: MapPropertyData = {
  id: 1,
  title: 'Casa en Reconquista',
  price: 150000,
  currency: 'USD',
  latitude: -29.15,
  longitude: -59.65,
  property_type: 'house',
  operation_type: 'sale',
  images: ['https://example.com/image1.jpg'],
  status: 'available',
}

describe('PropertyMapPopup', () => {
  it('debe renderizar información básica de la propiedad', () => {
    render(<PropertyMapPopup property={mockProperty} />)

    expect(screen.getByText('Casa en Reconquista')).toBeInTheDocument()
    expect(screen.getByText(/150\.?000/)).toBeInTheDocument()
  })

  it('debe mostrar tipo de operación traducido', () => {
    render(<PropertyMapPopup property={mockProperty} />)

    expect(screen.getByText('Venta')).toBeInTheDocument()
  })

  it('debe mostrar tipo de propiedad traducido', () => {
    render(<PropertyMapPopup property={mockProperty} />)

    expect(screen.getByText('Casa')).toBeInTheDocument()
  })

  it('debe formatear precio en USD correctamente', () => {
    render(<PropertyMapPopup property={mockProperty} />)

    const priceElement = screen.getByText(/150\.?000/)
    expect(priceElement).toBeInTheDocument()
  })

  it('debe formatear precio en ARS correctamente', () => {
    const propertyARS = { ...mockProperty, currency: 'ARS', price: 50000000 }
    render(<PropertyMapPopup property={propertyARS} />)

    expect(screen.getByText(/50\.?000\.?000/)).toBeInTheDocument()
  })

  it('debe mostrar imagen de la propiedad', () => {
    render(<PropertyMapPopup property={mockProperty} />)

    const image = screen.getByRole('img', { name: 'Casa en Reconquista' })
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('cloudinary'))
  })

  it('debe usar placeholder cuando no hay imágenes', () => {
    const propertyNoImages = { ...mockProperty, images: [] }
    render(<PropertyMapPopup property={propertyNoImages} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder'))
  })

  it('debe tener enlace a detalles de propiedad', () => {
    render(<PropertyMapPopup property={mockProperty} />)

    const link = screen.getByRole('link', { name: /ver detalles/i })
    expect(link).toHaveAttribute('href', '/propiedades/1')
  })

  it('debe llamar onViewDetails al hacer click en Ver Detalles', async () => {
    const user = userEvent.setup()
    const onViewDetails = jest.fn()

    render(<PropertyMapPopup property={mockProperty} onViewDetails={onViewDetails} />)

    const button = screen.getByRole('link', { name: /ver detalles/i })
    await user.click(button)

    expect(onViewDetails).toHaveBeenCalledWith(1)
  })

  it('debe funcionar sin onViewDetails callback', () => {
    expect(() => {
      render(<PropertyMapPopup property={mockProperty} />)
    }).not.toThrow()
  })

  it('debe manejar operación tipo rent', () => {
    const rentProperty = { ...mockProperty, operation_type: 'rent' }
    render(<PropertyMapPopup property={rentProperty} />)

    expect(screen.getByText('Alquiler')).toBeInTheDocument()
  })

  it('debe manejar tipo apartment', () => {
    const apartmentProperty = { ...mockProperty, property_type: 'apartment' }
    render(<PropertyMapPopup property={apartmentProperty} />)

    expect(screen.getByText('Departamento')).toBeInTheDocument()
  })

  it('debe tener estilos de diseño correctos', () => {
    const { container } = render(<PropertyMapPopup property={mockProperty} />)

    const popupDiv = container.firstChild as HTMLElement
    expect(popupDiv).toHaveClass('bg-night-blue/95')
    expect(popupDiv).toHaveClass('backdrop-blur-sm')
    expect(popupDiv).toHaveClass('rounded-lg')
  })

  it('debe mostrar badge de operación con estilos correctos', () => {
    render(<PropertyMapPopup property={mockProperty} />)

    const badge = screen.getByText('Venta')
    expect(badge).toHaveClass('bg-vibrant-orange')
    expect(badge).toHaveClass('text-bone-white')
  })

  it('debe truncar título largo', () => {
    const longTitleProperty = {
      ...mockProperty,
      title: 'Casa muy grande con muchas habitaciones y un jardín enorme en Reconquista Centro',
    }
    const { container } = render(<PropertyMapPopup property={longTitleProperty} />)

    const titleElement = container.querySelector('h3')
    expect(titleElement).toHaveClass('line-clamp-2')
  })

  it('debe tener width responsive', () => {
    const { container } = render(<PropertyMapPopup property={mockProperty} />)

    const popupDiv = container.firstChild as HTMLElement
    expect(popupDiv).toHaveClass('w-[320px]')
    expect(popupDiv).toHaveClass('sm:w-[360px]')
  })
})

describe('PropertyMapPopup - Traducciones', () => {
  const translationTests = [
    { type: 'house', expected: 'Casa' },
    { type: 'apartment', expected: 'Departamento' },
    { type: 'land', expected: 'Terreno' },
    { type: 'commercial', expected: 'Comercial' },
  ]

  translationTests.forEach(({ type, expected }) => {
    it(`debe traducir ${type} correctamente`, () => {
      const property = { ...mockProperty, property_type: type }
      render(<PropertyMapPopup property={property} />)

      expect(screen.getByText(expected)).toBeInTheDocument()
    })
  })

  const operationTests = [
    { operation: 'sale', expected: 'Venta' },
    { operation: 'rent', expected: 'Alquiler' },
  ]

  operationTests.forEach(({ operation, expected }) => {
    it(`debe traducir operación ${operation} correctamente`, () => {
      const property = { ...mockProperty, operation_type: operation }
      render(<PropertyMapPopup property={property} />)

      expect(screen.getByText(expected)).toBeInTheDocument()
    })
  })
})
