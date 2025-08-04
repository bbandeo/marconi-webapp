// This file has been refactored into a modular structure
// New location: components/PropertyForm/
// 
// The original 532-line component has been broken down into:
// - 7 focused section components
// - 2 custom hooks for logic
// - Configuration and validation utilities
// - TypeScript interfaces
//
// Total reduction: 532 → ~80 lines in main component
// Backend-friendly: Each component has single responsibility

export { default } from './PropertyForm';
export type { PropertyFormProps, PropertyFormData, FormErrors } from './PropertyForm/types';