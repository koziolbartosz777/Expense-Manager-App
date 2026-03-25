import { NavLink } from 'react-router-dom'
import { useMemo } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { useExpenseStore } from '../../store/useExpenseStore'

const NAV_ITEMS = [
  { to: '/', key: 'dashboard', icon: '🏠' },
  { to: '/expenses', key: 'expenses', icon: '📋', hasBadge: true },
  { to: '/income', key: 'income', icon: '💰' },
  { to: '/add', icon: '+', isAdd: true },
  { to: '/analytics', key: 'analytics', icon: '📊' },
  { to: '/settings', key: 'settings', icon: '⚙️' },
]

export default function BottomNav() {
  const { t } = useTranslation()
  const expenses = useExpenseStore((s) => s.expenses)

  const thisMonthCount = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear(), m = now.getMonth()
    return expenses.filter((e) => {
      const d = new Date(e.date); return d.getFullYear() === y && d.getMonth() === m
    }).length
  }, [expenses])

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden
                    bg-white dark:bg-[#111111] border-t border-gray-200 dark:border-[#222222]
                    safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) =>
          item.isAdd ? (
            <NavLink
              key="/add"
              to="/add"
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
                `relative flex flex-col items-center justify-center gap-0.5
                 min-w-[44px] min-h-[44px] rounded-xl transition-colors duration-200
                 ${isActive ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'}`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{t(`nav.${item.key}`)}</span>
              {item.hasBadge && thisMonthCount > 0 && (
                <span className="absolute -top-0.5 right-0.5 w-4 h-4 bg-primary-500 text-white
                                 text-[9px] font-bold rounded-full flex items-center justify-center">
                  {thisMonthCount > 99 ? '99' : thisMonthCount}
                </span>
              )}
            </NavLink>
          )
        )}
      </div>
    </nav>
  )
}
