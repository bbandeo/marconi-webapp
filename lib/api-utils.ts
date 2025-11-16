// =====================================================================================
// API UTILITIES - SHARED FUNCTIONALITY FOR ANALYTICS API ROUTES
// =====================================================================================
// Provides reusable utilities for rate limiting, caching, security, and validation
// Used across all analytics API endpoints for consistency
// =====================================================================================

import { NextRequest, NextResponse } from "next/server"
import { type AnalyticsFilters } from "@/types/analytics"

// =====================================================================================
// CONFIGURATION CONSTANTS
// =====================================================================================

export const API_CONFIG = {
  cache: {
    default_max_age: 300, // 5 minutes
    stale_while_revalidate: 3600, // 1 hour
    dashboard_max_age: 300,
    modules_max_age: 300,
    properties_max_age: 600, // Properties change less frequently
  },
  rateLimit: {
    default_limit: 100,
    dashboard_limit: 100,
    modules_limit: 200,
    window_ms: 3600000, // 1 hour
  },
  validation: {
    max_date_range_days: 180,
    max_properties_limit: 100,
    max_lead_sources_limit: 50,
  }
} as const

// =====================================================================================
// RATE LIMITING
// =====================================================================================

interface RateLimitRecord {
  count: number
  resetTime: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  limit: number
}

// In-memory store for rate limiting (in production, use Redis)
const requestCounts = new Map<string, RateLimitRecord>()

export function getRateLimitKey(request: NextRequest, prefix: string = 'api'): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return `${prefix}:${ip}`
}

export function checkRateLimit(
  key: string,
  limit: number = API_CONFIG.rateLimit.default_limit
): RateLimitResult {
  const now = Date.now()
  const record = requestCounts.get(key)

  if (!record || now > record.resetTime) {
    const resetTime = now + API_CONFIG.rateLimit.window_ms
    requestCounts.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: limit - 1, resetTime, limit }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime, limit }
  }

  record.count++
  return {
    allowed: true,
    remaining: limit - record.count,
    resetTime: record.resetTime,
    limit
  }
}

export function addRateLimitHeaders(response: NextResponse, rateLimit: RateLimitResult): void {
  response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString())

  if (!rateLimit.allowed) {
    response.headers.set('Retry-After', Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString())
  }
}

export function createRateLimitResponse(rateLimit: RateLimitResult, context?: string): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      context: context || 'API'
    },
    { status: 429 }
  )

  addRateLimitHeaders(response, rateLimit)
  return response
}

// =====================================================================================
// SECURITY HEADERS
// =====================================================================================

export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow') // Prevent indexing of API routes
  return response
}

// =====================================================================================
// CACHING
// =====================================================================================

export interface CacheConfig {
  maxAge: number
  staleWhileRevalidate?: number
  private?: boolean
  mustRevalidate?: boolean
}

export function addCacheHeaders(
  response: NextResponse,
  config: CacheConfig = { maxAge: API_CONFIG.cache.default_max_age }
): NextResponse {
  const { maxAge, staleWhileRevalidate, private: isPrivate, mustRevalidate } = config

  const cacheDirectives = [
    isPrivate ? 'private' : 'public',
    `max-age=${maxAge}`,
    `s-maxage=${maxAge}`
  ]

  if (staleWhileRevalidate) {
    cacheDirectives.push(`stale-while-revalidate=${staleWhileRevalidate}`)
  }

  if (mustRevalidate) {
    cacheDirectives.push('must-revalidate')
  }

  response.headers.set('Cache-Control', cacheDirectives.join(', '))
  response.headers.set('ETag', `"${Date.now()}-${Math.random().toString(36).substring(2)}"`)

  return response
}

// Cache key generation for analytics
export function generateCacheKey(
  endpoint: string,
  filters: AnalyticsFilters,
  additional?: Record<string, any>
): string {
  const filterString = Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== null)
    .sort()
    .map(([key, value]) => `${key}:${Array.isArray(value) ? value.sort().join(',') : value}`)
    .join('|')

  const additionalString = additional
    ? Object.entries(additional)
        .sort()
        .map(([key, value]) => `${key}:${value}`)
        .join('|')
    : ''

  return `${endpoint}:${filterString}${additionalString ? ':' + additionalString : ''}`
}

// =====================================================================================
// VALIDATION
// =====================================================================================

export interface ValidationResult {
  valid: boolean
  error?: string
  code?: string
}

