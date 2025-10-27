# Lead Tracking Implementation Guide

> **Critical Business Feature Documentation**  
> Complete customer interaction tracking across all touchpoints  
> 📊 **Lead Generation** | 🎯 **Attribution** | 📈 **Conversion Funnel**

---

## 🎯 Executive Summary

The Lead Tracking Implementation provides comprehensive lead generation and attribution tracking for Marconi Inmobiliaria's real estate platform. Every customer interaction across all touchpoints is now captured, tracked, and attributed to marketing sources, providing complete visibility into the conversion funnel and marketing ROI.

### Key Business Impact
- **100% Lead Attribution**: Every customer interaction generates a trackable lead
- **Complete Funnel Visibility**: From first touch to conversion
- **Marketing ROI Analysis**: Source attribution for all campaigns
- **Property Performance Metrics**: Lead generation by specific properties

---

## 🏗️ System Architecture

### Implementation Pattern

```typescript
// Universal Lead Tracking Pattern
const handleContactInteraction = async (sourceCode: LeadSourceCode) => {
  // 1. Create Lead Record
  const leadResponse = await fetch('/api/leads', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Cliente - [Contact Type]',
      [contact_method]: '[contact_info]',
      message: '[contextual_message]',
      source: sourceCode,
      property_id: propertyId // when applicable
    })
  });
  
  // 2. Track Analytics Event
  if (leadResponse.ok) {
    const leadData = await leadResponse.json();
    await trackLead(leadData.id, sourceCode, propertyId);
  }
  
  // 3. Execute Original Action
  // (open WhatsApp, email client, etc.)
}
```

### Lead Source Attribution System

```typescript
LEAD_SOURCE_CODES = {
  FORMULARIO_WEB: 'formulario_web',    // Web forms
  WHATSAPP: 'whatsapp',                // WhatsApp interactions  
  TELEFONO: 'telefono',                // Phone calls
  EMAIL: 'email',                      // Email interactions
  FACEBOOK: 'facebook',                // Facebook social
  INSTAGRAM: 'instagram'               // Instagram social
}
```

---

## 🛠️ Implementation Details

### 1. Contact Page Implementation
**File**: `/app/contacto/page.tsx`

#### Main Contact Form
- **Existing**: Already had analytics with `useAnalytics()` hook
- **Enhanced**: Full lead source detection and tracking
- **Features**: UTM parameter capture, lead source selector

#### Quick Contact Buttons
Enhanced 5 quick contact buttons with comprehensive lead generation:

| Button | Lead Source | Action |
|--------|-------------|--------|
| **Phone** | `TELEFONO` | Creates lead → Opens phone dialer |
| **WhatsApp** | `WHATSAPP` | Creates lead → Opens WhatsApp with message |
| **Email** | `EMAIL` | Creates lead → Opens email client |
| **Facebook** | `FACEBOOK` | Creates lead → Opens Facebook page |
| **Instagram** | `INSTAGRAM` | Creates lead → Opens Instagram page |

```typescript
// Example Implementation - Phone Button
const handlePhoneClick = async () => {
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Cliente - Llamada telefónica',
        phone: '+54 3482 308100',
        message: 'Solicitud de contacto telefónico desde página de contacto',
        source: 'telefono',
        property_id: null,
      }),
    });

    if (response.ok) {
      const leadData = await response.json();
      await trackLead(leadData.id, LEAD_SOURCE_CODES.TELEFONO);
    }
  } catch (error) {
    console.error('Error creating phone lead:', error);
  }
};
```

### 2. Property Detail Page Implementation
**File**: `/app/propiedades/[id]/page.tsx`

#### Contact Form
- **Implementation**: Built from scratch with full lead tracking
- **Source**: `FORMULARIO_WEB` with property context
- **Features**: Property-specific messaging, error handling

#### Action Buttons
Enhanced 5 action buttons with comprehensive tracking:

| Button | Source | Functionality |
|--------|--------|---------------|
| **Enviar consulta** | `FORMULARIO_WEB` | Opens contact form with property context |
| **Llamar ahora** | `TELEFONO` | Creates lead + opens phone with property reference |
| **Enviar email** | `EMAIL` | Creates lead + opens email with property details |
| **Agendar visita** | `FORMULARIO_WEB` | Creates lead for visit scheduling |
| **WhatsApp** | `WHATSAPP` | Creates lead + opens WhatsApp with personalized message |

#### WhatsApp Integration Example

