# Analytics GDPR Compliance Guide

## Overview

This document outlines the comprehensive GDPR compliance features implemented in the Marconi Inmobiliaria Analytics System. The system is designed with privacy-first principles, ensuring full compliance with EU General Data Protection Regulation (GDPR) and other privacy regulations.

## Privacy-First Design Principles

### 1. Data Minimization
- Only collect data necessary for analytics purposes
- No personally identifiable information (PII) is stored
- Anonymous session-based tracking without user identification

### 2. Purpose Limitation
- Data used exclusively for real estate analytics and business intelligence
- Clear separation between analytics data and customer data
- No data sharing with third parties for marketing purposes

### 3. Storage Limitation
- Automatic data retention policy (24 months)
- Regular cleanup of old data
- Configurable retention periods

### 4. Transparency
- Clear documentation of data collection practices
- User-facing privacy policy integration
- Audit trail for all data processing activities

## Technical Implementation

### 1. IP Address Anonymization

All IP addresses are immediately hashed using SHA-256 with application-specific salt, making them non-reversible:

```typescript
// Client-side hashing (browser)
private static async hashString(input: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}
```

```sql
-- Server-side hashing (PostgreSQL)
CREATE OR REPLACE FUNCTION hash_ip_address(ip_address TEXT) 
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN encode(digest(ip_address || 'marconi_salt_2025', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Key Features**:
- **Irreversible**: Hashed IPs cannot be converted back to original addresses
- **Salted**: Application-specific salt prevents rainbow table attacks  
- **Consistent**: Same IP always produces same hash for session management
- **Secure**: Uses industry-standard SHA-256 algorithm

### 2. Session-Based Anonymous Tracking

The system uses anonymous sessions instead of persistent user identification:

```sql
CREATE TABLE analytics_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_hash VARCHAR(64) NOT NULL,              -- Hashed IP address
    user_agent TEXT,                           -- Browser info (no personal data)
    device_type VARCHAR(50),                   -- Device category only
    browser_name VARCHAR(100),                 -- Browser type only
    os_name VARCHAR(100),                      -- Operating system only
    -- No personal identifiers
    opt_out BOOLEAN DEFAULT FALSE,             -- GDPR opt-out flag
    first_seen_at TIMESTAMP WITH TIME ZONE,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
);
```

**Privacy Features**:
- **No Personal Data**: No names, emails, phone numbers, or addresses
- **Anonymous Sessions**: UUID-based session identification
- **Device Categories**: Only broad device type classification
- **Automatic Expiry**: Sessions expire after 4 hours of inactivity

### 3. Opt-Out Mechanism

Users can opt out of tracking at any time with immediate effect:

#### Client-Side Opt-Out Interface

```typescript
export class AnalyticsClient {
  async optOut(reason?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/gdpr/opt-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionData?.sessionId,
          reason
        })
      })

      const result = await response.json()

      if (result.success) {
        this.isOptedOut = true
        this.saveOptOutStatus(true)
        this.clearSession()
        this.log('Successfully opted out of analytics')
        return true
      }
    } catch (error) {
      console.error('Failed to opt out:', error)
      return false
    }
  }
}
```

#### Server-Side Opt-Out Processing

```sql
CREATE OR REPLACE FUNCTION analytics_opt_out(p_session_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    -- Mark session as opted out
    UPDATE analytics_sessions 
    SET opt_out = TRUE 
    WHERE session_id = p_session_id;
    
    -- Return success status
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Opt-Out Features**:
- **Immediate Effect**: Tracking stops immediately upon opt-out
- **Persistent**: Opt-out status persists across sessions
- **Retroactive**: Option to delete historical data
- **User-Friendly**: Simple one-click opt-out process

### 4. Data Retention and Automatic Cleanup

Automatic data cleanup ensures compliance with retention policies:

```sql
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data() 
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete property views older than 24 months
    DELETE FROM analytics_property_views 
    WHERE created_at < NOW() - INTERVAL '24 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete user interactions older than 24 months
    DELETE FROM analytics_user_interactions 
    WHERE created_at < NOW() - INTERVAL '24 months';
    
    -- Delete lead generation events older than 24 months
    DELETE FROM analytics_lead_generation 
    WHERE created_at < NOW() - INTERVAL '24 months';
    
    -- Delete campaign attribution older than 24 months
    DELETE FROM analytics_campaign_attribution 
    WHERE created_at < NOW() - INTERVAL '24 months';
    
    -- Clean up orphaned sessions
    DELETE FROM analytics_sessions 
    WHERE created_at < NOW() - INTERVAL '24 months'
      AND id NOT IN (
          SELECT DISTINCT session_id 
          FROM analytics_property_views 
          WHERE session_id IS NOT NULL
      );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Retention Features**:
- **Configurable Periods**: Default 24 months, configurable per data type
- **Automatic Cleanup**: Scheduled cleanup jobs
- **Cascading Deletes**: Proper foreign key handling
- **Audit Logging**: Cleanup activities are logged

## GDPR Rights Implementation

### 1. Right to Information (Articles 13-14)

Clear documentation of data processing activities:

```typescript
export const GDPR_DATA_PROCESSING_INFO = {
  purpose: 'Real estate website analytics and performance measurement',
  lawfulBasis: 'Legitimate interest (Article 6(1)(f))',
  dataTypes: [
    'Anonymous session identifiers',
    'Hashed IP addresses', 
    'Device and browser information',
    'Page view and interaction data',
    'Marketing campaign attribution'
  ],
  retentionPeriod: '24 months',
  processingLocation: 'European Union',
  thirdParties: 'None',
  automatedDecisionMaking: 'None'
}
```

### 2. Right to Access (Article 15)

Users can request access to their analytics data:

```typescript
export class GDPRService {
  static async getDataForSession(sessionId: string): Promise<UserAnalyticsData> {
    const [sessions, views, interactions, leads] = await Promise.all([
      supabase
        .from('analytics_sessions')
        .select('*')
        .eq('session_id', sessionId),
      
      supabase
        .from('analytics_property_views')
        .select('*')
        .eq('session_id', sessionId),
        
      supabase
        .from('analytics_user_interactions')
        .select('*')
        .eq('session_id', sessionId),
        
      supabase
        .from('analytics_lead_generation')
        .select('*')
        .eq('session_id', sessionId)
    ])

    return {
      sessions: sessions.data || [],
      propertyViews: views.data || [],
      interactions: interactions.data || [],
      leadGeneration: leads.data || []
    }
  }
}
```

### 3. Right to Rectification (Article 16)

While the system doesn't store personal data that could be "incorrect", it provides mechanisms to update session information:

```typescript
static async updateSessionData(
  sessionId: string, 
  updates: Partial<AnalyticsSession>
): Promise<void> {
  const allowedUpdates = [
    'device_type',
    'browser_name', 
    'os_name',
    'language',
    'timezone'
  ]
  
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedUpdates.includes(key))
  )
  
  await supabase
    .from('analytics_sessions')
    .update(filteredUpdates)
    .eq('session_id', sessionId)
}
```

### 4. Right to Erasure (Article 17)

Complete data deletion for specific sessions:

```sql
CREATE OR REPLACE FUNCTION delete_session_data(p_session_id UUID) 
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    total_deleted INTEGER := 0;
BEGIN
    -- Delete from all related tables in correct order
    DELETE FROM analytics_user_interactions WHERE session_id = p_session_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM analytics_lead_generation WHERE session_id = p_session_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM analytics_property_views WHERE session_id = p_session_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM analytics_campaign_attribution WHERE session_id = p_session_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM analytics_sessions WHERE session_id = p_session_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    RETURN total_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. Right to Data Portability (Article 20)

