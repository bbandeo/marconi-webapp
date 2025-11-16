# Design Document: Property Grid Carousel

## Overview

Este documento detalla el diseño técnico para transformar la página de propiedades de un diseño vertical de lista a un diseño de mosaico en grid con carruseles de imágenes individuales para cada propiedad. La solución utiliza tecnologías existentes del proyecto (Embla Carousel, Next.js 15, Tailwind CSS, Framer Motion) y se integra perfectamente con el sistema actual.

### Objetivos del Diseño

1. **Grid Responsive**: Layout de 4 columnas en desktop, 2 en tablet, 1 en móvil
2. **Carrusel por Propiedad**: Navegación fluida entre múltiples imágenes sin salir del grid
3. **Rendimiento Optimizado**: Lazy loading, precarga inteligente, y optimización de imágenes
4. **Accesibilidad**: Navegación por teclado, ARIA labels, y soporte para screen readers
5. **Integración Seamless**: Mantener estilos, componentes y patrones existentes

## Architecture

### Component Structure

```
app/propiedades/page.tsx (existente - modificar)
├── Mantener: Filtros, paginación, fetch de datos
└── Modificar: Renderizado de lista a grid

components/PropertyCard.tsx (modificar completamente)
├── Estructura: De horizontal a vertical con carrusel
└── Nuevo: PropertyImageCarousel (componente interno)

components/PropertyImageCarousel.tsx (nuevo componente)
├── Embla Carousel para navegación de imágenes
├── Controles de navegación (prev/next)
├── Indicadores de posición (dots)
└── Gestos touch/swipe
```

### Technology Stack

- **Carousel**: Embla Carousel React (ya instalado en el proyecto)
- **Imágenes**: Next.js Image con optimización automática
- **Animaciones**: Framer Motion (existente)
- **Estilos**: Tailwind CSS con clases premium existentes
- **Gestión de Estado**: useState/useCallback para el carrusel

## Components and Interfaces

### 1. PropertyCard Component (Refactor Completo)

**Ubicación**: `components/PropertyCard.tsx`

**Responsabilidades**:
- Renderizar tarjeta de propiedad en formato vertical
- Integrar el carrusel de imágenes en la parte superior
- Mostrar información esencial (precio, ubicación, características)
- Manejar interacciones (click en tarjeta vs. click en controles del carrusel)

**Estructura del Componente**:

```typescript
interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="group overflow-hidden ...">
      {/* Carrusel de imágenes - Ocupa ~60% altura de tarjeta */}
      <PropertyImageCarousel
        images={property.images}
        propertyTitle={property.title}
        propertyId={property.id}
      />

      {/* Contenido de la propiedad - ~40% */}
      <CardContent>
        {/* Badges: Venta/Alquiler, Featured */}
        {/* Título y ubicación */}
        {/* Precio destacado */}
        {/* Características (bedrooms, bathrooms, m²) */}
        {/* Features badges (primeras 3) */}
        {/* CTA: Ver detalles */}
      </CardContent>
    </Card>
  )
}
```

**Layout Interno**:

```
┌─────────────────────────────┐
│   PropertyImageCarousel     │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │      Imagen           │  │
│  │    (aspect 4:3)       │  │
│  │                       │  │
│  └───────────────────────┘  │
│  [Badge] [Featured]  [♡ ✉] │ <- Overlays
│  [← →] Controles [●●○]      │ <- Navegación
├─────────────────────────────┤
│  VENTA | $120,000          │
│  Casa en Barrio Centro      │
│  📍 Centro, Reconquista     │
│                             │
│  🏠 3 dorm  🛁 2 baños  □ 120m² │
│                             │
│  [Garage] [Patio] [+2]     │
│                             │
│  [Ver detalles completos →] │
└─────────────────────────────┘
```

**Consideraciones de Interacción**:
- Click en imagen/tarjeta → Navegar a detalle de propiedad
- Click en controles del carrusel → **Prevenir navegación**, solo cambiar imagen
- Uso de `stopPropagation()` en controles del carrusel
- Hover en tarjeta → Mostrar controles del carrusel (desktop)

### 2. PropertyImageCarousel Component (Nuevo)

**Ubicación**: `components/PropertyImageCarousel.tsx`

**Responsabilidades**:
- Gestionar el estado del carrusel con Embla
- Renderizar imágenes con Next.js Image
- Mostrar controles de navegación y indicadores
- Manejar gestos touch/swipe y navegación por teclado
- Precargar imagen siguiente para transiciones suaves

