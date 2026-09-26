import assert from 'node:assert/strict'
import test from 'node:test'
import type { PlayerAppearance } from '../types'
import { appearanceStats, isOnThePitch, matchShowsPlayerStats, participationLine, playerTimeline } from './appearanceCopy.ts'

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
  assert.equal(participationLine(appearance({ squadStatus: 'unknown' }), 'scheduled'), 'בסגל הנבחרת')
  assert.equal(
    participationLine(appearance({ squadStatus: 'unused', played: false })),
    'לא שותף',
  )
  assert.equal(
    participationLine(appearance({ squadStatus: 'not-in-squad', played: false })),
    'מחוץ לסגל',
  )
  assert.equal(
    participationLine(appearance({ squadStatus: 'bench', played: false })),
    'על הספסל',
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
      'finished',
    ),
    'פתח בהרכב והוחלף בדקה 84',
  )
  assert.equal(
    participationLine(
      appearance({
        squadStatus: 'subbed-in',
        played: true,
        minutes: 26,
        subbedInMinute: 64,
      }),
      'finished',
    ),
    'עלה מהספסל ושיחק 26 דקות',
  )
  assert.equal(
    participationLine(
      appearance({
        squadStatus: 'starter',
        played: true,
        started: true,
        minutes: 90,
      }),
      'finished',
    ),
    'השלים 90 דקות',
  )
  assert.equal(
    participationLine(appearance({ squadStatus: 'starter', started: true, played: false }), 'scheduled'),
    'פותח בהרכב',
  )
  assert.equal(
    participationLine(appearance({ squadStatus: 'bench', played: false }), 'scheduled'),
    'על הספסל',
  )
})

test('states clearly when a player is not on the pitch during a live match', () => {
  assert.equal(
    participationLine(appearance({ squadStatus: 'bench', played: false }), 'live'),
    'לא פתח • על הספסל',
  )
  assert.equal(
    participationLine(appearance({ squadStatus: 'not-in-squad', played: false }), 'live'),
    'מחוץ לסגל',
  )
  assert.equal(
    participationLine(
      appearance({
        squadStatus: 'subbed-out',
        played: true,
        started: true,
        minutes: 64,
        subbedOutMinute: 64,
      }),
      'live',
    ),
    'פתח בהרכב • הוחלף בדקה 64 • לא על הדשא',
  )
  assert.equal(
    participationLine(
      appearance({
        squadStatus: 'starter',
        played: true,
        started: true,
        minutes: 38,
      }),
      'live',
    ),
    'פותח בהרכב • משחק עכשיו • 38 דקות',
  )
  assert.equal(
    participationLine(
      appearance({
        squadStatus: 'subbed-in',
        played: true,
        minutes: 2,
        subbedInMinute: 64,
      }),
      'live',
      "64'",
    ),
    'לא פתח • נכנס עכשיו • משחק עכשיו',
  )
  assert.equal(participationLine(appearance({ squadStatus: 'unknown' }), 'live'), 'בסגל הנבחרת')
  assert.equal(
    isOnThePitch(appearance({ squadStatus: 'starter', played: true, minutes: 38 }), 'live'),
    true,
  )
  assert.equal(isOnThePitch(appearance({ squadStatus: 'bench', played: false }), 'live'), false)
  assert.equal(
    isOnThePitch(
      appearance({ squadStatus: 'subbed-out', played: true, minutes: 64, subbedOutMinute: 64 }),
      'live',
    ),
    false,
  )
})

test('returns the stored 10-stat sheet after the match is underway', () => {
  const stats = [
    { label: 'דקות משחק', value: '85' },
    { label: 'שערים', value: '0' },
    { label: 'בישולים', value: '0' },
    { label: 'כרטיסים צהובים', value: '1' },
    { label: 'כרטיסים אדומים', value: '0' },
    { label: 'ציון', value: '6.41' },
    { label: 'מסירות מדויקות', value: '37/41' },
    { label: 'בעיטות', value: '1' },
    { label: 'בעיטות למסגרת', value: '0' },
    { label: 'תיקולים', value: '2' },
  ]
  assert.deepEqual(
    appearanceStats(
      appearance({
        squadStatus: 'subbed-out',
        played: true,
        minutes: 85,
        stats,
      }),
      'finished',
    ),
    stats,
  )
  assert.deepEqual(
    appearanceStats(
      appearance({
        squadStatus: 'starter',
        played: true,
        stats,
      }),
      'scheduled',
    ),
    [],
  )
})

test('builds a compact timeline only from timed events', () => {
  assert.deepEqual(
    playerTimeline(
      appearance({
        squadStatus: 'subbed-in',
        played: true,
        minutes: 20,
        subbedInMinute: 71,
        subbedOutMinute: 82,
        goals: 1,
      }),
    ),
    [
      { minute: 71, label: 'נכנס', kind: 'in' },
      { minute: 82, label: 'הוחלף', kind: 'out' },
    ],
  )
  assert.deepEqual(playerTimeline(appearance({ squadStatus: 'starter', played: true, minutes: 90 })), [])
})
