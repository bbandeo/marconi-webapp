// =====================================================================================
// API MIDDLEWARE - NEXT.JS OPTIMIZED CACHING AND REQUEST HANDLING
// =====================================================================================
// Provides middleware for analytics API routes with intelligent caching,
// compression, and request optimization
// =====================================================================================

import { NextRequest, NextResponse } from "next/server"
import { API_CONFIG, type CacheConfig } from "./api-utils"

// =====================================================================================
// RESPONSE CACHING WITH NEXT.JS
// =====================================================================================

export interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
  etag: string
  compressed?: boolean
}

// In-memory cache (in production, use Redis or edge caching)
const responseCache = new Map<string, CacheEntry>()

// Cache cleanup interval (every 5 minutes)
let cacheCleanupInterval: NodeJS.Timeout | null = null

function startCacheCleanup() {
  if (cacheCleanupInterval) return

  cacheCleanupInterval = setInterval(() => {
    const now = Date.now()
    const expiredKeys: string[] = []

    responseCache.forEach((entry, key) => {
      if (now > entry.timestamp + entry.ttl * 1000) {
        expiredKeys.push(key)
      }
    })

    expiredKeys.forEach(key => responseCache.delete(key))

    console.log(`Cache cleanup: Removed ${expiredKeys.length} expired entries. Cache size: ${responseCache.size}`)
  }, 5 * 60 * 1000) // 5 minutes
}

// Start cleanup on first use
startCacheCleanup()

