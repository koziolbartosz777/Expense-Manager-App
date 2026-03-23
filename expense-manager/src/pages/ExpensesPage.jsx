import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useExpenses } from '../hooks/useExpenses'
import { useExpenseStore } from '../store/useExpenseStore'
import { formatAmount, formatDate } from '../lib/utils'
import { DEFAULT_CATEGORIES } from '../store/useExpenseStore'

// TODO: Edycja inline wydatku (modal lub rozwijany formularz w wierszu)

export default function ExpensesPage() {
  const navigate = useNavigate()
  const { expenses, isLoading } = useExpenses()
  const deleteExpense = useExpenseStore((s) => s.deleteExpense)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        !search ||
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.amount?.toString().includes(search) ||
        e.category?.toLowerCase().includes(search.toLowerCase())
      const matchCat = !filterCategory || e.category === filterCategory
      return matchSearch && matchCat
    })
  }, [expenses, search, filterCategory])

  const handleDelete = async (id) => {
    if (window.confirm('Usunąć ten wydatek?')) {
      await deleteExpense(id)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wydatki</h1>
        <p className="text-gray-500 mt-1">Przeglądaj i zarządzaj wydatkami</p>
      </div>

      {/* Filtry */}
      <div className="card space-y-3">
        <input
          type="text"
          placeholder="Szukaj po opisie, kwocie, kategorii..."
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Wszystkie kategorie</option>
          {DEFAULT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      <div className="card divide-y divide-gray-100">
        {isLoading ? (
          <p className="text-gray-400 text-sm text-center py-8">Ładowanie...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Brak wydatków do wyświetlenia. 📋
          </p>
        ) : (
          filtered.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between py-4 gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {expense.category}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
                </div>
                {expense.description && (
                  <p className="text-sm text-gray-500 truncate mt-0.5">{expense.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-base font-bold text-gray-900">
                  {formatAmount(expense.amount)}
                </span>
                <button
                  onClick={() => navigate(`/add?edit=${expense.id}`)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Edytuj
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
