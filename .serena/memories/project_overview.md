# Marconi Inmobiliaria - Project Overview

## Purpose
Marconi Inmobiliaria is a Spanish real estate platform built with Next.js 15, featuring:
- Public property listing site
- Comprehensive admin panel for property and lead management
- Originally created with v0.dev and deploys to Vercel

## Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Database**: Supabase (authentication + database)
- **Styling**: Tailwind CSS + shadcn/ui components + Radix UI primitives
- **Images**: Cloudinary for image management
- **Forms**: React Hook Form + Zod validation
- **Themes**: Next Themes for dark/light mode (default: dark)

## Database Structure
Three main Supabase tables:
- **properties** - Real estate listings with images, features, pricing
- **leads** - Contact forms and customer inquiries with CRM features  
- **profiles** - User accounts and roles

## Key Patterns
- Client Configuration: Supabase client in `lib/supabase.ts` (public + admin clients)
- Authentication: Currently disabled in middleware.ts for development
- Image Handling: Split between client (`lib/cloudinary.ts`) and server (`lib/cloudinary-server.ts`)
- Data Fetching: RESTful API routes in `app/api/` with services in `services/`
- State Management: React Hook Form + custom hooks (no global state library)

## Content Language
All text content is in Spanish.