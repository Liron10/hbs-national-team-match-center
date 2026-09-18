import assert from 'node:assert/strict'
import test from 'node:test'
import { countdownUnits, remainingMs, shouldShowCountdown } from './countdown.ts'

test('shows four units when days remain', () => {
  const units = countdownUnits((6 * 86_400 + 14 * 3600 + 22 * 60 + 1) * 1000)
  assert.deepEqual(
    units.map((unit) => `${unit.value} ${unit.label}`),
    ['6 ימים', '14 שעות', '22 דקות', '01 שניות'],
  )
})

test('drops days when less than a day remains', () => {
  const units = countdownUnits((5 * 3600 + 12 * 60 + 8) * 1000)
  assert.deepEqual(
    units.map((unit) => unit.key),
    ['hours', 'minutes', 'seconds'],
  )
  assert.equal(units[0]?.value, '05')
})

test('drops hours when less than an hour remains', () => {
  const units = countdownUnits((12 * 60 + 8) * 1000)
  assert.deepEqual(
    units.map((unit) => unit.key),
    ['minutes', 'seconds'],
  )
})

test('computes remaining milliseconds from UTC kickoff', () => {
  const now = new Date('2026-09-18T10:00:00.000Z')
  assert.equal(remainingMs('2026-09-18T10:00:10.000Z', now), 10_000)
})

test('hides the timer after kickoff statuses', () => {
  assert.equal(shouldShowCountdown('scheduled'), true)
  assert.equal(shouldShowCountdown('live'), false)
})
