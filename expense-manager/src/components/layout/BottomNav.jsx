import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', icon: '🏠', label: 'Dashboard' },
  { to: '/expenses', icon: '📋', label: 'Wydatki' },
  { to: '/add', icon: '+', label: 'Dodaj', isAdd: true },
  { to: '/analytics', icon: '📊', label: 'Analityka' },
  { to: '/settings', icon: '⚙️', label: 'Ustawienia' },
]

/**
 * Dolna nawigacja – widoczna tylko na mobile (md:hidden).
 * Przycisk "Dodaj" jest wyśrodkowany i wyróżniony.
 */
export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden
                    bg-white dark:bg-[#111111] border-t border-gray-200 dark:border-[#222222]
                    safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) =>
          item.isAdd ? (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center justify-center -mt-6 w-14 h-14
                         bg-primary-500 text-white rounded-full shadow-lg shadow-primary-500/30
                         hover:bg-primary-700 active:scale-95 transition-all duration-200"
            >
              <span className="text-2xl font-bold leading-none">+</span>
            </NavLink>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5
                 min-w-[44px] min-h-[44px] rounded-xl transition-colors duration-200
                 ${
                   isActive
                     ? 'text-primary-500'
                     : 'text-gray-400 hover:text-gray-600'
                 }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          )
        )}
      </div>
    </nav>
  )
}
