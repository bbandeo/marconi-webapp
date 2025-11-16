# Analytics API Reference

## Overview

This document provides a comprehensive reference for all analytics API endpoints in the Marconi Inmobiliaria system. All endpoints are located under `/api/analytics/` and follow RESTful conventions.

## Authentication

Most endpoints accept anonymous requests for tracking purposes. Admin-only endpoints require authentication and proper role permissions.

## Base URL

```
https://your-domain.com/api/analytics
```

## Endpoints

### Session Management

#### Create Session
Creates a new analytics session for anonymous user tracking.

**Endpoint**: `POST /api/analytics/session`

**Request Body**:
```json
{
  "device_type": "desktop" | "mobile" | "tablet",
  "browser": "Chrome",
  "os": "Windows",
  "referrer_domain": "google.com",
  "landing_page": "/propiedades/123",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "summer-2025",
  "utm_term": "casa-venta",
  "utm_content": "ad-1"
}
```

**Response**:
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Session created successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Failed to create session",
  "code": "SESSION_CREATION_FAILED"
}
```

#### Update Session Timestamp
Updates the last_seen timestamp for an existing session.

**Endpoint**: `PUT /api/analytics/session?session_id={session_id}`

**Query Parameters**:
- `session_id` (required): UUID of the session to update

**Response**:
```json
{
  "success": true,
  "message": "Session updated successfully"
}
```

### Property Tracking

#### Track Property View
Records a property view event with automatic 2-hour debouncing.

**Endpoint**: `POST /api/analytics/property-view`

**Request Body**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "property_id": 123,
  "time_on_page": 45,
  "scroll_depth": 85,
  "page_url": "https://marconi.com/propiedades/123",
  "referrer_url": "https://google.com/search",
  "contact_button_clicked": false,
  "whatsapp_clicked": true,
  "phone_clicked": false,
  "email_clicked": false,
  "images_viewed": 8,
  "map_interacted": true,
  "similar_properties_clicked": false
}
```

**Response**:
```json
{
  "success": true,
  "event_id": "660e8400-e29b-41d4-a716-446655440000",
  "is_duplicate": false,
  "message": "Property view recorded successfully"
}
```

**Field Descriptions**:
- `session_id` (required): Analytics session UUID
- `property_id` (required): Numeric property ID
- `time_on_page` (optional): Time spent on page in seconds
- `scroll_depth` (optional): Maximum scroll percentage (0-100)
- `contact_button_clicked` (optional): Whether any contact button was clicked
- `whatsapp_clicked` (optional): Whether WhatsApp contact was clicked
- `phone_clicked` (optional): Whether phone contact was clicked
- `email_clicked` (optional): Whether email contact was clicked
- `images_viewed` (optional): Number of property images viewed
- `map_interacted` (optional): Whether user interacted with property map
- `similar_properties_clicked` (optional): Whether user clicked similar properties

#### Get Property Metrics
Retrieves comprehensive analytics for a specific property.

**Endpoint**: `GET /api/analytics/property-metrics/{property_id}?days_back={days}`

**Path Parameters**:
- `property_id` (required): Numeric property ID

**Query Parameters**:
- `days_back` (optional): Number of days to look back (default: 30)

**Response**:
```json
{
  "success": true,
  "data": {
    "total_views": 156,
    "unique_views": 89,
    "avg_time_on_page": 67.5,
    "avg_scroll_depth": 78.2,
    "contact_rate": 12.4,
    "leads_generated": 8,
    "conversion_rate": 8.99
  }
}
```

**Metrics Definitions**:
- `total_views`: Total number of property views
- `unique_views`: Number of unique sessions that viewed the property
- `avg_time_on_page`: Average time spent on property page (seconds)
- `avg_scroll_depth`: Average scroll depth percentage
- `contact_rate`: Percentage of views that resulted in contact interaction
- `leads_generated`: Number of leads generated from this property
- `conversion_rate`: Percentage of unique views that converted to leads

### Lead Tracking

#### Track Lead Generation
Records a lead generation event with attribution to source and session.

**Endpoint**: `PUT /api/analytics/lead-generation`

**Request Body**:
```json
{
  "lead_id": 789,
  "source_code": "formulario_web",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "property_id": 123,
  "form_type": "contact_form",
  "conversion_page": "https://marconi.com/propiedades/123",
  "session_pages_viewed": 3,
  "properties_viewed": 2,
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "summer-2025"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Lead generation event recorded successfully",
  "conversion_time_minutes": 23
}
```

**Lead Source Codes**:
- `formulario_web`: Web contact form
- `whatsapp`: WhatsApp contact
- `telefono`: Phone call
- `email`: Email contact
- `facebook`: Facebook social media
- `instagram`: Instagram social media
- `google_ads`: Google advertising
- `facebook_ads`: Facebook advertising
- `referido`: Client referral
- `walk_in`: Physical office visit
- `marketplace`: Marketplace platforms
- `otros`: Other sources

### User Interactions

#### Track User Interaction
Records granular user interaction events for UX analysis.

**Endpoint**: `POST /api/analytics/interaction`

