# Lead Tracking API Reference

> **Developer Quick Reference**  
> API endpoints, functions, and integration patterns for lead tracking system

---

## 🎯 Core API Endpoints

### POST /api/leads

Create a new lead record with automatic analytics tracking.

**Request:**
```typescript
POST /api/leads
Content-Type: application/json

{
  name: string           // Required: Lead name/identifier
  email?: string         // Optional: Email address
  phone?: string         // Optional: Phone number
  message: string        // Required: Lead message/context
  source: LeadSourceCode // Required: Attribution source
  property_id?: number   // Optional: Associated property ID
}
```

**Response:**
```typescript
{
  success: boolean      // Operation success status
  id?: number          // Created lead ID (if successful)
  error?: string       // Error message (if failed)
  message?: string     // Success message
}
```

**Example Usage:**
```typescript
const createLead = async () => {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Cliente - WhatsApp',
      phone: '+54 9 3482 308100',
      message: 'Consulta por propiedad Casa en Centro - Código #123',
      source: 'whatsapp',
      property_id: 123
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Lead created with ID:', result.id);
  }
};
```

---

## 📊 Analytics Tracking Functions

### `trackLead(leadId, sourceCode, propertyId?)`

Track lead generation event in analytics system.

**Parameters:**
- `leadId: number` - ID of the created lead
- `sourceCode: LeadSourceCode` - Lead attribution source
- `propertyId?: number` - Optional associated property ID

**Returns:** `Promise<boolean>` - Success status

**Example:**
```typescript
import { trackLead, LEAD_SOURCE_CODES } from '@/lib/analytics-client';

// Track a phone lead
const success = await trackLead(123, LEAD_SOURCE_CODES.TELEFONO);

// Track a property-specific WhatsApp lead
const success = await trackLead(456, LEAD_SOURCE_CODES.WHATSAPP, 789);
```

### `trackContactClick(propertyId?)`

Track contact button interaction.

**Parameters:**
- `propertyId?: number` - Optional property context

**Example:**
```typescript
import { trackContactClick } from '@/lib/analytics-client';

// Track general contact click
trackContactClick();

// Track property-specific contact click  
trackContactClick(propertyId);
```

### `trackWhatsAppClick(propertyId?)`

Track WhatsApp button interaction.

**Parameters:**
- `propertyId?: number` - Optional property context

**Example:**
```typescript
import { trackWhatsAppClick } from '@/lib/analytics-client';

trackWhatsAppClick(propertyId);
```

---

## 🏗️ React Hooks & Components

### `useAnalytics(options?)`

Main analytics hook for tracking user behavior.

**Options:**
```typescript
interface UseAnalyticsOptions {
  enableAutoTracking?: boolean    // Default: true
  trackScrollDepth?: boolean      // Default: true
  trackTimeOnPage?: boolean       // Default: true
  sessionUpdateInterval?: number  // Default: 30000ms
}
```

**Returns:**
```typescript
{
  sessionId: string | null        // Current session ID
  isOptedOut: boolean            // GDPR opt-out status
  loading: boolean               // Initialization state
  
  // Tracking functions
  trackPropertyView: Function
  trackLeadGeneration: Function
  trackInteraction: Function
  trackContactClick: Function
  
  // GDPR compliance
  optOut: Function
  
  // Session stats
  currentStats: {
    timeOnPage: number
    maxScrollDepth: number
  }
}
```

**Example:**
```typescript
const ContactButton = ({ propertyId }) => {
  const analytics = useAnalytics();
  
  const handleClick = async () => {
    // Track the interaction
    analytics.trackContactClick('form', propertyId);
    
    // Create lead
    const lead = await createLead();
    
    // Track lead generation
    if (lead.success) {
      await analytics.trackLeadGeneration(
        lead.id, 
        LEAD_SOURCE_CODES.FORMULARIO_WEB,
        propertyId
      );
    }
  };
  
  return (
    <Button onClick={handleClick}>
      Contact Us
    </Button>
  );
};
```

### `usePropertyAnalytics(propertyId, options?)`

Specialized hook for property-specific tracking.

**Parameters:**
- `propertyId: number` - Property ID for context
- `options?: UseAnalyticsOptions` - Same as useAnalytics

**Returns:** All `useAnalytics` returns plus:
```typescript
{
  propertyId: number
  trackContact: (type) => void    // Simplified contact tracking
  trackLead: (leadId, sourceCode, data?) => Promise<boolean>
}
```

**Example:**
```typescript
const PropertyDetail = ({ property }) => {
  const analytics = usePropertyAnalytics(property.id);
  
  const handleWhatsApp = async () => {
    // Simplified tracking for this property
    analytics.trackContact('whatsapp');
    
    // Create and track lead
    const lead = await createLead();
    await analytics.trackLead(lead.id, LEAD_SOURCE_CODES.WHATSAPP);
  };
  
  return (
    <Button onClick={handleWhatsApp}>
      WhatsApp
    </Button>
  );
};
```

