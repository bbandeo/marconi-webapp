# MARCONI INMOBILIARIA - ANALYTICS SYSTEM DOCUMENTATION

## Overview

This comprehensive analytics system provides GDPR-compliant tracking for Marconi Inmobiliaria's real estate platform. The system tracks property views, user interactions, lead generation, and campaign performance while maintaining user privacy through IP hashing and opt-out capabilities.

## 🚀 Quick Start

### 1. Database Setup

Execute the migration script to create all analytics tables:

```bash
# Connect to your Supabase database and run:
psql -f scripts/analytics-schema-migration.sql
```

This creates:
- ✅ 6 core analytics tables
- ✅ 5 aggregation tables for performance
- ✅ 12 lead sources with Spanish names
- ✅ 7 RPC functions for common operations
- ✅ GDPR compliance features (IP hashing, opt-out)
- ✅ Automatic data retention (24 months)
- ✅ 2-hour debounce for duplicate views

### 2. Frontend Integration

Add analytics tracking to your React components:

```tsx
import { trackPropertyView, trackContactClick, getAnalyticsClient } from '@/lib/analytics-client'

// In a property detail page
useEffect(() => {
  trackPropertyView(property.id, {
    pageUrl: window.location.href,
    referrerUrl: document.referrer
  })
}, [property.id])

// Track user interactions
const handleContactClick = () => {
  trackContactClick(property.id)
  // Your existing contact logic...
}

const handleWhatsAppClick = () => {
  trackWhatsAppClick(property.id)
  // Your existing WhatsApp logic...
}
```

### 3. Lead Attribution

Track leads with automatic source attribution:

```tsx
import { trackLead } from '@/lib/analytics-client'

// After creating a lead
const leadId = await LeadsService.createLead(leadData)
await trackLead(leadId, 'formulario_web', property.id)
```

## 📊 Analytics Features

### Privacy & GDPR Compliance
- **IP Hashing**: All IPs are SHA-256 hashed before storage
- **Anonymous Sessions**: No personal data stored in analytics
- **Opt-out Support**: Users can opt out with `/api/analytics/gdpr/opt-out`
- **Data Retention**: Automatic cleanup after 24 months
- **RLS Policies**: Row-level security for data access

### Property Tracking
- **Unique Views**: 2-hour debounce window prevents duplicate counting
- **Engagement Metrics**: Time on page, scroll depth, interaction tracking
- **Contact Attribution**: Links property views to lead generation
- **Performance Insights**: Conversion rates, top properties, neighborhood analysis

### Lead Attribution
- **12 Lead Sources**: WhatsApp, web form, phone, email, social media, etc.
- **UTM Campaign Tracking**: Full attribution for marketing campaigns  
- **Conversion Funnel**: Track user journey from view to lead
- **Time to Conversion**: Measure decision-making speed

### Device & Browser Analytics
- **Device Detection**: Desktop, tablet, mobile, bot classification
- **Browser Analytics**: Chrome, Firefox, Safari, Edge tracking
- **Geographic Data**: Country-level analytics (IP-based)
- **Performance by Device**: Conversion rates by device type

## 🛠 API Endpoints

### Session Management
```bash
# Create or get session
POST /api/analytics/session
{
  "country_code": "AR",
  "device_type": "desktop",
  "utm_source": "google",
  "utm_campaign": "summer_properties"
}

# Update session activity
PUT /api/analytics/session?session_id=uuid
```

### Property Views
```bash
# Track property view
POST /api/analytics/property-view
{
  "session_id": "uuid",
  "property_id": 123,
  "time_on_page": 45,
  "scroll_depth": 85,
  "contact_button_clicked": true
}

# Track view with auto-session creation
PUT /api/analytics/property-view
{
  "property_id": 123,
  "device_type": "mobile",
  "utm_source": "facebook"
}
```

### Lead Generation
```bash
# Track lead with source attribution
PUT /api/analytics/lead-generation
{
  "lead_id": 456,
  "source_code": "whatsapp",
  "session_id": "uuid",
  "property_id": 123
}
```

### Dashboard Analytics
```bash
# Get comprehensive dashboard data
GET /api/analytics/dashboard?start_date=2024-01-01&end_date=2024-01-31

# Advanced analytics with filters
POST /api/analytics/dashboard
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "property_ids": [123, 456],
  "metrics": ["overview", "campaigns", "devices"]
}
```

### Property Metrics
```bash
# Get detailed property analytics
GET /api/analytics/property-metrics/123?period=30d
```

### GDPR Compliance
```bash
# User opt-out
POST /api/analytics/gdpr/opt-out
{
  "session_id": "uuid",
  "reason": "privacy_concerns"
}

# Check opt-out status
GET /api/analytics/gdpr/opt-out?session_id=uuid
```

## 📈 Dashboard Integration

### Key Metrics Available

**Traffic Metrics:**
- Unique sessions and page views
- Traffic sources and campaigns
- Device and browser breakdown
- Geographic distribution

