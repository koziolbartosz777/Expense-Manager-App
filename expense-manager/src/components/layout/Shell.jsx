import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import Toast from '../ui/Toast'
import GlobalSearch from '../ui/GlobalSearch'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import { useExpenseStore } from '../../store/useExpenseStore'
import { useIncomeStore } from '../../store/useIncomeStore'
import { processRecurringTransactions } from '../../lib/recurringProcessor'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Główny shell – Navbar + content z animacją przejścia + BottomNav + Toast + GlobalSearch.
 */
export default function Shell() {
  const location = useLocation()
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const setGlobalSearchOpen = useUIStore((s) => s.setGlobalSearchOpen)
  const setToastMessage = useUIStore((s) => s.setToastMessage)
  const fetchExpenses = useExpenseStore((s) => s.fetchExpenses)
  const fetchIncome = useIncomeStore((s) => s.fetchIncome)
  const processedRef = useRef(false)

  // Process recurring transactions on mount
  useEffect(() => {
    if (!user || processedRef.current) return
    processedRef.current = true

    const run = async () => {
      try {
        const count = await processRecurringTransactions(user.id)
        if (count > 0) {
          // Refresh data after processing
          fetchExpenses()
          fetchIncome()
          // Show toast
          const msg = t('toast.recurringAdded').replace('{count}', String(count))
          setToastMessage(msg)
        }
      } catch (e) {
        console.error('Recurring processing error:', e)
      }
    }
    run()
  }, [user]) // eslint-disable-line

  // Ctrl+K / Cmd+K → open global search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setGlobalSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setGlobalSearchOpen])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="md:ml-64">
        <div
          key={location.pathname}
          className="max-w-4xl mx-auto px-4 py-6 safe-bottom animate-page-in"
        >
          <Outlet />
        </div>
      </main>

      <BottomNav />
      <Toast />
      <GlobalSearch />
    </div>
  )
}
