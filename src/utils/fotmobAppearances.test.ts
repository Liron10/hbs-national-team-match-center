import assert from 'node:assert/strict'
import test from 'node:test'
import { appearanceFromFotmob } from './fotmobAppearances.ts'

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
  assert.ok((appearance.stats?.length ?? 0) <= 10)
  assert.equal(appearance.stats?.some((stat) => stat.label === 'דקות' && stat.value === '85'), true)
  assert.equal(appearance.stats?.some((stat) => stat.label === 'מסירות מדויקות' && stat.value === '36/40'), true)
})