**Props Interface**:

```typescript
interface PropertyImageCarouselProps {
  images: string[]
  propertyTitle: string
  propertyId: number
  onImageClick?: () => void // Opcional: callback para navegación
}
```

**Implementación con Embla Carousel**:

```typescript
'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PropertyImageCarousel({
  images,
  propertyTitle,
  propertyId,
  onImageClick
}: PropertyImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false, // No circular inicialmente
    skipSnaps: false,
    duration: 20 // Transición rápida
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  // Callbacks para navegación
  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation() // Prevenir navegación a detalle
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    emblaApi?.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    emblaApi?.scrollTo(index)
  }, [emblaApi])

  // Sincronizar estado con Embla
  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }

    emblaApi.on('select', onSelect)
    onSelect() // Estado inicial

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  // Si solo hay una imagen, mostrar sin carrusel
  if (images.length === 0) {
    return <PlaceholderImage />
  }

  if (images.length === 1) {
    return <SingleImage image={images[0]} title={propertyTitle} />
  }

  return (
    <div className="relative group/carousel">
      {/* Embla Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={image}
                  alt={`${propertyTitle} - Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={index === 0} // Primera imagen con prioridad
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de navegación - Visible al hover */}
      {canScrollPrev && (
        <Button
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
          size="sm"
          variant="ghost"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}

      {canScrollNext && (
        <Button
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
          size="sm"
          variant="ghost"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}

      {/* Indicadores (dots) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => scrollTo(index, e)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === selectedIndex
                ? 'bg-vibrant-orange w-6'
                : 'bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
```

**Opciones de Configuración de Embla**:

```typescript
const emblaOptions = {
  loop: false,        // No circular: más predecible para el usuario
  skipSnaps: false,   // Siempre hacer snap a una imagen
  duration: 20,       // Transición rápida (ms)
  dragFree: false,    // Snap obligatorio
  containScroll: 'trimSnaps' // Ajustar snaps al final
}
```

### 3. PropiedadesPage Grid Layout (Modificación)

**Ubicación**: `app/propiedades/page.tsx`

**Cambios Necesarios**:

Reemplazar la sección de renderizado actual (líneas 479-485):

```typescript
{/* ANTES - Lista vertical */}
<div className="space-y-8 mb-premium-xl">
  {currentProperties.map((property) => (
    <PropertyCard key={property.id} property={property} />
  ))}
</div>

{/* DESPUÉS - Grid responsive */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-premium-xl">
  {currentProperties.map((property) => (
    <PropertyCard key={property.id} property={property} />
  ))}
</div>
```

**Breakpoints del Grid**:
- **Mobile** (`< 768px`): 1 columna
- **Tablet** (`768px - 1023px`): 2 columnas
- **Desktop** (`≥ 1024px`): 4 columnas

**Espaciado**:
- Gap horizontal y vertical: `gap-6` (1.5rem / 24px)
- Margen inferior: `mb-premium-xl`

## Data Models

### Property Interface (Existente - Sin cambios)

```typescript
interface Property extends PropertyType {
  id: number
  title: string
  images: string[] // Array de URLs de Cloudinary
  price: number
  currency: string
  operation: "sale" | "rent"
  type: "house" | "apartment" | "commercial" | "terreno" | "local"
  bedrooms: number | null
  bathrooms: number | null
  area_m2: number | null
  neighborhood: string | null
  address: string | null
  features: string[]
  featured: boolean
  views: number
  // ... otros campos
}
```

### Carousel State Management

```typescript
interface CarouselState {
  selectedIndex: number      // Índice actual
  canScrollPrev: boolean     // Puede ir atrás
  canScrollNext: boolean     // Puede ir adelante
  scrollSnaps: number[]      // Posiciones de snap
}
```

## Error Handling

### 1. Imágenes Faltantes o Rotas

**Escenario**: Propiedad sin imágenes o URLs rotas

**Solución**:

```typescript
// En PropertyImageCarousel
if (!images || images.length === 0) {
  return (
    <div className="relative aspect-[4/3] bg-night-blue/80 flex items-center justify-center">
      <div className="text-center">
        <Home className="w-12 h-12 mx-auto mb-2 text-support-gray/40" />
        <p className="text-sm text-support-gray">Sin imágenes disponibles</p>
      </div>
    </div>
  )
}
```

**Manejo de Error en Carga**:

```typescript
<Image
  src={image}
  alt={`${propertyTitle} - Imagen ${index + 1}`}
  fill
  onError={(e) => {
    const target = e.target as HTMLImageElement
    target.src = "/placeholder.svg" // Fallback
  }}
/>
```

### 2. Fallo de Inicialización de Embla

**Escenario**: `emblaApi` no se inicializa correctamente

**Solución**:

```typescript
useEffect(() => {
  if (!emblaApi) {
    console.warn('Embla API no inicializada para propiedad:', propertyId)
    return
  }
  // ... resto del código
}, [emblaApi, propertyId])
```

### 3. Eventos de Click Conflictivos

**Problema**: Click en controles del carrusel navega a la página de detalle

**Solución**: Uso consistente de `stopPropagation()`

```typescript
const handleControlClick = (e: React.MouseEvent, action: () => void) => {
  e.stopPropagation()  // Prevenir navegación
  e.preventDefault()   // Por seguridad
  action()             // Ejecutar acción del carrusel
}
```

## Testing Strategy

### 1. Unit Tests

**Componente PropertyImageCarousel**:

```typescript
describe('PropertyImageCarousel', () => {
  it('should render single image without carousel controls', () => {
    const { queryByRole } = render(
      <PropertyImageCarousel
        images={['image1.jpg']}
        propertyTitle="Test"
        propertyId={1}
      />
    )
    expect(queryByRole('button', { name: /anterior/i })).not.toBeInTheDocument()
  })

  it('should render carousel with multiple images', () => {
    const images = ['img1.jpg', 'img2.jpg', 'img3.jpg']
    const { getByRole } = render(
      <PropertyImageCarousel
        images={images}
        propertyTitle="Test"
        propertyId={1}
      />
    )
    expect(getByRole('button', { name: /siguiente/i })).toBeInTheDocument()
  })

  it('should navigate to next image on button click', async () => {
    const images = ['img1.jpg', 'img2.jpg']
    const { getByRole } = render(
      <PropertyImageCarousel
        images={images}
        propertyTitle="Test"
        propertyId={1}
      />
    )

    const nextButton = getByRole('button', { name: /siguiente/i })
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(getByRole('button', { name: /ir a imagen 2/i })).toHaveClass('bg-vibrant-orange')
    })
  })

  it('should prevent navigation on control click', () => {
    const mockOnClick = jest.fn()
    const { getByRole } = render(
      <div onClick={mockOnClick}>
        <PropertyImageCarousel
          images={['img1.jpg', 'img2.jpg']}
          propertyTitle="Test"
          propertyId={1}
        />
      </div>
    )

    const nextButton = getByRole('button', { name: /siguiente/i })
    fireEvent.click(nextButton)

    expect(mockOnClick).not.toHaveBeenCalled()
  })
})
```

**Componente PropertyCard**:

```typescript
describe('PropertyCard Grid Layout', () => {
  it('should render in vertical card format', () => {
    const property = createMockProperty()
    const { container } = render(<PropertyCard property={property} />)

    const card = container.querySelector('.group')
    expect(card).toHaveClass('overflow-hidden')
  })

  it('should display property information below carousel', () => {
    const property = createMockProperty({ title: 'Casa Test', price: 120000 })
    const { getByText } = render(<PropertyCard property={property} />)

    expect(getByText('Casa Test')).toBeInTheDocument()
    expect(getByText('$120,000')).toBeInTheDocument()
  })
})
```

### 2. Integration Tests

**Grid Layout y Responsive**:

```typescript
describe('PropiedadesPage Grid Layout', () => {
  it('should render 4 columns on desktop', () => {
    global.innerWidth = 1280
    const { container } = render(<PropiedadesPage />)

    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('lg:grid-cols-4')
  })

  it('should render 2 columns on tablet', () => {
    global.innerWidth = 768
    const { container } = render(<PropiedadesPage />)

    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('md:grid-cols-2')
  })

  it('should render 1 column on mobile', () => {
    global.innerWidth = 375
    const { container } = render(<PropiedadesPage />)

    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-1')
  })
})
```

### 3. Accessibility Tests

```typescript
describe('Accessibility', () => {
  it('should have proper ARIA labels on carousel controls', () => {
    const { getByLabelText } = render(
      <PropertyImageCarousel
        images={['img1.jpg', 'img2.jpg']}
        propertyTitle="Test"
        propertyId={1}
      />
    )

    expect(getByLabelText('Ir a imagen 1')).toBeInTheDocument()
    expect(getByLabelText('Ir a imagen 2')).toBeInTheDocument()
  })

  it('should support keyboard navigation', () => {
    const { getByRole } = render(
      <PropertyImageCarousel
        images={['img1.jpg', 'img2.jpg']}
        propertyTitle="Test"
        propertyId={1}
      />
    )

    const nextButton = getByRole('button', { name: /siguiente/i })
    nextButton.focus()
    expect(nextButton).toHaveFocus()
  })
})
```

### 4. Performance Tests

**Lazy Loading Verification**:

```typescript
describe('Image Performance', () => {
  it('should lazy load images beyond the first', () => {
    const images = ['img1.jpg', 'img2.jpg', 'img3.jpg']
    const { container } = render(
      <PropertyImageCarousel
        images={images}
        propertyTitle="Test"
        propertyId={1}
      />
    )

    const imgs = container.querySelectorAll('img')
    expect(imgs[0]).toHaveAttribute('loading', 'eager')
    expect(imgs[1]).toHaveAttribute('loading', 'lazy')
  })
})
```

### 5. Visual Regression Tests

Usar herramientas como Percy o Chromatic para:
- Capturar screenshots del grid en diferentes tamaños de pantalla
- Verificar estados del carrusel (primera imagen, última imagen, hover)
- Validar temas claro/oscuro

## Performance Optimizations

### 1. Image Optimization

**Next.js Image Component Configuration**:

```typescript
<Image
  src={image}
  alt={`${propertyTitle} - Imagen ${index + 1}`}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
  priority={index === 0}  // Solo primera imagen
  loading={index === 0 ? 'eager' : 'lazy'}
  quality={85}  // Balance calidad/tamaño
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."  // Placeholder pequeño
/>
```

**Sizes Attribute Explanation**:
- Mobile: 100vw (imagen ocupa todo el ancho)
- Tablet: 50vw (2 columnas = 50% cada una)
- Desktop: 25vw (4 columnas = 25% cada una)

Esto permite a Next.js generar y servir el tamaño óptimo de imagen para cada dispositivo.

### 2. Lazy Loading Strategy

**Paginación + Lazy Loading**:

```typescript
// En PropiedadesPage
const ITEMS_PER_PAGE = 12  // 3 filas × 4 columnas

// Primera página se carga eager, resto lazy
const currentProperties = filteredProperties.slice(startIndex, endIndex)
```

Con 12 propiedades por página y 4 columnas:
- Primera fila (4 propiedades): Visible inmediatamente
- Segunda fila (4 propiedades): Lazy loading activado al scroll
- Tercera fila (4 propiedades): Lazy loading activado al scroll

### 3. Preload Strategy

**Precargar Imagen Siguiente en Carrusel**:

```typescript
useEffect(() => {
  if (!emblaApi) return

  const preloadNext = () => {
    const nextIndex = emblaApi.selectedScrollSnap() + 1
    if (nextIndex < images.length) {
      const img = new window.Image()
      img.src = images[nextIndex]
    }
  }

  emblaApi.on('select', preloadNext)
  return () => emblaApi.off('select', preloadNext)
}, [emblaApi, images])
```

### 4. Cloudinary Optimization

Las URLs de Cloudinary ya están optimizadas vía `getOptimizedImageUrl()` (existente en el proyecto):

```typescript
// lib/cloudinary.ts (existente)
export function getOptimizedImageUrl(url: string, width?: number) {
  // Aplicar transformaciones: f_auto, q_auto, w_<width>
  return transformedUrl
}
```

Aplicar en PropertyImageCarousel:

```typescript
const optimizedImageUrl = getOptimizedImageUrl(image, 800) // Max 800px ancho
```

### 5. Component Memoization

**Memoizar PropertyCard si no cambia**:

```typescript
export const PropertyCard = React.memo(({ property }: PropertyCardProps) => {
  // ... componente
}, (prevProps, nextProps) => {
  return prevProps.property.id === nextProps.property.id &&
         prevProps.property.updated_at === nextProps.property.updated_at
})
```

### 6. Virtualization (Opcional - Fase 2)

Si el número de propiedades crece significativamente (>100), considerar virtualización con `react-window` o `@tanstack/react-virtual`:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

// En PropiedadesPage
const parentRef = useRef<HTMLDivElement>(null)

const rowVirtualizer = useVirtualizer({
  count: Math.ceil(filteredProperties.length / 4),
  getScrollElement: () => parentRef.current,
  estimateSize: () => 400, // Altura estimada de fila
})
```

## Accessibility Considerations

### 1. Keyboard Navigation

**Controles del Carrusel**:
- `Tab`: Navegar entre controles (prev, next, dots)
- `Enter/Space`: Activar control enfocado
- `Arrow Left`: Imagen anterior
- `Arrow Right`: Imagen siguiente

**Implementación**:

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    emblaApi?.scrollPrev()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    emblaApi?.scrollNext()
  }
}

