# API Design Report

## Spec Files
- `openapi.yaml` ➜ 8 resources, 15 operations
- `api-guidelines.md` ➜ Comprehensive integration patterns and best practices

## Core Decisions

### 1. URI Design & Versioning
- **Flat URI structure**: `/api/[service]/[resource]` pattern
- **No versioning initially**: Direct `/api/` namespace for simplicity
- **Future versioning strategy**: URL versioning (`/api/v1/`, `/api/v2/`)

### 2. HTTP Method Semantics
- **GET**: Read operations (dashboard, geocoding)
- **POST**: Create operations (sessions, interactions, lead events)
- **PUT**: Upsert operations and batch processing
- **RESTful exceptions**: Some PUT endpoints handle creation + updates for simplified client integration

### 3. Authentication & Security
- **Current state**: Public endpoints (no auth required)
- **GDPR compliance**: Built-in IP hashing, opt-out support
- **Future auth**: JWT Bearer tokens + API keys for server-to-server

### 4. Response Format
- **Standard envelope**: `{ success, error?, message?, data? }`
- **Error format**: Follows RFC 7807 problem details pattern
- **Consistent typing**: All responses include success boolean

### 5. Rate Limiting Strategy
- **Geocoding**: 1 req/sec with 24-hour caching
- **Analytics**: 1000 req/min (~16 req/sec)
- **Implementation**: Application-level with exponential backoff

### 6. Data Processing Patterns
- **Session deduplication**: 4-hour windows based on IP hash + User Agent
- **View debouncing**: 2-hour property view deduplication
- **Batch processing**: Support for up to 100 interactions per batch
- **Automatic fallbacks**: Geocoding returns fallback coordinates on errors

## Technical Architecture

### Backend Integration
- **Next.js 15 App Router**: API routes with TypeScript
- **Supabase PostgreSQL**: ACID transactions, prepared statements
- **Service layer**: Centralized business logic in `AnalyticsService`
- **Type safety**: Comprehensive TypeScript schemas

### Performance Optimizations
- **In-memory caching**: Geocoding addresses cached for 24 hours
- **Database functions**: Complex logic pushed to PostgreSQL (debouncing, aggregations)
- **Batching support**: Reduces API calls for high-frequency events
- **Automatic cleanup**: Cache eviction prevents memory leaks

### Error Handling Philosophy
- **Graceful degradation**: Never break client applications
- **Detailed validation**: Field-specific error messages
- **Fallback responses**: Geocoding always returns valid coordinates
- **Robust session handling**: Multiple fallback levels for session creation

## Implemented Endpoints

### 🆕 Newly Created/Fixed Endpoints

1. **Geocoding Proxy API** (`/api/geocode`)
   - **Problem solved**: CORS policy errors from direct OpenStreetMap calls
   - **Features**: Rate limiting, caching, Argentina filtering, fallback coordinates
   - **Response time**: <100ms (cached), <2s (external API)

2. **Analytics Session API** (`/api/analytics/session`)
   - **Problem solved**: 500 errors during session creation
   - **Features**: Multiple fallback levels, GDPR-compliant IP hashing, deduplication
   - **Robustness**: Handles database failures gracefully

3. **Analytics Interaction API** (`/api/analytics/interaction`)
   - **Problem solved**: Missing endpoint for UX tracking
   - **Features**: Single and batch operations, 11 interaction types, flexible event data
   - **Performance**: Batch processing for high-frequency events

### 🔧 Enhanced Existing Endpoints

4. **Property View Tracking** (`/api/analytics/property-view`)
   - **Enhanced**: Better error handling, automatic session creation (PUT endpoint)
   - **Features**: 2-hour debouncing, comprehensive interaction tracking

5. **Lead Generation Attribution** (`/api/analytics/lead-generation`)
   - **Enhanced**: Source code lookup, improved validation
   - **Features**: Multi-touch attribution, UTM preservation

6. **Dashboard Analytics** (`/api/analytics/dashboard`)
   - **Enhanced**: Advanced filtering, metric-specific queries
   - **Features**: Date ranges, property filtering, campaign analysis

## Integration Ecosystem

### Client-Side Patterns
- **Session management**: Automatic creation with fallback handling
- **Batch processing**: Queue interactions for optimal network usage
- **Error resilience**: Retry logic with exponential backoff
- **Privacy-first**: No PII collection, automatic IP hashing

### Database Schema Integration
- **Session tracking**: `analytics_sessions` with IP hashing
- **Event recording**: `analytics_property_views`, `analytics_user_interactions`
- **Lead attribution**: `analytics_lead_generation` with source linking
- **Aggregations**: Pre-computed metrics for dashboard performance

## Open Questions & Future Considerations

### 1. Authentication Implementation Timeline
- **Question**: When to implement JWT authentication for admin endpoints?
- **Impact**: Currently all endpoints are public, may need protection
- **Recommendation**: Implement when admin dashboard goes live

### 2. Real-time Analytics Support
- **Question**: Should we add WebSocket support for live dashboard updates?
- **Trade-offs**: Increased complexity vs. real-time insights
- **Recommendation**: Evaluate based on admin user feedback

### 3. Data Retention & GDPR
- **Question**: Automatic data purging after 25 months?
- **Compliance**: GDPR requires data retention limits
- **Implementation**: Background job for expired data cleanup

### 4. Multi-region Support
- **Question**: Geographic distribution of analytics data?
- **Performance**: Reduce latency for international users
- **Complexity**: Data synchronization and consistency challenges

### 5. Advanced Attribution Modeling
- **Question**: Multi-touch attribution vs. last-touch attribution?
- **Value**: Better marketing campaign ROI analysis
- **Complexity**: Significant algorithm development required

## Next Steps (for implementers)

### Immediate Actions
1. **Deploy OpenAPI spec** to API documentation platform (Swagger UI/Redoc)
2. **Implement monitoring** for all endpoint response times and error rates
3. **Add health check endpoints** for production monitoring
4. **Set up alerts** for rate limit violations and 5xx errors

### Short-term Enhancements (1-2 months)
1. **Authentication layer** for admin endpoints
2. **Redis caching** to replace in-memory geocoding cache
3. **Data export APIs** for GDPR compliance
4. **Advanced dashboard filtering** based on user feedback

### Long-term Strategic Goals (3-6 months)
1. **Real-time dashboard** with WebSocket connections
2. **Multi-touch attribution** modeling
3. **API versioning** strategy implementation
4. **Performance optimization** based on production metrics

## Success Metrics

### API Performance
- **Target latency**: P95 < 500ms for all endpoints
- **Availability**: 99.9% uptime SLA
- **Error rate**: <1% 5xx responses

### Business Impact
- **Analytics adoption**: Track API usage growth
- **Data quality**: Monitor session completion rates
- **User experience**: Measure property view accuracy

### Technical Debt
- **Code coverage**: >90% test coverage for new endpoints
- **Documentation**: All endpoints documented with examples
- **Monitoring**: Full observability pipeline in place

---

**Architecture**: RESTful API with GDPR compliance, intelligent caching, and graceful degradation patterns.

**Integration**: Drop-in analytics tracking for real estate platforms with minimal client-side complexity.

**Scalability**: Designed for high-volume property view tracking with efficient batch processing.