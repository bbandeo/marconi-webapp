"use client"

// =====================================================================================
// MARCONI INMOBILIARIA - REACT QUERY PROVIDER
// =====================================================================================
// Provider component para React Query con configuración optimizada
// Incluye error boundaries y DevTools para desarrollo
// =====================================================================================

import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient as defaultQueryClient } from '@/lib/react-query-config'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Use the pre-configured query client
  const [queryClient] = useState(() => defaultQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}

export default QueryProvider