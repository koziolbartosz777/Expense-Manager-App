import { useState, useMemo, useEffect } from 'react'
import { useExpenses } from '../hooks/useExpenses'
import { useCategoryStore } from '../store/useCategoryStore'
import { useTranslation } from '../hooks/useTranslation'
import { formatAmount } from '../lib/utils'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { startOfMonth, endOfMonth, subMonths, startOfYear, isWithinInterval, parseISO, format } from 'date-fns'
import { pl, enUS, de } from 'date-fns/locale'

const LOCALE_MAP = { pl, en: enUS, de }
const FALLBACK_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#94a3b8']

export default function AnalyticsPage() {
  const { t, language } = useTranslation()
  const { expenses, isLoading } = useExpenses()
  const { categories, fetchCategories, getCategoryColorByName } = useCategoryStore()
  const [period, setPeriod] = useState('month')

  useEffect(() => { fetchCategories() }, []) // eslint-disable-line

  const PERIOD_OPTIONS = [
    { value: 'month', label: t('analytics.thisMonth') },
    { value: '3months', label: t('analytics.threeMonths') },
    { value: '6months', label: t('analytics.sixMonths') },
    { value: 'year', label: t('analytics.thisYear') },
    { value: 'all', label: t('analytics.all') },
  ]

  const filtered = useMemo(() => {
    if (!expenses.length) return []
    const now = new Date()
    if (period === 'all') return expenses
    let start, end
    switch (period) {
      case 'month': start = startOfMonth(now); end = endOfMonth(now); break
      case '3months': start = subMonths(now, 3); end = now; break
      case '6months': start = subMonths(now, 6); end = now; break
      case 'year': start = startOfYear(now); end = now; break
      default: return expenses
    }
    return expenses.filter((e) => isWithinInterval(parseISO(e.date), { start, end }))
  }, [expenses, period])

  const stats = useMemo(() => {
    if (!filtered.length) return { total: 0, avgMonth: 0, max: 0 }
    const total = filtered.reduce((s, e) => s + Number(e.amount), 0)
    const max = Math.max(...filtered.map((e) => Number(e.amount)))
    const dates = filtered.map((e) => parseISO(e.date))
    const minD = new Date(Math.min(...dates)), maxD = new Date(Math.max(...dates))
    const months = Math.max(1, (maxD.getFullYear() - minD.getFullYear()) * 12 + maxD.getMonth() - minD.getMonth() + 1)
    return { total, avgMonth: total / months, max }
  }, [filtered])

  const locale = LOCALE_MAP[language] || LOCALE_MAP.pl

  const lineData = useMemo(() => {
    if (!filtered.length) return []
    const byDay = period === 'month'
    const map = {}
    filtered.forEach((e) => { const d = parseISO(e.date); const k = byDay ? format(d, 'd MMM', { locale }) : format(d, 'MMM yy', { locale }); map[k] = (map[k] || 0) + Number(e.amount) })
    const sorted = [...new Set(filtered.map((e) => e.date))].sort()
    return sorted.map((date) => { const d = parseISO(date); const k = byDay ? format(d, 'd MMM', { locale }) : format(d, 'MMM yy', { locale }); return { name: k, kwota: map[k] || 0 } }).filter((v, i, a) => a.findIndex((x) => x.name === v.name) === i)
  }, [filtered, period, locale])

  const pieData = useMemo(() => {
    if (!filtered.length) return []
    const map = {}
    filtered.forEach((e) => { map[e.category] = (map[e.category] || 0) + Number(e.amount) })
    return Object.entries(map).map(([n, v]) => ({ name: n, value: v })).sort((a, b) => b.value - a.value)
  }, [filtered])

  const barData = useMemo(() => pieData.slice(0, 5), [pieData])

  const getColor = (name, i) => {
    const c = getCategoryColorByName(name)
    return c && c !== '#6b7280' ? c : FALLBACK_COLORS[i % FALLBACK_COLORS.length]
  }

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">{t('common.loadingData')}</div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">{t('analytics.title')}</h1><p className="text-gray-500 mt-1">{t('analytics.subtitle')}</p></div>

      <div className="flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((o) => (
          <button key={o.value} onClick={() => setPeriod(o.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all min-h-[44px] ${period === o.value ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{o.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card"><p className="text-sm text-gray-500 mb-1">{t('analytics.total')}</p><p className="text-xl font-bold text-gray-900">{formatAmount(stats.total)}</p></div>
        <div className="card"><p className="text-sm text-gray-500 mb-1">{t('analytics.avgPerMonth')}</p><p className="text-xl font-bold text-gray-900">{formatAmount(stats.avgMonth)}</p></div>
        <div className="card"><p className="text-sm text-gray-500 mb-1">{t('analytics.biggestExpense')}</p><p className="text-xl font-bold text-gray-900">{formatAmount(stats.max)}</p></div>
      </div>

      <div className="card"><h2 className="section-title mb-4">{t('analytics.overTime')}</h2>
        {lineData.length === 0 ? <div className="flex items-center justify-center h-64 text-gray-400">{t('analytics.noData')} 📊</div> : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip formatter={(v) => formatAmount(v)} /><Line type="monotone" dataKey="kwota" stroke="#6366f1" strokeWidth={2} dot={false} name={t('analytics.amount')} /></LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card"><h2 className="section-title mb-4">{t('analytics.byCategory')}</h2>
        {pieData.length === 0 ? <div className="flex items-center justify-center h-64 text-gray-400">{t('analytics.noData')} 🍩</div> : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {pieData.map((e, i) => <Cell key={i} fill={getColor(e.name, i)} />)}</Pie><Tooltip formatter={(v) => formatAmount(v)} /><Legend /></PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card"><h2 className="section-title mb-4">{t('analytics.top5')}</h2>
        {barData.length === 0 ? <div className="flex items-center justify-center h-56 text-gray-400">{t('analytics.noData')} 📊</div> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} /><XAxis type="number" tick={{ fontSize: 12 }} /><Tooltip formatter={(v) => formatAmount(v)} /><Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} name={t('analytics.amount')} /></BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
