# Analytics Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the Marconi Inmobiliaria Analytics System into your Next.js application. The system is designed for easy integration with minimal code changes and maximum reliability.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Basic Integration](#basic-integration)
5. [Property Page Integration](#property-page-integration)
6. [Lead Form Integration](#lead-form-integration)
7. [Admin Dashboard Integration](#admin-dashboard-integration)
8. [Advanced Usage](#advanced-usage)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

- Next.js 15+ with App Router
- React 19+
- TypeScript
- Supabase account and project
- PostgreSQL database (via Supabase)

## Installation

The analytics system is already integrated into the Marconi Inmobiliaria project. If you're setting up a new project, you'll need:

### 1. Database Setup

Run the analytics schema migration:

```bash
# Connect to your Supabase database
psql -h db.your-project.supabase.co -d postgres -U postgres

# Run the migration
\i scripts/analytics-schema-migration.sql
```

### 2. Environment Variables

Add the required environment variables to your `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Optional Analytics Configuration
ANALYTICS_SALT=marconi_salt_2025
ANALYTICS_RETENTION_MONTHS=24
```

### 3. Dependencies

The system uses built-in Next.js and React features, with no additional dependencies required.

## Configuration

### 1. Supabase Client Setup

The analytics system uses the existing Supabase configuration in `lib/supabase.ts`. Ensure your client is properly configured:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
```

### 2. Analytics Client Configuration

Configure the analytics client in `lib/analytics-client.ts`:

```typescript
const analyticsConfig = {
  apiBaseUrl: '/api/analytics',
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enableLocalStorage: true,
  sessionStorageKey: 'marconi_analytics_session',
  optOutStorageKey: 'marconi_analytics_opt_out'
}

export const analytics = new AnalyticsClient(analyticsConfig)
```

## Basic Integration

### 1. App-Wide Analytics Initialization

Add the analytics initializer to your root layout:

```tsx
// app/layout.tsx
import { AnalyticsInitializer } from '@/components/AnalyticsInitializer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AnalyticsInitializer />
        {children}
      </body>
    </html>
  )
}
```

### 2. Analytics Initializer Component

Create the initializer component:

```tsx
// components/AnalyticsInitializer.tsx
'use client'

import { useEffect } from 'react'
import { getAnalyticsClient } from '@/lib/analytics-client'

export function AnalyticsInitializer() {
  useEffect(() => {
    // Initialize analytics client
    const analytics = getAnalyticsClient({
      enableConsoleLogging: process.env.NODE_ENV === 'development'
    })
    
    // Analytics is now ready for use
    console.log('Analytics system initialized')
  }, [])
  
  return null // This component doesn't render anything
}
```

### 3. Basic Page Tracking

For general page tracking, use the `useAnalytics` hook:

```tsx
// components/PageTracker.tsx
'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { useEffect } from 'react'

export function PageTracker({ pageName }: { pageName: string }) {
  const { trackInteraction, sessionId } = useAnalytics()
  
  useEffect(() => {
    if (sessionId) {
      trackInteraction('page_view', pageName)
    }
  }, [sessionId, pageName, trackInteraction])
  
  return null
}
```

## Property Page Integration

### 1. Automatic Property View Tracking

Use the `usePropertyAnalytics` hook for automatic tracking:

```tsx
// app/propiedades/[id]/page.tsx
'use client'

import { usePropertyAnalytics } from '@/hooks/useAnalytics'
import { PropertyViewTracker } from '@/components/PropertyViewTracker'

interface PropertyPageProps {
  params: { id: string }
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const propertyId = parseInt(params.id)
  const analytics = usePropertyAnalytics(propertyId)
  
  const handleContactClick = (type: 'whatsapp' | 'phone' | 'email' | 'form') => {
    analytics.trackContact(type)
    // Handle contact logic...
  }
  
  const handleImageView = (imageIndex: number) => {
    analytics.trackInteraction('image_view', `image_${imageIndex}`, propertyId, {
      image_index: imageIndex
    })
  }
  
  return (
    <div>
      {/* Property content */}
      <PropertyViewTracker propertyId={propertyId} />
      
      <div className="contact-buttons">
        <button onClick={() => handleContactClick('whatsapp')}>
          WhatsApp
        </button>
        <button onClick={() => handleContactClick('phone')}>
          Llamar
        </button>
        <button onClick={() => handleContactClick('email')}>
          Email
        </button>
      </div>
      
      <div className="property-images">
        {images.map((image, index) => (
          <img 
            key={index}
            src={image.url}
            alt={image.alt}
            onClick={() => handleImageView(index)}
          />
        ))}
      </div>
    </div>
  )
}
```

### 2. Property View Tracker Component

Create a dedicated tracking component:

```tsx
// components/PropertyViewTracker.tsx
'use client'

import { useEffect, useRef } from 'react'
import { usePropertyAnalytics } from '@/hooks/useAnalytics'

interface PropertyViewTrackerProps {
  propertyId: number
}

export function PropertyViewTracker({ propertyId }: PropertyViewTrackerProps) {
  const analytics = usePropertyAnalytics(propertyId)
  const startTime = useRef(Date.now())
  const maxScroll = useRef(0)
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      maxScroll.current = Math.max(maxScroll.current, scrollPercent)
    }
    
    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - startTime.current) / 1000)
      
      // Track final engagement metrics
      analytics.trackPropertyView(propertyId, {
        time_on_page: timeOnPage,
        scroll_depth: maxScroll.current
      })
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [propertyId, analytics])
  
  return null
}
```

### 3. Enhanced Property Tracking

For more detailed tracking, extend the property view data:

```tsx
// Enhanced property tracking example
const trackPropertyViewEnhanced = async () => {
  const additionalData = {
    images_viewed: getViewedImagesCount(),
    map_interacted: hasUserInteractedWithMap(),
    similar_properties_clicked: hasSimilarPropertiesClicked(),
    contact_form_opened: hasContactFormOpened(),
    whatsapp_clicked: hasWhatsAppClicked(),
    phone_clicked: hasPhoneClicked(),
    email_clicked: hasEmailClicked()
  }
  
  await analytics.trackPropertyView(propertyId, additionalData)
}
```

## Lead Form Integration

### 1. Contact Form with Analytics

Integrate analytics into your contact forms:

```tsx
// components/ContactForm.tsx
'use client'

