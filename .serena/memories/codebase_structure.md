# Codebase Structure

## Directory Structure
```
app/                    - Next.js App Router pages and API routes
├── admin/             - Admin panel pages (properties, contacts, dashboard) 
├── api/               - REST API endpoints
└── propiedades/       - Public property listings

components/            - Reusable React components
├── admin/             - Admin-specific components
└── ui/                - shadcn/ui components

hooks/                 - Custom React hooks for data fetching and UI logic
services/              - Data access layer for properties and leads
lib/                   - Utilities and third-party service configurations
styles/                - CSS and styling files
public/                - Static assets
```

## Key Files
- `middleware.ts` - Authentication middleware (currently disabled)
- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - shadcn/ui configuration
- `CLAUDE.md` - Project instructions for Claude Code

## Architecture Patterns
- App Router for routing and API routes
- Component-based architecture with shadcn/ui
- Custom hooks for data fetching
- Service layer for data access
- Separation of client/server code for external services