import assert from 'node:assert/strict'
import test from 'node:test'
import { appearanceFromFotmob, FIXED_STAT_LABELS } from './fotmobAppearances.ts'

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
              Shotmap: { key: null, stat: { value: 0, type: 'boolean' } },
            },
          },
        ],
      },
    },
  },
}

test('maps a FotMob starter with minutes, cards and limited stats', () => {
  const appearance = appearanceFromFotmob('eliel-peretz', 763312, details, true)
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
  assert.equal(appearance.stats?.some((stat) => stat.label === 'דקות' && stat.value === '85'), true)
  assert.equal(appearance.stats?.some((stat) => stat.label === 'מסירות מדויקות' && stat.value === '36/40'), true)
  assert.equal(appearance.stats?.some((stat) => stat.label === 'חילוף' && stat.value === "הוחלף 84'"), true)
  assert.equal(appearance.stats?.some((stat) => stat.label === 'צהובים' && stat.value === '1'), true)
})

test('keeps the same 10 stats for a player who did not play', () => {
  const appearance = appearanceFromFotmob('eliel-peretz', 763312, { content: { lineup: { awayTeam: { starters: [], subs: [] } } } }, true)
  assert.equal(appearance.squadStatus, 'not-in-squad')
  assert.deepEqual(
    appearance.stats?.map((stat) => stat.label),
    [...FIXED_STAT_LABELS],
  )
  assert.equal(appearance.stats?.find((stat) => stat.label === 'חילוף')?.value, 'לא שותף')
})
