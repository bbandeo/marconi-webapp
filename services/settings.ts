// =============================================
// SETTINGS SERVICE
// Gestión de configuraciones generales del sitio
// =============================================

import { supabase } from '@/lib/supabase'
import {
  SiteSettings,
  SiteSettingsInput,
  SiteSettingsResponse,
  SiteSettingsUpdateResponse,
  DEFAULT_SITE_SETTINGS
} from '@/types/settings'
import { z } from 'zod'

// =============================================
// VALIDATION SCHEMAS
// =============================================

const SocialMediaSchema = z.object({
  facebook: z.string().url().optional().nullable(),
  instagram: z.string().url().optional().nullable(),
  linkedin: z.string().url().optional().nullable(),
  youtube: z.string().url().optional().nullable(),
  twitter: z.string().url().optional().nullable(),
})

const BrandColorsSchema = z.object({
  primary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Debe ser un color hexadecimal válido'),
  secondary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Debe ser un color hexadecimal válido'),
})

const ContactMethodsSchema = z.object({
  whatsapp_enabled: z.boolean(),
  phone_enabled: z.boolean(),
  email_enabled: z.boolean(),
  contact_form_enabled: z.boolean(),
})

const SiteSettingsInputSchema = z.object({
  company_name: z.string().min(1, 'Nombre de empresa requerido').max(255),
  company_description: z.string().optional().nullable(),
  contact_email: z.string().email('Email inválido').max(255),
  contact_phone: z.string().min(1, 'Teléfono requerido').max(50),
  whatsapp_number: z.string().optional().nullable(),
  address: z.string().min(1, 'Dirección requerida'),
  website_url: z.string().url().optional().nullable(),
  social_media: SocialMediaSchema.optional(),
  logo_url: z.string().url().optional().nullable(),
  logo_dark_url: z.string().url().optional().nullable(),
  favicon_url: z.string().url().optional().nullable(),
  brand_colors: BrandColorsSchema.optional(),
  meta_title: z.string().min(1, 'Meta title requerido').max(255),
  meta_description: z.string().min(1, 'Meta description requerida').max(500),
  meta_keywords: z.string().optional().nullable(),
  google_analytics_id: z.string().optional().nullable(),
  google_tag_manager_id: z.string().optional().nullable(),
  contact_methods: ContactMethodsSchema.optional(),
  settings_data: z.record(z.any()).optional(),
})

// =============================================
// SETTINGS SERVICE CLASS
// =============================================

export class SettingsService {

  // =============================================
  // READ OPERATIONS
  // =============================================

  /**
   * Obtiene las configuraciones del sitio
   * @returns Promise<SiteSettings | null>
   */
  static async getSettings(): Promise<SiteSettings | null> {
    try {
      // Consulta directa a la tabla site_settings
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single()

      if (error) {
        // Si no existe la tabla o no hay datos, devolver null
        if (error.code === 'PGRST116' || error.code === '42P01') {
          return null
        }
        console.error('Error fetching settings:', error)
        throw new Error(`Error fetching settings: ${error.message}`)
      }

      return data as SiteSettings
    } catch (error) {
      console.error('Settings service error:', error)
      throw error
    }
  }

