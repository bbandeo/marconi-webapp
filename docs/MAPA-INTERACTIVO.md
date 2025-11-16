# Mapa Interactivo de Propiedades - Guía de Uso

## 📋 Resumen

El mapa interactivo muestra todas las propiedades disponibles con sus ubicaciones geográficas. Las propiedades aparecen automáticamente cuando tienen coordenadas (`latitude` y `longitude`) asignadas.

## 🚨 Problema Actual

**Las propiedades NO aparecen en el mapa porque NO tienen coordenadas asignadas.**

La tabla `properties` tiene las columnas `latitude` y `longitude` pero están vacías (NULL) en todas las propiedades existentes.

## ✅ Solución: Geocodificar Propiedades

### Opción 1: Script Automático (Recomendado)

Ejecuta el script de geocodificación que obtendrá las coordenadas automáticamente desde las direcciones:

```bash
npm run geocode:properties
```

Este script:
1. ✅ Obtiene todas las propiedades sin coordenadas
2. ✅ Geocodifica cada dirección usando OpenStreetMap/Nominatim
3. ✅ Valida que las coordenadas estén en Argentina
4. ✅ Actualiza la base de datos automáticamente
5. ✅ Respeta rate limits (1 request/segundo)

**Ejemplo de salida:**
```
🚀 Iniciando geocodificación de propiedades...

📊 Propiedades sin coordenadas: 15

────────────────────────────────────────────────────────────

📍 Procesando: Casa en Barrio Norte
   Dirección: Av. San Martín 1234, Barrio Norte, Reconquista, Santa Fe, Argentina
   ✅ Coordenadas: [-29.150000, -59.650000]
   💾 Guardado exitosamente

...

────────────────────────────────────────────────────────────

📊 Resumen:
   ✅ Exitosas: 12
   ❌ Fallidas: 3
   📍 Total procesadas: 15

✨ Proceso completado
```

### Opción 2: Manual desde el Panel Admin

1. Ve al panel de administración
2. Edita cada propiedad
3. Usa el selector de ubicación en el mapa
4. Guarda la propiedad

## 🔧 Configuración

### Variables de Entorno Requeridas

Para ejecutar el script de geocodificación necesitas:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### Estructura de Datos

Cada propiedad necesita:

```typescript
{
  latitude: number,    // Latitud (ej: -29.150000)
  longitude: number,   // Longitud (ej: -59.650000)
  address: string,     // Dirección (opcional para geocoding)
  neighborhood: string,// Barrio (opcional para geocoding)
  city: string        // Ciudad (opcional para geocoding)
}
```

## 📍 Límites de Argentina

Las coordenadas deben estar dentro de:
- **Latitud**: -55.061314 a -21.781277
- **Longitud**: -73.560562 a -53.591835

El sistema valida automáticamente estos límites.

## 🗺️ Características del Mapa

### ✨ Funcionalidades

- ✅ **Clustering automático**: Agrupa propiedades cuando hay 50+
- ✅ **Popups informativos**: Muestra precio, tipo, imagen
- ✅ **Responsive**: Optimizado para móvil, tablet, desktop
- ✅ **Estados premium**: Loading, error, vacío con UX profesional
- ✅ **Analytics**: Trackea clics en pins y "Ver Detalles"
- ✅ **Accesibilidad**: WCAG 2.1 AA compliant
- ✅ **Sincronización automática**: Se actualiza cuando cambia `status`

### 🎨 Diseño

- **Colores**: Sistema de diseño Marconi (night-blue, vibrant-orange)
- **Controles**: Zoom, navegación con gestos táctiles
- **Marcadores**: Iconos naranjas con popups elegantes
- **Clusters**: Círculos con contador de propiedades

## 🔍 API Endpoints

### GET /api/properties/map-locations

Obtiene propiedades con coordenadas para el mapa.

**Response:**
```json
{
  "success": true,
  "properties": [
    {
      "id": 1,
      "title": "Casa en Barrio Norte",
      "price": 150000,
      "currency": "USD",
      "latitude": -29.15,
      "longitude": -59.65,
      "property_type": "house",
      "operation_type": "sale",
      "images": ["url1.jpg"],
      "status": "available"
    }
  ],
  "count": 1,
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

**Filtros automáticos:**
- Solo `status = 'available'`
- Solo con `latitude IS NOT NULL AND longitude IS NOT NULL`
- Solo coordenadas válidas dentro de Argentina

**Cache:** 60 segundos con stale-while-revalidate de 120 segundos

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests del mapa
npm run test:map

# Todos los tests
npm test

# Tests con coverage
npm run test:coverage
```

### Coverage Actual

- ✅ 75 tests pasando
- ✅ 6 suites de test
- ✅ MapService, hooks, componentes, API

## 🚀 Cómo Verificar

1. **Ejecuta el script de geocodificación:**
   ```bash
   npm run geocode:properties
   ```

2. **Inicia el servidor:**
   ```bash
   npm run local
   ```

3. **Visita:** `http://localhost:3000`

4. **Desplázate hasta la sección "Mapa de Propiedades Disponibles"**

5. **Deberías ver:**
   - 🗺️ Mapa con marcadores naranjas
   - 📍 Click en marcador → popup con info
   - 🔘 Botón "Ver Detalles" → va a `/propiedades/[id]`

## ❓ Troubleshooting

### "El mapa está vacío"
- ✅ Verifica que las propiedades tengan `latitude` y `longitude`
- ✅ Ejecuta: `npm run geocode:properties`
- ✅ Verifica en Supabase: `SELECT id, title, latitude, longitude FROM properties WHERE status = 'available'`

### "Error al cargar el mapa"
- ✅ Verifica variables de entorno
- ✅ Revisa console del navegador (F12)
- ✅ Verifica que Supabase esté accesible

### "Las coordenadas son incorrectas"
- ✅ Verifica la dirección en la propiedad
- ✅ Re-ejecuta geocoding: `npm run geocode:properties`
- ✅ O edita manualmente desde el admin

## 📚 Archivos Relacionados

### Componentes
- `components/map/InteractivePropertyMap.tsx` - Componente principal
- `components/map/PropertyMapMarker.tsx` - Marcadores individuales
- `components/map/PropertyMapPopup.tsx` - Popups informativos
- `components/map/Map*State.tsx` - Estados (loading, error, empty)

### Servicios
- `services/map.ts` - Lógica de negocio del mapa
- `app/api/properties/map-locations/route.ts` - API endpoint

### Hooks
- `hooks/usePropertyMap.ts` - Estado y carga de propiedades
- `hooks/useMapResponsive.ts` - Configuración responsive

### Scripts
- `scripts/populate-property-coordinates.ts` - Geocodificación automática
- `scripts/add-coordinates-to-properties.sql` - Migración de DB

### Tests
- `__tests__/` - Todos los tests de integración

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía
2. Ejecuta `npm run geocode:properties`
3. Verifica variables de entorno
4. Revisa logs del navegador y servidor
