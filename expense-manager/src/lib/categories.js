/**
 * Centralna mapa kategorii: emoji → klucz i18n + tłumaczenia.
 * Dane w DB są ZAWSZE po polsku ("🍔 Jedzenie").
 * Tłumaczenie dzieje się TYLKO w warstwie wyświetlania.
 */
export const CATEGORY_MAP = [
  { emoji: '🍔', key: 'food',          pl: 'Jedzenie',     en: 'Food',            de: 'Essen' },
  { emoji: '🚗', key: 'transport',     pl: 'Transport',    en: 'Transport',       de: 'Transport' },
  { emoji: '🏠', key: 'home',          pl: 'Dom',          en: 'Home',            de: 'Zuhause' },
  { emoji: '👕', key: 'shopping',      pl: 'Zakupy',       en: 'Shopping',        de: 'Einkaufen' },
  { emoji: '💊', key: 'health',        pl: 'Zdrowie',      en: 'Health',          de: 'Gesundheit' },
  { emoji: '🎮', key: 'entertainment', pl: 'Rozrywka',     en: 'Entertainment',   de: 'Unterhaltung' },
  { emoji: '📚', key: 'education',     pl: 'Edukacja',     en: 'Education',       de: 'Bildung' },
  { emoji: '✈️', key: 'travel',        pl: 'Podróże',      en: 'Travel',          de: 'Reisen' },
  { emoji: '💼', key: 'work',          pl: 'Praca',        en: 'Work',            de: 'Arbeit' },
  { emoji: '🔧', key: 'other',         pl: 'Inne',         en: 'Other',           de: 'Sonstiges' },
]

/**
 * Tłumaczy przechowywaną wartość kategorii na wybrany język.
 * Działa niezależnie od tego w jakim języku kategoria jest zapisana w bazie.
 *
 * "🍔 Jedzenie" + 'en' → "🍔 Food"
 * "🍔 Food" + 'de' → "🍔 Essen"
 * "📌 Moja kategoria" → "📌 Moja kategoria" (bez zmian — własna)
 *
 * @param {string} storedValue – wartość z DB np. "🍔 Jedzenie"
 * @param {string} language – kod języka ('pl', 'en', 'de')
 * @returns {string}
 */
export function translateCategory(storedValue, language) {
  if (!storedValue) return storedValue

  // Wyciągnij emoji z początku stringa
  const emojiMatch = storedValue.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u)
  if (!emojiMatch) return storedValue // własna kategoria bez emoji — zwróć bez zmian

  const emoji = emojiMatch[1]
  const entry = CATEGORY_MAP.find((c) => c.emoji === emoji)
  if (!entry) return storedValue // nieznane emoji — zwróć bez zmian

  const translatedName = entry[language] || entry['pl']
  return `${emoji} ${translatedName}`
}

/**
 * Zwraca listę domyślnych kategorii przetłumaczonych na dany język.
 * Używane w dropdownach (display label).
 * value w option powinien być ZAWSZE polską nazwą (do zapisu w DB).
 *
 * @param {string} language
 * @returns {Array<{value: string, label: string}>}
 */
export function getTranslatedCategories(language) {
  return CATEGORY_MAP.map((c) => ({
    value: `${c.emoji} ${c.pl}`,       // DB value — zawsze polski
    label: `${c.emoji} ${c[language] || c.pl}`, // display label
  }))
}

// ═══════════════════════════════════════════
// PRZYCHODY (INCOME)
// ═══════════════════════════════════════════

export const INCOME_CATEGORY_MAP = [
  { emoji: '💰', key: 'salary',    pl: 'Wynagrodzenie', en: 'Salary',          de: 'Gehalt' },
  { emoji: '💻', key: 'freelance', pl: 'Freelance',     en: 'Freelance',       de: 'Freelance' },
  { emoji: '🎁', key: 'gift',      pl: 'Prezent',       en: 'Gift',            de: 'Geschenk' },
  { emoji: '↩️', key: 'refund',    pl: 'Zwrot środków', en: 'Refund',          de: 'Rückerstattung' },
  { emoji: '📦', key: 'other',     pl: 'Inne',          en: 'Other',           de: 'Sonstiges' },
]

/**
 * Tłumaczy przechowywaną wartość kategorii przychodu na wybrany język.
 * Analogiczna do translateCategory, ale dla INCOME_CATEGORY_MAP.
 */
export function translateIncomeCategory(storedValue, language) {
  if (!storedValue) return storedValue

  const emojiMatch = storedValue.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u)
  if (!emojiMatch) return storedValue

  const emoji = emojiMatch[1]
  const entry = INCOME_CATEGORY_MAP.find((c) => c.emoji === emoji)
  if (!entry) return storedValue

  const translatedName = entry[language] || entry['pl']
  return `${emoji} ${translatedName}`
}

/**
 * Zwraca listę kategorii przychodów przetłumaczonych na dany język.
 */
export function getTranslatedIncomeCategories(language) {
  return INCOME_CATEGORY_MAP.map((c) => ({
    value: `${c.emoji} ${c.pl}`,
    label: `${c.emoji} ${c[language] || c.pl}`,
  }))
}
