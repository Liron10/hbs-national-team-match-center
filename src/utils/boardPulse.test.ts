import assert from 'node:assert/strict'
import test from 'node:test'
import type { Match } from '../types'
import { boardPulse } from './boardPulse.ts'

function match(partial: Partial<Match> & Pick<Match, 'id' | 'status'>): Match {
  return {
    competition: 'c',
    competitionHe: 'c',
    homeTeam: { code: 'ISR', nameHe: 'ישראל', nameEn: 'Israel' },
    awayTeam: { code: 'IRL', nameHe: 'אירלנד', nameEn: 'Ireland' },
    kickoff: '2026-09-26T18:45:00.000Z',
    homeScore: 1,
    awayScore: 0,
    lastUpdated: '2026-09-26T19:00:00.000Z',
    players: [],
    ...partial,
  }
}

test('counts only players on the pitch as currently playing', () => {
  const live = match({
    id: 'live',
    status: 'live',
    players: [
      { playerId: 'eliel-peretz', squadStatus: 'starter', played: true, minutes: 38 },
      { playerId: 'guy-mizrahi', squadStatus: 'bench', played: false },
      { playerId: 'idan-nachmias', squadStatus: 'subbed-out', played: true, minutes: 64, subbedOutMinute: 64 },
    ],
  })
  assert.equal(boardPulse([live]).text, 'נציג של הפועל באר שבע משחק כעת')
})

test('uses singular Hebrew when there is one match today', () => {
  const today = match({
    id: 'today',
    status: 'scheduled',
    kickoff: '2026-09-26T18:45:00.000Z',
  })
  assert.match(boardPulse([today], new Date('2026-09-26T10:00:00.000Z')).text, /משחק אחד היום/)
  assert.equal(boardPulse([today], new Date('2026-09-26T10:00:00.000Z')).text.includes('1 משחקים'), false)
})

test('does not count a next-day overnight kickoff as today in the banner', () => {
  const now = new Date('2026-09-29T07:04:00.000Z')
  const pulse = boardPulse(
    [
      match({
        id: 'today',
        status: 'scheduled',
        kickoff: '2026-09-29T14:00:00.000Z',
        players: [{ playerId: 'niv-yehoshua', squadStatus: 'unknown' }],
      }),
      match({
        id: 'overnight',
        status: 'scheduled',
        kickoff: '2026-09-30T01:00:00.000Z',
        homeTeam: { code: 'MEX', nameHe: 'מקסיקו', nameEn: 'Mexico' },
        awayTeam: { code: 'PER', nameHe: 'פרו', nameEn: 'Peru' },
        players: [{ playerId: 'adrian-ugarriza', squadStatus: 'unknown' }],
      }),
    ],
    now,
  )
  assert.match(pulse.text, /משחק אחד היום/)
  assert.equal(pulse.text.includes('2 משחקים'), false)
})

test('says two matches remain today, not two matches left in the window', () => {
  const now = new Date('2026-09-29T07:09:00.000Z')
  const pulse = boardPulse(
    [
      match({
        id: 'jam',
        status: 'finished',
        kickoff: '2026-09-29T00:00:00.000Z',
        players: [{ playerId: 'javon-east', squadStatus: 'subbed-in', played: true, minutes: 28 }],
      }),
      match({
        id: 'u21',
        status: 'scheduled',
        kickoff: '2026-09-29T14:00:00.000Z',
        players: [{ playerId: 'niv-yehoshua', squadStatus: 'unknown' }],
      }),
      match({
        id: 'bgr',
        status: 'scheduled',
        kickoff: '2026-09-29T18:45:00.000Z',
        homeTeam: { code: 'BGR', nameHe: 'בולגריה', nameEn: 'Bulgaria' },
        awayTeam: { code: 'EST', nameHe: 'אסטוניה', nameEn: 'Estonia' },
        players: [{ playerId: 'yoan-stoyanov', squadStatus: 'unknown' }],
      }),
      match({
        id: 'later',
        status: 'scheduled',
        kickoff: '2026-10-01T18:45:00.000Z',
        players: [{ playerId: 'eliel-peretz', squadStatus: 'unknown' }],
      }),
    ],
    now,
  )
  assert.equal(pulse.text, 'נותרו עוד 2 משחקים היום')
})

test('does not keep a finished U21 lineup in the header pulse', () => {
  const now = new Date('2026-09-29T17:52:00.000Z')
  const pulse = boardPulse(
    [
      match({
        id: 'jam',
        status: 'finished',
        kickoff: '2026-09-29T00:00:00.000Z',
        players: [{ playerId: 'javon-east', squadStatus: 'subbed-in', played: true, minutes: 28 }],
      }),
      match({
        id: 'u21',
        status: 'finished',
        kickoff: '2026-09-29T14:00:00.000Z',
        homeTeam: { code: 'SVN', nameHe: 'סלובניה עד 21', nameEn: 'Slovenia U21' },
        awayTeam: { code: 'ISR-U21', nameHe: 'ישראל עד 21', nameEn: 'Israel U21' },
        players: [
          { playerId: 'niv-yehoshua', squadStatus: 'starter', started: true, played: false, minutes: 0 },
          { playerId: 'mohammed-abu-rumi', squadStatus: 'unused', played: false, minutes: 0 },
        ],
      }),
      match({
        id: 'bgr',
        status: 'scheduled',
        kickoff: '2026-09-29T18:45:00.000Z',
        homeTeam: { code: 'BGR', nameHe: 'בולגריה', nameEn: 'Bulgaria' },
        awayTeam: { code: 'EST', nameHe: 'אסטוניה', nameEn: 'Estonia' },
        players: [{ playerId: 'yoan-stoyanov', squadStatus: 'bench', played: false, minutes: 0 }],
      }),
    ],
    now,
  )
  assert.equal(pulse.text, 'נותר עוד משחק אחד היום')
  assert.equal(pulse.text.includes('בהרכב'), false)
  assert.equal(pulse.text.includes('על הספסל'), false)
})

test('uses squad copy when nobody is on the pitch yet', () => {
  const live = match({
    id: 'live',
    status: 'live',
    players: [
      { playerId: 'yoan-stoyanov', squadStatus: 'bench', played: false },
      { playerId: 'guy-mizrahi', squadStatus: 'unused', played: false },
    ],
  })
  assert.equal(boardPulse([live]).text, '2 נציגים בסגל במשחק שמתקיים עכשיו')
})
