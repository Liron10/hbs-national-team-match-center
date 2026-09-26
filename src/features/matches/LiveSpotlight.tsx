import type { Match } from '../../types'
import { KickoffCountdown } from '../../components/KickoffCountdown'
import { PlayerPortrait } from '../../components/PlayerPortrait'
import { getPlayer } from '../../data/players'
import { formatMatchTime } from '../../utils/datetime'
import { isLiveStatus } from '../../utils/matchStatus'
import { matchLineup } from '../../utils/matchLine'
import { MatchTeam } from './MatchTeam'

interface LiveSpotlightProps {
  match: Match
}

export function LiveSpotlight({ match }: LiveSpotlightProps) {
  const live = isLiveStatus(match.status)
  const hasScore = match.homeScore !== null && match.awayScore !== null
  const { left, right } = matchLineup(match)
  const center = hasScore
    ? `${match.homeScore}–${match.awayScore}`
    : formatMatchTime(match.kickoff)
  const representatives = match.players
    .map((appearance) => getPlayer(appearance.playerId))
    .filter((player) => player != null)

  return (
    <section className="spotlight" aria-label="המשחק המרכזי">
      <p className="spotlight__kicker">
        {live ? (
          <>
            <span className="live-dot" aria-hidden="true" />
            {`משחק עכשיו${match.clock ? ` · ${match.clock}` : ''}`}
          </>
        ) : (
          'הבא בתור'
        )}
      </p>
      <p className="spotlight__comp">{match.competitionHe}</p>
      <div className="spotlight__scoreline">
        <MatchTeam team={left.team} label={left.label} size="lg" />
        <div className="spotlight__center">
          {hasScore ? null : <span className="spotlight__vs">VS</span>}
          <strong aria-label={hasScore ? `תוצאה ${center}` : `שעת משחק ${center}`}>{center}</strong>
        </div>
        <MatchTeam team={right.team} label={right.label} size="lg" />
      </div>
      <KickoffCountdown kickoff={match.kickoff} status={match.status} />
      {representatives.length > 0 ? (
        <ul className="spotlight__players">
          {representatives.map((player) => (
            <li key={player.id}>
              <PlayerPortrait player={player} />
              <span>{player.nameHe}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
