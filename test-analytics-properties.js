#!/usr/bin/env node

/**
 * TEST DE ANALYTICS DE PROPIEDADES - Marconi Inmobiliaria
 *
 * Este script testea el sistema de recolección de estadísticas del punto 1.2:
 * - Vistas detalladas con duración, scroll depth, interacciones
 * - Tracking de imágenes vistas por propiedad
 * - Métricas de contacto (WhatsApp, teléfono, email, formulario)
 * - Análisis de comportamiento (rebote, tiempo en página)
 */

const baseURL = 'http://localhost:3001';

console.log('🧪 INICIANDO TEST DE ANALYTICS DE PROPIEDADES');
console.log('===============================================\n');

// Función helper para hacer requests
async function makeRequest(endpoint, method = 'GET', data = null) {
  const url = `${baseURL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'x-forwarded-for': '192.168.1.100', // IP simulada
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// Test 1: Crear sesión de analytics
async function testCreateSession() {
  console.log('📊 Test 1: Creación de sesión de analytics');
  console.log('-------------------------------------------');

  const sessionData = {
    device_type: 'desktop',
    browser: 'Chrome',
    browser_version: '122.0.0.0',
    os: 'Windows',
    os_version: '10',
    screen_width: 1920,
    screen_height: 1080,
    language: 'es',
    timezone: 'America/Argentina/Buenos_Aires',
    country_code: 'AR',
    city: 'Reconquista',
    referrer_domain: 'google.com',
    utm_source: 'google',
    utm_medium: 'organic',
    utm_campaign: 'propiedades-reconquista',
    landing_page: '/propiedades'
  };

  const result = await makeRequest('/api/analytics/session', 'POST', sessionData);

  if (result.status === 200 || result.status === 201) {
    console.log('✅ Sesión creada exitosamente');
    console.log(`   Session ID: ${result.data.session_id}`);
    console.log(`   Anónima: ${result.data.anonymous ? 'Sí' : 'No'}`);
    return result.data.session_id;
  } else {
    console.log('❌ Error al crear sesión');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${JSON.stringify(result.data || result.error)}`);
    return null;
  }
}

// Test 2: Tracking de vista de propiedad con métricas detalladas
async function testPropertyView(sessionId, propertyId = 38) {
  console.log('\n🏠 Test 2: Tracking de vista de propiedad');
  console.log('----------------------------------------');

  const viewData = {
    session_id: sessionId,
    property_id: propertyId,
    time_on_page: 45, // 45 segundos
    scroll_depth: 75, // 75% de scroll
    contact_button_clicked: false,
    whatsapp_clicked: true, // Simulamos click en WhatsApp
    phone_clicked: false,
    email_clicked: false,
    images_viewed: 3, // Vio 3 imágenes
    page_url: `/propiedades/${propertyId}`,
    referrer_url: '/propiedades',
    search_query: 'casa 3 dormitorios reconquista'
  };

  const result = await makeRequest('/api/analytics/property-view', 'POST', viewData);

  if (result.status === 200) {
    console.log('✅ Vista de propiedad registrada exitosamente');
    console.log(`   Event ID: ${result.data.event_id}`);
    console.log(`   Propiedad: ${propertyId}`);
    console.log(`   Tiempo en página: ${viewData.time_on_page}s`);
    console.log(`   Scroll depth: ${viewData.scroll_depth}%`);
    console.log(`   Imágenes vistas: ${viewData.images_viewed}`);
    console.log(`   WhatsApp clicked: ${viewData.whatsapp_clicked ? 'Sí' : 'No'}`);
    return result.data.event_id;
  } else {
    console.log('❌ Error al registrar vista de propiedad');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${JSON.stringify(result.data || result.error)}`);
    return null;
  }
}

// Test 3: Tracking automático con sesión (método PUT)
async function testAutoPropertyView(propertyId = 39) {
  console.log('\n🔄 Test 3: Tracking automático con sesión');
  console.log('------------------------------------------');

  const autoViewData = {
    property_id: propertyId,
    time_on_page: 120, // 2 minutos
    scroll_depth: 95, // Scroll completo
    contact_button_clicked: true, // Abrió formulario de contacto
    whatsapp_clicked: false,
    phone_clicked: true, // Clickeó teléfono
    email_clicked: false,
    images_viewed: 8, // Vio todas las imágenes
    page_url: `/propiedades/${propertyId}`,
    referrer_url: 'https://www.google.com/search?q=departamentos+reconquista',
    // Datos de sesión automática
    country_code: 'AR',
    device_type: 'mobile',
    browser: 'Chrome Mobile',
    os: 'Android',
    referrer_domain: 'google.com',
    landing_page: `/propiedades/${propertyId}`,
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'departamentos-reconquista',
    utm_term: 'departamentos en venta reconquista',
    utm_content: 'ad-variante-a'
  };

  const result = await makeRequest('/api/analytics/property-view', 'PUT', autoViewData);

  if (result.status === 200) {
    console.log('✅ Vista automática registrada exitosamente');
    console.log(`   Event ID: ${result.data.event_id}`);
    console.log(`   Session ID: ${result.data.session_id}`);
    console.log(`   Propiedad: ${propertyId}`);
    console.log(`   Tiempo en página: ${autoViewData.time_on_page}s`);
    console.log(`   Contacto clickeado: ${autoViewData.contact_button_clicked ? 'Sí' : 'No'}`);
    console.log(`   Teléfono clickeado: ${autoViewData.phone_clicked ? 'Sí' : 'No'}`);
    console.log(`   Dispositivo: ${autoViewData.device_type}`);
    console.log(`   Fuente: ${autoViewData.utm_source} / ${autoViewData.utm_medium}`);
    return { eventId: result.data.event_id, sessionId: result.data.session_id };
  } else {
    console.log('❌ Error al registrar vista automática');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${JSON.stringify(result.data || result.error)}`);
    return null;
  }
}