---

## 🎯 Lead Source Constants

### `LEAD_SOURCE_CODES`

Standardized lead source identifiers.

```typescript
export const LEAD_SOURCE_CODES = {
  FORMULARIO_WEB: 'formulario_web',    // Web contact forms
  WHATSAPP: 'whatsapp',                // WhatsApp interactions
  TELEFONO: 'telefono',                // Phone calls
  EMAIL: 'email',                      // Email interactions
  FACEBOOK: 'facebook',                // Facebook social
  INSTAGRAM: 'instagram',              // Instagram social
  GOOGLE_ADS: 'google_ads',            // Google advertising
  FACEBOOK_ADS: 'facebook_ads',        // Facebook advertising
  REFERIDO: 'referido',                // Referral traffic
  WALK_IN: 'walk_in',                  // Physical walk-ins
  MARKETPLACE: 'marketplace',           // Property marketplaces
  OTROS: 'otros'                       // Other sources
} as const;

export type LeadSourceCode = typeof LEAD_SOURCE_CODES[keyof typeof LEAD_SOURCE_CODES];
```

**Usage:**
```typescript
import { LEAD_SOURCE_CODES } from '@/types/analytics';

// ✅ Correct
const source = LEAD_SOURCE_CODES.WHATSAPP;

// ❌ Incorrect - hard-coded string
const source = 'whatsapp';
```

---

## 🛠️ Implementation Patterns

### Standard Lead Creation Pattern

