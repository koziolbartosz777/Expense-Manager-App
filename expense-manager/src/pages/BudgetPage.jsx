/**
 * Strona budżetów – ustawianie i śledzenie budżetów.
 */
export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budżet</h1>
          <p className="text-gray-500 mt-1">Ustaw limity dla swoich wydatków</p>
        </div>
        <button className="btn-primary text-sm">+ Nowy budżet</button>
      </div>

      {/* Lista budżetów – placeholder */}
      <div className="card">
        <p className="text-gray-400 text-sm text-center py-8">
          Brak budżetów. Stwórz swój pierwszy budżet! 💰
        </p>
      </div>
    </div>
  )
}
