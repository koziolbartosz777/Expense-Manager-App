import { forwardRef } from 'react'

/**
 * Reużywalne pole tekstowe z etykietą.
 */
const Input = forwardRef(function Input(
  { label, id, error, className = '', ...props },
  ref
) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`input ${error ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
})

export default Input
