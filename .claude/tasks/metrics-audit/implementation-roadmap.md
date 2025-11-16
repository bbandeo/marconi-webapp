# Analytics Implementation Roadmap

**Project:** Connect Analytics Dashboard v4 to Real Data
**Date:** 2025-10-01
**Total Duration:** 7-11 weeks across 3 phases
**Total Metrics:** 82 metrics (24 ready, 20 partial, 38 missing)

---

## 🎯 IMPLEMENTATION STRATEGY

### Phased Approach
1. **Phase 1 (Quick Wins):** Connect existing data - immediate value
2. **Phase 2 (Calculations):** Unlock derived metrics - enhanced insights
3. **Phase 3 (New Features):** Build missing functionality - complete system

### Success Criteria
- ✅ All dashboards display real data (no mock)
- ✅ Real-time updates via React Query
- ✅ Performance < 2s load time per dashboard
- ✅ GDPR compliance maintained
- ✅ Full test coverage for new features

---

## 📦 PHASE 1: CONNECT EXISTING DATA (1-2 weeks)

**Goal:** Connect 24 metrics that are already being collected
**Complexity:** LOW
**Value:** HIGH (immediate ROI)
**Metrics Unlocked:** 30% of total

### T1.1 - API Routes Creation (3 days)

#### Task 1.1.1: Create Dashboard Overview API
**File:** `app/api/analytics/dashboard/route.ts`

**Endpoints:**
```typescript
GET /api/analytics/dashboard?period=30d
Response: {
  totalLeads: number
  activeProperties: number
  leadGenerationTrend: Array<{ date, count }>
  // More metrics...
}
```

**Implementation:**
- [ ] Create `app/api/analytics/dashboard/route.ts`
- [ ] Use existing `services/analytics.ts` functions
- [ ] Query `analytics_lead_generation` for total leads
- [ ] Query `properties` table for active properties
- [ ] Aggregate `analytics_daily_stats` for trends
- [ ] Add caching headers (Cache-Control: max-age=300)
- [ ] Add error handling with proper status codes
- [ ] Test with Postman/Thunder Client

**Database Queries:**
```sql
-- Total Leads
SELECT COUNT(*) FROM analytics_lead_generation
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Active Properties
SELECT COUNT(*) FROM properties WHERE status = 'active';

-- Lead Trends
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as count
FROM analytics_lead_generation
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date;
```

---

#### Task 1.1.2: Create Property Analytics API
**File:** `app/api/analytics/properties/route.ts`

**Endpoints:**
```typescript
GET /api/analytics/properties?limit=10&sortBy=views
Response: {
  totalProperties: number
  avgViewsPerProperty: number
  properties: Array<{
    id, title, image, totalViews, uniqueViews,
    avgDuration, lastViewed, conversionRate
  }>
}
```

**Implementation:**
- [ ] Create `app/api/analytics/properties/route.ts`
- [ ] Query `properties` table with JOIN to `analytics_property_views`
- [ ] Calculate aggregations per property
- [ ] Add sorting (by views, duration, latest)
- [ ] Add pagination support
- [ ] Use SQL aggregate functions for performance
- [ ] Test with 100+ properties for performance

**Database Queries:**
```sql
-- Property Performance
SELECT
  p.id,
  p.title,
  p.images[1] as image,
  COUNT(apv.id) as total_views,
  COUNT(DISTINCT apv.anonymous_id) as unique_views,
  AVG(apv.view_duration_seconds) as avg_duration,
  MAX(apv.viewed_at) as last_viewed
FROM properties p
LEFT JOIN analytics_property_views apv ON p.id = apv.property_id
WHERE p.status = 'active'
GROUP BY p.id, p.title, p.images
ORDER BY total_views DESC
LIMIT 10;
```

---

#### Task 1.1.3: Create Leads & Marketing API
**File:** `app/api/analytics/leads/route.ts`

**Endpoints:**
```typescript
GET /api/analytics/leads?period=30d
Response: {
  totalLeads: number
  leadsByChannel: Array<{ channel, count }>
  leadsByCampaign: Array<{ campaign, count }>
  websiteTraffic: {
    totalSessions, uniqueVisitors, pageViews, deviceBreakdown
  }
}
```

**Implementation:**
- [ ] Create `app/api/analytics/leads/route.ts`
- [ ] Query `analytics_lead_generation` with JOINs
- [ ] JOIN `analytics_lead_sources` for channel breakdown
- [ ] JOIN `analytics_campaign_attribution` for campaign data
- [ ] Query `analytics_sessions` for website traffic
- [ ] Add time period filtering
- [ ] Cache results with React Query

**Database Queries:**
```sql
-- Leads by Channel
SELECT
  als.source_name as channel,
  COUNT(alg.id) as count
FROM analytics_lead_generation alg
JOIN analytics_lead_sources als ON alg.source_id = als.id
WHERE alg.created_at >= NOW() - INTERVAL '30 days'
GROUP BY als.source_name
ORDER BY count DESC;

-- Website Traffic
SELECT
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(DISTINCT anonymous_id) as unique_visitors,
  device_type
FROM analytics_sessions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY device_type;
```

---

### T1.2 - Update React Hooks (2 days)

#### Task 1.2.1: Update `useAnalyticsDashboard` Hook
**File:** `hooks/useAnalyticsDashboard.ts`

**Before (Mock Data):**
```typescript
export function useAnalyticsDashboard() {
  return {
    data: MOCK_DATA,
    isLoading: false
  }
}
```

