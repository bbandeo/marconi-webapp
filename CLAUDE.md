# CLAUDE.md

Este archivo proporciona guías estrictas para Claude Code (claude.ai/code) cuando trabaja con código en este repositorio.

## DIRECTRICES CRÍTICAS PARA CLAUDE

### 🚫 RESTRICCIONES OBLIGATORIAS

1. **SIMPLICIDAD ANTE TODO**
   - Implementa EXCLUSIVAMENTE lo que se solicita, nada más.
   - NO añadas características, notificaciones o elementos adicionales no solicitados explícitamente.
   - Si la solución parece demasiado simple, ESTÁ BIEN. No la compliques.

2. **CONTRA LA SOBRE-INGENIERÍA**
   - Evita soluciones excesivamente complejas.
   - Usa siempre el enfoque más directo y sencillo que resuelva el problema.
   - NO agregues capas de abstracción innecesarias.

3. **VALIDACIÓN DE INSTRUCCIONES**
   - Antes de implementar, resume EXACTAMENTE lo que vas a hacer.
   - Si hay ambigüedad, PREGUNTA antes de proceder con cualquier implementación.
   - NO asumas requisitos adicionales que no están explícitamente mencionados.

4. **GIT WORKFLOW**
   - Después de completar una modificación, feature o fix, SIEMPRE realiza un push automático a la rama actual.
   - Proporciona el comando git exacto que se utilizará para el push al final de cada implementación.

### ✅ COMPORTAMIENTO ESPERADO

1. **EXACTITUD**
   - Implementa SOLO lo que se pide, ni más ni menos.
   - Si la tarea es "añadir un botón", solo añade un botón - no añadas un modal, una notificación, o cualquier otra funcionalidad no solicitada.

2. **IMPLEMENTACIÓN DIRECTA**
   - Utiliza componentes existentes siempre que sea posible.
   - No refactorices código no relacionado con la tarea actual a menos que se solicite explícitamente.

3. **COMUNICACIÓN CLARA**
   - Explica tu enfoque antes de mostrar código.
   - Pregunta cuando necesites clarificación - es mejor preguntar que asumir.

## Información del Proyecto

**Marconi Inmobiliaria** es una plataforma inmobiliaria en español construida con Next.js 15, que incluye un sitio público de listado de propiedades y un panel de administración completo para la gestión de propiedades y leads. La aplicación fue creada originalmente con v0.dev y se despliega en Vercel. Una adición reciente clave es un sistema integral de análisis y seguimiento compatible con GDPR para visualizaciones de propiedades y generación de leads.

## Comandos de Desarrollo

- `pnpm local` - Ejecutar servidor web local para desarrollo
- `pnpm dev` - Iniciar servidor de desarrollo
- `pnpm build` - Construir para producción
- `pnpm start` - Iniciar servidor de producción
- `pnpm lint` - Ejecutar ESLint (Nota: desactivado durante las builds via next.config.mjs)

## Arquitectura

### Tecnologías Principales
- **Next.js 15** con App Router
- **React 19** con TypeScript
- **Supabase** para base de datos y autenticación
- **Cloudinary** para gestión de imágenes
- **Tailwind CSS** + **shadcn/ui** para estilizado
- **Framer Motion** para animaciones y microinteracciones
- **Radix UI** primitives
- **React Hook Form** + **Zod** para formularios
- **Next Themes** para modo oscuro/claro

### Estructura de la Base de Datos
La aplicación utiliza Supabase con dos dominios de datos principales:
- **Tablas de Negocio Principales**:
  - **properties** - Listados inmobiliarios con imágenes, características, precios
  - **leads** - Formularios de contacto y consultas de clientes con funciones CRM
  - **profiles** - Cuentas de usuario y roles
- **Esquema de Analítica**: Un conjunto completo de tablas para seguimiento de interacciones:
  - **analytics_sessions** - Rastrea sesiones anónimas de usuario compatibles con GDPR con IPs hasheadas
  - **analytics_property_views** - Registra eventos detallados de visualización de propiedades con lógica de debounce de 2 horas
  - **analytics_lead_sources** - Catálogo de orígenes de leads (ej. WhatsApp, Formulario Web)
  - **analytics_lead_generation** - Rastrea la creación y atribución de cada lead
  - **Tablas de Agregación** (daily_stats, weekly_stats, etc.) - Métricas precalculadas para rendimiento rápido del dashboard
  - **Funciones PostgreSQL (RPCs)** - Implementadas para lógica compleja como debouncing de vistas duplicadas, hashing de IPs y recuperación de métricas del dashboard

### Patrones Arquitectónicos Clave

**Refactorización de Componentes**: El proyecto prioriza un enfoque DRY (Don't Repeat Yourself). Por ejemplo, el footer del sitio se extrajo de múltiples páginas a un único componente reutilizable ubicado en `components/Footer.tsx`.

**Diseño UX/UI Premium**: Se pone un fuerte énfasis en una experiencia de usuario moderna, limpia y profesional.

**Capa de Servicio de Analítica**: Toda la funcionalidad de seguimiento está centralizada:
- **Servicio**: `services/analytics.ts` contiene la lógica principal para interactuar con la base de datos
- **Endpoints API**: `app/api/analytics/` expone endpoints como `track-view` y `track-lead` para el frontend
- **Hook Personalizado**: `hooks/useAnalytics.ts` proporciona una interfaz simple y unificada para activar eventos de seguimiento desde cualquier componente

**Configuración del Cliente**: El cliente Supabase está configurado en `lib/supabase.ts` con clientes públicos y admin. Las variables de entorno se validan en tiempo de ejecución.

**Autenticación**: Actualmente deshabilitada en middleware.ts para desarrollo. Las rutas de administración están protegidas cuando la autenticación está habilitada.

**Manejo de Imágenes**: Integración de Cloudinary dividida entre implementaciones de cliente (`lib/cloudinary.ts`) y servidor (`lib/cloudinary-server.ts`).

**Obtención de Datos**: Las rutas API siguen patrones RESTful en `app/api/` con servicios dedicados en el directorio `services/`.

### Estructura de Directorios

- `app/` - Páginas y rutas API de Next.js App Router
  - `admin/` - Páginas del panel de administración (propiedades, contactos, dashboard)
  - `api/analytics/` - Endpoints API para el sistema de seguimiento
  - `propiedades/` - Listados públicos de propiedades
- `components/` - Componentes React reutilizables
  - `admin/` - Componentes específicos de administración
  - `ui/` - Componentes shadcn/ui
- `hooks/` - Hooks React personalizados (`useAnalytics.ts`)
- `services/` - Capa de acceso a datos (`properties.ts`, `analytics.ts`)
- `types/` - Definiciones de tipos TypeScript, incluyendo `analytics.ts`
- `scripts/` - Contiene archivos de migración de base de datos, como `analytics-schema-migration.sql`
- `lib/` - Utilidades y configuraciones de servicios de terceros

### Gestión de Estado
- React Hook Form para estado de formularios
- Hooks personalizados (`useContacts`, `useAnalytics`, etc.) para obtención de datos y lógica
- Sin librería de gestión de estado global

## Notas Importantes

- Los errores de TypeScript y ESLint se ignoran durante las builds (configurado en next.config.mjs)
- Las imágenes no están optimizadas (configurado para compatibilidad)
- La autenticación se omite temporalmente en middleware.ts
- Todo el contenido textual está en español
- El tema oscuro es el predeterminado
