import test from 'node:test'
import assert from 'node:assert/strict'
import { createPendingListing, validateListingSubmission } from '../.test-dist/api/_lib/submission.js'

const valid = {
  name: 'Example Furry Community',
  category: 'community',
  summary: 'A public community directory entry with official information.',
  region: 'Asia-Pacific',
  country_code: 'JP',
  website_url: 'https://example.org',
  source_url: 'https://example.org/about',
  turnstileToken: 'valid-turnstile-token',
}

test('accepts a valid public listing submission', () => {
  const result = validateListingSubmission(valid)
  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.value.country_code, 'JP')
})

test('normalizes Unicode text and country code', () => {
  const result = validateListingSubmission({ ...valid, name: '  Café Fur  ', country_code: ' jp ' })
  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.value.name, 'Café Fur')
    assert.equal(result.value.country_code, 'JP')
  }
})

test('rejects insecure and credential-bearing URLs', () => {
  for (const website_url of ['http://example.org', 'javascript:alert(1)', 'https://user:password@example.org']) {
    assert.equal(validateListingSubmission({ ...valid, website_url }).ok, false)
  }
})

test('rejects unsupported categories, regions and country codes', () => {
  assert.equal(validateListingSubmission({ ...valid, category: 'private-chat' }).ok, false)
  assert.equal(validateListingSubmission({ ...valid, region: 'Unknown region' }).ok, false)
  assert.equal(validateListingSubmission({ ...valid, country_code: 'JPN' }).ok, false)
})

test('rejects missing verification and invalid descriptions', () => {
  assert.equal(validateListingSubmission({ ...valid, turnstileToken: '' }).ok, false)
  assert.equal(validateListingSubmission({ ...valid, summary: 'Too short' }).ok, false)
})

test('creates pending, unfeatured listings with a unique slug', () => {
  const result = validateListingSubmission(valid)
  assert.equal(result.ok, true)
  if (!result.ok) return
  const listing = createPendingListing(result.value, '12345678-1234-4234-8234-123456789abc')
  assert.equal(listing.status, 'pending')
  assert.equal(listing.is_featured, false)
  assert.equal(listing.verified_at, null)
  assert.match(listing.slug, /-12345678$/)
})
