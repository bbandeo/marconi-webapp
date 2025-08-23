// =====================================================================================
// ANALYTICS LEAD GENERATION API ROUTE
// =====================================================================================
// Handles lead generation event tracking with attribution
// Links leads to analytics sessions and properties
// =====================================================================================

import { NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/services/analytics"
import { type CreateLeadGenerationEventInput, type LeadSourceCode } from "@/types/analytics"
import { AnalyticsValidationError } from "@/types/analytics"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      lead_id,
      session_id,
      property_id,
      lead_source_id,
      form_type,
      conversion_page,
      time_to_conversion,
      session_pages_viewed,
      properties_viewed,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content
    }: CreateLeadGenerationEventInput = body

    // Validate required fields
    if (!lead_id || lead_id <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid lead ID is required' },
        { status: 400 }
      )
    }

    if (!lead_source_id || lead_source_id <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid lead source ID is required' },
        { status: 400 }
      )
    }

    const leadData: CreateLeadGenerationEventInput = {
      lead_id,
      session_id,
      property_id,
      lead_source_id,
      form_type,
      conversion_page,
      time_to_conversion,
      session_pages_viewed: session_pages_viewed || 1,
      properties_viewed: properties_viewed || 0,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content
    }

    await AnalyticsService.recordLeadGeneration(leadData)

    return NextResponse.json({ 
      success: true,
      message: 'Lead generation event recorded successfully'
    })

  } catch (error) {
    console.error('Lead generation API error:', error)

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
        error: error instanceof Error ? error.message : 'Failed to record lead generation event' 
      },
      { status: 500 }
    )
  }
}

// Endpoint for recording lead with automatic source detection
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      lead_id,
      source_code,
      session_id,
      property_id,
      form_type,
      conversion_page,
      session_pages_viewed,
      properties_viewed,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content
    } = body

    // Validate required fields
    if (!lead_id || lead_id <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid lead ID is required' },
        { status: 400 }
      )
    }

    if (!source_code) {
      return NextResponse.json(
        { success: false, error: 'Lead source code is required' },
        { status: 400 }
      )
    }

    const additionalData = {
      form_type,
      conversion_page,
      session_pages_viewed,
      properties_viewed,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content
    }

    await AnalyticsService.recordLeadWithSource(
      lead_id,
      source_code as LeadSourceCode,
      session_id,
      property_id,
      additionalData
    )

    return NextResponse.json({ 
      success: true,
      message: 'Lead recorded with source attribution'
    })

  } catch (error) {
    console.error('Lead with source API error:', error)

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
        error: error instanceof Error ? error.message : 'Failed to record lead with source' 
      },
      { status: 500 }
    )
  }
}