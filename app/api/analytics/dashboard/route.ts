// =====================================================================================
// ANALYTICS DASHBOARD API ROUTE
// =====================================================================================
// Provides comprehensive analytics data for admin dashboard
// Handles various metrics, filters, and time ranges
// =====================================================================================

import { NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/services/analytics"
import { type AnalyticsFilters, type AnalyticsMetricType } from "@/types/analytics"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const startDate = searchParams.get('start_date') 
    const endDate = searchParams.get('end_date')
    const propertyIds = searchParams.get('property_ids')?.split(',').map(Number).filter(Boolean)
    const leadSourceIds = searchParams.get('lead_source_ids')?.split(',').map(Number).filter(Boolean)
    const utmSource = searchParams.get('utm_source')
    const utmCampaign = searchParams.get('utm_campaign')
    const deviceType = searchParams.get('device_type')
    const countryCode = searchParams.get('country_code')

    const filters: AnalyticsFilters = {
      start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: endDate || new Date().toISOString().split('T')[0],
      property_ids: propertyIds,
      lead_source_ids: leadSourceIds,
      utm_source: utmSource || undefined,
      utm_campaign: utmCampaign || undefined,
      device_type: deviceType as any,
      country_code: countryCode || undefined
    }

    const dashboardStats = await AnalyticsService.getDashboardStats(filters)

    return NextResponse.json({
      success: true,
      data: dashboardStats,
      filters: filters
    })

  } catch (error) {
    console.error('Dashboard analytics API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard analytics' 
      },
      { status: 500 }
    )
  }
}

// POST endpoint for complex dashboard queries with filters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      start_date,
      end_date,
      property_ids,
      lead_source_ids,
      utm_source,
      utm_campaign,
      device_type,
      country_code,
      metrics = ['overview'] // Can be 'overview', 'properties', 'campaigns', 'sources', 'devices'
    } = body

    const filters: AnalyticsFilters = {
      start_date: start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: end_date || new Date().toISOString().split('T')[0],
      property_ids,
      lead_source_ids,
      utm_source,
      utm_campaign,
      device_type,
      country_code
    }

    const results: any = {}

    // Fetch requested metrics
    if (metrics.includes('overview') || metrics.includes('all')) {
      results.overview = await AnalyticsService.getDashboardStats(filters)
    }

    if (metrics.includes('properties') || metrics.includes('all')) {
      results.top_properties = {
        by_views: await AnalyticsService.getTopProperties(10, 'views', 30),
        by_leads: await AnalyticsService.getTopProperties(10, 'leads', 30),
        by_conversion: await AnalyticsService.getTopProperties(10, 'conversion_rate', 30)
      }
    }

    if (metrics.includes('campaigns') || metrics.includes('all')) {
      results.campaigns = await AnalyticsService.getCampaignStats(
        filters.start_date, 
        filters.end_date
      )
    }

    if (metrics.includes('sources') || metrics.includes('all')) {
      results.lead_sources = await AnalyticsService.getLeadSourceStats(
        filters.start_date, 
        filters.end_date
      )
    }

    if (metrics.includes('devices') || metrics.includes('all')) {
      results.devices = await AnalyticsService.getDeviceTypeStats(
        filters.start_date, 
        filters.end_date
      )
    }

    return NextResponse.json({
      success: true,
      data: results,
      filters: filters
    })

  } catch (error) {
    console.error('Advanced dashboard analytics API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch advanced analytics' 
      },
      { status: 500 }
    )
  }
}