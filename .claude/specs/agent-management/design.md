# Design Document - Agent Management System

## Overview

This design document outlines the architecture for implementing a comprehensive agent management system for Marconi Inmobiliaria. The system enables administrators to manage real estate agent profiles through a dedicated admin interface at `/admin/agents`, while displaying these agents publicly at `/agentes`. The design follows the existing architectural patterns established in the codebase, leveraging Next.js 15 App Router, Supabase for data persistence, Cloudinary for image management, and shadcn/ui components for the interface.

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Public Page (/agentes)     Admin Page (/admin/agents)      │
│  - AgentsPublicPage.tsx     - AgentsPage.tsx                │
│  - AgentCard.tsx            - AgentForm.tsx                 │
│                             - AgentList.tsx                  │
└──────────────────┬─────────────────────┬────────────────────┘
                   │                     │
                   ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Routes Layer                         │
├─────────────────────────────────────────────────────────────┤
│  /api/agents (GET, POST)                                    │
│  /api/agents/[id] (GET, PUT, DELETE)                        │
│  /api/upload (POST) - existing                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
├─────────────────────────────────────────────────────────────┤
│  services/agents.ts                                         │
│  - AgentService class with CRUD operations                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data & External Services                    │
├─────────────────────────────────────────────────────────────┤
│  Supabase (agents table)    Cloudinary (agent photos)       │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Alignment

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase PostgreSQL
- **Image Storage**: Cloudinary
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Type Safety**: TypeScript

## Components and Interfaces

### 1. Database Schema

#### Agents Table (Supabase)

```sql
CREATE TABLE agents (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50),
  photo_url TEXT,
  photo_public_id VARCHAR(255),
  bio TEXT,
  specialty VARCHAR(255),
  years_of_experience INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agents_email ON agents(email);
CREATE INDEX idx_agents_active ON agents(active);
```

**Design Rationale**:
- `photo_public_id` stores Cloudinary identifier for deletion/replacement
- `active` flag allows soft deletion and filtering for public display
- Indexes on `email` and `active` for query optimization
- `updated_at` with trigger for automatic timestamp updates

### 2. TypeScript Types

#### Location: `lib/supabase.ts` (extend existing Database interface)

```typescript
// Add to existing Database interface
agents: {
  Row: {
    id: number
    name: string
    email: string
    phone: string
    whatsapp: string | null
    photo_url: string | null
    photo_public_id: string | null
    bio: string | null
    specialty: string | null
    years_of_experience: number | null
    active: boolean
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: number
    name: string
    email: string
    phone: string
    whatsapp?: string | null
    photo_url?: string | null
    photo_public_id?: string | null
    bio?: string | null
    specialty?: string | null
    years_of_experience?: number | null
    active?: boolean
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: number
    name?: string
    email?: string
    phone?: string
    whatsapp?: string | null
    photo_url?: string | null
    photo_public_id?: string | null
    bio?: string | null
    specialty?: string | null
    years_of_experience?: number | null
    active?: boolean
    created_at?: string
    updated_at?: string
  }
}

// Export types
export type Agent = Database["public"]["Tables"]["agents"]["Row"]
export type AgentInsert = Database["public"]["Tables"]["agents"]["Insert"]
export type AgentUpdate = Database["public"]["Tables"]["agents"]["Update"]
```

#### Location: `types/agent.ts` (new file)

```typescript
import { z } from "zod"

// Zod validation schema
export const agentFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("El email debe ser válido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  whatsapp: z.string().optional(),
  bio: z.string().optional(),
  specialty: z.string().optional(),
  years_of_experience: z.number().int().min(0).optional(),
  photo: z.instanceof(File).optional()
})

export type AgentFormData = z.infer<typeof agentFormSchema>

// Client-side agent with additional display fields
export interface AgentWithPhoto extends Agent {
  photoFile?: File
}
```

### 3. Service Layer

#### Location: `services/agents.ts` (new file)

Following the established pattern from `services/properties.ts`:

