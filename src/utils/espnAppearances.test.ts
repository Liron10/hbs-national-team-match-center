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

test('does not add a second Yehoshua goal from duplicated ESPN commentary', () => {
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
    ],
  }
  const goal = {
    type: { type: 'goal', text: 'Goal' },
    text: "Niv Yehoshua (Israel U21) Goal at 90'+1'",
    clock: { displayValue: "90'+1'" },
    participants: [{ athlete: { displayName: 'Niv Yehoshua' } }],
  }
  const merged = mergeEspnSummary(match, {
    keyEvents: [goal],
    commentary: [{ text: goal.text, play: goal }],
  })
  assert.equal(merged.players[0]?.goals, 1)
})

test('keeps a FotMob sub-in that matches minutes instead of ESPN 45', () => {
  const match: Match = {
    id: 'bgr-est',
    competition: 'c',
    competitionHe: 'c',
    homeTeam: { code: 'BGR', nameHe: 'בולגריה', nameEn: 'Bulgaria' },
    awayTeam: { code: 'EST', nameHe: 'אסטוניה', nameEn: 'Estonia' },
    kickoff: '2026-09-29T18:45:00.000Z',
    status: 'finished',
    homeScore: 0,
    awayScore: 0,
    lastUpdated: '2026-09-29T21:00:00.000Z',
    players: [
      {
        playerId: 'yoan-stoyanov',
        squadStatus: 'subbed-in',
        started: false,
        played: true,
        minutes: 17,
        subbedInMinute: 73,
      },
    ],
  }
  const merged = mergeEspnSummary(match, {
    keyEvents: [
      {
        type: { type: 'substitution', text: 'Substitution' },
        text: "Yoan Stoyanov (Bulgaria) Substitution at 45'",
        clock: { displayValue: "45'" },
        participants: [{ athlete: { displayName: 'Yoan Stoyanov' } }],
      },
    ],
    rosters: [{ roster: [{ starter: false, subbedIn: true, athlete: { displayName: 'Yoan Stoyanov' } }] }],
  })
  assert.equal(merged.players[0]?.subbedInMinute, 73)
  assert.equal(merged.players[0]?.minutes, 17)
})

test('derives sub-in from minutes when ESPN 45 does not match 17 minutes played', () => {
  const match: Match = {
    id: 'bgr-est',
    competition: 'c',
    competitionHe: 'c',
    homeTeam: { code: 'BGR', nameHe: 'בולגריה', nameEn: 'Bulgaria' },
    awayTeam: { code: 'EST', nameHe: 'אסטוניה', nameEn: 'Estonia' },
    kickoff: '2026-09-29T18:45:00.000Z',
    status: 'finished',
    homeScore: 0,
    awayScore: 0,
    lastUpdated: '2026-09-29T21:00:00.000Z',
    players: [
      {
        playerId: 'yoan-stoyanov',
        squadStatus: 'subbed-in',
        started: false,
        played: true,
        minutes: 17,
        subbedInMinute: 45,
      },
    ],
  }
  const merged = mergeEspnSummary(match, {
    keyEvents: [
      {
        type: { type: 'substitution', text: 'Substitution' },
        text: "Yoan Stoyanov (Bulgaria) Substitution at 45'",
        clock: { displayValue: "45'" },
        participants: [{ athlete: { displayName: 'Yoan Stoyanov' } }],
      },
    ],
    rosters: [{ roster: [{ starter: false, subbedIn: true, athlete: { displayName: 'Yoan Stoyanov' } }] }],
  })
  assert.equal(merged.players[0]?.subbedInMinute, 73)
  assert.equal(merged.players[0]?.minutes, 17)
})

test('reads a published ESPN lineup before kickoff without inventing minutes', () => {
  const match: Match = {
    id: 'isr-xkx',
    competition: 'c',
    competitionHe: 'c',
    homeTeam: { code: 'ISR', nameHe: 'ישראל', nameEn: 'Israel' },
    awayTeam: { code: 'XKX', nameHe: 'קוסובו', nameEn: 'Kosovo' },
    kickoff: '2026-10-01T18:45:00.000Z',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    lastUpdated: '2026-09-18T09:00:00.000Z',
    players: [
      { playerId: 'eliel-peretz', squadStatus: 'unknown' },
      { playerId: 'idan-nachmias', squadStatus: 'unknown' },
      { playerId: 'guy-mizrahi', squadStatus: 'unknown' },
    ],
  }
  const merged = mergeEspnSummary(match, {
    rosters: [
      {
        roster: [
          { starter: true, subbedIn: false, athlete: { displayName: 'Eliel Peretz' } },
          { starter: true, subbedIn: false, athlete: { displayName: 'Idan Nachmias' } },
          { starter: false, subbedIn: false, athlete: { displayName: 'Guy Mizrahi' } },
        ],
      },
    ],
  })
  assert.equal(merged.players.find((item) => item.playerId === 'eliel-peretz')?.squadStatus, 'starter')
  assert.equal(merged.players.find((item) => item.playerId === 'idan-nachmias')?.squadStatus, 'starter')
  assert.equal(merged.players.find((item) => item.playerId === 'guy-mizrahi')?.squadStatus, 'bench')
  assert.equal(merged.players[0]?.played, false)
  assert.equal(merged.players[0]?.minutes, 0)
})