<div
  className="embla"
  onKeyDown={handleKeyDown}
  role="region"
  aria-label={`Galería de imágenes de ${propertyTitle}`}
>
```

### 2. ARIA Labels

**Carousel Container**:
```typescript
<div
  role="region"
  aria-label={`Galería de imágenes de ${propertyTitle}`}
  aria-live="polite"
>
```

**Navigation Buttons**:
```typescript
<Button
  onClick={scrollPrev}
  aria-label="Ver imagen anterior"
  disabled={!canScrollPrev}
>
  <ChevronLeft aria-hidden="true" />
</Button>

<Button
  onClick={scrollNext}
  aria-label="Ver imagen siguiente"
  disabled={!canScrollNext}
>
  <ChevronRight aria-hidden="true" />
</Button>
```

**Dot Indicators**:
```typescript
<button
  onClick={(e) => scrollTo(index, e)}
  aria-label={`Ir a imagen ${index + 1} de ${images.length}`}
  aria-current={index === selectedIndex ? 'true' : 'false'}
>
```

**Images**:
```typescript
<Image
  src={image}
  alt={`${propertyTitle} - Vista ${index + 1}: ${getImageDescription(image)}`}
  // ... otras props
/>
```

### 3. Screen Reader Announcements

**Contador Visual Oculto**:

```typescript
<div className="sr-only" aria-live="polite" aria-atomic="true">
  Imagen {selectedIndex + 1} de {images.length}
