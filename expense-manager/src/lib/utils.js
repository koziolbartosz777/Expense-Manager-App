import { format } from 'date-fns'
import { pl, enUS, de } from 'date-fns/locale'

const LOCALE_MAP = { pl, en: enUS, de }

const DATE_FORMATS = {
  pl: 'd MMM yyyy',
  en: 'MMM d, yyyy',
  de: "d. MMM yyyy",
}

/**
 * Formatuje kwotę do czytelnego formatu z walutą.
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
 * Formatuje datę z uwzględnieniem języka.
 */
export function formatDate(date, language = 'pl') {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, DATE_FORMATS[language] || DATE_FORMATS.pl, {
    locale: LOCALE_MAP[language] || LOCALE_MAP.pl,
  })
}

/**
 * Parsuje string z kwotą do liczby.
 */
export function parseAmount(str) {
  if (typeof str === 'number') return str
  const cleaned = str.replace(/\s/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}
