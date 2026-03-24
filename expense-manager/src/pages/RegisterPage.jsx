import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

/**
 * Strona rejestracji – email + hasło + potwierdzenie hasła.
 */
export default function RegisterPage() {
  const signUp = useAuthStore((s) => s.signUp)
  const isLoading = useAuthStore((s) => s.isLoading)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password || !confirmPassword) {
      setError('Wypełnij wszystkie pola')
      return
    }

    if (password.length < 8) {
      setError('Hasło musi mieć minimum 8 znaków')
      return
    }

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne')
      return
    }

    const result = await signUp(email, password)
    if (result.success) {
      if (result.needsConfirmation) {
        setSuccess(true)
      }
    } else {
      setError(result.error)
    }
  }

  // Komunikat po udanej rejestracji
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="card text-center space-y-4">
            <div className="text-5xl">📧</div>
            <h2 className="text-xl font-bold text-gray-900">Sprawdź swój email</h2>
            <p className="text-gray-500">
              Wysłaliśmy link potwierdzający na <span className="font-medium text-gray-900">{email}</span>.
              Kliknij go aby aktywować konto.
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Przejdź do logowania
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-primary-500/20">
            💰
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Manager</h1>
          <p className="text-gray-500 mt-1">Utwórz nowe konto</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.com"
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="label">Hasło</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 znaków"
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">Potwierdź hasło</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Powtórz hasło"
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full min-h-[48px]"
          >
            {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>

          <p className="text-sm text-center text-gray-500">
            Masz już konto?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-700 font-medium">
              Zaloguj się
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
