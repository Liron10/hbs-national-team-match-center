import assert from 'node:assert/strict'
import test from 'node:test'
import type { Match } from '../types'
import { matchFactLine } from './matchFacts.ts'

test('writes one factual sentence after a finished match', () => {
  const match: Match = {
    id: 'aut-isr',
    competition: 'c',
    competitionHe: 'c',
    homeTeam: { code: 'AUT', nameHe: 'אוסטריה', nameEn: 'Austria' },
    awayTeam: { code: 'ISR', nameHe: 'ישראל', nameEn: 'Israel' },
    kickoff: '2026-09-24T18:45:00.000Z',
    status: 'finished',
    homeScore: 3,
    awayScore: 1,
    lastUpdated: '2026-09-24T20:45:00.000Z',
    players: [
      {
        playerId: 'eliel-peretz',
        squadStatus: 'starter',
        started: true,
        played: true,
        minutes: 90,
        goals: 1,
      },
    ],
  }
  assert.equal(matchFactLine(match), 'אליאל פרץ השלים 90 דקות וכבש בהפסד ישראל.')
})
