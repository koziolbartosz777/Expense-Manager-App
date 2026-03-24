import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './useAuthStore'

export const useBudgetStore = create((set, get) => ({
  budgets: [],
  isLoading: false,
  error: null,

  fetchBudgets: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ budgets: data || [], isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  addBudget: async (budget) => {
    const user = useAuthStore.getState().user
    if (!user) return null

    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([{ ...budget, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      set((s) => ({ budgets: [data, ...s.budgets], isLoading: false }))
      return data
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },

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
      set((s) => ({
        budgets: s.budgets.map((b) => (b.id === id ? data : b)),
        isLoading: false,
      }))
      return data
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },

  deleteBudget: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id)
      if (error) throw error
      set((s) => ({
        budgets: s.budgets.filter((b) => b.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
