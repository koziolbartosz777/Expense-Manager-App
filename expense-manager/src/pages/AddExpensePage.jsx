import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEFAULT_CATEGORIES } from '../store/useExpenseStore'

/**
 * Strona dodawania nowego wydatku.
 */
export default function AddExpensePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    amount: '',
    category: DEFAULT_CATEGORIES[0],
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: wywołanie addExpense z store
    console.log('Nowy wydatek:', form)
    navigate('/expenses')
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dodaj wydatek</h1>
        <p className="text-gray-500 mt-1">Wprowadź dane nowego wydatku</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
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
              <option key={cat} value={cat}>
                {cat}
              </option>
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

        {/* Przyciski */}
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1">
            Zapisz wydatek
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  )
}