```typescript
<Button
  onClick={async () => {
    // 1. Track WhatsApp click
    trackWhatsAppClick(property.id)
    
    // 2. Create lead
    const response = await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Cliente - WhatsApp',
        phone: '+54 9 1234567890',
        message: `Consulta por propiedad "${property.title}" - Código #${property.id}`,
        source: 'whatsapp',
        property_id: property.id,
      }),
    });

    if (response.ok) {
      const leadData = await response.json();
      await trackLead(leadData.id, LEAD_SOURCE_CODES.WHATSAPP, property.id);
    }
    
    // 3. Open WhatsApp with personalized message
    const message = encodeURIComponent(`Hola! Me interesa la propiedad "${property.title}" - Código #${property.id}`)
    window.open(`https://wa.me/5491234567890?text=${message}`, '_blank')
  }}
>
  <MessageCircle className="w-4 h-4 mr-2" />
  WhatsApp
</Button>
```

---

## 🎯 Lead Attribution & Tracking

### Lead Data Structure

```typescript
interface Lead {
  id: number
  name: string
  email?: string
  phone?: string
  message: string
  source: LeadSourceCode
  property_id?: number
  created_at: string
}
```

### Analytics Integration

```typescript
interface LeadAnalytics {
  lead_id: number
  session_id: string
  property_id?: number
  source_code: LeadSourceCode
  conversion_page: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}
```

### Tracking Flow

1. **Lead Creation** → Database record via `/api/leads`
2. **Analytics Event** → Tracking via analytics system
3. **Attribution** → UTM parameters and session data
4. **Action Execution** → Original user intent (call, message, etc.)

---

## 📊 Business Intelligence

### Key Metrics Tracked

- **Lead Volume by Source**
- **Property-Specific Lead Performance**
- **Conversion Rates by Channel**
- **Time-to-Lead Analysis**
- **Campaign Attribution**

### Marketing ROI Analysis

```sql
-- Example: Lead performance by source
SELECT 
  source,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN property_id IS NOT NULL THEN 1 END) as property_leads,
  AVG(conversion_time_minutes) as avg_conversion_time
