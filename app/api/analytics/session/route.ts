// =====================================================================================
// ANALYTICS SESSION API ROUTE
// =====================================================================================
// Handles analytics session creation and management
// GDPR compliant with IP hashing and opt-out support
// =====================================================================================

import { NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/services/analytics"
import { type CreateAnalyticsSessionInput } from "@/types/analytics"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_agent,
      country_code,
      device_type,
      browser,
      os,
      referrer_domain,
      landing_page,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content
    }: Partial<CreateAnalyticsSessionInput> = body

    // Extract IP address from request headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0] || realIP || '127.0.0.1'

    // Extract User-Agent if not provided
    const userAgent = user_agent || request.headers.get('user-agent') || undefined

    const sessionData: CreateAnalyticsSessionInput = {
      ip_address: ip,
      user_agent: userAgent,
      country_code,
      device_type,
      browser,
      os,
      referrer_domain,
      landing_page,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content
    }

    const sessionId = await AnalyticsService.getOrCreateSession(ip, userAgent, sessionData)

    return NextResponse.json({ 
      success: true, 
      session_id: sessionId 
    })

  } catch (error) {
    console.error('Analytics session API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create analytics session' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    await AnalyticsService.updateSessionLastSeen(sessionId)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Session update API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update session' 
      },
      { status: 500 }
    )
  }
}