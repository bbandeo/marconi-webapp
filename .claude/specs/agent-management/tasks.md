# Implementation Tasks - Agent Management System

## Overview
This document contains the implementation tasks for the agent management feature. Each task should be completed sequentially, building upon the previous tasks. All tasks focus on writing, modifying, or testing code.

---

- [ ] 1. Create database migration script for agents table
  - Create `scripts/create-agents-table.sql` with the complete SQL schema
  - Include table creation, indexes, and updated_at trigger function
  - Ensure all fields match the design document specification
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2_

- [ ] 2. Extend TypeScript type definitions in Supabase configuration
  - Update `lib/supabase.ts` to add `agents` table to the `Database` interface
  - Include `Row`, `Insert`, and `Update` types for the agents table
  - Export `Agent`, `AgentInsert`, and `AgentUpdate` type aliases
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Create agent type definitions and validation schemas
  - Create `types/agent.ts` file
  - Implement Zod schema `agentFormSchema` with all validation rules
  - Include Spanish error messages for each validation rule
  - Define `AgentFormData` type from Zod schema inference
  - Define `AgentWithPhoto` interface extending `Agent` type
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 4. Implement AgentService class for data operations
  - Create `services/agents.ts` file
  - Implement `getActiveAgents()` method to fetch only active agents for public display
  - Implement `getAllAgents()` method to fetch all agents for admin view
  - Implement `getAgentById(id)` method with null handling for non-existent agents
  - Implement `createAgent(agent)` method with duplicate email error handling
  - Implement `updateAgent(id, updates)` method with duplicate email error handling
  - Implement `deleteAgent(id)` method for soft delete (set active = false)
  - Implement `hardDeleteAgent(id)` method for complete removal
  - Follow the established pattern from `services/properties.ts`
  - _Requirements: 1.2, 1.4, 1.7, 1.9, 6.2, 6.3, 6.4_

- [ ] 5. Create API route for agent collection operations
  - Create `app/api/agents/route.ts` file
  - Implement GET handler that accepts `?active=true` query parameter
  - GET should return all agents or only active agents based on query param
  - Implement POST handler for creating new agents
  - Handle errors and return appropriate status codes (200, 201, 400, 500)
  - Include proper error messages in Spanish
  - Use AgentService methods for all database operations
  - _Requirements: 1.1, 1.3, 1.4, 6.2, 6.4_

- [ ] 6. Create API route for individual agent operations
  - Create `app/api/agents/[id]/route.ts` file
  - Implement GET handler to fetch single agent by ID
  - Return 404 if agent not found
  - Implement PUT handler to update existing agent
  - Implement DELETE handler that removes agent photo from Cloudinary before soft deleting
  - DELETE should retrieve agent, extract `photo_public_id`, call `deleteFromCloudinary`, then call `AgentService.deleteAgent`
  - Handle all errors appropriately with Spanish messages
  - _Requirements: 1.6, 1.7, 1.8, 1.9, 4.4, 4.5, 6.4_

- [ ] 7. Create AgentForm component for create/edit operations
  - Create `components/admin/AgentForm.tsx` file
  - Use React Hook Form with `zodResolver` and `agentFormSchema`
  - Implement form fields: name, email, phone, whatsapp, bio, specialty, years_of_experience
  - Add file input for photo upload with client-side preview
  - Show preview of existing photo when editing an agent
  - Display validation errors in Spanish below each field
  - Implement image upload to `/api/upload` endpoint before submitting agent data
  - Pre-fill form values when `agent` prop is provided (edit mode)
  - Call `onSubmit` prop with validated form data including photo URLs
  - Call `onCancel` prop when cancel button is clicked
  - Use shadcn/ui components (Input, Textarea, Label, Button)
  - _Requirements: 1.3, 1.6, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.3, 7.4, 7.5_

- [ ] 8. Create AgentsPage admin component for agent management
  - Create `components/admin/AgentsPage.tsx` file
  - Implement state management for agents list, loading, search term, and modal state
  - Fetch all agents from `/api/agents` on component mount
  - Implement search functionality filtering agents by name or email
  - Display agents in a card layout showing photo, name, email, phone, and status
  - Add "Crear Agente" button that opens modal with AgentForm
  - Add Edit button per agent that opens modal with pre-filled AgentForm
  - Add Delete button per agent with confirmation dialog before deletion
  - Implement handleCreate function that uploads photo then posts to `/api/agents`
  - Implement handleUpdate function that uploads new photo (if changed) then puts to `/api/agents/[id]`
  - Implement handleDelete function that calls DELETE `/api/agents/[id]`
  - Show toast notifications for success/error feedback
  - Include loading states while fetching or submitting data
  - Use shadcn/ui components (Button, Input, Card, Badge, Dialog/Modal)
  - Follow the pattern established in `components/admin/PropertiesPage.tsx`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 9. Create admin page route for agent management
  - Create `app/admin/agents/page.tsx` file
  - Import and render `AgentsPage` component
  - Follow the pattern from `app/admin/properties/page.tsx`
  - _Requirements: 1.1, 1.2_

