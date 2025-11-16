// =====================================================================================
// ANALYTICS DASHBOARD API ROUTE v4 - OPTIMIZED
// =====================================================================================
// Provides comprehensive analytics data for admin dashboard
// Features: Response caching, rate limiting, security headers, optimized performance
// =====================================================================================

import { NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/services/analytics"
import { type AnalyticsFilters, type AnalyticsMetricType } from "@/types/analytics"

// Cache configuration
const CACHE_MAX_AGE = 300 // 5 minutes in seconds
const CACHE_STALE_WHILE_REVALIDATE = 3600 // 1 hour in seconds

// Rate limiting (simple in-memory store for demo)
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 100 // requests per hour per IP
const RATE_LIMIT_WINDOW = 3600000 // 1 hour in milliseconds

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return `dashboard:${ip}`
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = requestCounts.get(key)

  if (!record || now > record.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW
    requestCounts.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: RATE_LIMIT - 1, resetTime }
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT - record.count, resetTime: record.resetTime }
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  return response
}

function addCacheHeaders(response: NextResponse, maxAge: number = CACHE_MAX_AGE): NextResponse {
  response.headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`)
  response.headers.set('ETag', `"dashboard-${Date.now()}"`)
  return response
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Rate limiting check
    const rateLimitKey = getRateLimitKey(request)
    const rateLimit = checkRateLimit(rateLimitKey)

    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      )

      response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString())
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString())
      response.headers.set('Retry-After', Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString())

      return addSecurityHeaders(response)
    }

    const { searchParams } = new URL(request.url)

    // Extract and validate query parameters
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const propertyIds = searchParams.get('property_ids')?.split(',').map(Number).filter(Boolean)
    const leadSourceIds = searchParams.get('lead_source_ids')?.split(',').map(Number).filter(Boolean)
    const utmSource = searchParams.get('utm_source')
    const utmCampaign = searchParams.get('utm_campaign')
    const deviceType = searchParams.get('device_type')
    const countryCode = searchParams.get('country_code')
    const compact = searchParams.get('compact') === 'true' // For mobile/lightweight requests

    // Validate date range (max 90 days)
    const maxRange = 90 * 24 * 60 * 60 * 1000 // 90 days in milliseconds
    const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const defaultEnd = new Date().toISOString().split('T')[0]

    const start = startDate || defaultStart
    const end = endDate || defaultEnd

    if (new Date(end).getTime() - new Date(start).getTime() > maxRange) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date range cannot exceed 90 days',
          code: 'INVALID_DATE_RANGE'
        },
        { status: 400 }
      )
    }

    const filters: AnalyticsFilters = {
      start_date: start,
      end_date: end,
      property_ids: propertyIds,
      lead_source_ids: leadSourceIds,
      utm_source: utmSource || undefined,
      utm_campaign: utmCampaign || undefined,
      device_type: deviceType as any,
      country_code: countryCode || undefined
    }

    // Get dashboard stats with performance monitoring
    const dashboardStats = await AnalyticsService.getDashboardStats(filters)
    const executionTime = Date.now() - startTime

    const response = NextResponse.json({
      success: true,
      data: dashboardStats,
      filters: filters,
      meta: {
        execution_time_ms: executionTime,
        cached: false,
        rate_limit: {
          remaining: rateLimit.remaining,
          reset_time: rateLimit.resetTime
        },
        compact: compact || false
      }
    })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString())

    // Add performance headers
    response.headers.set('X-Response-Time', `${executionTime}ms`)

    return addCacheHeaders(addSecurityHeaders(response))

  } catch (error) {
    console.error('Dashboard analytics API error:', error)

    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard analytics',
        code: 'INTERNAL_ERROR',
        meta: {
          execution_time_ms: Date.now() - startTime
        }
      },
      { status: 500 }
    )

    return addSecurityHeaders(response)
  }
}

// POST endpoint for complex dashboard queries with filters (v4 optimized)
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Rate limiting check
    const rateLimitKey = getRateLimitKey(request)
    const rateLimit = checkRateLimit(rateLimitKey)

    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      )

      response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString())
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString())
      response.headers.set('Retry-After', Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString())

      return addSecurityHeaders(response)
    }

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
      metrics = ['overview'], // Can be 'overview', 'properties', 'campaigns', 'sources', 'devices'
      limit = 10, // Limit for top results
      compact = false // Compact response for mobile
    } = body

    // Validate inputs
    if (!Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Metrics array is required and cannot be empty',
          code: 'INVALID_METRICS'
        },
        { status: 400 }
      )
    }

    const validMetrics = ['overview', 'properties', 'campaigns', 'sources', 'devices', 'all']
    const invalidMetrics = metrics.filter(m => !validMetrics.includes(m))
    if (invalidMetrics.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid metrics: ${invalidMetrics.join(', ')}. Valid options: ${validMetrics.join(', ')}`,
          code: 'INVALID_METRICS'
        },
        { status: 400 }
      )
    }

    // Validate date range (max 90 days)
    const maxRange = 90 * 24 * 60 * 60 * 1000
    const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const defaultEnd = new Date().toISOString().split('T')[0]

    const start = start_date || defaultStart
    const end = end_date || defaultEnd

    if (new Date(end).getTime() - new Date(start).getTime() > maxRange) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date range cannot exceed 90 days',
          code: 'INVALID_DATE_RANGE'
        },
        { status: 400 }
      )
    }

    const filters: AnalyticsFilters = {
      start_date: start,
      end_date: end,
      property_ids,
      lead_source_ids,
      utm_source,
      utm_campaign,
      device_type,
      country_code
    }

    const results: any = {}
    const promises: Promise<any>[] = []

    // Fetch requested metrics in parallel for better performance
    if (metrics.includes('overview') || metrics.includes('all')) {
      promises.push(
        AnalyticsService.getDashboardStats(filters).then(data => {
          results.overview = data
        })
      )
    }

    if (metrics.includes('properties') || metrics.includes('all')) {
      const propertyPromises = [
        AnalyticsService.getTopProperties(Math.min(limit, 50), 'views', 30),
        AnalyticsService.getTopProperties(Math.min(limit, 50), 'leads', 30),
        AnalyticsService.getTopProperties(Math.min(limit, 50), 'conversion_rate', 30)
      ]

      promises.push(
        Promise.all(propertyPromises).then(([byViews, byLeads, byConversion]) => {
          results.top_properties = compact
            ? {
                by_views: byViews.slice(0, 5),
                by_leads: byLeads.slice(0, 5),
                by_conversion: byConversion.slice(0, 5)
              }
            : {
                by_views: byViews,
                by_leads: byLeads,
                by_conversion: byConversion
              }
        })
      )
    }

    if (metrics.includes('campaigns') || metrics.includes('all')) {
      promises.push(
        AnalyticsService.getCampaignStats(filters.start_date, filters.end_date).then(data => {
          results.campaigns = compact ? data.slice(0, 5) : data
        })
      )
    }

    if (metrics.includes('sources') || metrics.includes('all')) {
      promises.push(
        AnalyticsService.getLeadSourceStats(filters.start_date, filters.end_date).then(data => {
          results.lead_sources = compact ? data.slice(0, 5) : data
        })
      )
    }

    if (metrics.includes('devices') || metrics.includes('all')) {
      promises.push(
        AnalyticsService.getDeviceTypeStats(filters.start_date, filters.end_date).then(data => {
          results.devices = compact ? data.slice(0, 5) : data
        })
      )
    }

    // Wait for all metrics to be fetched
    await Promise.all(promises)
    const executionTime = Date.now() - startTime

    const response = NextResponse.json({
      success: true,
      data: results,
      filters: filters,
      meta: {
        execution_time_ms: executionTime,
        metrics_requested: metrics,
        cached: false,
        rate_limit: {
          remaining: rateLimit.remaining,
          reset_time: rateLimit.resetTime
        },
        compact: compact
      }
    })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString())

    // Add performance headers
    response.headers.set('X-Response-Time', `${executionTime}ms`)

    return addCacheHeaders(addSecurityHeaders(response), 60) // Shorter cache for POST

  } catch (error) {
    console.error('Advanced dashboard analytics API error:', error)

    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch advanced analytics',
        code: 'INTERNAL_ERROR',
        meta: {
          execution_time_ms: Date.now() - startTime
        }
      },
      { status: 500 }
    )

    return addSecurityHeaders(response)
  }
}