// =====================================================================================
// ANALYTICS INTERACTION API ROUTE
// =====================================================================================
// Handles user interaction events for UX analysis
// =====================================================================================

import { NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/services/analytics"
import { type CreateUserInteractionEventInput } from "@/types/analytics"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      session_id,
      property_id,
      event_type,
      event_target,
      page_url,
      event_data,
      timestamp
    }: Partial<CreateUserInteractionEventInput> = body

    if (!session_id || !event_type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Session ID and event type are required' 
        },
        { status: 400 }
      )
    }

    const interactionData: CreateUserInteractionEventInput = {
      session_id,
      property_id,
      event_type,
      event_target,
      page_url: page_url || request.headers.get('referer') || undefined,
      event_data,
      timestamp
    }

    await AnalyticsService.recordInteraction(interactionData)

    return NextResponse.json({ 
      success: true,
      message: 'Interaction recorded successfully'
    })

  } catch (error) {
    console.error('Analytics interaction API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to record interaction' 
      },
      { status: 500 }
    )
  }
}

// Batch endpoint for multiple interactions
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { interactions }: { interactions: CreateUserInteractionEventInput[] } = body

    if (!Array.isArray(interactions) || interactions.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Interactions array is required' 
        },
        { status: 400 }
      )
    }

    await AnalyticsService.recordInteractionsBatch(interactions)

    return NextResponse.json({ 
      success: true,
      message: `${interactions.length} interactions recorded successfully`
    })

  } catch (error) {
    console.error('Analytics interactions batch API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to record interactions' 
      },
      { status: 500 }
    )
  }
}