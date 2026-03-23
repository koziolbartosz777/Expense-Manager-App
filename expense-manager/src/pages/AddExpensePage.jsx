import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useExpenseStore, DEFAULT_CATEGORIES } from '../store/useExpenseStore'
import { parseAmount } from '../lib/utils'

export default function AddExpensePage() {
  const navigate = useNavigate()
  const addExpense = useExpenseStore((s) => s.addExpense)
  const isLoading = useExpenseStore((s) => s.isLoading)

  const [form, setForm] = useState({
    amount: '',
    category: DEFAULT_CATEGORIES[0],
    description: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState('')

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

    const result = await addExpense({
      amount,
      category: form.category,
      description: form.description,
      date: form.date,
    })

    if (result) {
      navigate('/expenses')
    } else {
      setError('Błąd zapisu. Sprawdź połączenie z bazą danych.')
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dodaj wydatek</h1>
        <p className="text-gray-500 mt-1">Wprowadź dane nowego wydatku</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

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

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? 'Zapisywanie...' : 'Zapisz wydatek'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Anuluj
          </button>
        </div>
      </form>
    </div>
  )
}
