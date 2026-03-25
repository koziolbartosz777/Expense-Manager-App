import { useState, useEffect } from 'react'
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
    case 'monthly': d.setMonth(d.getMonth() + 1); break
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break
  }
  return d.toISOString().split('T')[0]
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
    })
  }, [editingIncome])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

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
      recurring_next_date: form.is_recurring ? calcNextDate(form.date, form.recurring_frequency) : null,
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
            <input
              type="checkbox"
              checked={form.is_recurring}
              onChange={(e) => setForm((f) => ({ ...f, is_recurring: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('addIncome.isRecurring')}</span>
          </label>

          {form.is_recurring && (
            <div className="animate-slide-up">
              <label htmlFor="recurring_frequency" className="label">{t('addIncome.frequency')}</label>
              <select
                id="recurring_frequency"
                name="recurring_frequency"
                value={form.recurring_frequency}
                onChange={handleChange}
                className="input"
              >
                <option value="weekly">{t('addIncome.weekly')}</option>
                <option value="monthly">{t('addIncome.monthly')}</option>
                <option value="yearly">{t('addIncome.yearly')}</option>
              </select>
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