**After (Real Data):**
```typescript
import { useQuery } from '@tanstack/react-query'

export function useAnalyticsDashboard(period: string = '30d') {
  return useQuery({
    queryKey: ['analytics', 'dashboard', period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/dashboard?period=${period}`)
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000 // Auto-refetch every 30s
  })
}
```

**Implementation:**
- [ ] Replace mock data with API call
- [ ] Add React Query with proper config
- [ ] Add error handling
- [ ] Add loading states
- [ ] Add refetch interval for real-time updates
- [ ] Test in `ExecutiveOverview.tsx`

---

#### Task 1.2.2: Update `usePropertyMetrics` Hook
**File:** `hooks/usePropertyMetrics.ts`

**Implementation:**
- [ ] Connect to `/api/analytics/properties`
- [ ] Add sorting parameter
- [ ] Add pagination support
- [ ] Add filtering by status
- [ ] Test in `PropertyAnalytics.tsx` dashboard

```typescript
export function usePropertyMetrics(options: {
  limit?: number
  sortBy?: 'views' | 'duration' | 'latest'
  status?: 'active' | 'all'
}) {
  return useQuery({
    queryKey: ['analytics', 'properties', options],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options.limit) params.set('limit', options.limit.toString())
      if (options.sortBy) params.set('sortBy', options.sortBy)
      if (options.status) params.set('status', options.status)

      const res = await fetch(`/api/analytics/properties?${params}`)
      return res.json()
    },
    staleTime: 2 * 60 * 1000
  })
}
```

---

#### Task 1.2.3: Update `useLeadAnalytics` Hook
**File:** `hooks/useLeadAnalytics.ts`

**Implementation:**
- [ ] Connect to `/api/analytics/leads`
- [ ] Add period parameter (7d, 30d, 90d, 1y)
- [ ] Add comparison to previous period
- [ ] Test in `MarketingAnalytics.tsx` dashboard

---

### T1.3 - Update Dashboard Components (3 days)

#### Task 1.3.1: Update ExecutiveOverview Component
**File:** `components/admin/ExecutiveOverview.tsx`

**Changes:**
```typescript
// BEFORE
const mockData = generateMockData()
const { totalLeads, activeProperties } = mockData

// AFTER
const { data, isLoading, error } = useAnalyticsDashboard('30d')

if (isLoading) return <DashboardSkeleton />
if (error) return <ErrorMessage error={error} />

