import assert from 'node:assert/strict'
import test from 'node:test'
import type { Match } from '../types'
import { playerWindowProfile, windowBoardStats } from './playerWindow.ts'

function match(partial: Partial<Match> & Pick<Match, 'id' | 'kickoff' | 'status'>): Match {
  return {
    competition: 'c',
    competitionHe: 'c',
    homeTeam: { code: 'ISR', nameHe: 'ישראל', nameEn: 'Israel' },
    awayTeam: { code: 'IRL', nameHe: 'אירלנד', nameEn: 'Ireland' },
    homeScore: null,
    awayScore: null,
    lastUpdated: partial.kickoff,
    players: [],
    ...partial,
  }
}

test('builds window totals without empty zeros', () => {
  const matches = [
    match({
      id: 'done',
      kickoff: '2026-09-10T18:00:00.000Z',
      status: 'finished',
      homeScore: 2,
      awayScore: 1,
      players: [
        {
          playerId: 'eliel-peretz',
          squadStatus: 'subbed-out',
          started: true,
          played: true,
          minutes: 73,
          goals: 1,
          assists: 0,
        },
      ],
    }),
    match({
      id: 'next',
      kickoff: '2026-09-24T18:45:00.000Z',
      status: 'scheduled',
      players: [{ playerId: 'eliel-peretz', squadStatus: 'unknown' }],
    }),
  ]
  const profile = playerWindowProfile('eliel-peretz', matches, new Date('2026-09-18T12:00:00.000Z'))
  assert.equal(profile.minutes, 73)
  assert.equal(profile.goals, 1)
  assert.equal(profile.starts, 1)
  assert.deepEqual(
    profile.headlineStats.map((stat) => stat.label),
    ['הופעות', 'דקות', 'שערים'],
  )
  assert.equal(profile.lastMatch?.line, 'ישראל 2:1 אירלנד')
  assert.equal(profile.nextMatch?.matchId, 'next')
  assert.equal(profile.nextMatch?.detail, 'בסגל הנבחרת')
  assert.equal(profile.windowStats.some((stat) => stat.label === 'משחקים שפתח בהרכב'), true)
})

test('hides empty window numbers from the board strip', () => {
  const stats = windowBoardStats([
    match({
      id: 'empty',
      kickoff: '2026-09-24T18:00:00.000Z',
      status: 'scheduled',
      players: [{ playerId: 'eliel-peretz', squadStatus: 'unknown' }],
    }),
  ])
  assert.equal(stats[0]?.label, 'שחקנים')
  assert.equal(stats.some((stat) => stat.label === 'שערים'), false)
})

test('adds published lineup status to the next-match clip', () => {
  const profile = playerWindowProfile(
    'eliel-peretz',
    [
      match({
        id: 'next',
        kickoff: '2026-09-24T18:45:00.000Z',
        status: 'scheduled',
        players: [{ playerId: 'eliel-peretz', squadStatus: 'starter', started: true, played: false }],
      }),
    ],
    new Date('2026-09-24T17:20:00.000Z'),
  )
  assert.equal(profile.nextMatch?.detail, 'פותח בהרכב')
})