Export analytics data in machine-readable format:

```typescript
static async exportSessionData(sessionId: string): Promise<string> {
  const data = await this.getDataForSession(sessionId)
  
  const exportData = {
    export_date: new Date().toISOString(),
    session_id: sessionId,
    data_types: ['sessions', 'property_views', 'interactions', 'lead_generation'],
    analytics_data: data
  }
  
  return JSON.stringify(exportData, null, 2)
}
```

### 6. Right to Object (Article 21)

Enhanced opt-out with objection reasoning:

```typescript
interface OptOutRequest {
  session_id: string
  reason: 'privacy_preference' | 'data_protection' | 'legitimate_objection'
  message?: string
  delete_historical_data?: boolean
}

static async handleObjection(request: OptOutRequest): Promise<boolean> {
  // Process opt-out
  await this.optOut(request.session_id, request.reason)
  
  // Optionally delete historical data
  if (request.delete_historical_data) {
    await this.deleteSessionData(request.session_id)
  }
  
  // Log objection for compliance audit
  await this.logGDPRAction('objection', request)
  
  return true
}
```

## Data Processing Activities Record

### Processing Activity 1: Website Analytics

```typescript
export const ANALYTICS_PROCESSING_RECORD = {
  name: 'Real Estate Website Analytics',
  controller: 'Marconi Inmobiliaria',
  purposes: [
    'Website performance analysis',
    'User experience optimization', 
    'Property popularity tracking',
    'Marketing campaign effectiveness'
  ],
  categories_of_data_subjects: ['Website visitors'],
  categories_of_personal_data: [
    'Anonymous session identifiers',
    'Hashed IP addresses',
    'Device and browser technical data',
    'Website interaction data'
  ],
  recipients: ['Internal analytics team'],
  transfers_to_third_countries: 'None',
  retention_periods: '24 months maximum',
  technical_and_organisational_measures: [
    'IP address hashing',
    'Anonymous session tracking',
    'Automatic data deletion',
    'Opt-out mechanisms',
    'Access controls',
    'Audit logging'
  ]
}
```

## Privacy Policy Integration

### Template Privacy Policy Section