</div>
```

### 4. Focus Management

**Mantener Focus Visible**:

```typescript
// En CSS global o Tailwind config
.focus-visible:focus {
  outline: 2px solid theme('colors.vibrant-orange');
  outline-offset: 2px;
}
```

### 5. Reduced Motion Support

**Respetar prefers-reduced-motion**:

```typescript
// En embla config
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const emblaOptions = {
  duration: prefersReducedMotion ? 0 : 20,
  // ... otras opciones
}
```

**CSS para animaciones**:

```css
@media (prefers-reduced-motion: reduce) {
  .group-hover\\:scale-105 {
    transform: scale(1) !important;
  }

  .transition-all,
  .transition-opacity,
  .transition-transform {
    transition: none !important;
  }
}
```

## Design Tokens and Styling

### Tailwind Classes (Existentes en el Proyecto)

**Colores**:
- `bg-premium-main`: Fondo principal
- `bg-premium-card`: Fondo de tarjetas
- `text-premium-primary`: Texto principal
- `text-premium-secondary`: Texto secundario
- `text-vibrant-orange`: Color accent
- `border-support-gray/20`: Bordes sutiles

**Espaciado**:
- `gap-6`: Gap del grid (24px)
- `p-6`, `p-8`: Padding de tarjetas
- `space-y-4`: Espaciado vertical interno

**Efectos**:
- `backdrop-blur-md`: Blur en elementos overlay
- `shadow-lg`, `shadow-2xl`: Sombras
- `rounded-2xl`, `rounded-xl`: Bordes redondeados

### Component-Specific Styles

**PropertyCard Container**:

```typescript
className="group overflow-hidden bg-premium-card backdrop-blur-md border border-vibrant-orange/10 shadow-lg hover:shadow-2xl hover:shadow-vibrant-orange/20 transition-all duration-700 rounded-2xl"
```

**Carousel Controls (Hover State)**:

```typescript
className="opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 bg-black/70 hover:bg-vibrant-orange/80 text-bone-white backdrop-blur-md rounded-full"
```

**Dot Indicators**:

```typescript
// Inactive
className="w-2 h-2 rounded-full bg-white/60 hover:bg-white/80 transition-all"

