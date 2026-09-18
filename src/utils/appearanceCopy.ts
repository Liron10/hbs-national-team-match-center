import type { PlayerAppearance, SquadStatus } from '../types'

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
  const stats: AppearanceStat[] = []

  if (typeof appearance.minutes === 'number') {
    stats.push({ label: 'דקות', value: String(appearance.minutes) })
  }
  if (typeof appearance.goals === 'number') {
    stats.push({
      label: appearance.goals === 1 ? 'שער אחד' : 'שערים',
      value: appearance.goals === 1 ? '' : String(appearance.goals),
    })
  }
  if (typeof appearance.assists === 'number') {
    stats.push({
      label: appearance.assists === 1 ? 'בישול אחד' : 'בישולים',
      value: appearance.assists === 1 ? '' : String(appearance.assists),
    })
  }
  if (typeof appearance.yellowCards === 'number' && appearance.yellowCards > 0) {
    stats.push({
      label: appearance.yellowCards === 1 ? 'כרטיס צהוב' : 'כרטיסים צהובים',
      value: appearance.yellowCards === 1 ? '' : String(appearance.yellowCards),
    })
  }
  if (typeof appearance.redCards === 'number' && appearance.redCards > 0) {
    stats.push({
      label: appearance.redCards === 1 ? 'כרטיס אדום' : 'כרטיסים אדומים',
      value: appearance.redCards === 1 ? '' : String(appearance.redCards),
    })
  }
  if (typeof appearance.subbedInMinute === 'number') {
    stats.push({ label: 'נכנס', value: `${appearance.subbedInMinute}'` })
  }
  if (typeof appearance.subbedOutMinute === 'number') {
    stats.push({ label: 'הוחלף', value: `${appearance.subbedOutMinute}'` })
  }

  return stats
}
