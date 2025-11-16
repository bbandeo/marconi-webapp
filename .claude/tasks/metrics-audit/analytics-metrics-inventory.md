# Analytics Metrics Inventory - Complete Audit

**Date:** 2025-10-01
**Task:** Metrics Audit - Analytics Dashboard v4
**Total Metrics Identified:** ~82 metrics across 5 modules

---

## 📊 LEGEND

**Status Indicators:**
- ✅ **READY** - Data is being collected and ready to connect
- ⏸️ **PARTIAL** - Data partially available, needs calculation/aggregation
- ❌ **MISSING** - Not implemented, requires new collection logic

**Priority Levels:**
- 🔴 **CRITICAL** - Core business metric, must implement
- 🟡 **HIGH** - Important for decision making
- 🟢 **MEDIUM** - Nice to have, can wait

---

## T3.1 - EXECUTIVE OVERVIEW (6 metrics)

### KPI Cards (4 metrics)

| # | Metric | Status | Priority | Data Source | Notes |
|---|--------|--------|----------|-------------|-------|
| 1 | **Total Revenue** | ❌ | 🔴 | None | No revenue tracking. Need `sales_closed` table |
| 2 | **Total Leads** | ✅ | 🔴 | `analytics_lead_generation` | COUNT(*) of leads |
| 3 | **Conversion Rate** | ⏸️ | 🔴 | Calculated | leads_converted / total_leads. Need sales data |
| 4 | **Active Properties** | ✅ | 🟡 | `properties` table | WHERE status = 'active' |

### Charts & Visualizations (2 metrics)

| # | Metric | Status | Priority | Data Source | Notes |
|---|--------|--------|----------|-------------|-------|
| 5 | **Revenue Trends (Monthly)** | ❌ | 🔴 | None | Need revenue events by month |
| 6 | **Lead Generation Trends** | ✅ | 🟡 | `analytics_daily_stats` or `analytics_lead_generation` | GROUP BY date |

---

## T3.2 - SALES PERFORMANCE (20+ metrics)

### KPI Cards (4 metrics)

| # | Metric | Status | Priority | Data Source | Notes |
|---|--------|--------|----------|-------------|-------|
| 7 | **Total Revenue** | ❌ | 🔴 | None | Same as #1 |
| 8 | **Leads Converted** | ❌ | 🔴 | None | Need sales pipeline tracking |
| 9 | **Average Sale Value** | ❌ | 🔴 | None | SUM(revenue) / COUNT(sales) |
| 10 | **Sales Cycle Time** | ❌ | 🟡 | None | Avg days from lead creation to sale |

### Pipeline Stages (5 stages × 2 metrics = 10 metrics)

| # | Stage | Count Status | Value Status | Data Source | Notes |
|---|-------|--------------|--------------|-------------|-------|
| 11 | **New Leads** | ⏸️ | ❌ | `analytics_lead_generation` | COUNT where created_at recent. No value |
| 12 | **Qualified** | ❌ | ❌ | None | Need pipeline status field |
| 13 | **Proposal Sent** | ❌ | ❌ | None | Need pipeline status field |
| 14 | **Negotiation** | ❌ | ❌ | None | Need pipeline status field |
| 15 | **Closed Won** | ❌ | ❌ | None | Need sales_closed table |

### Agent Performance (6 agents × 4 metrics = 24 metrics)

| Agent Metric | Status | Priority | Data Source | Notes |
|--------------|--------|----------|-------------|-------|
| **Agent Name** | ❌ | 🔴 | `profiles` table | Need agent role identification |
| **Sales Count** | ❌ | 🔴 | None | Need assigned_agent_id in leads |
| **Revenue Generated** | ❌ | 🔴 | None | Need revenue + agent assignment |
| **Conversion Rate** | ❌ | 🟡 | None | agent_sales / agent_leads |
| **Avg Sale Value** | ❌ | 🟡 | None | agent_revenue / agent_sales |

**Note:** Currently showing 6 mock agents. Need to implement:
- Agent assignment system
- Lead ownership tracking
- Sales attribution to agents

