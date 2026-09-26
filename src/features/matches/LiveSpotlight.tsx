import type { Match } from '../../types'
import { KickoffCountdown } from '../../components/KickoffCountdown'
import { PlayerPortrait } from '../../components/PlayerPortrait'
import { getPlayer } from '../../data/players'
import { formatMatchTime } from '../../utils/datetime'
import { livePhaseLabel } from '../../utils/fanDay'
import { participationLine } from '../../utils/appearanceCopy'
import { matchLineup, ourNationalSide } from '../../utils/matchLine'
import { isLiveStatus } from '../../utils/matchStatus'
import { MatchTeam } from './MatchTeam'

interface LiveSpotlightProps {
  match: Match
}

export function LiveSpotlight({ match }: LiveSpotlightProps) {
  const live = isLiveStatus(match.status)
  const hasScore = match.homeScore !== null && match.awayScore !== null
  const { left, right } = matchLineup(match)
  const ours = ourNationalSide(match)
  const center = hasScore
    ? `${match.homeScore}–${match.awayScore}`
    : formatMatchTime(match.kickoff)
  const representatives = match.players
    .map((appearance) => {
      const player = getPlayer(appearance.playerId)
      if (!player) return null
      return { player, line: participationLine(appearance, match.status, match.clock) }
    })
    .filter((item) => item != null)

  return (
    <section className="spotlight" aria-label="המשחק המרכזי">
      <p className="spotlight__kicker">
        {live ? (
          <>
            <span className="live-dot" aria-hidden="true" />
            {livePhaseLabel(match)}
          </>
        ) : (
          'הבא בתור'
        )}
      </p>
      <p className="spotlight__comp">{match.competitionHe}</p>
      <div className="spotlight__scoreline">
        <MatchTeam team={left.team} label={left.label} size="lg" ours={left.team.code === ours.code} />
        <div className="spotlight__center">
          {hasScore ? null : <span className="spotlight__vs">VS</span>}
          <strong aria-label={hasScore ? `תוצאה ${center}` : `שעת משחק ${center}`}>{center}</strong>
        </div>
        <MatchTeam team={right.team} label={right.label} size="lg" ours={right.team.code === ours.code} />
      </div>
      {match.status === 'scheduled' ? (
        <KickoffCountdown kickoff={match.kickoff} status={match.status} featured />
      ) : null}
      {representatives.length > 0 ? (
        <ul className="spotlight__players">
          {representatives.map(({ player, line }) => (
            <li key={player.id}>
              <PlayerPortrait player={player} />
              <div className="spotlight__player">
                <span>{player.nameHe}</span>
                {line ? <small>{line}</small> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
