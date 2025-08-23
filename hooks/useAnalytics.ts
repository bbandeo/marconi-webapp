"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { type LeadSourceCode } from "@/types/analytics"

// Client-side analytics session management
class AnalyticsSession {
  private sessionId: string | null = null
  private sessionExpiry: number | null = null
  private readonly SESSION_DURATION = 30 * 60 * 1000 // 30 minutes

  async getOrCreateSession(): Promise<string> {
    // Check if existing session is still valid
    if (this.sessionId && this.sessionExpiry && Date.now() < this.sessionExpiry) {
      return this.sessionId
    }

    try {
      // Create new session
      const response = await fetch('/api/analytics/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_type: this.getDeviceType(),
          browser: this.getBrowser(),
          os: this.getOS(),
          referrer_domain: this.getReferrerDomain(),
          landing_page: window.location.pathname,
          ...(this.getUTMParams())
        }),
      })

      if (!response.ok) {
        throw new Error(`Session creation failed: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success || !data.session_id) {
        throw new Error('Invalid session response')
      }

      this.sessionId = data.session_id
      this.sessionExpiry = Date.now() + this.SESSION_DURATION
      return this.sessionId
    } catch (error) {
      console.warn('Analytics session creation failed:', error)
      // Return a fallback session ID to prevent blocking user experience
      return 'fallback-session'
    }
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/tablet|ipad/.test(userAgent)) return 'tablet'
    if (/mobile|android|iphone/.test(userAgent)) return 'mobile'
    return 'desktop'
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private getOS(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  private getReferrerDomain(): string | undefined {
    if (!document.referrer) return undefined
    try {
      return new URL(document.referrer).hostname
    } catch {
      return undefined
    }
  }

  private getUTMParams() {
    const params = new URLSearchParams(window.location.search)
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_term: params.get('utm_term') || undefined,
      utm_content: params.get('utm_content') || undefined,
    }
  }

  async updateLastSeen(): Promise<void> {
    if (!this.sessionId) return

    try {
      await fetch(`/api/analytics/session?session_id=${this.sessionId}`, {
        method: 'PUT',
      })
    } catch (error) {
      console.warn('Failed to update session timestamp:', error)
    }
  }
}

// Singleton session manager
const sessionManager = new AnalyticsSession()

export interface UseAnalyticsOptions {
  enableAutoTracking?: boolean
  trackScrollDepth?: boolean
  trackTimeOnPage?: boolean
  sessionUpdateInterval?: number
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const {
    enableAutoTracking = true,
    trackScrollDepth = true,
    trackTimeOnPage = true,
    sessionUpdateInterval = 30000 // 30 seconds
  } = options

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isOptedOut, setIsOptedOut] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Tracking state
  const startTime = useRef<number>(Date.now())
  const maxScrollDepth = useRef<number>(0)
  const lastScrollTime = useRef<number>(0)
  const sessionUpdateInterval_ref = useRef<NodeJS.Timeout | null>(null)

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true)
        const sessionId = await sessionManager.getOrCreateSession()
        setSessionId(sessionId)

        // Check opt-out status
        const optOutResponse = await fetch(`/api/analytics/gdpr/opt-out?session_id=${sessionId}`)
        if (optOutResponse.ok) {
          const optOutData = await optOutResponse.json()
          setIsOptedOut(optOutData.data?.is_opted_out || false)
        }
      } catch (error) {
        console.warn('Analytics initialization failed:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeSession()
  }, [])

  // Set up automatic session updates
  useEffect(() => {
    if (!sessionId || isOptedOut) return

    const updateInterval = setInterval(() => {
      sessionManager.updateLastSeen()
    }, sessionUpdateInterval)

    sessionUpdateInterval_ref.current = updateInterval

    return () => {
      if (sessionUpdateInterval_ref.current) {
        clearInterval(sessionUpdateInterval_ref.current)
      }
    }
  }, [sessionId, isOptedOut, sessionUpdateInterval])

  // Track scroll depth
  useEffect(() => {
    if (!trackScrollDepth || !sessionId || isOptedOut) return

    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollDepth = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
      
      if (scrollDepth > maxScrollDepth.current) {
        maxScrollDepth.current = Math.min(scrollDepth, 100)
        lastScrollTime.current = Date.now()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [trackScrollDepth, sessionId, isOptedOut])

  // Property view tracking
  const trackPropertyView = useCallback(async (
    propertyId: number,
    additionalData?: {
      contact_button_clicked?: boolean
      whatsapp_clicked?: boolean
      phone_clicked?: boolean
      email_clicked?: boolean
      images_viewed?: number
    }
  ) => {
    if (!sessionId || isOptedOut) return null

    try {
      const timeOnPage = trackTimeOnPage ? Math.round((Date.now() - startTime.current) / 1000) : undefined
      const scrollDepth = trackScrollDepth ? maxScrollDepth.current : undefined

      const response = await fetch('/api/analytics/property-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          property_id: propertyId,
          time_on_page: timeOnPage,
          scroll_depth: scrollDepth,
          page_url: window.location.href,
          referrer_url: document.referrer || undefined,
          ...additionalData
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.event_id
      }
    } catch (error) {
      console.warn('Property view tracking failed:', error)
    }
    return null
  }, [sessionId, isOptedOut, trackTimeOnPage, trackScrollDepth])

  // Simplified property view tracking for auto-tracking
  const trackPropertyViewAuto = useCallback(async (propertyId: number) => {
    return trackPropertyView(propertyId)
  }, [trackPropertyView])

  // Lead generation tracking
  const trackLeadGeneration = useCallback(async (
    leadId: number,
    sourceCode: LeadSourceCode,
    propertyId?: number,
    additionalData?: {
      form_type?: string
      utm_source?: string
      utm_medium?: string
      utm_campaign?: string
    }
  ) => {
    if (!sessionId || isOptedOut) return false

    try {
      const response = await fetch('/api/analytics/lead-generation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_id: leadId,
          source_code: sourceCode,
          session_id: sessionId,
          property_id: propertyId,
          conversion_page: window.location.href,
          session_pages_viewed: 1, // Could be tracked more accurately
          properties_viewed: propertyId ? 1 : 0,
          ...additionalData
        }),
      })

      return response.ok
    } catch (error) {
      console.warn('Lead generation tracking failed:', error)
      return false
    }
  }, [sessionId, isOptedOut])

  // Interaction tracking
  const trackInteraction = useCallback(async (
    eventType: string,
    elementId?: string,
    propertyId?: number,
    eventData?: any
  ) => {
    if (!sessionId || isOptedOut) return false

    try {
      const response = await fetch('/api/analytics/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          property_id: propertyId,
          event_type: eventType,
          event_target: elementId,
          page_url: window.location.href,
          event_data: eventData
        }),
      })

      return response.ok
    } catch (error) {
      console.warn('Interaction tracking failed:', error)
      return false
    }
  }, [sessionId, isOptedOut])

  // Contact button tracking helpers
  const trackContactClick = useCallback((type: 'whatsapp' | 'phone' | 'email' | 'form', propertyId?: number) => {
    trackInteraction(`contact_${type}`, `contact_${type}_button`, propertyId, { contact_method: type })
  }, [trackInteraction])

  // GDPR compliance
  const optOut = useCallback(async (reason?: string) => {
    if (!sessionId) return false

    try {
      const response = await fetch('/api/analytics/gdpr/opt-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          reason
        }),
      })

      if (response.ok) {
        setIsOptedOut(true)
        // Clear any tracking intervals
        if (sessionUpdateInterval_ref.current) {
          clearInterval(sessionUpdateInterval_ref.current)
        }
        return true
      }
    } catch (error) {
      console.warn('Opt-out request failed:', error)
    }
    return false
  }, [sessionId])

  // Page view tracking effect for auto-tracking
  useEffect(() => {
    if (!enableAutoTracking || !sessionId || isOptedOut) return

    // Reset tracking state for new page
    startTime.current = Date.now()
    maxScrollDepth.current = 0

    // Track page view (not property-specific)
    trackInteraction('page_view')
  }, [enableAutoTracking, sessionId, isOptedOut, trackInteraction])

  return {
    // State
    sessionId,
    isOptedOut,
    loading,
    
    // Tracking functions
    trackPropertyView,
    trackPropertyViewAuto,
    trackLeadGeneration,
    trackInteraction,
    trackContactClick,
    
    // GDPR compliance
    optOut,
    
    // Current session stats (read-only)
    currentStats: {
      timeOnPage: trackTimeOnPage ? Math.round((Date.now() - startTime.current) / 1000) : 0,
      maxScrollDepth: trackScrollDepth ? maxScrollDepth.current : 0
    }
  }
}

// Convenience hook for property pages
export function usePropertyAnalytics(propertyId: number, options?: UseAnalyticsOptions) {
  const analytics = useAnalytics(options)
  const hasTrackedView = useRef(false)

  // Auto-track property view when component mounts
  useEffect(() => {
    if (analytics.sessionId && !analytics.isOptedOut && !hasTrackedView.current && propertyId) {
      hasTrackedView.current = true
      analytics.trackPropertyViewAuto(propertyId)
    }
  }, [analytics.sessionId, analytics.isOptedOut, propertyId, analytics])

  return {
    ...analytics,
    propertyId,
    
    // Simplified property-specific tracking
    trackContact: (type: 'whatsapp' | 'phone' | 'email' | 'form') => {
      analytics.trackContactClick(type, propertyId)
    },
    
    trackLead: (leadId: number, sourceCode: LeadSourceCode, additionalData?: any) => {
      return analytics.trackLeadGeneration(leadId, sourceCode, propertyId, additionalData)
    }
  }
}