#!/usr/bin/env node

/**
 * DEBUG DEL PROBLEMA DE SESIONES EN ANALYTICS
 */

const baseURL = 'http://localhost:3001';

async function makeRequest(endpoint, method = 'GET', data = null) {
  const url = `${baseURL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'x-forwarded-for': '192.168.1.100',
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

async function debugSessionIssue() {
  console.log('🔍 DEBUGGING PROBLEMA DE SESIONES DE ANALYTICS');
  console.log('==============================================\n');

  // 1. Crear sesión
  console.log('📊 Paso 1: Creando sesión...');
  const sessionData = {
    device_type: 'desktop',
    browser: 'Chrome',
    os: 'Windows',
    country_code: 'AR',
    referrer_domain: 'google.com',
    utm_source: 'test',
    utm_medium: 'debug'
  };

  const sessionResult = await makeRequest('/api/analytics/session', 'POST', sessionData);

  if (sessionResult.status !== 200 && sessionResult.status !== 201) {
    console.log('❌ No se pudo crear sesión');
    console.log(`   Error: ${JSON.stringify(sessionResult.data || sessionResult.error)}`);
    return;
  }

  const sessionId = sessionResult.data.session_id;
  console.log(`✅ Sesión creada: ${sessionId}`);
  console.log(`   Tipo: ${typeof sessionId}`);
  console.log(`   Longitud: ${sessionId.length}`);
  console.log(`   Formato UUID: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)}`);

  // 2. Intentar interacción (esto funciona)
  console.log('\n👆 Paso 2: Probando interacción (debe funcionar)...');
  const interactionData = {
    session_id: sessionId,
    property_id: 38,
    event_type: 'test_debug',
    event_target: 'debug-button',
    page_url: '/debug'
  };

  const interactionResult = await makeRequest('/api/analytics/interaction', 'POST', interactionData);

  if (interactionResult.status === 200) {
    console.log('✅ Interacción registrada correctamente');
  } else {
    console.log('❌ Error en interacción');
    console.log(`   Error: ${JSON.stringify(interactionResult.data || interactionResult.error)}`);
  }

  // 3. Intentar vista de propiedad (esto falla)
  console.log('\n🏠 Paso 3: Probando vista de propiedad (puede fallar)...');
  const viewData = {
    session_id: sessionId,
    property_id: 38,
    time_on_page: 30,
    page_url: '/propiedades/38'
  };

  const viewResult = await makeRequest('/api/analytics/property-view', 'POST', viewData);

  if (viewResult.status === 200) {
    console.log('✅ Vista de propiedad registrada correctamente');
  } else {
    console.log('❌ Error en vista de propiedad');
    console.log(`   Error: ${JSON.stringify(viewResult.data || viewResult.error)}`);

    // Analizar el error específico
    const errorMsg = viewResult.data?.error || viewResult.error || '';
    if (errorMsg.includes('foreign key constraint')) {
      console.log('\n🔍 ANÁLISIS DEL ERROR:');
      console.log('   - El problema es de foreign key constraint');
      console.log('   - La sesión existe pero no se puede referenciar');
      console.log('   - Posibles causas:');
      console.log('     1. Session ID format mismatch (string vs UUID)');
      console.log('     2. Session no se insertó realmente en analytics_sessions');
      console.log('     3. Función PostgreSQL track_property_view tiene problema');
    }
  }

  // 4. Probar el método PUT (automático)
  console.log('\n🔄 Paso 4: Probando vista automática (método PUT)...');
  const autoViewData = {
    property_id: 39,
    time_on_page: 60,
    page_url: '/propiedades/39',
    country_code: 'AR',
    device_type: 'mobile',
    browser: 'Chrome',
    os: 'Android'
  };

  const autoResult = await makeRequest('/api/analytics/property-view', 'PUT', autoViewData);

  if (autoResult.status === 200) {
    console.log('✅ Vista automática registrada correctamente');
    console.log(`   Event ID: ${autoResult.data.event_id}`);
    console.log(`   Session ID: ${autoResult.data.session_id}`);
  } else {
    console.log('❌ Error en vista automática');
    console.log(`   Error: ${JSON.stringify(autoResult.data || autoResult.error)}`);
  }

  console.log('\n📋 RESUMEN DEL DEBUG:');
  console.log('=====================');
  console.log(`✅ Creación de sesión: ${sessionResult.status === 200 ? 'OK' : 'FALLO'}`);
  console.log(`✅ Interacciones: ${interactionResult.status === 200 ? 'OK' : 'FALLO'}`);
  console.log(`${viewResult.status === 200 ? '✅' : '❌'} Vistas POST: ${viewResult.status === 200 ? 'OK' : 'FALLO'}`);
  console.log(`${autoResult.status === 200 ? '✅' : '❌'} Vistas PUT: ${autoResult.status === 200 ? 'OK' : 'FALLO'}`);

  if (viewResult.status !== 200 || autoResult.status !== 200) {
    console.log('\n🔧 RECOMENDACIONES:');
    console.log('1. Verificar que la función PostgreSQL track_property_view está correctamente implementada');
    console.log('2. Confirmar que analytics_sessions tiene los constraints correctos');
    console.log('3. Validar que el session_id se está pasando en el formato correcto (UUID)');
    console.log('4. Revisar los logs del servidor para más detalles');
  }
}

// Verificar que fetch esté disponible
if (typeof fetch === 'undefined') {
  console.log('❌ Este script requiere Node.js 18+ con fetch nativo');
  process.exit(1);
}

debugSessionIssue().catch(console.error);