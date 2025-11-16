# Documento de Requisitos - Mapa Interactivo de Propiedades

## Introducción

Este documento define los requisitos funcionales y no funcionales para la implementación de un mapa interactivo de propiedades en la página principal de Marconi Inmobiliaria. El mapa mostrará todas las propiedades disponibles mediante pines geográficos y se sincronizará automáticamente con el estado de las propiedades en la base de datos (alta/baja del mercado).

La solución propuesta utiliza uMap como herramienta de mapeo, sujeto a validación de requisitos técnicos y de integración.

## Requisitos

### Requisito 1 - Visualización del Mapa en Página Principal

**Historia de Usuario:** Como visitante del sitio web, quiero ver un mapa interactivo en la página principal con todas las propiedades disponibles marcadas, para poder identificar rápidamente la ubicación de las propiedades que me interesan.

#### Criterios de Aceptación

1. WHEN el usuario accede a la página principal ("/") THEN el sistema SHALL mostrar un mapa interactivo con todas las propiedades disponibles marcadas con pines
2. WHERE el mapa se muestra en la página principal THEN el sistema SHALL posicionar el mapa en una sección visible y destacada
3. WHEN el mapa se carga inicialmente THEN el sistema SHALL centrar la vista en la ciudad de Reconquista, Santa Fe, Argentina
4. WHEN el mapa contiene múltiples propiedades THEN el sistema SHALL ajustar automáticamente el nivel de zoom para mostrar todas las propiedades visibles
5. IF el sistema no puede cargar el mapa THEN SHALL mostrar un mensaje de error informativo al usuario

### Requisito 2 - Representación Visual de Propiedades con Pines

**Historia de Usuario:** Como visitante del sitio web, quiero ver cada propiedad representada con un pin en el mapa, para poder identificar visualmente las ubicaciones disponibles.

#### Criterios de Aceptación

1. WHEN una propiedad tiene coordenadas válidas (latitude y longitude no nulos) THEN el sistema SHALL mostrar un pin 📌 en la ubicación correspondiente del mapa
2. IF una propiedad no tiene coordenadas definidas THEN el sistema SHALL omitir esa propiedad del mapa
3. WHEN el usuario hace clic en un pin THEN el sistema SHALL mostrar información básica de la propiedad en un popup o tooltip
4. WHERE se muestra información en el popup THEN el sistema SHALL incluir como mínimo: título de la propiedad, precio, tipo de operación (venta/alquiler) y tipo de propiedad
5. WHEN el popup de una propiedad está abierto THEN el sistema SHALL proporcionar un enlace para ver los detalles completos de la propiedad
6. IF existen múltiples propiedades en ubicaciones muy cercanas THEN el sistema SHALL implementar clustering de pines para mejorar la legibilidad

### Requisito 3 - Sincronización Automática con Estado de Propiedades

**Historia de Usuario:** Como administrador de la plataforma, quiero que el mapa se actualice automáticamente cuando una propiedad entra o sale del mercado, para que los usuarios siempre vean información actualizada sin intervención manual.

#### Criterios de Aceptación

1. WHEN una propiedad tiene status = "available" THEN el sistema SHALL mostrar esa propiedad en el mapa
2. WHEN una propiedad tiene status diferente de "available" (sold, rented, reserved) THEN el sistema SHALL ocultar esa propiedad del mapa
3. WHEN el administrador cambia el status de una propiedad de "available" a otro estado THEN el sistema SHALL remover el pin correspondiente del mapa en la próxima carga de la página
4. WHEN el administrador cambia el status de una propiedad a "available" THEN el sistema SHALL agregar el pin correspondiente al mapa en la próxima carga de la página
5. IF se crea una nueva propiedad con status = "available" y coordenadas válidas THEN el sistema SHALL mostrar automáticamente el pin en el mapa en la próxima carga
6. IF se elimina una propiedad de la base de datos THEN el sistema SHALL remover el pin correspondiente del mapa en la próxima carga

### Requisito 4 - Filtrado de Propiedades según Coordenadas

**Historia de Usuario:** Como visitante del sitio web, quiero que el mapa solo muestre propiedades que tienen ubicación geográfica definida, para evitar errores de visualización o información incompleta.

#### Criterios de Aceptación

