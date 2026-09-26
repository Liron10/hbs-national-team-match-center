import type { MatchStatus, PlayerAppearance } from '../../types'
import { getPlayer } from '../../data/players'
import { PlayerPortrait } from '../../components/PlayerPortrait'
import { appearanceStats, compactHighlights, playerChips, playerTimeline } from '../../utils/appearanceCopy'

interface PlayerAppearanceRowProps {
  appearance: PlayerAppearance
  matchStatus: MatchStatus
  prominent?: boolean
  onOpenPlayer: (playerId: string) => void
}

export function PlayerAppearanceRow({
  appearance,
  matchStatus,
  prominent = false,
  onOpenPlayer,
}: PlayerAppearanceRowProps) {
  const player = getPlayer(appearance.playerId)
  if (!player) return null

  const chips = playerChips(appearance, matchStatus)
  const stats = appearanceStats(appearance, matchStatus)
  const highlights = matchStatus === 'finished' && stats.length === 0 ? compactHighlights(appearance) : []
  const timeline =
    matchStatus === 'live' || matchStatus === 'halftime' || matchStatus === 'finished'
      ? playerTimeline(appearance)
      : []
  const scored = (appearance.goals ?? 0) > 0 && (matchStatus === 'live' || matchStatus === 'halftime')

  return (
    <button
      type="button"
      className={['appearance', 'appearance--button', scored ? 'is-goal' : ''].filter(Boolean).join(' ')}
      onClick={() => onOpenPlayer(player.id)}
      aria-label={`נתוני שחקן ${player.nameHe}`}
    >
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
        {timeline.length > 0 ? (
          <ol className="appearance__timeline">
            {timeline.map((event) => (
              <li key={`${event.kind}-${event.minute}`}>
                <span>{event.minute}'</span>
                {event.label}
              </li>
            ))}
          </ol>
        ) : null}
        {highlights.length > 0 ? (
          <ul className="appearance__highlights">
            {highlights.map((stat) => (
              <li key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {stats.length > 0 ? (
          <ul className="appearance__stats">
            {stats.map((stat) => (
              <li key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </li>
            ))}
          </ul>
        ) : null}
        <span className="appearance__more">נתוני שחקן</span>
      </div>
    </button>
  )
}
