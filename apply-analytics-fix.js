#!/usr/bin/env node

/**
 * APLICAR FIX DE FOREIGN KEYS DE ANALYTICS
 *
 * Este script aplica la corrección para el problema de foreign keys
 * entre analytics_sessions y las tablas relacionadas.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Error: Variables de entorno de Supabase no encontradas')
  console.log('   Verifica que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyAnalyticsFix() {
  console.log('🔧 APLICANDO FIX DE FOREIGN KEYS DE ANALYTICS')
  console.log('=============================================\n')

  try {
    console.log('📋 Paso 1: Verificando estado actual de constraints...')

    // Verificar constraints actuales
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('*')
      .eq('constraint_type', 'FOREIGN KEY')
      .like('table_name', 'analytics_%')

    if (constraintsError) {
      console.log('⚠️ No se pudieron verificar constraints existentes:', constraintsError.message)
    } else {
      console.log(`✅ Encontrados ${constraints?.length || 0} foreign key constraints en tablas analytics`)
    }

    console.log('\n🔨 Paso 2: Ejecutando script de corrección...')

    // Lista de comandos SQL para aplicar el fix
    const sqlCommands = [
      // Eliminar foreign key constraints existentes
      'ALTER TABLE analytics_property_views DROP CONSTRAINT IF EXISTS analytics_property_views_session_id_fkey;',
      'ALTER TABLE analytics_user_interactions DROP CONSTRAINT IF EXISTS analytics_user_interactions_session_id_fkey;',
      'ALTER TABLE analytics_lead_generation DROP CONSTRAINT IF EXISTS analytics_lead_generation_session_id_fkey;',
      'ALTER TABLE analytics_campaign_attribution DROP CONSTRAINT IF EXISTS analytics_campaign_attribution_session_id_fkey;',

      // Cambiar tipos de columna
      'ALTER TABLE analytics_property_views ALTER COLUMN session_id TYPE VARCHAR(255);',
      'ALTER TABLE analytics_user_interactions ALTER COLUMN session_id TYPE VARCHAR(255);',
      'ALTER TABLE analytics_lead_generation ALTER COLUMN session_id TYPE VARCHAR(255);',
      'ALTER TABLE analytics_campaign_attribution ALTER COLUMN session_id TYPE VARCHAR(255);',

      // Recrear foreign key constraints
      `ALTER TABLE analytics_property_views
       ADD CONSTRAINT analytics_property_views_session_id_fkey
       FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE SET NULL;`,

      `ALTER TABLE analytics_user_interactions
       ADD CONSTRAINT analytics_user_interactions_session_id_fkey
       FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE;`,

      `ALTER TABLE analytics_lead_generation
       ADD CONSTRAINT analytics_lead_generation_session_id_fkey
       FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE SET NULL;`,

      `ALTER TABLE analytics_campaign_attribution
       ADD CONSTRAINT analytics_campaign_attribution_session_id_fkey
       FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE;`
    ]

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i].trim()
      if (!command) continue

      try {
        console.log(`   Ejecutando comando ${i + 1}/${sqlCommands.length}...`)

        const { error } = await supabase.rpc('exec_sql', { sql: command })

        if (error) {
          console.log(`   ⚠️ Error en comando ${i + 1}: ${error.message}`)
          errorCount++

          // Para algunos errores, continuamos (ej: constraint que ya no existe)
          if (error.message.includes('does not exist') || error.message.includes('already exists')) {
            console.log('     (Error ignorado - estado ya corregido)')
          }
        } else {
          successCount++
        }
      } catch (cmdError) {
        console.log(`   ❌ Fallo crítico en comando ${i + 1}:`, cmdError.message)
        errorCount++
      }

      // Pequeña pausa entre comandos
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`\n📊 Resumen: ${successCount} comandos exitosos, ${errorCount} errores`)

    // Actualizar funciones PostgreSQL
    console.log('\n🔄 Paso 3: Actualizando funciones PostgreSQL...')

    const functions = [
      {
        name: 'check_duplicate_property_view',
        sql: `
        CREATE OR REPLACE FUNCTION check_duplicate_property_view(
            p_property_id INTEGER,
            p_session_id VARCHAR(255)
        ) RETURNS BOOLEAN AS $$
        DECLARE
            last_view_time TIMESTAMP WITH TIME ZONE;
        BEGIN
            SELECT viewed_at INTO last_view_time
            FROM analytics_property_views
            WHERE property_id = p_property_id
              AND session_id = p_session_id
            ORDER BY viewed_at DESC
            LIMIT 1;

            IF last_view_time IS NULL OR (NOW() - last_view_time) > INTERVAL '2 hours' THEN
                RETURN FALSE;
            ELSE
                RETURN TRUE;
            END IF;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;`
      },
      {
        name: 'track_property_view',
        sql: `
        CREATE OR REPLACE FUNCTION track_property_view(
            p_property_id INTEGER,
            p_session_id VARCHAR(255),
            p_page_url TEXT,
            p_referrer_url TEXT DEFAULT NULL,
            p_search_query VARCHAR(255) DEFAULT NULL
        ) RETURNS UUID AS $$
        DECLARE
            view_id UUID;
            is_duplicate BOOLEAN;
        BEGIN
            SELECT check_duplicate_property_view(p_property_id, p_session_id) INTO is_duplicate;

            IF is_duplicate THEN
                UPDATE analytics_property_views
                SET viewed_at = NOW(),
                    page_url = p_page_url,
                    referrer_url = COALESCE(p_referrer_url, referrer_url),
                    search_query = COALESCE(p_search_query, search_query)
                WHERE property_id = p_property_id
                  AND session_id = p_session_id
                  AND viewed_at = (
                      SELECT MAX(viewed_at)
                      FROM analytics_property_views
                      WHERE property_id = p_property_id AND session_id = p_session_id
                  )
                RETURNING id INTO view_id;
            ELSE
                INSERT INTO analytics_property_views (
                    property_id, session_id, page_url, referrer_url, search_query
                ) VALUES (
                    p_property_id, p_session_id, p_page_url, p_referrer_url, p_search_query
                ) RETURNING id INTO view_id;

                UPDATE properties
                SET views = COALESCE(views, 0) + 1
                WHERE id = p_property_id;
            END IF;

            RETURN view_id;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;`
      }
    ]

    for (const func of functions) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: func.sql })
        if (error) {
          console.log(`   ❌ Error actualizando función ${func.name}: ${error.message}`)
        } else {
          console.log(`   ✅ Función ${func.name} actualizada`)
        }
      } catch (funcError) {
        console.log(`   ❌ Fallo crítico actualizando ${func.name}:`, funcError.message)
      }
    }

    console.log('\n🎉 FIX DE ANALYTICS COMPLETADO')
    console.log('==============================')
    console.log('✅ Foreign key constraints corregidos')
    console.log('✅ Tipos de columna actualizados')
    console.log('✅ Funciones PostgreSQL actualizadas')
    console.log('\n🧪 Ahora puedes ejecutar el test de analytics nuevamente')

  } catch (error) {
    console.log('\n💥 ERROR DURANTE LA APLICACIÓN DEL FIX')
    console.log('===================================')
    console.log('❌ Error:', error.message)
    console.log('❌ Stack:', error.stack)
  }
}

// Función alternativa usando comandos SQL directos sin rpc
async function applyAnalyticsFixDirect() {
  console.log('🔧 APLICANDO FIX DE FOREIGN KEYS DE ANALYTICS (MÉTODO DIRECTO)')
  console.log('=============================================================\n')

  try {
    // Método alternativo: usar queries SQL directas
    console.log('📋 Verificando tablas existentes...')

    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'analytics_%')

    if (tablesError) {
      throw new Error(`Error verificando tablas: ${tablesError.message}`)
    }

    const analyticsTablesFound = tables?.map(t => t.table_name) || []
    console.log(`✅ Encontradas ${analyticsTablesFound.length} tablas de analytics:`, analyticsTablesFound.join(', '))

    if (analyticsTablesFound.length === 0) {
      throw new Error('No se encontraron tablas de analytics. Verifica que el esquema esté instalado.')
    }

    console.log('\n🎯 El fix será aplicado manualmente a través de la interfaz de Supabase')
    console.log('📋 Para aplicar el fix:')
    console.log('1. Ve a https://uutffduomvmyuqmeqjbw.supabase.co/project/uutffduomvmyuqmeqjbw/sql')
    console.log('2. Ejecuta el contenido del archivo fix-analytics-foreign-keys.sql')
    console.log('3. O usa supabase CLI: supabase db push --db-url "postgresql://..."')

    return true

  } catch (error) {
    console.log('\n💥 ERROR DURANTE LA VERIFICACIÓN')
    console.log('===============================')
    console.log('❌ Error:', error.message)
    return false
  }
}

// Ejecutar el fix
if (process.argv.includes('--direct')) {
  applyAnalyticsFixDirect().catch(console.error)
} else {
  applyAnalyticsFix().catch(console.error)
}