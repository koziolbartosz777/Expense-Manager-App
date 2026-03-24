import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useLanguageStore } from '../store/useLanguageStore'
import { useTranslation } from '../hooks/useTranslation'

const LANGS = [
  { code: 'pl', label: 'PL' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const signIn = useAuthStore((s) => s.signIn)
  const isLoading = useAuthStore((s) => s.isLoading)
  const language = useLanguageStore((s) => s.language)
  const setLanguage = useLanguageStore((s) => s.setLanguage)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError(t('auth.fillAll')); return }
    const result = await signIn(email, password)
    if (result.success) navigate('/')
    else setError(result.error)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {/* Language selector */}
      <div className="fixed top-4 right-4 flex gap-2">
        {LANGS.map((l) => (
          <button key={l.code} onClick={() => setLanguage(l.code)}
            className={`text-sm px-2 py-1 rounded transition-colors ${
              language === l.code ? 'text-primary-500 font-bold underline underline-offset-4' : 'text-gray-400 hover:text-gray-600'
            }`}>{l.label}</button>
        ))}
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-primary-500/20">💰</div>
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.appName')}</h1>
          <p className="text-gray-500 mt-1">{t('auth.loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

          <div>
            <label htmlFor="email" className="label">{t('auth.email')}</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')} className="input" required />
          </div>
          <div>
            <label htmlFor="password" className="label">{t('auth.password')}</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')} className="input" required />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full min-h-[48px]">
            {isLoading ? t('auth.loggingIn') : t('auth.loginBtn')}
          </button>

          <p className="text-sm text-center text-gray-500">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-700 font-medium">{t('auth.registerBtn')}</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