```typescript
const createAndTrackLead = async (
  contactType: string,
  sourceCode: LeadSourceCode,
  propertyId?: number,
  additionalData?: Record<string, any>
) => {
  try {
    // 1. Create lead record
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Cliente - ${contactType}`,
        message: propertyId 
          ? `Consulta por propiedad #${propertyId}`
          : `Consulta general via ${contactType}`,
        source: sourceCode,
        property_id: propertyId,
        ...additionalData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const leadData = await response.json();
    
    // 2. Track analytics (non-blocking)
    if (leadData.success) {
      trackLead(leadData.id, sourceCode, propertyId)
        .catch(error => console.warn('Analytics tracking failed:', error));
    }

    return leadData;
  } catch (error) {
    console.error(`Failed to create ${contactType} lead:`, error);
    throw error;
  }
};
```

### Button Implementation Pattern

```typescript
const ContactButton = ({ 
  type, 
  sourceCode, 
  propertyId, 
  children, 
  onClick 
}) => {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    
    try {
      // Create lead
      const lead = await createAndTrackLead(type, sourceCode, propertyId);
      
      // Execute additional action
      if (onClick) {
        await onClick(lead);
      }
      
      // Show success feedback
      toast.success('¡Gracias! Nos pondremos en contacto contigo pronto.');
      
    } catch (error) {
      console.error('Contact action failed:', error);
      toast.error('Hubo un error. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleClick}
      disabled={loading}
      loading={loading}
    >
      {children}
    </Button>
  );
};

// Usage
<ContactButton
  type="WhatsApp"
  sourceCode={LEAD_SOURCE_CODES.WHATSAPP}
  propertyId={property.id}
  onClick={(lead) => {
    const message = `Hola! Me interesa la propiedad #${property.id}`;
    window.open(`https://wa.me/5491234567890?text=${encodeURIComponent(message)}`);
  }}
>
  <MessageCircle className="w-4 h-4 mr-2" />
  WhatsApp
</ContactButton>
```

### Form Submission Pattern

```typescript
const ContactForm = ({ propertyId }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const analytics = useAnalytics();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create lead
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'formulario_web',
          property_id: propertyId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Track analytics
        await analytics.trackLeadGeneration(
          result.id,
          LEAD_SOURCE_CODES.FORMULARIO_WEB,
          propertyId,
          {
            form_type: 'contact_form',
            utm_source: new URLSearchParams(window.location.search).get('utm_source')
          }
        );
        
        // Reset form and show success
        setFormData({ name: '', email: '', phone: '', message: '' });
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setError('Error al enviar el formulario');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

---

## 🔧 Error Handling

### API Error Responses

```typescript
// Error response format
{
  success: false,
  error: string,           // Human-readable error message
  code?: string,          // Error code for programmatic handling
  details?: any           // Additional error details
}

// Common error codes
'VALIDATION_ERROR'        // Invalid input data
'DATABASE_ERROR'          // Database operation failed
'ANALYTICS_ERROR'         // Analytics tracking failed
'RATE_LIMIT_ERROR'        // Too many requests
```

### Error Handling Best Practices

```typescript
const handleLeadCreation = async () => {
  try {
    const response = await fetch('/api/leads', { /* ... */ });
    
    // Always check response status
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    // Check success flag
    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }
    
    return result;
    
  } catch (error) {
    // Log for debugging
    console.error('Lead creation failed:', error);
    
    // Show user-friendly message
    if (error.message.includes('network')) {
      toast.error('Error de conexión. Verifica tu internet.');
    } else {
      toast.error('Error al procesar tu solicitud. Intenta nuevamente.');
    }
    
    // Don't break user experience
    return { success: false, error: error.message };
  }
};
```

---

## 🔒 Type Safety

### TypeScript Interfaces

```typescript
// Lead data structure
interface Lead {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  source: LeadSourceCode;
  property_id?: number;
  created_at: string;
  updated_at: string;
}

// Lead creation input
interface CreateLeadInput {
  name: string;
  email?: string;
  phone?: string;
  message: string;
  source: LeadSourceCode;
  property_id?: number;
}

// API response
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Analytics tracking data
interface LeadTrackingData {
  lead_id: number;
  source_code: LeadSourceCode;
  property_id?: number;
  session_id?: string;
  conversion_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}
```

---

## 📊 Analytics Events

### Event Types

```typescript
// Property view events
interface PropertyViewEvent {
  property_id: number;
  session_id: string;
  time_on_page?: number;
  scroll_depth?: number;
  contact_button_clicked?: boolean;
  whatsapp_clicked?: boolean;
  phone_clicked?: boolean;
  email_clicked?: boolean;
}

// Lead generation events  
interface LeadGenerationEvent {
  lead_id: number;
  source_code: LeadSourceCode;
  property_id?: number;
  session_id?: string;
  conversion_time_minutes?: number;
  form_type?: string;
}

// User interaction events
interface UserInteractionEvent {
  event_type: string;
  event_target?: string;
  property_id?: number;
  event_data?: Record<string, any>;
}
```

---

## 🧪 Testing Utilities

### Mock Functions

```typescript
// Mock lead creation for testing
export const mockCreateLead = jest.fn().mockImplementation(async (data) => ({
  success: true,
  id: Math.floor(Math.random() * 1000),
  data: { ...data, id: Math.floor(Math.random() * 1000) }
}));

// Mock analytics tracking
export const mockTrackLead = jest.fn().mockResolvedValue(true);

// Test helper
export const createTestLead = (overrides = {}) => ({
  name: 'Test Lead',
  message: 'Test message',
  source: LEAD_SOURCE_CODES.TELEFONO,
  ...overrides
});
```

### Integration Tests

```typescript
describe('Lead Tracking Integration', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should create lead and track analytics', async () => {
    // Mock successful lead creation
    fetchMock.mockResponseOnce(JSON.stringify({
      success: true,
      id: 123
    }));

    // Mock successful analytics tracking
    fetchMock.mockResponseOnce(JSON.stringify({
      success: true
    }));

    const result = await createAndTrackLead(
      'WhatsApp',
      LEAD_SOURCE_CODES.WHATSAPP,
      456
    );

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2); // Lead + Analytics
  });
});
```

---

## 📈 Performance Considerations

### Optimization Techniques

```typescript
// Debounce rapid-fire tracking calls
const debouncedTrackLead = debounce(trackLead, 1000);

// Batch analytics events
const batchTrackingQueue = [];
const flushBatch = async () => {
  if (batchTrackingQueue.length === 0) return;
  
  const batch = batchTrackingQueue.splice(0);
  // Send batch to analytics endpoint
};

// Non-blocking analytics
const trackLeadAsync = (leadId, sourceCode, propertyId) => {
  // Don't await - fire and forget
  trackLead(leadId, sourceCode, propertyId)
    .catch(error => console.warn('Analytics failed:', error));
};

// Lazy load analytics
const analytics = lazy(() => import('@/hooks/useAnalytics'));
```

---

## 🔍 Debugging Tools

### Debug Mode

```typescript
// Enable debug logging
const DEBUG_LEAD_TRACKING = process.env.NODE_ENV === 'development';

const debugLog = (message: string, data?: any) => {
  if (DEBUG_LEAD_TRACKING) {
    console.log(`[Lead Tracking] ${message}`, data || '');
  }
};

// Usage in functions
const createLead = async (data) => {
  debugLog('Creating lead', data);
  const result = await fetch('/api/leads', { /* ... */ });
  debugLog('Lead created', result);
  return result;
};
```

### Console Commands

```typescript
// Add to window for debugging in browser console
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.leadTrackingDebug = {
    createTestLead: () => createAndTrackLead('Test', LEAD_SOURCE_CODES.TELEFONO),
    checkAnalytics: () => console.log(useAnalytics()),
    sourceCodes: LEAD_SOURCE_CODES
  };
}

// Usage in browser console:
// window.leadTrackingDebug.createTestLead()
// window.leadTrackingDebug.checkAnalytics()
```

---

> **📝 Note**: This API reference covers the core lead tracking functionality. For advanced analytics features, see the [Analytics System Architecture](./analytics-system-architecture.md) documentation.

**Generated by [Claude Code](https://claude.ai/code) Documentation Specialist**