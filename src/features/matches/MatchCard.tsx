import type { Match } from '../../types'
import { KickoffCountdown } from '../../components/KickoffCountdown'
import { StatusBadge } from '../../components/StatusBadge'
import { formatMatchDate, formatMatchTime } from '../../utils/datetime'
import { hasVerifiedAppearance, isIsraelNationalSide, matchLineup, ourNationalSide } from '../../utils/matchLine'
import { displayStatus } from '../../utils/matchStatus'
import { MatchTeam } from './MatchTeam'
import { PlayerAppearanceRow } from './PlayerAppearanceRow'

interface MatchCardProps {
  match: Match
  now: Date
}

export function MatchCard({ match, now }: MatchCardProps) {
  const status = displayStatus(match, now)
  const hasScore = match.homeScore !== null && match.awayScore !== null
  const center = hasScore
    ? `${match.homeScore}–${match.awayScore}`
    : formatMatchTime(match.kickoff)
  const { left, right } = matchLineup(match)
  const israelMatch = isIsraelNationalSide(ourNationalSide(match).code)
  const showPlayers = israelMatch || hasVerifiedAppearance(match)

  return (
    <article className="match-card">
      <header className="match-card__meta">
        <time dateTime={match.kickoff}>{formatMatchDate(match.kickoff)}</time>
        <StatusBadge status={status} />
      </header>
      <p className="match-card__comp">{match.competitionHe}</p>
      <div className="match-card__line">
        <MatchTeam team={left.team} label={left.label} />
        <p className="match-card__score" aria-label={hasScore ? `תוצאה ${center}` : `שעת משחק ${center}`}>
          {center}
        </p>
        <MatchTeam team={right.team} label={right.label} align="end" />
      </div>
      <KickoffCountdown kickoff={match.kickoff} status={match.status} />
      {showPlayers ? (
        <section className="match-card__players" aria-label="שחקני הפועל באר שבע">
          <h3>שחקני הפועל באר שבע</h3>
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
