// =============================================
// MARCONI INMOBILIARIA - ANALYTICS TYPES
// Definiciones TypeScript para sistema de analytics
// =============================================

// ================== BASE TYPES ==================

export interface AnalyticsSession {
  id: string
  session_id: string
  ip_hash: string
  user_agent?: string
  device_type?: 'desktop' | 'mobile' | 'tablet'
  browser_name?: string
  browser_version?: string
  os_name?: string
  os_version?: string
  referrer_domain?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  country_code?: string
  city?: string
  language?: string
  timezone?: string
  screen_width?: number
  screen_height?: number
  opt_out: boolean
  first_seen_at: string
  last_seen_at: string
  created_at: string
}

export interface AnalyticsPropertyView {
  id: string
  property_id: number
  session_id?: string
  view_duration_seconds: number
  page_url: string
  referrer_url?: string
  search_query?: string
  search_filters?: Record<string, any>
  interaction_events?: InteractionEvent[]
  scroll_percentage?: number
  images_viewed: number
  contact_form_opened: boolean
  contact_form_submitted: boolean
  phone_clicked: boolean
  whatsapp_clicked: boolean
  email_clicked: boolean
  viewed_at: string
  created_at: string
}

export interface AnalyticsLeadSource {
  id: number
  name: string
  display_name: string
  description?: string
  category: 'web' | 'social' | 'direct' | 'referral' | 'advertising'
  icon?: string
  color?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface AnalyticsLeadGeneration {
  id: string
  lead_id?: number
  session_id?: string
  property_id?: number
  lead_source_id?: number
  form_type?: string
  contact_method?: string
  lead_value?: number
  conversion_time_minutes?: number
  form_data?: Record<string, any>
  page_url?: string
  referrer_url?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  generated_at: string
  created_at: string
}

export interface AnalyticsUserInteraction {
  id: string
  session_id?: string
  property_id?: number
  interaction_type: string
  element_id?: string
  element_class?: string
  element_text?: string
  page_url: string
  coordinates_x?: number
  coordinates_y?: number
  viewport_width?: number
  viewport_height?: number
  interaction_data?: Record<string, any>
  occurred_at: string
  created_at: string
}

export interface InteractionEvent {
  type: string
  element?: string
  timestamp: number
  data?: Record<string, any>
}

// ================== INPUT TYPES ==================

export interface CreateSessionRequest {
  ip_address?: string
  user_agent?: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  screen_width?: number
  screen_height?: number
  timezone?: string
  language?: string
}

export interface UpdateSessionRequest {
  session_id: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

export interface TrackPropertyViewRequest {
  property_id: number
  session_id?: string
  page_url: string
  referrer_url?: string
  search_query?: string
  search_filters?: Record<string, any>
  time_on_page?: number
  scroll_depth?: number
  images_viewed?: number
  contact_form_opened?: boolean
  contact_form_submitted?: boolean
  phone_clicked?: boolean
  whatsapp_clicked?: boolean
  email_clicked?: boolean
  interactions?: InteractionEvent[]
}

export interface TrackLeadGenerationRequest {
  lead_id?: number
  session_id?: string
  property_id?: number
  lead_source_id?: number
  source_code?: string // Para lookup automático de lead_source_id
  form_type?: string
  contact_method?: string
  lead_value?: number
  form_data?: Record<string, any>
  page_url?: string
  referrer_url?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

export interface TrackUserInteractionRequest {
  session_id?: string
  property_id?: number
  interaction_type: string
  element_id?: string
  element_class?: string
  element_text?: string
  page_url: string
  coordinates_x?: number
  coordinates_y?: number
  viewport_width?: number
  viewport_height?: number
  interaction_data?: Record<string, any>
}

// ================== OUTPUT TYPES ==================

export interface PropertyMetrics {
  property_id: number
  total_views: number
  unique_sessions: number
  avg_duration_seconds: number
  total_interactions: number
  leads_generated: number
  contact_forms_submitted: number
  phone_clicks: number
  whatsapp_clicks: number
  email_clicks: number
  conversion_rate: number
  bounce_rate: number
  time_period: string
}

export interface DashboardMetrics {
  total_views: number
  unique_sessions: number
  total_leads: number
  conversion_rate: number
  avg_session_duration: number
  bounce_rate: number
  top_properties: PropertyPerformance[]
  lead_sources_performance: LeadSourcePerformance[]
  campaign_performance: CampaignPerformance[]
  device_breakdown: DeviceBreakdown[]
  time_series_data?: TimeSeriesData[]
}

export interface PropertyPerformance {
  property_id: number
  title?: string
  total_views: number
  unique_sessions: number
  leads_generated: number
  conversion_rate: number
  avg_duration: number
}

export interface LeadSourcePerformance {
  source_id: number
  source_name: string
  category: string
  total_leads: number
  conversion_rate: number
  avg_lead_value: number
  color?: string
  icon?: string
}

export interface CampaignPerformance {
  campaign_name: string
  campaign_source: string
  sessions: number
  leads: number
  cost: number
  revenue: number
  roas: number
  ctr: number
  cpc: number
  cpl: number
}

export interface DeviceBreakdown {
  device_type: string
  sessions: number
  percentage: number
  avg_duration: number
  conversion_rate: number
}

export interface TimeSeriesData {
  date: string
  views: number
  sessions: number
  leads: number
  conversion_rate: number
}

// ================== REQUEST TYPES ==================

export interface DashboardRequest {
  start_date?: string
  end_date?: string
  property_id?: number
  device_type?: string
  utm_source?: string
  include_time_series?: boolean
  granularity?: 'hour' | 'day' | 'week' | 'month'
}

export interface PropertyMetricsRequest {
  property_id: number
  days_back?: number
  include_interactions?: boolean
  include_lead_attribution?: boolean
}

// ================== ERROR TYPES ==================

export class AnalyticsError extends Error {
  public code: string
  public statusCode: number

