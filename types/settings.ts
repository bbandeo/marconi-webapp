// =============================================
// TYPES: SITE SETTINGS
// Definiciones de tipos para configuraciones del sitio
// =============================================

export interface SocialMediaLinks {
  facebook?: string | null
  instagram?: string | null
  linkedin?: string | null
  youtube?: string | null
  twitter?: string | null
}

export interface BrandColors {
  primary: string
  secondary: string
}

export interface ContactMethods {
  whatsapp_enabled: boolean
  phone_enabled: boolean
  email_enabled: boolean
  contact_form_enabled: boolean
}

export interface BusinessHour {
  open: string // HH:mm format
  close: string // HH:mm format
  closed: boolean
}

export interface BusinessHours {
  monday: BusinessHour
  tuesday: BusinessHour
  wednesday: BusinessHour
  thursday: BusinessHour
  friday: BusinessHour
  saturday: BusinessHour
  sunday: BusinessHour
}

// Interfaz principal para la configuración del sitio
export interface SiteSettings {
  id: string

  // Información de la empresa
  company_name: string
  company_description?: string | null
  contact_email: string
  contact_phone: string
  whatsapp_number?: string | null
  address: string
  website_url?: string | null

  // Redes sociales
  social_media: SocialMediaLinks

  // Branding y assets
  logo_url?: string | null
  logo_dark_url?: string | null
  favicon_url?: string | null
  brand_colors: BrandColors

  // SEO y metadatos
  meta_title: string
  meta_description: string
  meta_keywords?: string | null
  google_analytics_id?: string | null
  google_tag_manager_id?: string | null

  // Configuraciones de contacto
  contact_methods: ContactMethods

  // Horarios de atención
  business_hours: BusinessHours

  // Configuraciones adicionales
  settings_data: Record<string, any>

  // Timestamps
  created_at: string
  updated_at: string
}

// Tipo para crear/actualizar configuraciones (campos opcionales)
export interface SiteSettingsInput {
  company_name?: string
  company_description?: string | null
  contact_email?: string
  contact_phone?: string
  whatsapp_number?: string | null
  address?: string
  website_url?: string | null
  social_media?: Partial<SocialMediaLinks>
  logo_url?: string | null
  logo_dark_url?: string | null
  favicon_url?: string | null
  brand_colors?: Partial<BrandColors>
  meta_title?: string
  meta_description?: string
  meta_keywords?: string | null
  google_analytics_id?: string | null
  google_tag_manager_id?: string | null
  contact_methods?: Partial<ContactMethods>
  business_hours?: Partial<BusinessHours>
  settings_data?: Record<string, any>
}

// Tipo para formularios
export interface SiteSettingsFormData {
  // Sección: Información de la empresa
  company_name: string
  company_description: string
  contact_email: string
  contact_phone: string
  whatsapp_number: string
  address: string
  website_url: string

  // Sección: Redes sociales
  social_facebook: string
  social_instagram: string
  social_linkedin: string
  social_youtube: string
  social_twitter: string

  // Sección: SEO
  meta_title: string
  meta_description: string
  meta_keywords: string
  google_analytics_id: string
  google_tag_manager_id: string

  // Sección: Métodos de contacto
  whatsapp_enabled: boolean
  phone_enabled: boolean
  email_enabled: boolean
  contact_form_enabled: boolean

  // Sección: Branding
  brand_primary_color: string
  brand_secondary_color: string
}

// Esquemas de validación por sección
export interface SettingsValidationSchema {
  company: {
    company_name: string
    company_description?: string
    contact_email: string
    contact_phone: string
    whatsapp_number?: string
    address: string
    website_url?: string
  }
  social: {
    facebook?: string
    instagram?: string
    linkedin?: string
    youtube?: string
    twitter?: string
  }
  seo: {
    meta_title: string
    meta_description: string
    meta_keywords?: string
    google_analytics_id?: string
    google_tag_manager_id?: string
  }
  contact: {
    whatsapp_enabled: boolean
    phone_enabled: boolean
    email_enabled: boolean
    contact_form_enabled: boolean
  }
  branding: {
    primary_color: string
    secondary_color: string
  }
}

// Tipos para respuestas de API
export interface SiteSettingsResponse {
  success: boolean
  data?: SiteSettings
  error?: string
}

export interface SiteSettingsUpdateResponse {
  success: boolean
  data?: SiteSettings
  message?: string
  error?: string
}

// Constantes por defecto
export const DEFAULT_SITE_SETTINGS: Partial<SiteSettings> = {
  company_name: 'Marconi Inmobiliaria',
  contact_email: 'marconinegociosinmobiliarios@hotmail.com',
  contact_phone: '+54 9 3482 308100',
  address: 'Belgrano 123, Reconquista, Santa Fe, Argentina',
  meta_title: 'Marconi Inmobiliaria - Tu próxima propiedad te está esperando',
  meta_description: 'Encontrá casas, departamentos y terrenos en Reconquista, Santa Fe. Marconi Inmobiliaria, tu socio de confianza en bienes raíces.',
  social_media: {
    facebook: null,
    instagram: null,
    linkedin: null,
    youtube: null,
    twitter: null,
  },
  brand_colors: {
    primary: '#f97316',
    secondary: '#1f2937',
  },
  contact_methods: {
    whatsapp_enabled: true,
    phone_enabled: true,
    email_enabled: true,
    contact_form_enabled: true,
  },
}

// Tipos para validación de URLs de redes sociales
export const SOCIAL_MEDIA_DOMAINS = {
  facebook: 'facebook.com',
  instagram: 'instagram.com',
  linkedin: 'linkedin.com',
  youtube: 'youtube.com',
  twitter: 'twitter.com',
} as const

export type SocialMediaPlatform = keyof typeof SOCIAL_MEDIA_DOMAINS