import { create } from 'zustand'

export const useUIStore = create((set) => ({
  // ─── Global Search ───
  globalSearchOpen: false,
  setGlobalSearchOpen: (open) => set({ globalSearchOpen: open }),

  // ─── Generic Toast (for recurring, etc.) ───
  toastMessage: null,
  setToastMessage: (msg) => set({ toastMessage: msg }),
  clearToastMessage: () => set({ toastMessage: null }),
}))