**Request Body**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "property_id": 123,
  "event_type": "click",
  "event_target": "contact_button",
  "page_url": "https://marconi.com/propiedades/123",
  "event_data": {
    "button_text": "Contactar por WhatsApp",
    "coordinates": { "x": 245, "y": 678 },
    "viewport": { "width": 1920, "height": 1080 }
  }
}
```

**Response**:
```json
{
  "success": true,
  "interaction_id": "770e8400-e29b-41d4-a716-446655440000",
  "message": "Interaction recorded successfully"
}
```

**Common Event Types**:
- `click`: Element click
- `scroll`: Page scroll
- `form_field_focus`: Form field focus
- `form_submit`: Form submission
- `page_load`: Page load
- `page_unload`: Page unload
- `contact_click`: Contact button click
- `image_view`: Image viewing
- `map_interaction`: Map interaction

### GDPR Compliance

#### Opt Out of Tracking
Handles user opt-out requests for GDPR compliance.

**Endpoint**: `POST /api/analytics/gdpr/opt-out`

**Request Body**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "privacy_preference"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Opt-out processed successfully",
  "affected_records": 15
}
```

#### Check Opt-Out Status
Checks if a session has opted out of tracking.

**Endpoint**: `GET /api/analytics/gdpr/opt-out?session_id={session_id}`

**Query Parameters**:
- `session_id` (required): Session UUID to check

**Response**:
```json
{
  "success": true,
  "data": {
    "is_opted_out": false,
    "opt_out_date": null
  }
}
```

### Dashboard & Reporting

#### Get Dashboard Statistics
Retrieves comprehensive dashboard metrics with filtering options.

**Endpoint**: `GET /api/analytics/dashboard`

**Query Parameters**:
- `start_date` (optional): Start date (YYYY-MM-DD format)
- `end_date` (optional): End date (YYYY-MM-DD format)
- `property_id` (optional): Filter by specific property
- `device_type` (optional): Filter by device type
- `utm_source` (optional): Filter by traffic source

**Response**:
```json
{
  "success": true,
  "data": {
    "total_sessions": 1245,
    "total_property_views": 3678,
    "unique_property_views": 2345,
    "total_leads": 89,
    "conversion_rate": 3.79,
    "avg_time_on_page": 78.5,
    "top_properties": [
      {
        "property_id": 123,
        "title": "Casa en Palermo",
        "metric_value": 156,
        "unique_views": 89,
        "leads": 8
      }
    ],
    "top_lead_sources": [
      {
        "source_id": 1,
        "source_name": "Formulario Web",
        "leads_count": 34,
        "conversion_rate": 4.2
      }
    ],
    "traffic_by_device": [
      {
        "device_type": "mobile",
        "sessions": 687,
        "percentage": 55.2
      }
    ],
    "daily_stats": [
      {
        "date": "2025-01-15",
        "sessions": 45,
        "views": 123,
        "leads": 3
      }
    ]
  }
}
```

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details if applicable"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `SESSION_NOT_FOUND`: Session ID not found
- `PROPERTY_NOT_FOUND`: Property ID not found
- `INVALID_SOURCE_CODE`: Lead source code not recognized
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `GDPR_OPT_OUT`: User has opted out of tracking
- `DATABASE_ERROR`: Database operation failed
- `AUTHENTICATION_REQUIRED`: Admin authentication required

### HTTP Status Codes

- `200`: Success
- `201`: Created (for new resources)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions or opted out)
- `404`: Not Found (resource doesn't exist)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Rate Limiting

To prevent abuse, the following rate limits apply:

- **Session Creation**: 10 requests per IP per minute
- **Property Views**: 100 requests per session per hour
- **Interactions**: 1000 requests per session per hour
- **Lead Generation**: 10 requests per session per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641234567
```

## Client Libraries

### JavaScript/TypeScript

```typescript
import { AnalyticsClient } from '@/lib/analytics-client'

const analytics = new AnalyticsClient({
  apiBaseUrl: '/api/analytics',
  enableConsoleLogging: true
})

// Track property view
await analytics.trackPropertyView(123, {
  timeOnPage: 45,
  scrollDepth: 85
})

// Track lead
await analytics.trackLead(789, 'formulario_web', 123)
```

### React Hooks

```typescript
import { useAnalytics, usePropertyAnalytics } from '@/hooks/useAnalytics'

// General analytics
const { trackPropertyView, trackLeadGeneration } = useAnalytics()

// Property-specific analytics (auto-tracks views)
const analytics = usePropertyAnalytics(123)
```

## Testing

### Example Test Requests

#### Create Test Session
```bash
curl -X POST https://your-domain.com/api/analytics/session \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "desktop",
    "browser": "Chrome",
    "os": "Windows",
    "utm_source": "test"
  }'
```

#### Track Test Property View
```bash
curl -X POST https://your-domain.com/api/analytics/property-view \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "your-session-id",
    "property_id": 1,
    "time_on_page": 30,
    "scroll_depth": 50
  }'
```

#### Test GDPR Opt-Out
```bash
curl -X POST https://your-domain.com/api/analytics/gdpr/opt-out \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "your-session-id",
    "reason": "testing"
  }'
```

## Best Practices

### 1. Session Management
- Always create a session before tracking events
- Reuse sessions within the 4-hour validity window
- Handle session creation failures gracefully

### 2. Property View Tracking
- Include as much engagement data as possible (scroll depth, time on page)
- Don't manually handle debouncing - the API handles it automatically
- Track contact interactions for better conversion analysis

### 3. Lead Attribution
- Always include session_id for proper attribution
- Use consistent source codes across your application
- Include UTM parameters when available for campaign tracking

### 4. Error Handling
- Always handle API errors gracefully
- Don't let analytics failures break user experience
- Implement retry logic for critical events

### 5. Performance
- Batch interaction events when possible
- Use appropriate polling intervals for real-time updates
- Cache dashboard data to reduce API calls

### 6. Privacy
- Respect opt-out preferences
- Never send personally identifiable information
- Implement proper consent management