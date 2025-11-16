# Tests del Mapa Interactivo

## Descripción

Esta carpeta contiene los tests de integración para el sistema de mapa interactivo de propiedades.

## Estructura de Tests

```
__tests__/
├── services/
│   └── map.test.ts                    # Tests de MapService
├── hooks/
│   ├── usePropertyMap.test.tsx        # Tests de hook de datos del mapa
│   └── useMapResponsive.test.tsx      # Tests de hook responsive
├── components/map/
│   ├── MapStates.test.tsx             # Tests de estados del mapa
│   └── PropertyMapPopup.test.tsx      # Tests de popup de propiedad
└── app/api/properties/map-locations/
    └── route.test.ts                  # Tests del endpoint API
```

## Comandos de Testing

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

### Ejecutar tests con coverage
```bash
npm run test:coverage
```

### Ejecutar solo tests del mapa
```bash
npm run test:map
```

## Coverage Esperado

Los tests cubren:

- ✅ **MapService**: Validación de coordenadas, transformación de datos, cálculo de bounds
- ✅ **usePropertyMap**: Carga de datos, manejo de errores, timeout, estados vacíos
- ✅ **useMapResponsive**: Detección de tamaño de pantalla, configuración responsive
- ✅ **Componentes de Estado**: Loading, Error, Empty states
- ✅ **PropertyMapPopup**: Renderizado, traducciones, formateo de precios
- ✅ **API Endpoint**: Respuestas exitosas, manejo de errores, headers de cache

## Tecnologías de Testing

- **Jest**: Framework de testing
- **@testing-library/react**: Testing de componentes React
- **@testing-library/user-event**: Simulación de eventos de usuario
- **@testing-library/jest-dom**: Matchers adicionales para Jest

## Mocks Configurados

### Next.js
- `next/image` - Mock de componente Image
- `next/link` - Mock de componente Link
- `next/server` - Mock de NextResponse

### Navegador
- `window.matchMedia` - Para media queries
- `IntersectionObserver` - Para lazy loading
- `ResizeObserver` - Para resize detection

## Notas Importantes

1. Los tests de Leaflet requieren mocks especiales debido a que Leaflet depende del DOM
2. Los tests de coordenadas validan que estén dentro de Argentina
3. El endpoint API está mockeado para evitar llamadas reales a Supabase
4. Los tests de hooks usan `renderHook` de React Testing Library

## Agregar Nuevos Tests

Para agregar tests nuevos:

1. Crear archivo `*.test.ts` o `*.test.tsx` en la carpeta correspondiente
2. Importar las utilidades de testing necesarias
3. Configurar mocks si es necesario
4. Escribir describe/it/expect siguiendo el patrón existente

Ejemplo:

```typescript
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('debe renderizar correctamente', () => {
    render(<MyComponent />)
    expect(screen.getByText('Texto esperado')).toBeInTheDocument()
  })
})
```
