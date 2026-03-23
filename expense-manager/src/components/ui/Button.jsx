/**
 * Reużywalny przycisk z wariantami.
 * @param {'primary'|'secondary'|'ghost'} variant
 */
export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const base = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  }

  return (
    <button className={`${base[variant] || base.primary} ${className}`} {...props}>
      {children}
    </button>
  )
}
