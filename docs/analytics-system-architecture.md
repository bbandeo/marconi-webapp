# Analytics System Architecture Documentation

## Overview

The Marconi Inmobiliaria Analytics System is a comprehensive, GDPR-compliant analytics platform designed to track property views, lead generation, and user interactions across the real estate application. The system provides detailed insights into user behavior, property performance, and marketing campaign effectiveness while maintaining strict privacy standards.

## System Architecture

### Technology Stack

- **Frontend**: Next.js 15 + React 19 with TypeScript
- **Backend**: Supabase (PostgreSQL) with Row Level Security
- **Client-Side Tracking**: Custom analytics client with automatic session management
- **GDPR Compliance**: IP hashing, opt-out mechanisms, and data retention policies
- **Performance**: Aggregation tables and optimized PostgreSQL functions

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Side (Browser)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Analytics       │  │ React Hooks     │  │ Session         │ │
│  │ Client          │  │ (useAnalytics)  │  │ Management      │ │
│  │ (lib/analytics- │  │                 │  │                 │ │
│  │ client.ts)      │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP/HTTPS API Calls
┌─────────────────────▼───────────────────────────────────────────┐
│                    Next.js API Routes                          │
├─────────────────────────────────────────────────────────────────┤
│  /api/analytics/session        │  /api/analytics/property-view   │
│  /api/analytics/lead-generation│  /api/analytics/interaction     │
│  /api/analytics/gdpr/opt-out   │  /api/analytics/dashboard       │
└─────────────────────┬───────────────────────────────────────────┘
                      │ Database Operations
┌─────────────────────▼───────────────────────────────────────────┐
│                 Analytics Service Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Session         │  │ Property View   │  │ Lead Generation │ │
│  │ Management      │  │ Tracking        │  │ Attribution     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Interaction     │  │ GDPR Compliance │  │ Aggregation &   │ │
│  │ Tracking        │  │ & Privacy       │  │ Performance     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │ Supabase Client
┌─────────────────────▼───────────────────────────────────────────┐
│                 Supabase Database (PostgreSQL)                 │
├─────────────────────────────────────────────────────────────────┤
│  Core Tables:                   Aggregation Tables:            │
│  • analytics_sessions           • analytics_daily_stats        │
│  • analytics_property_views     • analytics_weekly_stats       │
│  • analytics_lead_generation    • analytics_monthly_stats      │
│  • analytics_user_interactions  • analytics_lead_source_stats  │
│  • analytics_lead_sources       • analytics_campaign_stats     │
│                                                                 │
│  PostgreSQL Functions (RPCs):                                  │
│  • track_property_view() - 2-hour debouncing                   │
│  • check_duplicate_property_view() - duplicate detection       │
│  • get_property_metrics() - property performance               │
│  • hash_ip_address() - GDPR IP hashing                         │
│  • analytics_opt_out() - privacy compliance                    │
│  • cleanup_old_analytics_data() - retention policy             │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

#### 1. analytics_sessions
**Purpose**: GDPR-compliant session tracking with IP hashing

```sql
CREATE TABLE analytics_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_hash VARCHAR(64) NOT NULL,              -- SHA-256 hashed IP
    user_agent TEXT,
    device_type VARCHAR(50),                   -- desktop, mobile, tablet
    browser_name VARCHAR(100),
    os_name VARCHAR(100),
    referrer_domain VARCHAR(255),
    utm_source VARCHAR(255),                   -- Marketing attribution
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_term VARCHAR(255),
    utm_content VARCHAR(255),
    country_code CHAR(2),
    language VARCHAR(10) DEFAULT 'es',
    opt_out BOOLEAN DEFAULT FALSE,             -- GDPR opt-out flag
    first_seen_at TIMESTAMP WITH TIME ZONE,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
);
```

**Key Features**:
- **GDPR Compliance**: IP addresses are hashed using SHA-256 with application salt
- **Session Deduplication**: Automatic reuse of valid sessions within 4-hour window
- **Marketing Attribution**: Full UTM parameter tracking
- **Device Detection**: Browser, OS, and device type identification
- **Privacy Controls**: Built-in opt-out mechanism

