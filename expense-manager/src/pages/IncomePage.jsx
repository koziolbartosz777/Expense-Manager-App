import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIncome } from '../hooks/useIncome'
import { useIncomeStore } from '../store/useIncomeStore'
import { useTranslation } from '../hooks/useTranslation'
import { formatAmount, formatDate } from '../lib/utils'
import { translateIncomeCategory, getTranslatedIncomeCategories } from '../lib/categories'
import ConfirmModal from '../components/ui/Modal'

const FREQ_LABELS = {
  weekly: 'addIncome.weekly',
  biweekly: 'addIncome.biweekly',
  monthly: 'addIncome.monthly',
  quarterly: 'addIncome.quarterly',
  yearly: 'addIncome.yearly',
}

export default function IncomePage() {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const { income, isLoading } = useIncome()
  const deleteIncome = useIncomeStore((s) => s.deleteIncome)

  const categoryOptions = getTranslatedIncomeCategories(language)

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterRecurring, setFilterRecurring] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [deleteId, setDeleteId] = useState(null)

  const SORT_OPTIONS = [
    { value: 'newest', label: t('income.newest') },
    { value: 'oldest', label: t('income.oldest') },
    { value: 'amount_desc', label: t('income.amountDesc') },
    { value: 'amount_asc', label: t('income.amountAsc') },
    { value: 'category_az', label: t('income.categoryAZ') },
  ]

  const hasActiveFilters = search || filterCategory || filterRecurring || dateFrom || dateTo || sortBy !== 'newest'
  const clearFilters = () => { setSearch(''); setFilterCategory(''); setFilterRecurring(false); setDateFrom(''); setDateTo(''); setSortBy('newest') }

  const filtered = useMemo(() => {
    let result = income.filter((i) => {
      const translatedCat = translateIncomeCategory(i.category, language)
      const ms = !search ||
        i.description?.toLowerCase().includes(search.toLowerCase()) ||
        i.amount?.toString().includes(search) ||
        translatedCat?.toLowerCase().includes(search.toLowerCase()) ||
        i.category?.toLowerCase().includes(search.toLowerCase())
      const recurringMatch = !filterRecurring || i.is_recurring
      return ms && (!filterCategory || i.category === filterCategory) && recurringMatch && (!dateFrom || i.date >= dateFrom) && (!dateTo || i.date <= dateTo)
    })
    switch (sortBy) {
      case 'oldest': result = [...result].sort((a, b) => a.date.localeCompare(b.date)); break
      case 'amount_desc': result = [...result].sort((a, b) => Number(b.amount) - Number(a.amount)); break
      case 'amount_asc': result = [...result].sort((a, b) => Number(a.amount) - Number(b.amount)); break
      case 'category_az': result = [...result].sort((a, b) => {
        const aT = translateIncomeCategory(a.category, language)
        const bT = translateIncomeCategory(b.category, language)
        return aT.localeCompare(bT)
      }); break
      default: result = [...result].sort((a, b) => b.date.localeCompare(a.date))
    }
    return result
  }, [income, search, filterCategory, filterRecurring, dateFrom, dateTo, sortBy, language])

  const filteredTotal = useMemo(() => filtered.reduce((s, i) => s + Number(i.amount), 0), [filtered])

  const handleDelete = async () => {
    if (deleteId) { await deleteIncome(deleteId); setDeleteId(null) }
  }

  // Empty state
  if (!isLoading && income.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 animate-fade-in">
        <span className="text-6xl">💰</span>
        <h2 className="text-xl font-bold text-gray-900">{t('income.noIncome')}</h2>
        <p className="text-gray-500 max-w-xs">{t('income.noIncomeHint')}</p>
        <button onClick={() => navigate('/add-income')} className="btn-primary">{t('income.addIncomeBtn')}</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('income.title')}</h1>
        <p className="text-gray-500 mt-1">{t('income.subtitle')}</p>
      </div>

      <div className="card space-y-3">
        <input type="text" placeholder={t('income.search')} className="input" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select className="input" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">{t('income.allCategories')}</option>
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
            {t('income.recurringFilter')}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">{t('income.from')}</label><input type="date" className="input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
          <div><label className="label">{t('income.to')}</label><input type="date" className="input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-gray-500">
            {t('income.found')} <span className="font-semibold text-gray-900">{filtered.length}</span> {t('income.incomeCount')}
            {filtered.length > 0 && <> · {t('income.sum')}: <span className="font-semibold text-green-600">{formatAmount(filteredTotal)}</span></>}
          </p>
          {hasActiveFilters && <button onClick={clearFilters} className="text-sm text-primary-500 hover:text-primary-700 font-medium min-h-[44px] flex items-center">{t('income.clearFilters')}</button>}
        </div>
      </div>

      <div className="card divide-y divide-gray-100">
        {isLoading ? (
          <p className="text-gray-400 text-sm text-center py-8">{t('common.loading')}</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">{t('income.noIncome')} 💰</p>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900 truncate">{translateIncomeCategory(item.category, language)}</span>
                  <span className="text-xs text-gray-400">{formatDate(item.date, language)}</span>
                  {item.is_recurring && (
                    <span className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                      🔄 {t(FREQ_LABELS[item.recurring_frequency] || 'income.recurring')}
                    </span>
                  )}
                </div>
                {item.description && <p className="text-sm text-gray-500 truncate mt-0.5">{item.description}</p>}
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span className="text-base font-bold text-green-600">{formatAmount(item.amount)}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => navigate(`/add-income?edit=${item.id}`)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium min-h-[44px] min-w-[44px] flex items-center justify-center">{t('income.edit')}</button>
                  <button onClick={() => setDeleteId(item.id)} className="text-xs text-red-500 hover:text-red-700 font-medium min-h-[44px] min-w-[44px] flex items-center justify-center">{t('income.delete')}</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal isOpen={!!deleteId} title={t('income.confirmDelete')} text={t('income.confirmDeleteText')}
        cancelLabel={t('modal.cancel')} confirmLabel={t('income.confirmDeleteBtn')}
        onCancel={() => setDeleteId(null)} onConfirm={handleDelete} danger />
    </div>
  )
}
