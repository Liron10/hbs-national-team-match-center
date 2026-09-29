import { playersById } from '../../data/players'
import { nationalTeams } from '../../data/teams'
import { Flag } from '../../components/Flag'
import { PlayerPortrait } from '../../components/PlayerPortrait'
import type { Match } from '../../types'
import { displayTeamName } from '../../utils/matchLine'
import { playerGridItems } from '../../utils/playerWindow'

interface PlayersGridProps {
  matches: Match[]
  now: Date
  selectedId: string | null
  onSelect: (id: string) => void
}

export function PlayersGrid({ matches, now, selectedId, onSelect }: PlayersGridProps) {
  const items = playerGridItems(matches, now)

  return (
    <section className="players-section" aria-labelledby="players-heading">
      <div className="section-heading">
        <h2 id="players-heading">הנציגים שלנו</h2>
      </div>
      <div className="players-grid">
        {items.map((item) => {
          const player = playersById[item.playerId]
          if (!player) return null
          const team = nationalTeams[player.nationalTeamCode]
          const selected = selectedId === player.id
          return (
            <button
              key={player.id}
              type="button"
              className={selected ? 'player-card is-selected' : 'player-card'}
              onClick={() => onSelect(player.id)}
              aria-pressed={selected}
              aria-label={`הצגת משחקים ונתונים של ${player.nameHe}`}
            >
              <PlayerPortrait player={player} className="portrait--lg" />
              <span className="player-card__name">{player.nameHe}</span>
              <span className="player-card__team">
                <Flag code={team.code} title={displayTeamName(team)} className="flag--sm" />
                {displayTeamName(team)}
              </span>
              {item.line ? <span className="player-card__line">{item.line}</span> : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}
