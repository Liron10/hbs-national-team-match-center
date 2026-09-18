import type { Match } from '../../types'
import { KickoffCountdown } from '../../components/KickoffCountdown'
import { StatusBadge } from '../../components/StatusBadge'
import { formatMatchDate, formatMatchTime } from '../../utils/datetime'
import { matchLineup } from '../../utils/matchLine'
import { displayStatus } from '../../utils/matchStatus'
import { MatchTeam } from './MatchTeam'
import { PlayerAppearanceRow } from './PlayerAppearanceRow'

interface MatchCardProps {
  match: Match
  now: Date
  showCountdown?: boolean
}

export function MatchCard({ match, now, showCountdown = false }: MatchCardProps) {
  const status = displayStatus(match, now)
  const hasScore = match.homeScore !== null && match.awayScore !== null
  const center = hasScore
    ? `${match.homeScore}–${match.awayScore}`
    : formatMatchTime(match.kickoff)
  const { left, right } = matchLineup(match)
  const showPlayers = match.players.length > 0

  return (
    <article className="match-card">
      <header className="match-card__meta">
        <time dateTime={match.kickoff}>{formatMatchDate(match.kickoff)}</time>
        <StatusBadge status={status} />
      </header>
      <p className="match-card__comp">{match.competitionHe}</p>
      <div className="match-card__line">
        <MatchTeam team={left.team} label={left.label} />
        <div className="match-card__center">
          {hasScore ? null : <span className="match-card__vs">VS</span>}
          <p className="match-card__score" aria-label={hasScore ? `תוצאה ${center}` : `שעת משחק ${center}`}>
            {center}
          </p>
        </div>
        <MatchTeam team={right.team} label={right.label} />
      </div>
      {showCountdown ? <KickoffCountdown kickoff={match.kickoff} status={match.status} /> : null}
      {showPlayers ? (
        <section className="match-card__players" aria-label="נציגי הפועל באר שבע">
          <h3>נציגי הפועל באר שבע</h3>
          {match.players.map((appearance) => (
            <PlayerAppearanceRow
              key={appearance.playerId}
              appearance={appearance}
              compact={appearance.squadStatus === 'unknown'}
            />
          ))}
        </section>
      ) : null}
    </article>
  )
}
