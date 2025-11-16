# Analytics API v4 - Reference Documentation

## Overview

The Analytics API v4 provides comprehensive real estate analytics with optimized performance, intelligent caching, rate limiting, and security features. This API powers the Marconi Inmobiliaria dashboard v4 and supports modular analytics architecture.

## Base URL

```
/api/analytics
```

## Authentication

Currently, the API requires no authentication for development. In production, implement proper authentication middleware.

## Rate Limiting

All endpoints implement rate limiting with the following defaults:
- **Dashboard**: 100 requests/hour per IP
- **Modules**: 200 requests/hour per IP
- **Property Metrics**: 150 requests/hour per IP

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Caching

Responses are cached using Next.js caching with the following configurations:
- **Dashboard**: 5 minutes
- **Modules**: 5-10 minutes (varies by module)
- **Property Metrics**: 2-10 minutes (based on period)

Cache headers:
```
Cache-Control: public, max-age=300, stale-while-revalidate=3600
ETag: "1640995200-abc123"
X-Cache: HIT|MISS
```

## Security Features

All endpoints include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Common Parameters

### Date Filtering
- `start_date` (string, optional): Date in YYYY-MM-DD format
- `end_date` (string, optional): Date in YYYY-MM-DD format
- Default range: Last 30 days

### Property Filtering
- `property_ids` (string, optional): Comma-separated property IDs
- `property_types` (string, optional): Filter by property types

### Campaign Filtering
- `utm_source` (string, optional): UTM source parameter
- `utm_campaign` (string, optional): UTM campaign parameter
- `utm_medium` (string, optional): UTM medium parameter

### Device/Location Filtering
- `device_type` (string, optional): `desktop|mobile|tablet`
- `country_code` (string, optional): ISO 3166-1 alpha-2 country code

### Response Options
- `compact` (boolean, optional): Return simplified response for mobile

## Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "data": object | null,
  "error": string | null,
  "code": string | null,
  "meta": {
    "execution_time_ms": number,
    "cached": boolean,
    "rate_limit": {
      "remaining": number,
      "reset_time": number
    }
  }
}
```

## Error Codes

- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INVALID_DATE_RANGE`: Date range exceeds limits
- `INVALID_PROPERTY_ID`: Invalid property ID format
- `INVALID_MODULE`: Unsupported module name
- `INVALID_METRICS`: Invalid metrics requested
- `INTERNAL_ERROR`: Server error

---

## Endpoints

### 1. Dashboard Overview

Get comprehensive dashboard statistics.

#### GET `/api/analytics/dashboard`

**Query Parameters:**
- Standard date, property, campaign, and device filters
- `compact` (boolean): Simplified response

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions_count": 1250,
    "property_views_count": 3420,
    "leads_count": 156,
    "conversion_rate": 4.56,
    "avg_session_duration": 320,
    "bounce_rate": 35.2,
    "properties_count": 45,
    "top_properties": [...],
    "trends": {
      "sessions_trend": [...],
      "leads_trend": [...],
      "views_trend": [...]
    }
  },
  "filters": {...},
  "meta": {...}
}
```

#### POST `/api/analytics/dashboard`

Complex dashboard queries with custom metrics selection.

**Request Body:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "metrics": ["overview", "properties", "campaigns"],
  "limit": 10,
  "compact": false
}
```

**Supported Metrics:**
- `overview`: Core dashboard KPIs
- `properties`: Top-performing properties
- `campaigns`: UTM campaign performance
- `sources`: Lead source breakdown
- `devices`: Device type analytics
- `all`: All available metrics

---

### 2. Module Analytics

Get analytics for specific dashboard modules.

#### GET `/api/analytics/modules/{module}`

**Supported Modules:**
- `overview`: Executive overview
- `sales`: Sales performance
- `marketing`: Marketing & lead analytics
- `properties`: Property-specific analytics
- `customers`: Customer behavior analytics

**Query Parameters:**
- Standard filtering parameters
- Module-specific parameters

#### Overview Module
```json
{
  "success": true,
  "module": "overview",
  "data": {
    "kpis": {
      "total_properties": 45,
      "total_leads": 156,
      "conversion_rate": 4.56,
      "avg_time_on_site": 320
    },
    "top_properties": [...],
    "summary": {...}
  }
}
```

#### Sales Module
```json
{
  "data": {
    "pipeline": {
      "total_leads": 156,
      "conversion_rate": 4.56,
      "avg_lead_value": 2500,
      "leads_trend": [...]
    },
    "top_performing_properties": [...],
    "lead_sources": [...],
    "conversion_funnel": {
      "visitors": 1250,
      "property_views": 3420,
      "leads": 156,
      "conversions": 23
    }
  }
}
```

#### Marketing Module
```json
{
  "data": {
    "campaigns": [...],
    "lead_sources": [...],
    "device_breakdown": [...],
    "channel_performance": {
      "organic": {...},
      "social": {...},
      "direct": {...},
      "referral": {...}
    }
  }
}
```

