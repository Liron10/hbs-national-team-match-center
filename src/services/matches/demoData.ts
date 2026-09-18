import type { Match } from '../../types'

export function createDemoMatches(now = new Date()): Match[] {
  const kickoff = new Date(now.getTime() - 38 * 60 * 1000).toISOString()

  return [
    {
      id: 'demo-live-isr-irl',
      competition: 'Development overlay',
      competitionHe: 'נתוני פיתוח בלבד',
      homeTeam: { code: 'ISR', nameHe: 'ישראל', nameEn: 'Israel' },
      awayTeam: { code: 'IRL', nameHe: 'אירלנד', nameEn: 'Republic of Ireland' },
      kickoff,
      status: 'live',
      homeScore: 1,
      awayScore: 0,
      lastUpdated: now.toISOString(),
      players: [
        {
          playerId: 'eliel-peretz',
          squadStatus: 'starter',
          started: true,
          played: true,
          minutes: 38,
          goals: 1,
        },
        {
          playerId: 'idan-nachmias',
          squadStatus: 'starter',
          started: true,
          played: true,
          minutes: 38,
        },
        {
          playerId: 'guy-mizrahi',
          squadStatus: 'bench',
          started: false,
          played: false,
        },
      ],
    },
  ]
}
