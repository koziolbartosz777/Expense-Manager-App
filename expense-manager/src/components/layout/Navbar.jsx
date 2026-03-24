import { NavLink } from 'react-router-dom'
import { useThemeStore } from '../../store/useThemeStore'
import { useAuthStore } from '../../store/useAuthStore'

const NAV_ITEMS = [
  { to: '/', icon: '🏠', label: 'Dashboard' },
  { to: '/expenses', icon: '📋', label: 'Wydatki' },
  { to: '/add', icon: '➕', label: 'Dodaj wydatek' },
  { to: '/analytics', icon: '📊', label: 'Analityka' },
  { to: '/budget', icon: '💰', label: 'Budżet' },
  { to: '/settings', icon: '⚙️', label: 'Ustawienia' },
]

export default function Navbar() {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)

  return (
    <>
      {/* ─── Mobile top bar ─── */}
      <header className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-lg border-b border-gray-100 dark:border-[#222222]">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-bold text-gray-900">
            <span className="text-primary-500">💰</span> Expense Manager
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl
                         hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
              title={theme === 'light' ? 'Tryb ciemny' : 'Tryb jasny'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={signOut}
              className="w-9 h-9 flex items-center justify-center rounded-xl
                         hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors text-sm"
              title="Wyloguj"
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white dark:bg-[#111111] border-r border-gray-100 dark:border-[#222222] z-40">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 dark:border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center text-white text-lg">
              💰
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Expense Manager</h1>
              <p className="text-xs text-gray-400 truncate max-w-[120px]">
                {user?.email || ''}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors text-sm"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Nawigacja */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                 ${isActive
                   ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                   : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-gray-900'
                 }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Stopka z logout */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-[#222222]">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                       text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]
                       hover:text-red-600 transition-all duration-200"
          >
            <span className="text-lg">🚪</span>
            <span>Wyloguj się</span>
          </button>
        </div>
      </aside>
    </>
  )
}
