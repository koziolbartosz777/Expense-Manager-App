import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

// ─── Mapa kolorów kategorii ───
const CATEGORY_COLORS = {
  '🍔 Jedzenie': '#ef4444',
  '🚗 Transport': '#f97316',
  '🏠 Dom': '#eab308',
  '👕 Zakupy': '#8b5cf6',
  '💊 Zdrowie': '#10b981',
  '🎮 Rozrywka': '#ec4899',
  '📚 Edukacja': '#3b82f6',
  '✈️ Podróże': '#06b6d4',
  '💼 Praca': '#6366f1',
  '🔧 Inne': '#6b7280',
}

// ─── Mapa emoji kategorii ───
const CATEGORY_ICONS = {
  '🍔 Jedzenie': '🍔',
  '🚗 Transport': '🚗',
  '🏠 Dom': '🏠',
  '👕 Zakupy': '👕',
  '💊 Zdrowie': '💊',
  '🎮 Rozrywka': '🎮',
  '📚 Edukacja': '📚',
  '✈️ Podróże': '✈️',
  '💼 Praca': '💼',
  '🔧 Inne': '🔧',
}

/**
 * Formatuje kwotę do czytelnego formatu z walutą.
 * @param {number} amount – kwota
 * @param {string} currency – waluta (domyślnie 'PLN')
 * @returns {string} np. "1 234,56 zł"
 */
export function formatAmount(amount, currency = 'PLN') {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatuje datę do czytelnego formatu (np. "23 mar 2026").
 * @param {Date|string} date – data do sformatowania
 * @returns {string}
 */
export function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'd MMM yyyy', { locale: pl })
}

/**
 * Parsuje string z kwotą do liczby (obsługuje przecinek i kropkę).
 * @param {string} str – np. "1 234,56" lub "1234.56"
 * @returns {number}
 */
export function parseAmount(str) {
  if (typeof str === 'number') return str
  // Usuwamy spacje, zamieniamy przecinek na kropkę
  const cleaned = str.replace(/\s/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

/**
 * Zwraca kolor hex dla danej kategorii.
 * @param {string} categoryName
 * @returns {string} kolor hex
 */
export function getCategoryColor(categoryName) {
  return CATEGORY_COLORS[categoryName] || '#6b7280'
}

/**
 * Zwraca ikonę (emoji) dla danej kategorii.
 * @param {string} categoryName
 * @returns {string} emoji
 */
export function getCategoryIcon(categoryName) {
  return CATEGORY_ICONS[categoryName] || '🔧'
}
