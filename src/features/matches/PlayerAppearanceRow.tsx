import { useState } from 'react'
import type { MatchStatus, PlayerAppearance } from '../../types'
import { getPlayer } from '../../data/players'
import { PlayerPortrait } from '../../components/PlayerPortrait'
import {
  appearanceStats,
  matchShowsPlayerStats,
  participationLine,
} from '../../utils/appearanceCopy'

interface PlayerAppearanceRowProps {
  appearance: PlayerAppearance
  matchStatus: MatchStatus
  expanded?: boolean
}

export function PlayerAppearanceRow({
  appearance,
  matchStatus,
  expanded = false,
}: PlayerAppearanceRowProps) {
  const player = getPlayer(appearance.playerId)
  const reportReady = matchShowsPlayerStats(matchStatus)
  const line = reportReady ? participationLine(appearance) : ''
  const stats = reportReady ? appearanceStats(appearance) : []
  const [open, setOpen] = useState(expanded || stats.length > 0)
  if (!player) return null

  const showAll = expanded || open
  const visibleStats = showAll ? stats : stats.slice(0, 2)
  const body = (
    <>
      <PlayerPortrait player={player} />
      <div className="appearance__body">
        <h4>{player.nameHe}</h4>
        {line ? <p>{line}</p> : null}
        {visibleStats.length > 0 ? (
          <ul className="appearance__stats">
            {visibleStats.map((stat) => (
              <li key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </li>
            ))}
          </ul>
        ) : null}
        {stats.length > 2 ? (
          <span className="appearance__more">{showAll ? 'הסתרת נתונים' : 'כל הנתונים'}</span>
        ) : null}
      </div>
    </>
  )

  if (stats.length === 0) {
    return <div className="appearance">{body}</div>
  }

  return (
    <button
      type="button"
      className={showAll ? 'appearance appearance--button is-expanded' : 'appearance appearance--button'}
      onClick={() => setOpen((current) => !current)}
      aria-expanded={showAll}
      aria-label={`נתוני ${player.nameHe}`}
    >
      {body}
    </button>
  )
}
