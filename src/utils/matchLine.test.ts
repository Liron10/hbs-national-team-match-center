import assert from 'node:assert/strict'
import test from 'node:test'
import type { Match } from '../types'
import { annotatedTeamLabel, lastNameHe, matchHeadline } from './matchLine.ts'

function peruMatch(): Match {
  return {
    id: 'usa-per',
    competition: 'Friendly',
    competitionHe: 'ידידות',
    homeTeam: { code: 'USA', nameHe: 'ארצות הברית', nameEn: 'United States' },
    awayTeam: { code: 'PER', nameHe: 'פרו', nameEn: 'Peru' },
    kickoff: '2026-09-26T20:30:00.000Z',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    lastUpdated: '2026-09-18T09:00:00.000Z',
    players: [{ playerId: 'adrian-ugarriza', squadStatus: 'unknown' }],
  }
}

test('uses last Hebrew name for annotation', () => {
  assert.equal(lastNameHe('אדריאן אוגריסה'), 'אוגריסה')
})

test('formats non-Israel matches as team (player) vs opponent', () => {
  assert.equal(matchHeadline(peruMatch()), 'פרו (אוגריסה) – ארה״ב')
})

test('does not annotate Israel sides', () => {
  const match: Match = {
    ...peruMatch(),
    id: 'aut-isr',
    homeTeam: { code: 'AUT', nameHe: 'אוסטריה', nameEn: 'Austria' },
    awayTeam: { code: 'ISR', nameHe: 'ישראל', nameEn: 'Israel' },
    players: [{ playerId: 'eliel-peretz', squadStatus: 'unknown' }],
  }
  assert.equal(annotatedTeamLabel(match, match.awayTeam), 'ישראל')
  assert.equal(matchHeadline(match), 'אוסטריה – ישראל')
})
