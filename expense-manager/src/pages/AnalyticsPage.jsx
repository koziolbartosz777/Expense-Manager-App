import { useState, useMemo } from 'react'
import { useExpenses } from '../hooks/useExpenses'
import { formatAmount } from '../lib/utils'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  startOfMonth, endOfMonth, subMonths, startOfYear,
  isWithinInterval, parseISO, format,
} from 'date-fns'
import { pl } from 'date-fns/locale'

const COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316',
  '#eab308','#22c55e','#14b8a6','#3b82f6','#94a3b8',
]

const PERIOD_OPTIONS = [
  { value: 'month', label: 'Ten miesiąc' },
  { value: '3months', label: '3 miesiące' },
  { value: '6months', label: '6 miesięcy' },
  { value: 'year', label: 'Ten rok' },
  { value: 'all', label: 'Wszystko' },
]

/**
 * Strona analityki – wykresy i statystyki wydatków.
 */
export default function AnalyticsPage() {
  const { expenses, isLoading } = useExpenses()
  const [period, setPeriod] = useState('month')

  // ─── Filtrowanie wydatków wg okresu ───
  const filtered = useMemo(() => {
    if (!expenses.length) return []
    const now = new Date()

    if (period === 'all') return expenses

    let start, end
    switch (period) {
      case 'month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
      case '3months':
        start = subMonths(now, 3)
        end = now
        break
      case '6months':
        start = subMonths(now, 6)
        end = now
        break
      case 'year':
        start = startOfYear(now)
        end = now
        break
      default:
        return expenses
    }

    return expenses.filter((e) => {
      const d = parseISO(e.date)
      return isWithinInterval(d, { start, end })
    })
  }, [expenses, period])

  // ─── Statystyki ───
  const stats = useMemo(() => {
    if (!filtered.length) return { total: 0, avgMonth: 0, max: 0 }

    const total = filtered.reduce((s, e) => s + Number(e.amount), 0)
    const max = Math.max(...filtered.map((e) => Number(e.amount)))

    // Liczba miesięcy w okresie
    const dates = filtered.map((e) => parseISO(e.date))
    const minDate = new Date(Math.min(...dates))
    const maxDate = new Date(Math.max(...dates))
    const months = Math.max(1,
      (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
      maxDate.getMonth() - minDate.getMonth() + 1
    )

    return { total, avgMonth: total / months, max }
  }, [filtered])

  // ─── Dane dla LineChart (grupowanie wg miesiąca lub dnia) ───
  const lineData = useMemo(() => {
    if (!filtered.length) return []

    const groupByDay = period === 'month'
    const map = {}

    filtered.forEach((e) => {
      const d = parseISO(e.date)
      const key = groupByDay
        ? format(d, 'd MMM', { locale: pl })
        : format(d, 'MMM yy', { locale: pl })
      map[key] = (map[key] || 0) + Number(e.amount)
    })

    // Sortuj chronologicznie
    const sorted = filtered
      .map((e) => parseISO(e.date))
      .sort((a, b) => a - b)

    const seen = new Set()
    const result = []
    sorted.forEach((d) => {
      const key = groupByDay
        ? format(d, 'd MMM', { locale: pl })
        : format(d, 'MMM yy', { locale: pl })
      if (!seen.has(key)) {
        seen.add(key)
        result.push({ name: key, kwota: map[key] })
      }
    })

    return result
  }, [filtered, period])

  // ─── Dane dla PieChart (wg kategorii) ───
  const pieData = useMemo(() => {
    if (!filtered.length) return []

    const map = {}
    filtered.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount)
    })

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filtered])

  // ─── Dane dla BarChart (top 5 kategorii) ───
  const barData = useMemo(() => {
    return pieData.slice(0, 5)
  }, [pieData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Ładowanie danych...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analityka</h1>
        <p className="text-gray-500 mt-1">Wykresy i statystyki wydatków</p>
      </div>

      {/* Selektor okresu */}
      <div className="flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
              ${period === opt.value
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 3 karty statystyk */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Łącznie</p>
          <p className="text-xl font-bold text-gray-900">{formatAmount(stats.total)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Średnio / miesiąc</p>
          <p className="text-xl font-bold text-gray-900">{formatAmount(stats.avgMonth)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Największy wydatek</p>
          <p className="text-xl font-bold text-gray-900">{formatAmount(stats.max)}</p>
        </div>
      </div>

      {/* LineChart – Wydatki w czasie */}
      <div className="card">
        <h2 className="section-title mb-4">Wydatki w czasie</h2>
        {lineData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Brak danych 📊
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatAmount(v)} />
              <Line
                type="monotone"
                dataKey="kwota"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                name="Kwota"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* PieChart – Według kategorii */}
      <div className="card">
        <h2 className="section-title mb-4">Według kategorii</h2>
        {pieData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Brak danych 🍩
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatAmount(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* BarChart – Top 5 kategorii */}
      <div className="card">
        <h2 className="section-title mb-4">Top 5 kategorii</h2>
        {barData.length === 0 ? (
          <div className="flex items-center justify-center h-56 text-gray-400">
            Brak danych 📊
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatAmount(v)} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} name="Kwota" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
