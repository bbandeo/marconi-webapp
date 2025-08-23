// =====================================================================================
// ANALYTICS GDPR OPT-OUT API ROUTE
// =====================================================================================
// Handles GDPR compliance opt-out requests
// Anonymizes user data while maintaining analytics integrity
// =====================================================================================

import { NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/services/analytics"
import { AnalyticsPrivacyError } from "@/types/analytics"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, reason } = body

    // Extract IP address from request headers for IP-based opt-out
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0] || realIP || null

    if (!session_id && !ip) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either session ID or IP address is required for opt-out' 
        },
        { status: 400 }
      )
    }

    // Process the opt-out request
    await AnalyticsService.handleOptOut(session_id, ip || undefined)

    return NextResponse.json({
      success: true,
      message: 'Successfully opted out of analytics tracking',
      details: {
        session_opted_out: !!session_id,
        ip_opted_out: !!ip,
        reason: reason || null
      }
    })

  } catch (error) {
    console.error('GDPR opt-out API error:', error)

    if (error instanceof AnalyticsPrivacyError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          session_id: error.sessionId
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process opt-out request' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check opt-out status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Check if session is opted out
    const { supabase } = await import('@/lib/supabase')
    const { data, error } = await supabase
      .from('analytics_sessions')
      .select('opt_out')
      .eq('session_id', sessionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: {
        session_id: sessionId,
        is_opted_out: data.opt_out,
        message: data.opt_out 
          ? 'This session has opted out of analytics tracking'
          : 'This session is participating in analytics tracking'
      }
    })

  } catch (error) {
    console.error('Opt-out status check API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check opt-out status' 
      },
      { status: 500 }
    )
  }
}