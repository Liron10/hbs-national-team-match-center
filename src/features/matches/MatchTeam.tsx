import type { TeamSide } from '../../types'
import { Flag } from '../../components/Flag'

interface MatchTeamProps {
  team: TeamSide
  label: string
  align?: 'start' | 'end'
}

export function MatchTeam({ team, label, align = 'start' }: MatchTeamProps) {
  return (
    <div className={`match-team match-team--${align}`}>
      <Flag code={team.code} title={label} />
      <span>{label}</span>
    </div>
  )
}
