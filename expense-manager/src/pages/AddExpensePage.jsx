import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useExpenseStore } from '../store/useExpenseStore'
import { useCategoryStore } from '../store/useCategoryStore'
import { useTranslation } from '../hooks/useTranslation'
import { parseAmount } from '../lib/utils'
import { translateCategory } from '../lib/categories'

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

  const [form, setForm] = useState({ amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] })
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
    })
  }, [editingExpense])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    const amount = parseAmount(form.amount)
    if (!amount || amount <= 0) { setError(t('addExpense.invalidAmount')); return }
    // category jest zawsze polskim value — bezpiecznie do DB
    const payload = { amount, category: form.category, description: form.description, date: form.date }
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
