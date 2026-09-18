import { players } from '../../data/players'
import { nationalTeams } from '../../data/teams'
import { Flag } from '../../components/Flag'
import { PlayerPortrait } from '../../components/PlayerPortrait'

interface PlayersGridProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export function PlayersGrid({ selectedId, onSelect }: PlayersGridProps) {
  return (
    <section className="players-section" aria-labelledby="players-heading">
      <div className="section-heading">
        <h2 id="players-heading">הנציגים שלנו</h2>
      </div>
      <div className="players-grid">
        {players.map((player) => {
          const team = nationalTeams[player.nationalTeamCode]
          const selected = selectedId === player.id
          return (
            <button
              key={player.id}
              type="button"
              className={selected ? 'player-card is-selected' : 'player-card'}
              onClick={() => onSelect(player.id)}
              aria-pressed={selected}
              aria-label={`הצגת משחקים של ${player.nameHe}`}
            >
              <PlayerPortrait player={player} className="portrait--lg" />
              <span className="player-card__name">{player.nameHe}</span>
              <span className="player-card__team">
                <Flag code={team.code} title={team.nameHe} className="flag--sm" />
                {team.nameHe}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
