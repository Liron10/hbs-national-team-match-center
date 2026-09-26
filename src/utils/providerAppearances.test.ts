import assert from 'node:assert/strict'
import test from 'node:test'
import { appearanceFromProvider, FIXED_STAT_LABELS, shouldEnrichAppearances } from './providerAppearances.ts'

const details = {
  content: {
    lineup: {
      awayTeam: {
        starters: [
          {
            id: 763312,
            performance: {
              events: [{ type: 'yellowCard' }],
              substitutionEvents: [{ time: 84, type: 'subOut' }],
            },
          },
        ],
        subs: [],
      },
    },
    playerStats: {
      '763312': {
        stats: [
          {
            key: 'top_stats',
            stats: {
              'Minutes played': { key: 'minutes_played', stat: { value: 85, type: 'integer' } },
              Goals: { key: 'goals', stat: { value: 0, type: 'integer' } },
              Assists: { key: 'assists', stat: { value: 0, type: 'integer' } },
              'Accurate passes': {
                key: 'accurate_passes',
                stat: { value: 36, total: 40, type: 'fractionWithPercentage' },
              },
              'Total shots': { key: 'total_shots', stat: { value: 1, type: 'integer' } },
              'Shots on target': { key: 'ShotsOnTarget', stat: { value: 0, type: 'integer' } },
              Tackles: { key: 'matchstats.headers.tackles', stat: { value: 2, type: 'integer' } },
              Shotmap: { key: null, stat: { value: 0, type: 'boolean' } },
            },
          },
        ],
      },
    },
  },
}

test('maps a FotMob starter with minutes, cards and a fixed stat sheet', () => {
  const appearance = appearanceFromProvider('eliel-peretz', 763312, details, 'finished')
  assert.equal(appearance.squadStatus, 'subbed-out')
  assert.equal(appearance.started, true)
  assert.equal(appearance.played, true)
  assert.equal(appearance.minutes, 85)
  assert.equal(appearance.yellowCards, 1)
  assert.equal(appearance.subbedOutMinute, 84)
  assert.deepEqual(
    appearance.stats?.map((stat) => stat.label),
    [...FIXED_STAT_LABELS],
  )
  assert.equal(appearance.stats?.length, 10)
  assert.equal(appearance.stats?.some((stat) => stat.label === 'דקות משחק' && stat.value === '85'), true)
  assert.equal(appearance.stats?.some((stat) => stat.label === 'מסירות מדויקות' && stat.value === '36/40'), true)
  assert.equal(appearance.stats?.some((stat) => stat.label === 'כרטיסים צהובים' && stat.value === '1'), true)
  assert.equal(appearance.stats?.some((stat) => stat.label === 'בעיטות למסגרת' && stat.value === '0'), true)
  assert.equal(appearance.stats?.some((stat) => stat.label === 'תיקולים' && stat.value === '2'), true)
})

test('reads FotMob tackles from the matchstats header key', () => {
  const appearance = appearanceFromProvider(
    'idan-nachmias',
    899188,
    {
      content: {
        lineup: { awayTeam: { starters: [{ id: 899188 }] } },
        playerStats: {
          '899188': {
            stats: [
              {
                key: 'defense',
                stats: {
                  Tackles: { key: 'matchstats.headers.tackles', stat: { value: 1, type: 'integer' } },
                },
              },
            ],
          },
        },
      },
    },
    'finished',
  )
  assert.equal(appearance.stats?.find((stat) => stat.label === 'תיקולים')?.value, '1')
})

test('does not invent a stat sheet for a player who did not play', () => {
  const appearance = appearanceFromProvider(
    'eliel-peretz',
    763312,
    { content: { lineup: { awayTeam: { starters: [], subs: [] } } } },
    'finished',
  )
  assert.equal(appearance.squadStatus, 'not-in-squad')
  assert.deepEqual(appearance.stats, [])
})

test('maps a published pre-match lineup without inventing minutes or ratings', () => {
  const starter = appearanceFromProvider(
    'eliel-peretz',
    763312,
    { content: { lineup: { awayTeam: { starters: [{ id: 763312 }], subs: [] } } } },
    'scheduled',
  )
  const bench = appearanceFromProvider(
    'eliel-peretz',
    763312,
    { content: { lineup: { awayTeam: { starters: [], subs: [{ id: 763312 }] } } } },
    'scheduled',
  )
  assert.equal(starter.squadStatus, 'starter')
  assert.equal(starter.started, true)
  assert.equal(starter.played, false)
  assert.deepEqual(starter.stats, [])
  assert.equal(bench.squadStatus, 'bench')
  assert.equal(bench.played, false)
})

test('keeps a live unused substitute on the bench until they come on', () => {
  const appearance = appearanceFromProvider(
    'eliel-peretz',
    763312,
    { content: { lineup: { awayTeam: { starters: [], subs: [{ id: 763312 }] } } } },
    'live',
  )
  assert.equal(appearance.squadStatus, 'bench')
  assert.equal(appearance.played, false)
})

test('enriches scheduled matches only inside the 90-minute live window', () => {
  const kickoff = '2026-09-24T18:45:00.000Z'
  const scheduled = {
    id: 'aut-isr',
    competition: 'c',
    competitionHe: 'c',
    homeTeam: { code: 'AUT' as const, nameHe: 'אוסטריה', nameEn: 'Austria' },
    awayTeam: { code: 'ISR' as const, nameHe: 'ישראל', nameEn: 'Israel' },
    kickoff,
    status: 'scheduled' as const,
    homeScore: null,
    awayScore: null,
    lastUpdated: kickoff,
    players: [],
    providerMatchId: 123,
  }
  assert.equal(shouldEnrichAppearances(scheduled, new Date('2026-09-24T17:20:00.000Z')), true)
  assert.equal(shouldEnrichAppearances(scheduled, new Date('2026-09-24T16:00:00.000Z')), false)
  assert.equal(shouldEnrichAppearances({ ...scheduled, providerMatchId: undefined }, new Date('2026-09-24T17:20:00.000Z')), false)
  assert.equal(
    shouldEnrichAppearances({ ...scheduled, status: 'finished' }, new Date('2026-09-26T12:00:00.000Z')),
    true,
  )
})
