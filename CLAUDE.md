# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Marconi Inmobiliaria**, a Spanish real estate platform built with Next.js 15, featuring a public property listing site and a comprehensive admin panel for property and lead management. The application is originally created with v0.dev and deploys to Vercel.

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

### Database Structure
The app uses Supabase with three main tables:
- **properties** - Real estate listings with images, features, pricing
- **leads** - Contact forms and customer inquiries with CRM features
- **profiles** - User accounts and roles

### Key Architecture Patterns

**Client Configuration**: Supabase client is configured in `lib/supabase.ts` with both public and admin clients. Environment variables are validated at runtime.

**Authentication**: Currently disabled in middleware.ts for development. Admin routes are protected when authentication is enabled.

**Image Handling**: Cloudinary integration split between client (`lib/cloudinary.ts`) and server (`lib/cloudinary-server.ts`) implementations.

**Data Fetching**: API routes follow RESTful patterns in `app/api/` with dedicated services in `services/` directory.

### Directory Structure

- `app/` - Next.js App Router pages and API routes
  - `admin/` - Admin panel pages (properties, contacts, dashboard)
  - `api/` - REST API endpoints
  - `propiedades/` - Public property listings
- `components/` - Reusable React components
  - `admin/` - Admin-specific components
  - `ui/` - shadcn/ui components
- `hooks/` - Custom React hooks for data fetching and UI logic
- `services/` - Data access layer for properties and leads
- `lib/` - Utilities and third-party service configurations

### State Management
- React Hook Form for form state
- Custom hooks (useContacts, useContactActions, etc.) for data fetching
- No global state management library

## Important Notes

- TypeScript and ESLint errors are ignored during builds (configured in next.config.mjs)
- Images are unoptimized (configured for compatibility)
- Authentication is temporarily bypassed in middleware.ts
- All text content is in Spanish
- Dark theme is default via app/layout.tsx