#### Properties Module
```json
{
  "data": {
    "top_properties": {
      "by_views": [...],
      "by_leads": [...],
      "by_conversion_rate": [...]
    },
    "overview": {
      "total_properties": 45,
      "total_views": 3420,
      "avg_views_per_property": 76,
      "avg_time_on_property": 180
    },
    "performance_trends": {
      "views_trend": [...],
      "leads_trend": [...]
    }
  }
}
```

#### Customers Module
```json
{
  "data": {
    "behavior_overview": {
      "total_sessions": 1250,
      "avg_session_duration": 320,
      "bounce_rate": 35.2,
      "pages_per_session": 3.4
    },
    "device_preferences": [...],
    "acquisition_channels": [...],
    "geographic_distribution": [...],
    "engagement_metrics": {
      "repeat_visitors": 340,
      "new_vs_returning": {...},
      "time_trends": [...]
    }
  }
}
```

#### POST `/api/analytics/modules/{module}`

Complex module queries with custom options.

**Request Body:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "options": {
    "include_trends": true,
    "granularity": "daily",
    "top_n": 20
  }
}
```

---

### 3. Property Metrics

Get detailed analytics for individual properties.

#### GET `/api/analytics/property-metrics/{id}`

**Path Parameters:**
- `id` (integer): Property ID

**Query Parameters:**
- `period` (string): `7d|30d|90d|1y` (default: 30d)
- `start_date`, `end_date`: Custom date range
- `compact` (boolean): Simplified response

**Response:**
```json
{
  "success": true,
  "data": {
    "property_id": 123,
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "period": "30d",
      "days_back": 30
    },
    "metrics": {
      "total_views": 245,
      "unique_visitors": 198,
      "total_leads": 12,
      "conversion_rate": 4.9,
      "avg_time_on_page": 180,
      "bounce_rate": 25.3,
      "images_viewed": 8.4,
      "contact_button_clicks": 45,
      "phone_clicks": 12,
      "whatsapp_clicks": 23,
      "email_clicks": 8,
      "trends": {
        "daily_views": [...],
        "daily_leads": [...]
      },
      "traffic_sources": [...],
      "device_breakdown": [...]
    }
  },
  "meta": {...}
}
```

**Compact Response:**
```json
{
  "metrics": {
    "total_views": 245,
    "total_leads": 12,
    "conversion_rate": 4.9,
    "avg_time_on_page": 180
  }
}
```

---

## Rate Limits by Endpoint

| Endpoint | Requests/Hour | Cache TTL |
|----------|---------------|-----------|
| `/dashboard` (GET) | 100 | 5 min |
| `/dashboard` (POST) | 100 | 1 min |
| `/modules/overview` | 200 | 5 min |
| `/modules/sales` | 150 | 3 min |
| `/modules/marketing` | 120 | 4 min |
| `/modules/properties` | 80 | 10 min |
| `/modules/customers` | 100 | 8 min |
| `/property-metrics/{id}` | 150 | 2-10 min |

## Performance Guidelines

### Optimization Tips
1. **Use compact mode** for mobile applications
2. **Cache responses** on the client side when appropriate
3. **Batch requests** using POST endpoints when possible
4. **Use appropriate date ranges** (shorter = faster)
5. **Limit property filters** to essential properties only

### Expected Response Times
- Dashboard overview: < 200ms
- Module analytics: < 300ms
- Property metrics: < 150ms
- Complex POST queries: < 500ms

## Examples

### Get Sales Module Analytics for Last 7 Days
```bash
curl -X GET "/api/analytics/modules/sales?period=7d&compact=true" \
  -H "Accept: application/json"
```

### Get Property Performance for Specific Properties
```bash
curl -X POST "/api/analytics/dashboard" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "property_ids": [1, 2, 3],
    "metrics": ["properties"],
    "limit": 5
  }'
```

### Get Compact Property Metrics
```bash
curl -X GET "/api/analytics/property-metrics/123?period=30d&compact=true" \
  -H "Accept: application/json"
```

## Migration from v3

### Breaking Changes
1. **Response format**: Now includes standardized `meta` object
2. **Rate limiting**: New rate limits implemented
3. **Error codes**: Standardized error code format
4. **Cache headers**: New caching strategy

### New Features
1. **Module-based architecture**: `/modules/{module}` endpoints
2. **Compact responses**: `compact=true` parameter
3. **Enhanced security**: Security headers on all responses
4. **Performance monitoring**: Response time headers
5. **Better error handling**: Detailed error codes and messages

### Compatibility
- All v3 endpoints remain functional
- v3 parameters are fully supported
- Response data structure is backward compatible (new fields added)

## Monitoring

### Response Headers for Debugging
```
X-Response-Time: 245ms
X-Cache: HIT
X-Module: sales
X-Property-ID: 123
X-RateLimit-Remaining: 95
```

### Health Check
```bash
curl -X GET "/api/analytics/dashboard?compact=true" \
  -H "Accept: application/json"
```

Expected response time: < 100ms for cached responses, < 200ms for fresh data.

---

## Support

For API support and feature requests, contact the development team or create an issue in the project repository.

**Version**: 4.0.0
**Last Updated**: December 2024
**Status**: Production Ready