import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  // ─── Stan ───
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,

  // ─── Inicjalizacja sesji (wywoływana raz w main.jsx) ───
  initAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({
        user: session?.user ?? null,
        session: session ?? null,
        isInitialized: true,
      })

      // Nasłuchuj zmian sesji (login/logout/token refresh)
      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({
          user: session?.user ?? null,
          session: session ?? null,
        })

        // Process recurring transactions on sign-in
        if (_event === 'SIGNED_IN' && session?.user) {
          try {
            const { processRecurringTransactions } = await import('../lib/recurringProcessor')
            const count = await processRecurringTransactions(session.user.id)
            if (count > 0) {
              const { useUIStore } = await import('./useUIStore')
              useUIStore.getState().setToastMessage(`Added ${count} recurring transactions 🔄`)
            }
          } catch (e) {
            console.error('Recurring processing on sign-in:', e)
          }
        }
      })
    } catch (error) {
      console.error('Auth init error:', error)
      set({ isInitialized: true })
    }
  },

  // ─── Logowanie ───
  signIn: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      set({
        user: data.user,
        session: data.session,
        isLoading: false,
      })

      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      // Tłumaczenie błędów Supabase na polski
      let message = error.message
      if (message.includes('Invalid login credentials')) {
        message = 'Nieprawidłowy email lub hasło'
      }
      return { success: false, error: message }
    }
  },

  // ─── Rejestracja ───
  signUp: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      set({ isLoading: false })
      return { success: true, needsConfirmation: !data.session }
    } catch (error) {
      set({ isLoading: false })
      let message = error.message
      if (message.includes('User already registered')) {
        message = 'Ten email jest już zajęty'
      }
      return { success: false, error: message }
    }
  },

  // ─── Wylogowanie ───
  signOut: async () => {
    set({ isLoading: true })
    try {
      await supabase.auth.signOut()

      // Resetuj wszystkie store'y
      const { useExpenseStore } = await import('./useExpenseStore')
      const { useBudgetStore } = await import('./useBudgetStore')
      const { useCategoryStore } = await import('./useCategoryStore')

      useExpenseStore.setState({ expenses: [], lastAction: null })
      useBudgetStore.setState({ budgets: [] })
      useCategoryStore.setState({ categories: [] })

      set({ user: null, session: null, isLoading: false })
    } catch (error) {
      console.error('Logout error:', error)
      set({ isLoading: false })
    }
  },
}))
