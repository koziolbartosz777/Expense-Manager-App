import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useExpenses } from '../hooks/useExpenses'
import { useBudgetStore } from '../store/useBudgetStore'
import { useTranslation } from '../hooks/useTranslation'
import { formatAmount, formatDate } from '../lib/utils'
import { subMonths, startOfMonth, endOfMonth, startOfYear, isWithinInterval, parseISO } from 'date-fns'

const PERIOD_KEYS = ['month', '3months', '6months', 'year', 'all']

export default function DashboardPage() {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const { expenses, isLoading } = useExpenses()
  const budgets = useBudgetStore((s) => s.budgets)
  const fetchBudgets = useBudgetStore((s) => s.fetchBudgets)
  const [period, setPeriod] = useState('month')

  useEffect(() => { fetchBudgets() }, []) // eslint-disable-line

  const getRange = (p) => {
    const now = new Date()
    switch (p) {
      case 'month': return { start: startOfMonth(now), end: endOfMonth(now) }
      case '3months': return { start: subMonths(now, 3), end: now }
      case '6months': return { start: subMonths(now, 6), end: now }
      case 'year': return { start: startOfYear(now), end: now }
      default: return null
    }
  }
  const filterByRange = (list, range) => range ? list.filter((e) => isWithinInterval(parseISO(e.date), range)) : list

  const totalThisMonth = useMemo(() => filterByRange(expenses, getRange('month')).reduce((s, e) => s + Number(e.amount), 0), [expenses])
  const totalBudget = useMemo(() => budgets.filter((b) => b.period === 'monthly').reduce((s, b) => s + Number(b.limit_amount), 0), [budgets])
  const remaining = totalBudget - totalThisMonth

  const currentRange = getRange(period)
  const currentFiltered = useMemo(() => filterByRange(expenses, currentRange), [expenses, period])
  const currentTotal = useMemo(() => currentFiltered.reduce((s, e) => s + Number(e.amount), 0), [currentFiltered])

  const comparison = useMemo(() => {
    if (period === 'all' || !currentRange) return null
    const dur = currentRange.end - currentRange.start
    const prevFiltered = expenses.filter((e) => isWithinInterval(parseISO(e.date), { start: new Date(currentRange.start - dur), end: new Date(currentRange.start - 1) }))
    const prevTotal = prevFiltered.reduce((s, e) => s + Number(e.amount), 0)
    if (prevTotal === 0) return null
    return { diff: Math.round(((currentTotal - prevTotal) / prevTotal) * 100), prevTotal }
  }, [expenses, period, currentRange, currentTotal])

  const topCategories = useMemo(() => {
    const map = {}
    currentFiltered.forEach((e) => { map[e.category] = (map[e.category] || 0) + Number(e.amount) })
    return Object.entries(map).map(([name, value]) => ({ name, value, percent: currentTotal > 0 ? (value / currentTotal) * 100 : 0 })).sort((a, b) => b.value - a.value).slice(0, 3)
  }, [currentFiltered, currentTotal])

  const recentExpenses = useMemo(() => [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5), [expenses])

  // Empty state
  if (!isLoading && expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 animate-fade-in">
        <span className="text-6xl">💸</span>
        <h2 className="text-xl font-bold text-gray-900">{t('dashboard.noExpenses')}</h2>
        <p className="text-gray-500 max-w-xs">{t('dashboard.addFirst')}</p>
        <button onClick={() => navigate('/add')} className="btn-primary">{t('dashboard.addExpenseBtn')}</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card"><p className="text-sm text-gray-500 mb-1">{t('dashboard.thisMonth')}</p><p className="text-2xl font-bold text-gray-900">{formatAmount(totalThisMonth)}</p></div>
        <div className="card"><p className="text-sm text-gray-500 mb-1">{t('dashboard.totalBudget')}</p><p className="text-2xl font-bold text-green-600">{totalBudget > 0 ? formatAmount(totalBudget) : '—'}</p></div>
        <div className="card"><p className="text-sm text-gray-500 mb-1">{t('dashboard.remaining')}</p><p className={`text-2xl font-bold ${totalBudget === 0 ? 'text-gray-400' : remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>{totalBudget > 0 ? formatAmount(remaining) : '—'}</p></div>
      </div>

      <div className="card space-y-4">
        <h2 className="section-title">{t('dashboard.summary')}</h2>
        <div className="flex flex-wrap gap-2">
          {PERIOD_KEYS.map((k) => (
            <button key={k} onClick={() => setPeriod(k)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all min-h-[44px] ${period === k ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t(`dashboard.periods.${k}`)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-sm text-gray-500">{t('dashboard.totalExpenses')}</p><p className="text-xl font-bold text-gray-900">{formatAmount(currentTotal)}</p></div>
          <div><p className="text-sm text-gray-500">{t('dashboard.transactions')}</p><p className="text-xl font-bold text-gray-900">{currentFiltered.length}</p></div>
        </div>
        {comparison && (
          <div className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl ${comparison.diff <= 0 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
            <span>{comparison.diff <= 0 ? '↓' : '↑'}</span>
            <span>{Math.abs(comparison.diff)}% {comparison.diff <= 0 ? t('dashboard.comparison.less') : t('dashboard.comparison.more')} ({formatAmount(comparison.prevTotal)})</span>
          </div>
        )}
        {topCategories.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500">{t('dashboard.topCategories')}</p>
            {topCategories.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                  <span className="text-sm text-gray-500">{formatAmount(cat.value)} · {cat.percent.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${cat.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">{t('dashboard.recentExpenses')}</h2>
          {expenses.length > 0 && (
            <button onClick={() => navigate('/expenses')} className="text-sm text-primary-500 hover:text-primary-700 font-medium min-h-[44px] flex items-center">
              {t('dashboard.viewAll')}
            </button>
          )}
        </div>
        {isLoading ? (
          <p className="text-gray-400 text-sm text-center py-8">{t('common.loading')}</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentExpenses.map((expense) => (
              <div key={expense.id} onClick={() => navigate('/expenses')}
                className="flex items-center justify-between py-3 gap-4 cursor-pointer hover:bg-gray-50 -mx-4 px-4 rounded-xl transition-colors min-h-[44px]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">{expense.category}</span>
                    <span className="text-xs text-gray-400">{formatDate(expense.date, language)}</span>
                  </div>
                  {expense.description && <p className="text-sm text-gray-500 truncate mt-0.5">{expense.description}</p>}
                </div>
                <span className="text-base font-bold text-gray-900 shrink-0">{formatAmount(expense.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
