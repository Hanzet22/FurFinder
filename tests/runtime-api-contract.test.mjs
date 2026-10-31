import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../lib/validate-listings-response.ts', import.meta.url), 'utf8')
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

const routeSource = await readFile(new URL('../api/v1/listings.ts', import.meta.url), 'utf8')
const validatorUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
const routeCompiled = ts.transpileModule(
  routeSource.replace("from '../../lib/validate-listings-response'", `from '${validatorUrl}'`),
  { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } },
).outputText
const { default: route } = await import(`data:text/javascript;base64,${Buffer.from(routeCompiled).toString('base64')}`)
const GET = route.fetch

test('Vercel route rejects unsupported methods and missing configuration', async () => {
  const methodResponse = await GET(new Request('https://example.test/api/v1/listings', { method: 'POST' }))
  assert.equal(methodResponse.status, 405)

  const previousUrl = process.env.SUPABASE_URL
  const previousViteUrl = process.env.VITE_SUPABASE_URL
  const previousKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  delete process.env.SUPABASE_URL
  delete process.env.VITE_SUPABASE_URL
  delete process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  try {
    const response = await GET(new Request('https://example.test/api/v1/listings'))
    assert.equal(response.status, 503)
  } finally {
    if (previousUrl === undefined) delete process.env.SUPABASE_URL
    else process.env.SUPABASE_URL = previousUrl
    if (previousViteUrl === undefined) delete process.env.VITE_SUPABASE_URL
    else process.env.VITE_SUPABASE_URL = previousViteUrl
    if (previousKey === undefined) delete process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    else process.env.VITE_SUPABASE_PUBLISHABLE_KEY = previousKey
  }
})

test('Vercel route queries published records only and validates upstream data', async () => {
  const previousUrl = process.env.SUPABASE_URL
  const previousViteUrl = process.env.VITE_SUPABASE_URL
  const previousKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  const previousFetch = globalThis.fetch
  process.env.SUPABASE_URL = 'https://project.example.supabase.co'
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test'
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input))
    assert.equal(url.pathname, '/rest/v1/listings')
    assert.equal(url.searchParams.get('status'), 'eq.published')
    assert.equal(url.searchParams.get('limit'), '60')
    assert.equal(url.searchParams.has('select'), true)
    assert.equal(new Headers(init?.headers).get('apikey'), 'sb_publishable_test')
    return Response.json(fixture.data)
  }
  try {
    const response = await GET(new Request('https://example.test/api/v1/listings'))
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('Cache-Control'), 'public, s-maxage=60, stale-while-revalidate=300')
    const body = await response.json()
    assert.equal(isPublicListingsResponse(body), true)
  } finally {
    globalThis.fetch = previousFetch
    if (previousUrl === undefined) delete process.env.SUPABASE_URL
    else process.env.SUPABASE_URL = previousUrl
    if (previousViteUrl === undefined) delete process.env.VITE_SUPABASE_URL
    else process.env.VITE_SUPABASE_URL = previousViteUrl
    if (previousKey === undefined) delete process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    else process.env.VITE_SUPABASE_PUBLISHABLE_KEY = previousKey
  }
})
