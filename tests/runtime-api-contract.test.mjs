import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../api/lib/validate-listings-response.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
const { isPublicListingsResponse } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const fixture = JSON.parse(await readFile(new URL('../contracts/fixtures/listings-response.example.json', import.meta.url), 'utf8'))

test('accepts the documented public v1 fixture', () => {
  assert.equal(isPublicListingsResponse(fixture), true)
})

test('rejects private or unknown fields at envelope and listing levels', () => {
  assert.equal(isPublicListingsResponse({ ...fixture, internal: true }), false)
  const [first, ...rest] = fixture.data
  assert.equal(isPublicListingsResponse({ ...fixture, data: [{ ...first, internal_notes: 'private' }, ...rest] }), false)
})

test('rejects non-HTTPS links and unsupported enum values', () => {
  const [first, ...rest] = fixture.data
  assert.equal(isPublicListingsResponse({ ...fixture, data: [{ ...first, website_url: 'http://example.org' }, ...rest] }), false)
  assert.equal(isPublicListingsResponse({ ...fixture, data: [{ ...first, category: 'unlisted' }, ...rest] }), false)
})

test('rejects malformed slugs, dates, and oversized collections', () => {
  const [first, ...rest] = fixture.data
  assert.equal(isPublicListingsResponse({ ...fixture, data: [{ ...first, slug: 'Not A Slug' }, ...rest] }), false)
  assert.equal(isPublicListingsResponse({ ...fixture, data: [{ ...first, created_at: 'not-a-date' }, ...rest] }), false)
  assert.equal(isPublicListingsResponse({ ...fixture, data: Array.from({ length: 61 }, () => first) }), false)
})

test('rejects values that violate database field constraints', () => {
  const [first, ...rest] = fixture.data
  assert.equal(isPublicListingsResponse({ ...fixture, data: [{ ...first, name: 'A' }, ...rest] }), false)
  assert.equal(isPublicListingsResponse({ ...fixture, data: [{ ...first, summary: 'Too short' }, ...rest] }), false)
  assert.equal(isPublicListingsResponse({ ...fixture, data: [{ ...first, created_at: '2026-02-31T10:00:00Z' }, ...rest] }), false)
})
