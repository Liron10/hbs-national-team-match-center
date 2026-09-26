import { ClubLogo } from './ClubLogo'
import type { BoardPulse } from '../utils/boardPulse'

interface HeaderProps {
  live: boolean
  windowLabel: string
  pulse: BoardPulse
}

export function Header({ live, windowLabel, pulse }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__row">
        <div className="site-header__brand">
          <ClubLogo />
          <div>
            <p className="site-header__kicker">הפועל באר שבע</p>
            <p className="site-header__title">MATCH CENTER</p>
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
      <div className={pulse.live ? 'site-header__pulse is-live' : 'site-header__pulse'}>
        <p>
          {pulse.live ? <span className="live-dot" aria-hidden="true" /> : null}
          <span>{pulse.text}</span>
        </p>
        {pulse.lines && pulse.lines.length > 0 ? (
          <ul className="site-header__pulse-lines">
            {pulse.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </header>
  )
}
