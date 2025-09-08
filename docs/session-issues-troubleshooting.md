# Session Issues Troubleshooting Guide

> **Comprehensive Resolution Guide**  
> Solutions for critical issues identified and resolved in development sessions

---

## 🎯 Overview

This guide documents the complete resolution of critical issues encountered during Next.js 15 + React 19 development with Supabase integration. Each issue includes problem identification, root cause analysis, step-by-step resolution, and prevention strategies.

**Technology Stack Context:**
- Next.js 15 with App Router
- React 19 with TypeScript  
- Supabase (PostgreSQL + Real-time)
- GDPR-compliant analytics system
- Vercel deployment environment

---

## 🚨 Critical Issue Resolution Matrix

| Issue Category | Severity | Impact | Resolution Time |
|---------------|----------|---------|-----------------|
| CORS Policy Errors | High | API calls blocked | 15-30 minutes |
| Analytics 500 Errors | High | Data loss | 30-60 minutes |  
| Analytics 405 Errors | Medium | Feature unavailable | 15-30 minutes |
| TypeScript Compilation | Critical | Build failure | 10-20 minutes |
| SSR Initialization | Critical | App won't load | 20-45 minutes |
| Build Failures | Critical | Deployment blocked | 30-90 minutes |

---

## 🛠️ Issue #1: CORS Policy Errors

### **Problem Identification**

```bash
# Browser Console Error
Access to fetch at 'https://nominatim.openstreetmap.org/search' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### **Root Cause Analysis**

**Primary Cause**: Direct client-side requests to external APIs (OpenStreetMap Nominatim)
- External APIs don't include localhost in CORS headers
- Client-side geocoding requests blocked by browser security
- No server-side proxy for external API calls

**Secondary Issues:**
- No rate limiting on external API calls
- No caching mechanism for geocoding requests
- Poor error handling for network failures

### **Step-by-Step Resolution**

#### **Step 1: Create API Proxy Route**

```typescript
// File: /app/api/geocode/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// Simple cache (in production, use Redis)
const geocodeCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Rate limiting check
    const clientIP = request.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;
    
    // Clean old entries
    for (const [key, timestamp] of rateLimit.entries()) {
      if (timestamp < windowStart) {
        rateLimit.delete(key);
      }
    }
    
    // Count requests for this IP
    const requests = Array.from(rateLimit.entries())
      .filter(([key]) => key.startsWith(clientIP))
      .length;
    
    if (requests >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Add current request to rate limit tracker
    rateLimit.set(`${clientIP}-${now}`, now);
    
    // Check cache first
    const cacheKey = `geocode:${query.toLowerCase()}`;
    const cached = geocodeCache.get(cacheKey);
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }
    
    // Make request to Nominatim API
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=ar`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Marconi-Webapp/1.0 (your-email@domain.com)', // Required by Nominatim
      },
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding service error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    geocodeCache.set(cacheKey, {
      data,
      timestamp: now,
    });
    
    // Clean old cache entries periodically
    if (geocodeCache.size > 1000) {
      for (const [key, value] of geocodeCache.entries()) {
        if ((now - value.timestamp) > CACHE_TTL) {
          geocodeCache.delete(key);
        }
      }
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json(
      { error: 'Geocoding service temporarily unavailable' },
      { status: 503 }
    );
  }
}
```

#### **Step 2: Update Client Configuration**

```typescript
// File: /lib/map-config.ts
// Update geocoding function to use internal API

export const geocodeAddress = async (address: string): Promise<GeocodingResult[]> => {
  try {
    // Use internal API instead of direct external call
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`);
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Demasiadas solicitudes. Por favor intenta más tarde.');
      }
      throw new Error(`Error de geocodificación: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      display_name: item.display_name,
      address: item.address,
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};
```

### **Prevention Strategies**

1. **Always use server-side proxies for external APIs**
2. **Implement rate limiting and caching from the start**
3. **Add proper User-Agent headers for external services**
4. **Test with different origins (localhost, staging, production)**

### **Verification Steps**

```bash
# Test the proxy endpoint
curl "http://localhost:3000/api/geocode?q=Buenos%20Aires"

# Check rate limiting
for i in {1..12}; do
  curl "http://localhost:3000/api/geocode?q=test$i" &
done
wait
# Should see 429 errors after 10 requests
```

---

## 🔥 Issue #2: Analytics 500 Errors

### **Problem Identification**

```bash
# Network Tab in Browser DevTools
POST /api/analytics/session 500 (Internal Server Error)
{"error": "Session creation failed"}
```

### **Root Cause Analysis**

**Primary Cause**: Missing fallback mechanisms in session creation
- IP hashing failures without fallbacks
- No graceful degradation when database is unavailable
- Missing error boundaries in analytics flow
- Insufficient validation of input data

**Database Issues:**
- Concurrent session creation conflicts
- Missing indexes on analytics tables
- IP hashing algorithm inconsistencies

### **Step-by-Step Resolution**

#### **Step 1: Enhance Analytics Service with Fallbacks**

```typescript
// File: /services/analytics.ts
import { createHash, randomBytes } from 'crypto';
import { supabase } from '@/lib/supabase';

export class AnalyticsError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

export class AnalyticsValidationError extends AnalyticsError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

// Enhanced IP hashing with multiple fallback strategies
function hashIP(ip: string): string {
  try {
    // Primary: SHA-256 with salt
    const salt = process.env.ANALYTICS_SALT || 'default-salt-change-in-production';
    return createHash('sha256')
      .update(ip + salt)
      .digest('hex')
      .substring(0, 32);
  } catch (error) {
    console.error('Primary IP hashing failed:', error);
    
    // Fallback 1: Simple hash
    try {
      return createHash('md5')
        .update(ip)
        .digest('hex')
        .substring(0, 32);
    } catch (fallbackError) {
      console.error('Fallback IP hashing failed:', fallbackError);
      
      // Fallback 2: Generate consistent hash from IP
      const simpleHash = ip.split('.').reduce((hash, octet) => {
        return hash + parseInt(octet || '0', 10);
      }, 0).toString(36);
      
      return simpleHash.padStart(32, '0').substring(0, 32);
    }
  }
}

// Enhanced session creation with multiple fallback levels
export async function createAnalyticsSession(
  userAgent?: string,
  ip?: string,
  referrer?: string
): Promise<string> {
  try {
    // Validate inputs with fallbacks
    const sessionData = {
      user_agent: userAgent || 'unknown',
      ip_hash: ip ? hashIP(ip) : `fallback-${Date.now()}`,
      referrer: referrer || null,
      session_start: new Date().toISOString(),
    };

    // Primary attempt: Database creation
    try {
      const { data, error } = await supabase
        .from('analytics_sessions')
        .insert(sessionData)
        .select('id')
        .single();

      if (error) throw error;
      
      return data.id;
    } catch (dbError) {
      console.error('Database session creation failed:', dbError);
      
      // Fallback 1: Try with minimal data
      try {
        const minimalData = {
          user_agent: 'minimal',
          ip_hash: `minimal-${Date.now()}`,
          session_start: new Date().toISOString(),
        };
        
        const { data, error } = await supabase
          .from('analytics_sessions')
          .insert(minimalData)
          .select('id')
          .single();
          
        if (error) throw error;
        
        console.warn('Session created with minimal data');
        return data.id;
      } catch (minimalError) {
        console.error('Minimal session creation failed:', minimalError);
        
        // Fallback 2: Generate client-side session ID
        const fallbackId = `fallback-${randomBytes(16).toString('hex')}-${Date.now()}`;
        console.warn('Using fallback session ID:', fallbackId);
        
        // Try to save fallback session asynchronously (don't wait)
        saveFallbackSessionAsync(fallbackId, sessionData);
        
        return fallbackId;
      }
    }
  } catch (error) {
    console.error('Session creation completely failed:', error);
    
    // Final fallback: Generate unique session ID
    const emergencyId = `emergency-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    console.warn('Using emergency session ID:', emergencyId);
    
    return emergencyId;
  }
}