#### 2. analytics_property_views
**Purpose**: Detailed property view tracking with 2-hour debouncing

```sql
CREATE TABLE analytics_property_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id INTEGER NOT NULL REFERENCES properties(id),
    session_id UUID REFERENCES analytics_sessions(id),
    view_duration_seconds INTEGER DEFAULT 0,
    page_url TEXT NOT NULL,
    referrer_url TEXT,
    search_query VARCHAR(255),
    scroll_percentage INTEGER,
    images_viewed INTEGER DEFAULT 0,
    contact_form_opened BOOLEAN DEFAULT FALSE,
    contact_form_submitted BOOLEAN DEFAULT FALSE,
    phone_clicked BOOLEAN DEFAULT FALSE,
    whatsapp_clicked BOOLEAN DEFAULT FALSE,
    email_clicked BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
);
```

**Key Features**:
- **Debouncing Logic**: Prevents duplicate views within 2-hour window using PostgreSQL function
- **Engagement Metrics**: Tracks scroll depth, time on page, and user interactions
- **Contact Tracking**: Records which contact methods users clicked
- **Search Attribution**: Links views to search queries and referrers

#### 3. analytics_lead_sources
**Purpose**: Configurable catalog of lead sources for attribution

```sql
CREATE TABLE analytics_lead_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,         -- Internal identifier
    display_name VARCHAR(100) NOT NULL,       -- User-facing name
    description TEXT,
    category VARCHAR(50) NOT NULL,             -- web, social, direct, referral, advertising
    icon VARCHAR(50),                          -- UI icon name
    color VARCHAR(7),                          -- Hex color for UI
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);
```

**Pre-configured Sources**:
- **Web**: formulario_web (Web Form)
- **Social**: whatsapp, facebook, instagram
- **Direct**: telefono (Phone), email
- **Advertising**: google_ads, facebook_ads
- **Referral**: referido (Referral), walk_in
- **Marketplace**: marketplace platforms

#### 4. analytics_lead_generation
**Purpose**: Lead attribution and conversion tracking

```sql
CREATE TABLE analytics_lead_generation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id INTEGER REFERENCES leads(id),
    session_id UUID REFERENCES analytics_sessions(id),
    property_id INTEGER REFERENCES properties(id),
    lead_source_id INTEGER REFERENCES analytics_lead_sources(id),
    form_type VARCHAR(50),
    conversion_time_minutes INTEGER,           -- Time from first view to conversion
    page_url TEXT,                            -- Conversion page
    utm_source VARCHAR(255),                  -- Campaign attribution
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    generated_at TIMESTAMP WITH TIME ZONE
);
```

**Key Features**:
- **Attribution Tracking**: Links leads to their originating sessions and properties
- **Conversion Analytics**: Calculates time-to-conversion from first property view
- **Campaign Attribution**: Full UTM tracking for marketing campaign ROI

#### 5. analytics_user_interactions
**Purpose**: Granular user interaction tracking for UX analysis

```sql
CREATE TABLE analytics_user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES analytics_sessions(id),
    property_id INTEGER REFERENCES properties(id),
    interaction_type VARCHAR(100) NOT NULL,   -- click, scroll, form_focus, etc.
    element_id VARCHAR(255),                  -- HTML element ID
    page_url TEXT NOT NULL,
    coordinates_x INTEGER,                    -- Click coordinates
    coordinates_y INTEGER,
    viewport_width INTEGER,
    viewport_height INTEGER,
    interaction_data JSONB,                   -- Additional event data
    occurred_at TIMESTAMP WITH TIME ZONE
);
```

### Aggregation Tables

The system includes several aggregation tables for optimal dashboard performance:

