import { useEffect } from 'react'
import { useBudgetStore } from '../store/useBudgetStore'

/**
 * Hook do obsługi budżetów – pobiera dane przy montowaniu.
 */
export function useBudgets() {
  const store = useBudgetStore()

  useEffect(() => {
    store.fetchBudgets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return store
}
