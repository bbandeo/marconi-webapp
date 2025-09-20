# Features Pendientes - Marconi Inmobiliaria

## 🔍 **Análisis Detallado vs Propuesta Comercial**

Después de revisar la codebase actual y comparar con la propuesta comercial original, se identificaron las siguientes features pendientes de implementación.

### **1. Buscador Avanzado (CRÍTICO)**
- **Estado**: ❌ **NO IMPLEMENTADO**
- **Descripción**: Filtros de búsqueda intuitivos mencionados en la propuesta
- **Ubicación esperada**: `/propiedades` con filtros por:
  - Tipo de propiedad
  - Ubicación/barrio
  - Rango de precios (min/max)
  - Número de habitaciones
  - Número de baños
  - Superficie (m²)
  - Operación (venta/alquiler)

### **2. Gestión de Estados de Propiedades**
- **Estado**: ⚠️ **PARCIALMENTE IMPLEMENTADO**
- **Faltante**: Control de estado "disponible", "vendida", "alquilada"
- **Ubicación**: `admin/properties` - falta funcionalidad de cambio de estado
- **Base de datos**: Necesita campo `status` en tabla `properties`

### **3. Configuración General del Sistema**
- **Estado**: ❌ **NO IMPLEMENTADO**
- **Descripción**: `/admin/settings` para modificar:
  - Datos de contacto de la inmobiliaria
  - Información de redes sociales
  - Parámetros generales del sitio
  - Logo y branding

### **4. Seguimiento Avanzado de Contactos**
- **Estado**: ⚠️ **PARCIALMENTE IMPLEMENTADO**
- **Implementado**: Base de contactos básica
- **Faltante**:
  - Visualización de qué propiedad interesó a cada contacto
  - Sistema de seguimiento de leads
  - Estados de contacto (nuevo, contactado, cerrado)
  - Historial de interacciones

### **5. Mapas Interactivos en Propiedades**
- **Estado**: ⚠️ **PARCIALMENTE IMPLEMENTADO**
- **Implementado**: Geocoding básico
- **Faltante**:
  - Visualización de ubicación en mapas interactivos
  - Integración con Google Maps o similar
  - Mostrar propiedades cercanas

### **6. Gestión de Múltiples Imágenes**
- **Estado**: ✅ **IMPLEMENTADO**
- **Confirmado**: Sistema Cloudinary funcionando

### **7. Formularios de Contacto por Propiedad**
- **Estado**: ✅ **IMPLEMENTADO**
- **Confirmado**: Formularios funcionando con analytics

### **8. Diseño Responsive**
- **Estado**: ✅ **IMPLEMENTADO**
- **Confirmado**: Layout responsive con Tailwind CSS

## 📋 **Lista Priorizada de Features Pendientes**

### **🔥 ALTA PRIORIDAD**
1. **Buscador Avanzado con Filtros**
   - Filtros por precio, tipo, ubicación, habitaciones, baños
   - URL state management para compartir búsquedas
   - Paginación de resultados

2. **Control de Estados de Propiedades**
   - Campo `status` en base de datos
   - UI para cambiar estado en admin
   - Filtrado automático de propiedades no disponibles

3. **Panel de Configuración General (`/admin/settings`)**
   - Datos de contacto editables
   - Configuración de redes sociales
   - Upload de logos y branding

### **🟡 MEDIA PRIORIDAD**
4. **Mapas Interactivos**
   - Integración con Google Maps
   - Mostrar ubicación de propiedades
   - Búsqueda por zona geográfica

5. **Seguimiento Avanzado de Leads**
   - Asociación contacto-propiedad
   - Estados de seguimiento
   - Dashboard de conversión

### **🟢 BAJA PRIORIDAD**
6. **Mejoras de UX**
   - Breadcrumbs
   - Comparador de propiedades
   - Favoritos de usuarios
   - Newsletter signup

## 🛠 **Recomendaciones de Implementación**

### **Para el Buscador Avanzado:**
```typescript
// Estructura sugerida para filtros
interface PropertyFilters {
  operation: 'sale' | 'rent' | 'all'
  type: 'house' | 'apartment' | 'commercial' | 'terreno' | 'local' | 'all'
  priceMin?: number
  priceMax?: number
  bedrooms?: number
  bathrooms?: number
  areaMin?: number
  areaMax?: number
  neighborhood?: string
}
```

### **Para Estados de Propiedades:**
```sql
-- Migración sugerida
ALTER TABLE properties ADD COLUMN status VARCHAR(20) DEFAULT 'available';
-- Valores: available, sold, rented, reserved
```

### **Para Configuración General:**
```sql
-- Nueva tabla para configuraciones
CREATE TABLE site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📅 **Cronograma Sugerido**

### **Sprint 1 (1-2 semanas)**
- ✅ Control de Estados de Propiedades
- ✅ Migración de base de datos

### **Sprint 2 (2-3 semanas)**
- ✅ Buscador Avanzado
- ✅ Filtros dinámicos

### **Sprint 3 (1-2 semanas)**
- ✅ Panel de Configuración General
- ✅ Sistema de settings

### **Sprint 4 (2-3 semanas)**
- ✅ Mapas Interactivos
- ✅ Seguimiento avanzado de leads

---

**Análisis realizado**: 2025-09-20
**Basado en**: Propuesta comercial vs codebase actual
**Prioridad**: Cumplir alcances originales de la propuesta