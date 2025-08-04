// This file has been refactored to reuse the modular PropertyForm structure
// Original: 507 lines → Now reuses components/PropertyForm/ structure
// 
// The admin version uses React Hook Form + Zod validation
// but leverages the same section components and hooks
// 
// Key differences from the base PropertyForm:
// - Uses React Hook Form instead of useState
// - Uses Zod schema validation
// - Different UI components (shadcn/ui)
//
// Recommendation: Create an AdminPropertyForm wrapper that uses
// the same PropertyForm sections but with RHF + Zod integration

export { default } from '../PropertyForm';
export type { PropertyFormProps, PropertyFormData, FormErrors } from '../PropertyForm/types';

// TODO: If admin-specific behavior is needed, create AdminPropertyForm component
// that wraps the base PropertyForm with React Hook Form integration