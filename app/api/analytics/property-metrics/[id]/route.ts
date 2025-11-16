// =====================================================================================
// ANALYTICS PROPERTY METRICS API ROUTE v4 - OPTIMIZED
// =====================================================================================
// Provides detailed analytics for individual properties
// Features: Response caching, rate limiting, security headers, optimized performance
// =====================================================================================

import { NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/services/analytics"
import {
  getRateLimitKey,
  checkRateLimit,
  addRateLimitHeaders,
  addSecurityHeaders,
  addCacheHeaders,
  createSuccessResponse,
  createErrorResponse,
  addPerformanceHeaders,
  API_CONFIG
} from "@/lib/api-utils"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now()

  try {
    const resolvedParams = await params
    const propertyId = parseInt(resolvedParams.id)

    if (!propertyId || propertyId <= 0) {
      const response = NextResponse.json(
        createErrorResponse('Valid property ID is required', 'INVALID_PROPERTY_ID'),
        { status: 400 }
      )
      return addSecurityHeaders(response)
    }

    // Rate limiting check
    const rateLimitKey = getRateLimitKey(request, 'property-metrics')
    const rateLimit = checkRateLimit(rateLimitKey, 150) // Higher limit for property metrics

    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        createErrorResponse('Rate limit exceeded. Please try again later.', 'RATE_LIMIT_EXCEEDED'),
        { status: 429 }
      )
      addRateLimitHeaders(response, rateLimit)
      return addSecurityHeaders(response)
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const period = searchParams.get('period') || '30d' // '7d', '30d', '90d', '1y'
    const compact = searchParams.get('compact') === 'true'

    // Validate period
    const validPeriods = ['7d', '30d', '90d', '1y']
    if (!validPeriods.includes(period)) {
      const response = NextResponse.json(
        createErrorResponse(
          `Invalid period: ${period}. Valid options: ${validPeriods.join(', ')}`,
          'INVALID_PERIOD'
        ),
        { status: 400 }
      )
      return addSecurityHeaders(response)
    }

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

    // Validate date range (max 1 year)
    const maxDays = period === '1y' ? 365 : 365
    const actualDays = Math.ceil(
      (new Date(calculatedEndDate).getTime() - new Date(calculatedStartDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (actualDays > maxDays) {
      const response = NextResponse.json(
        createErrorResponse(`Date range cannot exceed ${maxDays} days`, 'INVALID_DATE_RANGE'),
        { status: 400 }
      )
      return addSecurityHeaders(response)
    }

    // Calculate days back from start date
    const daysBack = Math.max(1, actualDays)

    const metrics = await AnalyticsService.getPropertyMetrics(propertyId, daysBack)
    const executionTime = Date.now() - startTime

    const responseData = {
      property_id: propertyId,
      period: {
        start_date: calculatedStartDate,
        end_date: calculatedEndDate,
        period: period,
        days_back: daysBack
      },
      metrics: compact ? {
        // Simplified metrics for compact mode
        total_views: metrics.total_views || 0,
        total_leads: metrics.total_leads || 0,
        conversion_rate: metrics.conversion_rate || 0,
        avg_time_on_page: metrics.avg_time_on_page || 0
      } : metrics
    }

    const apiResponse = createSuccessResponse(responseData, {
      execution_time_ms: executionTime,
      rate_limit: {
        remaining: rateLimit.remaining,
        reset_time: rateLimit.resetTime
      },
      compact: compact,
      property_id: propertyId
    })

    const response = NextResponse.json(apiResponse)

    // Add headers
    addRateLimitHeaders(response, rateLimit)
    addPerformanceHeaders(response, executionTime)
    response.headers.set('X-Property-ID', propertyId.toString())

    // Cache configuration based on period
    const cacheConfig = {
      maxAge: period === '7d' ? 120 : period === '30d' ? 300 : 600, // More frequent updates for shorter periods
      staleWhileRevalidate: API_CONFIG.cache.stale_while_revalidate
    }

    return addCacheHeaders(addSecurityHeaders(response), cacheConfig)

  } catch (error) {
    console.error('Property metrics API error:', error)

    const response = NextResponse.json(
      createErrorResponse(
        error instanceof Error ? error.message : 'Failed to fetch property metrics',
        'INTERNAL_ERROR',
        { execution_time_ms: Date.now() - startTime }
      ),
      { status: 500 }
    )

    return addSecurityHeaders(response)
  }
}