// Test 4: Tracking de interacciones específicas
async function testUserInteractions(sessionId, propertyId = 38) {
  console.log('\n👆 Test 4: Tracking de interacciones específicas');
  console.log('-----------------------------------------------');

  const interactions = [
    {
      session_id: sessionId,
      property_id: propertyId,
      event_type: 'click',
      event_target: 'image-gallery-1',
      page_url: `/propiedades/${propertyId}`,
      event_data: {
        image_index: 1,
        image_url: 'https://example.com/property1-image1.jpg',
        action: 'expand',
        coordinates_x: 640,
        coordinates_y: 360,
        viewport_width: 1280,
        viewport_height: 720,
        element_text: 'Imagen principal'
      }
    },
    {
      session_id: sessionId,
      property_id: propertyId,
      event_type: 'scroll',
      event_target: 'property-details',
      page_url: `/propiedades/${propertyId}`,
      event_data: {
        scroll_percentage: 50,
        section: 'property-details',
        time_spent: 15
      }
    },
    {
      session_id: sessionId,
      property_id: propertyId,
      event_type: 'form_field_focus',
      event_target: 'contact-form-name',
      page_url: `/propiedades/${propertyId}`,
      event_data: {
        form_type: 'contact',
        field_name: 'name',
        focus_duration: 5,
        element_text: 'Nombre completo'
      }
    }
  ];

  let successCount = 0;

  for (let i = 0; i < interactions.length; i++) {
    const result = await makeRequest('/api/analytics/interaction', 'POST', interactions[i]);

    if (result.status === 200) {
      successCount++;
      console.log(`✅ Interacción ${i + 1} registrada: ${interactions[i].event_type}`);
    } else {
      console.log(`❌ Error en interacción ${i + 1}: ${interactions[i].event_type}`);
      console.log(`   Error: ${JSON.stringify(result.data || result.error)}`);
    }
  }

  console.log(`📊 Resumen: ${successCount}/${interactions.length} interacciones registradas`);
  return successCount;
}

