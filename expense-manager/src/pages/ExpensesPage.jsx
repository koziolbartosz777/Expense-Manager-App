import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useExpenses } from '../hooks/useExpenses'
import { useExpenseStore, DEFAULT_CATEGORIES } from '../store/useExpenseStore'
import { formatAmount, formatDate } from '../lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Najnowsze' },
  { value: 'oldest', label: 'Najstarsze' },
  { value: 'amount_desc', label: 'Kwota: malejąco' },
  { value: 'amount_asc', label: 'Kwota: rosnąco' },
  { value: 'category_az', label: 'Kategoria A-Z' },
]

export default function ExpensesPage() {
  const navigate = useNavigate()
  const { expenses, isLoading } = useExpenses()
  const deleteExpense = useExpenseStore((s) => s.deleteExpense)

  // Filtry
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const hasActiveFilters = search || filterCategory || dateFrom || dateTo || sortBy !== 'newest'

  const clearFilters = () => {
    setSearch('')
    setFilterCategory('')
    setDateFrom('')
    setDateTo('')
    setSortBy('newest')
  }

  const filtered = useMemo(() => {
    let result = expenses.filter((e) => {
      // Szukanie tekstowe
      const matchSearch =
        !search ||
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.amount?.toString().includes(search) ||
        e.category?.toLowerCase().includes(search.toLowerCase())

      // Filtr kategorii
      const matchCat = !filterCategory || e.category === filterCategory

      // Filtr dat
      const matchDateFrom = !dateFrom || e.date >= dateFrom
      const matchDateTo = !dateTo || e.date <= dateTo

      return matchSearch && matchCat && matchDateFrom && matchDateTo
    })

    // Sortowanie
    switch (sortBy) {
      case 'oldest':
        result = [...result].sort((a, b) => a.date.localeCompare(b.date))
        break
      case 'amount_desc':
        result = [...result].sort((a, b) => Number(b.amount) - Number(a.amount))
        break
      case 'amount_asc':
        result = [...result].sort((a, b) => Number(a.amount) - Number(b.amount))
        break
      case 'category_az':
        result = [...result].sort((a, b) => a.category.localeCompare(b.category))
        break
      default: // newest
        result = [...result].sort((a, b) => b.date.localeCompare(a.date))
    }

    return result
  }, [expenses, search, filterCategory, dateFrom, dateTo, sortBy])

  // Suma przefiltrowanych
  const filteredTotal = useMemo(
    () => filtered.reduce((s, e) => s + Number(e.amount), 0),
    [filtered]
  )

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

      {/* ─── Panel filtrów ─── */}
      <div className="card space-y-3">
        {/* Wyszukiwanie */}
        <input
          type="text"
          placeholder="Szukaj po opisie, kwocie, kategorii..."
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Kategoria + Sortowanie */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <select
            className="input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Zakres dat */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Od</label>
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Do</label>
            <input
              type="date"
              className="input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Wyczyść filtry + Licznik */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-gray-500">
            Znaleziono <span className="font-semibold text-gray-900">{filtered.length}</span> wydatków
            {filtered.length > 0 && (
              <> · suma: <span className="font-semibold text-gray-900">{formatAmount(filteredTotal)}</span></>
            )}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-500 hover:text-primary-700 font-medium min-h-[44px] min-w-[44px] flex items-center"
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      </div>

      {/* ─── Lista wydatków ─── */}
      <div className="card divide-y divide-gray-100">
        {isLoading ? (
          <p className="text-gray-400 text-sm text-center py-8">Ładowanie...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Brak wydatków do wyświetlenia. 📋
          </p>
        ) : (
          filtered.map((expense) => (
            <div
              key={expense.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2 sm:gap-4"
            >
              {/* Info */}
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

              {/* Kwota + Akcje — osobny wiersz na mobile */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span className="text-base font-bold text-gray-900">
                  {formatAmount(expense.amount)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/add?edit=${expense.id}`)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium
                               min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium
                               min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
