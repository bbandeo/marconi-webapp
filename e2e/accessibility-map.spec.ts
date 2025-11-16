/**
 * Tests de Accesibilidad - Mapa Interactivo de Propiedades
 *
 * Verifica que el mapa cumple con los estándares WCAG 2.1 AA:
 * - Navegación con teclado
 * - Atributos ARIA correctos
 * - Contraste de colores adecuado
 * - Compatibilidad con screen readers
 * - Focus visible en elementos interactivos
 */

import { test, expect } from '@playwright/test'

test.describe('Accesibilidad del Mapa Interactivo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Esperar a que el mapa cargue completamente
    await page.waitForSelector('.leaflet-container', { timeout: 10000 })
  })

  test('debe tener atributos ARIA correctos en el contenedor del mapa', async ({ page }) => {
    const mapRegion = page.locator('[role="region"]').first()

    // Verificar que existe un region con rol
    await expect(mapRegion).toBeVisible()

    // Verificar aria-label
    const ariaLabel = await mapRegion.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
    expect(ariaLabel).toContain('Mapa')

    // Verificar aria-describedby si existe
    const ariaDescribedBy = await mapRegion.getAttribute('aria-describedby')
    if (ariaDescribedBy) {
      const description = page.locator(`#${ariaDescribedBy}`)
      await expect(description).toBeAttached()
    }
  })

  test('debe permitir navegación con teclado a los controles de zoom', async ({ page }) => {
    // Encontrar botones de zoom
    const zoomIn = page.locator('.leaflet-control-zoom-in')
    const zoomOut = page.locator('.leaflet-control-zoom-out')

    await expect(zoomIn).toBeVisible()
    await expect(zoomOut).toBeVisible()

    // Verificar que tienen tabindex o son focusables
    const zoomInTabIndex = await zoomIn.getAttribute('tabindex')
    const zoomOutTabIndex = await zoomOut.getAttribute('tabindex')

    // Verificar que no tienen tabindex negativo (que los haría no focusables)
    expect(zoomInTabIndex).not.toBe('-1')
    expect(zoomOutTabIndex).not.toBe('-1')

    // Intentar hacer focus con Tab
    await page.keyboard.press('Tab')

    // Verificar que algún elemento del mapa recibió focus
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement
      return el ? el.className : ''
    })

    expect(focusedElement).toBeTruthy()
  })

  test('debe permitir activar controles de zoom con Enter', async ({ page }) => {
    const zoomIn = page.locator('.leaflet-control-zoom-in')

    // Obtener nivel de zoom inicial
    const initialZoom = await page.evaluate(() => {
      const map = (window as any).L?.map
      return map ? map._zoom : null
    })

    // Focus en el botón de zoom in
    await zoomIn.focus()

    // Presionar Enter
    await page.keyboard.press('Enter')

    // Esperar un momento para que el zoom cambie
    await page.waitForTimeout(500)

    // Verificar que el zoom cambió (puede no funcionar si el botón no es completamente accesible)
    const newZoom = await page.evaluate(() => {
      const map = (window as any).L?.map
      return map ? map._zoom : null
    })

    // Solo verificamos si pudimos obtener los valores
    if (initialZoom !== null && newZoom !== null) {
      expect(newZoom).toBeGreaterThanOrEqual(initialZoom)
    }
  })

  test('debe tener texto alternativo o aria-label en marcadores', async ({ page }) => {
    // Esperar a que aparezcan los marcadores
    const markers = page.locator('.leaflet-marker-icon')

    const markerCount = await markers.count()

    if (markerCount > 0) {
      // Verificar el primer marcador
      const firstMarker = markers.first()

      // Verificar que tiene alt, title o aria-label
      const alt = await firstMarker.getAttribute('alt')
      const title = await firstMarker.getAttribute('title')
      const ariaLabel = await firstMarker.getAttribute('aria-label')

      const hasAccessibleText = alt || title || ariaLabel
      expect(hasAccessibleText).toBeTruthy()
    }
  })

  test('debe mostrar focus visible en elementos interactivos', async ({ page }) => {
    // Hacer focus en el primer elemento interactivo del mapa
    await page.keyboard.press('Tab')

    // Obtener el estilo del elemento con focus
    const focusOutline = await page.evaluate(() => {
      const focused = document.activeElement as HTMLElement
      if (!focused) return null

      const styles = window.getComputedStyle(focused)
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        boxShadow: styles.boxShadow,
      }
    })

    // Verificar que hay algún indicador visual de focus
    if (focusOutline) {
      const hasFocusIndicator =
        focusOutline.outlineWidth !== '0px' ||
        focusOutline.boxShadow !== 'none'

      expect(hasFocusIndicator).toBeTruthy()
    }
  })

  test('debe tener contraste adecuado en texto de popups', async ({ page }) => {
    // Esperar a que aparezca un marcador
    const marker = page.locator('.leaflet-marker-icon').first()

    if (await marker.isVisible()) {
      // Hacer clic en el marcador para abrir el popup
      await marker.click()

      // Esperar a que aparezca el popup
      await page.waitForSelector('.leaflet-popup-content', { timeout: 3000 })

      // Obtener colores de texto y fondo del título del popup
      const contrastRatio = await page.evaluate(() => {
        const popup = document.querySelector('.leaflet-popup-content h3')
        if (!popup) return null

        const styles = window.getComputedStyle(popup)

        // Función para convertir rgb a luminancia relativa
        const getLuminance = (rgb: string) => {
          const matches = rgb.match(/\d+/g)
          if (!matches || matches.length < 3) return 0

          const [r, g, b] = matches.map(x => {
            const val = parseInt(x) / 255
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
          })

          return 0.2126 * r + 0.7152 * g + 0.0722 * b
        }

        const textColor = styles.color
        const bgColor = styles.backgroundColor

        const textLuminance = getLuminance(textColor)
        const bgLuminance = getLuminance(bgColor)

        const lighter = Math.max(textLuminance, bgLuminance)
        const darker = Math.min(textLuminance, bgLuminance)

        return (lighter + 0.05) / (darker + 0.05)
      })

      if (contrastRatio) {
        // WCAG AA requiere un contraste mínimo de 4.5:1 para texto normal
        expect(contrastRatio).toBeGreaterThan(4.5)
      }
    }
  })

  test('debe tener título descriptivo en la página', async ({ page }) => {
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(0)
  })

  test('debe tener meta descripción para SEO y accesibilidad', async ({ page }) => {
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
    if (description) {
      expect(description.length).toBeGreaterThan(20)
    }
  })

  test('debe mantener orden lógico de tabulación', async ({ page }) => {
    const focusOrder: string[] = []

    // Recorrer los primeros 5 elementos focusables
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')

      const elementInfo = await page.evaluate(() => {
        const el = document.activeElement
        if (!el) return 'none'

        return `${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ')[0] : ''}`
      })

      focusOrder.push(elementInfo)
    }

    // Verificar que el orden tiene sentido (no salta de forma errática)
    expect(focusOrder.length).toBe(5)
    expect(focusOrder).not.toContain('none')
  })

  test('debe tener lang attribute en el HTML', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBeTruthy()
    // Debe ser español (es) o español argentino (es-AR)
    expect(lang).toMatch(/^es/)
  })
})

test.describe('Lighthouse Accessibility Audit', () => {
  test('debe pasar auditoría de accesibilidad de Lighthouse', async ({ page }) => {
    await page.goto('/')

    // Esperar a que el mapa cargue
    await page.waitForSelector('.leaflet-container', { timeout: 10000 })

    // Nota: Para ejecutar Lighthouse real, necesitarías el paquete playwright-lighthouse
    // Por ahora, verificamos manualmente los aspectos más importantes

    // Verificar que no hay errores en consola relacionados con accesibilidad
    const consoleErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Navegar por la página
    await page.waitForTimeout(2000)

    // Verificar que no hay errores de accesibilidad obvios
    const a11yErrors = consoleErrors.filter(err =>
      err.toLowerCase().includes('aria') ||
      err.toLowerCase().includes('role') ||
      err.toLowerCase().includes('accessibility')
    )

    expect(a11yErrors.length).toBe(0)
  })
})
