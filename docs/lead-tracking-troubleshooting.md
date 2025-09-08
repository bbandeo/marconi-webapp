# Lead Tracking Troubleshooting Guide

> **Quick Reference for Common Issues**  
> Diagnostic procedures and solutions for lead tracking problems

---

## 🚨 Emergency Diagnostics

### Quick Health Check

```typescript
// Browser Console - Check Analytics Status
const analytics = useAnalytics();
console.log('Analytics Status:', {
  sessionId: analytics.sessionId,
  isOptedOut: analytics.isOptedOut,
  loading: analytics.loading
});

// Check LEAD_SOURCE_CODES
import { LEAD_SOURCE_CODES } from '@/types/analytics';
console.log('Available Sources:', LEAD_SOURCE_CODES);
```

---

## 🔍 Common Issues & Solutions

### 1. Leads Not Being Created

#### **Symptom**: Contact buttons don't create lead records

**Diagnostic Steps:**
```bash
# Test API endpoint directly
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "message": "Test message",
    "source": "telefono"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "id": 123,
  "message": "Lead created successfully"
}
```

**Common Causes & Fixes:**

| Cause | Solution |
|-------|----------|
| **Database Connection** | Check Supabase connection in `/lib/supabase.ts` |
| **Missing Environment Variables** | Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` |
| **Invalid Source Code** | Use values from `LEAD_SOURCE_CODES` constant |
| **API Route Error** | Check Next.js API logs in console |

**Fix Example:**
```typescript
// Ensure source code is valid
const validSources = Object.values(LEAD_SOURCE_CODES);
if (!validSources.includes(sourceCode)) {
  console.error('Invalid source code:', sourceCode);
  return;
}
```

### 2. Analytics Tracking Failures

#### **Symptom**: Leads created but no analytics events recorded

**Diagnostic Steps:**
```typescript
// Check analytics session
const analytics = useAnalytics();
if (!analytics.sessionId) {
  console.error('No analytics session - tracking disabled');
}

// Test lead tracking directly
import { trackLead } from '@/lib/analytics-client';
trackLead(123, 'telefono', 456)
  .then(success => console.log('Tracking success:', success))
  .catch(error => console.error('Tracking failed:', error));
```

**Common Causes & Fixes:**

| Cause | Solution |
|-------|----------|
| **No Session ID** | Refresh page to initialize session |
| **User Opted Out** | Check `analytics.isOptedOut` status |
| **Network Error** | Check browser network tab for failed requests |
| **Invalid Property ID** | Ensure property ID exists and is numeric |

**Fix Example:**
```typescript
// Robust tracking with error handling
const trackLeadSafely = async (leadId, sourceCode, propertyId) => {
  try {
    if (!analytics.sessionId) {
      console.warn('No analytics session - skipping tracking');
      return;
    }
    
    const success = await trackLead(leadId, sourceCode, propertyId);
    if (!success) {
      console.warn('Lead tracking returned false');
    }
  } catch (error) {
    console.error('Lead tracking failed:', error);
    // Don't throw - analytics failures shouldn't break UX
  }
};
```

### 3. WhatsApp Links Not Working

#### **Symptom**: WhatsApp button doesn't open or has wrong message

**Common Issues:**

| Issue | Solution |
|-------|----------|
| **Wrong Phone Number** | Update phone number in component |
| **URL Encoding Error** | Use `encodeURIComponent()` for message |
| **Missing Property Context** | Ensure property data is available |

**Fix Example:**
```typescript
// Correct WhatsApp implementation
const handleWhatsAppClick = async () => {
  // 1. Create lead first
  await createLead();
  
  // 2. Build message with proper encoding
  const message = encodeURIComponent(
    `Hola! Me interesa la propiedad "${property?.title || 'Consulta'}" - Código #${property?.id || 'N/A'}`
  );
  
  // 3. Open WhatsApp
  const phoneNumber = '5491234567890'; // Update with real number
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
};
```

### 4. Contact Forms Not Submitting

#### **Symptom**: Form submission fails or doesn't create leads

**Diagnostic Steps:**
```typescript
// Check form data before submission
console.log('Form Data:', contactForm);

// Validate required fields
const isValid = contactForm.name && contactForm.email && contactForm.message;
console.log('Form Valid:', isValid);
```

**Common Causes & Fixes:**

| Cause | Solution |
|-------|----------|
| **Missing Required Fields** | Add validation before submission |
| **Invalid Email Format** | Use HTML5 email validation |
| **Large Message Size** | Limit message length |
| **CSRF Protection** | Ensure proper headers are sent |

**Fix Example:**
```typescript
const handleFormSubmit = async (e) => {
  e.preventDefault();
  
  // Validate form
  if (!contactForm.name?.trim() || !contactForm.message?.trim()) {
    setError('Por favor completa todos los campos requeridos');
    return;
  }
  
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...contactForm,
        source: 'formulario_web',
        property_id: propertyId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al enviar');
    }
    
    const result = await response.json();
    // Handle success
  } catch (error) {
    console.error('Form submission error:', error);
    setError(error.message);
  }
};
```

### 5. Property Context Missing

#### **Symptom**: Leads created without property_id association

**Common Causes:**
- Property data not loaded
- Property ID not passed to functions
- Component rendered before property fetch

**Fix Example:**
```typescript
// Ensure property context in all lead creation
const createLeadWithContext = async (sourceCode) => {
  // Wait for property to load
  if (!property?.id) {
    console.warn('Property not loaded - creating lead without context');
  }
  
  const leadData = {
    name: `Cliente - ${getSourceDisplayName(sourceCode)}`,
    message: property?.id 
      ? `Consulta por propiedad "${property.title}" - Código #${property.id}`
      : 'Consulta general',
    source: sourceCode,
    property_id: property?.id || null
  };
  
  // Create lead...
};
```

---

## 🛠️ Advanced Diagnostics

### Database Query Debugging

```sql
-- Check recent leads
SELECT 
  id, name, source, property_id, created_at 
