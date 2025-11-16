# Implementation Plan: Property Grid Carousel

Este plan de implementación transforma los requisitos y el diseño en tareas de código ejecutables. Cada tarea está diseñada para ser implementada de forma incremental, construyendo sobre las tareas anteriores, y terminando con una integración completa del sistema.

## Notas Importantes

- Cada tarea referencia requisitos específicos del documento de requisitos
- Las tareas están ordenadas para permitir testing incremental
- Se prioriza funcionalidad core antes que optimizaciones avanzadas
- Todas las tareas son ejecutables por un agente de código

---

## Fase 1: Componente Base del Carrusel

### ☐ 1. Crear el componente PropertyImageCarousel con estructura básica

Crear el archivo `components/PropertyImageCarousel.tsx` con la estructura base del componente, incluyendo:
- Interface de props (images, propertyTitle, propertyId)
- Manejo de casos especiales (sin imágenes, una sola imagen)
- Componente placeholder para sin imágenes
- Componente para imagen única sin controles

**Archivos a crear:**
- `components/PropertyImageCarousel.tsx`

**Archivos a modificar:**
- Ninguno

_Requisitos: 3.1, 3.8, 2.5_

### ☐ 2. Integrar Embla Carousel en PropertyImageCarousel

Implementar la integración básica de Embla Carousel:
- Configurar `useEmblaCarousel` hook con opciones (loop: false, skipSnaps: false, duration: 20)
- Crear estructura HTML para embla viewport y container
- Mapear imágenes en slides con flex layout
- Configurar aspect ratio 4:3 para contenedores de imagen

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`

_Requisitos: 3.1, 3.2, 2.3_

### ☐ 3. Implementar controles de navegación del carrusel

Agregar botones de navegación anterior/siguiente:
- Crear callbacks `scrollPrev` y `scrollNext` con `useCallback`
- Implementar `stopPropagation` para prevenir navegación a página de detalle
- Agregar botones con iconos ChevronLeft/ChevronRight
- Aplicar estilos: posición absoluta, visible solo al hover, backdrop blur

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`

_Requisitos: 3.2, 3.6, 4.3_

### ☐ 4. Agregar indicadores de posición (dots) al carrusel

Implementar dots indicators para mostrar posición actual:
- Crear estado `selectedIndex` sincronizado con Embla
- Mapear images a dots con estados activo/inactivo
- Implementar click handler con `scrollTo` y `stopPropagation`
- Estilizar dots: activo (vibrant-orange, ancho expandido), inactivo (white/60)

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`

_Requisitos: 3.5, 3.7_

### ☐ 5. Sincronizar estado del carrusel con Embla API

Implementar lógica de sincronización de estado:
- Agregar estados `canScrollPrev` y `canScrollNext`
- Crear effect hook para escuchar evento 'select' de Embla
- Actualizar estados cuando cambia la selección
- Mostrar/ocultar controles según disponibilidad de scroll

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`

_Requisitos: 3.3, 3.4, 3.6_

### ☐ 6. Integrar Next.js Image en el carrusel con optimización básica