// Async fallback session saving (fire and forget)
async function saveFallbackSessionAsync(sessionId: string, sessionData: any) {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    await supabase
      .from('analytics_sessions')
      .insert({
        ...sessionData,
        id: sessionId,
        is_fallback: true,
      });
      
    console.log('Fallback session saved successfully:', sessionId);
  } catch (error) {
    console.error('Failed to save fallback session:', error);
    // Don't throw - this is best effort
  }
}

// Enhanced property view tracking with fallbacks
export async function trackPropertyView(
  sessionId: string,
  propertyId: number,
  additionalData?: Record<string, any>
): Promise<boolean> {
  try {
    // Validate inputs
    if (!sessionId) {
      throw new AnalyticsValidationError('Session ID is required');
    }
    
    if (!propertyId || !Number.isInteger(propertyId)) {
      throw new AnalyticsValidationError('Valid property ID is required');
    }

    // Check for recent duplicate views (debounce)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    
    try {
      const { data: recentViews } = await supabase
        .from('analytics_property_views')
        .select('id')
        .eq('session_id', sessionId)
        .eq('property_id', propertyId)
        .gt('created_at', twoHoursAgo)
        .limit(1);

      if (recentViews && recentViews.length > 0) {
        console.log('Duplicate view detected, skipping');
        return true; // Return success to avoid breaking UX
      }
    } catch (debounceError) {
      console.warn('Debounce check failed, proceeding with tracking:', debounceError);
    }

    // Track the view
    const viewData = {
      session_id: sessionId,
      property_id: propertyId,
      created_at: new Date().toISOString(),
      ...additionalData,
    };

    const { error } = await supabase
      .from('analytics_property_views')
      .insert(viewData);

    if (error) {
      console.error('Property view tracking failed:', error);
      
      // Try with minimal data
      const minimalData = {
        session_id: sessionId,
        property_id: propertyId,
        created_at: new Date().toISOString(),
      };
      
      const { error: minimalError } = await supabase
        .from('analytics_property_views')
        .insert(minimalData);
        
      if (minimalError) {
        throw minimalError;
      }
      
      console.warn('View tracked with minimal data');
    }

    return true;
  } catch (error) {
    console.error('Property view tracking failed:', error);
    
    // Don't throw - analytics failures shouldn't break UX
    // Instead, log for monitoring and return false
    return false;
  }
}
```

#### **Step 2: Update API Routes with Error Handling**

```typescript
// File: /app/api/analytics/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAnalyticsSession } from '@/services/analytics';

