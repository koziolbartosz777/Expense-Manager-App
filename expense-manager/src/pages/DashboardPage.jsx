import { formatAmount } from '../lib/utils'

/**
 * Strona główna – Dashboard z podsumowaniem wydatków.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Podsumowanie Twoich finansów</p>
      </div>

      {/* Karty podsumowania */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Wydatki (ten miesiąc)</p>
          <p className="text-2xl font-bold text-gray-900">{formatAmount(0)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Budżet</p>
          <p className="text-2xl font-bold text-green-600">{formatAmount(0)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Pozostało</p>
          <p className="text-2xl font-bold text-primary-500">{formatAmount(0)}</p>
        </div>
      </div>

      {/* Ostatnie wydatki – placeholder */}
      <div className="card">
        <h2 className="section-title mb-4">Ostatnie wydatki</h2>
        <p className="text-gray-400 text-sm text-center py-8">
          Brak wydatków. Dodaj swój pierwszy wydatek! 🎉
        </p>
      </div>
    </div>
  )
}