### Top Performing Properties (3 columns)

| # | Metric | Status | Priority | Data Source | Notes |
|---|--------|--------|----------|-------------|-------|
| 16 | **Property Name** | ✅ | 🟡 | `properties` table | property_id + title |
| 17 | **Total Views** | ✅ | 🟡 | `analytics_property_views` | COUNT(*) GROUP BY property_id |
| 18 | **Leads Generated** | ⏸️ | 🟡 | `analytics_lead_generation` | Need property_id in leads table |
| 19 | **Revenue** | ❌ | 🟡 | None | Need property-revenue attribution |

---

## T3.3 - MARKETING & LEADS (25+ metrics)

### KPI Cards (4 metrics)

| # | Metric | Status | Priority | Data Source | Notes |
|---|--------|--------|----------|-------------|-------|
| 20 | **Total Leads** | ✅ | 🔴 | `analytics_lead_generation` | COUNT(*) |
| 21 | **Lead Quality Score** | ❌ | 🟡 | None | Need scoring algorithm (engagement, profile completeness) |
| 22 | **Cost Per Lead** | ⏸️ | 🟡 | Calculated | total_marketing_cost / total_leads. Need cost tracking |
| 23 | **Website Traffic** | ✅ | 🟡 | `analytics_sessions` | COUNT(DISTINCT session_id) |

### Channel Performance (6 channels × 5 metrics = 30 metrics)

**Channels:** Web, WhatsApp, Facebook, Instagram, Email, Phone

| Metric per Channel | Status | Priority | Data Source | Notes |
|-------------------|--------|----------|-------------|-------|
| **Leads Count** | ✅ | 🔴 | `analytics_lead_generation` + `analytics_lead_sources` | GROUP BY source_id |
| **Conversion Rate** | ⏸️ | 🟡 | Calculated | channel_sales / channel_leads. Need sales data |
| **Cost** | ❌ | 🟡 | None | Need campaign budget tracking |
| **ROI** | ❌ | 🔴 | None | (channel_revenue - channel_cost) / channel_cost |
| **Trend** | ⏸️ | 🟢 | Calculated | Compare vs previous period |

### Campaign Tracking (5+ metrics per campaign)

| # | Metric | Status | Priority | Data Source | Notes |
|---|--------|--------|----------|-------------|-------|
| 24 | **Campaign Name** | ⏸️ | 🟡 | `analytics_campaign_attribution` | utm_campaign field |
| 25 | **Impressions** | ⏸️ | 🟢 | `analytics_campaign_stats` | impressions field exists |
| 26 | **Clicks** | ⏸️ | 🟡 | `analytics_campaign_stats` | clicks field exists |
| 27 | **Leads Generated** | ✅ | 🔴 | `analytics_lead_generation` + `analytics_campaign_attribution` | JOIN on session_id |
| 28 | **Cost** | ⏸️ | 🟡 | `analytics_campaign_stats` | cost field exists but not populated |
| 29 | **Revenue** | ❌ | 🔴 | None | Need revenue tracking |
| 30 | **ROI** | ❌ | 🔴 | Calculated | (revenue - cost) / cost × 100 |
| 31 | **CTR (Click-Through Rate)** | ⏸️ | 🟡 | Calculated | (clicks / impressions) × 100 |
| 32 | **CVR (Conversion Rate)** | ⏸️ | 🟡 | Calculated | (conversions / clicks) × 100 |

### Website Analytics (10 metrics)