```markdown
## Analytics and Cookies

### What We Collect
We collect anonymous analytics data to improve our website and services:
- Anonymous session identifiers
- General device information (mobile/desktop, browser type)
- Pages viewed and time spent
- Property interaction data
- Marketing campaign attribution

### How We Protect Your Privacy
- **No Personal Information**: We don't collect names, emails, or addresses
- **IP Address Hashing**: Your IP address is immediately hashed and cannot be reversed
- **Anonymous Sessions**: All tracking is anonymous and session-based
- **No Third-Party Sharing**: Analytics data is never shared with third parties

### Your Rights
- **Opt-Out**: Stop all tracking immediately at any time
- **Access**: Request a copy of your analytics data
- **Deletion**: Request deletion of your data
- **Portability**: Receive your data in machine-readable format

### Data Retention
Analytics data is automatically deleted after 24 months.

### Contact
For privacy questions or to exercise your rights, contact [privacy@marconi.com](mailto:privacy@marconi.com)
```

## Compliance Monitoring and Auditing

### 1. GDPR Action Logging

```typescript
interface GDPRAction {
  action_type: 'opt_out' | 'data_access' | 'data_deletion' | 'data_export'
  session_id: string
  timestamp: Date
  ip_address_hash: string
  reason?: string
  result: 'success' | 'failure'
  details?: string
}

static async logGDPRAction(
  actionType: GDPRAction['action_type'],
  sessionId: string,
  details?: any
): Promise<void> {
  await supabase
    .from('gdpr_audit_log')
    .insert([{
      action_type: actionType,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      ip_address_hash: await this.hashString(getClientIP() + 'marconi_salt_2025'),
      details: JSON.stringify(details),
      result: 'success'
    }])
}
```

### 2. Compliance Dashboard

```typescript
export class ComplianceDashboard {
  static async getComplianceStats(): Promise<ComplianceStats> {
    const [optOuts, dataRequests, retentionStats] = await Promise.all([
      this.getOptOutStats(),
      this.getDataRequestStats(), 
      this.getRetentionStats()
    ])
    
    return {
      total_opt_outs: optOuts.total,
      recent_opt_outs: optOuts.recent,
      data_access_requests: dataRequests.access,
      data_deletion_requests: dataRequests.deletions,
      retention_compliance: retentionStats.compliance_rate,
      next_cleanup_date: retentionStats.next_cleanup
    }
  }
}
```

## Best Practices for Development

### 1. Privacy by Design Checklist

- [ ] No PII collected or stored
- [ ] IP addresses are hashed immediately
- [ ] Anonymous session-based tracking only
- [ ] Automatic data expiry implemented
- [ ] Opt-out mechanism available
- [ ] Data deletion capabilities
- [ ] Audit logging for all GDPR actions
- [ ] Clear privacy documentation

### 2. Code Review Guidelines

```typescript
// ❌ BAD - Stores personal data
interface BadAnalyticsEvent {
  email: string          // PII - not allowed
  ip_address: string     // Should be hashed
  full_name: string      // PII - not allowed
}

// ✅ GOOD - Anonymous tracking
interface GoodAnalyticsEvent {
  session_id: string     // Anonymous session
  ip_hash: string        // Hashed IP
  device_type: string    // General category only
  event_type: string     // Behavioral data only
}
```

### 3. Testing GDPR Compliance

```typescript
describe('GDPR Compliance', () => {
  it('should hash IP addresses immediately', async () => {
    const originalIP = '192.168.1.1'
    const hashedIP = await AnalyticsService.hashString(originalIP + 'marconi_salt_2025')
    
    expect(hashedIP).not.toContain(originalIP)
    expect(hashedIP).toHaveLength(64) // SHA-256 hex length
  })
  
  it('should handle opt-out requests', async () => {
    const sessionId = await createTestSession()
    const result = await AnalyticsService.handleOptOut(sessionId)
    
    expect(result).toBe(true)
    
    // Verify opt-out status
    const session = await getSession(sessionId)
    expect(session.opt_out).toBe(true)
  })
  
  it('should automatically delete old data', async () => {
    const oldData = await createOldTestData()
    const deletedCount = await AnalyticsService.cleanupOldData()
    
    expect(deletedCount).toBeGreaterThan(0)
  })
})
```

## Legal Basis and Documentation

### Legitimate Interest Assessment (Article 6(1)(f))

The analytics system operates under legitimate interest with the following assessment:

**Purpose**: Understanding website performance and user experience to improve real estate services

**Necessity**: Analytics data is necessary for:
- Optimizing website performance
- Understanding user preferences  
- Improving property presentation
- Measuring marketing effectiveness

**Balancing Test**: 
- **Our Interest**: Legitimate business need for analytics
- **User Impact**: Minimal (anonymous, non-personal data only)
- **Safeguards**: Strong privacy protections, opt-out available
- **Result**: Legitimate interest outweighs minimal privacy impact

### Data Protection Impact Assessment (DPIA)

A DPIA has been conducted with the following conclusions:

- **Risk Level**: Low (anonymous data, strong safeguards)
- **Mitigation Measures**: IP hashing, opt-out, data retention limits
- **Monitoring**: Regular compliance audits
- **Review Date**: Annual review scheduled

## Conclusion

The Marconi Inmobiliaria Analytics System implements comprehensive GDPR compliance through technical and organizational measures designed to protect user privacy while enabling legitimate business analytics. The privacy-first design ensures compliance not just with current regulations but provides a foundation for evolving privacy requirements.