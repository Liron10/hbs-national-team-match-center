import assert from 'node:assert/strict'
import test from 'node:test'
import type { Match } from '../types'
import { espnNameMatchesPlayer, mergeEspnSummary, parseEspnMinute } from './espnAppearances.ts'
import { getPlayer } from '../data/players.ts'

test('matches ESPN spellings of Abu Rumi and Yehoshua', () => {
  const rumi = getPlayer('mohammed-abu-rumi')
  const yehoshua = getPlayer('niv-yehoshua')
  assert.equal(espnNameMatchesPlayer('Mohamad Abu Rumi', rumi!), true)
  assert.equal(espnNameMatchesPlayer('Mohamad Abu Rumi (Israel U21) Substitution at 76\'', rumi!), true)
  assert.equal(espnNameMatchesPlayer('Niv Yehoshua', yehoshua!), true)
  assert.equal(espnNameMatchesPlayer('Niv Yehoshua (Israel U21) Goal at 90\'+1\'', yehoshua!), true)
})

test('reads a 90+1 clock as the 90th minute', () => {
  assert.equal(parseEspnMinute("90'+1'"), 90)
  assert.equal(parseEspnMinute("76'"), 76)
})

test('marks Abu Rumi as a 76th-minute substitute when FotMob left him unused', () => {
  const match: Match = {
    id: 'svn-isr-u21',
    competition: 'c',
    competitionHe: 'c',
    homeTeam: { code: 'SVN', nameHe: 'סלובניה עד 21', nameEn: 'Slovenia U21' },
    awayTeam: { code: 'ISR-U21', nameHe: 'ישראל עד 21', nameEn: 'Israel U21' },
    kickoff: '2026-09-29T14:00:00.000Z',
    status: 'finished',
    homeScore: 2,
    awayScore: 3,
    lastUpdated: '2026-09-29T14:00:00.000Z',
    players: [
      { playerId: 'niv-yehoshua', squadStatus: 'starter', started: true, played: true, minutes: 90, goals: 1 },
      { playerId: 'mohammed-abu-rumi', squadStatus: 'unused', started: false, played: false, minutes: 0 },
    ],
  }
  const merged = mergeEspnSummary(match, {
    keyEvents: [
      {
        type: { type: 'substitution', text: 'Substitution' },
        text: "Mohamad Abu Rumi (Israel U21) Substitution at 76'",
        clock: { displayValue: "76'" },
        participants: [{ athlete: { displayName: 'Mohamad Abu Rumi' } }, { athlete: { displayName: 'Iyad Khalaili' } }],
      },
      {
        type: { type: 'goal', text: 'Goal' },
        text: "Niv Yehoshua (Israel U21) Goal at 90'+1'",
        clock: { displayValue: "90'+1'" },
        participants: [{ athlete: { displayName: 'Niv Yehoshua' } }],
      },
    ],
    rosters: [
      {
        roster: [
          { starter: true, subbedIn: false, athlete: { displayName: 'Niv Yehoshua' } },
          { starter: false, subbedIn: true, athlete: { displayName: 'Mohamad Abu Rumi' } },
        ],
      },
    ],
  })
  const rumi = merged.players.find((item) => item.playerId === 'mohammed-abu-rumi')
  assert.equal(rumi?.squadStatus, 'subbed-in')
  assert.equal(rumi?.played, true)
  assert.equal(rumi?.subbedInMinute, 76)
  assert.equal(rumi?.minutes, 14)
  assert.equal(merged.players[0]?.goals, 1)
})
