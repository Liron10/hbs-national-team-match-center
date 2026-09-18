import type { Match } from '../../types'
import { Flag } from '../../components/Flag'
import { KickoffCountdown } from '../../components/KickoffCountdown'
import { isLiveStatus } from '../../utils/matchStatus'
import { matchHeadline, matchLineup } from '../../utils/matchLine'

interface LiveSpotlightProps {
  match: Match
}

export function LiveSpotlight({ match }: LiveSpotlightProps) {
  const live = isLiveStatus(match.status)
  const hasScore = match.homeScore !== null && match.awayScore !== null
  const { left, right } = matchLineup(match)

  return (
    <section className="spotlight" aria-label="משחק בולט">
      <p className="spotlight__kicker">{live ? 'LIVE' : 'היום'}</p>
      <h2>
        {live ? 'עכשיו: ' : 'הערב: '}
        {matchHeadline(match)}
      </h2>
      <p className="spotlight__comp">{match.competitionHe}</p>
      <div className="spotlight__scoreline">
        <Flag code={left.team.code} title={left.label} className="flag--lg" />
        <span>{left.label}</span>
        <strong>{hasScore ? `${match.homeScore}–${match.awayScore}` : '–'}</strong>
        <span>{right.label}</span>
        <Flag code={right.team.code} title={right.label} className="flag--lg" />
      </div>
      <KickoffCountdown kickoff={match.kickoff} status={match.status} />
    </section>
  )
}
