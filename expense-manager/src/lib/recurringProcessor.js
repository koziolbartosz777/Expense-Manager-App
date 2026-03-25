import { supabase } from './supabase'

/**
 * Oblicza następną datę cykliczną na podstawie bieżącej daty i częstotliwości.
 */
function calcNextDate(currentDate, frequency) {
  const d = new Date(currentDate)
  switch (frequency) {
    case 'weekly': d.setDate(d.getDate() + 7); break
    case 'monthly': d.setMonth(d.getMonth() + 1); break
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break
  }
  return d.toISOString().split('T')[0]
}

/**
 * Przetwarza cykliczne transakcje (wydatki i przychody).
 * Dla każdego rekordu z is_recurring=true i recurring_next_date <= today:
 * - Wstawia nowy rekord z datą dzisiejszą
 * - Aktualizuje recurring_next_date na następny termin
 *
 * @param {string} userId
 * @returns {Promise<number>} liczba dodanych transakcji
 */
export async function processRecurringTransactions(userId) {
  const today = new Date().toISOString().split('T')[0]
  let addedCount = 0

  // ─── Wydatki cykliczne ───
  try {
    const { data: recurringExpenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .lte('recurring_next_date', today)

    if (recurringExpenses && recurringExpenses.length > 0) {
      for (const expense of recurringExpenses) {
        // Wstaw nowy wydatek z datą dzisiejszą (NIE cykliczny — to kopia)
        const { error: insertError } = await supabase.from('expenses').insert([{
          user_id: userId,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: today,
          is_recurring: false,
          recurring_frequency: null,
          recurring_next_date: null,
        }])

        if (!insertError) {
          // Aktualizuj datę następnej transakcji
          const nextDate = calcNextDate(expense.recurring_next_date, expense.recurring_frequency)
          await supabase.from('expenses')
            .update({ recurring_next_date: nextDate })
            .eq('id', expense.id)
          addedCount++
        }
      }
    }
  } catch (e) {
    console.error('Error processing recurring expenses:', e)
  }

  // ─── Przychody cykliczne ───
  try {
    const { data: recurringIncome } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .lte('recurring_next_date', today)

    if (recurringIncome && recurringIncome.length > 0) {
      for (const inc of recurringIncome) {
        const { error: insertError } = await supabase.from('income').insert([{
          user_id: userId,
          amount: inc.amount,
          category: inc.category,
          description: inc.description,
          date: today,
          is_recurring: false,
          recurring_frequency: null,
          recurring_next_date: null,
        }])

        if (!insertError) {
          const nextDate = calcNextDate(inc.recurring_next_date, inc.recurring_frequency)
          await supabase.from('income')
            .update({ recurring_next_date: nextDate })
            .eq('id', inc.id)
          addedCount++
        }
      }
    }
  } catch (e) {
    console.error('Error processing recurring income:', e)
  }

  return addedCount
}
