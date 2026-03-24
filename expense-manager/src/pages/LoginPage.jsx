import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

/**
 * Strona logowania – email + hasło.
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const signIn = useAuthStore((s) => s.signIn)
  const isLoading = useAuthStore((s) => s.isLoading)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Wypełnij wszystkie pola')
      return
    }

    const result = await signIn(email, password)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }
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
          <p className="text-gray-500 mt-1">Zaloguj się do swojego konta</p>
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

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full min-h-[48px]"
          >
            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </button>

          <p className="text-sm text-center text-gray-500">
            Nie masz konta?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-700 font-medium">
              Zarejestruj się
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
