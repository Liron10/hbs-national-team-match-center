import assert from 'node:assert/strict'
import test from 'node:test'
import type { PlayerAppearance } from '../types'
import { matchShowsPlayerStats, participationLine } from './appearanceCopy.ts'

function appearance(partial: Partial<PlayerAppearance>): PlayerAppearance {
  return {
    playerId: 'eliel-peretz',
    squadStatus: 'unknown',
    ...partial,
  }
}

test('hides player stats before kickoff', () => {
  assert.equal(matchShowsPlayerStats('scheduled'), false)
  assert.equal(matchShowsPlayerStats('live'), true)
  assert.equal(matchShowsPlayerStats('halftime'), true)
  assert.equal(matchShowsPlayerStats('finished'), true)
})

test('uses natural Hebrew for participation', () => {
  assert.equal(
    participationLine(appearance({ squadStatus: 'unused', played: false })),
    'לא שותף',
  )
  assert.equal(
    participationLine(appearance({ squadStatus: 'not-in-squad', played: false })),
    'לא שיחק',
  )
  assert.equal(
    participationLine(
      appearance({
        squadStatus: 'subbed-out',
        played: true,
        started: true,
        minutes: 85,
        subbedOutMinute: 84,
      }),
    ),
    "הוחלף בדקה 84'",
  )
  assert.equal(
    participationLine(
      appearance({
        squadStatus: 'subbed-in',
        played: true,
        minutes: 26,
        subbedInMinute: 64,
      }),
    ),
    "נכנס בדקה 64'",
  )
  assert.equal(
    participationLine(
      appearance({
        squadStatus: 'starter',
        played: true,
        started: true,
        minutes: 90,
      }),
    ),
    'שותף משחק מלא 90 דקות',
  )
})
