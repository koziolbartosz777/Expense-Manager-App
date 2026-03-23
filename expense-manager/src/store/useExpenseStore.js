import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// Domyślne kategorie wydatków
export const DEFAULT_CATEGORIES = [
  '🍔 Jedzenie',
  '🚗 Transport',
  '🏠 Dom',
  '👕 Zakupy',
  '💊 Zdrowie',
  '🎮 Rozrywka',
  '📚 Edukacja',
  '✈️ Podróże',
  '💼 Praca',
  '🔧 Inne',
]

export const useExpenseStore = create((set, get) => ({
  // ─── Stan ───
  expenses: [],
  isLoading: false,
  error: null,
  lastAction: null, // { type: 'add'|'update'|'delete', expense }

  // ─── Pobieranie wydatków ───
  fetchExpenses: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      set({ expenses: data || [], isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  // ─── Dodawanie wydatku ───
  addExpense: async (expense) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expense])
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        expenses: [data, ...state.expenses],
        isLoading: false,
        lastAction: { type: 'add', expense: data },
      }))

      return data
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },

  // ─── Aktualizacja wydatku ───
  updateExpense: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      // Zapamiętaj poprzedni stan do undo
      const previousExpense = get().expenses.find((e) => e.id === id)

      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? data : e)),
        isLoading: false,
        lastAction: { type: 'update', expense: previousExpense },
      }))

      return data
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },

  // ─── Usuwanie wydatku ───
  deleteExpense: async (id) => {
    set({ isLoading: true, error: null })
    try {
      // Zapamiętaj wydatek do undo
      const deletedExpense = get().expenses.find((e) => e.id === id)

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        isLoading: false,
        lastAction: { type: 'delete', expense: deletedExpense },
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
          // Cofnij dodanie → usuń wydatek
          await supabase
            .from('expenses')
            .delete()
            .eq('id', lastAction.expense.id)

          set((state) => ({
            expenses: state.expenses.filter(
              (e) => e.id !== lastAction.expense.id
            ),
            lastAction: null,
          }))
          break

        case 'delete':
          // Cofnij usunięcie → dodaj z powrotem
          const { data } = await supabase
            .from('expenses')
            .insert([lastAction.expense])
            .select()
            .single()

          set((state) => ({
            expenses: [data, ...state.expenses],
            lastAction: null,
          }))
          break

        case 'update':
          // Cofnij aktualizację → przywróć poprzedni stan
          const { data: restored } = await supabase
            .from('expenses')
            .update(lastAction.expense)
            .eq('id', lastAction.expense.id)
            .select()
            .single()

          set((state) => ({
            expenses: state.expenses.map((e) =>
              e.id === lastAction.expense.id ? restored : e
            ),
            lastAction: null,
          }))
          break
      }
    } catch (error) {
      set({ error: error.message })
    }
  },

  // ─── Czyszczenie błędu ───
  clearError: () => set({ error: null }),

  // ─── Czyszczenie lastAction ───
  clearLastAction: () => set({ lastAction: null }),
}))
