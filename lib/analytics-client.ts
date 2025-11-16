// =====================================================================================
// MARCONI INMOBILIARIA - CLIENT-SIDE ANALYTICS UTILITY
// =====================================================================================
// Browser-safe analytics tracking with automatic session management
// GDPR compliant with opt-out support and privacy-first approach
// =====================================================================================

import { type LeadSourceCode } from "@/types/analytics"

interface AnalyticsConfig {
  apiBaseUrl?: string
  enableConsoleLogging?: boolean
  enableLocalStorage?: boolean
  sessionStorageKey?: string
  optOutStorageKey?: string
}

interface SessionData {
  sessionId: string
  createdAt: number
  lastSeen: number
}

interface PropertyViewData {
  propertyId: number
  timeOnPage?: number
  scrollDepth?: number
  contactButtonClicked?: boolean
  whatsappClicked?: boolean
  phoneClicked?: boolean
  imagesViewed?: number
  mapInteracted?: boolean
  similarPropertiesClicked?: boolean
  pageUrl?: string
  referrerUrl?: string
}

interface DeviceInfo {
  deviceType: 'desktop' | 'tablet' | 'mobile' | 'bot'
  browser: string
  os: string
  screenWidth: number
  screenHeight: number
  userAgent: string
}

// =====================================================================================
// MAIN ANALYTICS CLIENT CLASS
// =====================================================================================

export class AnalyticsClient {
  private config: Required<AnalyticsConfig>
  private sessionData: SessionData | null = null
  private deviceInfo: DeviceInfo | null = null
  private isOptedOut: boolean = false
  private pageStartTime: number = Date.now()
  private maxScrollDepth: number = 0
  private interactionQueue: any[] = []
  private flushTimer: NodeJS.Timeout | null = null

  constructor(config: AnalyticsConfig = {}) {
    this.config = {
      apiBaseUrl: config.apiBaseUrl || '/api/analytics',
      enableConsoleLogging: config.enableConsoleLogging ?? false,
      enableLocalStorage: config.enableLocalStorage ?? true,
      sessionStorageKey: config.sessionStorageKey || 'marconi_analytics_session',
      optOutStorageKey: config.optOutStorageKey || 'marconi_analytics_opt_out'
    }

    this.init()
  }

  // =====================================================================================
  // INITIALIZATION
  // =====================================================================================

  private async init() {
    // Check if user has opted out
    if (this.checkOptOutStatus()) {
      this.log('Analytics tracking is disabled (user opted out)')
      return
    }

    // Detect device information
    this.deviceInfo = this.getDeviceInfo()

    // Load existing session or create new one
    await this.initializeSession()

    // Set up scroll tracking
    this.setupScrollTracking()

    // Set up interaction queue flushing
    this.setupInteractionBatching()

    this.log('Analytics client initialized', { sessionId: this.sessionData?.sessionId })
  }

  // =====================================================================================
  // SESSION MANAGEMENT
  // =====================================================================================

  private async initializeSession() {
    // Try to load existing session from storage
    const storedSession = this.loadSessionFromStorage()

    if (storedSession && this.isSessionValid(storedSession)) {
      this.sessionData = storedSession
      this.updateSessionLastSeen()
      return
    }

    // Create new session
    await this.createNewSession()
  }

