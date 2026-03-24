import { useState, useEffect, useMemo } from 'react'
import { useBudgetStore } from '../store/useBudgetStore'
import { useExpenseStore } from '../store/useExpenseStore'
import { useCategoryStore } from '../store/useCategoryStore'
import { useTranslation } from '../hooks/useTranslation'
import { formatAmount } from '../lib/utils'
import ConfirmModal from '../components/ui/Modal'

export default function BudgetPage() {
  const { t } = useTranslation()
  const { budgets, addBudget, updateBudget, deleteBudget, fetchBudgets, isLoading } = useBudgetStore()
  const expenses = useExpenseStore((s) => s.expenses)
  const fetchExpenses = useExpenseStore((s) => s.fetchExpenses)
  const { categories, fetchCategories } = useCategoryStore()
  const categoryNames = categories.map((c) => `${c.icon} ${c.name}`)

  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const emptyForm = { category: '__all__', limit_amount: '', period: 'monthly' }
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  useEffect(() => { fetchBudgets(); fetchExpenses(); fetchCategories() }, []) // eslint-disable-line

  const spentByCategory = useMemo(() => {
    const now = new Date(); const y = now.getFullYear(), m = now.getMonth()
    const map = {}; let total = 0
    expenses.forEach((e) => { const d = new Date(e.date); if (d.getFullYear() === y && d.getMonth() === m) { map[e.category] = (map[e.category] || 0) + Number(e.amount); total += Number(e.amount) } })
    map['__all__'] = total; return map
  }, [expenses])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  const openAddForm = () => { setEditingBudget(null); setForm(emptyForm); setFormError(''); setShowForm(true) }
  const openEditForm = (b) => { setEditingBudget(b); setForm({ category: b.category, limit_amount: String(b.limit_amount), period: b.period || 'monthly' }); setFormError(''); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditingBudget(null); setForm(emptyForm); setFormError('') }

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError('')
    const limitNum = parseFloat(String(form.limit_amount).replace(',', '.'))
    if (!limitNum || limitNum <= 0) { setFormError(t('addExpense.invalidAmount')); return }
    const payload = { category: form.category, limit_amount: limitNum, period: form.period }
    const result = editingBudget ? await updateBudget(editingBudget.id, payload) : await addBudget(payload)
    if (result) closeForm(); else setFormError(t('budget.saveError'))
  }

  const handleDelete = async () => { if (deleteId) { await deleteBudget(deleteId); setDeleteId(null) } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('budget.title')}</h1><p className="text-gray-500 mt-1">{t('budget.subtitle')}</p></div>
        <button onClick={openAddForm} className="btn-primary text-sm min-h-[44px]">{t('budget.newBudget')}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4 animate-slide-up border-primary-200">
          <h2 className="section-title">{editingBudget ? t('budget.editBudget') : t('budget.newBudget')}</h2>
          {formError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{formError}</div>}
          <div><label htmlFor="bc" className="label">{t('addExpense.category')}</label>
            <select id="bc" name="category" value={form.category} onChange={handleChange} className="input">
              <option value="__all__">{t('budget.allCategories')}</option>
              {categoryNames.map((c) => <option key={c} value={c}>{c}</option>)}
            </select></div>
          <div><label htmlFor="bl" className="label">{t('budget.limitAmount')}</label>
            <input id="bl" name="limit_amount" type="text" inputMode="decimal" placeholder="500" value={form.limit_amount} onChange={handleChange} className="input" required /></div>
          <div><label htmlFor="bp" className="label">{t('budget.period')}</label>
            <select id="bp" name="period" value={form.period} onChange={handleChange} className="input">
              <option value="monthly">{t('budget.monthly')}</option><option value="yearly">{t('budget.yearly')}</option>
            </select></div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 min-h-[44px]">{isLoading ? t('budget.saving') : t('budget.save')}</button>
            <button type="button" onClick={closeForm} className="btn-secondary min-h-[44px]">{t('budget.cancel')}</button>
          </div>
        </form>
      )}

      {budgets.length === 0 && !showForm ? (
        <div className="card"><p className="text-gray-400 text-sm text-center py-8">{t('budget.noBudgets')}</p></div>
      ) : (
        <div className="space-y-4">
          {budgets.map((b) => {
            const isAll = b.category === '__all__'
            const spent = spentByCategory[b.category] || 0
            const limit = Number(b.limit_amount)
            const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
            let barColor = 'bg-green-500', barBg = 'bg-green-100'
            if (pct >= 90) { barColor = 'bg-red-500'; barBg = 'bg-red-100' }
            else if (pct >= 60) { barColor = 'bg-yellow-500'; barBg = 'bg-yellow-100' }

            return (
              <div key={b.id} className="card animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{isAll ? t('budget.allExpensesLabel') : b.category}</h3>
                    <p className="text-xs text-gray-400">{b.period === 'yearly' ? t('budget.yearly') : t('budget.monthly')}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditForm(b)} className="btn-ghost text-xs px-2 py-1 min-w-[44px] min-h-[44px] flex items-center justify-center">✏️</button>
                    <button onClick={() => setDeleteId(b.id)} className="btn-ghost text-xs px-2 py-1 text-red-500 hover:bg-red-50 min-w-[44px] min-h-[44px] flex items-center justify-center">🗑️</button>
                  </div>
                </div>
                <div className={`w-full h-3 rounded-full ${barBg} overflow-hidden`}><div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} /></div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-gray-600">{t('budget.spent')}: <span className="font-semibold">{formatAmount(spent)}</span></span>
                  <span className="text-gray-400">{t('budget.of')} {formatAmount(limit)}</span>
                </div>
                <p className={`text-xs font-medium mt-1 ${pct >= 90 ? 'text-red-600' : pct >= 60 ? 'text-yellow-600' : 'text-green-600'}`}>{pct.toFixed(0)}% {t('budget.used')}</p>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} title={t('budget.confirmDelete')} text={t('expenses.confirmDeleteText')}
        cancelLabel={t('modal.cancel')} confirmLabel={t('modal.delete')} onCancel={() => setDeleteId(null)} onConfirm={handleDelete} danger />
    </div>
  )
}