  /**
   * Obtiene configuraciones con fallbacks por defecto
   * @returns Promise<SiteSettings>
   */
  static async getSettingsWithDefaults(): Promise<SiteSettings> {
    try {
      const settings = await this.getSettings()

      if (!settings) {
        // Si no existen configuraciones, crear las por defecto
        console.warn('No settings found, creating default settings...')
        return await this.createDefaultSettings()
      }

      return settings
    } catch (error) {
      console.error('Error getting settings with defaults:', error)

      // En caso de error completo, devolver configuraciones por defecto hardcoded
      return {
        id: 'fallback',
        ...DEFAULT_SITE_SETTINGS,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as SiteSettings
    }
  }

  /**
   * Verifica si existen configuraciones en la base de datos
   * @returns Promise<boolean>
   */
  static async settingsExist(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)

      if (error) {
        console.error('Error checking settings existence:', error)
        return false
      }

      return data && data.length > 0
    } catch (error) {
      console.error('Settings existence check failed:', error)
      return false
    }
  }

  // =============================================
  // WRITE OPERATIONS
  // =============================================

  /**
   * Actualiza las configuraciones del sitio
   * @param updates - Datos a actualizar
   * @returns Promise<SiteSettings>
   */
  static async updateSettings(updates: SiteSettingsInput): Promise<SiteSettings> {
    try {
      // Validar datos de entrada
      const validatedData = SiteSettingsInputSchema.partial().parse(updates)

      // Verificar si existen configuraciones
      const exists = await this.settingsExist()

      if (!exists) {
        // Si no existen, crear configuraciones por defecto primero
        await this.createDefaultSettings()
      }

      // Actualizar configuraciones
      const { data, error } = await supabase
        .from('site_settings')
        .update(validatedData)
        .select()
        .single()

      if (error) {
        throw new Error(`Error updating settings: ${error.message}`)
      }

      return data as SiteSettings
    } catch (error) {
      console.error('Settings update failed:', error)
      throw error
    }
  }

  /**
   * Crea configuraciones por defecto
   * @returns Promise<SiteSettings>
   */
  static async createDefaultSettings(): Promise<SiteSettings> {
    try {
      const defaultSettings = {
        ...DEFAULT_SITE_SETTINGS,
        settings_data: {}
      }

      const { data, error } = await supabase
        .from('site_settings')
        .insert([defaultSettings])
        .select()
        .single()

      if (error) {
        throw new Error(`Error creating default settings: ${error.message}`)
      }

      return data as SiteSettings
    } catch (error) {
      console.error('Default settings creation failed:', error)
      throw error
    }
  }

  // =============================================
  // SPECIALIZED OPERATIONS
  // =============================================

  /**
   * Actualiza solo la información de la empresa
   * @param companyData - Datos de la empresa
   */
  static async updateCompanyInfo(companyData: {
    company_name?: string
    company_description?: string
    contact_email?: string
    contact_phone?: string
    whatsapp_number?: string
    address?: string
    website_url?: string
  }): Promise<SiteSettings> {
    return await this.updateSettings(companyData)
  }

  /**
   * Actualiza solo las redes sociales
   * @param socialMedia - Enlaces de redes sociales
   */
  static async updateSocialMedia(socialMedia: {
    facebook?: string | null
    instagram?: string | null
    linkedin?: string | null
    youtube?: string | null
    twitter?: string | null
  }): Promise<SiteSettings> {
    return await this.updateSettings({ social_media: socialMedia })
  }

  /**
   * Actualiza solo los colores de marca
   * @param colors - Colores de marca
   */
  static async updateBrandColors(colors: {
    primary?: string
    secondary?: string
  }): Promise<SiteSettings> {
    return await this.updateSettings({ brand_colors: colors })
  }

  /**
   * Actualiza configuración de SEO
   * @param seoData - Datos de SEO
   */
  static async updateSEO(seoData: {
    meta_title?: string
    meta_description?: string
    meta_keywords?: string
    google_analytics_id?: string
    google_tag_manager_id?: string
  }): Promise<SiteSettings> {
    return await this.updateSettings(seoData)
  }

  /**
   * Actualiza métodos de contacto habilitados
   * @param contactMethods - Métodos de contacto
   */
  static async updateContactMethods(contactMethods: {
    whatsapp_enabled?: boolean
    phone_enabled?: boolean
    email_enabled?: boolean
    contact_form_enabled?: boolean
  }): Promise<SiteSettings> {
    return await this.updateSettings({ contact_methods: contactMethods })
  }

  /**
   * Actualiza URLs de branding (logos, favicon)
   * @param brandingData - URLs de archivos de branding
   */
  static async updateBranding(brandingData: {
    logo_url?: string | null
    logo_dark_url?: string | null
    favicon_url?: string | null
  }): Promise<SiteSettings> {
    return await this.updateSettings(brandingData)
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  /**
   * Valida una URL de red social
   * @param platform - Plataforma de red social
   * @param url - URL a validar
   * @returns boolean
   */
  static validateSocialMediaUrl(platform: string, url: string): boolean {
    try {
      const parsedUrl = new URL(url)
      const domain = parsedUrl.hostname.replace('www.', '')

      const validDomains: Record<string, string[]> = {
        facebook: ['facebook.com', 'fb.com'],
        instagram: ['instagram.com'],
        linkedin: ['linkedin.com'],
        youtube: ['youtube.com', 'youtu.be'],
        twitter: ['twitter.com', 'x.com']
      }

      const allowedDomains = validDomains[platform.toLowerCase()]
      return allowedDomains ? allowedDomains.includes(domain) : false
    } catch {
      return false
    }
  }

  /**
   * Genera configuraciones de respuesta para API
   * @param settings - Configuraciones
   * @param message - Mensaje opcional
   * @returns SiteSettingsResponse
   */
  static formatResponse(
    settings: SiteSettings | null,
    message?: string
  ): SiteSettingsResponse {
    return {
      success: true,
      data: settings,
      message
    }
  }

  /**
   * Genera respuesta de error para API
   * @param error - Error
   * @returns SiteSettingsResponse
   */
  static formatErrorResponse(error: string): SiteSettingsResponse {
    return {
      success: false,
      error
    }
  }
}