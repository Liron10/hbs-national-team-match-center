import type { TeamSide } from '../../types'
import { Flag } from '../../components/Flag'

interface MatchTeamProps {
  team: TeamSide
  label: string
  size?: 'md' | 'lg'
  ours?: boolean
}

export function MatchTeam({ team, label, size = 'md', ours = false }: MatchTeamProps) {
  return (
    <div className={ours ? 'match-team match-team--ours' : 'match-team'}>
      <Flag code={team.code} title={label} className={size === 'lg' ? 'flag--lg' : undefined} />
      <span>{label}</span>
    </div>
  )
}
