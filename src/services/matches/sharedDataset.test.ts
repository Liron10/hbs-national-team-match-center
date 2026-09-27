import assert from 'node:assert/strict'
import test from 'node:test'
import { usesSharedMatchDataset } from './sharedDataset.ts'

test('does not treat Node refresh jobs as a shared browser dataset', () => {
  assert.equal(usesSharedMatchDataset(), false)
})