import { useState } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { createLead } from '@/services/leads'

interface ContactFormProps {
  propertyId?: number
  defaultSource?: string
}

export function ContactForm({ propertyId, defaultSource = 'formulario_web' }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const analytics = useAnalytics()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Track form submission interaction
      await analytics.trackInteraction('form_submit', 'contact_form', propertyId, {
        form_type: defaultSource,
        property_id: propertyId
      })
      
      // Create lead in database
      const lead = await createLead({
        ...formData,
        property_id: propertyId,
        source: defaultSource
      })
      
      // Track lead generation
      await analytics.trackLeadGeneration(
        lead.id,
        defaultSource as LeadSourceCode,
        propertyId,
        {
          form_type: 'contact_form',
          utm_source: getUTMSource(), // Get from URL params
          utm_medium: getUTMMedium(),
          utm_campaign: getUTMCampaign()
        }
      )
      
      // Success handling...
      alert('¡Gracias! Nos pondremos en contacto contigo pronto.')
      
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Hubo un error. Por favor, inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleFieldFocus = (fieldName: string) => {
    analytics.trackInteraction('form_field_focus', fieldName, propertyId)
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Nombre completo"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        onFocus={() => handleFieldFocus('name')}
        required
      />
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        onFocus={() => handleFieldFocus('email')}
        required
      />
      
      <input
        type="tel"
        placeholder="Teléfono"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        onFocus={() => handleFieldFocus('phone')}
      />
      
      <textarea
        placeholder="Mensaje"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        onFocus={() => handleFieldFocus('message')}
        rows={4}
      />
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Consulta'}
      </button>
    </form>
  )
}
```

### 2. WhatsApp Integration with Analytics

Track WhatsApp lead generation:

```tsx
// components/WhatsAppButton.tsx
'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { createLead } from '@/services/leads'

interface WhatsAppButtonProps {
  propertyId?: number
  message?: string
}

