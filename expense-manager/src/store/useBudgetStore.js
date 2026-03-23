import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useBudgetStore = create((set, get) => ({
  // ─── Stan ───
  budgets: [],
  isLoading: false,
  error: null,

  // ─── Pobieranie budżetów ───
  fetchBudgets: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ budgets: data || [], isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  // ─── Dodawanie budżetu ───
  addBudget: async (budget) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([budget])
        .select()
        .single()

      if (error) throw error
      set((state) => ({
        budgets: [data, ...state.budgets],
        isLoading: false,
      }))
      return data
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },

  // ─── Aktualizacja budżetu ───
  updateBudget: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      set((state) => ({
        budgets: state.budgets.map((b) => (b.id === id ? data : b)),
        isLoading: false,
      }))
      return data
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },

  // ─── Usuwanie budżetu ───
  deleteBudget: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (error) throw error
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  // ─── Czyszczenie błędu ───
  clearError: () => set({ error: null }),
}))
