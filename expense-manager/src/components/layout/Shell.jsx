import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import Toast from '../ui/Toast'

/**
 * Główny shell – Navbar + content z animacją przejścia + BottomNav + Toast.
 */
export default function Shell() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="md:ml-64">
        <div
          key={location.pathname}
          className="max-w-4xl mx-auto px-4 py-6 safe-bottom animate-page-in"
        >
          <Outlet />
        </div>
      </main>

      <BottomNav />
      <Toast />
    </div>
  )
}
