import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useIncomeStore } from '../store/useIncomeStore'
import { useTranslation } from '../hooks/useTranslation'
import { parseAmount } from '../lib/utils'
import { getTranslatedIncomeCategories, translateIncomeCategory } from '../lib/categories'

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

export default function AddIncomePage() {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const income = useIncomeStore((s) => s.income)
  const addIncome = useIncomeStore((s) => s.addIncome)
  const updateIncome = useIncomeStore((s) => s.updateIncome)
  const isLoading = useIncomeStore((s) => s.isLoading)

  const categoryOptions = getTranslatedIncomeCategories(language)

  const isEditMode = Boolean(editId)
  const editingIncome = isEditMode ? income.find((i) => i.id === editId) : null

  const [form, setForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_frequency: 'monthly',
    recurring_start_date: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState('')

  // Ustaw domyślną kategorię
  useEffect(() => {
    if (categoryOptions.length > 0 && !form.category && !isEditMode) {
      setForm((f) => ({ ...f, category: categoryOptions[0].value }))
    }
  }, [categoryOptions.length])

  useEffect(() => {
    if (editingIncome) setForm({
      amount: String(editingIncome.amount).replace('.', ','),
      category: editingIncome.category,
      description: editingIncome.description || '',
      date: editingIncome.date,
      is_recurring: editingIncome.is_recurring || false,
      recurring_frequency: editingIncome.recurring_frequency || 'monthly',
      recurring_start_date: editingIncome.date,
    })
  }, [editingIncome])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const nextDate = useMemo(() => {
    if (!form.is_recurring) return null
    return calcNextDate(form.recurring_start_date, form.recurring_frequency)
  }, [form.is_recurring, form.recurring_start_date, form.recurring_frequency])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    const amount = parseAmount(form.amount)
    if (!amount || amount <= 0) { setError(t('addIncome.invalidAmount')); return }

    const payload = {
      amount,
      category: form.category,
      description: form.description,
      date: form.date,
      is_recurring: form.is_recurring,
      recurring_frequency: form.is_recurring ? form.recurring_frequency : null,
      recurring_next_date: form.is_recurring ? calcNextDate(form.recurring_start_date, form.recurring_frequency) : null,
    }

    const result = isEditMode ? await updateIncome(editId, payload) : await addIncome(payload)
    if (result) navigate('/income')
    else setError(t('addIncome.saveError'))
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? t('addIncome.editTitle') : t('addIncome.title')}</h1>
        <p className="text-gray-500 mt-1">{isEditMode ? t('addIncome.editSubtitle') : t('addIncome.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

        <div><label htmlFor="amount" className="label">{t('addIncome.amount')}</label>
          <input id="amount" name="amount" type="text" inputMode="decimal" placeholder="0,00" value={form.amount} onChange={handleChange} className="input text-2xl font-bold text-center" required /></div>

        <div><label htmlFor="category" className="label">{t('addIncome.category')}</label>
          <select id="category" name="category" value={form.category} onChange={handleChange} className="input">
            {categoryOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select></div>

        <div><label htmlFor="description" className="label">{t('addIncome.description')}</label>
          <input id="description" name="description" type="text" placeholder={t('addIncome.descPlaceholder')} value={form.description} onChange={handleChange} className="input" /></div>

        <div><label htmlFor="date" className="label">{t('addIncome.date')}</label>
          <input id="date" name="date" type="date" value={form.date} onChange={handleChange} className="input" required /></div>

        {/* Przychód cykliczny */}
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
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🔄 {t('addIncome.isRecurring')}</span>
          </label>

          {form.is_recurring && (
            <div className="space-y-3 animate-slide-up pl-1 border-l-2 border-primary-200 dark:border-primary-800 ml-2">
              <div className="pl-3">
                <label htmlFor="recurring_frequency" className="label">{t('addIncome.frequency')}</label>
                <select
                  id="recurring_frequency"
                  name="recurring_frequency"
                  value={form.recurring_frequency}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="weekly">{t('addIncome.weekly')}</option>
                  <option value="biweekly">{t('addIncome.biweekly')}</option>
                  <option value="monthly">{t('addIncome.monthly')}</option>
                  <option value="quarterly">{t('addIncome.quarterly')}</option>
                  <option value="yearly">{t('addIncome.yearly')}</option>
                </select>
              </div>
              <div className="pl-3">
                <label htmlFor="recurring_start_date" className="label">{t('addIncome.startDate')}</label>
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
                  📅 {t('addIncome.nextPreview')}: {formatPreviewDate(nextDate, language)}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isLoading} className="btn-primary flex-1 min-h-[48px]">
            {isLoading ? t('addIncome.saving') : isEditMode ? t('addIncome.update') : t('addIncome.save')}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary min-h-[48px]">{t('addIncome.cancel')}</button>
        </div>
      </form>
    </div>
  )
}