// Active
className="w-2 h-2 rounded-full bg-vibrant-orange w-6 transition-all"
```

**Grid Container**:

```typescript
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-premium-xl"
```

### Framer Motion Animations (Opcional)

**Card Entrance Animation**:

```typescript
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
  <PropertyCard property={property} />
</motion.div>
```

**Stagger Grid Items**:

```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

<motion.div
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {properties.map((property) => (
    <motion.div key={property.id} variants={itemVariants}>
      <PropertyCard property={property} />
    </motion.div>
  ))}
</motion.div>
```

## Migration Strategy

### Phase 1: Component Refactor (Prioridad Alta)

1. **Crear PropertyImageCarousel Component**
   - Implementar carrusel básico con Embla
   - Agregar controles de navegación
   - Agregar indicadores de posición
   - Testing unitario

2. **Refactorizar PropertyCard**
   - Cambiar de layout horizontal a vertical
   - Integrar PropertyImageCarousel
   - Ajustar información mostrada
   - Implementar prevención de clicks

3. **Modificar PropiedadesPage Grid**
   - Cambiar contenedor de `space-y-8` a `grid`
   - Configurar breakpoints responsive
   - Verificar paginación

### Phase 2: Optimization (Prioridad Media)

4. **Image Optimization**
   - Implementar lazy loading inteligente
   - Configurar sizes correctos
   - Agregar preload de siguiente imagen
   - Integrar con Cloudinary optimizations

5. **Performance Testing**
   - Lighthouse audit
   - Core Web Vitals
   - Pruebas con múltiples propiedades

### Phase 3: Polish (Prioridad Baja)

6. **Accessibility Enhancements**
   - ARIA labels completos
   - Keyboard navigation
   - Screen reader testing
   - Reduced motion support

7. **Animation & Microinteractions**
   - Framer Motion animations
   - Hover effects refinement
   - Transiciones suaves

### Phase 4: Advanced Features (Opcional)

8. **Advanced Optimizations**
   - Virtualización si es necesario
   - Service Worker para cache
   - Progressive image loading

## Dependencies

### Existing Dependencies (Ya instaladas)

```json
{
  "embla-carousel-react": "^8.x",
  "next": "^15.x",
  "react": "^19.x",
  "framer-motion": "^11.x",
  "tailwindcss": "^3.x"
}
```

### Additional Dependencies (NO se requieren)

Todas las funcionalidades se pueden implementar con las dependencias existentes.

## Rollback Plan

En caso de problemas críticos:

1. **Revertir PropertyCard**:
   ```bash
   git checkout HEAD~1 components/PropertyCard.tsx
   ```

2. **Revertir Grid en PropiedadesPage**:
   ```bash
   git checkout HEAD~1 app/propiedades/page.tsx
   ```

3. **Eliminar PropertyImageCarousel**:
   ```bash
   rm components/PropertyImageCarousel.tsx
   ```

4. **Feature Flag** (Recomendado para producción):

```typescript
// En .env
NEXT_PUBLIC_ENABLE_GRID_CAROUSEL=false

