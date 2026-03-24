import { useState, useEffect } from 'react'
import { useThemeStore } from '../store/useThemeStore'
import { useCategoryStore } from '../store/useCategoryStore'
import { useAuthStore } from '../store/useAuthStore'

const PRESET_COLORS = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f97316', label: 'Orange' },
  { value: '#22c55e', label: 'Green' },
  { value: '#14b8a6', label: 'Teal' },
]

export default function SettingsPage() {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const user = useAuthStore((s) => s.user)
  const {
    categories, fetchCategories, addCategory, updateCategory, deleteCategory, isLoading,
  } = useCategoryStore()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Formularz nowej kategorii
  const emptyForm = { name: '', icon: '📌', color: '#6366f1' }
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  // Formularz edycji
  const [editForm, setEditForm] = useState({ name: '', icon: '' })

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Dodawanie kategorii ───
  const handleAdd = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.name.trim()) { setFormError('Nazwa jest wymagana'); return }
    if (form.name.length > 30) { setFormError('Maksymalnie 30 znaków'); return }

    const fullName = `${form.icon} ${form.name}`
    const exists = categories.some((c) => `${c.icon} ${c.name}` === fullName)
    if (exists) { setFormError('Taka kategoria już istnieje'); return }

    const result = await addCategory({
      name: form.name.trim(),
      icon: form.icon || '📌',
      color: form.color,
    })

    if (result) {
      setForm(emptyForm)
      setShowAddForm(false)
    }
  }

  // ─── Edycja inline ───
  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditForm({ name: cat.name, icon: cat.icon })
  }

  const saveEdit = async (id) => {
    if (!editForm.name.trim()) return
    await updateCategory(id, { name: editForm.name.trim(), icon: editForm.icon })
    setEditingId(null)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Usunąć tę kategorię?')) {
      await deleteCategory(id)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ustawienia</h1>
        <p className="text-gray-500 mt-1">Konfiguracja aplikacji</p>
      </div>

      {/* ─── Ogólne ─── */}
      <div className="card space-y-5">
        <h2 className="section-title">Ogólne</h2>

        {/* Motyw */}
        <div>
          <label className="label">Motyw</label>
          <div className="flex gap-2">
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px]
                ${theme === 'light'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              ☀️ Jasny
            </button>
            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px]
                ${theme === 'dark'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              🌙 Ciemny
            </button>
          </div>
        </div>

        {/* Waluta */}
        <div>
          <label htmlFor="currency" className="label">Waluta</label>
          <select id="currency" className="input" defaultValue="PLN">
            <option value="PLN">🇵🇱 PLN – złoty polski</option>
            <option value="EUR">🇪🇺 EUR – euro</option>
            <option value="USD">🇺🇸 USD – dolar amerykański</option>
            <option value="GBP">🇬🇧 GBP – funt szterling</option>
          </select>
        </div>
      </div>

      {/* ─── Kategorie ─── */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Kategorie</h2>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setFormError('') }}
            className="text-sm text-primary-500 hover:text-primary-700 font-medium min-h-[44px] flex items-center"
          >
            {showAddForm ? 'Anuluj' : '+ Dodaj kategorię'}
          </button>
        </div>

        {/* Formularz nowej kategorii */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="space-y-3 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl animate-slide-up">
            {formError && (
              <p className="text-sm text-red-500">{formError}</p>
            )}
            <div className="grid grid-cols-[60px_1fr] gap-2">
              <input
                type="text"
                placeholder="📌"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                className="input text-center text-xl"
                maxLength={4}
              />
              <input
                type="text"
                placeholder="Nazwa kategorii"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input"
                maxLength={30}
                required
              />
            </div>

            {/* Color picker */}
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                  className={`w-8 h-8 rounded-full transition-all ${
                    form.color === c.value ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full text-sm min-h-[44px]">
              {isLoading ? 'Dodawanie...' : 'Dodaj kategorię'}
            </button>
          </form>
        )}

        {/* Lista kategorii */}
        <div className="divide-y divide-gray-100">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 py-3 min-h-[44px]">
              {/* Kolor */}
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />

              {/* Treść — inline edycja lub wyświetlanie */}
              {editingId === cat.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editForm.icon}
                    onChange={(e) => setEditForm((f) => ({ ...f, icon: e.target.value }))}
                    className="input w-14 text-center text-lg py-1"
                    maxLength={4}
                  />
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="input flex-1 py-1"
                    maxLength={30}
                  />
                  <button
                    onClick={() => saveEdit(cat.id)}
                    className="text-xs text-green-600 font-medium min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs text-gray-400 font-medium min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-lg">{cat.icon}</span>
                  <span className="flex-1 text-sm font-medium text-gray-900">{cat.name}</span>
                  <button
                    onClick={() => startEdit(cat)}
                    className="text-xs text-gray-400 hover:text-primary-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    ✏️
                  </button>
                  {!cat.is_default && (
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-xs text-gray-400 hover:text-red-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      🗑️
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Ładowanie kategorii...</p>
          )}
        </div>
      </div>

      {/* ─── Dane ─── */}
      <div className="card space-y-4">
        <h2 className="section-title">Dane</h2>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary text-sm min-h-[44px]">📤 Eksportuj CSV</button>
          <button className="btn-ghost text-sm text-red-500 hover:bg-red-50 min-h-[44px]">
            🗑️ Usuń wszystkie dane
          </button>
        </div>
      </div>

      {/* ─── Konto ─── */}
      <div className="card">
        <h2 className="section-title mb-2">Konto</h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
        <p className="text-sm text-gray-400 mt-1">Expense Manager v1.0.0</p>
      </div>
    </div>
  )
}
