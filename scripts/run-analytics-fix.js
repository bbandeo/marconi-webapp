// =====================================================================================
// SCRIPT PARA EJECUTAR MIGRACIÓN DE ANALYTICS
// =====================================================================================
// Ejecuta la migración SQL para hacer page_url nullable
// =====================================================================================

const { createClient } = require('@supabase/supabase-js')

async function runMigration() {
  // Leer archivo .env manualmente
  const fs = require('fs')
  const envContent = fs.readFileSync('.env', 'utf-8')
  const envVars = {}
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  })

  // Crear cliente de Supabase con service_role key
  const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  console.log('🔄 Ejecutando migración de analytics...')

  try {
    // Ejecutar la migración SQL directamente
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE analytics_property_views ALTER COLUMN page_url DROP NOT NULL;'
    })

    if (error) {
      // Si no existe la función exec_sql, intentar con SQL directo
      console.log('⚠️  La función exec_sql no existe. Instrucciones manuales:')
      console.log('\n1. Ve a: https://uutffduomvmyuqmeqjbw.supabase.co/project/uutffduomvmyuqmeqjbw/editor')
      console.log('2. Ejecuta el siguiente SQL en el Editor SQL:\n')
      console.log('ALTER TABLE analytics_property_views ALTER COLUMN page_url DROP NOT NULL;')
      console.log('\n3. Luego ejecuta para verificar:\n')
      console.log(`SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'analytics_property_views'
  AND column_name = 'page_url';`)

      process.exit(1)
    }

    console.log('✅ Migración ejecutada exitosamente')
    console.log('📊 Resultado:', data)

  } catch (err) {
    console.error('❌ Error ejecutando migración:', err)
    process.exit(1)
  }
}

runMigration()