**Property Performance:**
- Most viewed properties
- Engagement rates by property
- Conversion rates by neighborhood
- Time on page and scroll depth

**Lead Analytics:**
- Lead sources performance
- Conversion funnel analysis
- Time to conversion metrics
- Lead quality by source

**Campaign Attribution:**
- UTM campaign performance
- ROI and ROAS tracking
- Traffic source analysis
- A/B testing support

### Sample Dashboard Queries

```sql
-- Top 10 properties by conversion rate (last 30 days)
SELECT * FROM get_top_properties(10, 'conversion_rate', 30);

-- Property performance metrics
SELECT * FROM get_property_metrics(123, CURRENT_DATE - 30, CURRENT_DATE);

-- Daily traffic summary
SELECT 
  date,
  SUM(unique_views) as total_unique_views,
  SUM(leads_generated) as total_leads,
  AVG(conversion_rate) as avg_conversion_rate
FROM daily_property_analytics 
WHERE date BETWEEN CURRENT_DATE - 30 AND CURRENT_DATE
GROUP BY date 
ORDER BY date DESC;
```

## 🔧 Configuration Options

### Environment Variables
```bash
# Required for analytics
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Client Configuration
```tsx
import { getAnalyticsClient } from '@/lib/analytics-client'

const analytics = getAnalyticsClient({
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enableLocalStorage: true,
  apiBaseUrl: '/api/analytics'
})
```

### Lead Source Mapping
The system includes 12 predefined lead sources:

| Source Code | Display Name | Description |
|-------------|--------------|-------------|
| `whatsapp` | WhatsApp | Contact via WhatsApp Business |
| `formulario_web` | Formulario Web | Website contact forms |
| `telefono` | Teléfono | Direct phone calls |
| `email` | Email | Email inquiries |
| `instagram` | Instagram | Instagram contacts |
| `facebook` | Facebook | Facebook contacts |
| `google_ads` | Google Ads | Google Ads campaigns |
| `referidos` | Referidos | Referrals from existing clients |
| `walk_in` | Visita Directa | Direct office visits |
| `mercado_libre` | MercadoLibre | MercadoLibre listings |
| `zonaprop` | ZonaProp | ZonaProp listings |
| `argenprop` | ArgenProp | ArgenProp listings |

## 🛡️ Privacy & Security

### Data Protection
- **No Personal Data**: Analytics stores no names, emails, or personal information
- **IP Hashing**: All IP addresses are irreversibly hashed with SHA-256
- **Session Anonymity**: Sessions are identified only by random UUIDs
- **Automatic Cleanup**: Data older than 24 months is automatically purged

### GDPR Compliance
- **Opt-out Capability**: Users can opt out anytime via API or client method
- **Data Portability**: Analytics data can be exported for users
- **Right to Erasure**: User data can be completely removed
- **Lawful Basis**: Processing based on legitimate business interest

### Security Features
- **Row Level Security**: Supabase RLS policies protect data access
- **Admin-only Access**: Sensitive analytics require authentication
- **API Rate Limiting**: Built-in protection against abuse
- **Input Validation**: All analytics inputs are validated and sanitized

## 🚀 Performance Optimization

### Pre-aggregated Tables
The system includes daily, weekly, and monthly aggregation tables for fast dashboard queries:
- `daily_property_analytics`
- `weekly_property_analytics` 
- `monthly_property_analytics`
- `lead_funnel_analytics`
- `campaign_performance_analytics`

### Optimized Indexes
Strategic indexes on high-traffic queries:
- Session ID and timestamp lookups
- Property ID and date range queries
- UTM parameter filtering
- Lead source attribution

### Batching & Caching
- **Interaction Batching**: Client batches non-critical interactions
- **Session Persistence**: Sessions cached in localStorage for performance
- **Query Optimization**: Efficient SQL with proper JOINs and CTEs

## 🔍 Monitoring & Maintenance

### Health Checks
Monitor system health with built-in queries:

```sql
-- Check data volume and system health
SELECT 
  'Sessions (24h)' as metric,
  COUNT(*) as value
FROM analytics_sessions 
WHERE first_seen >= CURRENT_TIMESTAMP - INTERVAL '24 hours';
```

### Maintenance Tasks
Regular maintenance procedures:

```sql
-- Clean up old data (run monthly)
SELECT anonymize_old_analytics_data(24); -- 24 months retention

-- Update aggregation tables (run daily)
-- This would typically be automated via cron job
```

### Performance Monitoring
Key metrics to monitor:
- Average query response time
- Database size growth
- Session creation rate
- Error rates in API endpoints

## 📚 Advanced Usage

### Custom Events
Track custom interactions:

```tsx
import { getAnalyticsClient } from '@/lib/analytics-client'

const analytics = getAnalyticsClient()

// Track custom events
analytics.trackInteraction('video_play', 'property_video', {
  video_id: 'intro_video',
  property_id: 123
})

