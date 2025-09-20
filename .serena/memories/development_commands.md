# Development Commands

## Core Commands
- `pnpm dev` - Start development server (runs on 0.0.0.0:5000)
- `pnpm local` - Start development server locally 
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint (Note: disabled during builds via next.config.mjs)

## System Information
- Platform: Windows (MINGW64_NT-10.0-26100)
- Package Manager: pnpm
- Git: Available and configured

## Important Notes
- TypeScript and ESLint errors are ignored during builds (configured in next.config.mjs)
- Images are unoptimized (configured for compatibility)
- Authentication is temporarily bypassed in middleware.ts