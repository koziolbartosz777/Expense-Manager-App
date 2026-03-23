/**
 * Strona listy wydatków z filtrowaniem i wyszukiwaniem.
 */
export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wydatki</h1>
          <p className="text-gray-500 mt-1">Przeglądaj i zarządzaj wydatkami</p>
        </div>
      </div>

      {/* Filtrowanie – placeholder */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Szukaj wydatków..."
            className="input flex-1 min-w-[200px]"
          />
        </div>
      </div>

      {/* Lista wydatków – placeholder */}
      <div className="card">
        <p className="text-gray-400 text-sm text-center py-8">
          Brak wydatków do wyświetlenia. 📋
        </p>
      </div>
    </div>
  )
}