  private async createNewSession() {
    try {
      const sessionData = {
        country_code: await this.getCountryCode(),
        device_type: this.deviceInfo?.deviceType,
        browser: this.deviceInfo?.browser,
        os: this.deviceInfo?.os,
        referrer_domain: this.getReferrerDomain(),
        landing_page: window.location.href,
        ...this.getUTMParameters()
      }

      const response = await fetch(`${this.config.apiBaseUrl}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })

      const result = await response.json()

      if (result.success) {
        this.sessionData = {
          sessionId: result.session_id,
          createdAt: Date.now(),
          lastSeen: Date.now()
        }

        this.saveSessionToStorage()
        this.log('New analytics session created', { sessionId: this.sessionData.sessionId })
      } else {
        throw new Error(result.error || 'Failed to create session')
      }
    } catch (error) {
      console.error('Failed to create analytics session:', error)
    }
  }

  private updateSessionLastSeen() {
    if (!this.sessionData) return

    this.sessionData.lastSeen = Date.now()
    this.saveSessionToStorage()

    // Update server-side timestamp periodically
    if (Date.now() - this.sessionData.lastSeen > 5 * 60 * 1000) { // 5 minutes
      fetch(`${this.config.apiBaseUrl}/session?session_id=${this.sessionData.sessionId}`, {
        method: 'PUT'
      }).catch(error => {
        this.log('Failed to update session timestamp:', error)
      })
    }
  }

  // =====================================================================================
  // PROPERTY TRACKING
  // =====================================================================================

  async trackPropertyView(propertyId: number, additionalData?: Partial<PropertyViewData>) {
    if (this.isOptedOut || !this.sessionData) {
      this.log('Property view tracking skipped (opted out or no session)')
      return
    }

    try {
      const viewData: PropertyViewData = {
        propertyId,
        timeOnPage: Math.floor((Date.now() - this.pageStartTime) / 1000),
        scrollDepth: this.maxScrollDepth,
        pageUrl: window.location.href,
        referrerUrl: document.referrer || undefined,
        ...additionalData
      }

      const response = await fetch(`${this.config.apiBaseUrl}/property-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionData.sessionId,
          property_id: viewData.propertyId,
          time_on_page: viewData.timeOnPage,
          scroll_depth: viewData.scrollDepth,
          contact_button_clicked: viewData.contactButtonClicked,
          whatsapp_clicked: viewData.whatsappClicked,
          phone_clicked: viewData.phoneClicked,
          images_viewed: viewData.imagesViewed,
          map_interacted: viewData.mapInteracted,
          similar_properties_clicked: viewData.similarPropertiesClicked,
          page_url: viewData.pageUrl,
          referrer_url: viewData.referrerUrl
        })
      })

      const result = await response.json()

      if (result.success) {
        this.log('Property view tracked', { propertyId, eventId: result.event_id })
        this.updateSessionLastSeen()
      } else {
        throw new Error(result.error || 'Failed to track property view')
      }
    } catch (error) {
      console.error('Failed to track property view:', error)
    }
  }

  // =====================================================================================
  // LEAD TRACKING
  // =====================================================================================

  async trackLead(leadId: number, sourceCode: LeadSourceCode, propertyId?: number) {
    if (this.isOptedOut) {
      this.log('Lead tracking skipped (opted out)')
      return
    }

    try {
      const leadData = {
        lead_id: leadId,
        source_code: sourceCode,
        session_id: this.sessionData?.sessionId,
        property_id: propertyId,
        form_type: this.inferFormType(sourceCode),
        conversion_page: window.location.href,
        ...this.getUTMParameters()
      }

      const response = await fetch(`${this.config.apiBaseUrl}/lead-generation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      })

      const result = await response.json()

      if (result.success) {
        this.log('Lead tracked', { leadId, sourceCode })
        this.updateSessionLastSeen()
      } else {
        throw new Error(result.error || 'Failed to track lead')
      }
    } catch (error) {
      console.error('Failed to track lead:', error)
    }
  }

  // =====================================================================================
  // INTERACTION TRACKING
  // =====================================================================================

  trackInteraction(eventType: string, target?: string, data?: any) {
    if (this.isOptedOut || !this.sessionData) return

    const interaction = {
      session_id: this.sessionData.sessionId,
      event_type: eventType,
      event_target: target,
      page_url: window.location.href,
      event_data: data,
      timestamp: Date.now()
    }

    this.interactionQueue.push(interaction)
    this.log('Interaction queued', { eventType, target })
  }

  private async flushInteractions() {
    if (this.interactionQueue.length === 0) return

    try {
      const interactions = this.interactionQueue.splice(0, 10) // Process in batches of 10
      
      // This would need a batch endpoint in the API
      for (const interaction of interactions) {
        await fetch(`${this.config.apiBaseUrl}/interaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(interaction)
        })
      }

      this.log('Interactions flushed', { count: interactions.length })
    } catch (error) {
      console.error('Failed to flush interactions:', error)
    }
  }

  // =====================================================================================
  // ENGAGEMENT TRACKING
  // =====================================================================================

  private setupScrollTracking() {
    let scrollTimeout: NodeJS.Timeout | null = null

    const trackScroll = () => {
      const scrolled = window.scrollY
      const viewHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      const scrollPercentage = Math.round((scrolled + viewHeight) / documentHeight * 100)
      this.maxScrollDepth = Math.max(this.maxScrollDepth, Math.min(scrollPercentage, 100))
    }

    window.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(trackScroll, 100)
    })
  }

  private setupInteractionBatching() {
    // Flush interactions every 30 seconds or on page unload
    this.flushTimer = setInterval(() => {
      this.flushInteractions()
    }, 30000)

    window.addEventListener('beforeunload', () => {
      this.flushInteractions()
    })
  }

  // =====================================================================================
  // UTILITY FUNCTIONS FOR CLICKS
  // =====================================================================================

  trackContactClick(propertyId?: number) {
    if (propertyId) {
      this.trackPropertyView(propertyId, { contactButtonClicked: true })
    }
    this.trackInteraction('click', 'contact_button', { property_id: propertyId })
  }

  trackWhatsAppClick(propertyId?: number) {
    if (propertyId) {
      this.trackPropertyView(propertyId, { whatsappClicked: true })
    }
    this.trackInteraction('click', 'whatsapp_button', { property_id: propertyId })
  }

  trackPhoneClick(propertyId?: number) {
    if (propertyId) {
      this.trackPropertyView(propertyId, { phoneClicked: true })
    }
    this.trackInteraction('click', 'phone_button', { property_id: propertyId })
  }

  trackImageView(propertyId: number, imageIndex: number) {
    this.trackInteraction('image_view', `image_${imageIndex}`, { 
      property_id: propertyId,
      image_index: imageIndex
    })
  }

  trackMapInteraction(propertyId?: number) {
    if (propertyId) {
      this.trackPropertyView(propertyId, { mapInteracted: true })
    }
    this.trackInteraction('map_interaction', 'property_map', { property_id: propertyId })
  }

  // =====================================================================================
  // GDPR COMPLIANCE
  // =====================================================================================

  async optOut(reason?: string) {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/gdpr/opt-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionData?.sessionId,
          reason
        })
      })

      const result = await response.json()

      if (result.success) {
        this.isOptedOut = true
        this.saveOptOutStatus(true)
        this.clearSession()
        this.log('Successfully opted out of analytics')
        return true
      } else {
        throw new Error(result.error || 'Failed to opt out')
      }
    } catch (error) {
      console.error('Failed to opt out:', error)
      return false
    }
  }

  async checkOptInStatus(): Promise<boolean> {
    if (!this.sessionData) return false

    try {
      const response = await fetch(`${this.config.apiBaseUrl}/gdpr/opt-out?session_id=${this.sessionData.sessionId}`)
      const result = await response.json()

      return result.success && !result.data.is_opted_out
    } catch (error) {
      console.error('Failed to check opt-in status:', error)
      return false
    }
  }

  // =====================================================================================
  // DEVICE & BROWSER DETECTION
  // =====================================================================================

  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height

    return {
      deviceType: this.getDeviceType(userAgent, screenWidth),
      browser: this.getBrowser(userAgent),
      os: this.getOS(userAgent),
      screenWidth,
      screenHeight,
      userAgent
    }
  }

  private getDeviceType(userAgent: string, screenWidth: number): 'desktop' | 'tablet' | 'mobile' | 'bot' {
    if (/bot|crawler|spider|scrapy/i.test(userAgent)) return 'bot'
    if (/tablet|ipad/i.test(userAgent)) return 'tablet'
    if (/mobile|phone|android|iphone/i.test(userAgent) || screenWidth < 768) return 'mobile'
    return 'desktop'
  }

  private getBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    if (userAgent.includes('Opera')) return 'Opera'
    return 'Unknown'
  }

  private getOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac OS')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  // =====================================================================================
  // UTILITY METHODS
  // =====================================================================================

  private getUTMParameters() {
    const params = new URLSearchParams(window.location.search)
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_term: params.get('utm_term') || undefined,
      utm_content: params.get('utm_content') || undefined
    }
  }

  private getReferrerDomain(): string | undefined {
    if (!document.referrer) return undefined
    try {
      return new URL(document.referrer).hostname
    } catch {
      return undefined
    }
  }

  private async getCountryCode(): Promise<string | undefined> {
    // This would typically use a geolocation API
    // For now, we'll leave it undefined and let the server handle it
    return undefined
  }

  private inferFormType(sourceCode: LeadSourceCode): string {
    const formTypeMap: Record<LeadSourceCode, string> = {
      whatsapp: 'whatsapp',
      formulario_web: 'contact_form',
      telefono: 'phone',
      email: 'email',
      instagram: 'social',
      facebook: 'social',
      google_ads: 'ad_click',
      referidos: 'referral',
      walk_in: 'walk_in',
      mercado_libre: 'marketplace',
      zonaprop: 'marketplace',
      argenprop: 'marketplace'
    }
    return formTypeMap[sourceCode] || 'unknown'
  }

  // =====================================================================================
  // STORAGE METHODS
  // =====================================================================================

  private loadSessionFromStorage(): SessionData | null {
    if (!this.config.enableLocalStorage || typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(this.config.sessionStorageKey)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  private saveSessionToStorage() {
    if (!this.config.enableLocalStorage || !this.sessionData || typeof window === 'undefined') return

    try {
      localStorage.setItem(this.config.sessionStorageKey, JSON.stringify(this.sessionData))
    } catch {
      // Storage failed, continue without persistence
    }
  }

  private clearSession() {
    this.sessionData = null
    if (this.config.enableLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.config.sessionStorageKey)
      } catch {
        // Ignore storage errors
      }
    }
  }

  private checkOptOutStatus(): boolean {
    if (!this.config.enableLocalStorage || typeof window === 'undefined') return false

    try {
      const optedOut = localStorage.getItem(this.config.optOutStorageKey)
      return optedOut === 'true'
    } catch {
      return false
    }
  }

  private saveOptOutStatus(optedOut: boolean) {
    if (!this.config.enableLocalStorage || typeof window === 'undefined') return

    try {
      localStorage.setItem(this.config.optOutStorageKey, optedOut.toString())
    } catch {
      // Storage failed
    }
  }

  private isSessionValid(session: SessionData): boolean {
    const maxAge = 4 * 60 * 60 * 1000 // 4 hours
    return Date.now() - session.lastSeen < maxAge
  }

  private log(message: string, data?: any) {
    if (this.config.enableConsoleLogging) {
      console.log(`[Analytics] ${message}`, data || '')
    }
  }

  // =====================================================================================
  // CLEANUP
  // =====================================================================================

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    
    // Flush any remaining interactions
    this.flushInteractions()
  }
}

// =====================================================================================
// SINGLETON INSTANCE
// =====================================================================================

let analyticsInstance: AnalyticsClient | null = null

export const getAnalyticsClient = (config?: AnalyticsConfig): AnalyticsClient => {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsClient(config)
  }
  return analyticsInstance
}

// =====================================================================================
// CONVENIENCE FUNCTIONS
// =====================================================================================

export const trackPropertyView = (propertyId: number, data?: Partial<PropertyViewData>) => {
  return getAnalyticsClient().trackPropertyView(propertyId, data)
}

export const trackLead = (leadId: number, source: LeadSourceCode, propertyId?: number) => {
  return getAnalyticsClient().trackLead(leadId, source, propertyId)
}

export const trackContactClick = (propertyId?: number) => {
  getAnalyticsClient().trackContactClick(propertyId)
}

export const trackWhatsAppClick = (propertyId?: number) => {
  getAnalyticsClient().trackWhatsAppClick(propertyId)
}

export const trackPhoneClick = (propertyId?: number) => {
  getAnalyticsClient().trackPhoneClick(propertyId)
}

export const optOutOfAnalytics = (reason?: string) => {
  return getAnalyticsClient().optOut(reason)
}

export default AnalyticsClient