import type { Match } from '../../types'
import { KickoffCountdown } from '../../components/KickoffCountdown'
import { StatusBadge } from '../../components/StatusBadge'
import { Flag } from '../../components/Flag'
import { formatFanKickoff, formatMatchTime, formatOvernightContext } from '../../utils/datetime'
import { hbsWatermarkCodes, matchLineup, ourNationalSide } from '../../utils/matchLine'
import { displayStatus, isLiveStatus } from '../../utils/matchStatus'
import { competitionBadge } from '../../utils/boardPulse'
import { eveningBadge, lineupPublished } from '../../utils/fanDay'
import { matchFactLine } from '../../utils/matchFacts'
import { MatchTeam } from './MatchTeam'
import { PlayerAppearanceRow } from './PlayerAppearanceRow'

interface MatchCardProps {
  match: Match
  matches: Match[]
  now: Date
  featured?: boolean
  onOpenPlayer: (playerId: string, matchId: string) => void
}

export function MatchCard({ match, matches, now, featured = false, onOpenPlayer }: MatchCardProps) {
  const status = displayStatus(match, now)
  const live = isLiveStatus(match.status)
  const finished = match.status === 'finished'
  const postponed = match.status === 'postponed'
  const cancelled = match.status === 'cancelled'
  const hasScore = match.homeScore !== null && match.awayScore !== null
  const kickoff = formatFanKickoff(match.kickoff, now, match.status)
  const kickoffTime = formatMatchTime(match.kickoff)
  const center = postponed || cancelled ? null : hasScore ? `${match.homeScore}–${match.awayScore}` : kickoffTime
  const watermarks = hbsWatermarkCodes(match)
  const { left, right } = matchLineup(match)
  const ours = ourNationalSide(match)
  const showPlayers = match.players.length > 0
  const badge = eveningBadge(match, matches, now)
  const overnight = formatOvernightContext(match.kickoff)
  const published = match.status === 'scheduled' && lineupPublished(match)
  const fact = matchFactLine(match)
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
      {watermarks.length > 0 && watermarks.length <= 2
        ? watermarks.map((code, index) => (
            <div
              key={code}
              className={index > 0 ? 'match-card__watermark match-card__watermark--alt' : 'match-card__watermark'}
              aria-hidden="true"
            >
              <Flag code={code} title="" className="flag--watermark" />
            </div>
          ))
        : null}
      <header className="match-card__meta">
        <div className="match-card__when">
          {featured ? <span className="next-badge">המשחק הקרוב</span> : null}
          {badge === 'first' ? <span className="next-badge">הראשון הערב</span> : null}
          {badge === 'night' ? <span className="next-badge">סוגר את הלילה</span> : null}
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
        <MatchTeam team={left.team} label={left.label} ours={left.team.code === ours.code} />
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
        <MatchTeam team={right.team} label={right.label} ours={right.team.code === ours.code} />
      </div>
      {overnight && match.status === 'scheduled' ? <p className="overnight-note">{overnight}</p> : null}
      {featured ? <KickoffCountdown kickoff={match.kickoff} status={match.status} featured /> : null}
      {published ? <p className="match-card__note">ההרכב פורסם</p> : null}
      {showPlayers ? (
        <section className="match-card__players" aria-label="נציגי הפועל באר שבע">
          <h3>
            {match.players.length > 1
              ? `${match.players.length} נציגים של הפועל באר שבע`
              : 'נציג הפועל באר שבע'}
          </h3>
          {match.players.map((appearance) => (
            <PlayerAppearanceRow
              key={appearance.playerId}
              appearance={appearance}
              matchStatus={match.status}
              clock={match.clock}
              onOpenPlayer={(playerId) => onOpenPlayer(playerId, match.id)}
            />
          ))}
          {fact ? <p className="match-card__fact">{fact}</p> : null}
        </section>
      ) : null}
    </article>
  )
}
