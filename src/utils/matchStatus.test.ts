import assert from 'node:assert/strict'
import test from 'node:test'
import type { Match } from '../types'
import { deriveBucket, displayStatus, matchesFilter } from './matchStatus.ts'

function match(partial: Partial<Match>): Match {
  return {
    id: 'm',
    competition: 'c',
    competitionHe: 'c',
    homeTeam: { code: 'ISR', nameHe: 'ישראל', nameEn: 'Israel' },
    awayTeam: { code: 'IRL', nameHe: 'אירלנד', nameEn: 'Ireland' },
    kickoff: '2026-09-18T18:00:00.000Z',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    lastUpdated: '2026-09-18T09:00:00.000Z',
    players: [],
    ...partial,
  }
}

test('does not invent LIVE from kickoff time', () => {
  const now = new Date('2026-09-18T18:10:00.000Z')
  const liveLooking = match({ kickoff: '2026-09-18T18:00:00.000Z', status: 'scheduled' })
  assert.equal(deriveBucket(liveLooking, now), 'today')
  assert.equal(displayStatus(liveLooking, now), 'today')
})

test('LIVE only when status is live or halftime', () => {
  const now = new Date('2026-09-18T18:10:00.000Z')
  assert.equal(deriveBucket(match({ status: 'live' }), now), 'live')
  assert.equal(deriveBucket(match({ status: 'halftime' }), now), 'live')
  assert.equal(matchesFilter(match({ status: 'scheduled' }), 'live', now), false)
})
