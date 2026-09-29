import assert from 'node:assert/strict'
import test from 'node:test'
import type { Match } from '../types'
import { deriveBucket, displayStatus, matchesFilter, splitMatchBoard } from './matchStatus.ts'

function match(partial: Partial<Match>): Match {
  return {
    id: 'm',
    competition: 'c',
    competitionHe: 'c',
    homeTeam: { code: 'ISR', nameHe: 'ישראל', nameEn: 'Israel' },
    awayTeam: { code: 'IRL', nameHe: 'אירלנד', nameEn: 'Ireland' },
    kickoff: '2026-09-18T18:00:00.000Z',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    lastUpdated: '2026-09-18T09:00:00.000Z',
    players: [],
    ...partial,
  }
}

test('does not invent LIVE from kickoff time', () => {
  const now = new Date('2026-09-18T18:10:00.000Z')
  const liveLooking = match({ kickoff: '2026-09-18T18:00:00.000Z', status: 'scheduled' })
  assert.equal(deriveBucket(liveLooking, now), 'today')
  assert.equal(displayStatus(liveLooking, now), 'today')
})

test('marks a match starting within an hour as soon', () => {
  const now = new Date('2026-09-18T17:30:00.000Z')
  const soon = match({ kickoff: '2026-09-18T18:00:00.000Z', status: 'scheduled' })
  assert.equal(displayStatus(soon, now), 'soon')
  assert.equal(deriveBucket(soon, now), 'today')
})

test('LIVE only when status is live or halftime', () => {
  const now = new Date('2026-09-18T18:10:00.000Z')
  assert.equal(deriveBucket(match({ status: 'live' }), now), 'live')
  assert.equal(deriveBucket(match({ status: 'halftime' }), now), 'live')
  assert.equal(matchesFilter(match({ status: 'scheduled' }), 'live', now), false)
})

test('splits finished matches out of the open board', () => {
  const now = new Date('2026-09-18T12:00:00.000Z')
  const { open, finished } = splitMatchBoard(
    [
      match({ id: 'done', status: 'finished', kickoff: '2026-09-16T18:00:00.000Z' }),
      match({ id: 'next', status: 'scheduled', kickoff: '2026-09-24T18:00:00.000Z' }),
      match({ id: 'live', status: 'live', kickoff: '2026-09-18T11:00:00.000Z' }),
    ],
    now,
  )
  assert.deepEqual(open.map((item) => item.id), ['next', 'live'])
  assert.deepEqual(finished.map((item) => item.id), ['done'])
})

test('today is the Jerusalem calendar day and overlaps with not-yet-started', () => {
  const now = new Date('2026-09-29T07:04:00.000Z')
  const todayLater = match({
    id: 'u21',
    status: 'scheduled',
    kickoff: '2026-09-29T14:00:00.000Z',
    homeTeam: { code: 'SVN', nameHe: 'סלובניה עד 21', nameEn: 'Slovenia U21' },
    awayTeam: { code: 'ISR-U21', nameHe: 'ישראל עד 21', nameEn: 'Israel U21' },
  })
  const overnightNextDay = match({
    id: 'peru',
    status: 'scheduled',
    kickoff: '2026-09-30T01:00:00.000Z',
    homeTeam: { code: 'MEX', nameHe: 'מקסיקו', nameEn: 'Mexico' },
    awayTeam: { code: 'PER', nameHe: 'פרו', nameEn: 'Peru' },
  })
  const finishedToday = match({
    id: 'jam',
    status: 'finished',
    kickoff: '2026-09-29T00:00:00.000Z',
    homeScore: 0,
    awayScore: 1,
  })

  assert.equal(matchesFilter(todayLater, 'today', now), true)
  assert.equal(matchesFilter(todayLater, 'upcoming', now), true)
  assert.equal(matchesFilter(finishedToday, 'today', now), true)
  assert.equal(matchesFilter(finishedToday, 'upcoming', now), false)
  assert.equal(matchesFilter(overnightNextDay, 'today', now), false)
  assert.equal(matchesFilter(overnightNextDay, 'upcoming', now), true)
})