const { totalLeads, activeProperties, leadGenerationTrend } = data
```

**Implementation:**
- [ ] Remove `generateMockData()` function
- [ ] Replace with `useAnalyticsDashboard()` hook
- [ ] Update KPI cards to use real data
- [ ] Update charts with real trends
- [ ] Add loading skeletons
- [ ] Add error boundaries
- [ ] Test with real data

---

#### Task 1.3.2: Update PropertyAnalytics Component
**File:** `components/admin/PropertyAnalytics.tsx`

**Implementation:**
- [ ] Remove mock property data
- [ ] Connect to `usePropertyMetrics()` hook
- [ ] Update property table with real data
- [ ] Add sorting controls (by views, duration)
- [ ] Add "Load More" pagination
- [ ] Update geographic distribution chart
- [ ] Test with 50+ properties

---

#### Task 1.3.3: Update MarketingAnalytics Component
**File:** `components/admin/MarketingAnalytics.tsx`

**Implementation:**
- [ ] Remove mock channel data
- [ ] Connect to `useLeadAnalytics()` hook
- [ ] Update channel performance cards
- [ ] Update website traffic metrics
- [ ] Add device breakdown chart (already have data!)
- [ ] Add period selector (7d, 30d, 90d)
- [ ] Test with real sessions data

---

### T1.4 - Testing & Validation (2 days)

#### Task 1.4.1: API Testing
- [ ] Test all API routes with Postman
- [ ] Verify response times < 500ms
- [ ] Test with large datasets (1000+ properties)
- [ ] Test error scenarios (invalid params)
- [ ] Test caching behavior
- [ ] Verify CORS headers

#### Task 1.4.2: Frontend Testing
- [ ] Test all dashboards load correctly
- [ ] Verify loading states work
- [ ] Verify error states display properly
- [ ] Test real-time updates (30s refetch)
- [ ] Test on mobile devices
- [ ] Test with slow network (throttling)

#### Task 1.4.3: Data Validation
- [ ] Compare numbers with database queries
- [ ] Verify trend calculations
- [ ] Check date ranges work correctly
- [ ] Verify no GDPR violations (IP hashing working)

---

### 📊 Phase 1 Deliverables

**API Routes Created:**
- ✅ `/api/analytics/dashboard`
- ✅ `/api/analytics/properties`
- ✅ `/api/analytics/leads`

**Hooks Updated:**
- ✅ `useAnalyticsDashboard`
- ✅ `usePropertyMetrics`
- ✅ `useLeadAnalytics`

**Components Updated:**
- ✅ `ExecutiveOverview.tsx` - Connected to real data
- ✅ `PropertyAnalytics.tsx` - Connected to real data
- ✅ `MarketingAnalytics.tsx` - Connected to real data

**Metrics Connected:** 24 metrics (30% of total)
**Mock Data Removed:** 3 dashboards fully real

---

## ⚙️ PHASE 2: CALCULATIONS & AGGREGATIONS (2-3 weeks)

**Goal:** Unlock 20 derived metrics through calculations
**Complexity:** MEDIUM
**Value:** MEDIUM-HIGH
**Metrics Unlocked:** 25% more (55% total)

### T2.1 - PostgreSQL Functions (4 days)

#### Task 2.1.1: Create Conversion Rate Functions
**File:** `scripts/phase2-functions.sql`

```sql
-- Function: Calculate Lead Conversion Rate
CREATE OR REPLACE FUNCTION get_lead_conversion_rate(
  p_period_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_leads INTEGER,
  converted_leads INTEGER,
  conversion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH lead_stats AS (
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted
    FROM analytics_lead_generation
    WHERE created_at >= NOW() - (p_period_days || ' days')::INTERVAL
  )
  SELECT
    total::INTEGER,
    converted::INTEGER,
    (converted::DECIMAL / NULLIF(total, 0) * 100)::DECIMAL as rate
  FROM lead_stats;
END;
$$ LANGUAGE plpgsql;
```

**Implementation:**
- [ ] Create function for conversion rate calculation
- [ ] Add function for property conversion rate
- [ ] Add function for channel conversion rates
- [ ] Test functions with various date ranges
- [ ] Document function parameters

---

#### Task 2.1.2: Create Session Analytics Functions
**File:** `scripts/phase2-functions.sql`

```sql
-- Function: Calculate Bounce Rate
CREATE OR REPLACE FUNCTION calculate_bounce_rate(
  p_period_days INTEGER DEFAULT 30
)
RETURNS DECIMAL AS $$
DECLARE
  total_sessions INTEGER;
  bounced_sessions INTEGER;
BEGIN
  -- Total sessions
  SELECT COUNT(DISTINCT session_id) INTO total_sessions
  FROM analytics_sessions
  WHERE created_at >= NOW() - (p_period_days || ' days')::INTERVAL;

  -- Sessions with only 1 page view
  SELECT COUNT(DISTINCT s.session_id) INTO bounced_sessions
  FROM analytics_sessions s
  LEFT JOIN analytics_property_views pv ON s.session_id = pv.session_id
  WHERE s.created_at >= NOW() - (p_period_days || ' days')::INTERVAL
  GROUP BY s.session_id
  HAVING COUNT(pv.id) <= 1;

  RETURN (bounced_sessions::DECIMAL / NULLIF(total_sessions, 0) * 100);
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Avg Session Duration
CREATE OR REPLACE FUNCTION calculate_avg_session_duration(
  p_period_days INTEGER DEFAULT 30
)
RETURNS INTERVAL AS $$
BEGIN
  RETURN (
    SELECT AVG(
      EXTRACT(EPOCH FROM (MAX(pv.viewed_at) - MIN(pv.viewed_at)))
    )::INTERVAL
    FROM analytics_sessions s
    JOIN analytics_property_views pv ON s.session_id = pv.session_id
    WHERE s.created_at >= NOW() - (p_period_days || ' days')::INTERVAL
    GROUP BY s.session_id
  );
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Pages per Session
CREATE OR REPLACE FUNCTION calculate_pages_per_session(
  p_period_days INTEGER DEFAULT 30
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT
      COUNT(pv.id)::DECIMAL / NULLIF(COUNT(DISTINCT pv.session_id), 0)
    FROM analytics_property_views pv
    JOIN analytics_sessions s ON pv.session_id = s.session_id
    WHERE s.created_at >= NOW() - (p_period_days || ' days')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql;
```

**Implementation:**
- [ ] Create bounce rate function
- [ ] Create avg session duration function
- [ ] Create pages per session function
- [ ] Add indexes for performance
- [ ] Test with large datasets

---

#### Task 2.1.3: Create Time-Series Analysis Functions
**File:** `scripts/phase2-functions.sql`

```sql
-- Function: Get Trend Comparison (Week-over-Week, Month-over-Month)
CREATE OR REPLACE FUNCTION get_metric_trend(
  p_metric_name VARCHAR,
  p_current_period_days INTEGER,
  p_comparison_period_days INTEGER
)
RETURNS TABLE (
  current_value DECIMAL,
  previous_value DECIMAL,
  change_percent DECIMAL,
  trend VARCHAR
) AS $$
BEGIN
  -- Implementation for comparing metrics over time
  -- Returns trend: 'up', 'down', 'stable'
END;
$$ LANGUAGE plpgsql;
```

**Implementation:**
- [ ] Create trend comparison function
- [ ] Add week-over-week calculations
- [ ] Add month-over-month calculations
- [ ] Add year-over-year calculations
- [ ] Test with seasonal data

---

### T2.2 - Materialized Views for Performance (3 days)

#### Task 2.2.1: Create Property Performance Materialized View

```sql
-- Materialized View: Property Performance Summary
CREATE MATERIALIZED VIEW mv_property_performance AS
SELECT
  p.id,
  p.title,
  p.location,
  p.price,
  p.status,
  COUNT(pv.id) as total_views,
  COUNT(DISTINCT pv.anonymous_id) as unique_views,
  AVG(pv.view_duration_seconds) as avg_duration,
  MAX(pv.viewed_at) as last_viewed,
  COUNT(l.id) as leads_generated,
  (COUNT(l.id)::DECIMAL / NULLIF(COUNT(DISTINCT pv.anonymous_id), 0) * 100) as conversion_rate
FROM properties p
LEFT JOIN analytics_property_views pv ON p.id = pv.property_id
LEFT JOIN leads l ON l.property_id = p.id
GROUP BY p.id, p.title, p.location, p.price, p.status;

-- Refresh policy: Every 5 minutes
CREATE INDEX idx_mv_property_performance_views ON mv_property_performance(total_views DESC);
CREATE INDEX idx_mv_property_performance_conversion ON mv_property_performance(conversion_rate DESC);

-- Auto-refresh with pg_cron (if available) or manual trigger
```

**Implementation:**
- [ ] Create materialized view for property performance
- [ ] Add indexes on commonly queried columns
- [ ] Set up refresh schedule (5 minutes)
- [ ] Update API to query materialized view
- [ ] Test performance improvements (should be 10x faster)

---

#### Task 2.2.2: Create Marketing Performance Materialized View

```sql
-- Materialized View: Channel Performance
CREATE MATERIALIZED VIEW mv_channel_performance AS
SELECT
  als.source_name as channel,
  COUNT(alg.id) as total_leads,
  COUNT(DISTINCT alg.session_id) as unique_sessions,
  SUM(acs.cost) as total_cost,
  (SUM(acs.cost) / NULLIF(COUNT(alg.id), 0)) as cost_per_lead,
  COUNT(CASE WHEN l.status = 'converted' THEN 1 END) as converted_leads,
  (COUNT(CASE WHEN l.status = 'converted' THEN 1 END)::DECIMAL / NULLIF(COUNT(alg.id), 0) * 100) as conversion_rate
FROM analytics_lead_sources als
LEFT JOIN analytics_lead_generation alg ON als.id = alg.source_id
LEFT JOIN leads l ON l.id = alg.lead_id
LEFT JOIN analytics_campaign_stats acs ON acs.source_id = als.id
GROUP BY als.source_name;
```

**Implementation:**
- [ ] Create channel performance view
- [ ] Create campaign performance view
- [ ] Add refresh schedule
- [ ] Update Marketing API to use views
- [ ] Benchmark query performance

---

### T2.3 - Update API Routes with Calculations (3 days)

#### Task 2.3.1: Add Advanced Metrics to Dashboard API

**File:** `app/api/analytics/dashboard/route.ts`

**Add:**
```typescript
// Call PostgreSQL functions
const conversionRate = await db.rpc('get_lead_conversion_rate', { p_period_days: 30 })
const bounceRate = await db.rpc('calculate_bounce_rate', { p_period_days: 30 })
const avgSessionDuration = await db.rpc('calculate_avg_session_duration', { p_period_days: 30 })
```

**Implementation:**
- [ ] Integrate PostgreSQL functions into API
- [ ] Add conversion rate calculation
- [ ] Add bounce rate calculation
- [ ] Add session duration metrics
- [ ] Add trend comparisons (WoW, MoM)
- [ ] Test calculations match expected values

---

#### Task 2.3.2: Add Calculated Metrics to Properties API

**Implementation:**
- [ ] Use `mv_property_performance` materialized view
- [ ] Add leads generated per property (JOIN with leads table)
- [ ] Add property conversion rate calculation
- [ ] Add time on market calculation
- [ ] Test with various property statuses

---

#### Task 2.3.3: Add Campaign Analytics Calculations

**Implementation:**
- [ ] Calculate Campaign CTR (clicks / impressions × 100)
- [ ] Calculate Campaign CVR (conversions / clicks × 100)
- [ ] Calculate Cost Per Lead per campaign
- [ ] Add ROI placeholder (will complete in Phase 3)
- [ ] Query `analytics_campaign_stats` table

---

### T2.4 - Update Dashboard Components with Calculated Metrics (2 days)

#### Task 2.4.1: Update ExecutiveOverview with Calculations

**Add:**
- [ ] Conversion Rate KPI (now calculated!)
- [ ] Week-over-week trends for all KPIs
- [ ] Trend indicators (↑ ↓ →)

---

#### Task 2.4.2: Update MarketingAnalytics with Website Metrics

**Add:**
- [ ] Bounce Rate metric
- [ ] Avg Session Duration
- [ ] Pages per Session
- [ ] Campaign CTR and CVR
- [ ] Cost per Lead per channel

---

#### Task 2.4.3: Update PropertyAnalytics with Time Metrics

**Add:**
- [ ] Time on Market calculation
- [ ] Property conversion rate (views → leads)
- [ ] Lead generation per property

---

### 📊 Phase 2 Deliverables

**PostgreSQL Functions:**
- ✅ `get_lead_conversion_rate()`
- ✅ `calculate_bounce_rate()`
- ✅ `calculate_avg_session_duration()`
- ✅ `calculate_pages_per_session()`
- ✅ `get_metric_trend()`

**Materialized Views:**
- ✅ `mv_property_performance`
- ✅ `mv_channel_performance`

**API Routes Enhanced:**
- ✅ `/api/analytics/dashboard` - Added calculations
- ✅ `/api/analytics/properties` - Using materialized views
- ✅ `/api/analytics/leads` - Added campaign calculations

**Metrics Connected:** +20 metrics (55% total)
**Performance:** 10x faster queries with materialized views

---

## 🚀 PHASE 3: NEW DATA COLLECTION (4-6 weeks)

**Goal:** Implement missing 38 metrics with new features
**Complexity:** HIGH
**Value:** CRITICAL (revenue tracking!)
**Metrics Unlocked:** 45% more (100% complete)

### T3.1 - Database Schema Changes (5 days)

#### Task 3.1.1: Create Sales Pipeline Table

**File:** `scripts/phase3-migrations.sql`

```sql
-- Table: Sales Pipeline Tracking
CREATE TABLE sales_pipeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id),
  stage VARCHAR(50) NOT NULL CHECK (stage IN (
    'new', 'qualified', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost'
  )),
  stage_value DECIMAL(12,2), -- Estimated value at this stage
  stage_entered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  stage_exited_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sales_pipeline_lead ON sales_pipeline(lead_id);
CREATE INDEX idx_sales_pipeline_stage ON sales_pipeline(stage);
CREATE INDEX idx_sales_pipeline_dates ON sales_pipeline(stage_entered_at, stage_exited_at);

-- Trigger: Update stage_exited_at when moving to next stage
CREATE TRIGGER trg_sales_pipeline_stage_exit
BEFORE INSERT ON sales_pipeline
FOR EACH ROW
EXECUTE FUNCTION update_previous_stage_exit();
```

**Implementation:**
- [ ] Create `sales_pipeline` table
- [ ] Add indexes for performance
- [ ] Create trigger for stage transitions
- [ ] Add RLS policies for security
- [ ] Test with sample pipeline data

---

#### Task 3.1.2: Create Sales Closed Table

```sql
-- Table: Completed Sales
CREATE TABLE sales_closed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  assigned_agent_id UUID REFERENCES profiles(id),
  sale_amount DECIMAL(12,2) NOT NULL,
  commission_amount DECIMAL(12,2),
  sale_date DATE NOT NULL,
  contract_signed_at TIMESTAMP,
  payment_completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sales_closed_agent ON sales_closed(assigned_agent_id);
CREATE INDEX idx_sales_closed_property ON sales_closed(property_id);
CREATE INDEX idx_sales_closed_date ON sales_closed(sale_date);

-- Trigger: Mark property as sold
CREATE TRIGGER trg_mark_property_sold
AFTER INSERT ON sales_closed
FOR EACH ROW
EXECUTE FUNCTION mark_property_as_sold();
```

**Implementation:**
- [ ] Create `sales_closed` table
- [ ] Add foreign keys to leads, properties, agents
- [ ] Create trigger to update property status
- [ ] Add validation for sale_amount > 0
- [ ] Test sale creation workflow

---

#### Task 3.1.3: Alter Existing Tables - Add Missing Fields

```sql
-- Add fields to LEADS table
ALTER TABLE leads
ADD COLUMN assigned_agent_id UUID REFERENCES profiles(id),
ADD COLUMN property_id UUID REFERENCES properties(id),
ADD COLUMN quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
ADD COLUMN lead_source VARCHAR(50), -- 'web', 'whatsapp', 'facebook', etc.
ADD COLUMN assigned_at TIMESTAMP;

-- Add fields to PROPERTIES table
ALTER TABLE properties
ADD COLUMN sold_at TIMESTAMP,
ADD COLUMN sold_price DECIMAL(12,2),
ADD COLUMN days_on_market INTEGER GENERATED ALWAYS AS (
  CASE
    WHEN sold_at IS NOT NULL THEN EXTRACT(DAY FROM sold_at - created_at)
    ELSE EXTRACT(DAY FROM NOW() - created_at)
  END
) STORED;

-- Add fields to ANALYTICS_SESSIONS table
ALTER TABLE analytics_sessions
ADD COLUMN returning_visitor BOOLEAN DEFAULT FALSE,
ADD COLUMN session_end_time TIMESTAMP,
ADD COLUMN session_duration_seconds INTEGER GENERATED ALWAYS AS (
  EXTRACT(EPOCH FROM session_end_time - created_at)
) STORED;

-- Add fields to ANALYTICS_CAMPAIGN_STATS table
ALTER TABLE analytics_campaign_stats
ADD COLUMN revenue_generated DECIMAL(12,2) DEFAULT 0,
ADD COLUMN roi_percent DECIMAL(5,2) GENERATED ALWAYS AS (
  CASE
    WHEN cost > 0 THEN ((revenue_generated - cost) / cost * 100)
    ELSE 0
  END
) STORED;
```

**Implementation:**
- [ ] Add `assigned_agent_id` to leads table
- [ ] Add `property_id` to leads table
- [ ] Add `quality_score` to leads table
- [ ] Add `sold_at` and `sold_price` to properties table
- [ ] Add `returning_visitor` to sessions table
- [ ] Add `revenue_generated` to campaign_stats table
- [ ] Create migration rollback script
- [ ] Test migrations on staging environment

---

#### Task 3.1.4: Create Customer Segmentation Tables

```sql
-- Table: Customer Segments
CREATE TABLE customer_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  segment VARCHAR(50) NOT NULL CHECK (segment IN (
    'vip_investor', 'first_time_buyer', 'upgrader', 'downsizer', 'small_investor'
  )),
  segment_score INTEGER CHECK (segment_score >= 0 AND segment_score <= 100),
  total_purchases INTEGER DEFAULT 0,
  total_value DECIMAL(12,2) DEFAULT 0,
  last_purchase_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id) -- One customer, one segment
);