export function validateDateRange(startDate: string, endDate: string, maxDays: number = API_CONFIG.validation.max_date_range_days): ValidationResult {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        valid: false,
        error: 'Invalid date format. Use YYYY-MM-DD format.',
        code: 'INVALID_DATE_FORMAT'
      }
    }

    if (start > end) {
      return {
        valid: false,
        error: 'Start date cannot be after end date.',
        code: 'INVALID_DATE_ORDER'
      }
    }

    const rangeDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    if (rangeDays > maxDays) {
      return {
        valid: false,
        error: `Date range cannot exceed ${maxDays} days.`,
        code: 'INVALID_DATE_RANGE'
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to validate date range.',
      code: 'DATE_VALIDATION_ERROR'
    }
  }
}

export function validateFilters(filters: Partial<AnalyticsFilters>): ValidationResult {
  // Validate property IDs
  if (filters.property_ids && filters.property_ids.length > API_CONFIG.validation.max_properties_limit) {
    return {
      valid: false,
      error: `Cannot filter by more than ${API_CONFIG.validation.max_properties_limit} properties.`,
      code: 'TOO_MANY_PROPERTIES'
    }
  }

  // Validate lead source IDs
  if (filters.lead_source_ids && filters.lead_source_ids.length > API_CONFIG.validation.max_lead_sources_limit) {
    return {
      valid: false,
      error: `Cannot filter by more than ${API_CONFIG.validation.max_lead_sources_limit} lead sources.`,
      code: 'TOO_MANY_LEAD_SOURCES'
    }
  }

  // Validate device type
  if (filters.device_type && !['desktop', 'mobile', 'tablet'].includes(filters.device_type)) {
    return {
      valid: false,
      error: 'Device type must be one of: desktop, mobile, tablet.',
      code: 'INVALID_DEVICE_TYPE'
    }
  }

  // Validate country code (ISO 3166-1 alpha-2)
  if (filters.country_code && !/^[A-Z]{2}$/.test(filters.country_code)) {
    return {
      valid: false,
      error: 'Country code must be a valid ISO 3166-1 alpha-2 code (e.g., US, ES, AR).',
      code: 'INVALID_COUNTRY_CODE'
    }
  }

  return { valid: true }
}

// =====================================================================================
// RESPONSE HELPERS
// =====================================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  meta?: {
    execution_time_ms?: number
    cached?: boolean
    rate_limit?: {
      remaining: number
      reset_time: number
    }
    [key: string]: any
  }
}

export function createSuccessResponse<T>(
  data: T,
  meta: Record<string, any> = {}
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      cached: false,
      ...meta
    }
  }
}

export function createErrorResponse(
  error: string,
  code: string = 'INTERNAL_ERROR',
  meta: Record<string, any> = {}
): ApiResponse {
  return {
    success: false,
    error,
    code,
    meta
  }
}

export function addPerformanceHeaders(response: NextResponse, executionTime: number): void {
  response.headers.set('X-Response-Time', `${executionTime}ms`)
}

// =====================================================================================
// REQUEST PARSING
// =====================================================================================

export function parseAnalyticsFilters(searchParams: URLSearchParams): AnalyticsFilters {
  const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const defaultEnd = new Date().toISOString().split('T')[0]

  return {
    start_date: searchParams.get('start_date') || defaultStart,
    end_date: searchParams.get('end_date') || defaultEnd,
    property_ids: searchParams.get('property_ids')?.split(',').map(Number).filter(Boolean),
    lead_source_ids: searchParams.get('lead_source_ids')?.split(',').map(Number).filter(Boolean),
    utm_source: searchParams.get('utm_source') || undefined,
    utm_campaign: searchParams.get('utm_campaign') || undefined,
    device_type: (searchParams.get('device_type') as any) || undefined,
    country_code: searchParams.get('country_code') || undefined
  }
}

export function parseCompactFlag(searchParams: URLSearchParams): boolean {
  return searchParams.get('compact') === 'true'
}

// =====================================================================================
// ERROR HANDLING
// =====================================================================================

export function handleApiError(error: unknown, context: string = 'API'): ApiResponse {
  console.error(`${context} error:`, error)

  if (error instanceof Error) {
    return createErrorResponse(error.message, 'INTERNAL_ERROR')
  }

  return createErrorResponse(`Unknown error in ${context}`, 'UNKNOWN_ERROR')
}

// =====================================================================================
// MONITORING AND LOGGING
// =====================================================================================

export interface ApiMetrics {
  endpoint: string
  method: string
  status_code: number
  execution_time_ms: number
  rate_limited: boolean
  cached: boolean
  user_ip?: string
  user_agent?: string
}

export function logApiMetrics(metrics: ApiMetrics): void {
  // In production, send to monitoring service (DataDog, New Relic, etc.)
  console.log('API Metrics:', JSON.stringify(metrics, null, 2))
}

export function extractRequestMetadata(request: NextRequest): {
  ip: string
  userAgent: string
  method: string
} {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const method = request.method

  return { ip, userAgent, method }
}