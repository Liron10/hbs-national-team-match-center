import assert from 'node:assert/strict'
import test from 'node:test'
import { appearanceFromProvider, applyMatchDetailsOverlay, FIXED_STAT_LABELS, mergeMatchAppearances, shouldEnrichAppearances } from './providerAppearances.ts'

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
                  'Minutes played': { key: 'minutes_played', stat: { value: 90, type: 'integer' } },
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

test('reads a named goal event even when FotMob leaves the scorer id at zero', () => {
  const appearance = appearanceFromProvider(
    'niv-yehoshua',
    1605895,
    {
      content: {
        lineup: { awayTeam: { starters: [{ id: 1605895, name: 'Niv Yehoshua', firstName: 'Niv', lastName: 'Yehoshua' }] } },
        playerStats: null,
        matchFacts: {
          events: {
            events: [
              {
                type: 'Goal',
                time: 90,
                player: { id: 0, name: 'Niv Yehoshua' },
                playerId: 0,
                nameStr: 'Niv Yehoshua',
                fullName: 'Niv Yehoshua',
                firstName: 'Niv',
                lastName: 'Yehoshua',
              },
            ],
          },
        },
      },
    },
    'finished',
  )
  assert.equal(appearance.squadStatus, 'starter')
  assert.equal(appearance.played, true)
  assert.equal(appearance.minutes, 90)
  assert.equal(appearance.goals, 1)
})

test('gives a finished starter 90 minutes when they were not substituted', () => {
  const appearance = appearanceFromProvider(
    'niv-yehoshua',
    1605895,
    { content: { lineup: { awayTeam: { starters: [{ id: 1605895 }], subs: [{ id: 1497826 }] } } } },
    'finished',
  )
  assert.equal(appearance.squadStatus, 'starter')
  assert.equal(appearance.played, true)
  assert.equal(appearance.minutes, 90)
})

test('keeps a finished unused substitute off the pitch when there are no minutes', () => {
  const appearance = appearanceFromProvider(
    'mohammed-abu-rumi',
    1497826,
    { content: { lineup: { awayTeam: { starters: [{ id: 1605895 }], subs: [{ id: 1497826 }] } } } },
    'finished',
  )
  assert.equal(appearance.squadStatus, 'unused')
  assert.equal(appearance.played, false)
  assert.equal(appearance.minutes, 0)
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

test('matches FotMob lineup ids even when they arrive as strings', () => {
  const appearance = appearanceFromProvider(
    'niv-yehoshua',
    1605895,
    { content: { lineup: { awayTeam: { starters: [{ id: '1605895' }], subs: [] } } } },
    'live',
  )
  assert.equal(appearance.squadStatus, 'starter')
  assert.equal(appearance.played, true)
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

test('treats a bench player with minutes as a substitute even without a sub-in event', () => {
  const appearance = appearanceFromProvider(
    'javon-east',
    919525,
    {
      content: {
        lineup: {
          homeTeam: { starters: [], subs: [{ id: 919525, performance: { rating: 6.3 } }] },
        },
        playerStats: {
          '919525': {
            stats: [
              {
                key: 'top_stats',
                stats: {
                  'Minutes played': { key: 'minutes_played', stat: { value: 28, type: 'integer' } },
                },
              },
            ],
          },
        },
      },
    },
    'finished',
  )
  assert.equal(appearance.squadStatus, 'subbed-in')
  assert.equal(appearance.started, false)
  assert.equal(appearance.played, true)
  assert.equal(appearance.minutes, 28)
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
    shouldEnrichAppearances({ ...scheduled, status: 'finished' }, new Date('2026-09-26T12:00:00.000Z'), true),
    false,
  )
  assert.equal(
    shouldEnrichAppearances({ ...scheduled, status: 'live' }, new Date('2026-09-24T18:50:00.000Z'), true),
    true,
  )
  assert.equal(shouldEnrichAppearances(scheduled, new Date('2026-09-24T17:20:00.000Z'), true), true)
})

test('keeps a known live bench role when the lineup payload is empty', () => {
  const match = {
    id: 'bgr-lux',
    competition: 'c',
    competitionHe: 'c',
    homeTeam: { code: 'BGR' as const, nameHe: 'בולגריה', nameEn: 'Bulgaria' },
    awayTeam: { code: 'LUX' as const, nameHe: 'לוקסמבורג', nameEn: 'Luxembourg' },
    kickoff: '2026-09-26T16:00:00.000Z',
    status: 'live' as const,
    homeScore: 1,
    awayScore: 2,
    lastUpdated: '2026-09-26T17:46:53.854Z',
    players: [
      {
        playerId: 'yoan-stoyanov',
        squadStatus: 'bench' as const,
        started: false,
        played: false,
        minutes: 0,
      },
    ],
    providerMatchId: 5181949,
  }
  const merged = mergeMatchAppearances(match, { content: {} })
  assert.equal(merged.players[0]?.squadStatus, 'bench')
})

test('applies live score and starter roles from match details even when the file is still scheduled', () => {
  const match = {
    id: 'isr-irl-2026-09-27',
    competition: 'c',
    competitionHe: 'c',
    homeTeam: { code: 'ISR' as const, nameHe: 'ישראל', nameEn: 'Israel' },
    awayTeam: { code: 'IRL' as const, nameHe: 'אירלנד', nameEn: 'Ireland' },
    kickoff: '2026-09-27T18:45:00.000Z',
    status: 'scheduled' as const,
    homeScore: null,
    awayScore: null,
    lastUpdated: '2026-09-18T09:00:00.000Z',
    players: [{ playerId: 'eliel-peretz', squadStatus: 'unknown' as const }],
    providerMatchId: 5181815,
  }
  const overlay = applyMatchDetailsOverlay(match, {
    header: {
      teams: [{ score: 0 }, { score: 3 }],
      status: {
        started: true,
        finished: false,
        ongoing: true,
        liveTime: { short: '59\u200e’\u200e' },
      },
    },
    content: {
      lineup: {
        homeTeam: {
          starters: [{ id: 763312, performance: { rating: 6.3 } }],
          subs: [],
        },
      },
    },
  })
  assert.equal(overlay.status, 'live')
  assert.equal(overlay.homeScore, 0)
  assert.equal(overlay.awayScore, 3)
  assert.equal(overlay.clock, "59'")
  assert.equal(overlay.players[0]?.squadStatus, 'starter')
  assert.equal(overlay.players[0]?.played, true)
})
