import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useExpenses } from '../hooks/useExpenses'
import { useExpenseStore } from '../store/useExpenseStore'
import { useCategoryStore } from '../store/useCategoryStore'
import { useTranslation } from '../hooks/useTranslation'
import { formatAmount, formatDate } from '../lib/utils'
import { translateCategory } from '../lib/categories'
import ConfirmModal from '../components/ui/Modal'

const FREQ_LABELS = {
  weekly: 'addExpense.weekly',
  biweekly: 'addExpense.biweekly',
  monthly: 'addExpense.monthly',
  quarterly: 'addExpense.quarterly',
  yearly: 'addExpense.yearly',
}

export default function ExpensesPage() {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const { expenses, isLoading } = useExpenses()
  const deleteExpense = useExpenseStore((s) => s.deleteExpense)
  const { categories, fetchCategories } = useCategoryStore()

  // value = polski, label = przetłumaczony
  const categoryOptions = categories.map((c) => {
    const value = `${c.icon} ${c.name}`
    return { value, label: translateCategory(value, language) }
  })

  useEffect(() => { fetchCategories() }, []) // eslint-disable-line

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterRecurring, setFilterRecurring] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [deleteId, setDeleteId] = useState(null)

  const SORT_OPTIONS = [
    { value: 'newest', label: t('expenses.newest') },
    { value: 'oldest', label: t('expenses.oldest') },
    { value: 'amount_desc', label: t('expenses.amountDesc') },
    { value: 'amount_asc', label: t('expenses.amountAsc') },
    { value: 'category_az', label: t('expenses.categoryAZ') },
  ]

  const hasActiveFilters = search || filterCategory || filterRecurring || dateFrom || dateTo || sortBy !== 'newest'
  const clearFilters = () => { setSearch(''); setFilterCategory(''); setFilterRecurring(false); setDateFrom(''); setDateTo(''); setSortBy('newest') }

  const filtered = useMemo(() => {
    let result = expenses.filter((e) => {
      // Szukaj po przetłumaczonej nazwie kategorii
      const translatedCat = translateCategory(e.category, language)
      const ms = !search ||
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.amount?.toString().includes(search) ||
        translatedCat?.toLowerCase().includes(search.toLowerCase()) ||
        e.category?.toLowerCase().includes(search.toLowerCase())
      const recurringMatch = !filterRecurring || e.is_recurring
      return ms && (!filterCategory || e.category === filterCategory) && recurringMatch && (!dateFrom || e.date >= dateFrom) && (!dateTo || e.date <= dateTo)
    })
    switch (sortBy) {
      case 'oldest': result = [...result].sort((a, b) => a.date.localeCompare(b.date)); break
      case 'amount_desc': result = [...result].sort((a, b) => Number(b.amount) - Number(a.amount)); break
      case 'amount_asc': result = [...result].sort((a, b) => Number(a.amount) - Number(b.amount)); break
      case 'category_az': result = [...result].sort((a, b) => {
        const aT = translateCategory(a.category, language)
        const bT = translateCategory(b.category, language)
        return aT.localeCompare(bT)
      }); break
      default: result = [...result].sort((a, b) => b.date.localeCompare(a.date))
    }
    return result
  }, [expenses, search, filterCategory, filterRecurring, dateFrom, dateTo, sortBy, language])

  const filteredTotal = useMemo(() => filtered.reduce((s, e) => s + Number(e.amount), 0), [filtered])

  const handleDelete = async () => {
    if (deleteId) { await deleteExpense(deleteId); setDeleteId(null) }
  }

  // Empty state
  if (!isLoading && expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 animate-fade-in">
        <span className="text-6xl">📋</span>
        <h2 className="text-xl font-bold text-gray-900">{t('expenses.noExpenses')}</h2>
        <p className="text-gray-500 max-w-xs">{t('expenses.noExpensesHint')}</p>
        <button onClick={() => navigate('/add')} className="btn-primary">{t('expenses.addExpenseBtn')}</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('expenses.title')}</h1>
        <p className="text-gray-500 mt-1">{t('expenses.subtitle')}</p>
      </div>

      <div className="card space-y-3">
        <input type="text" placeholder={t('expenses.search')} className="input" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select className="input" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">{t('expenses.allCategories')}</option>
            {categoryOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterRecurring(!filterRecurring)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all min-h-[36px] ${filterRecurring ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
          >
            {t('expenses.recurringFilter')}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">{t('expenses.from')}</label><input type="date" className="input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
          <div><label className="label">{t('expenses.to')}</label><input type="date" className="input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-gray-500">
            {t('expenses.found')} <span className="font-semibold text-gray-900">{filtered.length}</span> {t('expenses.expensesCount')}
            {filtered.length > 0 && <> · {t('expenses.sum')}: <span className="font-semibold text-gray-900">{formatAmount(filteredTotal)}</span></>}
          </p>
          {hasActiveFilters && <button onClick={clearFilters} className="text-sm text-primary-500 hover:text-primary-700 font-medium min-h-[44px] flex items-center">{t('expenses.clearFilters')}</button>}
        </div>
      </div>

      <div className="card divide-y divide-gray-100">
        {isLoading ? (
          <p className="text-gray-400 text-sm text-center py-8">{t('common.loading')}</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">{t('expenses.noExpenses')} 📋</p>
        ) : (
          filtered.map((expense) => (
            <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900 truncate">{translateCategory(expense.category, language)}</span>
                  <span className="text-xs text-gray-400">{formatDate(expense.date, language)}</span>
                  {expense.is_recurring && (
                    <span className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                      🔄 {t(FREQ_LABELS[expense.recurring_frequency] || 'expenses.recurring')}
                    </span>
                  )}
                </div>
                {expense.description && <p className="text-sm text-gray-500 truncate mt-0.5">{expense.description}</p>}
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span className="text-base font-bold text-gray-900">{formatAmount(expense.amount)}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => navigate(`/add?edit=${expense.id}`)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium min-h-[44px] min-w-[44px] flex items-center justify-center">{t('expenses.edit')}</button>
                  <button onClick={() => setDeleteId(expense.id)} className="text-xs text-red-500 hover:text-red-700 font-medium min-h-[44px] min-w-[44px] flex items-center justify-center">{t('expenses.delete')}</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal isOpen={!!deleteId} title={t('expenses.confirmDelete')} text={t('expenses.confirmDeleteText')}
        cancelLabel={t('modal.cancel')} confirmLabel={t('expenses.confirmDeleteBtn')}
        onCancel={() => setDeleteId(null)} onConfirm={handleDelete} danger />
    </div>
  )
}
