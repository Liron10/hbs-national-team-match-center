import assert from 'node:assert/strict'
import test from 'node:test'
import { formatCountdown, remainingMs, shouldShowCountdown } from './countdown.ts'

test('formats an exact remaining clock', () => {
  assert.equal(formatCountdown(((5 * 3600) + (12 * 60) + 8) * 1000), '05:12:08')
})

test('adds Hebrew day labels', () => {
  assert.equal(formatCountdown((1 * 86_400 + 2 * 3600) * 1000), 'יום אחד 02:00:00')
  assert.equal(formatCountdown((2 * 86_400 + 90) * 1000), 'יומיים 00:01:30')
  assert.equal(formatCountdown((6 * 86_400 + 14 * 3600 + 22 * 60 + 1) * 1000), '6 ימים 14:22:01')
})

test('computes remaining milliseconds from UTC kickoff', () => {
  const now = new Date('2026-09-18T10:00:00.000Z')
  assert.equal(remainingMs('2026-09-18T10:00:10.000Z', now), 10_000)
})

test('hides the timer after kickoff statuses', () => {
  assert.equal(shouldShowCountdown('scheduled'), true)
  assert.equal(shouldShowCountdown('live'), false)
  assert.equal(shouldShowCountdown('finished'), false)
})