export function WhatsAppButton({ propertyId, message }: WhatsAppButtonProps) {
  const analytics = useAnalytics()
  
  const handleWhatsAppClick = async () => {
    try {
      // Track the click interaction
      analytics.trackContactClick('whatsapp', propertyId)
      
      // Create a lead record for WhatsApp contact
      const lead = await createLead({
        property_id: propertyId,
        source: 'whatsapp',
        contact_method: 'whatsapp',
        // Note: No personal data stored here
        message: 'WhatsApp contact initiated'
      })
      
      // Track lead generation
      await analytics.trackLeadGeneration(
        lead.id,
        'whatsapp',
        propertyId,
        {
          form_type: 'whatsapp',
          contact_method: 'whatsapp'
        }
      )
      
      // Open WhatsApp
      const whatsappMessage = encodeURIComponent(
        message || `Hola! Me interesa la propiedad #${propertyId}`
      )
      const whatsappURL = `https://wa.me/5491234567890?text=${whatsappMessage}`
      window.open(whatsappURL, '_blank')
      
    } catch (error) {
      console.error('Error tracking WhatsApp interaction:', error)
      // Still open WhatsApp even if tracking fails
      const whatsappMessage = encodeURIComponent(
        message || `Hola! Me interesa la propiedad #${propertyId}`
      )
      const whatsappURL = `https://wa.me/5491234567890?text=${whatsappMessage}`
      window.open(whatsappURL, '_blank')
    }
  }
  
  return (
    <button
      onClick={handleWhatsAppClick}
      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
    >
      <span>💬</span>
      WhatsApp
    </button>
  )
}
```

### 3. Phone Call Tracking

Track phone call interactions:

```tsx
// components/PhoneButton.tsx
'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { createLead } from '@/services/leads'

interface PhoneButtonProps {
  propertyId?: number
  phoneNumber: string
}

