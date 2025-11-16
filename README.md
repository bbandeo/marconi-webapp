# Marconi Inmobiliaria - Real Estate Platform

A comprehensive Next.js 15 real estate platform with integrated analytics system, built for the Argentine real estate market.

## 🏠 Overview

Marconi Inmobiliaria is a full-featured real estate platform that includes:

- **Public Property Listings**: Modern, responsive property showcase
- **Interactive Property Map**: Real-time map with clustering and custom markers
- **Admin Dashboard**: Complete property and lead management system
- **Analytics System**: Comprehensive GDPR-compliant tracking and reporting
- **Lead Management**: CRM functionality with multi-source attribution
- **Multi-device Support**: Optimized for desktop, tablet, and mobile

## 📊 Analytics System

This project features a comprehensive analytics system designed specifically for real estate platforms:

### Key Features
- **GDPR Compliant**: Anonymous session tracking with IP hashing
- **Property View Tracking**: 2-hour debouncing with engagement metrics
- **Lead Attribution**: Multi-source lead tracking with conversion analytics
- **Performance Optimized**: Aggregation tables and PostgreSQL functions
- **Real-time Dashboard**: Comprehensive metrics and reporting

### Documentation
- **[📋 System Architecture](docs/analytics-system-architecture.md)** - Complete technical overview
- **[🔌 API Reference](docs/analytics-api-reference.md)** - Detailed API documentation
- **[🔒 GDPR Compliance](docs/analytics-gdpr-compliance.md)** - Privacy and compliance guide
- **[⚙️ Integration Guide](docs/analytics-integration-guide.md)** - Implementation instructions

## 🗺️ Interactive Property Map

A fully-featured, responsive map component powered by Leaflet and OpenStreetMap:

### Key Features
- **Real-time Property Display**: Shows all available properties with live coordinates
- **Smart Clustering**: Automatic grouping for 50+ properties to maintain performance
- **Custom Markers**: Color-coded pins (Red: Houses, Blue: Apartments, Green: Land)
- **Interactive Popups**: Property details with images, prices, and quick actions
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Analytics Integration**: Tracks map interactions and property views

### Quick Usage

```tsx
import InteractivePropertyMap from '@/components/map/InteractivePropertyMap'

// Basic usage
<InteractivePropertyMap />

// Advanced usage with options
<InteractivePropertyMap
  height="600px"
  initialZoom={13}
  enableClustering={true}
  maxProperties={100}
  onPropertyClick={(id) => console.log('Property clicked:', id)}
/>
```

### Configuration

Map configuration is centralized in `lib/map-config.ts`:

```typescript
export const MAP_CONFIG = {
  defaultCenter: [-29.15, -59.65],  // Reconquista, Santa Fe
  defaultZoom: 13,
  minZoom: 5,
  maxZoom: 18,
  clusteringThreshold: 50,  // Auto-cluster above 50 properties
  tileLayerUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
}
```

### Testing

```bash
# Run E2E tests for the map
pnpm test:e2e e2e/interactive-property-map.spec.ts

# Run accessibility tests
pnpm test:a11y

# Run performance tests
pnpm test:performance
```

### Geocoding

Populate property coordinates automatically:

```bash
pnpm geocode:properties
```

This script uses OpenStreetMap's Nominatim API to geocode property addresses.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended)
- Supabase account
- Cloudinary account (for image management)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/marconi-webapp.git
   cd marconi-webapp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   # Run the analytics schema migration
   psql -h your-db-host -d your-database -f scripts/analytics-schema-migration.sql
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

## 🛠️ Technology Stack

### Core Technologies
- **Next.js 15** - App Router with React 19
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Supabase** - Database and authentication
- **Cloudinary** - Image management
- **Leaflet** - Interactive maps with OpenStreetMap

### Analytics Stack
- **PostgreSQL Functions** - Server-side analytics processing
- **Client-side Tracking** - Browser-safe analytics client
- **React Hooks** - Seamless component integration
- **GDPR Compliance** - Built-in privacy protection

### UI Components
- **shadcn/ui** - Modern component library
- **Radix UI** - Accessible primitives
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form management
- **Zod** - Runtime validation

## 📁 Project Structure