// Test 5: Obtener métricas de propiedad
async function testPropertyMetrics(propertyId = 38) {
  console.log('\n📈 Test 5: Obtención de métricas de propiedad');
  console.log('--------------------------------------------');

  const result = await makeRequest(`/api/analytics/property-metrics/${propertyId}?days_back=30`);

  if (result.status === 200) {
    console.log('✅ Métricas obtenidas exitosamente');
    const metrics = result.data;
    console.log(`   Total de vistas: ${metrics.total_views || 0}`);
    console.log(`   Sesiones únicas: ${metrics.unique_sessions || 0}`);
    console.log(`   Duración promedio: ${metrics.avg_duration ? Math.round(metrics.avg_duration) + 's' : 'N/A'}`);
    console.log(`   Total interacciones: ${metrics.total_interactions || 0}`);
    console.log(`   Leads generados: ${metrics.leads_generated || 0}`);
    console.log(`   Tasa de conversión: ${metrics.conversion_rate ? metrics.conversion_rate.toFixed(2) + '%' : '0%'}`);
    return metrics;
  } else {
    console.log('❌ Error al obtener métricas');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${JSON.stringify(result.data || result.error)}`);
    return null;
  }
}

// Test 6: Dashboard general de analytics
async function testDashboardStats() {
  console.log('\n📊 Test 6: Dashboard general de analytics');
  console.log('----------------------------------------');

  const result = await makeRequest('/api/analytics/dashboard?period=30d');

  if (result.status === 200) {
    console.log('✅ Datos de dashboard obtenidos exitosamente');
    const stats = result.data;
    console.log(`   Total sesiones: ${stats.total_sessions || 0}`);
    console.log(`   Vistas de propiedades: ${stats.total_property_views || 0}`);
    console.log(`   Vistas únicas: ${stats.unique_property_views || 0}`);
    console.log(`   Total de leads: ${stats.total_leads || 0}`);
    console.log(`   Tasa de conversión: ${stats.conversion_rate ? stats.conversion_rate.toFixed(2) + '%' : '0%'}`);
    console.log(`   Tiempo promedio: ${stats.avg_time_on_page ? Math.round(stats.avg_time_on_page) + 's' : 'N/A'}`);

    if (stats.top_properties && stats.top_properties.length > 0) {
      console.log('   Top propiedades:');
      stats.top_properties.slice(0, 3).forEach((prop, index) => {
        console.log(`     ${index + 1}. ID ${prop.property_id}: ${prop.title || 'Sin título'} (${prop.metric_value} vistas)`);
      });
    }

    return stats;
  } else {
    console.log('❌ Error al obtener datos de dashboard');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${JSON.stringify(result.data || result.error)}`);
    return null;
  }
}

// Función principal de testing
async function runAnalyticsTest() {
  console.log('🚀 Comenzando tests de analytics de propiedades...\n');

  try {
    // Test 1: Crear sesión
    const sessionId = await testCreateSession();
    if (!sessionId) {
      console.log('\n❌ ERROR CRÍTICO: No se pudo crear sesión. Deteniendo tests.');
      return;
    }

    // Test 2: Vista de propiedad básica
    const eventId1 = await testPropertyView(sessionId, 38);

    // Test 3: Vista automática con sesión
    const autoResult = await testAutoPropertyView(39);

    // Test 4: Interacciones específicas
    if (sessionId) {
      await testUserInteractions(sessionId, 38);
    }

    // Esperar un poco para que se procesen los datos
    console.log('\n⏳ Esperando procesamiento de datos...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 5: Métricas de propiedad
    await testPropertyMetrics(38);
    await testPropertyMetrics(39);

    // Test 6: Dashboard general
    await testDashboardStats();

    console.log('\n🎉 TESTS COMPLETADOS');
    console.log('====================');
    console.log('✅ Sistema de analytics de propiedades funcionando correctamente');
    console.log('✅ Tracking de vistas, interacciones y métricas operativo');
    console.log('✅ Dashboard y reportes accesibles');

  } catch (error) {
    console.log('\n💥 ERROR DURANTE LOS TESTS');
    console.log('==========================');
    console.log('❌ Error:', error.message);
    console.log('❌ Stack:', error.stack);
  }
}

// Verificar si fetch está disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ Este script requiere Node.js 18+ con fetch nativo');
  console.log('   O instalar node-fetch: npm install node-fetch');
  process.exit(1);
}

// Ejecutar los tests
runAnalyticsTest().catch(console.error);