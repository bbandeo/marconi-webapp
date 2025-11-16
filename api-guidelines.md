# Marconi Inmobiliaria API Guidelines

## Overview

This document provides comprehensive guidelines for using the Marconi Inmobiliaria Analytics & Geocoding API. These endpoints were designed to provide real estate analytics tracking, GDPR-compliant user session management, and geocoding services for the Marconi Inmobiliaria platform.

## Base URLs

- **Production**: `https://marconi-inmobiliaria.vercel.app/api`
- **Development**: `http://localhost:3000/api`

## Authentication & Authorization

Currently, all endpoints are publicly accessible. Authentication may be required for admin-only endpoints in future versions.

### Future Security Implementation

```http
Authorization: Bearer <JWT_TOKEN>
X-API-Key: <API_KEY>
```

## Core Principles

### 1. Consistent Response Format

All API responses follow a standard envelope structure:

```json
{
  "success": boolean,
  "error": string | null,
  "message": string | null,
  "data": object | null
}
```

### 2. Error Handling

#### Standard Error Codes
- `400` - Bad Request (validation errors, missing parameters)
- `401` - Unauthorized (future implementation)
- `403` - Forbidden (GDPR opt-out violations)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

#### Error Response Example

```json
{
  "success": false,
  "error": "Property ID is required and must be a positive integer",
  "field": "property_id"
}
```

### 3. GDPR Compliance

All analytics endpoints implement GDPR compliance through:
- **IP Address Hashing**: Client IPs are automatically hashed using SHA-256 with salt
- **Opt-out Support**: Users can opt out via `/analytics/gdpr/opt-out`
- **Session Deduplication**: Prevents tracking the same user multiple times
- **Data Minimization**: Only essential tracking data is collected

## API Endpoints Reference

### 1. Geocoding API

#### `GET /geocode`

Converts addresses to coordinates with intelligent caching and fallback.

**Features:**
- 24-hour in-memory caching
- Rate limiting (1 request/second)
- Argentina-specific filtering
- Automatic fallback to Reconquista coordinates

**Request:**
```http
GET /geocode?address=San%20Martin%20123,%20Reconquista,%20Santa%20Fe
```

**Response:**
```json
{
  "lat": -29.15,
  "lng": -59.65,
  "display_name": "San Martin 123, Reconquista, Santa Fe, Argentina"
}
```

**Implementation Notes:**
- Uses OpenStreetMap Nominatim as backend service
- Implements automatic cleanup of expired cache entries (>1000 entries)
- Always returns valid coordinates (fallback prevents null responses)

### 2. Analytics Session Management

#### `POST /analytics/session`

Creates or retrieves analytics sessions with GDPR compliance.

**Session Deduplication Logic:**
- Sessions are deduplicated based on IP hash + User Agent
- 4-hour window for session reuse
- IP addresses are hashed immediately upon receipt

**Request:**
```json
{
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "device_type": "desktop",
  "browser": "Chrome",
  "os": "Windows 10",
  "country_code": "AR",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "property_search_2024"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### `PUT /analytics/session?session_id={uuid}`

Updates last seen timestamp for session heartbeat tracking.

### 3. Property View Tracking

#### `POST /analytics/property-view`

Records property view events with automatic debouncing.

**Debouncing Logic:**
- Prevents duplicate views for the same property/session within 2 hours
- Uses PostgreSQL function `should_record_property_view()`
- Maintains view accuracy while preventing spam

**Request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "property_id": 123,
  "time_on_page": 45,
  "scroll_depth": 85.5,
  "contact_button_clicked": true,
  "whatsapp_clicked": false,
  "phone_clicked": false,
  "email_clicked": false,
  "images_viewed": 3,
  "page_url": "https://marconi-inmobiliaria.vercel.app/propiedades/123",
  "referrer_url": "https://google.com/search?q=casas+reconquista"
}
```

#### `PUT /analytics/property-view`

Combined endpoint that handles both session creation and property view tracking in a single request. Ideal for simplified client-side integration.

### 4. User Interaction Tracking

#### `POST /analytics/interaction`

Records individual user interaction events for UX analysis.

**Supported Event Types:**
- `click` - General click events
- `scroll` - Scroll milestone tracking
- `form_field_focus` - Form field interactions
- `form_submit` - Form submission attempts
- `contact_click` - Contact button interactions
- `phone_click` - Phone number clicks
- `whatsapp_click` - WhatsApp button clicks
- `email_click` - Email link clicks
- `image_view` - Image gallery interactions
- `gallery_interaction` - Photo gallery navigation