analytics.trackInteraction('form_start', 'contact_form')
analytics.trackInteraction('search', 'property_search', {
  query: 'departamento belgrano',
  filters: { bedrooms: 2, price_max: 150000 }
})
```

### Funnel Analysis
Build conversion funnels:

```sql
-- Custom conversion funnel
WITH funnel AS (
  SELECT 
    session_id,
    MAX(CASE WHEN event_type = 'property_view' THEN 1 ELSE 0 END) as viewed_property,
    MAX(CASE WHEN event_type = 'contact_click' THEN 1 ELSE 0 END) as clicked_contact,
    MAX(CASE WHEN event_type = 'form_submit' THEN 1 ELSE 0 END) as submitted_form
  FROM user_interaction_events
  WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY session_id
)
SELECT 
  COUNT(*) as total_sessions,
  SUM(viewed_property) as viewed_property,
  SUM(clicked_contact) as clicked_contact, 
  SUM(submitted_form) as submitted_form
FROM funnel;
```

### Campaign Attribution
Advanced UTM tracking:

```tsx
// Automatic UTM extraction from URL
const analytics = getAnalyticsClient()

// UTM parameters are automatically captured during session creation
// Access them via the analytics dashboard or custom queries
```

## 🎯 Best Practices

### Implementation Guidelines
1. **Initialize Early**: Set up analytics client in your app's root component
2. **Batch Interactions**: Use interaction batching for high-frequency events
3. **Error Handling**: Always wrap analytics calls in try-catch blocks
4. **Performance**: Don't block user interactions for analytics calls
5. **Privacy First**: Always respect user opt-out preferences

### Code Examples

```tsx
// Property page with comprehensive tracking
import { useEffect } from 'react'
import { trackPropertyView, trackContactClick } from '@/lib/analytics-client'

export default function PropertyPage({ property }) {
  useEffect(() => {
    // Track property view on page load
    trackPropertyView(property.id, {
      pageUrl: window.location.href,
      referrerUrl: document.referrer
    })

    // Track scroll depth periodically
    const trackScrollDepth = () => {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      const scrollDepth = Math.round((scrolled / total) * 100)
      
      if (scrollDepth > 75) {
        // User is highly engaged
        trackPropertyView(property.id, { scrollDepth })
      }
    }

    window.addEventListener('scroll', trackScrollDepth)
    return () => window.removeEventListener('scroll', trackScrollDepth)
  }, [property.id])

  const handleContactClick = async () => {
    // Track the interaction
    trackContactClick(property.id)
    
    // Your business logic
    const leadData = {
      name: form.name,
      email: form.email,
      message: form.message,
      property_id: property.id,
      lead_source: 'formulario_web'
    }
    
    const lead = await LeadsService.createLead(leadData)
    
    // Track lead generation
    await trackLead(lead.id, 'formulario_web', property.id)
  }

  return (
    <div>
      {/* Your property UI */}
      <button onClick={handleContactClick}>
        Contactar
      </button>
    </div>
  )
}
```

## 📞 Support & Troubleshooting

### Common Issues

**Issue: Analytics not tracking**
- ✅ Check if user has opted out
- ✅ Verify API endpoints are accessible
- ✅ Check browser console for errors
- ✅ Confirm Supabase connection

**Issue: Duplicate views not debouncing**
- ✅ Verify session persistence in localStorage
- ✅ Check if `is_duplicate_view` function is working
- ✅ Review debounce window configuration (2 hours default)

**Issue: Poor dashboard performance**
- ✅ Check if aggregation tables are populated
- ✅ Review query execution plans
- ✅ Consider adding custom indexes
- ✅ Implement query result caching

### Debug Mode

Enable debug logging for troubleshooting:

```tsx
import { getAnalyticsClient } from '@/lib/analytics-client'

const analytics = getAnalyticsClient({
  enableConsoleLogging: true // Shows detailed logs in console
})
```

---

## 📄 File Structure

```
marconi-webapp/
├── scripts/
│   ├── analytics-schema-migration.sql     # Database schema creation
│   └── analytics-sample-queries.sql       # Example queries for reports
├── types/
│   └── analytics.ts                       # TypeScript type definitions
├── services/
│   └── analytics.ts                       # Server-side analytics service
├── lib/
│   └── analytics-client.ts                # Client-side analytics utilities
├── app/api/analytics/
│   ├── session/route.ts                   # Session management API
│   ├── property-view/route.ts             # Property view tracking API
│   ├── lead-generation/route.ts           # Lead attribution API
│   ├── dashboard/route.ts                 # Dashboard analytics API
│   ├── property-metrics/[id]/route.ts     # Individual property metrics
│   └── gdpr/opt-out/route.ts             # GDPR compliance API
└── ANALYTICS.md                           # This documentation file
```

This analytics system is production-ready and provides comprehensive insights while maintaining the highest standards of user privacy and GDPR compliance. All components are designed to integrate seamlessly with your existing Marconi Inmobiliaria codebase.