1. WHEN el sistema carga las propiedades para el mapa THEN SHALL filtrar solo las propiedades donde latitude IS NOT NULL AND longitude IS NOT NULL
2. WHEN el sistema carga las propiedades para el mapa THEN SHALL filtrar solo las propiedades donde status = "available"
3. WHERE las coordenadas están definidas THEN el sistema SHALL validar que estén dentro de los límites geográficos de Argentina (latitude entre -55.061314 y -21.781277, longitude entre -73.560562 y -53.591835)
4. IF una propiedad tiene coordenadas fuera de los límites válidos THEN el sistema SHALL registrar un warning en los logs y omitir la propiedad del mapa

### Requisito 5 - Integración con uMap

**Historia de Usuario:** Como desarrollador, quiero evaluar e implementar uMap como solución de mapeo, para proporcionar una experiencia de mapa interactiva y funcional.

#### Criterios de Aceptación

1. WHEN se evalúa uMap como solución THEN el sistema SHALL verificar que cumple con los siguientes requisitos: capacidad de incrustar mapas, personalización de pines, acceso mediante API o iframe
2. IF uMap no cumple con los requisitos técnicos necesarios THEN el equipo de desarrollo SHALL proponer una solución alternativa (ej: Leaflet.js, Google Maps, Mapbox)
3. WHEN se implementa uMap THEN el sistema SHALL proporcionar configuración de estilos personalizada acorde a la identidad visual de Marconi Inmobiliaria
4. WHEN se utiliza uMap THEN el sistema SHALL garantizar un tiempo de carga del mapa inferior a 3 segundos en condiciones normales de red
5. WHERE se implementa la solución de mapeo THEN el sistema SHALL ser responsive y funcionar correctamente en dispositivos móviles, tablets y desktop

### Requisito 6 - Interactividad del Mapa

**Historia de Usuario:** Como visitante del sitio web, quiero poder interactuar con el mapa (hacer zoom, mover la vista, hacer clic en pines), para explorar las propiedades de manera intuitiva.

#### Criterios de Aceptación

1. WHEN el usuario interactúa con el mapa THEN el sistema SHALL permitir hacer zoom in/out mediante controles visuales o gestos (scroll, pinch)
2. WHEN el usuario interactúa con el mapa THEN el sistema SHALL permitir arrastrar la vista para explorar diferentes áreas geográficas
3. WHEN el usuario hace clic en un pin THEN el sistema SHALL abrir un popup con información de la propiedad
4. WHEN un popup está abierto y el usuario hace clic en otro pin THEN el sistema SHALL cerrar el popup anterior y abrir el nuevo
5. WHEN el usuario hace clic fuera de un popup abierto THEN el sistema SHALL cerrar el popup
6. IF el dispositivo es móvil THEN el sistema SHALL adaptar los controles táctiles para una experiencia óptima (tap, pinch-to-zoom, swipe)

### Requisito 7 - Rendimiento y Optimización

**Historia de Usuario:** Como visitante del sitio web, quiero que el mapa cargue rápidamente y funcione de manera fluida, para poder explorar las propiedades sin frustraciones.

#### Criterios de Aceptación

1. WHEN la página principal carga THEN el sistema SHALL cargar el mapa y todos los pines en menos de 3 segundos con conexión de red estándar (3G o superior)
2. WHEN existen más de 50 propiedades en el mapa THEN el sistema SHALL implementar técnicas de optimización como clustering o lazy loading de pines
3. WHEN el usuario interactúa con el mapa (zoom, pan) THEN el sistema SHALL responder a las interacciones en menos de 100ms
4. WHERE se cargan las propiedades desde la base de datos THEN el sistema SHALL utilizar un endpoint API optimizado que devuelva solo los campos necesarios para el mapa (id, title, price, latitude, longitude, property_type, operation_type, status)
5. IF el mapa tarda más de 5 segundos en cargar THEN el sistema SHALL mostrar un indicador de carga visual al usuario

### Requisito 8 - Manejo de Errores y Estado Sin Propiedades

**Historia de Usuario:** Como visitante del sitio web, quiero recibir mensajes claros cuando no hay propiedades disponibles o hay problemas con el mapa, para entender el estado de la aplicación.

