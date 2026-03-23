import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useExpenses } from '../hooks/useExpenses'
import { useBudgetStore } from '../store/useBudgetStore'
import { formatAmount, formatDate } from '../lib/utils'

/**
 * Strona główna – Dashboard z podsumowaniem wydatków i budżetu.
 */
export default function DashboardPage() {
  const navigate = useNavigate()
  const { expenses, isLoading } = useExpenses()
  const budgets = useBudgetStore((s) => s.budgets)

  // ─── Suma wydatków z bieżącego miesiąca ───
  const totalThisMonth = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    return expenses.reduce((sum, exp) => {
      const d = new Date(exp.date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        return sum + Number(exp.amount)
      }
      return sum
    }, 0)
  }, [expenses])

  // ─── Suma budżetów miesięcznych ───
  const totalBudget = useMemo(() => {
    return budgets
      .filter((b) => b.period === 'monthly')
      .reduce((sum, b) => sum + Number(b.limit_amount), 0)
  }, [budgets])

  const remaining = totalBudget - totalThisMonth

  // Ostatnie 5 wydatków (bez filtrów, posortowane po dacie desc)
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  }, [expenses])

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Podsumowanie Twoich finansów</p>
      </div>

      {/* Karty podsumowania */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Wydatki (ten miesiąc)</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatAmount(totalThisMonth)}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Budżet</p>
          <p className="text-2xl font-bold text-green-600">
            {totalBudget > 0 ? formatAmount(totalBudget) : '—'}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Pozostało</p>
          <p
            className={`text-2xl font-bold ${
              totalBudget === 0
                ? 'text-gray-400'
                : remaining >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
            }`}
          >
            {totalBudget > 0 ? formatAmount(remaining) : '—'}
          </p>
        </div>
      </div>

      {/* Ostatnie wydatki */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Ostatnie wydatki</h2>
          {expenses.length > 0 && (
            <button
              onClick={() => navigate('/expenses')}
              className="text-sm text-primary-500 hover:text-primary-700 font-medium"
            >
              Zobacz wszystkie →
            </button>
          )}
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-sm text-center py-8">Ładowanie...</p>
        ) : recentExpenses.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Brak wydatków. Dodaj swój pierwszy wydatek! 🎉
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                onClick={() => navigate('/expenses')}
                className="flex items-center justify-between py-3 gap-4 cursor-pointer
                           hover:bg-gray-50 -mx-4 px-4 rounded-xl transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {expense.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                  {expense.description && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {expense.description}
                    </p>
                  )}
                </div>
                <span className="text-base font-bold text-gray-900 shrink-0">
                  {formatAmount(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
