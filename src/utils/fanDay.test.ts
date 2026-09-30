import assert from 'node:assert/strict'
import test from 'node:test'
import type { Match } from '../types'
import { dayBrief, livePhaseLabel, nextMatchLine, tonightSlate } from './fanDay.ts'

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

test('builds a today slate only until midnight, not the next-day overnight match', () => {
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
  assert.deepEqual(slate.map((item) => item.id), ['evening'])
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

test('does not count unused squad members as having played in the day brief', () => {
  const now = new Date('2026-09-29T20:50:00.000Z')
  const brief = dayBrief(
    [
      match({
        id: 'u21',
        kickoff: '2026-09-29T14:00:00.000Z',
        status: 'finished',
        homeScore: 2,
        awayScore: 3,
        players: [
          { playerId: 'niv-yehoshua', squadStatus: 'starter', started: true, played: true, minutes: 90, goals: 1 },
          { playerId: 'mohammed-abu-rumi', squadStatus: 'unused', played: false, minutes: 0 },
        ],
      }),
      match({
        id: 'jam',
        kickoff: '2026-09-29T00:00:00.000Z',
        status: 'finished',
        players: [{ playerId: 'javon-east', squadStatus: 'subbed-in', played: true, minutes: 28 }],
      }),
      match({
        id: 'bgr',
        kickoff: '2026-09-29T18:45:00.000Z',
        status: 'finished',
        players: [{ playerId: 'yoan-stoyanov', squadStatus: 'subbed-in', played: true, minutes: 17 }],
      }),
    ],
    now,
  )
  assert.equal(brief?.line, '3 נציגים שיחקו · 135 דקות · שער אחד')
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

test('names the next match by national team and opponent, not a single player', () => {
  const line = nextMatchLine(
    match({
      id: 'isr-xkx',
      kickoff: '2026-10-01T18:45:00.000Z',
      status: 'scheduled',
      homeTeam: { code: 'ISR', nameHe: 'ישראל', nameEn: 'Israel' },
      awayTeam: { code: 'XKX', nameHe: 'קוסובו', nameEn: 'Kosovo' },
      players: [
        { playerId: 'eliel-peretz', squadStatus: 'unknown' },
        { playerId: 'idan-nachmias', squadStatus: 'unknown' },
        { playerId: 'guy-mizrahi', squadStatus: 'unknown' },
      ],
    }),
    new Date('2026-09-30T07:20:00.000Z'),
  )
  assert.equal(line, 'המשחק הבא: ישראל מול קוסובו • מחר ב-21:45')
  assert.equal(line.includes('אליאל'), false)
})
