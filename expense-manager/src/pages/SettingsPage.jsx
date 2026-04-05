import { useState, useEffect } from 'react'
import { useThemeStore } from '../store/useThemeStore'
import { useCategoryStore } from '../store/useCategoryStore'
import { useAuthStore } from '../store/useAuthStore'
import { useLanguageStore } from '../store/useLanguageStore'
import { useTranslation } from '../hooks/useTranslation'
import { translateCategory } from '../lib/categories'
import ConfirmModal from '../components/ui/Modal'

const PRESET_COLORS = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f97316', label: 'Orange' },
  { value: '#22c55e', label: 'Green' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#ef4444', label: 'Red' },
  { value: '#3b82f6', label: 'Blue' },
]

const EMOJI_QUICK_PICK = [
  '🍕','🍺','🎵','🏋️','🐕','🌿','🎨','🎯','🏖️','🎪',
  '🚀','🎭','🎬','🎤','🎸','🎹','🏆','🥇','🎲','♟️',
  '🌍','🌙','⭐','🔥','💎','👑','🦋','🌸','🍀','🎋',
]

const LANGS = [
  { code: 'pl', label: '🇵🇱 Polski' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'de', label: '🇩🇪 Deutsch' },
]

export default function SettingsPage() {
  const { t, language } = useTranslation()
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const lang = useLanguageStore((s) => s.language)
  const setLanguage = useLanguageStore((s) => s.setLanguage)
  const user = useAuthStore((s) => s.user)
  const { categories, fetchCategories, addCategory, updateCategory, deleteCategory, isLoading } = useCategoryStore()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const emptyForm = { name: '', icon: '📌', color: '#6366f1' }
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [editForm, setEditForm] = useState({ name: '', icon: '' })

  useEffect(() => { fetchCategories() }, []) // eslint-disable-line

  const handleAdd = async (e) => {
    e.preventDefault(); setFormError('')
    if (!form.name.trim()) { setFormError(t('settings.nameRequired')); return }
    if (form.name.length > 30) { setFormError(t('settings.maxChars')); return }
    const fullName = `${form.icon} ${form.name}`
    if (categories.some((c) => `${c.icon} ${c.name}` === fullName)) { setFormError(t('settings.duplicateCategory')); return }
    const result = await addCategory({ name: form.name.trim(), icon: form.icon || '📌', color: form.color })
    if (result) { setForm(emptyForm); setShowAddForm(false) }
  }

  const startEdit = (cat) => { setEditingId(cat.id); setEditForm({ name: cat.name, icon: cat.icon }) }
  const saveEdit = async (id) => { if (!editForm.name.trim()) return; await updateCategory(id, { name: editForm.name.trim(), icon: editForm.icon }); setEditingId(null) }
  const handleDelete = async () => { if (deleteId) { await deleteCategory(deleteId); setDeleteId(null) } }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1><p className="text-gray-500 mt-1">{t('settings.subtitle')}</p></div>

      {/* Ogólne */}
      <div className="card space-y-5">
        <h2 className="section-title">{t('settings.general')}</h2>

        <div><label className="label">{t('settings.theme')}</label>
          <div className="flex gap-2">
            <button onClick={() => theme !== 'light' && toggleTheme()} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${theme === 'light' ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>☀️ {t('settings.light')}</button>
            <button onClick={() => theme !== 'dark' && toggleTheme()} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${theme === 'dark' ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>🌙 {t('settings.dark')}</button>
          </div>
        </div>

        <div><label className="label">{t('settings.language')}</label>
          <div className="flex gap-2">
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => setLanguage(l.code)}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${lang === l.code ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{l.label}</button>
            ))}
          </div>
        </div>

        <div><label htmlFor="currency" className="label">{t('settings.currency')}</label>
          <select id="currency" className="input" defaultValue="PLN">
            <option value="PLN">🇵🇱 PLN</option><option value="EUR">🇪🇺 EUR</option><option value="USD">🇺🇸 USD</option><option value="GBP">🇬🇧 GBP</option>
          </select></div>
      </div>

      {/* Kategorie */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">{t('settings.categories')}</h2>
          <button onClick={() => { setShowAddForm(!showAddForm); setFormError('') }} className="text-sm text-primary-500 hover:text-primary-700 font-medium min-h-[44px] flex items-center">
            {showAddForm ? t('settings.cancelAdd') : t('settings.addCategory')}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAdd} className="space-y-4 p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl animate-slide-up">
            {formError && <p className="text-sm text-red-500">{formError}</p>}

            {/* Emoji preview + input */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white dark:bg-[#222] rounded-2xl border-2 border-gray-200 dark:border-[#333] flex items-center justify-center shadow-sm">
                <span style={{ fontSize: '2rem' }}>{form.icon || '📌'}</span>
              </div>
              <div className="flex-1">
                <label className="label text-xs">{t('settings.emojiPreview')}</label>
                <input type="text" placeholder="📌" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="input text-center text-xl" maxLength={4} />
              </div>
            </div>

            {/* Emoji quick-pick grid */}
            <div>
              <label className="label text-xs">{t('settings.quickPick')}</label>
              <div className="grid grid-cols-10 gap-1">
                {EMOJI_QUICK_PICK.map((emoji) => (
                  <button key={emoji} type="button" onClick={() => setForm((f) => ({ ...f, icon: emoji }))}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition-all hover:bg-gray-200 dark:hover:bg-[#333] ${form.icon === emoji ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500 scale-110' : 'bg-white dark:bg-[#222]'}`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Category name */}
            <input type="text" placeholder={t('settings.categoryName')} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" maxLength={30} required />

            {/* Color picker */}
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button key={c.value} type="button" onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                  className={`w-8 h-8 rounded-full transition-all ${form.color === c.value ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''}`}
                  style={{ backgroundColor: c.value }} title={c.label} />
              ))}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full text-sm min-h-[44px]">{isLoading ? t('settings.adding') : t('settings.addCategoryBtn')}</button>
          </form>
        )}

        <div className="divide-y divide-gray-100">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 py-3 min-h-[44px]">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              {editingId === cat.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input type="text" value={editForm.icon} onChange={(e) => setEditForm((f) => ({ ...f, icon: e.target.value }))} className="input w-14 text-center text-lg py-1" maxLength={4} />
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="input flex-1 py-1" maxLength={30} />
                  <button onClick={() => saveEdit(cat.id)} className="text-xs text-green-600 font-medium min-w-[44px] min-h-[44px] flex items-center justify-center">✓</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 font-medium min-w-[44px] min-h-[44px] flex items-center justify-center">✕</button>
                </div>
              ) : (
                <>
                  <span className="text-lg">{cat.icon}</span>
                  <span className="flex-1 text-sm font-medium text-gray-900">{translateCategory(`${cat.icon} ${cat.name}`, language).replace(/^\S+\s+/, '')}</span>
                  <button onClick={() => startEdit(cat)} className="text-xs text-gray-400 hover:text-primary-500 min-w-[44px] min-h-[44px] flex items-center justify-center">✏️</button>
                  {!cat.is_default && <button onClick={() => setDeleteId(cat.id)} className="text-xs text-gray-400 hover:text-red-500 min-w-[44px] min-h-[44px] flex items-center justify-center">🗑️</button>}
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-gray-400 text-center py-4">{t('common.loading')}</p>}
        </div>
      </div>

      {/* Dane */}
      <div className="card space-y-4">
        <h2 className="section-title">{t('settings.data')}</h2>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary text-sm min-h-[44px]">{t('settings.exportCsv')}</button>
          <button className="btn-ghost text-sm text-red-500 hover:bg-red-50 min-h-[44px]">{t('settings.deleteAll')}</button>
        </div>
      </div>

      {/* Konto */}
      <div className="card">
        <h2 className="section-title mb-2">{t('settings.account')}</h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
        <p className="text-sm text-gray-400 mt-1">{t('settings.version')}</p>
      </div>

      <ConfirmModal isOpen={!!deleteId} title={t('settings.deleteCategory')} text={t('expenses.confirmDeleteText')}
        cancelLabel={t('modal.cancel')} confirmLabel={t('modal.delete')} onCancel={() => setDeleteId(null)} onConfirm={handleDelete} danger />
    </div>
  )
}
