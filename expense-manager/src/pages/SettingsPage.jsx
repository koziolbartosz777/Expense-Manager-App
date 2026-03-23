import { useThemeStore } from '../store/useThemeStore'

/**
 * Strona ustawień – konfiguracja aplikacji.
 */
export default function SettingsPage() {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ustawienia</h1>
        <p className="text-gray-500 mt-1">Konfiguracja aplikacji</p>
      </div>

      {/* Ogólne */}
      <div className="card space-y-5">
        <h2 className="section-title">Ogólne</h2>

        {/* Motyw */}
        <div>
          <label className="label">Motyw</label>
          <div className="flex gap-2">
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${theme === 'light'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                }`}
            >
              ☀️ Jasny
            </button>
            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${theme === 'dark'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
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

      {/* Dane */}
      <div className="card space-y-4">
        <h2 className="section-title">Dane</h2>

        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary text-sm">📤 Eksportuj CSV</button>
          <button className="btn-ghost text-sm text-red-500 hover:bg-red-50">
            🗑️ Usuń wszystkie dane
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="card">
        <h2 className="section-title mb-2">Informacje</h2>
        <p className="text-sm text-gray-500">Expense Manager v1.0.0</p>
      </div>
    </div>
  )
}
