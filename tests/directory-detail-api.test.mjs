import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

async function compileModule(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  }).outputText
  return `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
}

const directoryUrl = await compileModule('../api/_lib/directory.ts')
const moderationUrl = await compileModule('../api/_lib/moderation.ts')
const routeSource = await readFile(
  new URL('../api/v1/listings/[slug].ts', import.meta.url),
  'utf8',
)
const rewrittenRoute = routeSource
  .replace(
    /import \{[\s\S]*?\} from '\.\.\/\.\.\/_lib\/directory'\n/,
    `const { isPublicListingRecord, parseDirectorySlug, toPublicListing } = await import('${directoryUrl}')\n`,
  )
  .replace(
    /import \{ getSupabaseConfig, json, methodNotAllowed \} from '\.\.\/\.\.\/_lib\/moderation'\n/,
    `const { getSupabaseConfig, json, methodNotAllowed } = await import('${moderationUrl}')\n`,
  )
const routeCompiled = ts.transpileModule(rewrittenRoute, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
}).outputText
const routeUrl = `data:text/javascript;base64,${Buffer.from(routeCompiled).toString('base64')}`
const { default: route } = await import(routeUrl)

const validListing = {
  id: '123e4567-e89b-42d3-a456-426614174000',
  name: 'Anthrocon',
  slug: 'anthrocon-2027',
  category: 'convention',
  summary: 'A public convention listing with organizer source verification.',
  region: 'North America',
  country_code: 'US',
  website_url: 'https://example.org/',
  source_url: 'https://example.org/event',
  is_featured: false,
  verified_at: null,
  created_at: '2026-10-31T01:00:00.000Z',
}

const envKeys = ['SUPABASE_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY']
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]))
const originalFetch = globalThis.fetch

function configureEnvironment() {
  process.env.SUPABASE_URL = 'https://database.example'
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test'
  process.env.SUPABASE_SECRET_KEY = 'sb_secret_test'
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
}

function restoreEnvironment() {
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key]
    else process.env[key] = originalEnv[key]
  }
  globalThis.fetch = originalFetch
}

test('returns a public listing by canonical slug and uses the publishable key', async (t) => {
  configureEnvironment()
  t.after(restoreEnvironment)
  let requestedUrl
  let requestOptions
  globalThis.fetch = async (url, options) => {
    requestedUrl = new URL(url)
    requestOptions = options
    return new Response(JSON.stringify([validListing]), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  const response = await route.fetch(new Request('https://furfinder.example/api/v1/listings/anthrocon-2027'))
  const payload = await response.json()

  assert.equal(response.status, 200)
  assert.equal(payload.data.slug, 'anthrocon-2027')
  assert.equal(payload.data.name, 'Anthrocon')
  assert.equal(requestedUrl.searchParams.get('status'), 'eq.published')
  assert.equal(requestedUrl.searchParams.get('slug'), 'eq.anthrocon-2027')
  assert.equal(requestedUrl.searchParams.get('limit'), '1')
  assert.equal(requestOptions.headers.apikey, 'sb_publishable_test')
  assert.equal(requestOptions.headers.Authorization, 'Bearer sb_publishable_test')
  assert.equal('moderation_note' in payload.data, false)
})

test('returns the same 404 for missing and unpublished listing slugs', async (t) => {
  configureEnvironment()
  t.after(restoreEnvironment)
  globalThis.fetch = async () => new Response('[]', { status: 200 })

  const response = await route.fetch(new Request('https://furfinder.example/api/v1/listings/unpublished-entry'))
  const payload = await response.json()

  assert.equal(response.status, 404)
  assert.equal(payload.message, 'Listing not found.')
})

test('rejects malformed slugs before contacting Supabase', async (t) => {
  configureEnvironment()
  t.after(restoreEnvironment)
  let called = false
  globalThis.fetch = async () => {
    called = true
    return new Response('[]', { status: 200 })
  }

  const response = await route.fetch(new Request('https://furfinder.example/api/v1/listings/%2E%2E%2Fprivate'))

  assert.equal(response.status, 400)
  assert.equal(called, false)
})

test('returns 400 for malformed percent encoding', async (t) => {
  configureEnvironment()
  t.after(restoreEnvironment)
  globalThis.fetch = async () => {
    throw new Error('Fetch should not be called.')
  }

  const response = await route.fetch(new Request('https://furfinder.example/api/v1/listings/%E0%A4%A'))
  assert.equal(response.status, 400)
})

test('rejects non-GET methods with an Allow header', async (t) => {
  configureEnvironment()
  t.after(restoreEnvironment)

  const response = await route.fetch(new Request('https://furfinder.example/api/v1/listings/anthrocon-2027', {
    method: 'POST',
  }))

  assert.equal(response.status, 405)
  assert.equal(response.headers.get('Allow'), 'GET')
})

test('maps upstream failures to generic gateway errors', async (t) => {
  configureEnvironment()
  t.after(restoreEnvironment)
  globalThis.fetch = async () => new Response('internal database details', { status: 500 })

  const response = await route.fetch(new Request('https://furfinder.example/api/v1/listings/anthrocon-2027'))
  const payload = await response.json()

  assert.equal(response.status, 502)
  assert.equal(payload.message, 'Directory data is temporarily unavailable.')
  assert.equal(JSON.stringify(payload).includes('internal database details'), false)
})

test('maps network failures to a generic service-unavailable response', async (t) => {
  configureEnvironment()
  t.after(restoreEnvironment)
  globalThis.fetch = async () => {
    throw new Error('private upstream diagnostic')
  }

  const response = await route.fetch(new Request('https://furfinder.example/api/v1/listings/anthrocon-2027'))
  const payload = await response.json()

  assert.equal(response.status, 503)
  assert.equal(payload.message, 'Directory service is temporarily unavailable.')
  assert.equal(JSON.stringify(payload).includes('private upstream diagnostic'), false)
})
