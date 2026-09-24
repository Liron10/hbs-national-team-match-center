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
}

export function PlayerAppearanceRow({ appearance, matchStatus }: PlayerAppearanceRowProps) {
  const player = getPlayer(appearance.playerId)
  const [open, setOpen] = useState(false)
  if (!player) return null

  const reportReady = matchShowsPlayerStats(matchStatus)
  const line = reportReady ? participationLine(appearance) : ''
  const stats = reportReady ? appearanceStats(appearance) : []
  const body = (
    <>
      <PlayerPortrait player={player} />
      <div className="appearance__body">
        <h4>{player.nameHe}</h4>
        {line ? <p>{line}</p> : null}
        {open && stats.length > 0 ? (
          <ul className="appearance__stats">
            {stats.map((stat) => (
              <li key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </li>
            ))}
          </ul>
        ) : null}
        {stats.length > 0 ? (
          <span className="appearance__more">{open ? 'הסתרת נתונים' : 'כל הנתונים'}</span>
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
      className={open ? 'appearance appearance--button is-expanded' : 'appearance appearance--button'}
      onClick={() => setOpen((current) => !current)}
      aria-expanded={open}
      aria-label={`נתוני ${player.nameHe}`}
    >
      {body}
    </button>
  )
}
