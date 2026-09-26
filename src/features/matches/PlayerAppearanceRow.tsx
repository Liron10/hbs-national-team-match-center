import { ChevronLeft } from 'lucide-react'
import type { MatchStatus, PlayerAppearance } from '../../types'
import { getPlayer } from '../../data/players'
import { PlayerPortrait } from '../../components/PlayerPortrait'
import { playerChips } from '../../utils/appearanceCopy'

interface PlayerAppearanceRowProps {
  appearance: PlayerAppearance
  matchStatus: MatchStatus
  clock?: string
  onOpenPlayer: (playerId: string) => void
}

export function PlayerAppearanceRow({
  appearance,
  matchStatus,
  clock,
  onOpenPlayer,
}: PlayerAppearanceRowProps) {
  const player = getPlayer(appearance.playerId)
  if (!player) return null

  const chips = playerChips(appearance, matchStatus, clock)
  const scored = (appearance.goals ?? 0) > 0 && (matchStatus === 'live' || matchStatus === 'halftime')

  return (
    <button
      type="button"
      className={['appearance', 'appearance--button', scored ? 'is-goal' : ''].filter(Boolean).join(' ')}
      onClick={() => onOpenPlayer(player.id)}
      aria-label={`נתוני שחקן ${player.nameHe}`}
    >
      <PlayerPortrait player={player} />
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
      </div>
      <ChevronLeft className="appearance__more" aria-hidden="true" strokeWidth={2.25} />
    </button>
  )
}
