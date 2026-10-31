import assert from 'node:assert/strict'
import test from 'node:test'
import { generateBenchmarkFixtures } from '../scripts/directory-benchmark-fixtures.mjs'

test('benchmark fixture generation is deterministic for a fixed seed', () => {
  const first = generateBenchmarkFixtures({ count: 50, seed: 12345 })
  const second = generateBenchmarkFixtures({ count: 50, seed: 12345 })
  assert.deepEqual(first, second)
})

test('benchmark fixtures stay within public listing schema and reserved example URLs', () => {
  const rows = generateBenchmarkFixtures({ count: 100, seed: 20261031 })
  assert.equal(rows.length, 100)
  for (const row of rows) {
    assert.match(row.id, /^benchmark-\d{6}$/)
    assert.match(row.slug, /^benchmark-listing-\d{6}$/)
    assert.match(row.website_url, /^https:\/\/example\.org\//)
    assert.match(row.source_url, /^https:\/\/example\.org\//)
    assert.equal(row.country_code, null)
    assert.equal(row.verified_at, null)
    assert.equal('email' in row, false)
    assert.equal('precise_location' in row, false)
  }
})

test('benchmark fixture generator rejects unsafe or excessive sizes and invalid seeds', () => {
  assert.throws(() => generateBenchmarkFixtures({ count: 0 }), RangeError)
  assert.throws(() => generateBenchmarkFixtures({ count: 100001 }), RangeError)
  assert.throws(() => generateBenchmarkFixtures({ count: 1.5 }), RangeError)
  assert.throws(() => generateBenchmarkFixtures({ count: 1, seed: -1 }), RangeError)
})
