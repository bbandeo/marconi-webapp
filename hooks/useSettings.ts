// =============================================
// SETTINGS HOOK
// Hook personalizado para obtener configuraciones del sitio
// =============================================

import { useState, useEffect } from 'react'
import type { SiteSettings } from '@/types/settings'

/**
 * Hook para obtener y gestionar configuraciones del sitio
 * @returns {settings, loading, error, refetch}
 */
export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/settings')
      const data = await response.json()

      if (data.success) {
        setSettings(data.data)
      } else {
        throw new Error(data.error || 'Error al cargar configuraciones')
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings
  }
}

/**
 * Hook simplificado que solo devuelve las configuraciones
 * con valores por defecto si no están disponibles
 */
export function useSettingsWithDefaults() {
  const { settings, loading, error } = useSettings()

  const settingsWithDefaults = settings || {
    id: 'default',
    company_name: 'Inmobiliaria',
    company_description: 'Tu inmobiliaria de confianza',
    contact_email: '',
    contact_phone: '',
    address: '',
    meta_title: 'Inmobiliaria | Tu próximo hogar perfecto',
    meta_description: 'Encuentra tu hogar ideal',
    social_media: null,
    logo_url: null,
    logo_dark_url: null,
    favicon_url: null,
    brand_colors: {
      primary: '#f97316',
      secondary: '#1f2937'
    },
    contact_methods: {
      whatsapp_enabled: true,
      phone_enabled: true,
      email_enabled: true,
      contact_form_enabled: true
    },
    created_at: '',
    updated_at: ''
  } as SiteSettings

  return {
    settings: settingsWithDefaults,
    loading,
    error
  }
}