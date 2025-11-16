import { test, expect } from '@playwright/test';

/**
 * Tests de Rendimiento para el Mapa Interactivo de Propiedades
 *
 * Verifica:
 * - Tiempo de carga del mapa
 * - Performance con diferentes cantidades de propiedades
 * - Funcionamiento del clustering
 * - Métricas de rendimiento general
 */

test.describe('Rendimiento del Mapa Interactivo', () => {

  test('debe cargar el mapa en menos de 3 segundos', async ({ page }) => {
    const startTime = Date.now();

    // Navegar a la página principal
    await page.goto('/');

    // Esperar a que el mapa se cargue completamente
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // Esperar a que los tiles se carguen
    await page.waitForSelector('.leaflet-tile-loaded', { timeout: 10000 });

    // Esperar a que termine cualquier animación
    await page.waitForTimeout(1000);

    const loadTime = Date.now() - startTime;

    console.log(`⏱️  Tiempo de carga del mapa: ${loadTime}ms`);

    // Verificar que carga en menos de 3 segundos
    expect(loadTime).toBeLessThan(3000);
  });

  test('debe mostrar métricas de Web Vitals aceptables', async ({ page }) => {
    // Navegar a la página
    await page.goto('/');

    // Esperar a que el mapa cargue
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // Obtener métricas de performance
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        // Time to First Byte
        ttfb: navigation.responseStart - navigation.requestStart,
        // First Contentful Paint
        fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        // DOM Content Loaded
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        // Load Complete
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        // Total Load Time
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      };
    });

    console.log('📊 Métricas de rendimiento:');
    console.log(`   TTFB: ${Math.round(metrics.ttfb)}ms`);
    console.log(`   FCP: ${Math.round(metrics.fcp)}ms`);
    console.log(`   DOM Content Loaded: ${Math.round(metrics.domContentLoaded)}ms`);
    console.log(`   Load Complete: ${Math.round(metrics.loadComplete)}ms`);
    console.log(`   Total Load Time: ${Math.round(metrics.totalLoadTime)}ms`);

    // Verificar que las métricas están en rangos aceptables
    expect(metrics.ttfb).toBeLessThan(800); // TTFB < 800ms
    expect(metrics.fcp).toBeLessThan(1800); // FCP < 1.8s
    expect(metrics.totalLoadTime).toBeLessThan(3000); // Total < 3s
  });

  test('debe activar clustering con 50+ propiedades', async ({ page }) => {
    // Navegar a la página
    await page.goto('/');

    // Esperar a que el mapa cargue
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Contar marcadores individuales
    const markerCount = await page.locator('.leaflet-marker-icon').count();

    // Contar clusters
    const clusterCount = await page.locator('.custom-cluster-icon').count();

    console.log(`📍 Marcadores individuales: ${markerCount}`);
    console.log(`🔢 Clusters: ${clusterCount}`);

    // Si hay más de 50 propiedades en la BD, deberían existir clusters
    const totalProperties = await page.evaluate(() => {
      return fetch('/api/properties/map-locations')
        .then(res => res.json())
        .then(data => data.count || 0);
    });

    console.log(`🏠 Total de propiedades disponibles: ${totalProperties}`);

    if (totalProperties >= 50) {
      // Debería haber clusters si hay 50+ propiedades
      expect(clusterCount).toBeGreaterThan(0);
      console.log('✅ Clustering activado correctamente');
    } else {
      console.log('ℹ️  No hay suficientes propiedades para probar clustering (necesita 50+)');
    }
  });

  test('debe manejar zoom sin degradación de performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Medir tiempo de 10 operaciones de zoom
    const startTime = Date.now();

    for (let i = 0; i < 5; i++) {
      // Zoom in
      await page.locator('.leaflet-control-zoom-in').click();
      await page.waitForTimeout(200);

      // Zoom out
      await page.locator('.leaflet-control-zoom-out').click();
      await page.waitForTimeout(200);
    }

    const totalTime = Date.now() - startTime;
    const averageTime = totalTime / 10;

    console.log(`⚡ Tiempo promedio por operación de zoom: ${Math.round(averageTime)}ms`);

    // Cada operación de zoom debería tomar menos de 500ms
    expect(averageTime).toBeLessThan(500);
  });

  test('debe cargar imágenes de popups de forma eficiente', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Verificar que hay marcadores
    const markers = page.locator('.leaflet-marker-icon');
    const markerCount = await markers.count();

    if (markerCount > 0) {
      // Hacer clic en el primer marcador
      const clickStart = Date.now();
      await markers.first().click();

      // Esperar a que aparezca el popup
      await page.waitForSelector('.leaflet-popup', { timeout: 5000 });

      // Esperar a que la imagen se cargue
      await page.waitForSelector('.leaflet-popup img', { timeout: 5000 });

      const popupLoadTime = Date.now() - clickStart;

      console.log(`🖼️  Tiempo de carga del popup (incluyendo imagen): ${popupLoadTime}ms`);

      // El popup con imagen debería cargar en menos de 2 segundos
      expect(popupLoadTime).toBeLessThan(2000);

      // Verificar que la imagen tiene lazy loading
      const imgLoading = await page.locator('.leaflet-popup img').getAttribute('loading');
      expect(imgLoading).toBe('lazy');
      console.log('✅ Lazy loading activado en imágenes');
    }
  });

  test('debe tener un bundle size razonable', async ({ page }) => {
    // Interceptar todas las peticiones de recursos
    const resources: Array<{ url: string; size: number; type: string }> = [];

    page.on('response', async (response) => {
      const url = response.url();
      const headers = response.headers();
      const contentLength = headers['content-length'];
      const contentType = headers['content-type'] || '';

      if (contentLength && (url.includes('.js') || url.includes('.css'))) {
        resources.push({
          url: url.split('/').pop() || url,
          size: parseInt(contentLength),
          type: contentType,
        });
      }
    });

    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Calcular tamaño total de JS y CSS
    const jsSize = resources
      .filter(r => r.url.includes('.js'))
      .reduce((sum, r) => sum + r.size, 0);

    const cssSize = resources
      .filter(r => r.url.includes('.css'))
      .reduce((sum, r) => sum + r.size, 0);

    const totalSize = jsSize + cssSize;

    console.log('📦 Tamaño de recursos:');
    console.log(`   JavaScript: ${(jsSize / 1024).toFixed(2)} KB`);
    console.log(`   CSS: ${(cssSize / 1024).toFixed(2)} KB`);
    console.log(`   Total: ${(totalSize / 1024).toFixed(2)} KB`);

    // Verificar que el bundle total no sea excesivamente grande
    // Para una aplicación con Next.js y Leaflet, menos de 2MB es razonable
    expect(totalSize).toBeLessThan(2 * 1024 * 1024); // 2MB
  });

  test('debe manejar pan/drag sin lag', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(1000);

    const mapContainer = page.locator('.leaflet-container');
    const box = await mapContainer.boundingBox();

    if (box) {
      // Realizar múltiples operaciones de drag
      const startTime = Date.now();
      const iterations = 5;

      for (let i = 0; i < iterations; i++) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(100);
      }

      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / iterations;

      console.log(`🖱️  Tiempo promedio por operación de pan: ${Math.round(averageTime)}ms`);

      // Cada operación de pan debería ser fluida (< 1s)
      expect(averageTime).toBeLessThan(1000);
    }
  });

  test('debe reportar uso de memoria razonable', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Obtener métricas de memoria (solo funciona en Chromium)
    const memoryInfo = await page.evaluate(() => {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        return {
          usedJSHeapSize: mem.usedJSHeapSize,
          totalJSHeapSize: mem.totalJSHeapSize,
          jsHeapSizeLimit: mem.jsHeapSizeLimit,
        };
      }
      return null;
    });

    if (memoryInfo) {
      const usedMB = (memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2);
      const totalMB = (memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2);
      const limitMB = (memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2);

      console.log('🧠 Uso de memoria:');
      console.log(`   Usado: ${usedMB} MB`);
      console.log(`   Total: ${totalMB} MB`);
      console.log(`   Límite: ${limitMB} MB`);

      // Verificar que el uso de memoria no sea excesivo (< 150MB)
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(150 * 1024 * 1024);
    } else {
      console.log('ℹ️  Información de memoria no disponible en este navegador');
    }
  });
});
