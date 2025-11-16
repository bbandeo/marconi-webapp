# Coding Conventions and Style

## TypeScript Standards
- Strict TypeScript enabled
- Interface definitions for data types
- Type imports using `type` keyword
- Optional chaining and nullish coalescing used extensively

## React Patterns
- Functional components with hooks
- Custom hooks for data fetching and business logic
- Props interfaces defined inline or as separate types
- Event handlers use arrow functions

## Naming Conventions
- Components: PascalCase (e.g., `PropiedadesPage`, `PropertyCard`)
- Files: kebab-case for general files, PascalCase for components
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- API routes: lowercase with hyphens

## Code Style
- 2-space indentation
- Semicolons used
- Template literals preferred over string concatenation
- Destructuring used extensively
- Early returns for conditionals

## Component Structure
1. Imports (React, external libraries, internal components, types)
2. Interface/type definitions
3. Component function
4. Event handlers and effects
5. Helper functions
6. Return statement with JSX

## State Management
- useState for local component state
- useEffect for side effects and data fetching
- Custom hooks for reusable logic
- No global state management library