| # | Metric | Status | Priority | Data Source | Notes |
|---|--------|--------|----------|-------------|-------|
| 33 | **Total Sessions** | ✅ | 🟡 | `analytics_sessions` | COUNT(DISTINCT session_id) |
| 34 | **Unique Visitors** | ✅ | 🟡 | `analytics_sessions` | COUNT(DISTINCT anonymous_id) |
| 35 | **Page Views** | ✅ | 🟡 | `analytics_property_views` | COUNT(*) all views |
| 36 | **Bounce Rate** | ⏸️ | 🟡 | Calculated | Sessions with 1 page view / total sessions |
| 37 | **Avg Session Duration** | ⏸️ | 🟢 | Calculated | Need session end time tracking |
| 38 | **Pages per Session** | ⏸️ | 🟢 | Calculated | Total page views / total sessions |
| 39 | **New vs Returning Visitors** | ⏸️ | 🟢 | `analytics_sessions` | Track returning_visitor field (needs implementation) |
| 40 | **Traffic Sources** | ✅ | 🟡 | `analytics_sessions` | GROUP BY utm_source or referrer |
| 41 | **Device Breakdown** | ✅ | 🟢 | `analytics_sessions` | GROUP BY device_type |
| 42 | **Top Landing Pages** | ⏸️ | 🟢 | `analytics_property_views` | First page in session (needs session logic) |

---

## T3.4 - PROPERTY ANALYTICS (15+ metrics)

### KPI Cards (4 metrics)

| # | Metric | Status | Priority | Data Source | Notes |
|---|--------|--------|----------|-------------|-------|
| 43 | **Total Properties** | ✅ | 🟡 | `properties` table | COUNT(*) |
| 44 | **Avg Views per Property** | ✅ | 🟡 | `analytics_property_views` | AVG(view_count) per property |
| 45 | **Avg Time on Market** | ⏸️ | 🟡 | `properties` table | Calculated from created_at to sold_at/now |
| 46 | **Conversion Rate** | ⏸️ | 🔴 | Calculated | properties_sold / total_properties. Need sold status |

### Property Performance Table (8 columns per property)

| # | Metric | Status | Priority | Data Source | Notes |
|---|--------|--------|----------|-------------|-------|
| 47 | **Property Title** | ✅ | 🔴 | `properties` table | title field |
| 48 | **Property Image** | ✅ | 🟡 | `properties` table | images[0] |
| 49 | **Total Views** | ✅ | 🔴 | `analytics_property_views` | COUNT(*) per property |
| 50 | **Unique Views** | ✅ | 🔴 | `analytics_property_views` | COUNT(DISTINCT anonymous_id) |
| 51 | **Leads Generated** | ⏸️ | 🔴 | `analytics_lead_generation` | Need property_id in leads |
| 52 | **Avg View Duration** | ✅ | 🟢 | `analytics_property_views` | AVG(view_duration_seconds) |
| 53 | **Last Viewed** | ✅ | 🟢 | `analytics_property_views` | MAX(viewed_at) |
| 54 | **Conversion Rate** | ⏸️ | 🟡 | Calculated | leads / unique_views × 100 |

### Geographic Distribution (per state/city)

| # | Metric | Status | Priority | Data Source | Notes |
|---|--------|--------|----------|-------------|-------|
| 55 | **Location Name** | ✅ | 🟡 | `properties` table | location field |
| 56 | **Property Count** | ✅ | 🟡 | `properties` table | GROUP BY location |
| 57 | **Total Views** | ✅ | 🟡 | `analytics_property_views` JOIN `properties` | Views by property location |
| 58 | **Avg Price** | ✅ | 🟡 | `properties` table | AVG(price) per location |

### Price Trends Analysis

| # | Metric | Status | Priority | Data Source | Notes |
|---|--------|--------|----------|-------------|-------|
| 59 | **Avg Price by Month** | ⏸️ | 🟢 | `properties` table | Historical price tracking needed |
| 60 | **Price Distribution** | ✅ | 🟢 | `properties` table | Histogram of prices |
| 61 | **Price per sqm Trends** | ⏸️ | 🟢 | `properties` table | price / square_meters over time |

---

## T3.5 - CUSTOMER INSIGHTS (16+ metrics)

### KPI Cards (4 metrics)

