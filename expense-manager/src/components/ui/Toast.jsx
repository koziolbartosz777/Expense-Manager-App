import { useState, useEffect } from 'react'

/**
 * Komponent Toast – wyświetla krótki komunikat z opcjonalnym przyciskiem undo.
 * @param {'success'|'error'|'info'} type
 */
export default function Toast({ message, type = 'info', onClose, onUndo, duration = 4000 }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // poczekaj na animację
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-gray-800',
  }

  return (
    <div
      className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60]
                  ${colors[type]} text-white px-5 py-3 rounded-xl shadow-lg
                  flex items-center gap-3 min-w-[280px] max-w-[90vw]
                  transition-all duration-300
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <span className="text-sm flex-1">{message}</span>

      {onUndo && (
        <button
          onClick={onUndo}
          className="text-sm font-bold text-white/90 hover:text-white underline underline-offset-2"
        >
          Cofnij
        </button>
      )}

      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}
        className="text-white/60 hover:text-white ml-1"
      >
        ✕
      </button>
    </div>
  )
}
