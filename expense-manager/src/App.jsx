import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Shell from './components/layout/Shell'
import DashboardPage from './pages/DashboardPage'
import ExpensesPage from './pages/ExpensesPage'
import AddExpensePage from './pages/AddExpensePage'
import AnalyticsPage from './pages/AnalyticsPage'
import BudgetPage from './pages/BudgetPage'
import SettingsPage from './pages/SettingsPage'

/**
 * Główny komponent aplikacji – definiuje routing.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wszystkie strony wewnątrz głównego layoutu (Shell) */}
        <Route element={<Shell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/add" element={<AddExpensePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}