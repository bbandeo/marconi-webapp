# Requirements Document - Agent Management

## Introduction

This feature introduces a comprehensive agent management system for Marconi Inmobiliaria. The system will enable administrators to create, modify, and delete real estate agents through an admin interface at `/admin`, while displaying these agents publicly on the `/agentes` page. This addresses the need for dynamic agent roster management without requiring code deployments.

## Requirements

### Requirement 1: Agent CRUD Operations in Admin Panel

**User Story:** As an administrator, I want to create, read, update, and delete agent profiles from the admin panel, so that I can manage the Marconi agent roster without technical assistance.

#### Acceptance Criteria

1. WHEN the administrator navigates to `/admin` THEN the system SHALL display an "Agentes" section in the admin navigation
2. WHEN the administrator accesses the agents management page THEN the system SHALL display a list of all existing agents
3. WHEN the administrator clicks "Crear Agente" THEN the system SHALL display a form to create a new agent profile
4. WHEN the administrator submits a valid agent creation form THEN the system SHALL save the agent to the database AND display a success confirmation
5. IF the agent creation form has validation errors THEN the system SHALL display error messages AND prevent submission
6. WHEN the administrator clicks "Editar" on an existing agent THEN the system SHALL display a pre-filled form with the agent's current data
7. WHEN the administrator submits valid changes to an agent THEN the system SHALL update the agent in the database AND display a success confirmation
8. WHEN the administrator clicks "Eliminar" on an agent THEN the system SHALL prompt for confirmation before deletion
9. WHEN the administrator confirms agent deletion THEN the system SHALL remove the agent from the database AND update the agent list

### Requirement 2: Agent Data Model

**User Story:** As a system, I need to store comprehensive agent information, so that both admin and public interfaces can display complete agent profiles.

#### Acceptance Criteria

1. WHEN an agent is created THEN the system SHALL require the following mandatory fields: name, email, phone
2. WHEN an agent is created THEN the system SHALL accept the following optional fields: photo, bio, specialty, years_of_experience, WhatsApp number
3. WHEN an agent photo is uploaded THEN the system SHALL store it using Cloudinary integration
4. WHEN storing agent data THEN the system SHALL include timestamps for created_at and updated_at
5. WHEN storing agent data THEN the system SHALL generate a unique identifier (id) for each agent
6. IF an email address is already in use THEN the system SHALL reject the agent creation AND display an error message

### Requirement 3: Public Agent Display

**User Story:** As a website visitor, I want to view all Marconi agents on the `/agentes` page, so that I can learn about the team and contact them.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/agentes` THEN the system SHALL display all active agents
2. WHEN displaying agents THEN the system SHALL show each agent's photo, name, specialty, and contact information
3. WHEN an agent has a bio THEN the system SHALL display it on their profile
4. WHEN an agent has a WhatsApp number THEN the system SHALL provide a WhatsApp contact button
5. WHEN an agent has years of experience data THEN the system SHALL display it
6. WHEN there are no agents in the database THEN the system SHALL display an appropriate empty state message
7. WHEN agents are displayed THEN the system SHALL order them by creation date (newest first) OR by a custom sort order if implemented

### Requirement 4: Image Management

**User Story:** As an administrator, I want to upload and manage agent photos, so that the public page displays professional agent images.

#### Acceptance Criteria

1. WHEN the administrator uploads an agent photo THEN the system SHALL accept common image formats (JPG, PNG, WebP)
2. WHEN an image is uploaded THEN the system SHALL validate the file size is under 5MB
3. WHEN an image is uploaded THEN the system SHALL store it in Cloudinary
4. WHEN an agent is deleted THEN the system SHALL remove the associated photo from Cloudinary
5. WHEN an agent photo is updated THEN the system SHALL delete the old photo from Cloudinary AND upload the new one
6. IF no photo is provided THEN the system SHALL display a default placeholder image

### Requirement 5: Form Validation and Error Handling

**User Story:** As an administrator, I want clear validation and error messages, so that I can correct issues when creating or editing agents.

#### Acceptance Criteria

1. WHEN the name field is empty THEN the system SHALL display "El nombre es requerido"
2. WHEN the email field is empty OR invalid THEN the system SHALL display "El email es requerido y debe ser válido"
3. WHEN the phone field is empty OR invalid THEN the system SHALL display "El teléfono es requerido"
4. WHEN the photo upload fails THEN the system SHALL display an error message AND maintain form data
5. WHEN a database error occurs THEN the system SHALL display a user-friendly error message
6. WHEN the form has multiple errors THEN the system SHALL display all validation errors simultaneously

### Requirement 6: Database Integration

**User Story:** As a system, I need to persist agent data in Supabase, so that agent information is stored reliably and accessible to both admin and public interfaces.

#### Acceptance Criteria

1. WHEN the application initializes THEN the system SHALL create an `agents` table in Supabase if it doesn't exist
2. WHEN agent data is modified THEN the system SHALL use Supabase client to perform database operations
3. WHEN fetching agents for display THEN the system SHALL use the existing Supabase service layer pattern
4. WHEN a database operation fails THEN the system SHALL handle the error gracefully AND notify the user
5. WHEN querying agents for the public page THEN the system SHALL only retrieve active/published agents

### Requirement 7: Admin Interface UI/UX

**User Story:** As an administrator, I want an intuitive and consistent admin interface for agent management, so that I can manage agents efficiently.

#### Acceptance Criteria

1. WHEN the admin accesses the agents page THEN the system SHALL display agents in a table OR card layout consistent with existing admin pages
2. WHEN displaying the agent list THEN the system SHALL show agent photo thumbnails, name, email, and action buttons
3. WHEN the administrator interacts with forms THEN the system SHALL use shadcn/ui components consistent with the existing design system
4. WHEN the administrator creates or edits an agent THEN the system SHALL display the form in a modal OR dedicated page
5. WHEN a CRUD operation completes THEN the system SHALL provide visual feedback (success toast, loading states)
6. WHEN the page loads THEN the system SHALL display loading states while fetching agent data

### Requirement 8: Responsive Design for Public Page

**User Story:** As a mobile visitor, I want the `/agentes` page to work well on my device, so that I can view agent profiles on any screen size.

#### Acceptance Criteria

1. WHEN viewing `/agentes` on mobile devices THEN the system SHALL display agents in a single-column layout
2. WHEN viewing `/agentes` on tablet devices THEN the system SHALL display agents in a two-column grid
3. WHEN viewing `/agentes` on desktop devices THEN the system SHALL display agents in a three-column OR four-column grid
4. WHEN viewing on any device THEN the system SHALL ensure agent photos are properly sized and optimized
5. WHEN viewing on any device THEN the system SHALL ensure contact buttons are easily tappable/clickable