  constructor(message: string, code: string = 'ANALYTICS_ERROR', statusCode: number = 500) {
    super(message)
    this.name = 'AnalyticsError'
    this.code = code
    this.statusCode = statusCode
  }
}

export class AnalyticsValidationError extends AnalyticsError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'AnalyticsValidationError'
  }
}

export class AnalyticsPrivacyError extends AnalyticsError {
  constructor(message: string) {
    super(message, 'PRIVACY_ERROR', 403)
    this.name = 'AnalyticsPrivacyError'
  }
}

// ================== CONSTANTS ==================

export const LEAD_SOURCE_CODES = {
  FORMULARIO_WEB: 'formulario_web',
  WHATSAPP: 'whatsapp', 
  TELEFONO: 'telefono',
  EMAIL: 'email',
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  GOOGLE_ADS: 'google_ads',
  FACEBOOK_ADS: 'facebook_ads',
  REFERIDO: 'referido',
  WALK_IN: 'walk_in',
  MARKETPLACE: 'marketplace',
  OTROS: 'otros'
} as const

export const DEVICE_TYPES = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet'
} as const

export const INTERACTION_TYPES = {
  CLICK: 'click',
  SCROLL: 'scroll',
  FORM_FOCUS: 'form_field_focus',
  FORM_SUBMIT: 'form_submit',
  PAGE_LOAD: 'page_load',
  PAGE_UNLOAD: 'page_unload',
  CONTACT_CLICK: 'contact_click',
  PHONE_CLICK: 'phone_click',
  WHATSAPP_CLICK: 'whatsapp_click',
  EMAIL_CLICK: 'email_click',
  IMAGE_VIEW: 'image_view',
  GALLERY_INTERACTION: 'gallery_interaction'
} as const

export const FORM_TYPES = {
  CONTACT: 'contact',
  PHONE_CALL: 'phone_call', 
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  CALLBACK: 'callback',
  VISIT_REQUEST: 'visit_request'
} as const

export const CAMPAIGN_CATEGORIES = {
  WEB: 'web',
  SOCIAL: 'social',
  DIRECT: 'direct',
  REFERRAL: 'referral',
  ADVERTISING: 'advertising'
} as const

// ================== UTILITY TYPES ==================

export type LeadSourceCode = typeof LEAD_SOURCE_CODES[keyof typeof LEAD_SOURCE_CODES]
export type DeviceType = typeof DEVICE_TYPES[keyof typeof DEVICE_TYPES]
export type InteractionType = typeof INTERACTION_TYPES[keyof typeof INTERACTION_TYPES]
export type FormType = typeof FORM_TYPES[keyof typeof FORM_TYPES]
export type CampaignCategory = typeof CAMPAIGN_CATEGORIES[keyof typeof CAMPAIGN_CATEGORIES]

export interface OptOutRequest {
  session_id?: string
  ip_address?: string
  reason?: string
}

export interface OptOutResponse {
  success: boolean
  message: string
  affected_records: number
}

// ================== SUPABASE INTEGRATION ==================

export interface DatabaseFunctionResult<T> {
  data: T | null
  error: any
  count?: number
}

export interface AnalyticsServiceConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  enableGDPRCompliance: boolean
  defaultSessionDuration: number
  viewDebounceDuration: number
  maxInteractionBatchSize: number
}

// ================== ERROR CLASSES ==================

export class AnalyticsValidationError extends Error {
  constructor(message: string, public field: string, public value: any) {
    super(message)
    this.name = 'AnalyticsValidationError'
  }
}

export class AnalyticsPrivacyError extends Error {
  constructor(message: string, public sessionId?: string) {
    super(message)
    this.name = 'AnalyticsPrivacyError'
  }
}

// ================== CONSTANTS ==================

export const ANALYTICS_CONSTANTS = {
  MAX_SESSION_DURATION_HOURS: 4,
  VIEW_DEBOUNCE_DURATION_HOURS: 2,
  RETENTION_MONTHS: 25,
  MAX_BATCH_SIZE: 100
} as const