**Request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "property_id": 123,
  "event_type": "contact_click",
  "event_target": "#contact-form-button",
  "page_url": "https://marconi-inmobiliaria.vercel.app/propiedades/123",
  "event_data": {
    "contact_method": "whatsapp",
    "button_position": "top"
  }
}
```

#### `PUT /analytics/interaction`

Batch endpoint for recording multiple interactions (max 100 per request).

**Request:**
```json
{
  "interactions": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "event_type": "scroll",
      "page_url": "https://marconi-inmobiliaria.vercel.app/propiedades/123",
      "event_data": { "scroll_percentage": 25 }
    },
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "event_type": "image_view",
      "page_url": "https://marconi-inmobiliaria.vercel.app/propiedades/123",
      "event_data": { "image_index": 2, "image_url": "..." }
    }
  ]
}
```

### 5. Lead Generation Attribution

#### `POST /analytics/lead-generation`

Records lead generation events with full attribution tracking.

**Attribution Features:**
- Session to lead correlation
- UTM parameter preservation
- Time-to-conversion tracking
- Multi-touch attribution support

**Request:**
```json
{
  "lead_id": 456,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "property_id": 123,
  "lead_source_id": 1,
  "form_type": "contact",
  "time_to_conversion": 15,
  "session_pages_viewed": 3,
  "properties_viewed": 2,
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "property_search_2024"
}
```

#### `PUT /analytics/lead-generation`

Simplified endpoint using source codes for automatic lead source lookup.

**Available Source Codes:**
- `formulario_web` - Web contact forms
- `whatsapp` - WhatsApp inquiries
- `telefono` - Phone call inquiries
- `email` - Email inquiries
- `facebook` - Facebook leads
- `instagram` - Instagram leads
- `google_ads` - Google Ads campaigns
- `facebook_ads` - Facebook advertising
- `referido` - Referral leads
- `walk_in` - Walk-in leads
- `marketplace` - Real estate marketplace leads
- `otros` - Other sources

### 6. Dashboard Analytics

#### `GET /analytics/dashboard`

Retrieves comprehensive analytics data with flexible filtering.

**Available Filters:**
- `start_date` / `end_date` - Date range filtering
- `property_ids` - Filter by specific properties
- `lead_source_ids` - Filter by lead sources
- `utm_source` / `utm_campaign` - Marketing attribution
- `device_type` - Device-based filtering
- `country_code` - Geographic filtering

**Example Request:**
```http
GET /analytics/dashboard?start_date=2024-01-01&end_date=2024-01-31&device_type=mobile&utm_source=google
```

#### `POST /analytics/dashboard`

Advanced analytics endpoint for retrieving specific metric sets.

**Available Metrics:**
- `overview` - General dashboard statistics
- `properties` - Property performance metrics
- `campaigns` - Marketing campaign performance
- `sources` - Lead source analysis
- `devices` - Device type breakdown
- `all` - Complete analytics suite

**Request:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "property_ids": [123, 456],
  "metrics": ["overview", "properties", "campaigns"]
}
```

### 7. GDPR Compliance

#### `POST /analytics/gdpr/opt-out`

Processes user opt-out requests for GDPR compliance.

**Request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "User requested data deletion"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Analytics tracking disabled successfully",
  "affected_records": 15
}
```

## Rate Limiting

### Geocoding Endpoints
- **Limit**: 1 request per second
- **Implementation**: Internal queuing with 1-second delays
- **Caching**: 24-hour cache reduces external API calls

### Analytics Endpoints
- **Limit**: ~16 requests per second (1000 per minute)
- **Implementation**: Application-level throttling
- **Batch Support**: Use batch endpoints for high-volume scenarios

## Integration Patterns

### 1. Basic Property View Tracking

```javascript
// Simple property view tracking
async function trackPropertyView(propertyId) {
  const response = await fetch('/api/analytics/property-view', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      property_id: propertyId,
      device_type: getDeviceType(),
      browser: getBrowserInfo(),
      time_on_page: getTimeOnPage(),
      scroll_depth: getMaxScrollDepth()
    })
  });
  
  const result = await response.json();
  if (result.success) {
    // Store session_id for subsequent tracking
    sessionStorage.setItem('analytics_session_id', result.session_id);
  }
}
```

### 2. Advanced Session Management

```javascript
// Comprehensive session and view tracking
class AnalyticsTracker {
  constructor() {
    this.sessionId = null;
    this.interactions = [];
  }

