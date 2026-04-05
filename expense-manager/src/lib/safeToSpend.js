/**
 * Oblicza bezpieczną dzienną kwotę do wydania na podstawie budżetu.
 *
 * @param {{ expenses: Array, budgets: Array, today: Date }} params
 * @returns {{ safeToSpend: number, budgetRemaining: number, daysRemaining: number, totalBudget: number, spentThisMonth: number } | null}
 */
export function calculateSafeToSpend({ expenses, budgets, today }) {
  // Znajdź budżet globalny (__all__) lub sumuj wszystkie miesięczne
  const globalBudget = budgets.find(
    (b) => b.category === '__all__' && b.period === 'monthly'
  )

  const totalBudget = globalBudget
    ? Number(globalBudget.limit_amount)
    : budgets
        .filter((b) => b.period === 'monthly')
        .reduce((sum, b) => sum + Number(b.limit_amount), 0)

  if (totalBudget <= 0) return null

  const year = today.getFullYear()
  const month = today.getMonth()

  // Dni w miesiącu
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysPassed = today.getDate()
  const daysRemaining = daysInMonth - daysPassed + 1 // wliczając dziś

  // Wydane w tym miesiącu
  const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const spentThisMonth = expenses
    .filter((e) => e.date >= startOfMonth)
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const budgetRemaining = totalBudget - spentThisMonth
  const safeToSpend = budgetRemaining / daysRemaining

  return {
    safeToSpend: Math.round(safeToSpend * 100) / 100,
    budgetRemaining: Math.round(budgetRemaining * 100) / 100,
    daysRemaining,
    totalBudget,
    spentThisMonth: Math.round(spentThisMonth * 100) / 100,
  }
}
