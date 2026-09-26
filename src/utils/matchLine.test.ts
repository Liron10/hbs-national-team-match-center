import assert from 'node:assert/strict'
import test from 'node:test'
import type { Match } from '../types'
import { hbsWatermarkCodes, annotatedTeamLabel, lastNameHe, matchHeadline, matchLineup } from './matchLine.ts'

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

test('formats non-Israel matches as home then away, with player on the HBS side', () => {
  assert.equal(matchHeadline(peruMatch()), 'ארה״ב – פרו (אוגריסה)')
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

test('puts home first in the lineup so RTL shows home on the right', () => {
  const lineup = matchLineup(peruMatch())
  assert.equal(lineup.left.team.code, 'USA')
  assert.equal(lineup.right.team.code, 'PER')
})

test('uses the HBS player national side for the card watermark', () => {
  assert.deepEqual(hbsWatermarkCodes(peruMatch()), ['PER'])
})

test('uses both national flags when HBS players appear on both sides', () => {
  const match: Match = {
    ...peruMatch(),
    players: [
      { playerId: 'adrian-ugarriza', squadStatus: 'unknown' },
      { playerId: 'eliel-peretz', squadStatus: 'unknown' },
    ],
    homeTeam: { code: 'ISR', nameHe: 'ישראל', nameEn: 'Israel' },
    awayTeam: { code: 'PER', nameHe: 'פרו', nameEn: 'Peru' },
  }
  assert.deepEqual(hbsWatermarkCodes(match), ['PER', 'ISR'])
})
