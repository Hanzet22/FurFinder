import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(
  new URL('../api/_lib/submission.ts', import.meta.url),
  'utf8',
)
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
}).outputText
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
const { validateListingSubmission, createPendingListing } = await import(moduleUrl)

const validSubmission = {
  name: '  Furry Convention  ',
  category: 'convention',
  summary: 'A community gathering with events and creator activities.',
  region: 'Asia-Pacific',
  country_code: 'id',
  website_url: 'https://example.org',
  source_url: 'https://example.org/about',
  turnstileToken: 'valid-turnstile-token',
}

test('normalizes text and country code for a valid submission', () => {
  const result = validateListingSubmission(validSubmission)
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.value.name, 'Furry Convention')
  assert.equal(result.value.country_code, 'ID')
})

test('rejects non-object payloads and arrays', () => {
  assert.equal(validateListingSubmission(null).ok, false)
  assert.equal(validateListingSubmission([]).ok, false)
  assert.equal(validateListingSubmission('submission').ok, false)
})

test('rejects unsupported category and region values', () => {
  assert.equal(validateListingSubmission({ ...validSubmission, category: 'unknown' }).ok, false)
  assert.equal(validateListingSubmission({ ...validSubmission, region: 'Unknown' }).ok, false)
})

test('rejects invalid country codes', () => {
  for (const country_code of ['I', 'IDN', '1D', 'id!', 12]) {
    assert.equal(validateListingSubmission({ ...validSubmission, country_code }).ok, false)
  }
})

test('requires HTTPS URLs without embedded credentials', () => {
  for (const website_url of [
    'http://example.org',
    'javascript:alert(1)',
    'https://user:pass@example.org',
    'https://',
  ]) {
    assert.equal(validateListingSubmission({ ...validSubmission, website_url }).ok, false)
  }
})

test('rejects URLs exceeding the maximum accepted length', () => {
  const longUrl = `https://example.org/${'a'.repeat(2048)}`
  assert.equal(validateListingSubmission({ ...validSubmission, website_url: longUrl }).ok, false)
})

test('rejects missing and out-of-range text and verification token', () => {
  assert.equal(validateListingSubmission({ ...validSubmission, name: 'x' }).ok, false)
  assert.equal(validateListingSubmission({ ...validSubmission, summary: 'too short' }).ok, false)
  assert.equal(validateListingSubmission({ ...validSubmission, turnstileToken: '' }).ok, false)
})

test('creates a pending listing with a unique slug suffix and no public verification', () => {
  const result = validateListingSubmission(validSubmission)
  assert.equal(result.ok, true)
  if (!result.ok) return
  const listing = createPendingListing(result.value, '12345678-1234-4234-8234-123456789abc')
  assert.equal(listing.slug, 'furry-convention-12345678')
  assert.equal(listing.status, 'pending')
  assert.equal(listing.is_featured, false)
  assert.equal(listing.verified_at, null)
})
