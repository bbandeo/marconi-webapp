# Task Completion Guidelines

## After Code Changes
1. **Run linting**: `pnpm lint` (though errors are ignored in builds)
2. **Test locally**: `pnpm dev` to verify changes work
3. **Build check**: `pnpm build` to ensure production build succeeds

## Quality Checks
- Verify TypeScript types are correct
- Ensure responsive design works on different screen sizes
- Test dark theme compatibility (default theme)
- Verify Spanish text content is appropriate
- Check that Supabase queries work correctly

## Important Notes
- TypeScript errors don't block builds (configured in next.config.mjs)
- ESLint errors don't block builds
- Images are unoptimized for compatibility
- Authentication is disabled during development

## Testing Approach
- Manual testing via development server
- No automated test suite configured
- Focus on visual testing and functionality verification
- Test admin panel and public site separately

## Deployment
- Application deploys to Vercel
- Environment variables need to be configured for production
- Supabase connection required for database features