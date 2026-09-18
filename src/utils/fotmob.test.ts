import assert from 'node:assert/strict'
import test from 'node:test'
import { mapFotmobStatus, snapshotsFromFotmobMatches } from '../services/football/fotmob.ts'

test('maps FotMob live, halftime and full-time statuses', () => {
  assert.equal(
    mapFotmobStatus({ started: true, finished: false, liveTime: { short: "41'" } }).status,
    'live',
  )
  assert.equal(
    mapFotmobStatus({ started: true, finished: false, liveTime: { short: "41'" } }).clock,
    "41'",
  )
  assert.equal(mapFotmobStatus({ started: true, finished: false, reason: { short: 'HT' } }).status, 'halftime')
  assert.equal(mapFotmobStatus({ started: true, finished: true, reason: { short: 'FT' } }).status, 'finished')
  assert.equal(mapFotmobStatus({ started: false, finished: false }).status, 'scheduled')
})

test('keeps only FotMob matches that include team IDs', () => {
  const snapshots = snapshotsFromFotmobMatches({
    leagues: [
      {
        matches: [
          {
            home: { id: 8255, score: 1 },
            away: { id: 8567, score: 0 },
            status: { utcTime: '2026-09-24T18:45:00.000Z', started: true, finished: false, liveTime: { short: "12'" } },
          },
        ],
      },
    ],
  })
  assert.equal(snapshots.length, 1)
  assert.equal(snapshots[0].homeTeamId, 8255)
  assert.equal(snapshots[0].awayTeamId, 8567)
  assert.equal(snapshots[0].homeScore, 1)
  assert.equal(snapshots[0].status, 'live')
})