export function PhoneButton({ propertyId, phoneNumber }: PhoneButtonProps) {
  const analytics = useAnalytics()
  
  const handlePhoneClick = async () => {
    try {
      // Track the click
      analytics.trackContactClick('phone', propertyId)
      
      // Create lead record
      const lead = await createLead({
        property_id: propertyId,
        source: 'telefono',
        contact_method: 'phone'
      })
      
      // Track lead generation
      await analytics.trackLeadGeneration(lead.id, 'telefono', propertyId)
      
      // Initiate phone call
      window.location.href = `tel:${phoneNumber}`
      
    } catch (error) {
      console.error('Error tracking phone interaction:', error)
      // Still initiate call if tracking fails
      window.location.href = `tel:${phoneNumber}`
    }
  }
  
  return (
    <button
      onClick={handlePhoneClick}
      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
    >
      <span>📞</span>
      Llamar
    </button>
  )
}
```

## Admin Dashboard Integration

### 1. Analytics Dashboard Component

Create a comprehensive analytics dashboard:

```tsx
// components/admin/AnalyticsDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { AnalyticsService } from '@/services/analytics'
import type { DashboardStats, PropertyMetrics } from '@/types/analytics'

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true)
        const dashboardStats = await AnalyticsService.getDashboardStats(dateRange)
        setStats(dashboardStats)
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboardStats()
  }, [dateRange])
  
  if (loading) {
    return <div>Cargando estadísticas...</div>
  }
  
  if (!stats) {
    return <div>Error cargando estadísticas</div>
  }
  
  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex gap-4 items-center">
        <input
          type="date"
          value={dateRange.start_date}
          onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
          className="border rounded px-3 py-2"
        />
        <span>hasta</span>
        <input
          type="date"
          value={dateRange.end_date}
          onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
          className="border rounded px-3 py-2"
        />
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Sesiones</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.total_sessions}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Vistas de Propiedades</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.total_property_views}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.total_leads}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Tasa de Conversión</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.conversion_rate}%</p>
        </div>
      </div>
      
      {/* Top Properties */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Propiedades Más Vistas</h3>
        <div className="space-y-2">
          {stats.top_properties.map((property) => (
            <div key={property.property_id} className="flex justify-between items-center">
              <span>{property.title}</span>
              <div className="text-sm text-gray-500">
                {property.metric_value} vistas | {property.leads} leads
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Lead Sources */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Fuentes de Leads</h3>
        <div className="space-y-2">
          {stats.top_lead_sources.map((source) => (
            <div key={source.source_id} className="flex justify-between items-center">
              <span>{source.source_name}</span>
              <div className="text-sm text-gray-500">
                {source.leads_count} leads ({source.conversion_rate}% conversión)
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Device Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Dispositivos</h3>
        <div className="space-y-2">
          {stats.traffic_by_device.map((device) => (
            <div key={device.device_type} className="flex justify-between items-center">
              <span className="capitalize">{device.device_type}</span>
              <div className="text-sm text-gray-500">
                {device.sessions} sesiones ({device.percentage}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 2. Property Analytics Component

Create property-specific analytics:

```tsx
// components/admin/PropertyAnalytics.tsx
'use client'

import { useState, useEffect } from 'react'
import { AnalyticsService } from '@/services/analytics'
import type { PropertyMetrics } from '@/types/analytics'

interface PropertyAnalyticsProps {
  propertyId: number
}

export function PropertyAnalytics({ propertyId }: PropertyAnalyticsProps) {
  const [metrics, setMetrics] = useState<PropertyMetrics | null>(null)
  const [daysBack, setDaysBack] = useState(30)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true)
        const propertyMetrics = await AnalyticsService.getPropertyMetrics(propertyId, daysBack)
        setMetrics(propertyMetrics)
      } catch (error) {
        console.error('Failed to load property metrics:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadMetrics()
  }, [propertyId, daysBack])
  
  if (loading) {
    return <div>Cargando métricas de propiedad...</div>
  }
  
  if (!metrics) {
    return <div>Error cargando métricas</div>
  }
  
  return (
    <div className="space-y-4">
      {/* Time Period Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setDaysBack(7)}
          className={`px-3 py-1 rounded ${daysBack === 7 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          7 días
        </button>
        <button
          onClick={() => setDaysBack(30)}
          className={`px-3 py-1 rounded ${daysBack === 30 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          30 días
        </button>
        <button
          onClick={() => setDaysBack(90)}
          className={`px-3 py-1 rounded ${daysBack === 90 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          90 días
        </button>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-700">Total Vistas</h4>
          <p className="text-2xl font-bold text-blue-900">{metrics.total_views}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-700">Vistas Únicas</h4>
          <p className="text-2xl font-bold text-green-900">{metrics.unique_views}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-purple-700">Leads Generados</h4>
          <p className="text-2xl font-bold text-purple-900">{metrics.leads_generated}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-700">Tiempo Promedio</h4>
          <p className="text-2xl font-bold text-yellow-900">
            {metrics.avg_time_on_page ? Math.round(metrics.avg_time_on_page) : 0}s
          </p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-red-700">Tasa de Conversión</h4>
          <p className="text-2xl font-bold text-red-900">
            {metrics.conversion_rate ? metrics.conversion_rate.toFixed(1) : 0}%
          </p>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-indigo-700">Tasa de Contacto</h4>
          <p className="text-2xl font-bold text-indigo-900">
            {metrics.contact_rate ? metrics.contact_rate.toFixed(1) : 0}%
          </p>
        </div>
      </div>
    </div>
  )
}
```

## Advanced Usage

### 1. Custom Event Tracking

Create custom events for specific business metrics:

```tsx
// utils/customAnalytics.ts
import { useAnalytics } from '@/hooks/useAnalytics'

export function useCustomAnalytics() {
  const analytics = useAnalytics()
  
  const trackSearchQuery = async (query: string, resultsCount: number) => {
    await analytics.trackInteraction('search_query', 'search_form', undefined, {
      query_length: query.length,
      results_count: resultsCount,
      has_filters: query.includes('filter:')
    })
  }
  
  const trackMapInteraction = async (propertyId: number, interactionType: string) => {
    await analytics.trackInteraction('map_interaction', interactionType, propertyId, {
      interaction_type: interactionType
    })
  }
  
  const trackCalculatorUsage = async (calculatorType: 'mortgage' | 'rent', propertyId?: number) => {
    await analytics.trackInteraction('calculator_usage', calculatorType, propertyId, {
      calculator_type: calculatorType
    })
  }
  
  return {
    trackSearchQuery,
    trackMapInteraction,
    trackCalculatorUsage
  }
}
```

### 2. A/B Testing Integration

Integrate with A/B testing frameworks:

```tsx
// utils/abTestingAnalytics.ts
import { useAnalytics } from '@/hooks/useAnalytics'

export function useABTestingAnalytics() {
  const analytics = useAnalytics()
  
  const trackABTestVariant = async (testName: string, variant: string, propertyId?: number) => {
    await analytics.trackInteraction('ab_test_exposure', testName, propertyId, {
      test_name: testName,
      variant: variant,
      timestamp: Date.now()
    })
  }
  
  const trackABTestConversion = async (testName: string, variant: string, conversionType: string) => {
    await analytics.trackInteraction('ab_test_conversion', testName, undefined, {
      test_name: testName,
      variant: variant,
      conversion_type: conversionType
    })
  }
  
  return {
    trackABTestVariant,
    trackABTestConversion
  }
}
```

### 3. Performance Monitoring

Monitor analytics system performance:

```tsx
// utils/analyticsMonitoring.ts
export class AnalyticsMonitoring {
  static trackingErrors: Array<{ timestamp: Date; error: string; context: any }> = []
  
  static logError(error: string, context: any) {
    this.trackingErrors.push({
      timestamp: new Date(),
      error,
      context
    })
    
    // Keep only last 100 errors
    if (this.trackingErrors.length > 100) {
      this.trackingErrors = this.trackingErrors.slice(-100)
    }
    
    console.warn('[Analytics Monitoring]', error, context)
  }
  
  static getErrorSummary() {
    const last24Hours = Date.now() - 24 * 60 * 60 * 1000
    const recentErrors = this.trackingErrors.filter(
      error => error.timestamp.getTime() > last24Hours
    )
    
    return {
      total_errors: this.trackingErrors.length,
      recent_errors: recentErrors.length,
      error_rate: recentErrors.length / 24, // Per hour
      most_common_errors: this.getMostCommonErrors(recentErrors)
    }
  }
  
  private static getMostCommonErrors(errors: typeof this.trackingErrors) {
    const errorCounts = errors.reduce((acc, error) => {
      acc[error.error] = (acc[error.error] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }))
  }
}
```

## Testing

### 1. Unit Tests

Test analytics integration with Jest:

```typescript
// __tests__/analytics.test.ts
import { AnalyticsService } from '@/services/analytics'
import { AnalyticsClient } from '@/lib/analytics-client'

describe('Analytics Integration', () => {
  beforeEach(() => {
    // Mock Supabase
    jest.mock('@/lib/supabase')
  })
  
  describe('Property View Tracking', () => {
    it('should track property views correctly', async () => {
      const mockSession = await AnalyticsService.createSession({
        ip_address: '192.168.1.1',
        user_agent: 'Test Browser',
        device_type: 'desktop'
      })
      
      const eventId = await AnalyticsService.recordPropertyView({
        session_id: mockSession,
        property_id: 123,
        page_url: 'https://test.com/properties/123'
      })
      
      expect(eventId).toBeTruthy()
    })
    
    it('should handle debouncing correctly', async () => {
      const sessionId = 'test-session'
      
      // First view
      const firstEvent = await AnalyticsService.recordPropertyView({
        session_id: sessionId,
        property_id: 123,
        page_url: 'https://test.com/properties/123'
      })
      
      // Second view within 2 hours (should be deduplicated)
      const secondEvent = await AnalyticsService.recordPropertyView({
        session_id: sessionId,
        property_id: 123,
        page_url: 'https://test.com/properties/123'
      })
      
      expect(firstEvent).toBe(secondEvent) // Same event ID
    })
  })
  
  describe('Lead Tracking', () => {
    it('should track lead generation with attribution', async () => {
      const leadId = 456
      const sourceCode = 'formulario_web'
      
      await AnalyticsService.recordLeadWithSource(leadId, sourceCode)
      
      // Verify lead was recorded
      // Add verification logic here
    })
  })
  
  describe('GDPR Compliance', () => {
    it('should handle opt-out correctly', async () => {
      const sessionId = 'test-session'
      
      const result = await AnalyticsService.handleOptOut(sessionId)
      expect(result).toBe(true)
      
      // Verify session is marked as opted out
    })
    
    it('should hash IP addresses', async () => {
      const originalIP = '192.168.1.1'
      const hashedIP = await AnalyticsService.hashString(originalIP + 'marconi_salt_2025')
      
      expect(hashedIP).not.toContain(originalIP)
      expect(hashedIP).toHaveLength(64)
    })
  })
})
```

### 2. Integration Tests

Test the complete analytics flow:

```typescript
// __tests__/analytics-integration.test.ts
import { render, fireEvent, waitFor } from '@testing-library/react'
import { PropertyPage } from '@/app/propiedades/[id]/page'
import { ContactForm } from '@/components/ContactForm'

describe('Analytics Integration Tests', () => {
  it('should track property views automatically', async () => {
    const { getByTestId } = render(<PropertyPage params={{ id: '123' }} />)
    
    await waitFor(() => {
      // Verify analytics tracking was called
      expect(mockTrackPropertyView).toHaveBeenCalledWith(123)
    })
  })
  
  it('should track contact form submissions', async () => {
    const { getByRole, getByPlaceholderText } = render(
      <ContactForm propertyId={123} />
    )
    
    // Fill form
    fireEvent.change(getByPlaceholderText('Nombre completo'), {
      target: { value: 'Juan Perez' }
    })
    fireEvent.change(getByPlaceholderText('Email'), {
      target: { value: 'juan@example.com' }
    })
    
    // Submit form
    fireEvent.click(getByRole('button', { name: /enviar/i }))
    
    await waitFor(() => {
      expect(mockTrackLeadGeneration).toHaveBeenCalledWith(
        expect.any(Number),
        'formulario_web',
        123
      )
    })
  })
})
```

## Troubleshooting

### Common Issues

#### 1. Session Creation Failures

**Problem**: Analytics sessions are not being created.

**Solutions**:
- Check Supabase connection and credentials
- Verify database migration was applied
- Check browser console for errors
- Ensure IP address is available on server-side

```typescript
// Debug session creation
const debugSession = async () => {
  try {
    const sessionId = await AnalyticsService.createSession({
      ip_address: '127.0.0.1', // Test IP
      device_type: 'desktop'
    })
    console.log('Session created:', sessionId)
  } catch (error) {
    console.error('Session creation failed:', error)
  }
}
```

#### 2. Property Views Not Tracking

**Problem**: Property views are not being recorded.

**Solutions**:
- Verify property ID is valid
- Check session exists before tracking views
- Ensure API endpoints are accessible
- Check for opt-out status

```typescript
// Debug property view tracking
const debugPropertyView = async (propertyId: number) => {
  const analytics = useAnalytics()
  
  if (!analytics.sessionId) {
    console.error('No session ID available')
    return
  }
  
  if (analytics.isOptedOut) {
    console.warn('User has opted out of tracking')
    return
  }
  
  try {
    await analytics.trackPropertyView(propertyId)
    console.log('Property view tracked successfully')
  } catch (error) {
    console.error('Property view tracking failed:', error)
  }
}
```

#### 3. Dashboard Data Not Loading

**Problem**: Admin dashboard shows no data.

**Solutions**:
- Check authentication and permissions
- Verify date ranges are correct
- Ensure analytics data exists in database
- Check API endpoint responses

```typescript
// Debug dashboard data
const debugDashboard = async () => {
  try {
    const stats = await AnalyticsService.getDashboardStats({
      start_date: '2025-01-01',
      end_date: '2025-01-31'
    })
    console.log('Dashboard stats:', stats)
  } catch (error) {
    console.error('Dashboard data loading failed:', error)
  }
}
```

#### 4. GDPR Opt-Out Not Working

**Problem**: Users cannot opt out of tracking.

**Solutions**:
- Check opt-out API endpoint
- Verify localStorage permissions
- Ensure opt-out status is persisted
- Check database updates

```typescript
// Debug opt-out functionality
const debugOptOut = async () => {
  const analytics = getAnalyticsClient()
  
  try {
    const result = await analytics.optOut('testing')
    console.log('Opt-out result:', result)
    
    // Check if opt-out was successful
    const status = await analytics.checkOptInStatus()
    console.log('Opt-in status:', status)
  } catch (error) {
    console.error('Opt-out failed:', error)
  }
}
```

### Performance Issues

#### 1. Slow Analytics Queries

**Solutions**:
- Use aggregation tables for dashboard queries
- Add appropriate database indexes
- Implement query caching
- Consider read replicas for analytics

#### 2. High Client-Side Overhead

**Solutions**:
- Enable interaction batching
- Reduce tracking frequency
- Use web workers for heavy computations
- Optimize bundle size

### Monitoring and Alerts

Set up monitoring for analytics system health:

```typescript
// utils/analyticsHealth.ts
export class AnalyticsHealthMonitor {
  static async checkSystemHealth() {
    const health = {
      database_connection: await this.checkDatabaseConnection(),
      api_endpoints: await this.checkAPIEndpoints(),
      session_creation: await this.checkSessionCreation(),
      tracking_functionality: await this.checkTrackingFunctionality()
    }
    
    return health
  }
  
  private static async checkDatabaseConnection() {
    try {
      const { data, error } = await supabase
        .from('analytics_sessions')
        .select('count(*)')
        .limit(1)
      
      return !error
    } catch {
      return false
    }
  }
  
  // Additional health checks...
}
```

This integration guide provides comprehensive instructions for implementing the analytics system across your application. The modular approach ensures you can implement features incrementally while maintaining system reliability and user privacy.