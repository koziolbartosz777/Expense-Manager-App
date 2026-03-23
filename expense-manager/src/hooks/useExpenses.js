import { useEffect } from 'react'
import { useExpenseStore } from '../store/useExpenseStore'

/**
 * Hook do obsługi wydatków – pobiera dane przy montowaniu.
 */
export function useExpenses() {
  const store = useExpenseStore()

  useEffect(() => {
    store.fetchExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return store
}
