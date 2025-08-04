# Development Patterns & Examples

## Common Component Patterns

### 1. Admin Page Layout Pattern
```tsx
'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Título de Página</h1>
          <p className="text-gray-600">Descripción de la página</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Agregar Nuevo</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 focus:ring-0 text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border">
        {/* Table or content here */}
      </div>
    </div>
  )
}
```

### 2. Form Component Pattern
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const formSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  price: z.number().min(0, 'El precio debe ser mayor a 0'),
})

type FormData = z.infer<typeof formSchema>

export default function EntityForm({ initialData }: { initialData?: FormData }) {
  const [formData, setFormData] = useState<FormData>(initialData || {
    title: '',
    price: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const validatedData = formSchema.parse(formData)
      setIsSubmitting(true)
      
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      })

      if (response.ok) {
        router.push('/admin/list-page')
      } else {
        throw new Error('Error al guardar')
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message
          }
        })
        setErrors(fieldErrors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
```

### 3. API Route Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1),
  price: z.number().min(0),
})

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createSchema.parse(body)
    
    const supabase = createClient()
    const { data, error } = await supabase
      .from('table_name')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating record:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
```

## Styling Patterns

### Color Scheme
```css
/* Primary brand colors */
.text-brand-orange { color: #ea580c; }
.bg-brand-orange { background-color: #ea580c; }
.border-brand-orange { border-color: #ea580c; }

/* Common UI patterns */
.admin-card {
  @apply bg-white rounded-xl p-6 shadow-sm border border-gray-200;
}

.form-input {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500;
}

.form-input-error {
  @apply border-red-300 focus:ring-red-500 focus:border-red-500;
}

.btn-primary {
  @apply bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-secondary {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors;
}
```

### Responsive Patterns
```tsx
// Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>

// Responsive text
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold">

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">

// Responsive flex
<div className="flex flex-col sm:flex-row gap-4">
```

## Data Fetching Patterns

### Custom Hook Pattern
```typescript
import { useState, useEffect } from 'react'

interface UseDataOptions {
  autoFetch?: boolean
}

export function useData<T>(endpoint: string, options: UseDataOptions = {}) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('Error al cargar datos')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (options.autoFetch) {
      fetchData()
    }
  }, [endpoint, options.autoFetch])

  return { data, loading, error, refetch: fetchData }
}
```

## Error Handling Patterns

### Client-side Error Display
```tsx
interface ErrorDisplayProps {
  error: string | null
  onRetry?: () => void
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-800">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              Intentar nuevamente
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Loading States
```tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className="flex justify-center items-center p-4">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-orange-500 ${sizeClasses[size]}`} />
    </div>
  )
}
```

## Common Spanish Text Patterns

```typescript
// Common Spanish labels and messages
export const labels = {
  // Forms
  required: '* Campo requerido',
  save: 'Guardar',
  cancel: 'Cancelar',
  delete: 'Eliminar',
  edit: 'Editar',
  add: 'Agregar',
  search: 'Buscar',
  filter: 'Filtrar',
  
  // Status messages
  loading: 'Cargando...',
  saving: 'Guardando...',
  saved: 'Guardado exitosamente',
  error: 'Ocurrió un error',
  noResults: 'No se encontraron resultados',
  
  // Property specific
  price: 'Precio',
  bedrooms: 'Dormitorios',
  bathrooms: 'Baños',
  area: 'Superficie',
  address: 'Dirección',
  neighborhood: 'Barrio',
  features: 'Características',
  
  // Actions
  viewDetails: 'Ver detalles',
  contact: 'Contactar',
  schedule: 'Agendar visita',
}

// Validation messages in Spanish
export const validationMessages = {
  required: (field: string) => `${field} es requerido`,
  minLength: (field: string, min: number) => `${field} debe tener al menos ${min} caracteres`,
  email: 'Ingrese un email válido',
  phone: 'Ingrese un teléfono válido',
  number: 'Ingrese un número válido',
}
```
