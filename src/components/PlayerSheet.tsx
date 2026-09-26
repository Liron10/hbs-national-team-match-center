import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { X } from 'lucide-react'
import type { Match, Player } from '../types'
import { Flag } from './Flag'
import { PlayerPortrait } from './PlayerPortrait'
import { nationalTeams } from '../data/teams'
import { displayTeamName } from '../utils/matchLine'
import { formatStartPhrase } from '../utils/countdown'
import { playerWindowProfile } from '../utils/playerWindow'
import { appearanceStats } from '../utils/appearanceCopy'

interface PlayerSheetProps {
  player: Player
  matches: Match[]
  matchId?: string | null
  now: Date
  onClose: () => void
  onShowMatch: (matchId: string) => void
}

const SWIPE_CLOSE_PX = 96

export function PlayerSheet({ player, matches, matchId, now, onClose, onShowMatch }: PlayerSheetProps) {
  const team = nationalTeams[player.nationalTeamCode]
  const profile = playerWindowProfile(player.id, matches, now)
  const sourceMatch = matchId ? matches.find((match) => match.id === matchId) : undefined
  const sourceAppearance = sourceMatch?.players.find((appearance) => appearance.playerId === player.id)
  const sourceStats =
    sourceMatch && sourceAppearance ? appearanceStats(sourceAppearance, sourceMatch.status) : []
  const lastFinished = [...matches]
    .filter((match) => match.status === 'finished')
    .sort((a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff))
    .map((match) => {
      const appearance = match.players.find((item) => item.playerId === player.id)
      return appearance ? { match, stats: appearanceStats(appearance, match.status) } : null
    })
    .find((item) => item && item.stats.length > 0)
  const matchStats = sourceStats.length > 0 ? sourceStats : (lastFinished?.stats ?? [])
  const matchStatsTitle =
    sourceStats.length > 0 ? 'במשחק' : lastFinished ? 'המשחק האחרון — נתונים' : 'במשחק'
  const nextKickoff = matches.find((match) => match.id === profile.nextMatch?.matchId)?.kickoff
  const nextEta = nextKickoff ? formatStartPhrase(nextKickoff, now) : null
  const startY = useRef<number | null>(null)
  const dragRef = useRef(0)
  const [drag, setDrag] = useState(0)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (window.matchMedia('(min-width: 768px)').matches) return
    startY.current = event.clientY
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (startY.current == null) return
    const next = Math.max(0, event.clientY - startY.current)
    dragRef.current = next
    setDrag(next)
  }

  function onPointerUp() {
    if (startY.current == null) return
    const distance = dragRef.current
    startY.current = null
    dragRef.current = 0
    if (distance >= SWIPE_CLOSE_PX) onClose()
    else setDrag(0)
  }

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <aside
        className="player-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-sheet-title"
        style={{ transform: drag > 0 ? `translateY(${drag}px)` : undefined }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="player-sheet__grab"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="player-sheet__handle" aria-hidden="true" />
          <div className="player-sheet__bar">
            <button
              type="button"
              className="player-sheet__close"
              onClick={onClose}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label="סגירה"
            >
              <X aria-hidden="true" strokeWidth={2.4} />
            </button>
          </div>
        </div>
        <header className="player-sheet__hero">
          <div className="player-sheet__hero-mark" aria-hidden="true">
            <Flag code={team.code} title="" className="flag--watermark" />
          </div>
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
        {matchStats.length > 0 ? (
          <section className="player-sheet__block">
            <h3>{matchStatsTitle}</h3>
            <ul className="appearance__stats player-sheet__match-stats">
              {matchStats.map((stat) => (
                <li key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </li>
              ))}
            </ul>
          </section>
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
            {profile.nextMatch.detail ? <p className="player-sheet__muted">{profile.nextMatch.detail}</p> : null}
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
