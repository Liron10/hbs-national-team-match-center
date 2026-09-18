import { Shield } from 'lucide-react'

interface HeaderProps {
  live: boolean
}

export function Header({ live }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__brand">
        <span className="site-header__mark" aria-hidden="true">
          <Shield size={18} />
        </span>
        <div>
          <p className="site-header__kicker">הפועל באר שבע</p>
          <p className="site-header__title">Match Center</p>
        </div>
      </div>
      {live ? (
        <p className="site-header__live" aria-live="polite">
          <span className="live-dot" />
          יש משחק חי עכשיו
        </p>
      ) : (
        <p className="site-header__meta">פגרת הנבחרות 2026/27</p>
      )}
    </header>
  )
}
