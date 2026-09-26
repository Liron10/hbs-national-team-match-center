import assert from 'node:assert/strict'
import test from 'node:test'
import type { Match } from '../types'
import { dayBrief, eveningBadge, livePhaseLabel, tonightSlate } from './fanDay.ts'

function match(partial: Partial<Match> & Pick<Match, 'id' | 'kickoff' | 'status'>): Match {
  return {
    competition: 'c',
    competitionHe: 'c',
    homeTeam: { code: 'ISR', nameHe: 'ישראל', nameEn: 'Israel' },
    awayTeam: { code: 'IRL', nameHe: 'אירלנד', nameEn: 'Ireland' },
    homeScore: null,
    awayScore: null,
    lastUpdated: partial.kickoff,
    players: [{ playerId: 'eliel-peretz', squadStatus: 'unknown' }],
    ...partial,
  }
}

test('builds a tonight slate including the overnight fixture', () => {
  const now = new Date('2026-09-25T18:00:00.000Z')
  const slate = tonightSlate(
    [
      match({ id: 'evening', kickoff: '2026-09-25T18:45:00.000Z', status: 'scheduled' }),
      match({
        id: 'late',
        kickoff: '2026-09-26T00:00:00.000Z',
        status: 'scheduled',
        homeTeam: { code: 'PER', nameHe: 'פרו', nameEn: 'Peru' },
        awayTeam: { code: 'COL', nameHe: 'קולומביה', nameEn: 'Colombia' },
        players: [{ playerId: 'adrian-ugarriza', squadStatus: 'unknown' }],
      }),
      match({ id: 'later', kickoff: '2026-09-29T18:45:00.000Z', status: 'scheduled' }),
    ],
    now,
  )
  assert.deepEqual(slate.map((item) => item.id), ['evening', 'late'])
  assert.equal(eveningBadge(slate[0]!, slate, now), 'first')
  assert.equal(eveningBadge(slate[1]!, slate, now), 'night')
})

test('summarises the day only after every tonight match is finished', () => {
  const now = new Date('2026-09-24T19:00:00.000Z')
  const brief = dayBrief(
    [
      match({
        id: 'done',
        kickoff: '2026-09-24T18:45:00.000Z',
        status: 'finished',
        homeScore: 3,
        awayScore: 1,
        players: [
          {
            playerId: 'eliel-peretz',
            squadStatus: 'starter',
            played: true,
            minutes: 90,
            goals: 1,
          },
        ],
      }),
    ],
    now,
  )
  assert.equal(brief?.title, 'סיכום היום')
  assert.match(brief?.line ?? '', /שער אחד/)
})

test('names halftime extra time and penalties without inventing a new screen', () => {
  assert.equal(livePhaseLabel(match({ id: 'ht', kickoff: '2026-09-24T18:45:00.000Z', status: 'halftime' })), 'מחצית')
  assert.equal(
    livePhaseLabel(
      match({ id: 'et', kickoff: '2026-09-24T18:45:00.000Z', status: 'live', clock: 'הארכה' }),
    ),
    'הארכה',
  )
  assert.equal(
    livePhaseLabel(
      match({ id: 'pen', kickoff: '2026-09-24T18:45:00.000Z', status: 'live', clock: 'פנדלים' }),
    ),
    'פנדלים',
  )
})
