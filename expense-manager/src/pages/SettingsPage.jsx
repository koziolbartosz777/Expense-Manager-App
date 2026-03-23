/**
 * Strona ustawień – konfiguracja aplikacji.
 */
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ustawienia</h1>
        <p className="text-gray-500 mt-1">Konfiguracja aplikacji</p>
      </div>

      {/* Waluta */}
      <div className="card space-y-4">
        <h2 className="section-title">Ogólne</h2>

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
        <p className="text-sm text-gray-400 mt-1">
          Zbudowane z ❤️ w React + Vite + Tailwind
        </p>
      </div>
    </div>
  )
}