| # | Metric | Status | Priority | Data Source | Notes |
|---|--------|--------|----------|-------------|-------|
| 62 | **Total Customers** | ❌ | 🔴 | None | Need definition: leads who bought? Separate table? |
| 63 | **Avg Lifetime Value** | ❌ | 🔴 | None | Need customer + revenue tracking |
| 64 | **Customer Satisfaction** | ❌ | 🟡 | None | Need NPS/CSAT surveys |
| 65 | **Retention Rate** | ❌ | 🟡 | None | Repeat customers / total customers |

### Customer Segmentation (5 segments × 4 metrics = 20 metrics)

**Segments:**
1. VIP Investors (High-value, multiple properties)
2. First-Time Buyers (New to market)
3. Upgraders (Moving to larger property)
4. Downsizers (Moving to smaller property)
5. Small Investors (1-2 investment properties)

| Metric per Segment | Status | Priority | Data Source | Notes |
|-------------------|--------|----------|-------------|-------|
| **Count** | ❌ | 🟡 | None | Need segmentation logic |
| **Percentage** | ❌ | 🟡 | Calculated | segment_count / total_customers × 100 |
| **Total Value** | ❌ | 🔴 | None | SUM(revenue) per segment |
| **Avg Transaction** | ❌ | 🟡 | None | avg_value per segment |
| **Trend** | ❌ | 🟢 | None | Growth/decline per segment |

**Segmentation Logic Needed:**
```typescript
// Pseudocode for segmentation
function classifyCustomer(customer) {
  if (purchases > 2 && total_value > $500k) return 'VIP'
  if (purchases === 1 && no_previous_property) return 'First-Time'
  if (upgrading_to_larger) return 'Upgrader'
  if (downsizing_to_smaller) return 'Downsizer'
  if (purchases >= 1 && purchases <= 2 && investment) return 'Small Investor'
}
```

### Customer Journey Funnel (6 stages × 3 metrics = 18 metrics)

**Journey Stages:**
1. Awareness (Website visit)
2. Interest (Property view)
3. Consideration (Multiple views, comparison)
4. Intent (Lead form submission)
5. Purchase (Sale closed)
6. Loyalty (Repeat purchase, referral)

| Metric per Stage | Status | Priority | Data Source | Notes |
|-----------------|--------|----------|-------------|-------|
| **Count** | ⏸️ | 🔴 | Mixed | Awareness/Interest ready, Purchase missing |
| **Conversion to Next** | ⏸️ | 🔴 | Calculated | stage_n / stage_n-1 × 100 |
| **Drop-off Rate** | ⏸️ | 🟡 | Calculated | Users who don't proceed to next stage |

**Journey Stage Data Sources:**
- **Awareness:** ✅ `analytics_sessions` (unique visitors)
- **Interest:** ✅ `analytics_property_views` (users who viewed ≥1 property)
- **Consideration:** ⏸️ `analytics_property_views` (users who viewed ≥3 properties) - needs query
- **Intent:** ✅ `analytics_lead_generation` (lead submissions)
- **Purchase:** ❌ Need `sales_closed` table
- **Loyalty:** ❌ Need repeat purchase tracking

### Additional Customer Metrics

| # | Metric | Status | Priority | Data Source | Notes |
|---|--------|--------|----------|-------------|-------|
| 66 | **NPS Score** | ❌ | 🟡 | None | Need survey system |
| 67 | **CSAT Score** | ❌ | 🟡 | None | Need post-purchase surveys |
| 68 | **Churn Rate** | ❌ | 🟢 | None | Customers who left / total customers |
| 69 | **Avg Time to Purchase** | ❌ | 🟡 | None | Days from first visit to sale |
| 70 | **Customer Acquisition Cost** | ⏸️ | 🔴 | Calculated | total_marketing_cost / new_customers |
| 71 | **Referral Rate** | ❌ | 🟢 | None | Need referral source tracking |

---

## 📈 SUMMARY BY STATUS

### ✅ READY - Data Available (24 metrics)