// En PropiedadesPage
const useGridLayout = process.env.NEXT_PUBLIC_ENABLE_GRID_CAROUSEL === 'true'

{useGridLayout ? (
  <GridLayout properties={currentProperties} />
) : (
  <ListLayout properties={currentProperties} />
)}
```

## Monitoring and Metrics

### Performance Metrics

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Image Load Time**: < 1s para primera imagen

### User Engagement Metrics

- **Carousel Interactions**: Tracking de clicks en controles
- **Image Views**: Cuántas imágenes por propiedad se ven en promedio
- **Click-through Rate**: De grid a página de detalle

### Implementation con Analytics Existente

```typescript
// En PropertyImageCarousel
const { trackEvent } = useAnalytics()

const handleImageChange = (index: number) => {
  trackEvent('carousel_navigation', {
    property_id: propertyId,
    from_index: selectedIndex,
    to_index: index,
    total_images: images.length
  })
}
```

## Conclusion

Este diseño proporciona una solución completa y escalable para transformar la página de propiedades en un grid moderno con carruseles de imágenes. La implementación aprovecha tecnologías existentes (Embla Carousel, Next.js 15, Tailwind CSS) y mantiene la coherencia con el diseño premium de Marconi Inmobiliaria.

Los aspectos clave del diseño incluyen:

1. **Componentización clara**: Separación entre PropertyCard y PropertyImageCarousel
2. **Performance optimizado**: Lazy loading, precarga inteligente, y optimización de imágenes
3. **Accesibilidad completa**: ARIA labels, keyboard navigation, screen reader support
4. **Responsive design**: 4 columnas (desktop), 2 columnas (tablet), 1 columna (mobile)
5. **Integración seamless**: Uso de componentes y estilos existentes del proyecto

La estrategia de migración por fases permite implementación incremental con testing continuo, minimizando riesgos y facilitando rollback si es necesario.