export function generateCacheKey(
  url: string,
  method: string,
  headers?: Record<string, string>
): string {
  const urlParts = new URL(url)
  const path = urlParts.pathname
  const sortedParams = Array.from(urlParts.searchParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  let key = `${method}:${path}`
  if (sortedParams) {
    key += `?${sortedParams}`
  }

  // Include relevant headers for cache differentiation
  if (headers) {
    const relevantHeaders = ['accept-encoding', 'accept-language', 'x-compact']
    const headerString = relevantHeaders
      .filter(h => headers[h])
      .map(h => `${h}:${headers[h]}`)
      .join('|')

    if (headerString) {
      key += `#${headerString}`
    }
  }

  return key
}

export function getCachedResponse(cacheKey: string): CacheEntry | null {
  const entry = responseCache.get(cacheKey)

  if (!entry) return null

  const now = Date.now()
  const age = now - entry.timestamp

  // Check if entry is expired
  if (age > entry.ttl * 1000) {
    responseCache.delete(cacheKey)
    return null
  }

  return entry
}

export function setCachedResponse(
  cacheKey: string,
  data: any,
  ttl: number = API_CONFIG.cache.default_max_age
): void {
  const entry: CacheEntry = {
    data,
    timestamp: Date.now(),
    ttl,
    etag: `"${Date.now()}-${Math.random().toString(36).substring(2)}"`,
    compressed: false
  }

  responseCache.set(cacheKey, entry)

  // Prevent memory leaks by limiting cache size
  if (responseCache.size > 1000) {
    const oldestKey = responseCache.keys().next().value
    if (oldestKey) {
      responseCache.delete(oldestKey)
    }
  }
}

// =====================================================================================
// REQUEST COMPRESSION
// =====================================================================================

export function shouldCompress(request: NextRequest): boolean {
  const acceptEncoding = request.headers.get('accept-encoding') || ''
  return acceptEncoding.includes('gzip') || acceptEncoding.includes('deflate')
}

export function compressResponse(data: any): string {
  // In a real implementation, use gzip compression
  // For now, just stringify and indicate compression support
  return JSON.stringify(data)
}

// =====================================================================================
// CONDITIONAL REQUESTS (ETags)
// =====================================================================================

export function handleConditionalRequest(
  request: NextRequest,
  etag: string
): NextResponse | null {
  const ifNoneMatch = request.headers.get('if-none-match')

  if (ifNoneMatch === etag) {
    const response = new NextResponse(null, { status: 304 })
    response.headers.set('ETag', etag)
    response.headers.set('Cache-Control', 'max-age=300')
    return response
  }

  return null
}

// =====================================================================================
// MIDDLEWARE FACTORY FOR ANALYTICS API ROUTES
// =====================================================================================

export interface MiddlewareConfig {
  cache?: {
    enabled: boolean
    ttl?: number
    staleWhileRevalidate?: number
    varyByHeaders?: string[]
  }
  compression?: {
    enabled: boolean
    minSize?: number
  }
  rateLimit?: {
    enabled: boolean
    limit?: number
  }
  monitoring?: {
    enabled: boolean
    logRequests?: boolean
  }
}

const DEFAULT_MIDDLEWARE_CONFIG: MiddlewareConfig = {
  cache: {
    enabled: true,
    ttl: API_CONFIG.cache.default_max_age,
    staleWhileRevalidate: API_CONFIG.cache.stale_while_revalidate,
    varyByHeaders: ['accept-language', 'x-compact']
  },
  compression: {
    enabled: true,
    minSize: 1024 // 1KB
  },
  rateLimit: {
    enabled: true,
    limit: API_CONFIG.rateLimit.default_limit
  },
  monitoring: {
    enabled: true,
    logRequests: true
  }
}

export function createApiMiddleware(config: MiddlewareConfig = {}) {
  const finalConfig = { ...DEFAULT_MIDDLEWARE_CONFIG, ...config }

  return function apiMiddleware(
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>
  ) {
    return async function middlewareWrapper(
      request: NextRequest,
      context?: any
    ): Promise<NextResponse> {
      const startTime = Date.now()
      const url = request.url
      const method = request.method

      try {
        // Generate cache key if caching is enabled
        let cacheKey = ''
        let cachedEntry: CacheEntry | null = null

        if (finalConfig.cache?.enabled && method === 'GET') {
          const headers = Object.fromEntries(request.headers.entries())
          cacheKey = generateCacheKey(url, method, headers)
          cachedEntry = getCachedResponse(cacheKey)

          // Check conditional request
          if (cachedEntry) {
            const conditionalResponse = handleConditionalRequest(request, cachedEntry.etag)
            if (conditionalResponse) {
              return conditionalResponse
            }

            // Return cached response
            const response = NextResponse.json(cachedEntry.data)
            response.headers.set('ETag', cachedEntry.etag)
            response.headers.set('X-Cache', 'HIT')
            response.headers.set('X-Cache-Age', Math.floor((Date.now() - cachedEntry.timestamp) / 1000).toString())

            if (finalConfig.cache?.staleWhileRevalidate) {
              response.headers.set(
                'Cache-Control',
                `public, max-age=${finalConfig.cache.ttl}, stale-while-revalidate=${finalConfig.cache.staleWhileRevalidate}`
              )
            }

            return response
          }
        }

        // Execute the actual handler
        const response = await handler(request, context)
        const executionTime = Date.now() - startTime

        // Add performance headers
        response.headers.set('X-Response-Time', `${executionTime}ms`)
        response.headers.set('X-Cache', cachedEntry ? 'HIT' : 'MISS')

        // Cache the response if caching is enabled and it's a successful GET request
        if (
          finalConfig.cache?.enabled &&
          method === 'GET' &&
          response.status === 200 &&
          cacheKey
        ) {
          try {
            const responseData = await response.clone().json()
            setCachedResponse(cacheKey, responseData, finalConfig.cache.ttl)

            // Update response with cache headers
            response.headers.set('X-Cache', 'MISS')
            response.headers.set('ETag', `"${Date.now()}-${Math.random().toString(36).substring(2)}"`)
          } catch (cacheError) {
            console.warn('Failed to cache response:', cacheError)
          }
        }

        // Add compression headers if supported
        if (finalConfig.compression?.enabled && shouldCompress(request)) {
          response.headers.set('Vary', 'Accept-Encoding')
        }

        // Log metrics if monitoring is enabled
        if (finalConfig.monitoring?.enabled && finalConfig.monitoring.logRequests) {
          console.log(`API Request: ${method} ${url} - ${response.status} - ${executionTime}ms`)
        }

        return response

      } catch (error) {
        const executionTime = Date.now() - startTime

        console.error(`API Middleware Error: ${method} ${url} - ${executionTime}ms`, error)

        const errorResponse = NextResponse.json(
          {
            success: false,
            error: 'Internal server error',
            code: 'MIDDLEWARE_ERROR'
          },
          { status: 500 }
        )

        errorResponse.headers.set('X-Response-Time', `${executionTime}ms`)
        errorResponse.headers.set('X-Cache', 'ERROR')

        return errorResponse
      }
    }
  }
}

// =====================================================================================
// PRE-CONFIGURED MIDDLEWARE FOR ANALYTICS ROUTES
// =====================================================================================

export const analyticsApiMiddleware = createApiMiddleware({
  cache: {
    enabled: true,
    ttl: API_CONFIG.cache.dashboard_max_age,
    staleWhileRevalidate: API_CONFIG.cache.stale_while_revalidate
  },
  compression: {
    enabled: true,
    minSize: 512
  },
  rateLimit: {
    enabled: true,
    limit: API_CONFIG.rateLimit.dashboard_limit
  },
  monitoring: {
    enabled: true,
    logRequests: process.env.NODE_ENV !== 'production'
  }
})

export const moduleApiMiddleware = createApiMiddleware({
  cache: {
    enabled: true,
    ttl: API_CONFIG.cache.modules_max_age,
    staleWhileRevalidate: API_CONFIG.cache.stale_while_revalidate
  },
  compression: {
    enabled: true,
    minSize: 1024
  },
  rateLimit: {
    enabled: true,
    limit: API_CONFIG.rateLimit.modules_limit
  },
  monitoring: {
    enabled: true,
    logRequests: process.env.NODE_ENV !== 'production'
  }
})

// =====================================================================================
// CACHE MANAGEMENT UTILITIES
// =====================================================================================

export function getCacheStats(): {
  size: number
  entries: Array<{ key: string; age: number; size: string }>
} {
  const now = Date.now()
  const entries = Array.from(responseCache.entries()).map(([key, entry]) => ({
    key,
    age: Math.floor((now - entry.timestamp) / 1000),
    size: JSON.stringify(entry.data).length + ' bytes'
  }))

  return {
    size: responseCache.size,
    entries
  }
}

export function clearCache(pattern?: string): number {
  if (!pattern) {
    const size = responseCache.size
    responseCache.clear()
    return size
  }

  const regex = new RegExp(pattern)
  let cleared = 0

  responseCache.forEach((_, key) => {
    if (regex.test(key)) {
      responseCache.delete(key)
      cleared++
    }
  })

  return cleared
}

export function warmUpCache(endpoints: string[]): Promise<void[]> {
  // Pre-warm cache with common requests
  return Promise.all(
    endpoints.map(async endpoint => {
      try {
        const response = await fetch(endpoint)
        console.log(`Cache warmed up for: ${endpoint}`)
      } catch (error) {
        console.warn(`Failed to warm up cache for: ${endpoint}`, error)
      }
    })
  )
}