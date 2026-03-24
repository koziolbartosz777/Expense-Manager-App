import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useLanguageStore } from '../store/useLanguageStore'
import { useTranslation } from '../hooks/useTranslation'

const LANGS = [
  { code: 'pl', label: 'PL' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
]

export default function RegisterPage() {
  const { t } = useTranslation()
  const signUp = useAuthStore((s) => s.signUp)
  const isLoading = useAuthStore((s) => s.isLoading)
  const language = useLanguageStore((s) => s.language)
  const setLanguage = useLanguageStore((s) => s.setLanguage)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password || !confirmPassword) { setError(t('auth.fillAll')); return }
    if (password.length < 8) { setError(t('auth.passwordTooShort')); return }
    if (password !== confirmPassword) { setError(t('auth.passwordsMismatch')); return }

    const result = await signUp(email, password)
    if (result.success && result.needsConfirmation) setSuccess(true)
    else if (!result.success) setError(result.error)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md card text-center space-y-4">
          <div className="text-5xl">📧</div>
          <h2 className="text-xl font-bold text-gray-900">{t('auth.checkEmail')}</h2>
          <p className="text-gray-500">
            {t('auth.checkEmailText')} <span className="font-medium text-gray-900">{email}</span>.
            {' '}{t('auth.checkEmailAction')}
          </p>
          <Link to="/login" className="btn-primary inline-block">{t('auth.goToLogin')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
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
          <p className="text-gray-500 mt-1">{t('auth.registerSubtitle')}</p>
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
          <div>
            <label htmlFor="confirmPassword" className="label">{t('auth.confirmPassword')}</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.confirmPlaceholder')} className="input" required />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full min-h-[48px]">
            {isLoading ? t('auth.registering') : t('auth.registerBtn')}
          </button>

          <p className="text-sm text-center text-gray-500">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-700 font-medium">{t('auth.loginBtn')}</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