Reemplazar tags de imagen con componente Next.js Image:
- Configurar props: fill, className="object-cover"
- Agregar atributos alt descriptivos
- Configurar loading: 'eager' para primera imagen, 'lazy' para resto
- Configurar priority: true solo para primera imagen
- Agregar handler onError para fallback a placeholder

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`

_Requisitos: 2.3, 5.1, 5.2_

---

## Fase 2: Refactorización de PropertyCard

### ☐ 7. Refactorizar PropertyCard a layout vertical

Transformar PropertyCard de horizontal a vertical:
- Eliminar layout de grid cols (lg:grid-cols-5)
- Cambiar a estructura vertical: carrusel arriba, contenido abajo
- Mantener Card wrapper con clases premium existentes
- Preservar todos los datos mostrados (precio, ubicación, características)

**Archivos a modificar:**
- `components/PropertyCard.tsx`

_Requisitos: 1.1, 7.1, 7.2_

### ☐ 8. Integrar PropertyImageCarousel en PropertyCard

Reemplazar sección de imagen estática con PropertyImageCarousel:
- Importar PropertyImageCarousel component
- Pasar props: property.images, property.title, property.id
- Eliminar código de imagen individual y overlays de la sección de imagen
- Mantener estructura de overlays (badges, CTAs) dentro del carrusel

**Archivos a modificar:**
- `components/PropertyCard.tsx`
- Importar desde: `components/PropertyImageCarousel.tsx`

_Requisitos: 3.1, 7.4_

### ☐ 9. Reorganizar información de propiedad en PropertyCard vertical

Ajustar layout de contenido para formato vertical:
- Crear sección superior: Badge venta/alquiler + precio destacado
- Sección media: Título + ubicación con MapPin icon
- Sección características: Iconos de bedrooms, bathrooms, m² en fila horizontal
- Features badges: Mostrar primeras 3 + contador "+N" si hay más
- Botón CTA: "Ver detalles completos" con ancho completo

**Archivos a modificar:**
- `components/PropertyCard.tsx`

_Requisitos: 4.4, 7.1_

### ☐ 10. Implementar manejo de clicks para prevenir navegación conflictiva

Gestionar eventos de click para separar interacción de carrusel vs navegación:
- Mantener Link wrapper en PropertyCard para navegación general
- Verificar que controles del carrusel usen stopPropagation (ya implementado en tarea 3)
- Asegurar que click en área de contenido (no carrusel) navega correctamente
- Testing manual: click en dots/arrows no navega, click en título/info sí navega

**Archivos a modificar:**
- `components/PropertyCard.tsx`
- Verificar: `components/PropertyImageCarousel.tsx`

_Requisitos: 4.2, 4.3_

---

## Fase 3: Grid Layout en Página de Propiedades

### ☐ 11. Cambiar layout de lista a grid en PropiedadesPage

Modificar el renderizado de propiedades en `app/propiedades/page.tsx`:
- Localizar sección de renderizado (líneas ~479-485)
- Reemplazar `className="space-y-8 mb-premium-xl"` con `className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-premium-xl"`
- Mantener mapeo de currentProperties sin cambios
- Verificar que paginación sigue funcionando correctamente

**Archivos a modificar:**
- `app/propiedades/page.tsx` (específicamente líneas 479-485)

_Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5_

### ☐ 12. Ajustar paginación para grid layout

Verificar y ajustar lógica de paginación para grid:
- Cambiar `ITEMS_PER_PAGE` de 12 a 12 (3 filas × 4 cols = óptimo)
- Verificar que controles de paginación funcionan con grid
- Testear responsive: 1 col mobile, 2 cols tablet, 4 cols desktop
- Asegurar que contador "Mostrando X-Y de Z propiedades" es correcto

**Archivos a modificar:**
- `app/propiedades/page.tsx`

_Requisitos: 1.1, 5.5_

---

## Fase 4: Optimización de Imágenes

### ☐ 13. Configurar sizes attribute para responsive images

Optimizar Next.js Image con sizes correctos en PropertyImageCarousel:
- Agregar prop sizes: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
- Configurar quality: 85 para balance calidad/tamaño
- Agregar placeholder="blur" si es posible
- Documentar en comentario la lógica de breakpoints

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`

_Requisitos: 5.2, 2.2_

### ☐ 14. Implementar preload de siguiente imagen en carrusel

Agregar lógica para precargar la siguiente imagen:
- Crear useEffect que escucha evento 'select' de Embla
- En handler, calcular nextIndex = selectedIndex + 1
- Si nextIndex < images.length, crear new Image() y asignar src
- Cleanup: remover listener en cleanup del effect

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`

_Requisitos: 5.3_

### ☐ 15. Integrar Cloudinary optimization en URLs de imágenes

Aplicar optimización de Cloudinary a URLs:
- Importar `getOptimizedImageUrl` de `@/lib/cloudinary`
- Aplicar a cada URL de imagen antes de pasar a Image component
- Configurar width máximo: 800px para imágenes de grid
- Verificar que transformaciones f_auto, q_auto se aplican

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`
- Importar desde: `lib/cloudinary.ts`

_Requisitos: 5.2, 7.5_

---

## Fase 5: Accesibilidad

### ☐ 16. Agregar ARIA labels a controles del carrusel

Implementar etiquetas ARIA para accesibilidad:
- Botón prev: aria-label="Ver imagen anterior"
- Botón next: aria-label="Ver imagen siguiente"
- Dots: aria-label=`Ir a imagen ${index + 1} de ${images.length}`
- Dots activo: aria-current="true"
- Iconos: aria-hidden="true"

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`

_Requisitos: 6.1, 6.4_

### ☐ 17. Implementar navegación por teclado en carrusel