- **analytics_daily_stats**: Daily metrics per property
- **analytics_weekly_stats**: Weekly rollups
- **analytics_monthly_stats**: Monthly summaries
- **analytics_lead_source_stats**: Daily lead source performance
- **analytics_campaign_stats**: Marketing campaign metrics with ROI tracking

## System Components

### 1. Analytics Service (`services/analytics.ts`)

The main service class providing comprehensive analytics operations:

```typescript
export class AnalyticsService {
  // Session Management
  static async createSession(sessionData: CreateAnalyticsSessionInput): Promise<string>
  static async getOrCreateSession(ipAddress: string, userAgent?: string): Promise<string>
  static async updateSessionLastSeen(sessionId: string): Promise<void>
  
  // Property View Tracking  
  static async recordPropertyView(viewData: CreatePropertyViewInput): Promise<string>
  static async recordPropertyViewWithSession(propertyId: number, ipAddress: string): Promise<{eventId: string, sessionId: string}>
  
  // Lead Tracking
  static async recordLeadGeneration(leadData: CreateLeadGenerationEventInput): Promise<void>
  static async recordLeadWithSource(leadId: number, sourceCode: LeadSourceCode): Promise<void>
  
  // Analytics Queries
  static async getPropertyMetrics(propertyId: number, daysBack?: number): Promise<PropertyMetrics>
  static async getTopProperties(limit?: number, metric?: AnalyticsMetricType): Promise<TopPropertyResult[]>
  static async getDashboardStats(filters?: AnalyticsFilters): Promise<DashboardStats>
  
  // GDPR Compliance
  static async handleOptOut(sessionId: string, ipAddress?: string): Promise<void>
  static async cleanupOldData(retentionMonths?: number): Promise<number>
}
```

**Key Features**:
- **Robust Error Handling**: Multiple fallback levels prevent user experience disruption
- **Session Management**: Automatic session creation with 4-hour validity
- **IP Hashing**: GDPR-compliant IP address processing
- **Performance Optimization**: Uses PostgreSQL functions for complex operations

### 2. Client-Side Analytics (`lib/analytics-client.ts`)

Browser-safe analytics tracking with automatic session management:

```typescript
export class AnalyticsClient {
  // Session Management
  private async createNewSession(): Promise<void>
  private updateSessionLastSeen(): void
  
  // Property Tracking
  async trackPropertyView(propertyId: number, additionalData?: Partial<PropertyViewData>): Promise<void>
  
  // Lead Tracking
  async trackLead(leadId: number, sourceCode: LeadSourceCode, propertyId?: number): Promise<void>
  
  // Interaction Tracking
  trackInteraction(eventType: string, target?: string, data?: any): void
  
  // Utility Methods
  trackContactClick(propertyId?: number): void
  trackWhatsAppClick(propertyId?: number): void
  trackPhoneClick(propertyId?: number): void
  
  // GDPR Compliance
  async optOut(reason?: string): Promise<boolean>
  async checkOptInStatus(): Promise<boolean>
}
```

**Key Features**:
- **Automatic Session Management**: Handles session creation and persistence
- **Scroll Tracking**: Monitors maximum scroll depth automatically
- **Interaction Batching**: Queues interactions and sends in batches for performance
- **Device Detection**: Automatic browser, OS, and device type identification
- **Privacy First**: Built-in opt-out mechanisms and local storage management

### 3. React Hooks (`hooks/useAnalytics.ts`)

React integration with automatic tracking capabilities:

```typescript
export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const {
    sessionId,
    isOptedOut,
    loading,
    trackPropertyView,
    trackLeadGeneration,
    trackInteraction,
    trackContactClick,
    optOut,
    currentStats
  } = useAnalytics()
  
  return { /* ... */ }
}

export function usePropertyAnalytics(propertyId: number) {
  // Auto-tracks property views when component mounts
  // Provides property-specific tracking methods
}
```

**Key Features**:
- **Auto-tracking**: Automatic property view tracking on component mount
- **Session Persistence**: Maintains session across page navigations
- **Real-time Stats**: Provides current session statistics
- **Opt-out Management**: Handles GDPR compliance at component level