```typescript
import { supabase, type Agent, type AgentInsert, type AgentUpdate } from "@/lib/supabase"

export class AgentService {
  /**
   * Get all active agents for public display
   */
  static async getActiveAgents(): Promise<Agent[]> {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Error fetching active agents: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get all agents (admin view)
   */
  static async getAllAgents(): Promise<Agent[]> {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Error fetching agents: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get agent by ID
   */
  static async getAgentById(id: number): Promise<Agent | null> {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw new Error(`Error fetching agent: ${error.message}`)
    }

    return data
  }

  /**
   * Create new agent
   */
  static async createAgent(agent: AgentInsert): Promise<Agent> {
    const { data, error } = await supabase
      .from("agents")
      .insert([agent])
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("El email ya está registrado")
      }
      throw new Error(`Error creating agent: ${error.message}`)
    }

    return data
  }

  /**
   * Update existing agent
   */
  static async updateAgent(id: number, updates: AgentUpdate): Promise<Agent> {
    const { data, error } = await supabase
      .from("agents")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("El email ya está registrado")
      }
      throw new Error(`Error updating agent: ${error.message}`)
    }

    return data
  }

  /**
   * Delete agent (soft delete by setting active = false)
   */
  static async deleteAgent(id: number): Promise<void> {
    const { error } = await supabase
      .from("agents")
      .update({ active: false })
      .eq("id", id)

    if (error) {
      throw new Error(`Error deleting agent: ${error.message}`)
    }
  }

  /**
   * Hard delete agent (for complete removal)
   */
  static async hardDeleteAgent(id: number): Promise<void> {
    const { error } = await supabase
      .from("agents")
      .delete()
      .eq("id", id)

    if (error) {
      throw new Error(`Error deleting agent: ${error.message}`)
    }
  }
}
```

**Design Decisions**:
- Soft delete by default (`deleteAgent`) to preserve data integrity
- Hard delete available if needed (`hardDeleteAgent`)
- Specific error handling for unique constraint violations (duplicate emails)
- Consistent error message patterns matching existing services

### 4. API Routes

#### Location: `app/api/agents/route.ts` (new file)

```typescript
import { type NextRequest, NextResponse } from "next/server"
import { AgentService } from "@/services/agents"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"

    const agents = activeOnly
      ? await AgentService.getActiveAgents()
      : await AgentService.getAllAgents()

    return NextResponse.json({ agents })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch agents" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const agent = await AgentService.createAgent(body)

    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create agent" },
      { status: 500 }
    )
  }
}
```

#### Location: `app/api/agents/[id]/route.ts` (new file)

```typescript
import { type NextRequest, NextResponse } from "next/server"
import { AgentService } from "@/services/agents"
import { deleteFromCloudinary } from "@/lib/cloudinary-server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await AgentService.getAgentById(Number(params.id))

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json(agent)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to fetch agent" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const agent = await AgentService.updateAgent(Number(params.id), body)

    return NextResponse.json(agent)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update agent" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get agent to retrieve photo_public_id
    const agent = await AgentService.getAgentById(Number(params.id))

    // Delete from Cloudinary if photo exists
    if (agent?.photo_public_id) {
      await deleteFromCloudinary(agent.photo_public_id)
    }

    // Soft delete from database
    await AgentService.deleteAgent(Number(params.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 })
  }
}
```

**Design Decisions**:
- Reuse existing `/api/upload` endpoint for image uploads
- DELETE endpoint handles Cloudinary cleanup before database deletion
- Consistent error handling and status codes
- Query parameter `?active=true` for filtering public agents

### 5. Admin Components

#### Location: `components/admin/AgentsPage.tsx` (new file)

**Pattern**: Based on `PropertiesPage.tsx`

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Edit, Trash2, Users, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import AgentForm from "./AgentForm"
import type { Agent } from "@/lib/supabase"

// Component structure:
// - State management for agents, loading, search, modal
// - useEffect for initial data fetching
// - CRUD operation handlers
// - Search/filter functionality
// - Card/table layout for agent list
// - Modal for create/edit form
```

**Key Features**:
- Card-based layout showing agent photo, name, email, phone
- Search functionality filtering by name/email
- "Crear Agente" button opening modal
- Edit/Delete actions per agent card
- Loading states and error handling
- Toast notifications for success/error feedback

#### Location: `components/admin/AgentForm.tsx` (new file)

**Pattern**: Form component using React Hook Form + Zod

```typescript
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { agentFormSchema, type AgentFormData } from "@/types/agent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Agent } from "@/lib/supabase"

interface AgentFormProps {
  agent?: Agent | null
  onSubmit: (data: AgentFormData) => Promise<void>
  onCancel: () => void
}

