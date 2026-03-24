import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './useAuthStore'

// Domyślne kategorie do seedowania przy pierwszym logowaniu
const DEFAULT_SEED = [
  { name: 'Jedzenie', icon: '🍔', color: '#ef4444' },
  { name: 'Transport', icon: '🚗', color: '#f97316' },
  { name: 'Dom', icon: '🏠', color: '#eab308' },
  { name: 'Zakupy', icon: '👕', color: '#8b5cf6' },
  { name: 'Zdrowie', icon: '💊', color: '#10b981' },
  { name: 'Rozrywka', icon: '🎮', color: '#ec4899' },
  { name: 'Edukacja', icon: '📚', color: '#3b82f6' },
  { name: 'Podróże', icon: '✈️', color: '#06b6d4' },
  { name: 'Praca', icon: '💼', color: '#6366f1' },
  { name: 'Inne', icon: '🔧', color: '#6b7280' },
]

export const useCategoryStore = create((set, get) => ({
  // ─── Stan ───
  categories: [],
  isLoading: false,
  error: null,

  // ─── Pobieranie kategorii użytkownika ───
  fetchCategories: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Jeśli brak kategorii — seeduj domyślne
      if (!data || data.length === 0) {
        await get().seedDefaults()
        return
      }

      set({ categories: data, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  // ─── Seedowanie domyślnych kategorii (pierwszy login) ───
  seedDefaults: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      const rows = DEFAULT_SEED.map((cat) => ({
        ...cat,
        user_id: user.id,
        is_default: true,
      }))

      const { data, error } = await supabase
        .from('categories')
        .insert(rows)
        .select()

      if (error) throw error
      set({ categories: data || [], isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  // ─── Dodawanie kategorii ───
  addCategory: async (category) => {
    const user = useAuthStore.getState().user
    if (!user) return null

    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...category, user_id: user.id, is_default: false }])
        .select()
        .single()

      if (error) throw error
      set((s) => ({ categories: [...s.categories, data], isLoading: false }))
      return data
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },

  // ─── Aktualizacja kategorii ───
  updateCategory: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      set((s) => ({
        categories: s.categories.map((c) => (c.id === id ? data : c)),
        isLoading: false,
      }))
      return data
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },

  // ─── Usuwanie kategorii (tylko nie-domyślne) ───
  deleteCategory: async (id) => {
    const cat = get().categories.find((c) => c.id === id)
    if (cat?.is_default) return // Nie usuwaj domyślnych

    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      set((s) => ({
        categories: s.categories.filter((c) => c.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  // ─── Helper: lista nazw kategorii w formacie "emoji nazwa" ───
  getCategoryNames: () => {
    return get().categories.map((c) => `${c.icon} ${c.name}`)
  },

  // ─── Helper: kolor po pełnej nazwie kategorii ───
  getCategoryColorByName: (fullName) => {
    const cat = get().categories.find((c) => `${c.icon} ${c.name}` === fullName)
    return cat?.color || '#6b7280'
  },

  clearError: () => set({ error: null }),
}))