FROM analytics_lead_generation
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY source
ORDER BY total_leads DESC;
```

---

## 🛡️ Error Handling & Reliability

### Fail-Safe Pattern

```typescript
const handleContactClick = async () => {
  try {
    // Create lead
    const response = await fetch('/api/leads', { /* ... */ });
    
    if (response.ok) {
      const leadData = await response.json();
      // Track analytics (non-blocking)
      trackLead(leadData.id, sourceCode, propertyId).catch(error => {
        console.warn('Analytics tracking failed:', error);
      });
    }
  } catch (error) {
    console.error('Lead creation failed:', error);
    // Still execute original action for user experience
  }
  
  // Always execute the user's intended action
  executeOriginalAction();
};
```

### Error Handling Strategy

1. **Lead Creation First**: Always prioritize business data
2. **Non-blocking Analytics**: Analytics failures don't block user experience  
3. **Fallback Tracking**: Multiple tracking mechanisms for reliability
4. **User Experience Priority**: Core functionality works even if tracking fails

---

## 🚀 Integration Guide

### Adding Lead Tracking to New Components

#### 1. Import Required Dependencies

```typescript
import { trackLead } from '@/lib/analytics-client'
import { LEAD_SOURCE_CODES } from '@/types/analytics'
```

#### 2. Implement Lead Creation Pattern

```typescript
const createAndTrackLead = async (
  contactType: string, 
  sourceCode: LeadSourceCode, 
  propertyId?: number
) => {
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Cliente - ${contactType}`,
        message: `Contacto desde ${contactType}`,
        source: sourceCode,
        property_id: propertyId,
      }),
    });

    if (response.ok) {
      const leadData = await response.json();
      await trackLead(leadData.id, sourceCode, propertyId);
      return leadData;
    }
  } catch (error) {
    console.error(`Error creating ${contactType} lead:`, error);
  }
  return null;
};
```

#### 3. Use in Component

```typescript
<Button onClick={async () => {
  await createAndTrackLead('WhatsApp', LEAD_SOURCE_CODES.WHATSAPP, propertyId);
  // Execute original action
}}>
  Contact via WhatsApp
</Button>
```

### Extending to New Contact Methods

1. **Add Source Code** to `LEAD_SOURCE_CODES` constant
2. **Implement Creation Pattern** using the standard approach
3. **Add Analytics Tracking** with `trackLead()` function
4. **Test Error Handling** to ensure reliability

---

## 📈 Performance Considerations

### Optimization Strategies

- **Asynchronous Tracking**: Analytics don't block user interactions
- **Batch Processing**: Multiple events processed together when possible
- **Client-Side Caching**: Reduce redundant API calls
- **Error Recovery**: Retry mechanisms for failed tracking

### Database Impact

- **Indexed Queries**: Lead source and property_id are indexed
- **Efficient Joins**: Analytics tables optimized for reporting
- **Data Retention**: Automatic cleanup of old analytics data

---

## 🔧 Troubleshooting Guide

### Common Issues

#### Lead Not Created
```bash
# Check API endpoint
curl -X POST /api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","source":"telefono"}'

# Expected: {"success": true, "id": 123}
```

#### Analytics Not Tracking
```typescript
// Debug analytics session
const analytics = useAnalytics();
console.log('Session ID:', analytics.sessionId);
console.log('Opted Out:', analytics.isOptedOut);
```

#### Source Attribution Missing
```typescript
// Verify source code mapping
import { LEAD_SOURCE_CODES } from '@/types/analytics';
console.log('Available sources:', LEAD_SOURCE_CODES);
```

### Debug Mode

Enable analytics debugging in development:

```typescript
const analytics = useAnalytics({
  enableConsoleLogging: true // Shows all tracking events
});
```

---

## 📋 Testing Checklist

### Manual Testing

- [ ] **Contact Page**: All 5 buttons create leads
- [ ] **Property Page**: All 5 action buttons create leads  
- [ ] **Contact Forms**: Lead creation with proper attribution
- [ ] **WhatsApp Links**: Personalized messages with property details
- [ ] **Error Handling**: UI works even if tracking fails

### Analytics Testing

- [ ] **Session Creation**: Analytics session established
- [ ] **Lead Tracking**: Analytics events recorded
- [ ] **Attribution**: UTM parameters captured
- [ ] **Property Context**: Property ID included where applicable

### Database Testing

```sql
-- Verify lead creation
SELECT * FROM leads ORDER BY created_at DESC LIMIT 10;

-- Check analytics events
SELECT * FROM analytics_lead_generation ORDER BY created_at DESC LIMIT 10;

-- Verify source distribution
SELECT source, COUNT(*) FROM leads GROUP BY source;
```

---

## 📚 API Reference

### POST /api/leads

Create a new lead record.

**Request Body:**
```typescript
{
  name: string           // Lead name
  email?: string        // Email address
  phone?: string        // Phone number  
  message: string       // Lead message/context
  source: LeadSourceCode // Attribution source
  property_id?: number  // Associated property
}
```

**Response:**
```typescript
{
  success: boolean
  id: number           // Created lead ID
  error?: string      // Error message if failed
}
```

### Analytics Functions

#### `trackLead(leadId, sourceCode, propertyId?)`

Track lead generation in analytics system.

**Parameters:**
- `leadId: number` - ID of created lead
- `sourceCode: LeadSourceCode` - Attribution source  
- `propertyId?: number` - Associated property

**Returns:** `Promise<boolean>` - Success status

---

## 🎯 Best Practices

### Implementation Guidelines

1. **Lead First, Track Second**: Always create the business record before analytics
2. **Error Resilience**: Analytics failures shouldn't break user experience
3. **Contextual Messages**: Include property details and contact context
4. **Source Consistency**: Use defined `LEAD_SOURCE_CODES` constants
5. **Performance**: Use asynchronous operations for tracking

### Code Quality

- **Type Safety**: Use TypeScript interfaces for lead data
- **Error Logging**: Log failures for debugging
- **User Feedback**: Provide appropriate UI feedback
- **Testing**: Include both unit and integration tests

---

## 🔄 Maintenance

### Regular Tasks

- **Monitor Lead Volume**: Check for unusual patterns
- **Review Error Logs**: Identify and fix tracking issues  
- **Update Source Codes**: Add new marketing channels
- **Performance Monitoring**: Track API response times

### Data Cleanup

```sql
-- Clean up old analytics data (example)
DELETE FROM analytics_lead_generation 
WHERE created_at < NOW() - INTERVAL '2 years';
```

---

## 📞 Support Information

### Key Contacts

- **Implementation Team**: Development team
- **Analytics Team**: Business intelligence team  
- **Business Stakeholders**: Sales and marketing teams

### Documentation

- [Analytics System Architecture](./analytics-system-architecture.md)
- [Analytics API Reference](./analytics-api-reference.md)  
- [GDPR Compliance Guide](./analytics-gdpr-compliance.md)

---

> **⚠️ Critical Note**: This lead tracking implementation is essential for business operations. Any changes should be thoroughly tested in staging environment before deployment to production.

**Generated by [Claude Code](https://claude.ai/code) Documentation Specialist**