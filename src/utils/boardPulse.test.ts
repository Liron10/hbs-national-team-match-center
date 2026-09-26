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
  assert.equal(boardPulse([live]).text, 'נציג אחד משחק עכשיו')
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
