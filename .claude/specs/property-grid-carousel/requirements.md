# Requirements Document

## Introduction

Esta característica mejora la experiencia de visualización de propiedades en la página de propiedades mediante la implementación de un diseño en mosaico (grid) con carruseles de imágenes individuales. El objetivo es presentar las propiedades en un formato más visual y organizado, permitiendo a los usuarios ver múltiples imágenes de cada propiedad sin necesidad de navegar a la página de detalle.

## Requirements

### Requirement 1: Diseño en Mosaico de 4 Columnas

**User Story:** Como usuario visitante del sitio, quiero ver las propiedades organizadas en filas de 4 columnas, para poder comparar visualmente múltiples propiedades al mismo tiempo.

#### Acceptance Criteria

1. WHEN el usuario accede a la página de propiedades THEN el sistema SHALL mostrar las propiedades en un diseño de mosaico con 4 columnas por fila
2. WHEN el ancho de la pantalla es de escritorio (≥1024px) THEN el sistema SHALL mantener exactamente 4 propiedades por fila
3. WHEN el ancho de la pantalla es de tablet (768px-1023px) THEN el sistema SHALL mostrar 2 propiedades por fila
4. WHEN el ancho de la pantalla es móvil (<768px) THEN el sistema SHALL mostrar 1 propiedad por fila
5. WHEN se renderizan las tarjetas de propiedades THEN el sistema SHALL aplicar espaciado consistente entre las tarjetas (gap)

### Requirement 2: Visualización Completa de Imágenes

**User Story:** Como usuario visitante del sitio, quiero ver las imágenes de las propiedades completamente visibles sin recortes, para poder apreciar correctamente cada propiedad.

#### Acceptance Criteria

1. WHEN se muestra una imagen de propiedad THEN el sistema SHALL mostrar la imagen completa sin recortar partes importantes
2. WHEN se carga una imagen THEN el sistema SHALL mantener una relación de aspecto consistente para todas las imágenes del grid
3. WHEN la imagen tiene dimensiones diferentes al contenedor THEN el sistema SHALL aplicar `object-fit: cover` para asegurar que la imagen llene el contenedor manteniendo proporciones
4. WHEN se carga una imagen THEN el sistema SHALL aplicar un tamaño de contenedor fijo (por ejemplo, altura mínima de 250px-300px)
5. WHEN una imagen no está disponible THEN el sistema SHALL mostrar una imagen placeholder apropiada

### Requirement 3: Carrusel de Imágenes por Propiedad

**User Story:** Como usuario visitante del sitio, quiero deslizar entre las diferentes imágenes de cada propiedad directamente desde el grid, para explorar las fotos sin necesidad de abrir la página de detalle.

#### Acceptance Criteria

1. WHEN una propiedad tiene múltiples imágenes THEN el sistema SHALL permitir al usuario deslizar horizontalmente para ver las otras imágenes
2. WHEN el usuario desliza o hace clic en los controles del carrusel THEN el sistema SHALL cambiar a la siguiente/anterior imagen con una transición suave
3. WHEN el usuario está en la primera imagen y desliza hacia atrás THEN el sistema SHALL permanecer en la primera imagen O ir a la última imagen (comportamiento circular)
4. WHEN el usuario está en la última imagen y desliza hacia adelante THEN el sistema SHALL permanecer en la última imagen O ir a la primera imagen (comportamiento circular)
5. WHEN el carrusel cambia de imagen THEN el sistema SHALL mostrar indicadores visuales de la posición actual (por ejemplo, dots o contador "2/5")
6. WHEN el usuario interactúa con el carrusel THEN el sistema SHALL mostrar controles de navegación (flechas anterior/siguiente)
7. WHEN el usuario no interactúa con la tarjeta THEN el sistema SHALL ocultar o mostrar sutilmente los controles para no sobrecargar la interfaz
8. WHEN una propiedad tiene solo una imagen THEN el sistema SHALL ocultar los controles del carrusel

### Requirement 4: Interacción y Usabilidad

**User Story:** Como usuario visitante del sitio, quiero una experiencia de navegación intuitiva en el grid de propiedades, para poder explorar eficientemente las opciones disponibles.

#### Acceptance Criteria

1. WHEN el usuario hace hover sobre una tarjeta de propiedad (desktop) THEN el sistema SHALL aplicar un efecto visual sutil (shadow, scale, etc.)
2. WHEN el usuario hace clic en una tarjeta de propiedad (fuera del área del carrusel) THEN el sistema SHALL navegar a la página de detalle de la propiedad
3. WHEN el usuario interactúa con los controles del carrusel THEN el sistema SHALL prevenir la navegación a la página de detalle
4. WHEN se muestran las tarjetas THEN el sistema SHALL incluir información esencial visible: título, precio, ubicación, características principales
5. WHEN se cargan las imágenes THEN el sistema SHALL mostrar un estado de carga (skeleton o spinner) mientras se cargan las imágenes

### Requirement 5: Rendimiento y Optimización

**User Story:** Como usuario visitante del sitio, quiero que la página de propiedades cargue rápidamente, para tener una experiencia fluida al explorar las propiedades.

#### Acceptance Criteria

1. WHEN se carga la página de propiedades THEN el sistema SHALL implementar lazy loading para las imágenes que están fuera del viewport inicial
2. WHEN se cargan las imágenes THEN el sistema SHALL utilizar tamaños optimizados de imagen según el dispositivo (responsive images)
3. WHEN se navega por el carrusel THEN el sistema SHALL precargar la imagen siguiente para transiciones instantáneas
4. WHEN el usuario hace scroll THEN el sistema SHALL cargar las imágenes próximas antes de que entren al viewport
5. WHEN hay múltiples propiedades THEN el sistema SHALL implementar paginación o scroll infinito si el número de propiedades excede un límite razonable (por ejemplo, 20-30)

### Requirement 6: Accesibilidad

**User Story:** Como usuario con necesidades de accesibilidad, quiero poder navegar y explorar las propiedades usando tecnologías asistivas, para tener una experiencia inclusiva.

#### Acceptance Criteria

1. WHEN se usan controles del carrusel THEN el sistema SHALL proporcionar etiquetas ARIA apropiadas para lectores de pantalla
2. WHEN se navega con teclado THEN el sistema SHALL permitir la navegación por las tarjetas usando Tab y los carruseles usando flechas del teclado
3. WHEN se muestran imágenes THEN el sistema SHALL incluir atributos alt descriptivos para cada imagen
4. WHEN se muestran indicadores de posición del carrusel THEN el sistema SHALL hacerlos accesibles vía teclado
5. WHEN se aplican efectos visuales THEN el sistema SHALL respetar la configuración prefers-reduced-motion del usuario

### Requirement 7: Compatibilidad con Diseño Actual

**User Story:** Como administrador del sitio, quiero que la nueva funcionalidad de grid se integre perfectamente con el diseño existente, para mantener la coherencia visual de la marca Marconi Inmobiliaria.

#### Acceptance Criteria

1. WHEN se implementa el nuevo grid THEN el sistema SHALL utilizar los componentes y estilos existentes de shadcn/ui y Tailwind CSS
2. WHEN se muestran las tarjetas THEN el sistema SHALL respetar el tema activo (claro/oscuro) del sitio
3. WHEN se implementan animaciones THEN el sistema SHALL utilizar Framer Motion para consistencia con el resto del sitio
4. WHEN se muestran las propiedades THEN el sistema SHALL mantener la estructura de datos y tipos TypeScript existentes
5. WHEN se cargan imágenes THEN el sistema SHALL utilizar la integración existente con Cloudinary