## GDPR Compliance Features

### 1. Privacy-First Design

- **IP Hashing**: All IP addresses are hashed using SHA-256 with application-specific salt
- **Anonymous Sessions**: No personally identifiable information stored
- **Opt-out Mechanism**: Users can opt out at any time with immediate effect
- **Data Retention**: Automatic cleanup of data older than 24 months

### 2. Implementation Details

#### IP Address Hashing
```typescript
private static async hashString(input: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Browser environment - Web Crypto API
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } else {
    // Server environment - Node.js crypto module
    const crypto = await import('crypto')
    return crypto.createHash('sha256').update(input).digest('hex')
  }
}
```

#### PostgreSQL GDPR Functions
```sql
-- Hash IP address with application salt
CREATE OR REPLACE FUNCTION hash_ip_address(ip_address TEXT) 
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN encode(digest(ip_address || 'marconi_salt_2025', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Handle opt-out requests
CREATE OR REPLACE FUNCTION analytics_opt_out(p_session_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE analytics_sessions 
    SET opt_out = TRUE 
    WHERE session_id = p_session_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automatic data cleanup for retention compliance
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data() 
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Remove data older than 24 months
    DELETE FROM analytics_property_views 
    WHERE created_at < NOW() - INTERVAL '24 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Additional cleanup for other tables...
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Performance Optimizations

### 1. View Debouncing System

The system implements a sophisticated 2-hour debouncing mechanism to prevent duplicate property views while maintaining accurate analytics:

```sql
CREATE OR REPLACE FUNCTION track_property_view(
    p_property_id INTEGER,
    p_session_id UUID,
    p_page_url TEXT,
    p_referrer_url TEXT DEFAULT NULL,
    p_search_query VARCHAR(255) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    view_id UUID;
    is_duplicate BOOLEAN;
BEGIN
    -- Check for duplicate view within 2 hours
    SELECT check_duplicate_property_view(p_property_id, p_session_id) INTO is_duplicate;
    
    IF is_duplicate THEN
        -- Update existing view instead of creating new one
        UPDATE analytics_property_views 
        SET viewed_at = NOW(), 
            page_url = p_page_url,
            referrer_url = COALESCE(p_referrer_url, referrer_url)
        WHERE property_id = p_property_id 
          AND session_id = p_session_id 
          AND viewed_at = (
              SELECT MAX(viewed_at) 
              FROM analytics_property_views 
              WHERE property_id = p_property_id AND session_id = p_session_id
          )
        RETURNING id INTO view_id;
    ELSE
        -- Create new view record
        INSERT INTO analytics_property_views (
            property_id, session_id, page_url, referrer_url, search_query
        ) VALUES (
            p_property_id, p_session_id, p_page_url, p_referrer_url, p_search_query
        ) RETURNING id INTO view_id;
    END IF;
    
    RETURN view_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Aggregation Tables

Pre-calculated aggregation tables provide fast dashboard performance:

- **Daily Stats**: Property-level daily metrics
- **Weekly/Monthly Rollups**: Hierarchical time-based aggregations
- **Lead Source Performance**: Attribution analytics
- **Campaign Stats**: Marketing ROI metrics

### 3. Database Indexing Strategy

Comprehensive indexing for optimal query performance:

```sql
-- Session-based queries
CREATE INDEX idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX idx_analytics_sessions_ip_hash ON analytics_sessions(ip_hash);

-- Property view queries
CREATE INDEX idx_analytics_property_views_property_viewed 
ON analytics_property_views(property_id, viewed_at);

-- Lead generation queries
CREATE INDEX idx_analytics_lead_generation_generated_at 
ON analytics_lead_generation(generated_at);

-- Time-series queries
CREATE INDEX idx_analytics_daily_stats_property_date 
ON analytics_daily_stats(property_id, date);
```

## API Endpoints

### Session Management
- **POST** `/api/analytics/session` - Create new analytics session
- **PUT** `/api/analytics/session` - Update session timestamp

### Property Tracking
- **POST** `/api/analytics/property-view` - Record property view
- **GET** `/api/analytics/property-metrics/[id]` - Get property performance metrics

### Lead Tracking
- **PUT** `/api/analytics/lead-generation` - Record lead generation event

### User Interactions
- **POST** `/api/analytics/interaction` - Record user interaction

### GDPR Compliance
- **POST** `/api/analytics/gdpr/opt-out` - Handle opt-out requests
- **GET** `/api/analytics/gdpr/opt-out` - Check opt-out status

### Dashboard & Reporting
- **GET** `/api/analytics/dashboard` - Comprehensive dashboard metrics

## Integration Patterns

### 1. Property Page Integration

```typescript
// Automatic property view tracking
import { usePropertyAnalytics } from '@/hooks/useAnalytics'

export default function PropertyPage({ propertyId }: { propertyId: number }) {
  const analytics = usePropertyAnalytics(propertyId)
  
  const handleContactClick = () => {
    analytics.trackContact('whatsapp')
    // ... handle contact logic
  }
  
  const handleLeadSubmission = async (leadId: number) => {
    await analytics.trackLead(leadId, 'formulario_web')
  }
  
  return (
    <div>
      {/* Property content */}
      <button onClick={handleContactClick}>Contact via WhatsApp</button>
    </div>
  )
}
```

### 2. Lead Form Integration

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

export default function ContactForm({ propertyId }: { propertyId: number }) {
  const analytics = useAnalytics()
  
  const handleSubmit = async (formData: ContactFormData) => {
    // Create lead in database
    const lead = await createLead(formData)
    
    // Track lead generation
    await analytics.trackLeadGeneration(
      lead.id, 
      'formulario_web', 
      propertyId
    )
  }
  
  return <form onSubmit={handleSubmit}>{/* Form content */}</form>
}
```

### 3. Admin Dashboard Integration

```typescript
import { AnalyticsService } from '@/services/analytics'

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  
  useEffect(() => {
    const loadStats = async () => {
      const stats = await AnalyticsService.getDashboardStats({
        start_date: '2025-01-01',
        end_date: '2025-01-31'
      })
      setDashboardStats(stats)
    }
    
    loadStats()
  }, [])
  
  return (
    <div>
      <h2>Analytics Dashboard</h2>
      {dashboardStats && (
        <div>
          <div>Total Views: {dashboardStats.total_property_views}</div>
          <div>Total Leads: {dashboardStats.total_leads}</div>
          <div>Conversion Rate: {dashboardStats.conversion_rate}%</div>
        </div>
      )}
    </div>
  )
}
```

## Error Handling & Fallbacks

The system implements comprehensive error handling with multiple fallback levels:

### 1. Service Level Fallbacks

```typescript
static async createSession(sessionData: CreateAnalyticsSessionInput): Promise<string> {
  try {
    // Primary: Create session in database
    const sessionId = crypto.randomUUID()
    const { data, error } = await supabase.from('analytics_sessions').insert([...])
    
    if (error) {
      console.error('Database error creating session:', error)
      // Fallback: Return session ID for local tracking
      return sessionId
    }
    
    return sessionId
  } catch (error) {
    console.error('Analytics session creation failed:', error)
    
    // Final fallback: Generate basic session ID
    return `fallback-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
```

### 2. Client Level Fallbacks

```typescript
async trackPropertyView(propertyId: number, additionalData?: Partial<PropertyViewData>) {
  if (this.isOptedOut || !this.sessionData) {
    this.log('Property view tracking skipped (opted out or no session)')
    return // Graceful degradation - no error thrown
  }

  try {
    const response = await fetch(`${this.config.apiBaseUrl}/property-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({...})
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const result = await response.json()
    this.updateSessionLastSeen()
  } catch (error) {
    console.error('Failed to track property view:', error)
    // Don't throw - analytics failures should not break user experience
  }
}
```

## Security Features

### 1. Row Level Security (RLS)

All analytics tables implement RLS policies:

```sql
-- Only authenticated admins can view analytics data
CREATE POLICY "Admin can view analytics_sessions" ON analytics_sessions
    FOR SELECT USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Public can insert tracking data (anonymous)
