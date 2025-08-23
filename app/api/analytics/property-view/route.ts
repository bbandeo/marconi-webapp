// =====================================================================================
// ANALYTICS PROPERTY VIEW API ROUTE
// =====================================================================================
// Handles property view tracking with automatic debouncing
// Integrates with existing property views counter
// =====================================================================================

import { NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/services/analytics"
import { type CreatePropertyViewInput } from "@/types/analytics"
import { AnalyticsValidationError } from "@/types/analytics"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      session_id,
      property_id,
      time_on_page,
      scroll_depth,
      contact_button_clicked,
      whatsapp_clicked,
      phone_clicked,
      images_viewed,
      email_clicked,
      page_url,
      referrer_url,
      search_query
    }: CreatePropertyViewInput = body

    // Validate required fields
    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    if (!property_id || property_id <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid property ID is required' },
        { status: 400 }
      )
    }

    const viewData: CreatePropertyViewInput = {
      session_id,
      property_id,
      time_on_page,
      scroll_depth,
      contact_button_clicked: contact_button_clicked || false,
      whatsapp_clicked: whatsapp_clicked || false,
      phone_clicked: phone_clicked || false,
      email_clicked: email_clicked || false,
      images_viewed: images_viewed || 0,
      page_url,
      referrer_url,
      search_query
    }

    const eventId = await AnalyticsService.recordPropertyView(viewData)

    return NextResponse.json({ 
      success: true, 
      event_id: eventId 
    })

  } catch (error) {
    console.error('Property view API error:', error)

    if (error instanceof AnalyticsValidationError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          field: error.field 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to record property view' 
      },
      { status: 500 }
    )
  }
}

// Endpoint for recording property view with automatic session creation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      property_id,
      time_on_page,
      scroll_depth,
      contact_button_clicked,
      whatsapp_clicked,
      phone_clicked,
      images_viewed,
      email_clicked,
      page_url,
      referrer_url,
      // Session creation data
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
    } = body

    if (!property_id || property_id <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid property ID is required' },
        { status: 400 }
      )
    }

    // Extract IP address from request headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0] || realIP || '127.0.0.1'
    
    // Extract User-Agent
    const userAgent = request.headers.get('user-agent') || undefined

    const viewData: Partial<CreatePropertyViewInput> = {
      time_on_page,
      scroll_depth,
      contact_button_clicked,
      whatsapp_clicked,
      phone_clicked,
      email_clicked,
      images_viewed,
      page_url,
      referrer_url
    }

    const sessionData = {
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

    const { eventId, sessionId } = await AnalyticsService.recordPropertyViewWithSession(
      property_id,
      ip,
      userAgent,
      viewData,
      sessionData
    )

    return NextResponse.json({ 
      success: true, 
      event_id: eventId,
      session_id: sessionId
    })

  } catch (error) {
    console.error('Property view with session API error:', error)

    if (error instanceof AnalyticsValidationError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          field: error.field 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to record property view' 
      },
      { status: 500 }
    )
  }
}