import type { Match } from '../../types'
import { getPlayer } from '../../data/players'
import { Flag } from '../../components/Flag'
import { PlayerPortrait } from '../../components/PlayerPortrait'
import { isLiveStatus } from '../../utils/matchStatus'

interface LiveSpotlightProps {
  match: Match
}

export function LiveSpotlight({ match }: LiveSpotlightProps) {
  const live = isLiveStatus(match.status)
  const names = match.players
    .map((appearance) => getPlayer(appearance.playerId)?.nameHe)
    .filter(Boolean)
    .join(', ')

  const hasScore = match.homeScore !== null && match.awayScore !== null
  const headline = live
    ? `עכשיו: ${match.homeTeam.nameHe} – ${match.awayTeam.nameHe}`
    : `הערב: ${names || `${match.homeTeam.nameHe} – ${match.awayTeam.nameHe}`}`

  return (
    <section className="spotlight" aria-label="משחק בולט">
      <p className="spotlight__kicker">{live ? 'LIVE' : 'היום'}</p>
      <h2>{headline}</h2>
      <p className="spotlight__comp">{match.competitionHe}</p>
      <div className="spotlight__scoreline">
        <Flag code={match.homeTeam.code} title={match.homeTeam.nameHe} className="flag--lg" />
        <span>{match.homeTeam.nameHe}</span>
        <strong>
          {hasScore ? `${match.homeScore}–${match.awayScore}` : '–'}
        </strong>
        <span>{match.awayTeam.nameHe}</span>
        <Flag code={match.awayTeam.code} title={match.awayTeam.nameHe} className="flag--lg" />
      </div>
      <ul className="spotlight__players">
        {match.players.map((appearance) => {
          const player = getPlayer(appearance.playerId)
          if (!player) return null
          return (
            <li key={player.id}>
              <PlayerPortrait player={player} />
              <span>{player.nameHe}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