**Can be connected immediately:**
1. Total Leads (T3.1, T3.3)
2. Active Properties (T3.1)
3. Lead Generation Trends (T3.1)
4. Total Properties (T3.4)
5. Avg Views per Property (T3.4)
6. Property Views (individual) (T3.4)
7. Unique Views per Property (T3.4)
8. Avg View Duration (T3.4)
9. Last Viewed timestamp (T3.4)
10. Property Title/Image (T3.4)
11. Location-based property count (T3.4)
12. Total Views by location (T3.4)
13. Avg Price by location (T3.4)
14. Price Distribution (T3.4)
15. Website Traffic / Total Sessions (T3.3)
16. Unique Visitors (T3.3)
17. Page Views (T3.3)
18. Traffic Sources (UTM) (T3.3)
19. Device Breakdown (T3.3)
20. Leads by Channel (T3.3)
21. Leads by Campaign (T3.3)
22. Journey Stage: Awareness (T3.5)
23. Journey Stage: Interest (T3.5)
24. Journey Stage: Intent (T3.5)

### ⏸️ PARTIAL - Needs Calculation (20 metrics)

**Data exists but requires aggregation/calculation:**
1. Conversion Rate (T3.1) - needs sales data
2. New Leads (pipeline) (T3.2) - needs filtering
3. Leads Generated per Property (T3.4) - needs property_id in leads
4. Property Conversion Rate (T3.4) - needs sales data
5. Avg Time on Market (T3.4) - needs date calculation
6. Cost Per Lead (T3.3) - needs cost data
7. Campaign Impressions (T3.3) - field exists
8. Campaign Clicks (T3.3) - field exists
9. Campaign Cost (T3.3) - field exists but empty
10. Campaign CTR (T3.3) - calculation needed
11. Campaign CVR (T3.3) - needs sales data
12. Bounce Rate (T3.3) - calculation needed
13. Avg Session Duration (T3.3) - needs session timing
14. Pages per Session (T3.3) - calculation needed
15. New vs Returning (T3.3) - needs tracking
16. Top Landing Pages (T3.3) - needs session logic
17. Price Trends (T3.4) - needs historical tracking
18. Journey: Consideration stage (T3.5) - needs query
19. Journey: Conversion rates (T3.5) - calculation
20. Customer Acquisition Cost (T3.5) - needs cost data

### ❌ MISSING - Not Implemented (38 metrics)

**Requires new data collection:**

**Revenue Tracking (8 metrics):**
1. Total Revenue (T3.1, T3.2)
2. Revenue Trends (T3.1)
3. Revenue by Property (T3.2)
4. Revenue by Agent (T3.2)
5. Revenue by Channel (T3.3)
6. Revenue by Campaign (T3.3)
7. Avg Lifetime Value (T3.5)
8. Total Value by Segment (T3.5)

**Sales Pipeline (10 metrics):**
1. Leads Converted (T3.2)
2. Avg Sale Value (T3.2)
3. Sales Cycle Time (T3.2)
4. Pipeline: Qualified stage (T3.2)
5. Pipeline: Proposal stage (T3.2)
6. Pipeline: Negotiation stage (T3.2)
7. Pipeline: Closed Won stage (T3.2)
8. Journey: Purchase stage (T3.5)
9. Journey: Loyalty stage (T3.5)
10. Avg Time to Purchase (T3.5)

**Agent Performance (5 metrics per 6 agents):**
1. Agent identification system
2. Agent sales count
3. Agent revenue
4. Agent conversion rate
5. Agent avg sale value

**Customer Management (12 metrics):**
1. Total Customers definition
2. Customer Segmentation logic (5 segments)
3. Customer Satisfaction scores
4. Retention Rate
5. Churn Rate
6. NPS Score
7. CSAT Score
8. Referral Rate
9. Segment percentages
10. Segment trends
11. Repeat purchase tracking
12. Customer scoring algorithm

**Marketing ROI (3 metrics):**
1. Channel ROI
2. Campaign ROI
3. Lead Quality Score

---

## 🎯 PRIORITY MATRIX

### 🔴 CRITICAL (Must Have) - 15 metrics
Revenue, Leads, Conversion Rates, Sales Pipeline, Agent Performance, Channel ROI

