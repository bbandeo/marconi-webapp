# Reporte de Accesibilidad - Mapa Interactivo de Propiedades

## Resumen Ejecutivo

Este documento describe las pruebas de accesibilidad implementadas para el mapa interactivo de propiedades, asegurando el cumplimiento con los estándares **WCAG 2.1 Nivel AA**.

## Estándares de Referencia

- **WCAG 2.1 Nivel AA**: Web Content Accessibility Guidelines
- **ARIA 1.2**: Accessible Rich Internet Applications
- **Sección 508**: Estándares de accesibilidad del gobierno de EE.UU.

## Tests Implementados

### 1. Atributos ARIA

✅ **Test**: `debe tener atributos ARIA correctos en el contenedor del mapa`

**Verificaciones**:
- Existencia de `role="region"` en el contenedor del mapa
- Presencia de `aria-label` descriptivo
- Validación de `aria-describedby` si está presente

**Cumplimiento**: WCAG 2.1 - 4.1.2 Name, Role, Value

---

### 2. Navegación con Teclado

✅ **Test**: `debe permitir navegación con teclado a los controles de zoom`

**Verificaciones**:
- Controles de zoom son focusables (no tienen `tabindex="-1"`)
- Los elementos reciben focus al presionar Tab
- Orden lógico de tabulación

✅ **Test**: `debe permitir activar controles de zoom con Enter`

**Verificaciones**:
- Funcionalidad completa con teclado (Enter/Space)
- No requiere mouse para interacciones básicas

**Cumplimiento**: WCAG 2.1 - 2.1.1 Keyboard, 2.1.3 Keyboard (No Exception)

---

### 3. Texto Alternativo

✅ **Test**: `debe tener texto alternativo o aria-label en marcadores`

**Verificaciones**:
- Marcadores tienen `alt`, `title` o `aria-label`
- Contenido no textual es accesible

**Cumplimiento**: WCAG 2.1 - 1.1.1 Non-text Content

---

### 4. Focus Visible

✅ **Test**: `debe mostrar focus visible en elementos interactivos`

**Verificaciones**:
- Elementos con focus muestran indicador visual
- Uso de `outline` o `box-shadow` para indicar focus
- Cumplimiento con 2.4.7 Focus Visible

**Cumplimiento**: WCAG 2.1 - 2.4.7 Focus Visible

---

### 5. Contraste de Color

✅ **Test**: `debe tener contraste adecuado en texto de popups`

**Verificaciones**:
- Ratio de contraste mínimo 4.5:1 para texto normal
- Ratio de contraste mínimo 3:1 para texto grande (18pt+)
- Cálculo automático de luminancia relativa

**Cumplimiento**: WCAG 2.1 - 1.4.3 Contrast (Minimum)

---

### 6. Estructura Semántica

✅ **Test**: `debe tener título descriptivo en la página`

**Verificaciones**:
- Presencia de `<title>` significativo
- Longitud adecuada del título

✅ **Test**: `debe tener meta descripción para SEO y accesibilidad`

**Verificaciones**:
- Presencia de meta descripción
- Longitud mínima de 20 caracteres

**Cumplimiento**: WCAG 2.1 - 2.4.2 Page Titled

---

### 7. Orden de Tabulación

✅ **Test**: `debe mantener orden lógico de tabulación`

**Verificaciones**:
- Secuencia lógica de navegación
- Sin saltos erráticos entre elementos
- Mantiene coherencia visual y lógica

**Cumplimiento**: WCAG 2.1 - 2.4.3 Focus Order

---

### 8. Idioma del Documento

✅ **Test**: `debe tener lang attribute en el HTML`

**Verificaciones**:
- Atributo `lang` presente en `<html>`
- Idioma correcto: `es` o `es-AR`

**Cumplimiento**: WCAG 2.1 - 3.1.1 Language of Page

---

### 9. Auditoría de Lighthouse

✅ **Test**: `debe pasar auditoría de accesibilidad de Lighthouse`

**Verificaciones**:
- No hay errores de consola relacionados con accesibilidad
- No hay problemas con ARIA
- No hay problemas con roles

**Cumplimiento**: Multiple WCAG 2.1 guidelines

---

## Cómo Ejecutar los Tests

### Tests de Accesibilidad Completos

```bash
npm run test:a11y
```

### Tests con Interfaz Visual

```bash
npm run test:a11y:headed
```

### Tests en Modo Debug

```bash
npm run test:a11y:debug
```

---

## Resultados Esperados

### Criterios de Éxito

- ✅ Todos los tests deben pasar
- ✅ Sin errores de accesibilidad en consola
- ✅ Contraste de color mínimo 4.5:1
- ✅ Navegación 100% con teclado
- ✅ Compatibilidad con screen readers

### Navegadores Probados

- ✅ Chrome/Chromium (Desktop)
- ✅ Chrome Mobile (Pixel 5)
- ✅ Safari (iPad Pro)

---

## Mejoras Futuras

### Corto Plazo
- [ ] Integrar `@axe-core/playwright` para auditoría automática
- [ ] Agregar tests con screen readers reales (NVDA, JAWS)
- [ ] Implementar tests de contraste en modo oscuro

### Mediano Plazo
- [ ] Certificación WCAG 2.1 AAA (más estricto)
- [ ] Tests de accesibilidad en modo offline
- [ ] Validación con usuarios reales con discapacidades

---

## Recursos Adicionales

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## Contacto

Para preguntas sobre accesibilidad, contactar al equipo de desarrollo.

**Última actualización**: 2025-01-XX

🤖 **Generado con [Claude Code](https://claude.com/claude-code)**
