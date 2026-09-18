import type { TeamSide } from '../../types'
import { Flag } from '../../components/Flag'

interface MatchTeamProps {
  team: TeamSide
  label: string
  size?: 'md' | 'lg'
}

export function MatchTeam({ team, label, size = 'md' }: MatchTeamProps) {
  return (
    <div className="match-team">
      <Flag code={team.code} title={label} className={size === 'lg' ? 'flag--lg' : undefined} />
      <span>{label}</span>
    </div>
  )
}
