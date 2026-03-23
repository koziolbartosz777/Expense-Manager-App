import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useExpenseStore, DEFAULT_CATEGORIES } from '../store/useExpenseStore'
import { parseAmount } from '../lib/utils'

/**
 * Strona dodawania / edycji wydatku.
 * Tryb edycji aktywowany przez ?edit=ID w URL.
 */
export default function AddExpensePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const expenses = useExpenseStore((s) => s.expenses)
  const addExpense = useExpenseStore((s) => s.addExpense)
  const updateExpense = useExpenseStore((s) => s.updateExpense)
  const isLoading = useExpenseStore((s) => s.isLoading)

  const isEditMode = Boolean(editId)
  const editingExpense = isEditMode
    ? expenses.find((e) => e.id === editId)
    : null

  const [form, setForm] = useState({
    amount: '',
    category: DEFAULT_CATEGORIES[0],
    description: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState('')

  // Wypełnij formularz danymi wydatku w trybie edycji
  useEffect(() => {
    if (editingExpense) {
      setForm({
        amount: String(editingExpense.amount).replace('.', ','),
        category: editingExpense.category,
        description: editingExpense.description || '',
        date: editingExpense.date,
      })
    }
  }, [editingExpense])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const amount = parseAmount(form.amount)
    if (!amount || amount <= 0) {
      setError('Podaj prawidłową kwotę')
      return
    }

    const payload = {
      amount,
      category: form.category,
      description: form.description,
      date: form.date,
    }

    let result
    if (isEditMode && editId) {
      result = await updateExpense(editId, payload)
    } else {
      result = await addExpense(payload)
    }

    if (result) {
      navigate('/expenses')
    } else {
      setError('Błąd zapisu. Sprawdź połączenie z bazą danych.')
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edytuj wydatek' : 'Dodaj wydatek'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditMode ? 'Zmień dane wydatku' : 'Wprowadź dane nowego wydatku'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Kwota */}
        <div>
          <label htmlFor="amount" className="label">Kwota (PLN)</label>
          <input
            id="amount"
            name="amount"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={form.amount}
            onChange={handleChange}
            className="input text-2xl font-bold text-center"
            required
          />
        </div>

        {/* Kategoria */}
        <div>
          <label htmlFor="category" className="label">Kategoria</label>
          <select
            id="category"
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

        {/* Opis */}
        <div>
          <label htmlFor="description" className="label">Opis (opcjonalny)</label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="np. Obiad w restauracji"
            value={form.description}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Data */}
        <div>
          <label htmlFor="date" className="label">Data</label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        {/* Przyciski – duże na mobile */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1 min-h-[48px]"
          >
            {isLoading
              ? 'Zapisywanie...'
              : isEditMode
                ? 'Zaktualizuj wydatek'
                : 'Zapisz wydatek'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary min-h-[48px]"
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  )
}