FROM leads 
ORDER BY created_at DESC 
LIMIT 10;

-- Check analytics events
SELECT 
  lead_id, source_code, property_id, created_at
FROM analytics_lead_generation 
ORDER BY created_at DESC 
LIMIT 10;

-- Find orphaned leads (no analytics)
SELECT l.*
FROM leads l
LEFT JOIN analytics_lead_generation alg ON l.id = alg.lead_id
WHERE alg.id IS NULL
AND l.created_at > NOW() - INTERVAL '1 day';
```

### Network Request Analysis

```typescript
// Monitor all lead-related API calls
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const [url, options] = args;
  if (url.toString().includes('/api/leads') || url.toString().includes('/api/analytics')) {
    console.log('API Call:', {
      url: url.toString(),
      method: options?.method,
      body: options?.body
    });
  }
  
  const response = await originalFetch(...args);
  
  if (url.toString().includes('/api/leads') || url.toString().includes('/api/analytics')) {
    console.log('API Response:', {
      url: url.toString(),
      status: response.status,
      ok: response.ok
    });
  }
  
  return response;
};
```

### Component State Debugging

```typescript
// Debug component state in development
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Component Debug State:', {
      property: property?.id,
      sessionId: analytics.sessionId,
      contactForm,
      showContactForm,
      loading
    });
  }
}, [property, analytics.sessionId, contactForm, showContactForm, loading]);
```

---

## 🔧 Environment-Specific Issues

### Development Environment

**Common Issues:**
- Hot reloading breaks analytics session
- CORS errors with API calls
- Console noise from debug logging

**Solutions:**
```typescript
// Disable analytics in development if needed
const shouldTrack = process.env.NODE_ENV === 'production' || 
                   process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS === 'true';
```

### Production Environment

**Common Issues:**
- Environment variables not set
- Rate limiting on API calls
- Browser security restrictions

**Checklist:**
- [ ] `SUPABASE_URL` configured
- [ ] `SUPABASE_ANON_KEY` configured  
- [ ] API rate limits adequate
- [ ] HTTPS enforced for secure contexts

---

## 📊 Monitoring & Alerts

### Key Metrics to Monitor

```typescript
// Example monitoring queries
const healthCheck = async () => {
  // Check lead creation rate
  const recentLeads = await supabase
    .from('leads')
    .select('count')
    .gte('created_at', new Date(Date.now() - 60000).toISOString());
  
  // Check analytics tracking rate  
  const recentAnalytics = await supabase
    .from('analytics_lead_generation')
    .select('count')
    .gte('created_at', new Date(Date.now() - 60000).toISOString());
    
  console.log('Health Check:', {
    leadsPerMinute: recentLeads.count,
    analyticsPerMinute: recentAnalytics.count,
    trackingRatio: recentAnalytics.count / recentLeads.count
  });
};
```

### Alert Thresholds

| Metric | Normal | Warning | Critical |
|--------|--------|---------|----------|
| Lead Creation Rate | >0/hour | 0/hour for 2+ hours | 0/hour for 6+ hours |
| Analytics Tracking Ratio | >90% | 50-90% | <50% |
| API Error Rate | <1% | 1-5% | >5% |

---

## 🚀 Performance Optimization

### Common Performance Issues

#### Slow Lead Creation
```typescript
// Optimize lead creation with minimal data
const createLeadFast = async (essentialData) => {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Only send required fields
      name: essentialData.name,
      source: essentialData.source,
      message: essentialData.message,
      property_id: essentialData.property_id
      // Skip optional fields for speed
    })
  });
  return response.json();
};
```

#### Analytics Tracking Delays
```typescript
// Use fire-and-forget for analytics
const trackLeadAsync = (leadId, sourceCode, propertyId) => {
  // Don't await analytics tracking
  trackLead(leadId, sourceCode, propertyId)
    .catch(error => console.warn('Analytics tracking failed:', error));
};
```

---

## 📋 Testing Procedures

### Manual Testing Script

```bash
#!/bin/bash
# Lead Tracking Test Script

echo "Testing Lead Creation..."

# Test 1: Basic lead creation
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","source":"telefono","message":"Test"}'

# Test 2: Lead with property context  
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","source":"whatsapp","property_id":123,"message":"Property inquiry"}'

echo "Check database for created leads..."
```

### Automated Testing

```typescript
// Jest test example
describe('Lead Tracking', () => {
  it('should create lead and track analytics', async () => {
    const leadData = {
      name: 'Test Lead',
      source: 'telefono',
      message: 'Test message'
    };
    
    // Mock API responses
    fetchMock.mockResponseOnce(JSON.stringify({
      success: true,
      id: 123
    }));
    
    const result = await createAndTrackLead(leadData);
    
    expect(result).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith('/api/leads', 
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(leadData)
      })
    );
  });
});
```

---

## 📞 Emergency Contacts

### Escalation Path

1. **Development Team**: First line for technical issues
2. **DevOps Team**: Infrastructure and deployment issues  
3. **Business Stakeholders**: Critical business impact
4. **External Support**: Supabase/Vercel support if needed

### Critical Issue Response

**If lead tracking completely fails:**

1. **Immediate**: Deploy rollback if recent deployment
2. **Short-term**: Implement manual lead capture  
3. **Long-term**: Root cause analysis and prevention

---

> **💡 Pro Tip**: Most lead tracking issues are related to network connectivity or session management. Always check analytics session status first.

**Generated by [Claude Code](https://claude.ai/code) Documentation Specialist**