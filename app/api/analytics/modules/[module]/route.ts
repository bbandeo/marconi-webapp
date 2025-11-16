// =====================================================================================
// ANALYTICS MODULES API ROUTE v4 - MODULAR ARCHITECTURE
// =====================================================================================
// Provides module-specific analytics data for dashboard v4
// Supports: overview, sales, marketing, properties, customers modules
// Features: Response caching, rate limiting, security headers, optimized performance
// =====================================================================================

import { NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/services/analytics"
import { type AnalyticsFilters } from "@/types/analytics"

// Cache configuration
const CACHE_MAX_AGE = 300 // 5 minutes in seconds
const CACHE_STALE_WHILE_REVALIDATE = 3600 // 1 hour in seconds

// Rate limiting (simple in-memory store for demo)
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 200 // requests per hour per IP (higher for modules)
const RATE_LIMIT_WINDOW = 3600000 // 1 hour in milliseconds

// Valid modules configuration
const VALID_MODULES = [
  'overview',
  'sales',
  'marketing',
  'properties',
  'customers'
] as const

type ModuleType = typeof VALID_MODULES[number]

// Module-specific configurations
const MODULE_CONFIG = {
  overview: {
    cacheTtl: 300, // 5 minutes
    rateLimit: 100,
    description: 'Executive overview with key metrics and KPIs'
  },
  sales: {
    cacheTtl: 180, // 3 minutes
    rateLimit: 150,
    description: 'Sales performance, pipeline, and conversion metrics'
  },
  marketing: {
    cacheTtl: 240, // 4 minutes
    rateLimit: 120,
    description: 'Marketing campaigns, lead generation, and channel performance'
  },
  properties: {
    cacheTtl: 600, // 10 minutes (changes less frequently)
    rateLimit: 80,
    description: 'Property analytics, performance, and market insights'
  },
  customers: {
    cacheTtl: 480, // 8 minutes
    rateLimit: 100,
    description: 'Customer journey, behavior patterns, and retention analytics'
  }
}

function getRateLimitKey(request: NextRequest, module: string): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return `modules:${module}:${ip}`
}

function checkRateLimit(key: string, limit: number = RATE_LIMIT): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = requestCounts.get(key)

  if (!record || now > record.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW
    requestCounts.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: limit - 1, resetTime }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime }
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  return response
}