CREATE POLICY "Public can insert analytics_property_views" ON analytics_property_views
    FOR INSERT WITH CHECK (true);
```

### 2. Data Validation

Comprehensive input validation at multiple levels:

```typescript
private static validatePropertyView(data: CreatePropertyViewInput): void {
  if (!data.session_id) {
    throw new AnalyticsValidationError('Session ID is required')
  }
  if (!data.property_id || data.property_id <= 0) {
    throw new AnalyticsValidationError('Valid property ID is required')  
  }
  if (data.scroll_depth !== undefined && (data.scroll_depth < 0 || data.scroll_depth > 100)) {
    throw new AnalyticsValidationError('Scroll depth must be between 0 and 100')
  }
}
```

### 3. Rate Limiting

Client-side interaction batching prevents spam:

```typescript
private setupInteractionBatching() {
  // Flush interactions every 30 seconds
  this.flushTimer = setInterval(() => {
    this.flushInteractions()
  }, 30000)

  // Ensure cleanup on page unload
  window.addEventListener('beforeunload', () => {
    this.flushInteractions()
  })
}
```

## Monitoring & Maintenance

### 1. Data Retention

Automatic cleanup functions maintain compliance:

```typescript
// Service method for manual cleanup
static async cleanupOldData(retentionMonths = ANALYTICS_CONSTANTS.RETENTION_MONTHS): Promise<number> {
  try {
    const { data, error } = await this.ADMIN_CLIENT.rpc('cleanup_old_analytics_data')
    
    if (error) {
      throw new Error(`Failed to cleanup old data: ${error.message}`)
    }
    
    return data as number
  } catch (error) {
    console.error('Data cleanup failed:', error)
    throw error
  }
}
```

### 2. Health Monitoring

Built-in logging and error reporting:

```typescript
private log(message: string, data?: any) {
  if (this.config.enableConsoleLogging) {
    console.log(`[Analytics] ${message}`, data || '')
  }
}
```

### 3. Performance Monitoring

The system includes views for common performance queries:

```sql
-- Monitor top-performing properties
CREATE VIEW analytics_top_properties AS
SELECT 
    p.id,
    p.title,
    COUNT(apv.id) as total_views,
    COUNT(DISTINCT apv.session_id) as unique_views,
    AVG(apv.view_duration_seconds) as avg_duration,
    COUNT(alg.id) as leads_generated,
    CASE 
        WHEN COUNT(DISTINCT apv.session_id) > 0 
        THEN (COUNT(alg.id)::NUMERIC / COUNT(DISTINCT apv.session_id)) * 100
        ELSE 0 
    END as conversion_rate
FROM properties p
LEFT JOIN analytics_property_views apv ON p.id = apv.property_id
LEFT JOIN analytics_lead_generation alg ON p.id = alg.property_id
WHERE apv.viewed_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.title
ORDER BY total_views DESC;
```

## Deployment Considerations

### 1. Environment Variables

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 2. Database Migration

Run the analytics schema migration:

```bash
psql -h your_db_host -d your_database -f scripts/analytics-schema-migration.sql
```

### 3. Performance Tuning

- Enable PostgreSQL query optimization
- Configure appropriate connection pooling
- Set up database monitoring for slow queries
- Consider read replicas for analytics-heavy workloads

## Conclusion

The Marconi Inmobiliaria Analytics System provides a comprehensive, privacy-compliant solution for tracking real estate property interactions and lead generation. With its robust error handling, performance optimizations, and GDPR compliance features, it delivers valuable insights while maintaining user privacy and system reliability.

The modular architecture allows for easy extension and customization, while the comprehensive API and React integration patterns enable seamless integration across the application.