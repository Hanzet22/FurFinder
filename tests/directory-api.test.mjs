import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(
  new URL('../api/_lib/directory.ts', import.meta.url),
  'utf8',
)
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
}).outputText
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
const {
  applyDirectoryFilters,
  decodeDirectoryCursor,
  encodeDirectoryCursor,
  isPublicListingRecord,
  parseDirectoryQuery,
  toPublicListing,
} = await import(moduleUrl)

const validId = '123e4567-e89b-42d3-a456-426614174000'
const validTimestamp = '2026-10-31T01:00:00.000Z'
const secret = 'test-only-cursor-signing-secret'

test('applies safe defaults and accepts bounded directory filters', () => {
  const result = parseDirectoryQuery(new URL('https://example.test/api/v1/listings?category=convention&region=Asia-Pacific&country=jp&limit=25&q=Furry%20Meet'))
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.deepEqual(result.value, {
    q: 'Furry Meet',
    category: 'convention',
    region: 'Asia-Pacific',
    country: 'JP',
    limit: 25,
    cursor: null,
  })
})

test('rejects unsupported filters, malformed country codes and unsafe search syntax', () => {
  const cases = [
    '?category=unknown',
    '?region=Everywhere',
    '?country=USA',
    '?limit=51',
    '?limit=0',
    '?q=%2A%2Cstatus.eq.pending',
    `?cursor=${'x'.repeat(513)}`,
  ]
  for (const query of cases) {
    assert.equal(parseDirectoryQuery(new URL(`https://example.test/api/v1/listings${query}`)).ok, false, query)
  }
})

test('combines search and keyset cursor filters without overwriting either', () => {
  const parsed = parseDirectoryQuery(new URL(
    'https://example.test/api/v1/listings?q=Furry%20Meet&category=convention&region=Asia-Pacific&country=JP',
  ))
  assert.equal(parsed.ok, true)
  if (!parsed.ok) return
  const endpoint = new URL('https://database.example/rest/v1/listings')
  applyDirectoryFilters(endpoint, parsed.value, {
    created_at: validTimestamp,
    id: validId,
  })
  assert.equal(endpoint.searchParams.get('category'), 'eq.convention')
  assert.equal(endpoint.searchParams.get('region'), 'eq.Asia-Pacific')
  assert.equal(endpoint.searchParams.get('country_code'), 'eq.JP')
  assert.equal(
    endpoint.searchParams.get('and'),
    `(or(name.ilike.*Furry Meet*,summary.ilike.*Furry Meet*),or(created_at.lt.${validTimestamp},and(created_at.eq.${validTimestamp},id.gt.${validId})))`,
  )
})

test('uses a signed opaque cursor and rejects tampering or another signing key', async () => {
  const cursor = { created_at: validTimestamp, id: validId }
  const token = await encodeDirectoryCursor(cursor, secret)
  assert.equal(typeof token, 'string')
  assert.deepEqual(await decodeDirectoryCursor(token, secret), cursor)
  assert.equal(await decodeDirectoryCursor(token, 'different-secret'), null)
  const [payloadPart, signaturePart] = token.split('.')
  const changedFirstByte = payloadPart[0] === 'A' ? 'B' : 'A'
  const tamperedPayload = `${changedFirstByte}${payloadPart.slice(1)}`
  assert.equal(await decodeDirectoryCursor(`${tamperedPayload}.${signaturePart}`, secret), null)
})

test('rejects malformed cursor payloads even when the signature is valid', async () => {
  const payload = new TextEncoder().encode(JSON.stringify({
    v: 1,
    created_at: 'not-a-date',
    id: 'not-a-uuid',
  }))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, payload))
  const encode = (bytes) => {
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  }
  assert.equal(await decodeDirectoryCursor(`${encode(payload)}.${encode(signature)}`, secret), null)
})

test('rejects a correctly signed cursor after its 24-hour lifetime', async () => {
  const payload = new TextEncoder().encode(JSON.stringify({
    v: 1,
    iat: Date.now() - 25 * 60 * 60 * 1000,
    created_at: validTimestamp,
    id: validId,
  }))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, payload))
  const encode = (bytes) => {
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  }
  assert.equal(await decodeDirectoryCursor(`${encode(payload)}.${encode(signature)}`, secret), null)
})

test('public listing validation rejects malformed records and the projection omits internal fields', () => {
  const record = {
    id: validId,
    name: 'Public convention',
    slug: 'public-convention',
    category: 'convention',
    summary: 'A public event listing with verified source information.',
    region: 'Asia-Pacific',
    country_code: 'JP',
    website_url: 'https://example.org',
    source_url: 'https://example.org/about',
    is_featured: false,
    verified_at: null,
    created_at: validTimestamp,
    internal_moderation_note: 'must never be returned',
    account_id: 'private-account-id',
  }
  assert.equal(isPublicListingRecord(record), true)
  assert.equal(isPublicListingRecord({ ...record, category: 'private-person' }), false)
  const projected = toPublicListing(record)
  assert.equal('internal_moderation_note' in projected, false)
  assert.equal('account_id' in projected, false)
  assert.deepEqual(Object.keys(projected), [
    'id', 'name', 'slug', 'category', 'summary', 'region', 'country_code',
    'website_url', 'source_url', 'is_featured', 'verified_at', 'created_at',
  ])
})