Agregar soporte para teclas Arrow Left/Right:
- Crear handler `handleKeyDown` en PropertyImageCarousel
- Detectar ArrowLeft → emblaApi.scrollPrev()
- Detectar ArrowRight → emblaApi.scrollNext()
- Llamar preventDefault para prevenir scroll de página
- Agregar onKeyDown al container principal

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`

_Requisitos: 6.2_

### ☐ 18. Agregar región ARIA y contador para screen readers

Implementar región accesible y anuncios:
- Agregar role="region" al container del carrusel
- aria-label=`Galería de imágenes de ${propertyTitle}`
- aria-live="polite" para anunciar cambios
- Agregar div con className="sr-only" mostrando "Imagen X de Y"
- Sincronizar contador con selectedIndex

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`

_Requisitos: 6.1, 6.3_

### ☐ 19. Implementar soporte para prefers-reduced-motion

Respetar configuración de movimiento reducido:
- Detectar matchMedia '(prefers-reduced-motion: reduce)' al inicio
- Si true, configurar Embla duration: 0 en lugar de 20
- Aplicar condicionalmente clases de transition
- Testear que animaciones se deshabilitan correctamente

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`

_Requisitos: 6.5_

---

## Fase 6: Estilos y UX Polish

### ☐ 20. Aplicar estilos premium a PropertyCard en formato grid

Refinar estilos de tarjeta para grid:
- Verificar que clases premium existentes se mantienen
- Ajustar hover effects: shadow-2xl con vibrant-orange/20
- Configurar transiciones suaves: duration-700
- Verificar rounded-2xl en Card wrapper
- Asegurar backdrop-blur-md funciona correctamente

**Archivos a modificar:**
- `components/PropertyCard.tsx`

_Requisitos: 4.1, 7.2_

### ☐ 21. Estilizar controles del carrusel con efectos hover

Aplicar estilos a controles de navegación:
- Controles: opacity-0 por defecto, opacity-100 en group-hover/carousel
- Botones: bg-black/70 → hover:bg-vibrant-orange/80
- Backdrop-blur-md en botones
- Rounded-full para botones circulares
- Transition-opacity duration-300

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`

_Requisitos: 3.7, 7.2_

### ☐ 22. Implementar estados de carga para imágenes

Agregar skeleton/spinner durante carga de imágenes:
- Crear estado `imageLoading` para primera imagen
- Mostrar skeleton con bg-premium-card/50 mientras carga
- Usar onLoadingComplete de Next.js Image para detectar carga
- Aplicar fade-in animation al completar carga
- Mantener aspect ratio durante carga

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`

_Requisitos: 4.5_

### ☐ 23. Ajustar espaciado y gaps en grid responsive

Verificar y ajustar espaciado del grid:
- Desktop (lg): gap-6 entre tarjetas
- Tablet (md): gap-6 mantenido
- Mobile: gap-4 o gap-6 según mejor visual
- Verificar padding del container-premium
- Testear en breakpoints 375px, 768px, 1024px, 1440px

**Archivos a modificar:**
- `app/propiedades/page.tsx`

_Requisitos: 1.5, 2.4_

---

## Fase 7: Performance y Optimización

### ☐ 24. Memoizar PropertyCard para prevenir re-renders innecesarios

Implementar React.memo en PropertyCard:
- Envolver export con React.memo
- Crear función de comparación customizada
- Comparar: property.id y property.updated_at
- Documentar lógica en comentario
- Testear que actualizaciones funcionan correctamente

**Archivos a modificar:**
- `components/PropertyCard.tsx`

_Requisitos: 5.1, 5.4_

### ☐ 25. Agregar tracking de analytics para interacciones del carrusel

Implementar tracking de eventos del carrusel:
- Importar `useAnalytics` hook
- Crear handler para trackear cambios de imagen
- Evento: 'carousel_navigation' con metadata (property_id, from_index, to_index, total_images)
- Llamar en onSelect de Embla
- Respetar configuración de analytics del proyecto

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`
- Importar desde: `hooks/useAnalytics.ts`

_Requisitos: Monitoring (no requisito funcional, pero mencionado en diseño)_

### ☐ 26. Optimizar bundle size verificando imports

Revisar y optimizar imports:
- Verificar que Embla imports sean tree-shakeable
- Usar imports específicos de lucide-react: `import { ChevronLeft } from 'lucide-react'`
- Verificar que no hay imports de librerías completas innecesariamente
- Agregar "use client" solo donde sea necesario
- Documentar decisiones en comentarios

**Archivos a modificar:**
- `components/PropertyImageCarousel.tsx`
- `components/PropertyCard.tsx`

_Requisitos: 5.1_

