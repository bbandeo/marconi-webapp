# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Marconi Inmobiliaria**, a Spanish real estate platform built with Next.js 15, featuring a public property listing site and a comprehensive admin panel for property and lead management. The application is originally created with v0.dev and deploys to Vercel.

**Business Domain:**
- Spanish real estate platform targeting Reconquista, Santa Fe, Argentina
- Focus on residential properties (houses, apartments, commercial spaces)
- CRM system for lead management and customer follow-up
- Public-facing property search and private admin management

## Environment Setup

### Requirements
- Node.js 18+ required
- Uses pnpm as package manager
- Supabase account for database and authentication
- Cloudinary account for image management

### Environment Variables
Required variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server  
- `pnpm lint` - Run ESLint (Note: disabled during builds via next.config.mjs)

## Architecture

### Core Technologies
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Supabase** for database and authentication
- **Cloudinary** for image management
- **Tailwind CSS** + **shadcn/ui** for styling
- **Radix UI** primitives
- **React Hook Form** + **Zod** for forms
- **Next Themes** for dark/light mode

### Architecture Decisions
- **Why Supabase**: Real-time features, built-in auth, PostgreSQL database, and row-level security
- **Why Cloudinary**: Automatic image optimization, transformations, and global CDN
- **Why shadcn/ui**: Consistent design system with Tailwind, customizable components
- **Why App Router**: Better performance, SEO optimization for property listings, and streaming
- **Why TypeScript**: Type safety for complex data models and API integration

### Database Structure
The app uses Supabase with three main tables:

#### Properties Table
- Basic info: title, description, price, type (sale/rent)
- Details: bedrooms, bathrooms, area, features (JSON array)
- Location: address, neighborhood
- Media: image URLs from Cloudinary
- Status: active, pending, sold, rented
- Timestamps: created_at, updated_at

#### Leads Table
- Contact info: name, email, phone
- Interest: property_id (nullable), message, source
- CRM fields: status, assigned_to, notes, priority
- Tracking: utm_source, utm_campaign
- Timestamps: created_at, updated_at, last_contact

#### Profiles Table
- User accounts: email, name, role (admin, agent)
- Settings: notifications, preferences
- Contact info: phone, company info

### Key Architecture Patterns

**Client Configuration**: Supabase client is configured in `lib/supabase.ts` with both public and admin clients. Environment variables are validated at runtime.

**Authentication**: Currently disabled in middleware.ts for development. Admin routes are protected when authentication is enabled. Uses Supabase Auth with email/password.

**Image Handling**: Cloudinary integration split between client (`lib/cloudinary.ts`) and server (`lib/cloudinary-server.ts`) implementations. Images are uploaded to Cloudinary and URLs stored in database.

**Data Fetching**: API routes follow RESTful patterns in `app/api/` with dedicated services in `services/` directory. Uses React Query patterns for data fetching in components.

**Error Handling**: Consistent error handling with try-catch in API routes, user-friendly error messages in Spanish.

### Directory Structure

- `app/` - Next.js App Router pages and API routes
  - `admin/` - Admin panel pages (properties, contacts, dashboard, settings)
  - `api/` - REST API endpoints for CRUD operations
  - `propiedades/` - Public property listings and detail pages
- `components/` - Reusable React components
  - `admin/` - Admin-specific components (forms, tables, dashboards)
  - `ui/` - shadcn/ui components (buttons, dialogs, forms)
- `hooks/` - Custom React hooks for data fetching and UI logic
- `services/` - Data access layer for properties, leads, and users
- `lib/` - Utilities and third-party service configurations
- `types/` - TypeScript type definitions

### State Management
- React Hook Form for form state management
- Custom hooks (useContacts, useContactActions, useProperties) for server state
- Context API for theme management
- No global state management library (Redux/Zustand)

## Code Conventions

### General Conventions
- All user-facing text in Spanish
- Use kebab-case for file names (`property-form.tsx`)
- Components use PascalCase (`PropertyForm`)
- Custom hooks start with 'use' (`usePropertyForm`)
- Constants in UPPER_SNAKE_CASE
- API routes follow RESTful patterns (`/api/properties`, `/api/leads`)

### Component Patterns
- Functional components with TypeScript
- Props interfaces named `ComponentNameProps`
- Use `'use client'` directive for client components
- Destructure props in component signature
- Use early returns for loading/error states

### Error Handling
- Try-catch blocks in all API routes
- User-friendly error messages in Spanish
- Console logging for development debugging
- Graceful fallbacks for failed data fetching

### Styling
- Tailwind CSS utility classes
- shadcn/ui components for consistency
- Custom CSS only when necessary
- Dark mode support via next-themes
- Responsive design mobile-first

