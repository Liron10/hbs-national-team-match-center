import assert from 'node:assert/strict'
import test from 'node:test'
import type { Match } from '../types'
import {
  applyLiveSnapshots,
  espnAbbreviation,
  espnLeagueForMatch,
  isInLiveWindow,
  mapApiFootballStatus,
  mapEspnStatus,
  mapFootballDataStatus,
  snapshotMatchesFixture,
} from './liveScores.ts'

test('maps API-Football and football-data.org statuses', () => {
  assert.equal(mapApiFootballStatus('1H', 24).status, 'live')
  assert.equal(mapApiFootballStatus('1H', 24).clock, "24'")
  assert.equal(mapApiFootballStatus('HT').status, 'halftime')
  assert.equal(mapApiFootballStatus('FT').status, 'finished')
  assert.equal(mapFootballDataStatus('IN_PLAY', 67).status, 'live')
  assert.equal(mapFootballDataStatus('PAUSED').status, 'halftime')
  assert.equal(mapFootballDataStatus('FINISHED').status, 'finished')
})

function match(partial: Partial<Match> = {}): Match {
  return {
    id: 'aut-isr',
    competition: 'UEFA Nations League',
    competitionHe: 'ליגת האומות של אופ״א',
    homeTeam: { code: 'AUT', nameHe: 'אוסטריה', nameEn: 'Austria' },
    awayTeam: { code: 'ISR', nameHe: 'ישראל', nameEn: 'Israel' },
    kickoff: '2026-09-24T18:45:00.000Z',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    lastUpdated: '2026-09-18T09:00:00.000Z',
    players: [],
    ...partial,
  }
}

test('maps Bulgaria and Kosovo to ESPN abbreviations', () => {
  assert.equal(espnAbbreviation.BGR, 'BUL')
  assert.equal(espnAbbreviation.XKX, 'KOS')
  assert.equal(espnAbbreviation.GTM, 'GUA')
})

test('picks the ESPN board from the competition', () => {
  assert.equal(espnLeagueForMatch(match()), 'uefa.nations')
  assert.equal(
    espnLeagueForMatch(match({ competitionHe: 'ליגת האומות של קונקקאף' })),
    'concacaf.nations.league',
  )
  assert.equal(espnLeagueForMatch(match({ competitionHe: 'משחק ידידות' })), 'fifa.friendly')
  assert.equal(
    espnLeagueForMatch(
      match({
        homeTeam: { code: 'SVN', nameHe: 'סלובניה עד 21', nameEn: 'Slovenia U21' },
        awayTeam: { code: 'ISR-U21', nameHe: 'ישראל עד 21', nameEn: 'Israel U21' },
        competitionHe: 'מוקדמות אליפות אירופה עד 21',
      }),
    ),
    'uefa.euro_u21_qual',
  )
})

test('does not treat a scheduled ESPN event as a live score', () => {
  const mapped = mapEspnStatus({ name: 'STATUS_SCHEDULED', state: 'pre', completed: false }, "0'")
  assert.equal(mapped.status, 'scheduled')
  assert.equal(mapped.scoresReady, false)
})

test('maps in-play and finished ESPN statuses', () => {
  assert.equal(mapEspnStatus({ name: 'STATUS_IN_PROGRESS', state: 'in' }, "41'").status, 'live')
  assert.equal(mapEspnStatus({ name: 'STATUS_HALFTIME', state: 'in' }, 'HT').status, 'halftime')
  assert.equal(mapEspnStatus({ name: 'STATUS_FINAL', state: 'post', completed: true }).status, 'finished')
})

test('applies a live snapshot without inventing unmatched scores', () => {
  const now = new Date('2026-09-24T19:10:00.000Z')
  const updated = applyLiveSnapshots(
    [match(), match({ id: 'other', awayTeam: { code: 'IRL', nameHe: 'אירלנד', nameEn: 'Ireland' } })],
    [
      {
        homeAbbr: 'AUT',
        awayAbbr: 'ISR',
        kickoff: '2026-09-24T18:45:00.000Z',
        status: 'live',
        homeScore: 0,
        awayScore: 1,
        clock: "24'",
      },
    ],
    now,
  )

  assert.equal(updated[0].status, 'live')
  assert.equal(updated[0].awayScore, 1)
  assert.equal(updated[0].clock, "24'")
  assert.equal(updated[1].status, 'scheduled')
  assert.equal(updated[1].homeScore, null)
})

test('matches fixtures by FotMob team IDs', () => {
  const bulgaria = match({
    homeTeam: { code: 'BGR', nameHe: 'בולגריה', nameEn: 'Bulgaria' },
    awayTeam: { code: 'LUX', nameHe: 'לוקסמבורג', nameEn: 'Luxembourg' },
    kickoff: '2026-09-26T15:00:00.000Z',
  })
  assert.equal(
    snapshotMatchesFixture(bulgaria, {
      homeAbbr: '',
      awayAbbr: '',
      homeTeamId: 10150,
      awayTeamId: 5792,
      kickoff: '2026-09-26T15:00:00.000Z',
      status: 'live',
      homeScore: 2,
      awayScore: 0,
    }),
    true,
  )
})

test('opens the live window around kickoff only', () => {
  const fixture = match()
  assert.equal(isInLiveWindow(fixture, new Date('2026-09-24T18:30:00.000Z')), true)
  assert.equal(isInLiveWindow(fixture, new Date('2026-09-24T17:20:00.000Z')), true)
  assert.equal(isInLiveWindow(fixture, new Date('2026-09-18T12:00:00.000Z')), false)
})
