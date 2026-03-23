import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useExpenses } from '../hooks/useExpenses'
import { useBudgetStore } from '../store/useBudgetStore'
import { formatAmount, formatDate } from '../lib/utils'
import { subMonths, startOfMonth, endOfMonth, startOfYear, isWithinInterval, parseISO } from 'date-fns'

const PERIOD_OPTIONS = [
  { value: 'month', label: 'Ten miesiąc' },
  { value: '3months', label: '3 miesiące' },
  { value: '6months', label: '6 miesięcy' },
  { value: 'year', label: 'Ten rok' },
  { value: 'all', label: 'Od początku' },
]

/**
 * Strona główna – Dashboard z kartami podsumowania i analizą okresu.
 */
export default function DashboardPage() {
  const navigate = useNavigate()
  const { expenses, isLoading } = useExpenses()
  const budgets = useBudgetStore((s) => s.budgets)
  const fetchBudgets = useBudgetStore((s) => s.fetchBudgets)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    fetchBudgets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Helper: filtruj wydatki do zakresu ───
  const getRange = (periodVal) => {
    const now = new Date()
    switch (periodVal) {
      case 'month': return { start: startOfMonth(now), end: endOfMonth(now) }
      case '3months': return { start: subMonths(now, 3), end: now }
      case '6months': return { start: subMonths(now, 6), end: now }
      case 'year': return { start: startOfYear(now), end: now }
      default: return null
    }
  }

  const filterByRange = (list, range) => {
    if (!range) return list
    return list.filter((e) => isWithinInterval(parseISO(e.date), range))
  }

  // Wydatki bieżącego miesiąca (do kart top)
  const totalThisMonth = useMemo(() => {
    const range = getRange('month')
    return filterByRange(expenses, range).reduce((s, e) => s + Number(e.amount), 0)
  }, [expenses])

  const totalBudget = useMemo(() => {
    return budgets
      .filter((b) => b.period === 'monthly')
      .reduce((s, b) => s + Number(b.limit_amount), 0)
  }, [budgets])

  const remaining = totalBudget - totalThisMonth

  // ─── Wydatki w wybranym okresie ───
  const currentRange = getRange(period)
  const currentFiltered = useMemo(
    () => filterByRange(expenses, currentRange),
    [expenses, period]
  )
  const currentTotal = useMemo(
    () => currentFiltered.reduce((s, e) => s + Number(e.amount), 0),
    [currentFiltered]
  )

  // ─── Porównanie z poprzednim takim samym okresem ───
  const comparison = useMemo(() => {
    if (period === 'all' || !currentRange) return null

    const durationMs = currentRange.end - currentRange.start
    const prevStart = new Date(currentRange.start - durationMs)
    const prevEnd = new Date(currentRange.start - 1)
    const prevFiltered = expenses.filter((e) =>
      isWithinInterval(parseISO(e.date), { start: prevStart, end: prevEnd })
    )
    const prevTotal = prevFiltered.reduce((s, e) => s + Number(e.amount), 0)

    if (prevTotal === 0) return null
    const diff = ((currentTotal - prevTotal) / prevTotal) * 100
    return { diff: Math.round(diff), prevTotal }
  }, [expenses, period, currentRange, currentTotal])

  // ─── Top 3 kategorie w okresie ───
  const topCategories = useMemo(() => {
    const map = {}
    currentFiltered.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value, percent: currentTotal > 0 ? (value / currentTotal) * 100 : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
  }, [currentFiltered, currentTotal])

  // Ostatnie 5 wydatków
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

      {/* ─── Karty top (1 kolumna mobile, 3 desktop) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Wydatki (ten miesiąc)</p>
          <p className="text-2xl font-bold text-gray-900">{formatAmount(totalThisMonth)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Budżet</p>
          <p className="text-2xl font-bold text-green-600">
            {totalBudget > 0 ? formatAmount(totalBudget) : '—'}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Pozostało</p>
          <p className={`text-2xl font-bold ${
            totalBudget === 0 ? 'text-gray-400'
              : remaining >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {totalBudget > 0 ? formatAmount(remaining) : '—'}
          </p>
        </div>
      </div>

      {/* ─── Podsumowanie z selektorem okresu ─── */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Podsumowanie</h2>
        </div>

        {/* Selektor okresu */}
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                min-h-[44px]
                ${period === opt.value
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-100 dark:text-gray-600'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Suma wydatków</p>
            <p className="text-xl font-bold text-gray-900">{formatAmount(currentTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Transakcje</p>
            <p className="text-xl font-bold text-gray-900">{currentFiltered.length}</p>
          </div>
        </div>

        {/* Porównanie z poprzednim okresem */}
        {comparison && (
          <div className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl ${
            comparison.diff <= 0
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <span>{comparison.diff <= 0 ? '↓' : '↑'}</span>
            <span>
              {Math.abs(comparison.diff)}% {comparison.diff <= 0 ? 'mniej' : 'więcej'} niż poprzedni okres
              ({formatAmount(comparison.prevTotal)})
            </span>
          </div>
        )}

        {/* Top 3 kategorie */}
        {topCategories.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500">Top kategorie</p>
            {topCategories.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                  <span className="text-sm text-gray-500">
                    {formatAmount(cat.value)} · {cat.percent.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Ostatnie wydatki ─── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Ostatnie wydatki</h2>
          {expenses.length > 0 && (
            <button
              onClick={() => navigate('/expenses')}
              className="text-sm text-primary-500 hover:text-primary-700 font-medium
                         min-h-[44px] flex items-center"
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
                           hover:bg-gray-50 -mx-4 px-4 rounded-xl transition-colors
                           min-h-[44px]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {expense.category}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
                  </div>
                  {expense.description && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">{expense.description}</p>
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
