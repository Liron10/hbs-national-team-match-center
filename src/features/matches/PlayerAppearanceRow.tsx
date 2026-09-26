import { useState } from 'react'
import type { MatchStatus, PlayerAppearance } from '../../types'
import { getPlayer } from '../../data/players'
import { PlayerPortrait } from '../../components/PlayerPortrait'
import {
  appearanceStats,
  compactHighlights,
  matchShowsPlayerStats,
  playerChips,
} from '../../utils/appearanceCopy'

interface PlayerAppearanceRowProps {
  appearance: PlayerAppearance
  matchStatus: MatchStatus
  prominent?: boolean
}

export function PlayerAppearanceRow({
  appearance,
  matchStatus,
  prominent = false,
}: PlayerAppearanceRowProps) {
  const player = getPlayer(appearance.playerId)
  const [open, setOpen] = useState(false)
  if (!player) return null

  const reportReady = matchShowsPlayerStats(matchStatus)
  const chips = playerChips(appearance, matchStatus)
  const highlights = matchStatus === 'finished' ? compactHighlights(appearance) : []
  const stats = reportReady ? appearanceStats(appearance) : []
  const scored = (appearance.goals ?? 0) > 0 && (matchStatus === 'live' || matchStatus === 'halftime')
  const body = (
    <>
      <PlayerPortrait player={player} className={prominent ? 'portrait--lg' : ''} />
      <div className="appearance__body">
        <h4>{player.nameHe}</h4>
        {chips.length > 0 ? (
          <ul className="appearance__chips">
            {chips.map((chip) => (
              <li key={`${chip.kind}-${chip.label}`} className={`chip chip--${chip.kind}`}>
                {chip.label}
              </li>
            ))}
          </ul>
        ) : null}
        {highlights.length > 0 && !open ? (
          <ul className="appearance__highlights">
            {highlights.map((stat) => (
              <li key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
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
    return <div className={scored ? 'appearance is-goal' : 'appearance'}>{body}</div>
  }

  return (
    <button
      type="button"
      className={[
        'appearance',
        'appearance--button',
        open ? 'is-expanded' : '',
        scored ? 'is-goal' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => setOpen((current) => !current)}
      aria-expanded={open}
      aria-label={`נתוני ${player.nameHe}`}
    >
      {body}
    </button>
  )
}
