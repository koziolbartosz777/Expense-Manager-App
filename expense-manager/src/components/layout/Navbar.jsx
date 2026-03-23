import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', icon: '🏠', label: 'Dashboard' },
  { to: '/expenses', icon: '📋', label: 'Wydatki' },
  { to: '/add', icon: '➕', label: 'Dodaj wydatek' },
  { to: '/analytics', icon: '📊', label: 'Analityka' },
  { to: '/budget', icon: '💰', label: 'Budżet' },
  { to: '/settings', icon: '⚙️', label: 'Ustawienia' },
]

/**
 * Navbar górny – widoczny na desktop i mobile.
 * Na desktop pełni funkcję sidebara nawigacyjnego.
 */
export default function Navbar() {
  return (
    <>
      {/* ─── Mobile top bar ─── */}
      <header className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-bold text-gray-900">
            <span className="text-primary-500">💰</span> Expense Manager
          </h1>
        </div>
      </header>

      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-gray-100 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-gray-100">
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center text-white text-lg">
            💰
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Expense Manager</h1>
            <p className="text-xs text-gray-400">Zarządzaj wydatkami</p>
          </div>
        </div>

        {/* Linki nawigacyjne */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                 ${
                   isActive
                     ? 'bg-primary-50 text-primary-700'
                     : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                 }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Stopka sidebara */}
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Expense Manager v1.0</p>
        </div>
      </aside>
    </>
  )
}