function addCacheHeaders(response: NextResponse, maxAge: number): NextResponse {
  response.headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`)
  response.headers.set('ETag', `"module-${Date.now()}"`)
  return response
}

// Module-specific data fetchers
async function getOverviewData(filters: AnalyticsFilters) {
  const [dashboardStats, topProperties] = await Promise.all([
    AnalyticsService.getDashboardStats(filters),
    AnalyticsService.getTopProperties(5, 'views', 7) // Top 5 properties last week
  ])

  return {
    kpis: dashboardStats,
    top_properties: topProperties,
    summary: {
      total_properties: dashboardStats.properties_count || 0,
      total_leads: dashboardStats.leads_count || 0,
      conversion_rate: dashboardStats.conversion_rate || 0,
      avg_time_on_site: dashboardStats.avg_session_duration || 0
    }
  }
}

async function getSalesData(filters: AnalyticsFilters) {
  const [dashboardStats, topProperties, leadSources] = await Promise.all([
    AnalyticsService.getDashboardStats(filters),
    AnalyticsService.getTopProperties(10, 'leads', 30),
    AnalyticsService.getLeadSourceStats(filters.start_date, filters.end_date)
  ])

  return {
    pipeline: {
      total_leads: dashboardStats.leads_count || 0,
      conversion_rate: dashboardStats.conversion_rate || 0,
      avg_lead_value: dashboardStats.avg_lead_value || 0,
      leads_trend: dashboardStats.leads_trend || []
    },
    top_performing_properties: topProperties,
    lead_sources: leadSources,
    conversion_funnel: {
      visitors: dashboardStats.sessions_count || 0,
      property_views: dashboardStats.property_views_count || 0,
      leads: dashboardStats.leads_count || 0,
      conversions: dashboardStats.conversions_count || 0
    }
  }
}

async function getMarketingData(filters: AnalyticsFilters) {
  const [campaignStats, leadSources, deviceStats] = await Promise.all([
    AnalyticsService.getCampaignStats(filters.start_date, filters.end_date),
    AnalyticsService.getLeadSourceStats(filters.start_date, filters.end_date),
    AnalyticsService.getDeviceTypeStats(filters.start_date, filters.end_date)
  ])

  return {
    campaigns: campaignStats,
    lead_sources: leadSources,
    device_breakdown: deviceStats,
    channel_performance: {
      organic: leadSources.find(s => s.source_name === 'organic_search') || {},
      social: leadSources.find(s => s.source_name === 'social_media') || {},
      direct: leadSources.find(s => s.source_name === 'direct') || {},
      referral: leadSources.find(s => s.source_name === 'referral') || {}
    }
  }
}

async function getPropertiesData(filters: AnalyticsFilters) {
  const { supabaseAdmin } = await import('@/lib/supabase')

  const [topByViews, topByLeads, topByConversion, dashboardStats] = await Promise.all([
    AnalyticsService.getTopProperties(20, 'views', 30),
    AnalyticsService.getTopProperties(20, 'leads', 30),
    AnalyticsService.getTopProperties(20, 'conversion_rate', 30),
    AnalyticsService.getDashboardStats(filters)
  ])

  // Get all unique property IDs
  const allPropertiesSet = new Set<number>()
  topByViews.forEach(p => p.property_id && allPropertiesSet.add(p.property_id))
  topByLeads.forEach(p => p.property_id && allPropertiesSet.add(p.property_id))
  topByConversion.forEach(p => p.property_id && allPropertiesSet.add(p.property_id))

  // Fetch full property details from properties table
  const propertyIds = Array.from(allPropertiesSet)
  const { data: propertiesDetails, error: propertiesError } = await supabaseAdmin
    .from('properties')
    .select('id, title, address, neighborhood, price, images, property_type, operation_type, created_at')
    .in('id', propertyIds)

  if (propertiesError) {
    console.error('Failed to fetch properties details:', propertiesError)
  }

  // Create a map for quick property lookup
  const propertiesMap = new Map(
    propertiesDetails?.map(p => [p.id, p]) || []
  )

  // Enrich analytics data with property details
  const enrichProperty = (analyticsData: any) => {
    const propertyDetails = propertiesMap.get(analyticsData.property_id)
    if (!propertyDetails) return analyticsData

    return {
      ...analyticsData,
      // Property details
      address: propertyDetails.address,
      neighborhood: propertyDetails.neighborhood,
      price: propertyDetails.price,
      images: propertyDetails.images,
      property_type: propertyDetails.property_type,
      operation_type: propertyDetails.operation_type,
      created_at: propertyDetails.created_at,
      // Calculate days on market
      days_on_market: Math.floor(
        (new Date().getTime() - new Date(propertyDetails.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )
    }
  }

  const totalProperties = allPropertiesSet.size
  const totalViews = topByViews.reduce((sum, p) => sum + (p.unique_views || 0), 0)
  const avgViewsPerProperty = totalProperties > 0 ? Math.round(totalViews / totalProperties) : 0

  return {
    top_properties: {
      by_views: topByViews.map(enrichProperty),
      by_leads: topByLeads.map(enrichProperty),
      by_conversion_rate: topByConversion.map(enrichProperty)
    },
    overview: {
      total_properties: totalProperties,
      total_views: totalViews,
      avg_views_per_property: avgViewsPerProperty,
      avg_time_on_property: dashboardStats.avg_property_view_duration || 0
    },
    performance_trends: {
      views_trend: dashboardStats.views_trend || [],
      leads_trend: dashboardStats.leads_trend || []
    }
  }
}

async function getCustomersData(filters: AnalyticsFilters) {
  const [dashboardStats, deviceStats, leadSources] = await Promise.all([
    AnalyticsService.getDashboardStats(filters),
    AnalyticsService.getDeviceTypeStats(filters.start_date, filters.end_date),
    AnalyticsService.getLeadSourceStats(filters.start_date, filters.end_date)
  ])

  return {
    behavior_overview: {
      total_sessions: dashboardStats.sessions_count || 0,
      avg_session_duration: dashboardStats.avg_session_duration || 0,
      bounce_rate: dashboardStats.bounce_rate || 0,
      pages_per_session: dashboardStats.pages_per_session || 0
    },
    device_preferences: deviceStats,
    acquisition_channels: leadSources,
    geographic_distribution: dashboardStats.geographic_stats || [],
    engagement_metrics: {
      repeat_visitors: dashboardStats.repeat_visitors || 0,
      new_vs_returning: dashboardStats.new_vs_returning || {},
      time_trends: dashboardStats.hourly_traffic || []
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ module: string }> }
) {
  const startTime = Date.now()
  const { module: moduleParam } = await params
  const module = moduleParam as ModuleType

  try {
    // Validate module
    if (!VALID_MODULES.includes(module)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid module: ${module}. Valid modules: ${VALID_MODULES.join(', ')}`,
          code: 'INVALID_MODULE'
        },
        { status: 400 }
      )
    }

    const moduleConfig = MODULE_CONFIG[module]

    // Rate limiting check
    const rateLimitKey = getRateLimitKey(request, module)
    const rateLimit = checkRateLimit(rateLimitKey, moduleConfig.rateLimit)

    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded for this module. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          module: module
        },
        { status: 429 }
      )

      response.headers.set('X-RateLimit-Limit', moduleConfig.rateLimit.toString())
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
    const compact = searchParams.get('compact') === 'true'

    // Validate date range (max 180 days for modules)
    const maxRange = 180 * 24 * 60 * 60 * 1000 // 180 days in milliseconds
    const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const defaultEnd = new Date().toISOString().split('T')[0]

    const start = startDate || defaultStart
    const end = endDate || defaultEnd

    if (new Date(end).getTime() - new Date(start).getTime() > maxRange) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date range cannot exceed 180 days for module endpoints',
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

    // Fetch module-specific data
    let moduleData: any

    switch (module) {
      case 'overview':
        moduleData = await getOverviewData(filters)
        break
      case 'sales':
        moduleData = await getSalesData(filters)
        break
      case 'marketing':
        moduleData = await getMarketingData(filters)
        break
      case 'properties':
        moduleData = await getPropertiesData(filters)
        break
      case 'customers':
        moduleData = await getCustomersData(filters)
        break
      default:
        throw new Error(`Unhandled module: ${module}`)
    }

    const executionTime = Date.now() - startTime

    const response = NextResponse.json({
      success: true,
      module: module,
      data: moduleData,
      filters: filters,
      meta: {
        execution_time_ms: executionTime,
        cached: false,
        rate_limit: {
          remaining: rateLimit.remaining,
          reset_time: rateLimit.resetTime
        },
        compact: compact || false,
        module_config: {
          description: moduleConfig.description,
          cache_ttl: moduleConfig.cacheTtl
        }
      }
    })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', moduleConfig.rateLimit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString())

    // Add performance headers
    response.headers.set('X-Response-Time', `${executionTime}ms`)
    response.headers.set('X-Module', module)

    return addCacheHeaders(addSecurityHeaders(response), moduleConfig.cacheTtl)

  } catch (error) {
    console.error(`Module ${module} analytics API error:`, error)

    const response = NextResponse.json(
      {
        success: false,
        module: module,
        error: error instanceof Error ? error.message : `Failed to fetch ${module} analytics`,
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

// POST endpoint for complex module queries with custom parameters
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ module: string }> }
) {
  const startTime = Date.now()
  const { module: moduleParam } = await params
  const module = moduleParam as ModuleType

  try {
    // Validate module
    if (!VALID_MODULES.includes(module)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid module: ${module}. Valid modules: ${VALID_MODULES.join(', ')}`,
          code: 'INVALID_MODULE'
        },
        { status: 400 }
      )
    }

    const moduleConfig = MODULE_CONFIG[module]

    // Rate limiting check
    const rateLimitKey = getRateLimitKey(request, module)
    const rateLimit = checkRateLimit(rateLimitKey, moduleConfig.rateLimit)

    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded for this module. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          module: module
        },
        { status: 429 }
      )

      response.headers.set('X-RateLimit-Limit', moduleConfig.rateLimit.toString())
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString())

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
      options = {} // Module-specific options
    } = body

    // Validate date range
    const maxRange = 180 * 24 * 60 * 60 * 1000
    const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const defaultEnd = new Date().toISOString().split('T')[0]

    const start = start_date || defaultStart
    const end = end_date || defaultEnd

    if (new Date(end).getTime() - new Date(start).getTime() > maxRange) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date range cannot exceed 180 days for module endpoints',
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

    // Fetch module-specific data with options
    let moduleData: any

    switch (module) {
      case 'overview':
        moduleData = await getOverviewData(filters)
        break
      case 'sales':
        moduleData = await getSalesData(filters)
        break
      case 'marketing':
        moduleData = await getMarketingData(filters)
        break
      case 'properties':
        moduleData = await getPropertiesData(filters)
        break
      case 'customers':
        moduleData = await getCustomersData(filters)
        break
      default:
        throw new Error(`Unhandled module: ${module}`)
    }

    const executionTime = Date.now() - startTime

    const response = NextResponse.json({
      success: true,
      module: module,
      data: moduleData,
      filters: filters,
      options: options,
      meta: {
        execution_time_ms: executionTime,
        cached: false,
        rate_limit: {
          remaining: rateLimit.remaining,
          reset_time: rateLimit.resetTime
        },
        module_config: {
          description: moduleConfig.description,
          cache_ttl: moduleConfig.cacheTtl
        }
      }
    })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', moduleConfig.rateLimit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString())

    // Add performance headers
    response.headers.set('X-Response-Time', `${executionTime}ms`)
    response.headers.set('X-Module', module)

    return addCacheHeaders(addSecurityHeaders(response), Math.floor(moduleConfig.cacheTtl / 2)) // Shorter cache for POST

  } catch (error) {
    console.error(`Module ${module} POST analytics API error:`, error)

    const response = NextResponse.json(
      {
        success: false,
        module: module,
        error: error instanceof Error ? error.message : `Failed to fetch ${module} analytics`,
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