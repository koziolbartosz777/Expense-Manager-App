import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store/useUIStore'
import { useExpenseStore } from '../../store/useExpenseStore'
import { useIncomeStore } from '../../store/useIncomeStore'
import { useTranslation } from '../../hooks/useTranslation'
import { formatAmount, formatDate } from '../../lib/utils'
import { translateCategory, translateIncomeCategory } from '../../lib/categories'

export default function GlobalSearch() {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const isOpen = useUIStore((s) => s.globalSearchOpen)
  const setOpen = useUIStore((s) => s.setGlobalSearchOpen)
  const expenses = useExpenseStore((s) => s.expenses)
  const income = useIncomeStore((s) => s.income)

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const inputRef = useRef(null)

  // Debounce 200ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(timer)
  }, [query])

  // Autofocus on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setDebouncedQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // ESC close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, setOpen])

  const results = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim()

    if (!q) {
      // Recent: last 5 transactions combined
      const combined = [
        ...expenses.slice(0, 10).map((e) => ({ ...e, _type: 'expense' })),
        ...income.slice(0, 10).map((i) => ({ ...i, _type: 'income' })),
      ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
      return { expenses: [], income: [], recent: combined, isRecent: true }
    }

    const matchExpenses = expenses.filter((e) => {
      const translatedCat = translateCategory(e.category, language)
      return (
        e.description?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        translatedCat?.toLowerCase().includes(q) ||
        e.amount?.toString().includes(q) ||
        e.date?.includes(q)
      )
    }).slice(0, 5)

    const matchIncome = income.filter((i) => {
      const translatedCat = translateIncomeCategory(i.category, language)
      return (
        i.description?.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q) ||
        translatedCat?.toLowerCase().includes(q) ||
        i.amount?.toString().includes(q) ||
        i.date?.includes(q)
      )
    }).slice(0, 5)

    return { expenses: matchExpenses, income: matchIncome, recent: [], isRecent: false }
  }, [debouncedQuery, expenses, income, language])

  const handleClick = (item) => {
    setOpen(false)
    navigate(item._type === 'income' ? '/income' : '/expenses')
  }

  const renderItem = (item, type) => {
    const cat = type === 'income'
      ? translateIncomeCategory(item.category, language)
      : translateCategory(item.category, language)
    return (
      <button
        key={item.id}
        onClick={() => handleClick({ ...item, _type: type })}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded-xl transition-colors text-left min-h-[48px]"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 truncate">{cat}</span>
            <span className="text-xs text-gray-400">{formatDate(item.date, language)}</span>
          </div>
          {item.description && <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>}
        </div>
        <span className={`text-sm font-bold shrink-0 ${type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
          {type === 'expense' ? '-' : '+'}{formatAmount(item.amount)}
        </span>
      </button>
    )
  }

  if (!isOpen) return null

  const hasResults = results.expenses.length > 0 || results.income.length > 0
  const hasRecent = results.recent.length > 0

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center" onClick={() => setOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 mt-[10vh] md:mt-[15vh] bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#333] overflow-hidden animate-scale-in max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-[#222]">
          <span className="text-lg">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-sm"
          />
          <kbd className="hidden md:inline-flex items-center px-2 py-0.5 text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-[#222] rounded font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {results.isRecent && hasRecent && (
            <div>
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('search.recentTitle')}</p>
              {results.recent.map((item) => renderItem(item, item._type))}
            </div>
          )}

          {!results.isRecent && hasResults && (
            <>
              {results.expenses.length > 0 && (
                <div>
                  <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('search.expensesSection')}</p>
                  {results.expenses.map((e) => renderItem(e, 'expense'))}
                </div>
              )}
              {results.income.length > 0 && (
                <div className={results.expenses.length > 0 ? 'mt-2' : ''}>
                  <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('search.incomeSection')}</p>
                  {results.income.map((i) => renderItem(i, 'income'))}
                </div>
              )}
            </>
          )}

          {!results.isRecent && !hasResults && debouncedQuery && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-sm text-gray-500">{t('search.noResults')} &apos;{debouncedQuery}&apos;</p>
            </div>
          )}

          {results.isRecent && !hasRecent && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl mb-3">💡</span>
              <p className="text-sm text-gray-500">{t('search.placeholder')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
