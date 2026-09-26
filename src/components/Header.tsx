import { ClubLogo } from './ClubLogo'

interface HeaderProps {
  live: boolean
  windowLabel: string
  pulse: { text: string; live: boolean }
  refreshing?: boolean
}

export function Header({ live, windowLabel, pulse, refreshing = false }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__row">
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
      </div>
      <p className={pulse.live ? 'site-header__pulse is-live' : 'site-header__pulse'}>
        {pulse.live ? <span className="live-dot" aria-hidden="true" /> : null}
        <span>{pulse.text}</span>
        {refreshing ? <span className="site-header__refresh">מתעדכן</span> : null}
      </p>
    </header>
  )
}