#### Criterios de Aceptación

1. WHEN no existen propiedades con status = "available" y coordenadas válidas THEN el sistema SHALL mostrar un mensaje informativo: "No hay propiedades disponibles en este momento"
2. IF la API de propiedades falla al cargar los datos THEN el sistema SHALL mostrar un mensaje de error: "Error al cargar las propiedades. Por favor, intenta nuevamente más tarde"
3. IF la biblioteca de mapeo (uMap/alternativa) falla al cargar THEN el sistema SHALL mostrar un mensaje de error: "Error al cargar el mapa. Por favor, recarga la página"
4. WHEN ocurre un error THEN el sistema SHALL registrar el error en los logs del sistema para debugging
5. WHERE se muestra un mensaje de error THEN el sistema SHALL proporcionar un botón o enlace para reintentar la carga

### Requisito 9 - Integración con Sistema Analítico

**Historia de Usuario:** Como administrador de marketing, quiero rastrear las interacciones de los usuarios con el mapa de propiedades, para entender qué áreas geográficas generan más interés.

#### Criterios de Aceptación

1. WHEN el usuario hace clic en un pin del mapa THEN el sistema SHALL registrar un evento analítico con el ID de la propiedad
2. WHEN el usuario hace clic en el enlace "ver detalles" desde el popup THEN el sistema SHALL registrar un evento de conversión de mapa a página de detalles
3. WHERE se integra con el sistema de analytics existente THEN el sistema SHALL utilizar el servicio de analytics definido en `services/analytics.ts`
4. WHEN se registran eventos del mapa THEN el sistema SHALL incluir metadatos como: property_id, source: "interactive_map", action_type: "pin_click" o "view_details"
5. IF el sistema de analytics no está disponible THEN el mapa SHALL continuar funcionando sin degradación de la experiencia del usuario

## Requisitos No Funcionales

### Requisito NF-1 - Compatibilidad de Navegadores

**Historia de Usuario:** Como visitante del sitio web, quiero que el mapa funcione correctamente en mi navegador preferido, independientemente de cuál sea.

#### Criterios de Aceptación

1. WHEN el usuario accede desde navegadores modernos (Chrome, Firefox, Safari, Edge) THEN el sistema SHALL funcionar correctamente con todas las funcionalidades
2. WHEN el usuario accede desde versiones de navegadores de los últimos 2 años THEN el sistema SHALL mantener compatibilidad completa
3. IF el usuario accede desde navegadores no soportados (IE11 o anteriores) THEN el sistema SHALL mostrar un mensaje informativo sugiriendo actualizar el navegador

### Requisito NF-2 - Diseño Responsive

**Historia de Usuario:** Como visitante móvil, quiero que el mapa se adapte perfectamente a mi dispositivo, para poder explorar propiedades desde cualquier pantalla.

#### Criterios de Aceptación

1. WHEN el usuario accede desde dispositivos móviles (< 768px) THEN el mapa SHALL ocupar el ancho completo de la pantalla y tener una altura mínima de 400px
2. WHEN el usuario accede desde tablets (768px - 1024px) THEN el mapa SHALL ajustar su tamaño proporcionalmente manteniendo legibilidad
3. WHEN el usuario accede desde desktop (> 1024px) THEN el mapa SHALL mostrar un tamaño optimizado que no exceda el 90% del viewport height
4. WHERE el mapa se muestra en diferentes dispositivos THEN los controles de zoom y navegación SHALL ser suficientemente grandes para interacción táctil (mínimo 44x44px)

### Requisito NF-3 - Seguridad y Privacidad

**Historia de Usuario:** Como usuario del sitio web, quiero que mis interacciones con el mapa sean seguras y respeten mi privacidad.

#### Criterios de Aceptación

1. WHEN el sistema se integra con servicios de mapeo externos THEN SHALL utilizar HTTPS para todas las peticiones
2. WHEN se rastrean eventos analíticos del mapa THEN el sistema SHALL cumplir con las políticas GDPR existentes en el sistema de analytics
3. WHERE se almacenan coordenadas de propiedades THEN el sistema SHALL validar que solo usuarios autenticados con rol de administrador puedan modificarlas
4. IF se utilizan APIs de terceros (uMap u otros) THEN las claves de API SHALL almacenarse en variables de entorno y nunca exponerse en el frontend

