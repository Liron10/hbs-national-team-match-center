import type { PlayerAppearance, SquadStatus } from '../types'
import { buildFixedStats } from './fotmobAppearances'

const squadLabels: Record<SquadStatus, string> = {
  starter: 'פתח בהרכב',
  bench: 'ספסל',
  'subbed-in': 'נכנס כמחליף',
  'subbed-out': 'הוחלף',
  unused: 'לא שותף',
  'not-in-squad': 'לא בסגל',
  unknown: 'טרם התקבל מידע על שיתוף השחקן',
}

export function squadStatusLabel(status: SquadStatus): string {
  return squadLabels[status]
}

export interface AppearanceStat {
  label: string
  value: string
}

export function appearanceStats(appearance: PlayerAppearance): AppearanceStat[] {
  if (appearance.stats?.length === 10) return appearance.stats

  return buildFixedStats({
    minutes: appearance.minutes ?? 0,
    goals: appearance.goals ?? 0,
    assists: appearance.assists ?? 0,
    unused: appearance.squadStatus === 'unused' || appearance.squadStatus === 'not-in-squad',
    subIn: appearance.subbedInMinute,
    subOut: appearance.subbedOutMinute,
    yellow: appearance.yellowCards ?? 0,
    red: appearance.redCards ?? 0,
    passes: '0',
    shots: 0,
    defensive: 0,
  })
}
