import { useLanguageStore } from '../store/useLanguageStore'
import { translations } from '../lib/i18n'

export function useTranslation() {
  const language = useLanguageStore((s) => s.language)

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  return { t, language }
}