### Requisito NF-4 - Mantenibilidad

**Historia de Usuario:** Como desarrollador, quiero que el código del mapa sea mantenible y extensible, para facilitar futuras mejoras y correcciones.

#### Criterios de Aceptación

1. WHEN se implementa el mapa THEN el código SHALL seguir los patrones arquitectónicos existentes del proyecto (componentes React, hooks personalizados, servicios separados)
2. WHERE se crea lógica de negocio del mapa THEN SHALL separarse en un servicio dedicado (ej: `services/map.ts`)
3. WHEN se crea el componente del mapa THEN SHALL implementarse con TypeScript con tipado estricto
4. WHERE se utilizan dependencias externas THEN SHALL documentarse en el README la justificación y configuración necesaria
5. IF se requiere configuración específica THEN SHALL utilizarse variables de entorno con valores por defecto razonables

### Requisito NF-5 - Escalabilidad

**Historia de Usuario:** Como administrador del sistema, quiero que el mapa pueda escalar con el crecimiento del catálogo de propiedades, sin degradación de rendimiento.

#### Criterios de Aceptación

1. WHEN el número de propiedades disponibles excede 100 THEN el sistema SHALL implementar clustering de pines automáticamente
2. WHEN el número de propiedades excede 500 THEN el sistema SHALL evaluar técnicas adicionales de optimización como viewport-based loading
3. WHERE se cargan propiedades para el mapa THEN el endpoint API SHALL utilizar paginación o límites de resultados configurables
4. IF el rendimiento degrada con el crecimiento de datos THEN el sistema SHALL permitir configurar el número máximo de pines visibles simultáneamente

## Glosario

- **Pin**: Marcador visual en el mapa que representa la ubicación de una propiedad
- **Clustering**: Agrupación de múltiples pines cercanos en un único marcador para mejorar legibilidad
- **Popup/Tooltip**: Ventana emergente que muestra información al hacer clic en un pin
- **uMap**: Plataforma de mapeo open-source basada en OpenStreetMap
- **Viewport**: Área visible de la pantalla en un momento dado
- **Responsive**: Capacidad de adaptarse a diferentes tamaños de pantalla
- **GDPR**: General Data Protection Regulation - regulación europea de protección de datos

## Dependencias y Consideraciones Técnicas

1. **Evaluación de uMap**: Antes de la implementación, se requiere validación técnica de:
   - Capacidad de embedding en React
   - API disponible para control programático
   - Personalización de estilos
   - Rendimiento con múltiples marcadores

2. **Alternativas a uMap** (si no cumple requisitos):
   - Leaflet.js (open-source, altamente personalizable)
   - Google Maps API (requiere API key, costos asociados)
   - Mapbox (requiere API key, tier gratuito disponible)

3. **Integración con Backend**:
   - Crear endpoint API optimizado: `GET /api/properties/map-locations`
   - Respuesta esperada: `{ id, title, price, currency, latitude, longitude, property_type, operation_type }`

4. **Estructura de Componentes Sugerida**:
   - `components/InteractivePropertyMap.tsx` - Componente principal
   - `components/PropertyMapPin.tsx` - Componente de pin individual
   - `components/PropertyMapPopup.tsx` - Componente de popup
   - `hooks/usePropertyMap.ts` - Hook personalizado para lógica de mapa
   - `services/map.ts` - Servicio para operaciones de mapa

## Criterios de Éxito

El feature se considerará exitoso cuando:

1. ✅ El mapa se muestre correctamente en la página principal en todos los dispositivos
2. ✅ Todas las propiedades disponibles con coordenadas válidas aparezcan en el mapa
3. ✅ La sincronización con el status de propiedades funcione automáticamente
4. ✅ Los usuarios puedan interactuar con el mapa de manera fluida (zoom, pan, clicks)
5. ✅ El tiempo de carga sea inferior a 3 segundos
6. ✅ El mapa sea completamente responsive
7. ✅ Se integre correctamente con el sistema de analytics existente
8. ✅ Cumpla con los estándares de accesibilidad WCAG 2.1 nivel AA

---

**🤖 Documento generado con [Claude Code](https://claude.com/claude-code)**
