// This file has been refactored into a modular structure
// New location: components/admin/properties-page/
// 
// The original 499-line component has been broken down into:
// - 1 custom hook for data management (usePropertiesData)
// - 1 utilities file for helper functions
// - 6 focused UI components (Header, Stats, Filters, Table, etc.)
// - 1 main orchestrator component
//
// Total reduction: 499 → ~70 lines in main component
// Backend-friendly: Clear separation of data, logic, and presentation

export { default } from './properties-page';