import { useState, useEffect, useMemo } from 'react'
import { useBudgetStore } from '../store/useBudgetStore'
import { useExpenseStore, DEFAULT_CATEGORIES } from '../store/useExpenseStore'
import { formatAmount } from '../lib/utils'

/**
 * Strona budżetów – ustawianie limitów i śledzenie wydatków per kategoria.
 */
export default function BudgetPage() {
  const { budgets, addBudget, updateBudget, deleteBudget, fetchBudgets, isLoading } =
    useBudgetStore()
  const expenses = useExpenseStore((s) => s.expenses)
  const fetchExpenses = useExpenseStore((s) => s.fetchExpenses)

  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)

  // Początkowy stan formularza
  const emptyForm = {
    category: DEFAULT_CATEGORIES[0],
    limit_amount: '',
    period: 'monthly',
  }
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  // Pobierz dane przy montowaniu
  useEffect(() => {
    fetchBudgets()
    fetchExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Oblicz wydatki per kategoria w bieżącym miesiącu ───
  const spentByCategory = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    const map = {}
    expenses.forEach((exp) => {
      const d = new Date(exp.date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        map[exp.category] = (map[exp.category] || 0) + Number(exp.amount)
      }
    })
    return map
  }, [expenses])

  // ─── Obsługa formularza ───
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const openAddForm = () => {
    setEditingBudget(null)
    setForm(emptyForm)
    setFormError('')
    setShowForm(true)
  }

  const openEditForm = (budget) => {
    setEditingBudget(budget)
    setForm({
      category: budget.category,
      limit_amount: String(budget.limit_amount),
      period: budget.period || 'monthly',
    })
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingBudget(null)
    setForm(emptyForm)
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    const limitNum = parseFloat(String(form.limit_amount).replace(',', '.'))
    if (!limitNum || limitNum <= 0) {
      setFormError('Podaj prawidłowy limit kwoty')
      return
    }

    const payload = {
      category: form.category,
      limit_amount: limitNum,
      period: form.period,
    }

    let result
    if (editingBudget) {
      result = await updateBudget(editingBudget.id, payload)
    } else {
      result = await addBudget(payload)
    }

    if (result) {
      closeForm()
    } else {
      setFormError('Błąd zapisu. Sprawdź połączenie z bazą danych.')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten budżet?')) {
      await deleteBudget(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── Nagłówek ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budżet</h1>
          <p className="text-gray-500 mt-1">Ustaw limity dla swoich wydatków</p>
        </div>
        <button onClick={openAddForm} className="btn-primary text-sm">
          + Nowy budżet
        </button>
      </div>

      {/* ─── Formularz dodawania / edycji (inline) ─── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="card space-y-4 animate-slide-up border-primary-200"
        >
          <h2 className="section-title">
            {editingBudget ? 'Edytuj budżet' : 'Nowy budżet'}
          </h2>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {formError}
            </div>
          )}

          {/* Kategoria */}
          <div>
            <label htmlFor="budget-category" className="label">Kategoria</label>
            <select
              id="budget-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input"
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Limit kwoty */}
          <div>
            <label htmlFor="budget-limit" className="label">Limit kwoty (PLN)</label>
            <input
              id="budget-limit"
              name="limit_amount"
              type="text"
              inputMode="decimal"
              placeholder="np. 500"
              value={form.limit_amount}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* Okres */}
          <div>
            <label htmlFor="budget-period" className="label">Okres</label>
            <select
              id="budget-period"
              name="period"
              value={form.period}
              onChange={handleChange}
              className="input"
            >
              <option value="monthly">Miesięczny</option>
              <option value="yearly">Roczny</option>
            </select>
          </div>

          {/* Przyciski */}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? 'Zapisywanie...' : 'Zapisz'}
            </button>
            <button type="button" onClick={closeForm} className="btn-secondary">
              Anuluj
            </button>
          </div>
        </form>
      )}

      {/* ─── Lista budżetów ─── */}
      {budgets.length === 0 && !showForm ? (
        <div className="card">
          <p className="text-gray-400 text-sm text-center py-8">
            Brak budżetów. Stwórz swój pierwszy budżet! 💰
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spent={spentByCategory[budget.category] || 0}
              onEdit={() => openEditForm(budget)}
              onDelete={() => handleDelete(budget.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Komponent karty budżetu ───
function BudgetCard({ budget, spent, onEdit, onDelete }) {
  const limit = Number(budget.limit_amount)
  const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0

  // Kolor paska: zielony <60%, żółty 60-90%, czerwony >90%
  let barColor = 'bg-green-500'
  let barBg = 'bg-green-100'
  if (percent >= 90) {
    barColor = 'bg-red-500'
    barBg = 'bg-red-100'
  } else if (percent >= 60) {
    barColor = 'bg-yellow-500'
    barBg = 'bg-yellow-100'
  }

  return (
    <div className="card animate-fade-in">
      {/* Nagłówek karty */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{budget.category}</h3>
          <p className="text-xs text-gray-400">
            {budget.period === 'yearly' ? 'Roczny' : 'Miesięczny'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="btn-ghost text-xs px-2 py-1"
            title="Edytuj"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="btn-ghost text-xs px-2 py-1 text-red-500 hover:bg-red-50"
            title="Usuń"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Pasek postępu */}
      <div className={`w-full h-3 rounded-full ${barBg} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Kwoty */}
      <div className="flex items-center justify-between mt-2 text-sm">
        <span className="text-gray-600">
          Wydano: <span className="font-semibold">{formatAmount(spent)}</span>
        </span>
        <span className="text-gray-400">
          z {formatAmount(limit)}
        </span>
      </div>

      {/* Procent */}
      <p className={`text-xs font-medium mt-1 ${percent >= 90 ? 'text-red-600' : percent >= 60 ? 'text-yellow-600' : 'text-green-600'
        }`}>
        {percent.toFixed(0)}% wykorzystane
      </p>
    </div>
  )
}