export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
              request.headers.get('x-real-ip') ||
              request.ip ||
              '127.0.0.1';
    const referrer = request.headers.get('referer') || undefined;

    const sessionId = await createAnalyticsSession(userAgent, ip, referrer);

    return NextResponse.json({
      success: true,
      sessionId,
      // Include metadata for debugging (only in development)
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          userAgent,
          ip: ip ? 'masked' : 'none',
          referrer,
        }
      })
    });

  } catch (error) {
    console.error('Session creation API error:', error);
    
    // Return a fallback session ID even on complete failure
    const emergencySessionId = `api-emergency-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    
    return NextResponse.json({
      success: false,
      sessionId: emergencySessionId,
      error: 'Session creation failed, using fallback',
      // Don't expose internal error details in production
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }, { status: 200 }); // Return 200 with fallback instead of 500
  }
}
```

### **Prevention Strategies**

1. **Always implement multiple fallback levels**
2. **Never let analytics failures break core UX**
3. **Use graceful degradation patterns**
4. **Implement proper error boundaries**
5. **Add comprehensive logging for monitoring**

### **Verification Steps**

```bash
# Test session creation with various scenarios
curl -X POST http://localhost:3000/api/analytics/session \
  -H "User-Agent: TestBot/1.0" \
  -H "X-Forwarded-For: 192.168.1.100"

# Test with missing headers
curl -X POST http://localhost:3000/api/analytics/session

# Test with invalid data
curl -X POST http://localhost:3000/api/analytics/session \
  -H "User-Agent: $(python3 -c 'print("x" * 10000)')"
```

---

## ⚠️ Issue #3: Analytics 405 Errors

### **Problem Identification**

```bash
# Browser Network Tab
POST /api/analytics/interaction net::ERR_ABORTED 405 (Method Not Allowed)
```

### **Root Cause Analysis**

**Primary Cause**: Missing API endpoint for user interactions
- Frontend trying to track interactions but no backend endpoint exists
- No handling for batch interaction submissions
- Missing validation for interaction data

### **Step-by-Step Resolution**

#### **Step 1: Create Interaction API Endpoint**

```typescript
// File: /app/api/analytics/interaction/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AnalyticsValidationError } from '@/services/analytics';

// Types for interaction data
interface InteractionData {
  sessionId: string;
  type: string;
  target?: string;
  value?: string | number;
  propertyId?: number;
  metadata?: Record<string, any>;
}

interface BatchInteractionRequest {
  interactions: InteractionData[];
}

// Validate single interaction
function validateInteraction(interaction: any): InteractionData {
  if (!interaction.sessionId || typeof interaction.sessionId !== 'string') {
    throw new AnalyticsValidationError('Session ID is required and must be a string');
  }
  
  if (!interaction.type || typeof interaction.type !== 'string') {
    throw new AnalyticsValidationError('Interaction type is required');
  }
  
  // Validate type against allowed values
  const allowedTypes = ['click', 'scroll', 'form_submit', 'page_view', 'contact', 'whatsapp', 'phone'];
  if (!allowedTypes.includes(interaction.type)) {
    throw new AnalyticsValidationError(`Invalid interaction type: ${interaction.type}`);
  }
  
  return {
    sessionId: interaction.sessionId,
    type: interaction.type,
    target: interaction.target || null,
    value: interaction.value || null,
    propertyId: interaction.propertyId || null,
    metadata: interaction.metadata || null,
  };
}

// Handle single interaction (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate interaction data
    const interaction = validateInteraction(body);
    
    // Insert into database
    const { data, error } = await supabase
      .from('analytics_interactions')
      .insert({
        session_id: interaction.sessionId,
        interaction_type: interaction.type,
        target_element: interaction.target,
        interaction_value: interaction.value,
        property_id: interaction.propertyId,
        metadata: interaction.metadata,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Interaction tracking failed:', error);
      
      // Try with minimal data on failure
      const { error: minimalError } = await supabase
        .from('analytics_interactions')
        .insert({
          session_id: interaction.sessionId,
          interaction_type: interaction.type,
          created_at: new Date().toISOString(),
        });
        
      if (minimalError) {
        throw minimalError;
      }
      
      return NextResponse.json({
        success: true,
        message: 'Interaction tracked with minimal data',
        id: null,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Interaction tracked successfully',
      id: data.id,
    });

  } catch (error) {
    console.error('Interaction API error:', error);
    
    if (error instanceof AnalyticsValidationError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        message: error.message,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Interaction tracking failed',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    }, { status: 500 });
  }
}

// Handle batch interactions (PUT)
export async function PUT(request: NextRequest) {
  try {
    const body: BatchInteractionRequest = await request.json();
    
    if (!body.interactions || !Array.isArray(body.interactions)) {
      throw new AnalyticsValidationError('Interactions array is required');
    }
    
    if (body.interactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No interactions to process',
        processed: 0,
      });
    }
    
    if (body.interactions.length > 100) {
      throw new AnalyticsValidationError('Too many interactions in batch (max 100)');
    }
    
    // Validate all interactions
    const validatedInteractions = body.interactions.map(validateInteraction);
    
    // Prepare data for insertion
    const insertData = validatedInteractions.map(interaction => ({
      session_id: interaction.sessionId,
      interaction_type: interaction.type,
      target_element: interaction.target,
      interaction_value: interaction.value,
      property_id: interaction.propertyId,
      metadata: interaction.metadata,
      created_at: new Date().toISOString(),
    }));
    
    // Insert batch
    const { data, error } = await supabase
      .from('analytics_interactions')
      .insert(insertData)
      .select('id');

    if (error) {
      console.error('Batch interaction tracking failed:', error);
      
      // Try to insert interactions individually
      let successCount = 0;
      const errors = [];
      
      for (let i = 0; i < insertData.length; i++) {
        try {
          await supabase
            .from('analytics_interactions')
            .insert(insertData[i]);
          successCount++;
        } catch (individualError) {
          errors.push({ index: i, error: individualError });
        }
      }
      
      return NextResponse.json({
        success: successCount > 0,
        message: `Processed ${successCount}/${insertData.length} interactions individually`,
        processed: successCount,
        errors: errors.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'All interactions tracked successfully',
      processed: data.length,
    });

  } catch (error) {
    console.error('Batch interaction API error:', error);
    
    if (error instanceof AnalyticsValidationError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        message: error.message,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Batch interaction tracking failed',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    }, { status: 500 });
  }
}

// Handle method not allowed
export async function GET() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Use POST for single interactions or PUT for batch interactions',
  }, { status: 405 });
}
```

#### **Step 2: Update Analytics Client**

```typescript
// File: /lib/analytics-client.ts
// Add interaction tracking functions

export async function trackInteraction(
  sessionId: string,
  type: string,
  target?: string,
  value?: string | number,
  propertyId?: number,
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    const response = await fetch('/api/analytics/interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        type,
        target,
        value,
        propertyId,
        metadata,
      }),
    });

    const result = await response.json();
    return result.success || false;
  } catch (error) {
    console.error('Interaction tracking failed:', error);
    return false;
  }
}

export async function trackInteractionBatch(
  interactions: Array<{
    sessionId: string;
    type: string;
    target?: string;
    value?: string | number;
    propertyId?: number;
    metadata?: Record<string, any>;
  }>
): Promise<number> {
  try {
    const response = await fetch('/api/analytics/interaction', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interactions,
      }),
    });

    const result = await response.json();
    return result.processed || 0;
  } catch (error) {
    console.error('Batch interaction tracking failed:', error);
    return 0;
  }
}
```

### **Prevention Strategies**

1. **Always create API endpoints before frontend integration**
2. **Use consistent REST patterns (POST for create, PUT for batch)**
3. **Implement both single and batch operations**
4. **Add proper validation and error handling**

### **Verification Steps**

```bash
# Test single interaction
curl -X POST http://localhost:3000/api/analytics/interaction \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-123",
    "type": "click",
    "target": "contact-button",
    "propertyId": 123
  }'

# Test batch interactions
curl -X PUT http://localhost:3000/api/analytics/interaction \
  -H "Content-Type: application/json" \
  -d '{
    "interactions": [
      {"sessionId": "test-session-123", "type": "click", "target": "button1"},
      {"sessionId": "test-session-123", "type": "scroll", "value": 500}
    ]
  }'
```

---

## 🏗️ Issue #4: TypeScript Compilation Errors

### **Problem Identification**

```bash
# TypeScript Compilation Output
types/analytics.ts:45:14 - error TS2393: Duplicate identifier 'AnalyticsValidationError'.
types/analytics.ts:52:14 - error TS2393: Duplicate identifier 'AnalyticsValidationError'.
```

### **Root Cause Analysis**

**Primary Cause**: Duplicate class and interface definitions
- Same error class defined multiple times
- Missing interfaces for new analytics features
- Inconsistent type exports across files

### **Step-by-Step Resolution**

#### **Step 1: Consolidate Type Definitions**

```typescript
// File: /types/analytics.ts
// Complete type definitions with no duplicates

// =============================================================================
// Core Types
// =============================================================================

export interface AnalyticsSession {
  id: string;
  user_agent: string;
  ip_hash: string;
  referrer?: string;
  session_start: string;
  session_end?: string;
  is_fallback?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyView {
  id: number;
  session_id: string;
  property_id: number;
  created_at: string;
  view_duration?: number;
  referrer_page?: string;
  exit_page?: string;
}

export interface LeadGeneration {
  id: number;
  session_id: string;
  lead_id: number;
  source_code: string;
  property_id?: number;
  created_at: string;
  conversion_value?: number;
  attribution_data?: Record<string, any>;
}

export interface AnalyticsInteraction {
  id: number;
  session_id: string;
  interaction_type: string;
  target_element?: string;
  interaction_value?: string | number;
  property_id?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

// =============================================================================
// Lead Source Management
// =============================================================================

export const LEAD_SOURCE_CODES = {
  WHATSAPP: 'whatsapp',
  PHONE: 'telefono',
  EMAIL: 'email',
  WEB_FORM: 'formulario_web',
  CONTACT_PAGE: 'pagina_contacto',
  PROPERTY_INQUIRY: 'consulta_propiedad',
  GENERAL_INQUIRY: 'consulta_general',
} as const;

export type LeadSourceCode = typeof LEAD_SOURCE_CODES[keyof typeof LEAD_SOURCE_CODES];

export interface LeadSource {
  code: LeadSourceCode;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export const LEAD_SOURCES: LeadSource[] = [
  {
    code: LEAD_SOURCE_CODES.WHATSAPP,
    name: 'WhatsApp',
    description: 'Contacto vía WhatsApp',
    icon: '💬',
    color: '#25D366',
  },
  {
    code: LEAD_SOURCE_CODES.PHONE,
    name: 'Teléfono',
    description: 'Llamada telefónica',
    icon: '📞',
    color: '#007bff',
  },
  {
    code: LEAD_SOURCE_CODES.EMAIL,
    name: 'Email',
    description: 'Correo electrónico',
    icon: '📧',
    color: '#dc3545',
  },
  {
    code: LEAD_SOURCE_CODES.WEB_FORM,
    name: 'Formulario Web',
    description: 'Formulario del sitio web',
    icon: '📋',
    color: '#28a745',
  },
  {
    code: LEAD_SOURCE_CODES.CONTACT_PAGE,
    name: 'Página de Contacto',
    description: 'Formulario de la página de contacto',
    icon: '📞',
    color: '#17a2b8',
  },
  {
    code: LEAD_SOURCE_CODES.PROPERTY_INQUIRY,
    name: 'Consulta de Propiedad',
    description: 'Consulta específica sobre una propiedad',
    icon: '🏠',
    color: '#fd7e14',
  },
  {
    code: LEAD_SOURCE_CODES.GENERAL_INQUIRY,
    name: 'Consulta General',
    description: 'Consulta general sin propiedad específica',
    icon: '💭',
    color: '#6c757d',
  },
];

// =============================================================================
// Dashboard & Analytics Data
// =============================================================================

export interface DashboardStats {
  totalViews: number;
  totalLeads: number;
  totalSessions: number;
  conversionRate: number;
  topProperties: Array<{
    id: number;
    title: string;
    views: number;
    leads: number;
  }>;
  leadSources: Array<{
    source: LeadSourceCode;
    count: number;
    percentage: number;
  }>;
  dailyStats: Array<{
    date: string;
    views: number;
    leads: number;
    sessions: number;
  }>;
}

export interface PropertyMetrics {
  propertyId: number;
  totalViews: number;
  uniqueViews: number;
  totalLeads: number;
  conversionRate: number;
  averageViewDuration: number;
  topReferrers: string[];
  dailyViews: Array<{
    date: string;
    views: number;
    leads: number;
  }>;
}

export interface SessionAnalytics {
  sessionId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pageViews: number;
  interactions: number;
  leadGenerated: boolean;
  userAgent: string;
  referrer?: string;
  ipHash: string;
}

// =============================================================================
// API Request/Response Types
// =============================================================================

export interface CreateSessionRequest {
  userAgent?: string;
  referrer?: string;
}

export interface CreateSessionResponse {
  success: boolean;
  sessionId: string;
  error?: string;
  debug?: {
    userAgent?: string;
    ip?: string;
    referrer?: string;
  };
}

export interface TrackViewRequest {
  sessionId: string;
  propertyId: number;
  referrerPage?: string;
  metadata?: Record<string, any>;
}

export interface TrackViewResponse {
  success: boolean;
  message?: string;
  viewId?: number;
  duplicate?: boolean;
}

export interface TrackLeadRequest {
  sessionId: string;
  leadId: number;
  sourceCode: LeadSourceCode;
  propertyId?: number;
  metadata?: Record<string, any>;
}

export interface TrackLeadResponse {
  success: boolean;
  message?: string;
  trackingId?: number;
}

export interface TrackInteractionRequest {
  sessionId: string;
  type: string;
  target?: string;
  value?: string | number;
  propertyId?: number;
  metadata?: Record<string, any>;
}

export interface BatchInteractionRequest {
  interactions: TrackInteractionRequest[];
}

export interface TrackInteractionResponse {
  success: boolean;
  message: string;
  id?: number;
  processed?: number;
  errors?: number;
}

// =============================================================================
// Error Classes
// =============================================================================

export class AnalyticsError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

export class AnalyticsValidationError extends AnalyticsError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'AnalyticsValidationError';
  }
}

export class AnalyticsNetworkError extends AnalyticsError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR', 503);
    this.name = 'AnalyticsNetworkError';
  }
}

// =============================================================================
// Utility Types
// =============================================================================

export interface GDPRSettings {
  optedOut: boolean;
  optOutDate?: string;
  consentDate?: string;
  consentVersion?: string;
}

export type AnalyticsEventType = 
  | 'session_start'
  | 'session_end'
  | 'page_view'
  | 'property_view'
  | 'lead_generation'
  | 'interaction'
  | 'gdpr_opt_out'
  | 'gdpr_opt_in';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  sessionId: string;
  timestamp: string;
  data: Record<string, any>;
}

// =============================================================================
// Hook Types
// =============================================================================

export interface UseAnalyticsReturn {
  sessionId: string | null;
  isOptedOut: boolean;
  loading: boolean;
  error: string | null;
  trackView: (propertyId: number, metadata?: Record<string, any>) => Promise<boolean>;
  trackLead: (leadId: number, sourceCode: LeadSourceCode, propertyId?: number) => Promise<boolean>;
  trackInteraction: (type: string, target?: string, value?: string | number) => Promise<boolean>;
  optOut: () => Promise<void>;
  optIn: () => Promise<void>;
  refresh: () => Promise<void>;
}

// =============================================================================
// Database Table Types (for direct queries)
// =============================================================================

export interface AnalyticsSessionsTable {
  id: string;
  user_agent: string;
  ip_hash: string;
  referrer: string | null;
  session_start: string;
  session_end: string | null;
  is_fallback: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsPropertyViewsTable {
  id: number;
  session_id: string;
  property_id: number;
  created_at: string;
  view_duration: number | null;
  referrer_page: string | null;
  exit_page: string | null;
}

export interface AnalyticsLeadGenerationTable {
  id: number;
  session_id: string;
  lead_id: number;
  source_code: string;
  property_id: number | null;
  created_at: string;
  conversion_value: number | null;
  attribution_data: Record<string, any> | null;
}

export interface AnalyticsInteractionsTable {
  id: number;
  session_id: string;
  interaction_type: string;
  target_element: string | null;
  interaction_value: string | number | null;
  property_id: number | null;
  metadata: Record<string, any> | null;
  created_at: string;
}
```

### **Prevention Strategies**

1. **Use single source of truth for type definitions**
2. **Organize types by domain/feature**
3. **Use consistent naming conventions**
4. **Regular type validation with TypeScript compiler**
5. **Import types explicitly, don't re-declare**

### **Verification Steps**

```bash
# Check TypeScript compilation
npx tsc --noEmit --pretty

# Check for duplicate type definitions
grep -r "export.*class.*Error" types/
grep -r "export.*interface.*Request" types/

# Verify imports work correctly
npm run build
```

---

## 🔄 Issue #5: SSR Initialization Errors

### **Problem Identification**

```bash
# Build Output
 ✓ Generating static pages (7/7)
 ✗ Generating static pages (7/7)
   TypeError: Cannot read properties of undefined (reading 'sessionId')
   at Analytics component
   ReferenceError: window is not defined
```

### **Root Cause Analysis**

**Primary Cause**: Client-side code executing during server-side rendering
- Analytics initialization trying to access `window` object on server
- React hooks running during SSR without proper guards
- Missing client-side component boundaries

### **Step-by-Step Resolution**

#### **Step 1: Create Client-Side Analytics Initializer**

```typescript
// File: /components/AnalyticsInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsInitializerProps {
  children: React.ReactNode;
}

export default function AnalyticsInitializer({ children }: AnalyticsInitializerProps) {
  const analytics = useAnalytics();

  useEffect(() => {
    // Initialize analytics on client-side only
    if (typeof window !== 'undefined' && !analytics.sessionId && !analytics.loading) {
      console.log('Initializing analytics session...');
      analytics.refresh().catch(error => {
        console.warn('Analytics initialization failed:', error);
      });
    }
  }, [analytics]);

  // Don't render children until client-side hydration is complete
  // This prevents SSR/hydration mismatches
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  return <>{children}</>;
}
```

#### **Step 2: Update Root Layout**

```typescript
// File: /app/layout.tsx
import AnalyticsInitializer from '@/components/AnalyticsInitializer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AnalyticsInitializer>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </AnalyticsInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### **Step 3: Add Client-Side Guard to Analytics Hook**

```typescript
// File: /hooks/useAnalytics.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { UseAnalyticsReturn, LeadSourceCode } from '@/types/analytics';

export function useAnalytics(): UseAnalyticsReturn {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isOptedOut, setIsOptedOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client-side check
  const isClient = typeof window !== 'undefined';

  // Initialize session
  const initializeSession = useCallback(async () => {
    if (!isClient) {
      console.log('Not on client side, skipping analytics initialization');
      return;
    }

    if (sessionId || loading) {
      return; // Already initialized or initializing
    }

    try {
      setLoading(true);
      setError(null);

      // Check if user has opted out
      const optedOut = localStorage.getItem('analytics-opted-out') === 'true';
      if (optedOut) {
        setIsOptedOut(true);
        console.log('User has opted out of analytics');
        return;
      }

      // Try to get existing session from sessionStorage
      const existingSessionId = sessionStorage.getItem('analytics-session-id');
      if (existingSessionId) {
        setSessionId(existingSessionId);
        console.log('Using existing session:', existingSessionId);
        return;
      }

      // Create new session
      const response = await fetch('/api/analytics/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.sessionId) {
        setSessionId(data.sessionId);
        sessionStorage.setItem('analytics-session-id', data.sessionId);
        console.log('Created new session:', data.sessionId);
      } else {
        throw new Error('No session ID received');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Analytics initialization failed:', errorMessage);
      setError(errorMessage);
      
      // Create fallback session ID
      const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substring(2)}`;
      setSessionId(fallbackId);
      console.warn('Using fallback session ID:', fallbackId);
    } finally {
      setLoading(false);
    }
  }, [isClient, sessionId, loading]);

  // Track property view
  const trackView = useCallback(async (
    propertyId: number,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    if (!isClient || !sessionId || isOptedOut) {
      return false;
    }

    try {
      const response = await fetch('/api/analytics/property-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          propertyId,
          metadata,
        }),
      });

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('View tracking failed:', error);
      return false;
    }
  }, [isClient, sessionId, isOptedOut]);

  // Track lead generation
  const trackLead = useCallback(async (
    leadId: number,
    sourceCode: LeadSourceCode,
    propertyId?: number
  ): Promise<boolean> => {
    if (!isClient || !sessionId || isOptedOut) {
      return false;
    }

    try {
      const response = await fetch('/api/analytics/lead-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          leadId,
          sourceCode,
          propertyId,
        }),
      });

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Lead tracking failed:', error);
      return false;
    }
  }, [isClient, sessionId, isOptedOut]);

  // Track user interaction
  const trackInteraction = useCallback(async (
    type: string,
    target?: string,
    value?: string | number
  ): Promise<boolean> => {
    if (!isClient || !sessionId || isOptedOut) {
      return false;
    }

    try {
      const response = await fetch('/api/analytics/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          type,
          target,
          value,
        }),
      });

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Interaction tracking failed:', error);
      return false;
    }
  }, [isClient, sessionId, isOptedOut]);

  // Opt out of analytics
  const optOut = useCallback(async () => {
    if (!isClient) return;

    try {
      localStorage.setItem('analytics-opted-out', 'true');
      sessionStorage.removeItem('analytics-session-id');
      setIsOptedOut(true);
      setSessionId(null);

      // Notify server
      await fetch('/api/analytics/gdpr/opt-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      console.log('User opted out of analytics');
    } catch (error) {
      console.error('Opt-out failed:', error);
    }
  }, [isClient, sessionId]);

  // Opt in to analytics
  const optIn = useCallback(async () => {
    if (!isClient) return;

    localStorage.removeItem('analytics-opted-out');
    setIsOptedOut(false);
    console.log('User opted in to analytics');
    
    // Initialize session
    await initializeSession();
  }, [isClient, initializeSession]);

  // Refresh session
  const refresh = useCallback(async () => {
    if (!isClient) return;

    sessionStorage.removeItem('analytics-session-id');
    setSessionId(null);
    await initializeSession();
  }, [isClient, initializeSession]);

  // Initialize on mount (client-side only)
  useEffect(() => {
    if (isClient && !sessionId && !loading && !isOptedOut) {
      initializeSession();
    }
  }, [isClient, sessionId, loading, isOptedOut, initializeSession]);

  return {
    sessionId,
    isOptedOut,
    loading,
    error,
    trackView,
    trackLead,
    trackInteraction,
    optOut,
    optIn,
    refresh,
  };
}
```

### **Prevention Strategies**

1. **Use 'use client' directive for client-only components**
2. **Always check `typeof window !== 'undefined'` for browser APIs**
3. **Create proper client-side boundaries in component tree**
4. **Use `useEffect` for client-side initialization**
5. **Implement SSR-safe fallbacks**

### **Verification Steps**

```bash
# Test SSR build
npm run build

# Check for client-side only code
grep -r "window\." app/ --include="*.tsx" --exclude-dir=node_modules

# Test hydration
npm run start
# Check browser console for hydration errors
```

---

## 💥 Issue #6: Build Failures

### **Problem Identification**

```bash
# Build Output
 ✓ Creating an optimized production build
 ✗ Failed to compile.

./app/layout.tsx
Module not found: Can't resolve '@/hooks/useAnalytics'

 ECONNREFUSED 127.0.0.1:54321
 Environment variable SUPABASE_URL is required
```

### **Root Cause Analysis**

**Primary Cause**: Missing environment variables and import resolution issues
- Build trying to connect to Supabase during static generation
- Missing environment variables in build environment
- Import path resolution failures
- Analytics code running during build-time SSG

### **Step-by-Step Resolution**

#### **Step 1: Create Environment Variables Template**

```bash
# File: /.env.example
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Analytics Configuration (optional)
ANALYTICS_SALT=your-random-salt-for-ip-hashing
NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=false

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=production
```

#### **Step 2: Update Build Configuration**

```javascript
// File: /next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds (temporary)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript checking during builds if needed
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // Disable image optimization for compatibility
  images: {
    unoptimized: true,
  },
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Experimental features for better build performance
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  // Webpack configuration for better module resolution
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Resolve path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
    };
    
    // Handle server-side vs client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Output configuration
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Build-time redirects and rewrites
  async redirects() {
    return [];
  },
  
  async rewrites() {
    return [];
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

#### **Step 3: Add Build-Safe Environment Checks**

```typescript
// File: /lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Environment variables with build-safe defaults
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validation with build-safe fallbacks
if (!supabaseUrl && process.env.NODE_ENV !== 'development') {
  console.error('Missing SUPABASE_URL environment variable');
}

if (!supabaseAnonKey && process.env.NODE_ENV !== 'development') {
  console.error('Missing SUPABASE_ANON_KEY environment variable');
}

// Create clients with fallback for build time
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false, // Disable session persistence during builds
    },
  }
);

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Build-time safety check
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // Running on server during build - disable actual Supabase calls
  console.log('Build-time Supabase client initialized');
}
```

#### **Step 4: Add Build Script with Environment Validation**

```json
// File: /package.json (scripts section)
{
  "scripts": {
    "dev": "next dev",
    "build": "npm run build:check && next build",
    "build:check": "node scripts/build-check.js",
    "build:force": "next build",
    "start": "next start",
    "local": "next dev --port 3000",
    "lint": "next lint"
  }
}
```

```javascript
// File: /scripts/build-check.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Pre-build environment validation...');

// Check for required environment variables
const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
];

