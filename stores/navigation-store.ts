import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// =====================================================================================
// TYPES & INTERFACES
// =====================================================================================

interface RecentSearch {
  id: string
  label: string
  href: string
  timestamp: number
}

interface NavigationState {
  // Command Palette state
  commandPaletteOpen: boolean
  recentSearches: RecentSearch[]
  favoriteModules: string[]

  // Actions
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void

  addRecentSearch: (search: Omit<RecentSearch, 'id' | 'timestamp'>) => void
  clearRecentSearches: () => void

  toggleFavorite: (moduleId: string) => void
  isFavorite: (moduleId: string) => boolean
}

// =====================================================================================
// NAVIGATION STORE (Zustand)
// =====================================================================================

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      // Initial state
      commandPaletteOpen: false,
      recentSearches: [],
      favoriteModules: [],

      // Command Palette actions
      openCommandPalette: () => set({ commandPaletteOpen: true }),

      closeCommandPalette: () => set({ commandPaletteOpen: false }),

      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

      // Recent searches management
      addRecentSearch: (search) =>
        set((state) => {
          // Remove duplicate if exists
          const filtered = state.recentSearches.filter(
            (item) => item.href !== search.href
          )

          // Add new search at the beginning
          const newSearch: RecentSearch = {
            ...search,
            id: `search-${Date.now()}`,
            timestamp: Date.now()
          }

          // Keep only last 5 searches
          const updated = [newSearch, ...filtered].slice(0, 5)

          return { recentSearches: updated }
        }),

      clearRecentSearches: () => set({ recentSearches: [] }),

      // Favorites management
      toggleFavorite: (moduleId) =>
        set((state) => {
          const isFavorite = state.favoriteModules.includes(moduleId)

          if (isFavorite) {
            // Remove from favorites
            return {
              favoriteModules: state.favoriteModules.filter(
                (id) => id !== moduleId
              )
            }
          } else {
            // Add to favorites
            return {
              favoriteModules: [...state.favoriteModules, moduleId]
            }
          }
        }),

      isFavorite: (moduleId) => {
        const state = get()
        return state.favoriteModules.includes(moduleId)
      }
    }),
    {
      name: 'analytics-navigation-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        favoriteModules: state.favoriteModules
      })
    }
  )
)

// =====================================================================================
// HELPER HOOKS
// =====================================================================================

// Hook for command palette state
export const useCommandPalette = () => {
  const open = useNavigationStore((state) => state.commandPaletteOpen)
  const openPalette = useNavigationStore((state) => state.openCommandPalette)
  const closePalette = useNavigationStore((state) => state.closeCommandPalette)
  const togglePalette = useNavigationStore((state) => state.toggleCommandPalette)

  return {
    open,
    openPalette,
    closePalette,
    togglePalette
  }
}

// Hook for recent searches
export const useRecentSearches = () => {
  const recentSearches = useNavigationStore((state) => state.recentSearches)
  const addRecentSearch = useNavigationStore((state) => state.addRecentSearch)
  const clearRecentSearches = useNavigationStore((state) => state.clearRecentSearches)

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches
  }
}

// Hook for favorites
export const useFavorites = () => {
  const favoriteModules = useNavigationStore((state) => state.favoriteModules)
  const toggleFavorite = useNavigationStore((state) => state.toggleFavorite)
  const isFavorite = useNavigationStore((state) => state.isFavorite)

  return {
    favoriteModules,
    toggleFavorite,
    isFavorite
  }
}