---

## Fase 8: Testing y Validación

### ☐ 27. Crear tests unitarios para PropertyImageCarousel

Escribir tests para el componente de carrusel:
- Test: Renderizar sin imágenes muestra placeholder
- Test: Renderizar con una imagen no muestra controles
- Test: Renderizar con múltiples imágenes muestra controles
- Test: Click en next cambia a siguiente imagen
- Test: Click en dot cambia a imagen específica
- Test: stopPropagation previene navegación

**Archivos a crear:**
- `components/__tests__/PropertyImageCarousel.test.tsx`

**Archivos a modificar:**
- Ninguno

_Requisitos: Validar 3.1, 3.2, 3.8, 4.3_

### ☐ 28. Crear tests de integración para grid layout responsive

Escribir tests para verificar responsive behavior:
- Test: Grid muestra 4 columnas en desktop (≥1024px)
- Test: Grid muestra 2 columnas en tablet (768-1023px)
- Test: Grid muestra 1 columna en mobile (<768px)
- Test: Paginación funciona correctamente con 12 items por página
- Mock window.innerWidth para simular breakpoints

**Archivos a crear:**
- `app/propiedades/__tests__/page.test.tsx`

**Archivos a modificar:**
- Ninguno

_Requisitos: Validar 1.2, 1.3, 1.4_

### ☐ 29. Verificar accesibilidad con herramientas automatizadas

Ejecutar auditoría de accesibilidad:
- Instalar y ejecutar jest-axe o @axe-core/react
- Test: PropertyImageCarousel no tiene violaciones de accesibilidad
- Test: PropertyCard no tiene violaciones de accesibilidad
- Test: Verificar que ARIA labels están presentes
- Test: Verificar que controles son focusables

**Archivos a crear/modificar:**
- Tests en `components/__tests__/`

_Requisitos: Validar 6.1, 6.2, 6.4_

### ☐ 30. Ejecutar pruebas de performance con Lighthouse

Realizar auditoría de performance:
- Ejecutar Lighthouse en página /propiedades
- Verificar LCP < 2.5s
- Verificar CLS < 0.1
- Verificar que imágenes están lazy-loaded correctamente
- Documentar scores en comentario o archivo de métricas

**Archivos a crear:**
- Opcional: `docs/performance-metrics.md`

_Requisitos: Validar 5.1, 5.2, 5.4_

---

## Notas Finales

### Orden de Ejecución Recomendado

1. **Tareas 1-6**: Construir carrusel standalone
2. **Tareas 7-10**: Integrar carrusel en PropertyCard
3. **Tareas 11-12**: Cambiar a grid layout
4. **Tareas 13-15**: Optimizar imágenes
5. **Tareas 16-19**: Implementar accesibilidad
6. **Tareas 20-23**: Polish visual y UX
7. **Tareas 24-26**: Optimizaciones de performance
8. **Tareas 27-30**: Testing y validación

### Criterios de Aceptación

Después de completar todas las tareas:

- ✅ Grid responsive funciona en mobile, tablet y desktop
- ✅ Carrusel permite navegar entre imágenes sin salir del grid
- ✅ Click en controles del carrusel no navega a página de detalle
- ✅ Click en tarjeta (fuera de controles) navega correctamente
- ✅ Imágenes se cargan con lazy loading
- ✅ Primera imagen de cada propiedad tiene prioridad
- ✅ Controles tienen ARIA labels apropiados
- ✅ Navegación por teclado funciona (arrows, tab)
- ✅ Prefers-reduced-motion es respetado
- ✅ Estilos premium se mantienen consistentes
- ✅ Performance metrics cumplen objetivos (LCP < 2.5s, CLS < 0.1)

### Rollback

Si es necesario revertir:

```bash
# Revertir PropertyCard
git checkout HEAD~1 components/PropertyCard.tsx

# Revertir Grid Layout
git checkout HEAD~1 app/propiedades/page.tsx

# Eliminar PropertyImageCarousel
rm components/PropertyImageCarousel.tsx
```

### Próximos Pasos (Fuera del Scope Actual)

Funcionalidades avanzadas para futuras iteraciones:

- **Virtualización**: Si número de propiedades > 100
- **Infinite Scroll**: Alternativa a paginación
- **Filtros avanzados**: Dentro del grid con animaciones
- **Vistas alternativas**: Toggle entre grid y lista
- **Favoritos persistentes**: Guardar propiedades favoritas
- **Comparador**: Comparar múltiples propiedades lado a lado