```
marconi-webapp/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── api/
│   │   ├── analytics/     # Analytics API endpoints
│   │   ├── geocode/       # Geocoding API
│   │   └── properties/    # Property APIs (including map-locations)
│   ├── propiedades/       # Public property pages
│   └── ...
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── map/              # Map components
│   │   ├── InteractivePropertyMap.tsx
│   │   ├── PropertyMapMarker.tsx
│   │   ├── PropertyMapPopup.tsx
│   │   ├── MapLoadingState.tsx
│   │   ├── MapErrorState.tsx
│   │   └── MapEmptyState.tsx
│   ├── ui/               # shadcn/ui components
│   └── ...
├── services/             # Business logic services
│   ├── analytics.ts      # Analytics service class
│   ├── properties.ts     # Property management
│   ├── map.ts            # Map service
│   └── leads.ts          # Lead management
├── hooks/                # Custom React hooks
│   ├── useAnalytics.ts   # Analytics integration
│   ├── usePropertyMap.ts # Map data management
│   ├── useMapResponsive.ts # Responsive map configuration
│   └── ...
├── lib/                  # Utility libraries
│   ├── analytics-client.ts # Client-side analytics
│   ├── supabase.ts       # Database client
│   ├── map-config.ts     # Map configuration
│   └── ...
├── types/                # TypeScript definitions
│   ├── analytics.ts      # Analytics type system
│   ├── map.ts            # Map type definitions
│   └── ...
├── scripts/              # Utility scripts
│   ├── analytics-schema-migration.sql
│   └── populate-property-coordinates.ts
├── e2e/                  # End-to-end tests
│   ├── interactive-property-map.spec.ts
│   ├── accessibility-map.spec.ts
│   └── ACCESSIBILITY_REPORT.md
├── performance-tests/    # Performance tests
│   └── map-performance.spec.ts
└── docs/                 # Documentation
    ├── analytics-system-architecture.md
    ├── analytics-api-reference.md
    ├── analytics-gdpr-compliance.md
    └── analytics-integration-guide.md
```

## 🔧 Development Commands

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint (disabled in build)

# Testing
pnpm test                  # Run unit tests
pnpm test:e2e              # Run all E2E tests
pnpm test:e2e:ui           # Run E2E tests with UI
pnpm test:a11y             # Run accessibility tests
pnpm test:performance      # Run performance tests
pnpm test:map              # Run map-specific tests

# Map & Geocoding
pnpm geocode:properties    # Geocode property addresses

# Database
pnpm db:migrate   # Run database migrations
pnpm db:seed      # Seed test data

# Analytics
pnpm analytics:test    # Test analytics system
pnpm analytics:cleanup # Clean old analytics data
```

## 📈 Analytics Usage

### Quick Integration

```typescript
// Track property views automatically
import { usePropertyAnalytics } from '@/hooks/useAnalytics'

export default function PropertyPage({ propertyId }: { propertyId: number }) {
  const analytics = usePropertyAnalytics(propertyId) // Auto-tracks views
  
  const handleContactClick = () => {
    analytics.trackContact('whatsapp')
  }
  
  return (
    <div>
      <button onClick={handleContactClick}>Contact via WhatsApp</button>
    </div>
  )
}
```

### Lead Tracking

```typescript
// Track lead generation
import { useAnalytics } from '@/hooks/useAnalytics'

const { trackLeadGeneration } = useAnalytics()

const handleFormSubmit = async (leadData) => {
  const lead = await createLead(leadData)
  await trackLeadGeneration(lead.id, 'formulario_web', propertyId)
}
```

## 🔒 Privacy & Security

- **GDPR Compliant**: Built-in privacy protection
- **IP Hashing**: All IP addresses are hashed using SHA-256
- **Anonymous Tracking**: No personal data in analytics
- **Opt-out Support**: Users can opt out at any time
- **Data Retention**: Automatic cleanup after 24 months
- **Row Level Security**: Database-level access controls

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching support
- **Accessibility**: WCAG 2.1 compliant components  
- **Performance**: Optimized images and lazy loading
- **SEO Optimized**: Meta tags and structured data
- **Spanish Localization**: Full Spanish language support

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY  
# - SUPABASE_SERVICE_ROLE_KEY
# - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
# - CLOUDINARY_API_KEY
# - CLOUDINARY_API_SECRET
```

### Docker

```bash
# Build and run with Docker
docker build -t marconi-webapp .
docker run -p 3000:3000 marconi-webapp
```

## 📊 Monitoring & Analytics

The system includes built-in monitoring for:

- **Performance Metrics**: Page load times, API response times
- **Error Tracking**: Client and server-side error logging
- **Analytics Health**: System health monitoring
- **GDPR Compliance**: Audit trail for privacy actions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for analytics features
- Maintain GDPR compliance in all changes
- Update documentation for new features
- Ensure mobile responsiveness

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions or support:

- **Documentation**: Check the `/docs` directory
- **Issues**: Open a GitHub issue
- **Email**: [support@marconi.com](mailto:support@marconi.com)

---

**Built with ❤️ by the Marconi Inmobiliaria team**
