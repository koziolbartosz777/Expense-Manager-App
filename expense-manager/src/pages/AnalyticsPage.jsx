/**
 * Strona analityki – wykresy i podsumowania.
 */
export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analityka</h1>
        <p className="text-gray-500 mt-1">Wykresy i statystyki wydatków</p>
      </div>

      {/* Wykres – placeholder */}
      <div className="card">
        <h2 className="section-title mb-4">Wydatki w czasie</h2>
        <div className="flex items-center justify-center h-64 text-gray-400">
          {/* TODO: Recharts – wykres liniowy / słupkowy */}
          📊 Wykres będzie tutaj
        </div>
      </div>

      {/* Podział na kategorie – placeholder */}
      <div className="card">
        <h2 className="section-title mb-4">Według kategorii</h2>
        <div className="flex items-center justify-center h-64 text-gray-400">
          {/* TODO: Recharts – wykres kołowy */}
          🍩 Wykres kołowy będzie tutaj
        </div>
      </div>
    </div>
  )
}
