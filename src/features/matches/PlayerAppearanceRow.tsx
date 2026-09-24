import { useState } from 'react'
import type { PlayerAppearance } from '../../types'
import { getPlayer } from '../../data/players'
import { PlayerPortrait } from '../../components/PlayerPortrait'
import { appearanceStats, squadStatusLabel } from '../../utils/appearanceCopy'

interface PlayerAppearanceRowProps {
  appearance: PlayerAppearance
  expanded?: boolean
}

export function PlayerAppearanceRow({ appearance, expanded = false }: PlayerAppearanceRowProps) {
  const player = getPlayer(appearance.playerId)
  const [open, setOpen] = useState(false)
  if (!player) return null

  const stats = appearanceStats(appearance)
  const known = appearance.squadStatus !== 'unknown'
  const showAll = expanded || open
  const visibleStats = showAll ? stats : stats.slice(0, 1)

  return (
    <button
      type="button"
      className={showAll ? 'appearance appearance--button is-expanded' : 'appearance appearance--button'}
      onClick={() => setOpen((current) => !current)}
      aria-expanded={showAll}
      aria-label={`נתוני ${player.nameHe}`}
    >
      <PlayerPortrait player={player} />
      <div className="appearance__body">
        <h4>{player.nameHe}</h4>
        <p>{squadStatusLabel(appearance.squadStatus)}</p>
        {known && visibleStats.length > 0 ? (
          <ul className="appearance__stats">
            {visibleStats.map((stat) => (
              <li key={`${stat.label}-${stat.value}`}>
                {stat.value ? `${stat.value} ${stat.label}` : stat.label}
              </li>
            ))}
          </ul>
        ) : null}
        {known && stats.length > 1 ? (
          <span className="appearance__more">{showAll ? 'הסתרת נתונים' : 'כל הנתונים'}</span>
        ) : null}
      </div>
    </button>
  )
}
