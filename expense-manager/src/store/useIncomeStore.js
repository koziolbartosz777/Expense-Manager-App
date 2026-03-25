import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './useAuthStore'

export const useIncomeStore = create((set, get) => ({
  // ─── Stan ───
  income: [],
  isLoading: false,
  error: null,
  lastAction: null, // { type: 'add'|'update'|'delete', income, source: 'income' }

  // ─── Pobieranie przychodów ───
  fetchIncome: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      set({ income: data || [], isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  // ─── Dodawanie przychodu ───
  addIncome: async (incomeItem) => {
    const user = useAuthStore.getState().user
    if (!user) return null

    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('income')
        .insert([{ ...incomeItem, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        income: [data, ...state.income],
        isLoading: false,
        lastAction: { type: 'add', income: data, source: 'income' },
      }))

      return data
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },

  // ─── Aktualizacja przychodu ───
  updateIncome: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const previousIncome = get().income.find((i) => i.id === id)

      const { data, error } = await supabase
        .from('income')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        income: state.income.map((i) => (i.id === id ? data : i)),
        isLoading: false,
        lastAction: { type: 'update', income: previousIncome, source: 'income' },
      }))

      return data
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },

  // ─── Usuwanie przychodu ───
  deleteIncome: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const deletedIncome = get().income.find((i) => i.id === id)

      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        income: state.income.filter((i) => i.id !== id),
        isLoading: false,
        lastAction: { type: 'delete', income: deletedIncome, source: 'income' },
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  // ─── Cofnij ostatnią akcję (undo) ───
  undoLastAction: async () => {
    const { lastAction } = get()
    if (!lastAction) return

    try {
      switch (lastAction.type) {
        case 'add':
          await supabase.from('income').delete().eq('id', lastAction.income.id)
          set((state) => ({
            income: state.income.filter((i) => i.id !== lastAction.income.id),
            lastAction: null,
          }))
          break

        case 'delete': {
          const { data } = await supabase
            .from('income')
            .insert([lastAction.income])
            .select()
            .single()
          set((state) => ({
            income: [data, ...state.income],
            lastAction: null,
          }))
          break
        }

        case 'update': {
          const { data: restored } = await supabase
            .from('income')
            .update(lastAction.income)
            .eq('id', lastAction.income.id)
            .select()
            .single()
          set((state) => ({
            income: state.income.map((i) =>
              i.id === lastAction.income.id ? restored : i
            ),
            lastAction: null,
          }))
          break
        }
      }
    } catch (error) {
      set({ error: error.message })
    }
  },

  clearError: () => set({ error: null }),
  clearLastAction: () => set({ lastAction: null }),
}))
