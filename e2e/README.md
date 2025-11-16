# Tests E2E - Mapa Interactivo de Propiedades

Este directorio contiene los tests end-to-end (E2E) para el mapa interactivo de propiedades, implementados con Playwright.

## Requisitos

- Node.js 18+
- Navegadores de Playwright instalados (se instalan automáticamente)

## Instalación

Los navegadores de Playwright se instalan automáticamente la primera vez que ejecutas los tests. Si necesitas instalarlos manualmente:

```bash
npx playwright install chromium
```

## Scripts Disponibles

### Ejecutar todos los tests

```bash
npm run test:e2e
```

Ejecuta todos los tests E2E en modo headless (sin interfaz gráfica) en todos los proyectos configurados (desktop, móvil, tablet).

### Modo UI interactivo

```bash
npm run test:e2e:ui
```

Abre la interfaz gráfica de Playwright donde puedes:
- Ver todos los tests disponibles
- Ejecutar tests específicos
- Ver el timeline de ejecución
- Inspeccionar elementos de la página

### Modo headed (con navegador visible)

```bash
npm run test:e2e:headed
```

Ejecuta los tests mostrando el navegador. Útil para ver qué está pasando durante la ejecución.

### Modo debug

```bash
npm run test:e2e:debug
```

Ejecuta los tests en modo debug con el inspector de Playwright. Permite:
- Ejecutar tests paso a paso
- Pausar la ejecución
- Inspeccionar el estado de la página
- Ver los locators utilizados

### Ver reporte de tests

```bash
npm run test:e2e:report
```

Abre el reporte HTML de la última ejecución de tests con:
- Resultados de cada test
- Screenshots de fallos
- Videos de fallos
- Traces para debugging

## Estructura de Tests

### `interactive-property-map.spec.ts`

Contiene los siguientes tests:

1. **Carga del mapa**
   - Verifica que el mapa se cargue correctamente
   - Comprueba la presencia de controles de zoom
   - Valida que se carguen los tiles de OpenStreetMap

2. **Marcadores de propiedades**
   - Verifica que se muestren marcadores en el mapa
   - Comprueba que hay al menos un marcador visible

3. **Interacción con popups**
   - Simula clic en marcador
   - Verifica que aparezca el popup
   - Valida el contenido del popup

4. **Navegación a detalles**
   - Hace clic en enlace "Ver Detalles"
   - Verifica que navegue correctamente
   - Valida la URL de destino

5. **Responsividad**
   - Tests específicos para móvil
   - Tests específicos para tablet
   - Verifica que el mapa funcione en diferentes viewports

6. **Controles de zoom**
   - Verifica funcionalidad de zoom in
   - Verifica funcionalidad de zoom out
   - Comprueba que los niveles de zoom cambien correctamente

7. **Estados de la aplicación**
   - Estado de carga
   - Manejo de errores
   - Estado vacío

8. **Accesibilidad**
   - Verifica atributos ARIA
   - Comprueba navegación con teclado
   - Valida focus en elementos interactivos

## Configuración

La configuración de Playwright se encuentra en `playwright.config.ts` en la raíz del proyecto.

### Proyectos configurados:

- **chromium**: Desktop Chrome (1280x720)
- **mobile-chrome**: Pixel 5 (393x851)
- **tablet**: iPad Pro (1024x1366)

### Características:

- **Ejecución paralela**: Los tests se ejecutan en paralelo cuando es posible
- **Retries**: 2 reintentos automáticos en CI
- **Traces**: Se capturan automáticamente en caso de fallo
- **Screenshots**: Solo en caso de fallo
- **Videos**: Solo cuando falla un test

## Servidor de Desarrollo

Los tests inician automáticamente el servidor de desarrollo (`npm run dev`) en el puerto 5000. El servidor se reutiliza si ya está corriendo.

## Variables de Entorno

Puedes personalizar la URL base con:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

## Debugging

### Ver qué está pasando en un test

1. Usa el modo headed: `npm run test:e2e:headed`
2. O usa el modo debug: `npm run test:e2e:debug`

### Inspeccionar un fallo

1. Ejecuta los tests normalmente
2. Si fallan, abre el reporte: `npm run test:e2e:report`
3. Revisa el trace, screenshots y videos
4. Re-ejecuta el test específico en modo debug

### Ejecutar un test específico

```bash
npx playwright test --grep "debe cargar el mapa"
```

### Ejecutar solo en un proyecto específico

```bash
npx playwright test --project=chromium
npx playwright test --project=mobile-chrome
```

## CI/CD

En ambientes de CI:
- Se ejecuta solo 1 worker (secuencial)
- Se realizan 2 reintentos automáticos
- Siempre se capturan traces y videos en fallos

## Mejores Prácticas

1. **Espera explícita**: Usa `waitForSelector` en lugar de `waitForTimeout` cuando sea posible
2. **Locators estables**: Usa clases CSS o atributos data-testid
3. **Independencia**: Cada test debe ser independiente
4. **Limpieza**: No es necesario limpiar estado entre tests
5. **Assertions**: Usa `expect` de Playwright en lugar de assertions básicas

## Troubleshooting

### Los tests fallan localmente

1. Asegúrate de que el servidor de desarrollo esté corriendo
2. Verifica que tienes datos de prueba en la base de datos
3. Comprueba que las variables de entorno estén configuradas

### El mapa no se carga

1. Verifica que las propiedades tengan coordenadas válidas
2. Comprueba la consola del navegador en modo headed
3. Revisa que el endpoint `/api/properties/map-locations` responda

### Tests intermitentes

1. Aumenta los timeouts si es necesario
2. Usa esperas más robustas
3. Revisa la red y latencia en el reporte

## Recursos

- [Documentación de Playwright](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Selectors](https://playwright.dev/docs/selectors)
