import { useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useThemeStore } from '../../store/useThemeStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useExpenseStore } from '../../store/useExpenseStore'
import { useUIStore } from '../../store/useUIStore'
import { useTranslation } from '../../hooks/useTranslation'
import ConfirmModal from '../ui/Modal'

const NAV_ITEMS = [
  { to: '/', key: 'dashboard', icon: '🏠' },
  { to: '/expenses', key: 'expenses', icon: '📋', hasBadge: true },
  { to: '/income', key: 'income', icon: '💰' },
  { to: '/calendar', key: 'calendar', icon: '📅' },
  { to: '/add', key: 'addExpense', icon: '➕' },
  { to: '/analytics', key: 'analytics', icon: '📊' },
  { to: '/budget', key: 'budget', icon: '🎯' },
  { to: '/settings', key: 'settings', icon: '⚙️' },
]

export default function Navbar() {
  const { t } = useTranslation()
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const expenses = useExpenseStore((s) => s.expenses)
  const setGlobalSearchOpen = useUIStore((s) => s.setGlobalSearchOpen)
  const [showLogout, setShowLogout] = useState(false)

  const thisMonthCount = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear(), m = now.getMonth()
    return expenses.filter((e) => {
      const d = new Date(e.date); return d.getFullYear() === y && d.getMonth() === m
    }).length
  }, [expenses])

  const handleLogout = async () => {
    setShowLogout(false)
    await signOut()
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-lg border-b border-gray-100 dark:border-[#222222]">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            <span className="text-primary-500">💰</span> Expense Manager
          </h1>
          <div className="flex items-center gap-1">
            <button onClick={() => setGlobalSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
              title="Search (Ctrl+K)">
              🔍
            </button>
            <button onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
              title={theme === 'light' ? 'Dark' : 'Light'}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button onClick={() => setShowLogout(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
              title={t('nav.logout')}>
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white dark:bg-[#111111] border-r border-gray-100 dark:border-[#222222] z-40">
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 dark:border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center text-white text-lg">💰</div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white">Expense Manager</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{user?.email || ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setGlobalSearchOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors text-sm"
              title="Search (Ctrl+K)">
              🔍
            </button>
            <button onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors text-sm">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                 ${isActive
                   ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                   : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-gray-900'}`
              }>
              <span className="text-lg">{item.icon}</span>
              <span>{t(`nav.${item.key}`)}</span>
              {item.hasBadge && thisMonthCount > 0 && (
                <span className="ml-auto w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {thisMonthCount > 99 ? '99' : thisMonthCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100 dark:border-[#222222]">
          <button onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                       text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 min-h-[44px]">
            <span className="text-lg">🚪</span>
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Logout modal */}
      <ConfirmModal
        isOpen={showLogout}
        title={t('modal.logoutTitle')}
        text={t('modal.logoutText')}
        cancelLabel={t('modal.stay')}
        confirmLabel={t('modal.logoutBtn')}
        onCancel={() => setShowLogout(false)}
        onConfirm={handleLogout}
        danger
      />
    </>
  )
}