// Component structure:
// - React Hook Form setup with Zod validation
// - File upload handling for photo
// - Image preview functionality
// - Form fields: name, email, phone, whatsapp, bio, specialty, years_of_experience
// - Error display for validation
// - Submit/Cancel actions
```

**Key Features**:
- Client-side validation with Zod
- Image upload with preview
- Pre-filled values for edit mode
- Spanish validation messages
- Accessible form structure with labels

### 6. Public Components

#### Location: `app/agentes/page.tsx` (new file)

```typescript
import { AgentService } from "@/services/agents"
import AgentCard from "@/components/AgentCard"

export default async function AgentesPage() {
  const agents = await AgentService.getActiveAgents()

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header section */}
      <section className="py-20 bg-gradient-to-br from-brand-orange to-orange-600">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Nuestro Equipo
          </h1>
          <p className="text-xl text-white/90">
            Conoce a los profesionales de Marconi Inmobiliaria
          </p>
        </div>
      </section>

      {/* Agents grid */}
      <section className="container mx-auto px-4 py-16">
        {agents.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
```

#### Location: `components/AgentCard.tsx` (new file)

```typescript
"use client"

import { Mail, Phone, MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getOptimizedImageUrl } from "@/lib/cloudinary"
import type { Agent } from "@/lib/supabase"

interface AgentCardProps {
  agent: Agent
}

// Component structure:
// - Agent photo with fallback
// - Name and specialty
// - Years of experience badge
// - Bio text (truncated)
// - Contact buttons: Email, Phone, WhatsApp
// - Responsive card design
```

**Key Features**:
- Optimized images via Cloudinary
- WhatsApp deep link integration
- Email/phone contact buttons
- Responsive grid layout (1/2/3/4 columns)
- Framer Motion animations on hover

## Data Models

### Agent Data Flow

```
Form Input → Validation (Zod) → API Route → Service Layer → Supabase
                                    ↓
                              Cloudinary
                                    ↓
                              photo_url + public_id saved
```

### Image Upload Flow

```
1. User selects image in form
2. Image preview shown in browser
3. On form submit:
   a. Upload image to /api/upload
   b. Receive {url, public_id} from Cloudinary
   c. Include in agent data
   d. Submit to /api/agents
4. Service layer saves agent with photo_url and photo_public_id
```

### Agent Deletion Flow

```
1. Admin clicks delete
2. Confirmation dialog shown
3. On confirm:
   a. API retrieves agent to get photo_public_id
   b. Delete from Cloudinary using public_id
   c. Soft delete: set active = false
   d. Update UI
```

## Error Handling

### Client-Side Error Handling

```typescript
// Form validation errors
try {
  const validatedData = agentFormSchema.parse(formData)
} catch (error) {
  if (error instanceof z.ZodError) {
    // Display field-specific errors
    error.errors.forEach(err => {
      setError(err.path[0], { message: err.message })
    })
  }
}

// API call errors
try {
  const response = await fetch('/api/agents', { method: 'POST', body: JSON.stringify(data) })
  if (!response.ok) {
    const error = await response.json()
    toast({ title: "Error", description: error.error, variant: "destructive" })
  }
} catch (error) {
  toast({ title: "Error", description: "Error de conexión", variant: "destructive" })
}
```

### Server-Side Error Handling

```typescript
// Database errors
try {
  const agent = await AgentService.createAgent(data)
} catch (error) {
  if (error.message.includes("ya está registrado")) {
    return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 })
  }
  return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
}

