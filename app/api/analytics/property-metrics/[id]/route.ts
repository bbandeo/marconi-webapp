// =====================================================================================
// ANALYTICS PROPERTY METRICS API ROUTE
// =====================================================================================
// Provides detailed analytics for individual properties
// Includes views, engagement, and conversion metrics
// =====================================================================================

import { NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/services/analytics"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const propertyId = parseInt(params.id)
    
    if (!propertyId || propertyId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid property ID is required' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const period = searchParams.get('period') || '30d' // '7d', '30d', '90d', '1y'

    // Calculate date range based on period if not provided
    let calculatedStartDate = startDate
    let calculatedEndDate = endDate || new Date().toISOString().split('T')[0]

    if (!calculatedStartDate) {
      const days = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }[period] || 30

      calculatedStartDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    // Calculate days back from start date
    const daysBack = Math.ceil((new Date(calculatedEndDate).getTime() - new Date(calculatedStartDate).getTime()) / (1000 * 60 * 60 * 24))
    
    const metrics = await AnalyticsService.getPropertyMetrics(
      propertyId,
      daysBack
    )

    return NextResponse.json({
      success: true,
      data: {
        property_id: propertyId,
        period: {
          start_date: calculatedStartDate,
          end_date: calculatedEndDate,
          period: period
        },
        metrics: metrics
      }
    })

  } catch (error) {
    console.error('Property metrics API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch property metrics' 
      },
      { status: 500 }
    )
  }
}