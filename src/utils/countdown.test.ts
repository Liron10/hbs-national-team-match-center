import assert from 'node:assert/strict'
import test from 'node:test'
import { countdownUnits, formatStartPhrase, remainingMs, shouldShowCountdown } from './countdown.ts'

test('always shows hours, minutes and seconds', () => {
  const long = countdownUnits((6 * 86_400 + 14 * 3600 + 22 * 60 + 1) * 1000)
  assert.deepEqual(
    long.map((unit) => `${unit.value} ${unit.label}`),
    ['158 שעות', '22 דקות', '01 שניות'],
  )
  const mid = countdownUnits((5 * 3600 + 12 * 60 + 8) * 1000)
  assert.deepEqual(
    mid.map((unit) => unit.key),
    ['hours', 'minutes', 'seconds'],
  )
  assert.equal(mid[0]?.value, '05')
  const short = countdownUnits((12 * 60 + 8) * 1000)
  assert.deepEqual(
    short.map((unit) => `${unit.value} ${unit.label}`),
    ['00 שעות', '12 דקות', '08 שניות'],
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

test('uses compact start phrases for fans', () => {
  const now = new Date('2026-09-18T18:00:00.000Z')
  assert.equal(formatStartPhrase('2026-09-18T18:10:00.000Z', now), 'מתחיל בעוד 10 דקות')
  assert.equal(formatStartPhrase('2026-09-18T18:45:00.000Z', now), 'מתחיל בקרוב')
  assert.equal(formatStartPhrase('2026-09-21T18:00:00.000Z', now), 'בעוד 3 ימים')
})
