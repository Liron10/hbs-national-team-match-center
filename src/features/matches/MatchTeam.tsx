import type { TeamSide } from '../../types'
import { Flag } from '../../components/Flag'

interface MatchTeamProps {
  team: TeamSide
  label: string
}

export function MatchTeam({ team, label }: MatchTeamProps) {
  return (
    <div className="match-team">
      <Flag code={team.code} title={label} />
      <span>{label}</span>
    </div>
  )
}
