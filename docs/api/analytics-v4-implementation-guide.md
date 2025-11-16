# Analytics API v4 - Implementation Guide

## Quick Start

This guide helps developers integrate with the optimized Analytics API v4.

## Installation & Setup

No additional dependencies required. The API is available at `/api/analytics` endpoints.

## Client-Side Integration

### Basic Usage

```typescript
// Basic dashboard data fetch
const dashboardData = await fetch('/api/analytics/dashboard?compact=true')
  .then(res => res.json())

if (dashboardData.success) {
  console.log('Dashboard data:', dashboardData.data)
} else {
  console.error('Error:', dashboardData.error)
}
```

### Advanced Usage with Filtering

```typescript
// Complex analytics query
const salesData = await fetch('/api/analytics/modules/sales', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    property_ids: [1, 2, 3],
    utm_campaign: 'winter-2024',
    options: {
      include_trends: true,
      top_n: 10
    }
  })
}).then(res => res.json())
```

## React Hook Implementation

### useAnalyticsDashboard Hook

```typescript
import { useState, useEffect } from 'react'

interface DashboardFilters {
  startDate?: string
  endDate?: string
  propertyIds?: number[]
  compact?: boolean
}

export function useAnalyticsDashboard(filters: DashboardFilters = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (filters.startDate) params.set('start_date', filters.startDate)
        if (filters.endDate) params.set('end_date', filters.endDate)
        if (filters.propertyIds) params.set('property_ids', filters.propertyIds.join(','))
        if (filters.compact) params.set('compact', 'true')

        const response = await fetch(`/api/analytics/dashboard?${params}`)
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [filters.startDate, filters.endDate, filters.propertyIds, filters.compact])

  return { data, loading, error }
}
```

### useModuleAnalytics Hook

```typescript
export function useModuleAnalytics(module: string, filters: any = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchModule = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/analytics/modules/${module}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(filters)
        })

        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchModule()
  }, [module, JSON.stringify(filters)])

  return { data, loading, error }
}
```

## Error Handling

### Comprehensive Error Handler

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
  meta?: any
}

class AnalyticsApiError extends Error {
  code: string
  statusCode: number

