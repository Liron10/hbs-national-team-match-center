import { ClubLogo } from './ClubLogo'

interface HeaderProps {
  live: boolean
  windowLabel: string
}

export function Header({ live, windowLabel }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__brand">
        <ClubLogo />
        <div>
          <p className="site-header__kicker">הפועל באר שבע</p>
          <p className="site-header__title">האדומים בנבחרות</p>
        </div>
      </div>
      {live ? (
        <p className="site-header__live" aria-live="polite">
          <span className="live-dot" />
          LIVE
        </p>
      ) : (
        <p className="site-header__meta">{windowLabel}</p>
      )}
    </header>
  )
}
