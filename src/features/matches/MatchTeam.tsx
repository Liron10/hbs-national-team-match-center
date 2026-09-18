import type { TeamSide } from '../../types'
import { Flag } from '../../components/Flag'

interface MatchTeamProps {
  team: TeamSide
  align?: 'start' | 'end'
}

export function MatchTeam({ team, align = 'start' }: MatchTeamProps) {
  return (
    <div className={`match-team match-team--${align}`}>
      <Flag code={team.code} title={team.nameHe} />
      <span>{team.nameHe}</span>
    </div>
  )
}
