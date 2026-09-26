import { useEffect } from 'react'
import type { Match, Player } from '../types'
import { Flag } from './Flag'
import { PlayerPortrait } from './PlayerPortrait'
import { nationalTeams } from '../data/teams'
import { displayTeamName } from '../utils/matchLine'
import { formatStartPhrase } from '../utils/countdown'
import { playerWindowProfile } from '../utils/playerWindow'

interface PlayerSheetProps {
  player: Player
  matches: Match[]
  now: Date
  onClose: () => void
  onShowMatch: (matchId: string) => void
}

export function PlayerSheet({ player, matches, now, onClose, onShowMatch }: PlayerSheetProps) {
  const team = nationalTeams[player.nationalTeamCode]
  const profile = playerWindowProfile(player.id, matches, now)
  const nextKickoff = matches.find((match) => match.id === profile.nextMatch?.matchId)?.kickoff
  const nextEta = nextKickoff ? formatStartPhrase(nextKickoff, now) : null

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <aside
        className="player-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="player-sheet__handle" aria-hidden="true" />
        <button type="button" className="player-sheet__close" onClick={onClose} aria-label="סגירת כרטיס שחקן">
          סגירה
        </button>
        <header className="player-sheet__hero">
          <PlayerPortrait player={player} className="portrait--xl" />
          <div>
            <h2 id="player-sheet-title">{player.nameHe}</h2>
            <p className="player-sheet__team">
              <Flag code={team.code} title={displayTeamName(team)} className="flag--sm" />
              {displayTeamName(team)}
            </p>
          </div>
        </header>
        {profile.headlineStats.length > 0 ? (
          <ul className="player-sheet__stats">
            {profile.headlineStats.map((stat) => (
              <li key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {profile.windowStats.length > 0 ? (
          <section className="player-sheet__block">
            <h3>החלון הנוכחי</h3>
            <ul className="player-sheet__inline">
              {profile.windowStats.map((stat) => (
                <li key={stat.label}>
                  <strong>{stat.value}</strong> {stat.label}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {profile.lastMatch ? (
          <section className="player-sheet__block">
            <h3>המשחק האחרון</h3>
            <p>{profile.lastMatch.line}</p>
            {profile.lastMatch.detail ? <p className="player-sheet__muted">{profile.lastMatch.detail}</p> : null}
          </section>
        ) : null}
        {profile.nextMatch ? (
          <section className="player-sheet__block">
            <h3>המשחק הבא</h3>
            <p>{profile.nextMatch.line}</p>
            <p className="player-sheet__muted">
              {profile.nextMatch.when}
              {nextEta ? ` • ${nextEta}` : ''}
            </p>
            <button type="button" className="player-sheet__link" onClick={() => onShowMatch(profile.nextMatch!.matchId)}>
              הצג במשחקים
            </button>
          </section>
        ) : null}
        {profile.recent.length > 0 ? (
          <section className="player-sheet__block">
            <h3>משחקים אחרונים</h3>
            <ul className="player-sheet__recent">
              {profile.recent.map((item) => (
                <li key={item.matchId}>
                  <span>{item.line}</span>
                  {item.detail ? <strong>{item.detail}</strong> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </aside>
    </div>
  )
}
