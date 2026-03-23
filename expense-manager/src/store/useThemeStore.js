import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' | 'dark'
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', next === 'dark')
          return { theme: next }
        }),
      initTheme: () => {
        const stored = localStorage.getItem('theme-storage')
        const parsed = stored ? JSON.parse(stored) : null
        const theme = parsed?.state?.theme || 'light'
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },
    }),
    { name: 'theme-storage' }
  )
)
