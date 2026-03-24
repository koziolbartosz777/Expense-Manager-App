import { useEffect } from 'react'
import { useExpenseStore } from '../../store/useExpenseStore'
import { useTranslation } from '../../hooks/useTranslation'

export default function Toast() {
  const { t } = useTranslation()
  const lastAction = useExpenseStore((s) => s.lastAction)
  const clearLastAction = useExpenseStore((s) => s.clearLastAction)
  const undoLastAction = useExpenseStore((s) => s.undoLastAction)

  useEffect(() => {
    if (!lastAction) return
    const timer = setTimeout(() => clearLastAction(), 4000)
    return () => clearTimeout(timer)
  }, [lastAction, clearLastAction])

  if (!lastAction) return null

  const messages = { add: t('toast.added'), delete: t('toast.deleted'), update: t('toast.updated') }
  const message = messages[lastAction.type] || t('toast.actionDone')

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 min-w-[300px] max-w-[90vw] animate-slide-up">
      <div className="bg-gray-900 dark:bg-slate-700 text-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <span className="text-sm font-medium">{message}</span>
          <div className="flex items-center gap-3">
            <button onClick={undoLastAction}
              className="text-sm font-bold text-primary-300 hover:text-primary-200 underline underline-offset-2 transition-colors">
              {t('toast.undo')}
            </button>
            <button onClick={clearLastAction} className="text-white/50 hover:text-white transition-colors">✕</button>
          </div>
        </div>
        <div className="h-1 bg-gray-800 dark:bg-slate-600">
          <div className="h-full bg-primary-500 toast-progress" />
        </div>
      </div>
    </div>
  )
}