- [ ] 10. Create AgentCard component for public display
  - Create `components/AgentCard.tsx` file
  - Display agent photo with Cloudinary optimization using `getOptimizedImageUrl`
  - Show placeholder image if no photo is provided
  - Display agent name, specialty, and years of experience
  - Display bio text (with truncation if too long)
  - Add contact buttons: Email (mailto:), Phone (tel:), WhatsApp (deep link)
  - Only show WhatsApp button if `whatsapp` field is present
  - Use shadcn/ui Card component
  - Apply responsive styling and hover effects
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 4.6_

- [ ] 11. Create public agents page
  - Create `app/agentes/page.tsx` file
  - Implement as Server Component fetching data with `AgentService.getActiveAgents()`
  - Create header section with title "Nuestro Equipo" and description
  - Display agents in responsive grid: 1 column (mobile), 2 (tablet), 3 (desktop), 4 (xl)
  - Render `AgentCard` component for each agent
  - Show empty state message if no agents exist
  - Use Tailwind CSS for styling consistent with site design
  - _Requirements: 3.1, 3.2, 3.6, 3.7, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 12. Update admin navigation to include Agentes link
  - Update `components/admin/AdminLayout.tsx`
  - Add new navigation item to `navigation` array: `{ name: "Agentes", href: "/admin/agents", icon: Users }`
  - Import `Users` icon from lucide-react if not already imported
  - Verify navigation item appears in both desktop sidebar and mobile sheet
  - _Requirements: 7.1_

- [ ] 13. Write unit tests for AgentService
  - Create `services/agents.test.ts` file
  - Test `createAgent` with valid data returns created agent
  - Test `createAgent` with duplicate email throws appropriate error
  - Test `getAgentById` with existing ID returns agent
  - Test `getAgentById` with non-existent ID returns null
  - Test `getActiveAgents` returns only agents where active = true
  - Test `getAllAgents` returns all agents regardless of active status
  - Test `updateAgent` with valid data returns updated agent
  - Test `deleteAgent` sets active to false (soft delete)
  - Mock Supabase client for all tests
  - _Requirements: 1.2, 1.4, 1.7, 1.9, 6.2_

- [ ] 14. Write integration tests for API routes
  - Create `app/api/agents/route.test.ts` file
  - Test GET `/api/agents` returns all agents
  - Test GET `/api/agents?active=true` returns only active agents
  - Test POST `/api/agents` creates new agent and returns 201
  - Test POST `/api/agents` with duplicate email returns 409 error
  - Create `app/api/agents/[id]/route.test.ts` file
  - Test GET `/api/agents/[id]` returns specific agent
  - Test GET `/api/agents/[id]` with invalid ID returns 404
  - Test PUT `/api/agents/[id]` updates agent
  - Test DELETE `/api/agents/[id]` removes agent and returns success
  - Mock AgentService and Cloudinary functions
  - _Requirements: 1.1, 1.3, 1.4, 1.6, 1.7, 1.8, 1.9, 6.2, 6.4_

- [ ] 15. Write component tests for AgentForm
  - Create `components/admin/AgentForm.test.tsx` file
  - Test component renders all form fields (name, email, phone, whatsapp, bio, specialty, years_of_experience, photo)
  - Test validation errors appear when submitting with invalid data
  - Test Spanish error messages are displayed correctly
  - Test form pre-fills with agent data in edit mode
  - Test image upload triggers preview
  - Test onSubmit is called with validated data when form is valid
  - Test onCancel is called when cancel button is clicked
  - Use React Testing Library
  - _Requirements: 1.3, 1.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.3, 7.4_

- [ ] 16. Write component tests for AgentsPage
  - Create `components/admin/AgentsPage.test.tsx` file
  - Test component shows loading state initially
  - Test component displays agent list after data loads
  - Test "Crear Agente" button opens create modal
  - Test search input filters agents by name
  - Test search input filters agents by email
  - Test Edit button opens modal with pre-filled form
  - Test Delete button shows confirmation dialog
  - Test successful create shows success toast
  - Test failed API call shows error toast
  - Mock fetch API and AgentService
  - Use React Testing Library
  - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.8, 7.1, 7.2, 7.5, 7.6_
