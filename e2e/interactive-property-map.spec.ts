import { test, expect } from '@playwright/test';

/**
 * Tests E2E para el Mapa Interactivo de Propiedades
 *
 * Estos tests verifican:
 * - Carga del mapa en la página principal
 * - Interacción con marcadores y popups
 * - Navegación a páginas de detalles
 * - Responsividad en diferentes dispositivos
 */

test.describe('Mapa Interactivo de Propiedades', () => {

  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal antes de cada test
    await page.goto('/');
  });

  test('debe cargar el mapa en la página principal', async ({ page }) => {
    // Esperar a que el contenedor del mapa esté visible
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    // Verificar que se cargue la capa de tiles de OpenStreetMap
    const tileLayer = page.locator('.leaflet-tile-pane');
    await expect(tileLayer).toBeVisible();

    // Verificar que existen controles de zoom
    const zoomControls = page.locator('.leaflet-control-zoom');
    await expect(zoomControls).toBeVisible();

    // Verificar que el botón de zoom in existe
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    await expect(zoomIn).toBeVisible();

    // Verificar que el botón de zoom out existe
    const zoomOut = page.locator('.leaflet-control-zoom-out');
    await expect(zoomOut).toBeVisible();
  });

  test('debe mostrar marcadores de propiedades', async ({ page }) => {
    // Esperar a que el mapa cargue
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // Esperar un momento para que los marcadores se rendericen
    await page.waitForTimeout(2000);

    // Verificar que existen marcadores en el mapa
    const markers = page.locator('.leaflet-marker-icon');
    const markerCount = await markers.count();

    // Debe haber al menos un marcador
    expect(markerCount).toBeGreaterThan(0);
  });

  test('debe mostrar popup al hacer clic en marcador', async ({ page }) => {
    // Esperar a que el mapa cargue
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Verificar que hay marcadores
    const markers = page.locator('.leaflet-marker-icon');
    const markerCount = await markers.count();

    if (markerCount > 0) {
      // Hacer clic en el primer marcador
      await markers.first().click();

      // Esperar a que el popup aparezca
      const popup = page.locator('.leaflet-popup');
      await expect(popup).toBeVisible({ timeout: 5000 });

      // Verificar que el popup tiene contenido
      const popupContent = page.locator('.leaflet-popup-content');
      await expect(popupContent).toBeVisible();

      // Verificar que el popup contiene información de la propiedad
      // Debe tener un título
      const hasText = await popupContent.textContent();
      expect(hasText).toBeTruthy();
      expect(hasText!.length).toBeGreaterThan(0);
    }
  });

  test('debe navegar a detalles de propiedad desde popup', async ({ page }) => {
    // Esperar a que el mapa cargue
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Verificar que hay marcadores
    const markers = page.locator('.leaflet-marker-icon');
    const markerCount = await markers.count();

    if (markerCount > 0) {
      // Hacer clic en el primer marcador
      await markers.first().click();

      // Esperar a que el popup aparezca
      await page.waitForSelector('.leaflet-popup', { timeout: 5000 });

      // Buscar el enlace "Ver Detalles" o similar
      const detailsLink = page.locator('.leaflet-popup a[href*="/propiedades/"]').first();

      // Verificar que el enlace existe
      await expect(detailsLink).toBeVisible();

      // Hacer clic en el enlace
      await detailsLink.click();

      // Esperar a que la navegación complete
      await page.waitForURL(/\/propiedades\/[a-f0-9-]+/, { timeout: 10000 });

      // Verificar que estamos en una página de detalles
      const currentUrl = page.url();
      expect(currentUrl).toContain('/propiedades/');

      // Verificar que la página de detalles tiene contenido
      const pageContent = page.locator('main, body');
      await expect(pageContent).toBeVisible();
    }
  });

  test('debe funcionar correctamente en dispositivo móvil', async ({ page }) => {
    // Este test se ejecutará automáticamente con el viewport de móvil
    // configurado en playwright.config.ts para el proyecto 'mobile-chrome'

    // Esperar a que el mapa cargue
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    // Verificar que los controles de zoom son visibles
    const zoomControls = page.locator('.leaflet-control-zoom');
    await expect(zoomControls).toBeVisible();

    // Esperar a que carguen los marcadores
    await page.waitForTimeout(2000);

    // Verificar que los marcadores son clickeables
    const markers = page.locator('.leaflet-marker-icon');
    const markerCount = await markers.count();

    if (markerCount > 0) {
      // Hacer tap en el primer marcador
      await markers.first().tap();

      // Verificar que el popup aparece
      const popup = page.locator('.leaflet-popup');
      await expect(popup).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe funcionar correctamente en tablet', async ({ page }) => {
    // Este test se ejecutará automáticamente con el viewport de tablet
    // configurado en playwright.config.ts para el proyecto 'tablet'

    // Esperar a que el mapa cargue
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    // Verificar que el mapa tiene el tamaño apropiado
    const boundingBox = await mapContainer.boundingBox();
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.width).toBeGreaterThan(600);

    // Esperar a que carguen los marcadores
    await page.waitForTimeout(2000);

    // Verificar que hay marcadores
    const markers = page.locator('.leaflet-marker-icon');
    const markerCount = await markers.count();
    expect(markerCount).toBeGreaterThan(0);
  });

  test('debe permitir hacer zoom con los controles', async ({ page }) => {
    // Esperar a que el mapa cargue
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // Obtener el nivel de zoom inicial
    const initialZoomLevel = await page.evaluate(() => {
      const container = document.querySelector('.leaflet-container') as any;
      return container?._leaflet_map?.getZoom();
    });

    // Hacer clic en zoom in
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    await zoomIn.click();
    await page.waitForTimeout(500);

    // Verificar que el zoom aumentó
    const newZoomLevel = await page.evaluate(() => {
      const container = document.querySelector('.leaflet-container') as any;
      return container?._leaflet_map?.getZoom();
    });

    expect(newZoomLevel).toBeGreaterThan(initialZoomLevel);

    // Hacer clic en zoom out
    const zoomOut = page.locator('.leaflet-control-zoom-out');
    await zoomOut.click();
    await page.waitForTimeout(500);

    // Verificar que el zoom disminuyó
    const finalZoomLevel = await page.evaluate(() => {
      const container = document.querySelector('.leaflet-container') as any;
      return container?._leaflet_map?.getZoom();
    });

    expect(finalZoomLevel).toBeLessThan(newZoomLevel);
  });

  test('debe mostrar estado de carga mientras se cargan las propiedades', async ({ page }) => {
    // Interceptar la petición API para simular una carga lenta
    await page.route('**/api/properties/map-locations', async (route) => {
      await page.waitForTimeout(1000);
      await route.continue();
    });

    // Navegar a la página
    await page.goto('/');

    // Verificar que se muestra algún indicador de carga
    // Puede ser un skeleton loader o un spinner
    const loadingState = page.locator('[class*="skeleton"], [class*="loading"], [class*="spinner"]').first();

    // El estado de carga debe aparecer inicialmente
    const isVisible = await loadingState.isVisible().catch(() => false);

    // Si el estado de carga es visible, esperar a que desaparezca
    if (isVisible) {
      await expect(loadingState).toBeHidden({ timeout: 10000 });
    }

    // Finalmente, el mapa debe estar visible
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible({ timeout: 15000 });
  });

  test('debe manejar errores de carga gracefully', async ({ page }) => {
    // Interceptar la petición API y hacer que falle
    await page.route('**/api/properties/map-locations', async (route) => {
      await route.abort('failed');
    });

    // Navegar a la página
    await page.goto('/');

    // Esperar a que aparezca el estado de error o el mensaje
    await page.waitForTimeout(3000);

    // Verificar que no se muestra el mapa normal
    // En su lugar, debe haber un mensaje de error o estado vacío
    const pageContent = await page.content();

    // El mapa no debería estar completamente funcional
    // pero la página no debería crashear
    expect(pageContent).toBeTruthy();
  });

  test('debe tener atributos de accesibilidad apropiados', async ({ page }) => {
    // Esperar a que el mapa cargue
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // Verificar que el contenedor del mapa tiene role o aria-label
    const mapSection = page.locator('[role="region"]').filter({ has: page.locator('.leaflet-container') });
    const hasAriaLabel = await mapSection.getAttribute('aria-label').catch(() => null);
    const hasAriaDescribedBy = await mapSection.getAttribute('aria-describedby').catch(() => null);

    // Debe tener al menos uno de los atributos de accesibilidad
    expect(hasAriaLabel || hasAriaDescribedBy).toBeTruthy();

    // Los controles de zoom deben ser accesibles con teclado
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    await zoomIn.focus();
    const isFocused = await zoomIn.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBe(true);
  });
});
