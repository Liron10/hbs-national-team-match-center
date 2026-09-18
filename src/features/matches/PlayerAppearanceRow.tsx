import type { PlayerAppearance } from '../../types'
import { getPlayer } from '../../data/players'
import { PlayerPortrait } from '../../components/PlayerPortrait'
import { appearanceStats, squadStatusLabel } from '../../utils/appearanceCopy'

interface PlayerAppearanceRowProps {
  appearance: PlayerAppearance
  compact?: boolean
}

export function PlayerAppearanceRow({ appearance, compact = false }: PlayerAppearanceRowProps) {
  const player = getPlayer(appearance.playerId)
  if (!player) return null

  const stats = appearanceStats(appearance)
  const showStatus = !compact && appearance.squadStatus !== 'unknown'

  return (
    <article className="appearance">
      <PlayerPortrait player={player} />
      <div className="appearance__body">
        <h4>{player.nameHe}</h4>
        {showStatus ? <p>{squadStatusLabel(appearance.squadStatus)}</p> : null}
        {stats.length > 0 ? (
          <ul className="appearance__stats">
            {stats.map((stat) => (
              <li key={stat.label}>
                {stat.value ? `${stat.value} ${stat.label}` : stat.label}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  )
}
