import assert from 'node:assert/strict'
import test from 'node:test'
import type { Match } from '../types'
import { sortMatches } from './sortMatches.ts'

function match(id: string, kickoff: string, status: Match['status']): Match {
  return {
    id,
    competition: 'c',
    competitionHe: 'c',
    homeTeam: { code: 'ISR', nameHe: 'ישראל', nameEn: 'Israel' },
    awayTeam: { code: 'IRL', nameHe: 'אירלנד', nameEn: 'Ireland' },
    kickoff,
    status,
    homeScore: null,
    awayScore: null,
    lastUpdated: kickoff,
    players: [],
  }
}

test('sorts live, today, upcoming, then finished newest first', () => {
  const now = new Date('2026-09-18T12:00:00.000Z')
  const sorted = sortMatches(
    [
      match('finished-old', '2026-09-10T18:00:00.000Z', 'finished'),
      match('upcoming', '2026-09-24T18:00:00.000Z', 'scheduled'),
      match('finished-new', '2026-09-16T18:00:00.000Z', 'finished'),
      match('today', '2026-09-18T18:00:00.000Z', 'scheduled'),
      match('live', '2026-09-18T11:00:00.000Z', 'live'),
    ],
    now,
  ).map((item) => item.id)

  assert.deepEqual(sorted, ['live', 'today', 'upcoming', 'finished-new', 'finished-old'])
})
