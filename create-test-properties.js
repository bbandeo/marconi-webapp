#!/usr/bin/env node

/**
 * CREAR PROPIEDADES DE PRUEBA PARA TESTING DE ANALYTICS
 */

const baseURL = 'http://localhost:3001';

async function createProperty(propertyData) {
  try {
    const response = await fetch(`${baseURL}/api/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData)
    });

    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

async function createTestProperties() {
  console.log('🏠 Creando propiedades de prueba para testing...\n');

  const properties = [
    {
      title: "Casa 3 dormitorios en centro",
      description: "Hermosa casa de 3 dormitorios ubicada en el centro de Reconquista, con patio y garaje.",
      price: 85000,
      currency: "USD",
      property_type: "casa",
      operation_type: "venta",
      bedrooms: 3,
      bathrooms: 2,
      area_m2: 120,
      address: "San Martín 456",
      neighborhood: "Centro",
      city: "Reconquista",
      province: "Santa Fe",
      latitude: -29.1456,
      longitude: -59.6492,
      images: [
        "https://via.placeholder.com/800x600/0066cc/ffffff?text=Casa+3+Dorm+Frente",
        "https://via.placeholder.com/800x600/009933/ffffff?text=Casa+3+Dorm+Living",
        "https://via.placeholder.com/800x600/cc6600/ffffff?text=Casa+3+Dorm+Cocina"
      ],
      features: ["Garaje", "Patio", "Parrilla", "Aire acondicionado"],
      featured: true,
      status: "available"
    },
    {
      title: "Departamento 2 ambientes frente al río",
      description: "Moderno departamento de 2 ambientes con vista al río Paraná, totalmente equipado.",
      price: 45000,
      currency: "USD",
      property_type: "departamento",
      operation_type: "venta",
      bedrooms: 1,
      bathrooms: 1,
      area_m2: 55,
      address: "Costanera Norte 789",
      neighborhood: "Costanera",
      city: "Reconquista",
      province: "Santa Fe",
      latitude: -29.1389,
      longitude: -59.6445,
      images: [
        "https://via.placeholder.com/800x600/6600cc/ffffff?text=Depto+2+Amb+Vista",
        "https://via.placeholder.com/800x600/cc0066/ffffff?text=Depto+2+Amb+Living",
        "https://via.placeholder.com/800x600/00cc66/ffffff?text=Depto+2+Amb+Balcon"
      ],
      features: ["Vista al río", "Balcón", "Amueblado", "Seguridad 24hs"],
      featured: false,
      status: "available"
    },
    {
      title: "Terreno 500m² zona comercial",
      description: "Excelente terreno para desarrollo comercial, ubicado en zona de alto tránsito.",
      price: 35000,
      currency: "USD",
      property_type: "terreno",
      operation_type: "venta",
      bedrooms: 0,
      bathrooms: 0,
      area_m2: 500,
      address: "Avenida Alberdi 1234",
      neighborhood: "Zona Norte",
      city: "Reconquista",
      province: "Santa Fe",
      latitude: -29.1234,
      longitude: -59.6578,
      images: [
        "https://via.placeholder.com/800x600/cc3300/ffffff?text=Terreno+500m2",
        "https://via.placeholder.com/800x600/339900/ffffff?text=Terreno+Esquina"
      ],
      features: ["Esquina", "Agua corriente", "Luz", "Gas natural"],
      featured: true,
      status: "available"
    }
  ];

  const createdProperties = [];

  for (let i = 0; i < properties.length; i++) {
    console.log(`Creando propiedad ${i + 1}: ${properties[i].title}`);

    const result = await createProperty(properties[i]);

    if (result.status === 200 || result.status === 201) {
      console.log(`✅ Propiedad ${i + 1} creada con ID: ${result.data.id}`);
      createdProperties.push(result.data);
    } else {
      console.log(`❌ Error creando propiedad ${i + 1}:`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Error: ${JSON.stringify(result.data || result.error)}`);
    }
  }

  console.log(`\n🎉 Proceso completado. ${createdProperties.length}/${properties.length} propiedades creadas.`);

  if (createdProperties.length > 0) {
    console.log('\n📋 Propiedades creadas:');
    createdProperties.forEach(prop => {
      console.log(`   - ID ${prop.id}: ${prop.title}`);
    });
  }

  return createdProperties;
}

// Verificar que fetch esté disponible
if (typeof fetch === 'undefined') {
  console.log('❌ Este script requiere Node.js 18+ con fetch nativo');
  process.exit(1);
}

createTestProperties().catch(console.error);