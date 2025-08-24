'use client'

import { useEffect } from 'react'
import { getAnalyticsClient } from '@/lib/analytics-client'

export default function AnalyticsInitializer() {
  useEffect(() => {
    // Inicializar cliente de analytics con logging habilitado solo en el cliente
    try {
      getAnalyticsClient({
        enableConsoleLogging: true
      })
      console.log('[Analytics] Client initialized successfully')
    } catch (error) {
      console.error('[Analytics] Failed to initialize client:', error)
    }
  }, [])

  // Este componente no renderiza nada visible
  return null
}