  constructor(message: string, code: string, statusCode: number) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.name = 'AnalyticsApiError'
  }
}

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const result: ApiResponse<T> = await response.json()

    if (!result.success) {
      throw new AnalyticsApiError(
        result.error || 'Unknown API error',
        result.code || 'UNKNOWN_ERROR',
        response.status
      )
    }

    return result.data!
  } catch (error) {
    if (error instanceof AnalyticsApiError) {
      throw error
    }
    throw new AnalyticsApiError(
      'Network or parsing error',
      'NETWORK_ERROR',
      0
    )
  }
}
```

### Error Handling in Components

```typescript
function DashboardComponent() {
  const [data, setData] = useState(null)
  const [error, setError] = useState<AnalyticsApiError | null>(null)

  useEffect(() => {
    apiRequest('/api/analytics/dashboard?compact=true')
      .then(setData)
      .catch((err: AnalyticsApiError) => {
        setError(err)

        // Handle specific error types
        switch (err.code) {
          case 'RATE_LIMIT_EXCEEDED':
            console.log('Rate limited, retrying in 1 minute...')
            break
          case 'INVALID_DATE_RANGE':
            console.log('Invalid date range provided')
            break
          default:
            console.log('General error:', err.message)
        }
      })
  }, [])

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return <div>{/* Render dashboard */}</div>
}
```

## Rate Limiting Handling

### Automatic Retry with Exponential Backoff

```typescript
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000

        console.log(`Rate limited, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      return result.data
    } catch (error) {
      lastError = error

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}
```

## Caching Strategy

### Client-Side Caching with React Query

```typescript
import { useQuery } from '@tanstack/react-query'

function useDashboardAnalytics(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', filters],
    queryFn: () => apiRequest(`/api/analytics/dashboard`, {
      method: 'POST',
      body: JSON.stringify(filters)
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  })
}

function useModuleAnalytics(module: string, filters: any) {
  return useQuery({
    queryKey: ['analytics', 'module', module, filters],
    queryFn: () => apiRequest(`/api/analytics/modules/${module}`, {
      method: 'POST',
      body: JSON.stringify(filters)
    }),
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  })
}
```

## Performance Optimization

### Batch Requests

```typescript
// Instead of multiple individual requests
const dashboardData = await apiRequest('/api/analytics/dashboard')
const salesData = await apiRequest('/api/analytics/modules/sales')
const marketingData = await apiRequest('/api/analytics/modules/marketing')

// Use single request with multiple metrics
const batchData = await apiRequest('/api/analytics/dashboard', {
  method: 'POST',
  body: JSON.stringify({
    metrics: ['overview', 'properties', 'campaigns', 'sources']
  })
})
```

### Compact Mode for Mobile

```typescript
function isMobile() {
  return window.innerWidth < 768
}

function useDashboard() {
  const compact = isMobile()

  return useQuery({
    queryKey: ['dashboard', { compact }],
    queryFn: () => apiRequest(`/api/analytics/dashboard?compact=${compact}`)
  })
}
```

## Module-Specific Implementation

### Sales Module Integration

```typescript
function SalesDashboard() {
  const { data, loading, error } = useModuleAnalytics('sales', {
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    options: {
      include_trends: true,
      top_n: 10
    }
  })

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      <SalesPipelineChart data={data.pipeline} />
      <ConversionFunnelChart data={data.conversion_funnel} />
      <TopPropertiesTable data={data.top_performing_properties} />
      <LeadSourcesChart data={data.lead_sources} />
    </div>
  )
}
```

### Property Analytics Integration

```typescript
function PropertyAnalytics({ propertyId }: { propertyId: number }) {
  const [period, setPeriod] = useState('30d')

  const { data, loading } = useQuery({
    queryKey: ['property-metrics', propertyId, period],
    queryFn: () => apiRequest(`/api/analytics/property-metrics/${propertyId}?period=${period}`)
  })

  return (
    <div>
      <PeriodSelector value={period} onChange={setPeriod} />
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <PropertyKPICards metrics={data.metrics} />
          <PropertyTrendsChart trends={data.metrics.trends} />
          <TrafficSourcesChart sources={data.metrics.traffic_sources} />
        </>
      )}
    </div>
  )
}
```

## TypeScript Definitions

```typescript
// API Response Types
interface DashboardStats {
  sessions_count: number
  property_views_count: number
  leads_count: number
  conversion_rate: number
  avg_session_duration: number
  bounce_rate: number
  properties_count: number
  top_properties: TopProperty[]
  trends: {
    sessions_trend: TrendPoint[]
    leads_trend: TrendPoint[]
    views_trend: TrendPoint[]
  }
}

interface ModuleData {
  sales: SalesModuleData
  marketing: MarketingModuleData
  properties: PropertiesModuleData
  customers: CustomersModuleData
}

interface PropertyMetrics {
  total_views: number
  unique_visitors: number
  total_leads: number
  conversion_rate: number
  avg_time_on_page: number
  bounce_rate: number
  trends: {
    daily_views: TrendPoint[]
    daily_leads: TrendPoint[]
  }
}

// Filter Types
interface AnalyticsFilters {
  start_date?: string
  end_date?: string
  property_ids?: number[]
  lead_source_ids?: number[]
  utm_source?: string
  utm_campaign?: string
  device_type?: 'desktop' | 'mobile' | 'tablet'
  country_code?: string
}
```

## Testing

### Jest Test Example

```typescript
import { apiRequest } from './analytics-api'

// Mock fetch for testing
global.fetch = jest.fn()

describe('Analytics API', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  test('should fetch dashboard data successfully', async () => {
    const mockResponse = {
      success: true,
      data: { sessions_count: 100 },
      meta: { execution_time_ms: 50 }
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await apiRequest('/api/analytics/dashboard')

    expect(fetch).toHaveBeenCalledWith('/api/analytics/dashboard', expect.any(Object))
    expect(result).toEqual(mockResponse.data)
  })

  test('should handle rate limiting', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      status: 429,
      headers: new Map([['Retry-After', '60']]),
      json: async () => ({
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED'
      })
    })

    await expect(apiRequest('/api/analytics/dashboard')).rejects.toThrow('Rate limit exceeded')
  })
})
```

## Production Considerations

### Environment Configuration

```typescript
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000,
  retries: 3,
  cacheEnabled: process.env.NODE_ENV === 'production'
}
```

### Monitoring Integration

```typescript
// Add telemetry to API calls
function trackApiCall(endpoint: string, duration: number, success: boolean) {
  // Send to analytics service (Google Analytics, Mixpanel, etc.)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'api_call', {
      endpoint,
      duration,
      success,
      custom_map: { metric1: 'endpoint' }
    })
  }
}
```

This implementation guide provides everything needed to integrate with the Analytics API v4 effectively, including error handling, caching, and performance optimization strategies.