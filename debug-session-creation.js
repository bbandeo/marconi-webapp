#!/usr/bin/env node

/**
 * DEBUG CREACIÓN DE SESIONES DE ANALYTICS
 * Investiga por qué las sesiones no se están creando correctamente
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

async function debugSessionCreation() {
  console.log('🔍 DEBUG DE CREACIÓN DE SESIONES');
  console.log('===============================\n');

  // Test 1: Crear sesión y verificar qué devuelve
  console.log('📊 Paso 1: Creando sesión y analizando respuesta...');
  const sessionData = {
    ip_address: '192.168.1.100', // Agregar IP explícitamente
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
    utm_medium: 'debug',
    utm_campaign: 'test-session'
  };

  const sessionResult = await makeRequest('/api/analytics/session', 'POST', sessionData);

  console.log('📋 Respuesta de creación de sesión:');
  console.log(`   Status: ${sessionResult.status}`);
  console.log(`   Data: ${JSON.stringify(sessionResult.data, null, 2)}`);

  if (sessionResult.status !== 200 && sessionResult.status !== 201) {
    console.log('❌ Error creando sesión');
    return;
  }

  const sessionId = sessionResult.data.session_id;
  console.log(`✅ Session ID obtenido: ${sessionId}`);
  console.log(`   Tipo: ${typeof sessionId}`);
  console.log(`   Longitud: ${sessionId?.length}`);

  // Test 2: Verificar si la sesión realmente existe en la base de datos
  console.log('\n🔍 Paso 2: Verificando que la sesión existe en la base de datos...');

  // Crear endpoint temporal para verificar sesión
  const verifyResult = await makeRequest(`/api/analytics/session?session_id=${sessionId}`, 'GET');

  console.log('📋 Respuesta de verificación:');
  console.log(`   Status: ${verifyResult.status}`);
  console.log(`   Data: ${JSON.stringify(verifyResult.data, null, 2)}`);

  // Test 3: Intentar crear una interacción para confirmar que la sesión funciona
  console.log('\n👆 Paso 3: Probando interacción (debe funcionar)...');
  const interactionData = {
    session_id: sessionId,
    property_id: 38,
    event_type: 'debug_test',
    event_target: 'debug-element',
    page_url: '/debug-page'
  };

  const interactionResult = await makeRequest('/api/analytics/interaction', 'POST', interactionData);

  console.log('📋 Respuesta de interacción:');
  console.log(`   Status: ${interactionResult.status}`);
  console.log(`   Data: ${JSON.stringify(interactionResult.data, null, 2)}`);

  if (interactionResult.status === 200) {
    console.log('✅ Interacción exitosa - La sesión existe y funciona para interacciones');
  } else {
    console.log('❌ Interacción falló - Problema con la sesión');
    return;
  }

  // Test 4: Intentar vista de propiedad (este es el que falla)
  console.log('\n🏠 Paso 4: Probando vista de propiedad...');
  const viewData = {
    session_id: sessionId,
    property_id: 38,
    time_on_page: 30,
    page_url: '/propiedades/38'
  };

  const viewResult = await makeRequest('/api/analytics/property-view', 'POST', viewData);

  console.log('📋 Respuesta de vista de propiedad:');
  console.log(`   Status: ${viewResult.status}`);
  console.log(`   Data: ${JSON.stringify(viewResult.data, null, 2)}`);

  if (viewResult.status === 200) {
    console.log('✅ Vista de propiedad exitosa - Fix funcionando correctamente');
  } else {
    console.log('❌ Vista de propiedad falló');

    // Analizar el error específicamente
    const errorMsg = viewResult.data?.error || '';
    if (errorMsg.includes('Session not found')) {
      console.log('\n🔍 ANÁLISIS DETALLADO:');
      console.log('   - El error es "Session not found"');
      console.log('   - Esto significa que el fix está funcionando (no es foreign key constraint)');
      console.log('   - Pero la consulta SELECT no encuentra la sesión');
      console.log('   - Posibles causas:');
      console.log('     1. La sesión no se insertó realmente');
      console.log('     2. Hay un problema con el campo session_id vs id');
      console.log('     3. La consulta SELECT está mal formada');

      console.log('\n🔧 POSIBLES SOLUCIONES:');
      console.log('   1. Verificar que analytics_sessions.session_id existe');
      console.log('   2. Confirmar que el INSERT fue exitoso');
      console.log('   3. Revisar los logs del servidor para más detalles');
    }
  }

  // Test 5: Crear una nueva sesión específicamente para este test
  console.log('\n🆕 Paso 5: Creando segunda sesión para comparar...');
  const sessionData2 = {
    ...sessionData,
    utm_campaign: 'test-session-2',
    utm_content: 'second-test'
  };

  const sessionResult2 = await makeRequest('/api/analytics/session', 'POST', sessionData2);
  const sessionId2 = sessionResult2.data?.session_id;

  if (sessionId2) {
    console.log(`✅ Segunda sesión creada: ${sessionId2}`);

    const viewData2 = {
      session_id: sessionId2,
      property_id: 39,
      time_on_page: 45,
      page_url: '/propiedades/39'
    };

    const viewResult2 = await makeRequest('/api/analytics/property-view', 'POST', viewData2);

    console.log('📋 Segunda vista de propiedad:');
    console.log(`   Status: ${viewResult2.status}`);
    console.log(`   Data: ${JSON.stringify(viewResult2.data, null, 2)}`);

    if (viewResult2.status === 200) {
      console.log('✅ Segunda vista exitosa - El problema fue temporal');
    } else {
      console.log('❌ Segunda vista también falló - El problema es sistemático');
    }
  }

  console.log('\n📊 RESUMEN DEL DEBUG:');
  console.log('====================');
  console.log(`✅ Creación de sesiones: ${sessionResult.status === 200 ? 'FUNCIONA' : 'FALLA'}`);
  console.log(`${interactionResult.status === 200 ? '✅' : '❌'} Interacciones: ${interactionResult.status === 200 ? 'FUNCIONA' : 'FALLA'}`);
  console.log(`${viewResult.status === 200 ? '✅' : '❌'} Vistas de propiedades: ${viewResult.status === 200 ? 'FUNCIONA' : 'FALLA'}`);

  if (viewResult.status !== 200) {
    console.log('\n🎯 CONCLUSIÓN:');
    console.log('El problema parece estar en el mapeo entre session_id y el UUID real.');
    console.log('El fix temporal está funcionando pero hay un desajuste en los datos.');
  }
}

// Verificar que fetch esté disponible
if (typeof fetch === 'undefined') {
  console.log('❌ Este script requiere Node.js 18+ con fetch nativo');
  process.exit(1);
}

debugSessionCreation().catch(console.error);