### 🟡 HIGH (Should Have) - 35 metrics
Website Analytics, Property Performance, Campaign Tracking, Time on Market

### 🟢 MEDIUM (Nice to Have) - 32 metrics
Detailed engagement metrics, Trends, Secondary analytics

---

## 🗄️ DATABASE GAPS

### New Tables Needed:

1. **`sales_closed`** - Track completed sales
   ```sql
   CREATE TABLE sales_closed (
     id UUID PRIMARY KEY,
     lead_id UUID REFERENCES leads(id),
     property_id UUID REFERENCES properties(id),
     sale_amount DECIMAL(12,2),
     sale_date TIMESTAMP,
     assigned_agent_id UUID REFERENCES profiles(id),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **`sales_pipeline`** - Track pipeline stages
   ```sql
   CREATE TABLE sales_pipeline (
     id UUID PRIMARY KEY,
     lead_id UUID REFERENCES leads(id),
     stage VARCHAR(50), -- 'new', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
     stage_entered_at TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **`customer_segments`** - Store segmentation
   ```sql
   CREATE TABLE customer_segments (
     id UUID PRIMARY KEY,
     customer_id UUID REFERENCES profiles(id),
     segment VARCHAR(50), -- 'vip', 'first_time', 'upgrader', 'downsizer', 'small_investor'
     segment_score INTEGER,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **`customer_satisfaction`** - NPS/CSAT surveys
   ```sql
   CREATE TABLE customer_satisfaction (
     id UUID PRIMARY KEY,
     customer_id UUID REFERENCES profiles(id),
     survey_type VARCHAR(20), -- 'nps', 'csat'
     score INTEGER,
     feedback TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

### Field Additions Needed:

1. **`leads` table:**
   - `assigned_agent_id UUID` - Which agent owns this lead
   - `property_id UUID` - Which property generated this lead
   - `quality_score INTEGER` - Lead quality (1-100)

2. **`properties` table:**
   - `sold_at TIMESTAMP` - When property was sold
   - `sold_price DECIMAL` - Actual sale price

3. **`analytics_sessions` table:**
   - `returning_visitor BOOLEAN` - Is this a returning visitor
   - `session_end_time TIMESTAMP` - When session ended

4. **`analytics_campaign_stats` table:**
   - Populate `cost` field (currently empty)
   - Add `revenue` field

---

## 📝 IMPLEMENTATION NOTES

### Phase 1 Quick Wins (24 metrics)
Connect all ✅ READY metrics to dashboards. These require:
- API routes: `/api/analytics/dashboard`, `/api/analytics/properties`, `/api/analytics/leads`
- Update hooks: `useAnalyticsDashboard`, `usePropertyMetrics`, `useLeadAnalytics`
- No database changes needed

**Estimated Time:** 1-2 weeks
**Complexity:** Low
**Value:** High (30% of metrics unlocked)

### Phase 2 Calculations (20 metrics)
Implement all ⏸️ PARTIAL metrics. These require:
- PostgreSQL functions for aggregations
- Materialized views for performance
- Time-series calculations
- Session logic improvements

**Estimated Time:** 2-3 weeks
**Complexity:** Medium
**Value:** Medium (25% of metrics unlocked)

### Phase 3 New Collection (38 metrics)
Implement all ❌ MISSING metrics. These require:
- New database tables and fields
- Sales pipeline UI
- Agent assignment system
- Customer segmentation algorithm
- Survey/feedback system

**Estimated Time:** 4-6 weeks
**Complexity:** High
**Value:** High (45% of metrics unlocked, including revenue!)

---

## ✅ READY FOR IMPLEMENTATION

This inventory provides:
- ✅ Complete list of 82 metrics across 5 modules
- ✅ Classification by implementation status
- ✅ Priority assignments
- ✅ Data source identification
- ✅ Database gap analysis
- ✅ Phased implementation roadmap

**Next Step:** Create detailed implementation roadmap (`implementation-roadmap.md`) with specific tasks, API endpoints, and database migrations for each phase.