// Image upload errors
try {
  const result = await uploadToCloudinary(buffer)
} catch (error) {
  return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 })
}
```

### Error Messages (Spanish)

| Error Type | Message |
|------------|---------|
| Required field | "El [campo] es requerido" |
| Invalid email | "El email debe ser válido" |
| Duplicate email | "El email ya está registrado" |
| Image too large | "La imagen debe ser menor a 5MB" |
| Network error | "Error de conexión. Intenta nuevamente" |
| Server error | "Error del servidor. Contacta al administrador" |

## Testing Strategy

### Unit Tests

**Service Layer Tests** (`services/agents.test.ts`):
- ✓ `createAgent` with valid data
- ✓ `createAgent` with duplicate email (should throw)
- ✓ `getAgentById` with existing ID
- ✓ `getAgentById` with non-existent ID (should return null)
- ✓ `getActiveAgents` filters inactive agents
- ✓ `updateAgent` with valid data
- ✓ `deleteAgent` sets active to false (soft delete)

**Validation Tests** (`types/agent.test.ts`):
- ✓ Schema accepts valid agent data
- ✓ Schema rejects invalid email
- ✓ Schema rejects empty required fields
- ✓ Schema accepts optional fields as undefined

### Integration Tests

**API Route Tests**:
- ✓ GET `/api/agents` returns all agents
- ✓ GET `/api/agents?active=true` returns only active agents
- ✓ POST `/api/agents` creates new agent
- ✓ POST `/api/agents` with duplicate email returns 409
- ✓ PUT `/api/agents/[id]` updates agent
- ✓ DELETE `/api/agents/[id]` removes agent and deletes photo

### Component Tests

**AgentForm Tests**:
- ✓ Renders all form fields
- ✓ Shows validation errors on submit with invalid data
- ✓ Handles image upload preview
- ✓ Pre-fills form in edit mode
- ✓ Calls onSubmit with validated data

**AgentsPage Tests**:
- ✓ Displays loading state
- ✓ Displays agent list after load
- ✓ Opens create modal on button click
- ✓ Filters agents by search term
- ✓ Handles delete with confirmation

### E2E Tests (Manual)

1. **Agent Creation Flow**:
   - Navigate to `/admin/agents`
   - Click "Crear Agente"
   - Fill all fields + upload photo
   - Submit and verify success toast
   - Verify agent appears in list

2. **Agent Edit Flow**:
   - Click edit on existing agent
   - Modify fields
   - Submit and verify updates

3. **Agent Deletion Flow**:
   - Click delete on agent
   - Confirm deletion
   - Verify agent removed from list
   - Verify agent does NOT appear on `/agentes`

4. **Public Display**:
   - Navigate to `/agentes`
   - Verify only active agents shown
   - Verify responsive grid layout
   - Click WhatsApp button → verify deep link works

## Navigation Updates

### AdminLayout Navigation

**Location**: `components/admin/AdminLayout.tsx`

Add to navigation array:

```typescript
const navigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Propiedades", href: "/admin/properties", icon: Building2 },
  { name: "Contactos", href: "/admin/contacts", icon: Users },
  { name: "Agentes", href: "/admin/agents", icon: UserCircle }, // NEW
]
```

## Database Migration

**Location**: `scripts/create-agents-table.sql` (new file)

```sql
-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50),
  photo_url TEXT,
  photo_public_id VARCHAR(255),
  bio TEXT,
  specialty VARCHAR(255),
  years_of_experience INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_agents_email ON agents(email);
CREATE INDEX idx_agents_active ON agents(active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_agents_updated_at();
```

## Security Considerations

1. **Input Validation**: All inputs validated with Zod schemas
2. **Email Uniqueness**: Enforced at database level with unique constraint
3. **Image Size Limits**: Maximum 5MB enforced client and server side
4. **SQL Injection**: Prevented by Supabase parameterized queries
5. **File Upload Security**: Only images accepted, validated server-side
6. **Soft Delete**: Prevents accidental data loss
7. **Active Flag**: Ensures only approved agents visible publicly

## Performance Considerations

1. **Image Optimization**: Cloudinary auto-optimization with responsive URLs
2. **Database Indexing**: Indexes on `email` and `active` for fast queries
3. **Server-Side Rendering**: `/agentes` page uses SSR for SEO and speed
4. **Lazy Loading**: Agent images load lazily on scroll
5. **Pagination**: Future enhancement if agent count grows (>50)

## Accessibility

1. **Semantic HTML**: Proper heading hierarchy, landmarks
2. **ARIA Labels**: All interactive elements labeled
3. **Keyboard Navigation**: Full keyboard support for forms and actions
4. **Focus Management**: Proper focus handling in modals
5. **Color Contrast**: WCAG AA compliant contrast ratios
6. **Screen Reader Support**: Meaningful alt text for images

## Future Enhancements

1. **Agent Performance Metrics**: Track leads generated per agent
2. **Agent Availability Calendar**: Show available times for meetings
3. **Agent Specialization Filtering**: Filter public page by specialty
4. **Multi-language Support**: English translations
5. **Agent Assignment**: Assign properties to specific agents
6. **Agent Dashboard**: Individual dashboards for agents to manage their profiles