-- Table: Customer Satisfaction Surveys
CREATE TABLE customer_satisfaction (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  survey_type VARCHAR(20) NOT NULL CHECK (survey_type IN ('nps', 'csat')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  survey_sent_at TIMESTAMP,
  survey_completed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customer_segments_segment ON customer_segments(segment);
CREATE INDEX idx_customer_satisfaction_type ON customer_satisfaction(survey_type);
CREATE INDEX idx_customer_satisfaction_score ON customer_satisfaction(score);
```

**Implementation:**
- [ ] Create `customer_segments` table
- [ ] Create `customer_satisfaction` table
- [ ] Add constraint checks for scores
- [ ] Create indexes for reporting
- [ ] Test segment classification logic

---

### T3.2 - Business Logic Implementation (8 days)

#### Task 3.2.1: Lead Assignment System

**File:** `services/lead-assignment.ts`

```typescript
/**
 * Lead Assignment Service
 * Automatically assigns leads to available agents based on:
 * - Agent availability (max leads per agent)
 * - Agent specialization (luxury, commercial, residential)
 * - Round-robin distribution
 * - Geographic territory
 */

interface LeadAssignmentConfig {
  maxLeadsPerAgent: number
  assignmentStrategy: 'round_robin' | 'load_balance' | 'specialization'
}

export class LeadAssignmentService {
  async assignLead(leadId: string, config: LeadAssignmentConfig) {
    // 1. Get available agents
    // 2. Check agent capacity
    // 3. Match agent specialization with lead requirements
    // 4. Assign lead
    // 5. Send notification to agent
  }

  async reassignLead(leadId: string, newAgentId: string) {
    // Handle lead reassignment with audit trail
  }

  async getAgentWorkload(agentId: string) {
    // Return current leads assigned to agent
  }
}
```

**Implementation:**
- [ ] Create lead assignment service
- [ ] Implement round-robin algorithm
- [ ] Implement load balancing algorithm
- [ ] Add agent capacity checks
- [ ] Add email/SMS notifications to agents
- [ ] Create API endpoint `/api/leads/assign`
- [ ] Test with 100+ leads and 10 agents

---

#### Task 3.2.2: Lead Quality Scoring Algorithm

**File:** `services/lead-scoring.ts`

```typescript
/**
 * Lead Quality Scoring (0-100)
 * Factors:
 * - Profile completeness (30 points)
 * - Engagement level (25 points)
 * - Budget indication (20 points)
 * - Timeline indication (15 points)
 * - Referral source quality (10 points)
 */

export function calculateLeadQuality(lead: Lead): number {
  let score = 0

  // Profile completeness (30 points)
  if (lead.name) score += 10
  if (lead.email) score += 10
  if (lead.phone) score += 10

  // Engagement (25 points)
  const pageViews = getLeadPageViews(lead.sessionId)
  if (pageViews >= 5) score += 25
  else if (pageViews >= 3) score += 15
  else if (pageViews >= 1) score += 5

  // Budget indication (20 points)
  if (lead.budgetMin && lead.budgetMax) score += 20
  else if (lead.budgetMin || lead.budgetMax) score += 10

  // Timeline (15 points)
  if (lead.intendedPurchaseDate) score += 15

  // Source quality (10 points)
  const sourceQuality = getSourceQuality(lead.source)
  score += sourceQuality

  return Math.min(score, 100)
}
```

**Implementation:**
- [ ] Create lead scoring algorithm
- [ ] Test with sample leads
- [ ] Add to lead creation flow
- [ ] Update existing leads with scores (migration)
- [ ] Add API endpoint to recalculate scores

---

#### Task 3.2.3: Customer Segmentation Logic

**File:** `services/customer-segmentation.ts`

```typescript
/**
 * Customer Segmentation Rules
 */

export function classifyCustomer(customer: Customer): CustomerSegment {
  const { totalPurchases, totalValue, properties } = customer

  // VIP Investor: 3+ properties OR $1M+ total value
  if (totalPurchases >= 3 || totalValue >= 1000000) {
    return 'vip_investor'
  }

  // First-Time Buyer: 1 purchase, no previous ownership
  if (totalPurchases === 1 && !customer.hadPreviousProperty) {
    return 'first_time_buyer'
  }

  // Upgrader: Sold smaller, bought larger
  if (customer.lastPurchaseSquareMeters > customer.previousPropertySquareMeters) {
    return 'upgrader'
  }

  // Downsizer: Sold larger, bought smaller
  if (customer.lastPurchaseSquareMeters < customer.previousPropertySquareMeters) {
    return 'downsizer'
  }

  // Small Investor: 1-2 investment properties
  if (totalPurchases >= 1 && totalPurchases <= 2 && customer.investmentIntent) {
    return 'small_investor'
  }

  return 'first_time_buyer' // Default
}

export async function segmentAllCustomers() {
  // Batch job to classify all customers
  const customers = await db.customers.findAll()
  for (const customer of customers) {
    const segment = classifyCustomer(customer)
    await db.customerSegments.upsert({
      customerId: customer.id,
      segment,
      segmentScore: calculateSegmentScore(customer)
    })
  }
}
```

**Implementation:**
- [ ] Create segmentation rules
- [ ] Create batch job for segmentation
- [ ] Add API endpoint to segment customers
- [ ] Add segment to customer profile UI
- [ ] Test with sample customers from each segment

---

#### Task 3.2.4: Revenue Attribution System

**File:** `services/revenue-attribution.ts`

```typescript
/**
 * Revenue Attribution
 * Tracks revenue back to:
 * - Original lead source (first-touch)
 * - Last lead source (last-touch)
 * - All touchpoints (multi-touch)
 * - Campaign
 * - Agent
 * - Property
 */

export async function attributeRevenue(sale: SaleClosed) {
  // Get lead journey
  const lead = await db.leads.findById(sale.leadId)
  const campaign = await db.campaigns.findByLeadId(lead.id)
  const source = await db.sources.findById(lead.sourceId)

  // First-touch attribution
  await db.revenueAttribution.create({
    saleId: sale.id,
    attributionType: 'first_touch',
    sourceId: source.id,
    campaignId: campaign.id,
    agentId: sale.assignedAgentId,
    propertyId: sale.propertyId,
    revenueAmount: sale.saleAmount
  })

  // Last-touch attribution (if different)
  // Multi-touch attribution (weighted)
}
```

**Implementation:**
- [ ] Create revenue attribution logic
- [ ] Track first-touch attribution
- [ ] Track last-touch attribution
- [ ] Create multi-touch attribution model
- [ ] Update campaign_stats with revenue
- [ ] Test with sample sales

---

### T3.3 - UI Components for New Features (6 days)

#### Task 3.3.1: Sales Pipeline Board (Kanban)

**File:** `components/admin/SalesPipelineBoard.tsx`

**Features:**
- [ ] Drag-and-drop kanban board
- [ ] 6 columns: New, Qualified, Proposal, Negotiation, Won, Lost
- [ ] Lead cards with key info
- [ ] Progress indicators
- [ ] Estimated value per stage
- [ ] Quick actions (view, edit, notes)

**Libraries:**
- `@dnd-kit/core` for drag-and-drop
- `@dnd-kit/sortable` for sortable lists

---

#### Task 3.3.2: Agent Assignment Interface

**File:** `components/admin/LeadAssignmentModal.tsx`

**Features:**
- [ ] List of available agents
- [ ] Agent capacity indicator (5/20 leads)
- [ ] Agent specialization tags
- [ ] Manual assignment or auto-assign button
- [ ] Reassignment with reason
- [ ] Assignment history

---

#### Task 3.3.3: Customer Segmentation Dashboard

**File:** `components/admin/CustomerSegmentationDashboard.tsx`

**Features:**
- [ ] 5 segment cards with counts and percentages
- [ ] Segment distribution pie chart
- [ ] Segment value breakdown
- [ ] Customer list per segment
- [ ] Segment trends over time
- [ ] Export segment data

---

#### Task 3.3.4: Revenue Analytics Dashboard

**File:** `components/admin/RevenueAnalytics.tsx`

**Features:**
- [ ] Total revenue KPI
- [ ] Revenue trends chart (monthly)
- [ ] Revenue by property type
- [ ] Revenue by agent ranking
- [ ] Revenue by source/campaign
- [ ] YoY comparison
- [ ] Revenue goals vs actual

---

#### Task 3.3.5: NPS Survey Interface

**File:** `components/surveys/NPSSurvey.tsx`

**Features:**
- [ ] 0-10 rating scale
- [ ] Optional feedback textarea
- [ ] "How likely are you to recommend us?"
- [ ] Thank you message
- [ ] Email/SMS survey link
- [ ] Admin dashboard for NPS results

---

### T3.4 - API Routes for New Features (5 days)

#### Task 3.4.1: Sales Pipeline API

**Endpoints:**
```typescript
POST   /api/sales/pipeline        // Create pipeline entry
GET    /api/sales/pipeline        // Get all pipeline stages
PATCH  /api/sales/pipeline/:id    // Move lead to next stage
DELETE /api/sales/pipeline/:id    // Remove from pipeline

GET    /api/sales/closed          // Get closed sales
POST   /api/sales/closed          // Record new sale
```

**Implementation:**
- [ ] Create CRUD endpoints for pipeline
- [ ] Add stage transition validation
- [ ] Add webhook for stage changes
- [ ] Add agent notification on assignment
- [ ] Test pipeline flow end-to-end

---

#### Task 3.4.2: Agent Performance API

**Endpoints:**
```typescript
GET /api/agents/performance?agentId=xxx&period=30d
Response: {
  salesCount, revenue, conversionRate, avgSaleValue, ranking
}

GET /api/agents/leaderboard
Response: Array<{ agentId, name, salesCount, revenue, rank }>
```

**Implementation:**
- [ ] Create agent performance endpoint
- [ ] Query `sales_closed` table
- [ ] Calculate agent metrics
- [ ] Create leaderboard with rankings
- [ ] Add period filtering
- [ ] Cache results with React Query

---

#### Task 3.4.3: Customer Segmentation API

**Endpoints:**
```typescript
GET    /api/customers/segments              // Get segment distribution
GET    /api/customers/segments/:segment     // Get customers in segment
POST   /api/customers/segments/recalculate  // Trigger re-segmentation
```

**Implementation:**
- [ ] Create segmentation endpoints
- [ ] Query `customer_segments` table
- [ ] Add filtering and sorting
- [ ] Add export functionality (CSV)
- [ ] Test with large customer base

---

#### Task 3.4.4: Revenue Analytics API

**Endpoints:**
```typescript
GET /api/analytics/revenue?period=30d&groupBy=month
Response: {
  totalRevenue,
  avgSaleValue,
  revenueByMonth,
  revenueByProperty,
  revenueByAgent,
  revenueBySource,
  goalsVsActual
}
```

**Implementation:**
- [ ] Create revenue analytics endpoint
- [ ] Join `sales_closed` with multiple tables
- [ ] Add grouping options (month, quarter, year)
- [ ] Add comparison to goals
- [ ] Add forecasting (optional)
- [ ] Cache heavily (15 minutes)

---

#### Task 3.4.5: Surveys & Satisfaction API

**Endpoints:**
```typescript
POST   /api/surveys/nps           // Submit NPS survey
GET    /api/surveys/nps/results   // Get NPS results
POST   /api/surveys/csat          // Submit CSAT survey
GET    /api/analytics/satisfaction // Get satisfaction metrics
```

**Implementation:**
- [ ] Create survey submission endpoints
- [ ] Store in `customer_satisfaction` table
- [ ] Calculate NPS score (promoters - detractors)
- [ ] Calculate avg CSAT score
- [ ] Add API for sending survey links
- [ ] Test survey flow

---

### T3.5 - Integration & Testing (6 days)

#### Task 3.5.1: End-to-End Testing

**Scenarios to Test:**
1. **Complete Sales Flow:**
   - [ ] Lead creation
   - [ ] Auto-assignment to agent
   - [ ] Lead qualification (quality score)
   - [ ] Pipeline progression (all stages)
   - [ ] Sale closure
   - [ ] Revenue attribution
   - [ ] Agent commission calculation

2. **Analytics Flow:**
   - [ ] Session tracking
   - [ ] Property views
   - [ ] Lead generation
   - [ ] Campaign attribution
   - [ ] Revenue analytics
   - [ ] Dashboard updates

3. **Customer Journey:**
   - [ ] First visit
   - [ ] Property browsing
   - [ ] Lead submission
   - [ ] Agent contact
   - [ ] Property viewing (offline)
   - [ ] Purchase
   - [ ] NPS survey
   - [ ] Segment classification

---

#### Task 3.5.2: Performance Testing

**Targets:**
- [ ] Dashboard load time < 2 seconds
- [ ] API response time < 500ms
- [ ] Handle 1000+ concurrent users
- [ ] Handle 10,000+ properties
- [ ] Handle 100,000+ sessions per month

**Tools:**
- Apache Bench (ab) for API load testing
- Lighthouse for frontend performance
- PostgreSQL EXPLAIN ANALYZE for query optimization

---

#### Task 3.5.3: Data Migration & Backfill

**Tasks:**
- [ ] Migrate existing leads to new schema
- [ ] Backfill `quality_score` for all leads
- [ ] Segment all existing customers
- [ ] Calculate historical revenue (if data available)
- [ ] Test data integrity after migration

---

### 📊 Phase 3 Deliverables

**Database Tables Created:**
- ✅ `sales_pipeline` - Pipeline stage tracking
- ✅ `sales_closed` - Completed sales
- ✅ `customer_segments` - Customer classification
- ✅ `customer_satisfaction` - NPS/CSAT surveys

**Database Fields Added:**
- ✅ `leads.assigned_agent_id`
- ✅ `leads.property_id`
- ✅ `leads.quality_score`
- ✅ `properties.sold_at`
- ✅ `properties.sold_price`
- ✅ `analytics_sessions.returning_visitor`
- ✅ `analytics_campaign_stats.revenue_generated`

**New Services:**
- ✅ Lead Assignment Service
- ✅ Lead Scoring Algorithm
- ✅ Customer Segmentation Logic
- ✅ Revenue Attribution System

**UI Components:**
- ✅ Sales Pipeline Board (Kanban)
- ✅ Agent Assignment Interface
- ✅ Customer Segmentation Dashboard
- ✅ Revenue Analytics Dashboard
- ✅ NPS Survey Interface

**API Routes:**
- ✅ `/api/sales/pipeline`
- ✅ `/api/sales/closed`
- ✅ `/api/agents/performance`
- ✅ `/api/customers/segments`
- ✅ `/api/analytics/revenue`
- ✅ `/api/surveys/nps`

**Metrics Connected:** +38 metrics (100% complete!)
**All Dashboards:** Fully functional with real data

---

## 🎉 PROJECT COMPLETION CHECKLIST

### Documentation
- [ ] Update API documentation with all endpoints
- [ ] Create user guide for sales pipeline
- [ ] Document segmentation rules
- [ ] Create admin training materials
- [ ] Update ROADMAP.md with completion status

### Testing
- [ ] Unit tests for all new functions
- [ ] Integration tests for APIs
- [ ] E2E tests for critical flows
- [ ] Performance benchmarks documented
- [ ] Security audit completed

### Deployment
- [ ] Phase 1 deployed to production
- [ ] Phase 2 deployed to production
- [ ] Phase 3 deployed to production
- [ ] Database migrations run successfully
- [ ] Monitoring dashboards set up
- [ ] Error tracking configured (Sentry)

### Handoff
- [ ] Demo to stakeholders
- [ ] Training session for agents
- [ ] Support documentation
- [ ] Known issues documented
- [ ] Future enhancements roadmap

---

## 📈 SUCCESS METRICS

**Before (Current State):**
- ❌ 100% mock data in dashboards
- ❌ No revenue tracking
- ❌ No agent performance metrics
- ❌ No customer segmentation
- ❌ No sales pipeline visibility

**After (Target State):**
- ✅ 100% real data in dashboards
- ✅ Complete revenue tracking with attribution
- ✅ Real-time agent performance leaderboard
- ✅ Automatic customer segmentation
- ✅ Full sales pipeline visibility with Kanban
- ✅ 82 metrics operational
- ✅ < 2s dashboard load time
- ✅ GDPR compliant

---

## 🚀 NEXT STEPS AFTER COMPLETION

### Future Enhancements (Post-Launch)
1. **Predictive Analytics:**
   - Lead conversion prediction using ML
   - Property price forecasting
   - Churn prediction

2. **Advanced Features:**
   - A/B testing framework for campaigns
   - Cohort analysis for customer retention
   - Real-time notifications for agents
   - WhatsApp integration for leads

3. **Reporting:**
   - Scheduled email reports
   - PDF export for dashboards
   - Custom report builder

4. **Integrations:**
   - CRM integration (Salesforce, HubSpot)
   - Accounting software integration
   - SMS gateway for surveys
   - Facebook Lead Ads integration

---

**Total Estimated Timeline:** 7-11 weeks
**Total Metrics Implemented:** 82/82 (100%)
**Investment Required:** High
**Business Impact:** Critical - Enables data-driven decisions

**Ready to begin Phase 1!** 🚀
