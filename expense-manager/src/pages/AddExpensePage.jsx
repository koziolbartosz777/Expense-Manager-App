import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useExpenseStore } from '../store/useExpenseStore'
import { useCategoryStore } from '../store/useCategoryStore'
import { useTranslation } from '../hooks/useTranslation'
import { parseAmount } from '../lib/utils'
import { translateCategory } from '../lib/categories'

/**
 * Oblicza recurring_next_date na podstawie daty i częstotliwości.
 */
function calcNextDate(dateStr, frequency) {
  const d = new Date(dateStr)
  switch (frequency) {
    case 'weekly': d.setDate(d.getDate() + 7); break
    case 'biweekly': d.setDate(d.getDate() + 14); break
    case 'monthly': d.setMonth(d.getMonth() + 1); break
    case 'quarterly': d.setMonth(d.getMonth() + 3); break
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break
  }
  return d.toISOString().split('T')[0]
}

function formatPreviewDate(dateStr, language) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(language === 'pl' ? 'pl-PL' : language === 'de' ? 'de-DE' : 'en-US', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function AddExpensePage() {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const expenses = useExpenseStore((s) => s.expenses)
  const addExpense = useExpenseStore((s) => s.addExpense)
  const updateExpense = useExpenseStore((s) => s.updateExpense)
  const isLoading = useExpenseStore((s) => s.isLoading)
  const { categories, fetchCategories } = useCategoryStore()

  // value = zawsze polski (do zapisu w DB), label = tłumaczony (do wyświetlania)
  const categoryOptions = categories.map((c) => {
    const value = `${c.icon} ${c.name}` // DB value (polski)
    return { value, label: translateCategory(value, language) }
  })

  useEffect(() => { fetchCategories() }, []) // eslint-disable-line

  const isEditMode = Boolean(editId)
  const editingExpense = isEditMode ? expenses.find((e) => e.id === editId) : null

  const [form, setForm] = useState({
    amount: '', category: '', description: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_frequency: 'monthly',
    recurring_start_date: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState('')

  // Ustaw domyślną kategorię (polski value)
  useEffect(() => {
    if (categoryOptions.length > 0 && !form.category && !isEditMode) {
      setForm((f) => ({ ...f, category: categoryOptions[0].value }))
    }
  }, [categoryOptions.length])

  useEffect(() => {
    if (editingExpense) setForm({
      amount: String(editingExpense.amount).replace('.', ','),
      category: editingExpense.category,
      description: editingExpense.description || '',
      date: editingExpense.date,
      is_recurring: editingExpense.is_recurring || false,
      recurring_frequency: editingExpense.recurring_frequency || 'monthly',
      recurring_start_date: editingExpense.date,
    })
  }, [editingExpense])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const nextDate = useMemo(() => {
    if (!form.is_recurring) return null
    return calcNextDate(form.recurring_start_date, form.recurring_frequency)
  }, [form.is_recurring, form.recurring_start_date, form.recurring_frequency])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    const amount = parseAmount(form.amount)
    if (!amount || amount <= 0) { setError(t('addExpense.invalidAmount')); return }
    // category jest zawsze polskim value — bezpiecznie do DB
    const payload = {
      amount, category: form.category, description: form.description, date: form.date,
      is_recurring: form.is_recurring,
      recurring_frequency: form.is_recurring ? form.recurring_frequency : null,
      recurring_next_date: form.is_recurring ? calcNextDate(form.recurring_start_date, form.recurring_frequency) : null,
    }
    const result = isEditMode ? await updateExpense(editId, payload) : await addExpense(payload)
    if (result) navigate('/expenses')
    else setError(t('addExpense.saveError'))
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? t('addExpense.editTitle') : t('addExpense.title')}</h1>
        <p className="text-gray-500 mt-1">{isEditMode ? t('addExpense.editSubtitle') : t('addExpense.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

        <div><label htmlFor="amount" className="label">{t('addExpense.amount')}</label>
          <input id="amount" name="amount" type="text" inputMode="decimal" placeholder="0,00" value={form.amount} onChange={handleChange} className="input text-2xl font-bold text-center" required /></div>

        <div><label htmlFor="category" className="label">{t('addExpense.category')}</label>
          <select id="category" name="category" value={form.category} onChange={handleChange} className="input">
            {categoryOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select></div>

        <div><label htmlFor="description" className="label">{t('addExpense.description')}</label>
          <input id="description" name="description" type="text" placeholder={t('addExpense.descPlaceholder')} value={form.description} onChange={handleChange} className="input" /></div>

        <div><label htmlFor="date" className="label">{t('addExpense.date')}</label>
          <input id="date" name="date" type="date" value={form.date} onChange={handleChange} className="input" required /></div>

        {/* Wydatek cykliczny */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.is_recurring}
                onChange={(e) => setForm((f) => ({ ...f, is_recurring: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-[#333] rounded-full peer-checked:bg-primary-500 transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🔄 {t('addExpense.isRecurring')}</span>
          </label>

          {form.is_recurring && (
            <div className="space-y-3 animate-slide-up pl-1 border-l-2 border-primary-200 dark:border-primary-800 ml-2">
              <div className="pl-3">
                <label htmlFor="recurring_frequency" className="label">{t('addExpense.frequency')}</label>
                <select
                  id="recurring_frequency"
                  name="recurring_frequency"
                  value={form.recurring_frequency}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="weekly">{t('addExpense.weekly')}</option>
                  <option value="biweekly">{t('addExpense.biweekly')}</option>
                  <option value="monthly">{t('addExpense.monthly')}</option>
                  <option value="quarterly">{t('addExpense.quarterly')}</option>
                  <option value="yearly">{t('addExpense.yearly')}</option>
                </select>
              </div>
              <div className="pl-3">
                <label htmlFor="recurring_start_date" className="label">{t('addExpense.startDate')}</label>
                <input
                  id="recurring_start_date"
                  name="recurring_start_date"
                  type="date"
                  value={form.recurring_start_date}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              {nextDate && (
                <p className="pl-3 text-sm text-primary-600 dark:text-primary-400 font-medium">
                  📅 {t('addExpense.nextPreview')}: {formatPreviewDate(nextDate, language)}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isLoading} className="btn-primary flex-1 min-h-[48px]">
            {isLoading ? t('addExpense.saving') : isEditMode ? t('addExpense.update') : t('addExpense.save')}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary min-h-[48px]">{t('addExpense.cancel')}</button>
        </div>
      </form>
    </div>
  )
}
