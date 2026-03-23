import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import BottomNav from './BottomNav'

/**
 * Główny shell aplikacji – Navbar (góra/sidebar) + content + BottomNav (mobile).
 */
export default function Shell() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Główna treść – z offsetem na desktop (sidebar 16rem = md:ml-64) */}
      <main className="md:ml-64">
        <div className="max-w-4xl mx-auto px-4 py-6 safe-bottom animate-fade-in">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
