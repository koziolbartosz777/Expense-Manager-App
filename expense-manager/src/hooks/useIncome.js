import { useEffect } from 'react'
import { useIncomeStore } from '../store/useIncomeStore'

/**
 * Hook do obsługi przychodów – pobiera dane przy montowaniu.
 */
export function useIncome() {
  const store = useIncomeStore()

  useEffect(() => {
    store.fetchIncome()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return store
}