## Data Models

### Property Interface
```typescript
interface Property {
  id: number
  title: string
  description: string
  price: number
  type: 'sale' | 'rent'
  category: 'house' | 'apartment' | 'commercial'
  bedrooms: number
  bathrooms: number
  area: number
  features: string[]
  address: string
  neighborhood: string
  images: string[]
  status: 'active' | 'pending' | 'sold' | 'rented'
  created_at: string
  updated_at: string
}
```

### Lead Interface
```typescript
interface Lead {
  id: number
  name: string
  email: string
  phone?: string
  property_id?: number
  message: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  priority: 'low' | 'medium' | 'high'
  assigned_to?: string
  notes?: string
  created_at: string
  updated_at: string
  last_contact?: string
}
```

## User Personas & Workflows

### Admin Users (Real Estate Agents)
**Key Workflows:**
1. **Property Management**: Add, edit, delete properties with images
2. **Lead Management**: View, assign, follow up on customer inquiries
3. **Dashboard Analytics**: Track property views, lead conversion rates
4. **Settings Management**: Configure notifications, profile settings

### Public Users (Potential Buyers/Renters)
**Key Workflows:**
1. **Property Search**: Filter by price, location, type, features
2. **Property Details**: View images, descriptions, contact info
3. **Contact Forms**: Submit inquiries about specific properties
4. **Favorites**: Save properties for later (future feature)

## Common Development Tasks

### Adding a New Property Field
1. Update the database schema in Supabase dashboard
2. Add field to `Property` interface in `types/property.ts`
3. Update `PropertyForm` component validation schema
4. Add field to property service functions in `services/properties.ts`
5. Update admin property list/detail components

### Creating New Admin Pages
1. Create page file in `app/admin/[page]/page.tsx`
2. Use `'use client'` directive for interactive components
3. Import and use admin layout components
4. Implement proper loading states with Suspense
5. Add navigation link in admin sidebar

### Adding New API Endpoints
1. Create route file in `app/api/[endpoint]/route.ts`
2. Export named functions for HTTP methods (GET, POST, PUT, DELETE)
3. Use consistent error handling patterns
4. Validate request data with Zod schemas
5. Return JSON responses with proper status codes

### Integrating New UI Components
1. Install via shadcn/ui CLI when available
2. Create custom components in `components/ui/` following shadcn patterns
3. Use Tailwind utilities for styling
4. Ensure dark mode compatibility
5. Add proper TypeScript interfaces

## Known Issues & Limitations

### Current Development State
- **Authentication temporarily disabled** (middleware.ts) - Enable for production
- **TypeScript strict mode disabled** for builds to handle legacy code
- **ESLint warnings ignored** during builds via next.config.mjs
- **Image optimization disabled** in next.config.js for compatibility

### Development Gotchas
- Development server may need restart after environment variable changes
- Supabase client requires proper environment variable setup
- Cloudinary uploads require both client and server API keys
- Hot reload might not work with some shadcn/ui components

### Production Considerations
- Enable authentication middleware before deployment
- Set up proper error monitoring (Sentry recommended)
- Configure image optimization for production
- Set up database backups and migration strategy
- Implement rate limiting for API endpoints

## Testing & Deployment

### Current Setup
- **No automated tests** currently implemented
- **Manual testing** workflow for features
- **Deploys to Vercel** automatically from main branch
- **Database migrations** handled manually in Supabase dashboard

### Recommended Testing Strategy
1. Unit tests for utility functions and services
2. Integration tests for API endpoints
3. E2E tests for critical user workflows
4. Visual regression tests for UI components

### Deployment Pipeline
1. **Development**: Local development with `.env.local`
2. **Staging**: Preview deployments on Vercel
3. **Production**: Automatic deployment from main branch
4. **Database**: Manual schema updates in Supabase
5. **Images**: Automatic CDN deployment via Cloudinary

## Performance Considerations

### Current Optimizations
- Next.js App Router for better performance
- Image optimization via Cloudinary
- Server-side rendering for property listings
- Static generation for marketing pages

### Future Improvements
- Implement caching strategy for property data
- Add image lazy loading and progressive enhancement
- Optimize bundle size with dynamic imports
- Implement service worker for offline functionality

## Security Notes

### Current Security Measures
- Supabase Row Level Security (RLS) policies
- Environment variables for sensitive data
- HTTPS enforced in production
- Input validation with Zod schemas

### Security TODOs
- Implement rate limiting for contact forms
- Add CSRF protection for admin forms
- Set up proper CORS policies
- Implement file upload validation
- Add audit logging for admin actions

## Helpful Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