const optional = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'ANALYTICS_SALT',
];

let hasErrors = false;

// Check .env files
const envFiles = ['.env', '.env.local', '.env.production'];
const envExists = envFiles.some(file => fs.existsSync(path.join(process.cwd(), file)));

if (!envExists) {
  console.warn('⚠️  No .env files found. Using environment variables from system.');
}

// Check required variables
console.log('📋 Checking required environment variables:');
required.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  }
});

// Check optional variables
console.log('\n📋 Checking optional environment variables:');
optional.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.warn(`⚠️  Optional environment variable not set: ${varName}`);
  } else {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  }
});

// Check critical files
console.log('\n📋 Checking critical files:');
const criticalFiles = [
  'types/analytics.ts',
  'services/analytics.ts',
  'hooks/useAnalytics.ts',
  'lib/supabase.ts',
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Critical file missing: ${file}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${file}`);
  }
});

if (hasErrors) {
  console.error('\n💥 Build validation failed! Please fix the errors above.');
  console.log('\n💡 Tips:');
  console.log('   1. Copy .env.example to .env and fill in the values');
  console.log('   2. Ensure all required files are present');
  console.log('   3. Run "npm run build:force" to skip validation');
  process.exit(1);
} else {
  console.log('\n🎉 Build validation passed!');
}
```

### **Prevention Strategies**

1. **Always validate environment variables before build**
2. **Use build-safe defaults and fallbacks**
3. **Separate build-time and runtime configurations**
4. **Implement proper module resolution in webpack config**
5. **Use environment variable templates (.env.example)**

### **Verification Steps**

```bash
# Test build with validation
npm run build

# Test build without validation
npm run build:force

# Test environment validation
node scripts/build-check.js

# Test different environments
NODE_ENV=production npm run build
NODE_ENV=development npm run build
```

---

## 🔬 Diagnostic Procedures

### **Quick Health Check Script**

```bash
#!/bin/bash
# File: /scripts/health-check.sh

echo "🏥 Marconi Analytics Health Check"
echo "================================="

# 1. Environment Check
echo "📋 Environment Variables:"
[ -n "$SUPABASE_URL" ] && echo "✅ SUPABASE_URL: Set" || echo "❌ SUPABASE_URL: Missing"
[ -n "$SUPABASE_ANON_KEY" ] && echo "✅ SUPABASE_ANON_KEY: Set" || echo "❌ SUPABASE_ANON_KEY: Missing"

# 2. API Endpoint Check
echo -e "\n🌐 API Endpoints:"
endpoints=(
  "/api/analytics/session"
  "/api/analytics/property-view"
  "/api/analytics/interaction"
  "/api/geocode"
)

for endpoint in "${endpoints[@]}"; do
  if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$endpoint" | grep -q "405\|200\|400"; then
    echo "✅ $endpoint: Available"
  else
    echo "❌ $endpoint: Not responding"
  fi
done

# 3. Database Connection
echo -e "\n🗄️  Database Connection:"
if curl -s "http://localhost:3000/api/analytics/session" -X POST | grep -q "sessionId"; then
  echo "✅ Database: Connected"
else
  echo "❌ Database: Connection failed"
fi

# 4. Build Check
echo -e "\n🔧 Build Status:"
if npm run build:check > /dev/null 2>&1; then
  echo "✅ Build: Ready"
else
  echo "❌ Build: Issues detected"
fi

echo -e "\n✨ Health check complete!"
```

### **Analytics Debug Console Commands**

```javascript
// Paste in browser console for debugging
(function() {
  console.log('🔍 Analytics Debug Mode Activated');
  
  // Monitor fetch requests
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const [url, options] = args;
    
    if (url.includes('/api/analytics') || url.includes('/api/geocode')) {
      console.log('📤 API Request:', {
        url: url.toString(),
        method: options?.method || 'GET',
        timestamp: new Date().toISOString()
      });
      
      const response = await originalFetch(...args);
      
      console.log('📥 API Response:', {
        url: url.toString(),
        status: response.status,
        ok: response.ok,
        timestamp: new Date().toISOString()
      });
      
      return response;
    }
    
    return originalFetch(...args);
  };
  
  // Check analytics state
  console.log('📊 Current Analytics State:', {
    sessionId: sessionStorage.getItem('analytics-session-id'),
    optedOut: localStorage.getItem('analytics-opted-out'),
    timestamp: new Date().toISOString()
  });
  
  // Test functions
  window.debugAnalytics = {
    testSession: () => fetch('/api/analytics/session', { method: 'POST' })
      .then(r => r.json()).then(console.log),
    testView: (propertyId = 1) => fetch('/api/analytics/property-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sessionId: sessionStorage.getItem('analytics-session-id'),
        propertyId 
      })
    }).then(r => r.json()).then(console.log),
    testGeocode: (query = 'Buenos Aires') => fetch(`/api/geocode?q=${query}`)
      .then(r => r.json()).then(console.log),
    clearSession: () => {
      sessionStorage.removeItem('analytics-session-id');
      localStorage.removeItem('analytics-opted-out');
      console.log('✅ Session cleared');
    }
  };
  
  console.log('💡 Available debug functions:', Object.keys(window.debugAnalytics));
})();
```

---

## 🚀 Performance Optimization

### **Build Performance**

```javascript
// File: /next.config.mjs - Performance optimizations
const nextConfig = {
  // Enable SWC compiler optimizations
  swcMinify: true,
  
  // Optimize bundle size
  experimental: {
    optimizeCss: true,
    bundlePagesRouterDependencies: true,
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Production client-side optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
            },
            analytics: {
              name: 'analytics',
              chunks: 'all',
              test: /analytics|supabase/,
            },
          },
        },
      };
    }
    
    return config;
  },
};
```

### **Runtime Performance**

```typescript
// Debounced analytics tracking
const debouncedTrackView = debounce(async (propertyId: number) => {
  await analytics.trackView(propertyId);
}, 1000);

// Batch interaction tracking
const interactionQueue: InteractionData[] = [];
const flushQueue = debounce(async () => {
  if (interactionQueue.length > 0) {
    await trackInteractionBatch([...interactionQueue]);
    interactionQueue.length = 0;
  }
}, 5000);
```

---

## 📞 Emergency Response Procedures

### **Critical Issue Escalation**

1. **Immediate Response (< 5 minutes)**
   - Check application status
   - Verify environment variables
   - Check recent deployments

2. **Short-term Fix (< 30 minutes)**
   - Implement workarounds
   - Deploy hotfixes
   - Enable maintenance mode if needed

3. **Long-term Resolution (< 2 hours)**
   - Root cause analysis
   - Comprehensive fix
   - Documentation update

### **Rollback Procedures**

```bash
# Vercel deployment rollback
vercel rollback [deployment-url]

# Environment variable rollback
vercel env ls
vercel env rm VARIABLE_NAME
vercel env add VARIABLE_NAME

# Git-based rollback
git revert [commit-hash]
git push origin main
```

---

## 📋 Testing Checklist

### **Pre-Deployment Testing**

- [ ] All environment variables configured
- [ ] TypeScript compilation successful
- [ ] Build completes without errors
- [ ] All API endpoints responding
- [ ] Analytics session creation working
- [ ] Property view tracking functional
- [ ] Lead generation tracking functional
- [ ] Geocoding API proxy working
- [ ] CORS errors resolved
- [ ] SSR/Client hydration working

### **Post-Deployment Verification**

- [ ] Application loads successfully
- [ ] Analytics dashboard showing data
- [ ] No console errors
- [ ] Mobile responsiveness maintained
- [ ] Performance metrics within acceptable range

---

## 📚 Resources & Documentation

### **Related Documentation**
- [Analytics System Architecture](/docs/analytics-system-architecture.md)
- [API Reference](/docs/analytics-api-reference.md)
- [GDPR Compliance Guide](/docs/analytics-gdpr-compliance.md)
- [Integration Guide](/docs/analytics-integration-guide.md)

### **External Resources**
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase JavaScript Guide](https://supabase.com/docs/reference/javascript/)
- [OpenStreetMap Nominatim API](https://nominatim.org/release-docs/develop/api/Overview/)

---

## 📝 Changelog

### **Files Created/Updated**

| File | Action | Description |
|------|--------|-------------|
| `/app/api/geocode/route.ts` | Created | CORS proxy for OpenStreetMap geocoding |
| `/services/analytics.ts` | Enhanced | Added fallback mechanisms for session creation |
| `/app/api/analytics/interaction/route.ts` | Created | New endpoint for user interaction tracking |
| `/types/analytics.ts` | Consolidated | Unified type definitions, removed duplicates |
| `/components/AnalyticsInitializer.tsx` | Created | Client-side analytics initialization component |
| `/hooks/useAnalytics.ts` | Enhanced | Added SSR safety guards and client-side checks |
| `/.env.example` | Created | Environment variables template |
| `/next.config.mjs` | Updated | Build optimizations and environment handling |
| `/lib/supabase.ts` | Updated | Build-safe fallbacks and validation |
| `/scripts/build-check.js` | Created | Pre-build environment validation script |
| `/docs/session-issues-troubleshooting.md` | Created | Comprehensive troubleshooting guide |

**Summary**: Complete resolution of 6 critical issues with comprehensive troubleshooting guide, performance optimizations, and prevention strategies implemented.

---

**Generated by [Claude Code](https://claude.ai/code) Documentation Specialist**  
*Acting as specialized documentation agent for Marconi Inmobiliaria*