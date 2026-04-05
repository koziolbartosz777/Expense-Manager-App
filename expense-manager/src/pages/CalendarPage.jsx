import { useState, useMemo } from 'react'
import { useExpenseStore } from '../store/useExpenseStore'
import { useIncomeStore } from '../store/useIncomeStore'
import { useTranslation } from '../hooks/useTranslation'
import { formatAmount } from '../lib/utils'
import { translateCategory, translateIncomeCategory } from '../lib/categories'

/**
 * Recurring calendar — siatka miesiąca z zaplanowanymi transakcjami.
 */
export default function CalendarPage() {
  const { t, language } = useTranslation()
  const expenses = useExpenseStore((s) => s.expenses)
  const income = useIncomeStore((s) => s.income)

  const [viewDate, setViewDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const monthLabel = viewDate.toLocaleDateString(
    language === 'pl' ? 'pl-PL' : language === 'de' ? 'de-DE' : 'en-US',
    { month: 'long', year: 'numeric' }
  )

  // Dni w miesiącu i offset na poniedziałek
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7 // Mon=0

  const today = new Date()
  const isToday = (day) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  // Transakcje cykliczne pasujące do danego dnia miesiąca
  const recurringByDay = useMemo(() => {
    const map = {} // day -> [items]
    for (let d = 1; d <= daysInMonth; d++) map[d] = []

    const dateStr = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    // Expenses — recurring i normalne w danym miesiącu
    expenses.forEach((e) => {
      if (e.is_recurring && e.recurring_next_date) {
        const nd = new Date(e.recurring_next_date)
        if (nd.getFullYear() === year && nd.getMonth() === month) {
          map[nd.getDate()]?.push({ ...e, _type: 'expense' })
        }
      }
      // normalna transakcja w tym miesiącu
      if (e.date?.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
        const day = parseInt(e.date.split('-')[2], 10)
        if (!e.is_recurring && map[day]) {
          map[day].push({ ...e, _type: 'expense' })
        }
      }
    })

    // Income — recurring i normalne
    income.forEach((i) => {
      if (i.is_recurring && i.recurring_next_date) {
        const nd = new Date(i.recurring_next_date)
        if (nd.getFullYear() === year && nd.getMonth() === month) {
          map[nd.getDate()]?.push({ ...i, _type: 'income' })
        }
      }
      if (i.date?.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
        const day = parseInt(i.date.split('-')[2], 10)
        if (!i.is_recurring && map[day]) {
          map[day].push({ ...i, _type: 'income' })
        }
      }
    })

    return map
  }, [expenses, income, year, month, daysInMonth])

  // Summary
  const summary = useMemo(() => {
    let totalExpenses = 0, totalIncome = 0
    Object.values(recurringByDay).forEach((items) => {
      items.forEach((item) => {
        if (item._type === 'expense') totalExpenses += Number(item.amount)
        else totalIncome += Number(item.amount)
      })
    })
    return { totalExpenses, totalIncome, balance: totalIncome - totalExpenses }
  }, [recurringByDay])

  const dayHeaders = language === 'de'
    ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
    : language === 'pl'
    ? ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  // List view data
  const listData = useMemo(() => {
    return Object.entries(recurringByDay)
      .filter(([, items]) => items.length > 0)
      .map(([day, items]) => ({ day: Number(day), items }))
      .sort((a, b) => a.day - b.day)
  }, [recurringByDay])

  const getCatLabel = (item) => {
    if (item._type === 'income') return translateIncomeCategory(item.category, language)
    return translateCategory(item.category, language)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('calendar.title')}</h1>
        <p className="text-gray-500 mt-1">{t('calendar.subtitle')}</p>
      </div>

      {/* Header: nav + view toggle */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-lg transition-colors">‹</button>
          <h2 className="text-lg font-bold text-gray-900 capitalize">{monthLabel}</h2>
          <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-lg transition-colors">›</button>
        </div>

        {/* View toggle (mobile) */}
        <div className="flex gap-2 mb-4 md:hidden">
          <button onClick={() => setViewMode('grid')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium min-h-[36px] transition-all ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            📅 {t('calendar.grid')}
          </button>
          <button onClick={() => setViewMode('list')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium min-h-[36px] transition-all ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            📋 {t('calendar.list')}
          </button>
        </div>

        {/* GRID VIEW */}
        <div className={`${viewMode === 'list' ? 'hidden md:block' : ''}`}>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayHeaders.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[60px] md:min-h-[80px]" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const items = recurringByDay[day] || []
              const hasItems = items.length > 0

              return (
                <div
                  key={day}
                  className={`min-h-[60px] md:min-h-[80px] p-1 rounded-xl border transition-colors
                    ${isToday(day) ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800 bg-primary-50/50 dark:bg-primary-950/30' : 'border-transparent'}
                    ${hasItems ? 'bg-gray-50 dark:bg-[#1a1a1a]' : ''}`}
                >
                  <div className={`text-xs font-medium mb-0.5 ${isToday(day) ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-500'}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {items.slice(0, 2).map((item, idx) => (
                      <div key={idx}
                        className={`text-[9px] md:text-[10px] px-1 py-0.5 rounded font-medium truncate ${
                          item._type === 'expense'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                        {item.category?.split(' ')[0]} {item._type === 'expense' ? '-' : '+'}{formatAmount(item.amount)}
                      </div>
                    ))}
                    {items.length > 2 && (
                      <div className="text-[9px] text-gray-400 pl-1">+{items.length - 2}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* LIST VIEW (mobile) */}
        <div className={`${viewMode === 'grid' ? 'hidden' : ''} md:hidden`}>
          {listData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t('calendar.noTransactions')}</p>
          ) : (
            <div className="space-y-3">
              {listData.map(({ day, items }) => (
                <div key={day}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-bold ${isToday(day) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    {isToday(day) && <span className="text-[10px] bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 px-1.5 py-0.5 rounded-full font-medium">{t('calendar.today')}</span>}
                  </div>
                  <div className="space-y-1 pl-3 border-l-2 border-gray-200 dark:border-[#333]">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{getCatLabel(item)}</span>
                        <span className={`text-sm font-bold shrink-0 ${item._type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                          {item._type === 'expense' ? '-' : '+'}{formatAmount(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h3 className="section-title mb-3">{t('calendar.summary')}</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-500">{t('calendar.expenses')}</p>
            <p className="text-lg font-bold text-red-600">-{formatAmount(summary.totalExpenses)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('calendar.income')}</p>
            <p className="text-lg font-bold text-green-600">+{formatAmount(summary.totalIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('calendar.balance')}</p>
            <p className={`text-lg font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.balance >= 0 ? '+' : ''}{formatAmount(summary.balance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
