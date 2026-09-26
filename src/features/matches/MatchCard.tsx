import type { Match } from '../../types'
import { KickoffCountdown } from '../../components/KickoffCountdown'
import { StatusBadge } from '../../components/StatusBadge'
import { Flag } from '../../components/Flag'
import { formatFanKickoff, formatMatchTime } from '../../utils/datetime'
import { matchLineup } from '../../utils/matchLine'
import { displayStatus, isLiveStatus } from '../../utils/matchStatus'
import { competitionBadge } from '../../utils/boardPulse'
import { MatchTeam } from './MatchTeam'
import { PlayerAppearanceRow } from './PlayerAppearanceRow'

interface MatchCardProps {
  match: Match
  now: Date
  featured?: boolean
  onOpenPlayer: (playerId: string, matchId: string) => void
}

export function MatchCard({ match, now, featured = false, onOpenPlayer }: MatchCardProps) {
  const status = displayStatus(match, now)
  const live = isLiveStatus(match.status)
  const finished = match.status === 'finished'
  const postponed = match.status === 'postponed'
  const cancelled = match.status === 'cancelled'
  const hasScore = match.homeScore !== null && match.awayScore !== null
  const kickoff = formatFanKickoff(match.kickoff, now, match.status)
  const kickoffTime = formatMatchTime(match.kickoff)
  const center = postponed || cancelled ? null : hasScore ? `${match.homeScore}–${match.awayScore}` : kickoffTime
  const { left, right } = matchLineup(match)
  const showPlayers = match.players.length > 0
  const classes = [
    'match-card',
    live ? 'match-card--live' : '',
    finished ? 'match-card--finished' : '',
    cancelled ? 'match-card--cancelled' : '',
    featured ? 'match-card--next' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={classes} id={`match-${match.id}`}>
      <div className="match-card__watermark" aria-hidden="true">
        <Flag code={match.homeTeam.code} title="" className="flag--watermark" />
      </div>
      <header className="match-card__meta">
        <div className="match-card__when">
          {featured ? <span className="next-badge">המשחק הקרוב</span> : null}
          {postponed || cancelled ? (
            <span className="match-card__date">{kickoff.date}</span>
          ) : (
            <>
              <time dateTime={match.kickoff}>{kickoff.primary}</time>
              <span className="match-card__date">{kickoff.date}</span>
            </>
          )}
        </div>
        <StatusBadge status={status} clock={match.clock} />
      </header>
      <p className="match-card__comp">
        <span className="comp-badge">{competitionBadge(match.competitionHe)}</span>
      </p>
      <div className="match-card__line">
        <MatchTeam team={left.team} label={left.label} />
        <div className="match-card__center">
          {hasScore || postponed || cancelled ? null : <span className="match-card__vs">VS</span>}
          {center ? (
            <p
              key={center}
              className={
                hasScore ? 'match-card__score match-card__score--result' : 'match-card__score match-card__score--kick'
              }
              aria-label={hasScore ? `תוצאה ${center}` : `שעת משחק ${center}`}
            >
              {center}
            </p>
          ) : null}
        </div>
        <MatchTeam team={right.team} label={right.label} />
      </div>
      <KickoffCountdown kickoff={match.kickoff} status={match.status} featured={featured} />
      {showPlayers ? (
        <section className="match-card__players" aria-label="נציגי הפועל באר שבע">
          <h3>
            {match.players.length > 1
              ? `${match.players.length} נציגי הפועל באר שבע`
              : 'נציג הפועל באר שבע'}
          </h3>
          {match.players.map((appearance) => (
            <PlayerAppearanceRow
              key={appearance.playerId}
              appearance={appearance}
              matchStatus={match.status}
              prominent={live}
              onOpenPlayer={(playerId) => onOpenPlayer(playerId, match.id)}
            />
          ))}
        </section>
      ) : null}
    </article>
  )
}
