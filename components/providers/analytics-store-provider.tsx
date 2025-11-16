"use client"

// =====================================================================================
// MARCONI INMOBILIARIA - ANALYTICS STORE PROVIDER
// =====================================================================================
// Provider para el store de analytics con inicialización y estado reactivo
// Incluye DevTools en desarrollo y persistencia automática
// =====================================================================================

import { useEffect, useState } from 'react'
import { useAnalyticsStore } from '@/stores/analytics-store'

interface AnalyticsStoreProviderProps {
  children: React.ReactNode
}

export function AnalyticsStoreProvider({ children }: AnalyticsStoreProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  // Ensure the store is hydrated before rendering children
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Don't render until hydrated to prevent SSR mismatches
  if (!isHydrated) {
    return null
  }

  return <>{children}</>
}

// =====================================================================================
// STORE INITIALIZATION HOOK
// =====================================================================================

export function useStoreInitialization() {
  const store = useAnalyticsStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize store with any required setup
    const initializeStore = async () => {
      try {
        // Load user preferences from server if needed
        // This could be extended to sync with backend

        // Mark as initialized
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize analytics store:', error)
        setIsInitialized(true) // Still mark as initialized to prevent blocking
      }
    }

    initializeStore()
  }, [])

  return { isInitialized, store }
}

// =====================================================================================
// STORE PERSISTENCE UTILITIES
// =====================================================================================

export function useStorePersistence() {
  const store = useAnalyticsStore()

  const saveToCloud = async () => {
    try {
      const exportData = store.exportPreferences()

      // Here you could implement server-side preferences sync
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: exportData }),
      })

      if (!response.ok) {
        throw new Error('Failed to sync preferences to server')
      }

      return true
    } catch (error) {
      console.error('Failed to save preferences to cloud:', error)
      return false
    }
  }

  const loadFromCloud = async () => {
    try {
      const response = await fetch('/api/user/preferences')

      if (!response.ok) {
        throw new Error('Failed to load preferences from server')
      }

      const data = await response.json()

      if (data.preferences) {
        store.importPreferences(data.preferences)
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to load preferences from cloud:', error)
      return false
    }
  }

  return {
    saveToCloud,
    loadFromCloud,
  }
}

export default AnalyticsStoreProvider