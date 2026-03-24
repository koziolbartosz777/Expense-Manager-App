/**
 * Modal potwierdzenia – zastępuje window.confirm().
 */
export default function ConfirmModal({ isOpen, title, text, confirmLabel, cancelLabel, onConfirm, onCancel, danger = false }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Karta */}
      <div
        className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{text}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1 min-h-[44px]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 min-h-[44px] font-semibold rounded-xl transition-all duration-200
              ${danger
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-primary-500 hover:bg-primary-700 text-white'
              }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