  async initializeSession() {
    const response = await fetch('/api/analytics/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_type: this.getDeviceType(),
        browser: this.getBrowserName(),
        os: this.getOSName(),
        utm_source: this.getUTMParam('utm_source'),
        utm_campaign: this.getUTMParam('utm_campaign')
      })
    });
    
    const result = await response.json();
    this.sessionId = result.session_id;
  }

  async trackPropertyView(propertyId, additionalData = {}) {
    await this.ensureSession();
    
    const response = await fetch('/api/analytics/property-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: this.sessionId,
        property_id: propertyId,
        ...additionalData
      })
    });
    
    return response.json();
  }

  async trackInteraction(eventType, target, data = {}) {
    this.interactions.push({
      session_id: this.sessionId,
      event_type: eventType,
      event_target: target,
      page_url: window.location.href,
      event_data: data,
      timestamp: Date.now()
    });

    // Batch interactions every 10 events or 30 seconds
    if (this.interactions.length >= 10) {
      await this.flushInteractions();
    }
  }

  async flushInteractions() {
    if (this.interactions.length === 0) return;

    const response = await fetch('/api/analytics/interaction', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interactions: this.interactions
      })
    });

    if (response.ok) {
      this.interactions = [];
    }
  }
}
```

### 3. Lead Generation Attribution

```javascript
// Lead tracking with full attribution
async function trackLeadGeneration(leadId, formData) {
  const sessionId = sessionStorage.getItem('analytics_session_id');
  
  const response = await fetch('/api/analytics/lead-generation', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead_id: leadId,
      source_code: 'formulario_web',
      session_id: sessionId,
      property_id: getCurrentPropertyId(),
      form_type: 'contact',
      conversion_page: window.location.href,
      utm_source: getUTMParam('utm_source'),
      utm_campaign: getUTMParam('utm_campaign')
    })
  });

  return response.json();
}
```

## Error Handling Best Practices

### 1. Network Error Resilience

```javascript
async function robustAPICall(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = response.headers.get('Retry-After') || 1;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

### 2. Graceful Degradation

```javascript
async function trackWithFallback(trackingFunction, fallbackData) {
  try {
    return await trackingFunction();
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
    
    // Store in localStorage for later retry
    const failedRequests = JSON.parse(localStorage.getItem('failed_analytics') || '[]');
    failedRequests.push({
      timestamp: Date.now(),
      data: fallbackData,
      error: error.message
    });
    localStorage.setItem('failed_analytics', JSON.stringify(failedRequests));
    
    return { success: false, error: error.message };
  }
}
```

## Performance Considerations

### 1. Caching Strategy
- **Geocoding**: 24-hour cache for address lookups
- **Session Data**: 4-hour session deduplication
- **View Debouncing**: 2-hour property view deduplication

### 2. Batching Recommendations
- Use batch interaction endpoints for high-frequency events
- Limit batch sizes to 100 interactions maximum
- Implement client-side queuing for optimal network usage

### 3. Database Optimization
- All endpoints use prepared statements for security
- Indexes on frequently queried columns (session_id, property_id, timestamps)
- Aggregation tables for fast dashboard queries

## Security Considerations

### 1. Data Privacy
- IP addresses are immediately hashed with SHA-256
- No PII is stored without explicit consent
- GDPR opt-out removes all associated tracking data

### 2. Input Validation
- All inputs are validated against TypeScript schemas
- SQL injection protection through parameterized queries
- XSS prevention through input sanitization

### 3. Rate Limiting
- Prevents abuse of geocoding services
- Protects against analytics spam
- Implements exponential backoff for retries

## Monitoring & Observability

### Key Metrics to Monitor
- **API Response Times**: Track P95 latency for all endpoints
- **Error Rates**: Monitor 4xx and 5xx response rates
- **Rate Limit Hits**: Track when clients hit rate limits
- **Cache Hit Rates**: Monitor geocoding cache effectiveness
- **Session Creation Rate**: Track analytics session volume

### Health Check Endpoints
Consider implementing health check endpoints for monitoring:
- `/api/health` - Basic service health
- `/api/health/database` - Database connectivity
- `/api/health/external` - External service dependencies

## Future Enhancements

### Planned Features
1. **Authentication Layer**: JWT-based API authentication
2. **Real-time Analytics**: WebSocket-based live dashboard updates
3. **Advanced Attribution**: Multi-touch attribution modeling
4. **Data Export**: GDPR-compliant data export functionality
5. **Enhanced Caching**: Redis-based distributed caching

### API Versioning Strategy
Future API versions will use URL versioning:
- `/api/v1/` - Current implementation
- `/api/v2/` - Future enhanced version with breaking changes

---

For technical support or additional information, contact the development team at contact@marconi-inmobiliaria.com.