import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(
  new URL('../api/_lib/moderation.ts', import.meta.url),
  'utf8',
)
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
}).outputText
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
const { authenticateUser, authenticateModerator } = await import(moduleUrl)

const originalFetch = globalThis.fetch
const originalEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}

function configureAuth() {
  process.env.SUPABASE_URL = 'https://furfinder-test.supabase.co'
  process.env.VITE_SUPABASE_URL = ''
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key'
  process.env.SUPABASE_SECRET_KEY = 'test-secret-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = ''
}

function restoreEnvironment() {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  globalThis.fetch = originalFetch
}

test('rejects missing bearer credentials without contacting Supabase', async () => {
  configureAuth()
  let fetchCalled = false
  globalThis.fetch = async () => {
    fetchCalled = true
    return Response.json({})
  }
  try {
    const result = await authenticateUser(new Request('https://furfinder.test/api'))
    assert.equal(result.ok, false)
    if (!result.ok) assert.equal(result.response.status, 401)
    assert.equal(fetchCalled, false)
  } finally {
    restoreEnvironment()
  }
})

test('returns service unavailable when server auth configuration is missing', async () => {
  delete process.env.SUPABASE_URL
  delete process.env.VITE_SUPABASE_URL
  delete process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  delete process.env.SUPABASE_SECRET_KEY
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  try {
    const request = new Request('https://furfinder.test/api', {
      headers: { authorization: 'Bearer valid-looking-token' },
    })
    const result = await authenticateUser(request)
    assert.equal(result.ok, false)
    if (!result.ok) assert.equal(result.response.status, 503)
  } finally {
    restoreEnvironment()
  }
})

test('rejects an invalid Supabase access token', async () => {
  configureAuth()
  globalThis.fetch = async () => Response.json({ message: 'invalid token' }, { status: 401 })
  try {
    const request = new Request('https://furfinder.test/api', {
      headers: { authorization: 'Bearer invalid-access-token' },
    })
    const result = await authenticateUser(request)
    assert.equal(result.ok, false)
    if (!result.ok) assert.equal(result.response.status, 401)
  } finally {
    restoreEnvironment()
  }
})

test('accepts a verified Supabase user and returns server configuration', async () => {
  configureAuth()
  globalThis.fetch = async (input) => {
    assert.equal(new URL(String(input)).pathname, '/auth/v1/user')
    return Response.json({
      id: '12345678-1234-4234-8234-123456789abc',
      email: 'reviewer@example.test',
      email_confirmed_at: '2026-10-01T00:00:00Z',
    })
  }
  try {
    const request = new Request('https://furfinder.test/api', {
      headers: { authorization: 'Bearer valid-access-token' },
    })
    const result = await authenticateUser(request)
    assert.equal(result.ok, true)
    if (result.ok) {
      assert.equal(result.user.id, '12345678-1234-4234-8234-123456789abc')
      assert.equal(result.user.email, 'reviewer@example.test')
      assert.equal(result.config.url.origin, 'https://furfinder-test.supabase.co')
    }
  } finally {
    restoreEnvironment()
  }
})

test('requires an active moderator record after authenticating the user', async () => {
  configureAuth()
  let call = 0
  globalThis.fetch = async (input) => {
    call += 1
    const path = new URL(String(input)).pathname
    if (path === '/auth/v1/user') {
      return Response.json({ id: '12345678-1234-4234-8234-123456789abc' })
    }
    assert.equal(path, '/rest/v1/moderators')
    return Response.json([{ role: 'reviewer' }])
  }
  try {
    const request = new Request('https://furfinder.test/api', {
      headers: { authorization: 'Bearer valid-access-token' },
    })
    const result = await authenticateModerator(request)
    assert.equal(call, 2)
    assert.equal(result.ok, true)
    if (result.ok) assert.equal(result.moderator.role, 'reviewer')
  } finally {
    restoreEnvironment()
  }
})

test('denies a verified user with no active moderator record', async () => {
  configureAuth()
  globalThis.fetch = async (input) => {
    const path = new URL(String(input)).pathname
    return path === '/auth/v1/user'
      ? Response.json({ id: '12345678-1234-4234-8234-123456789abc' })
      : Response.json([])
  }
  try {
    const request = new Request('https://furfinder.test/api', {
      headers: { authorization: 'Bearer valid-access-token' },
    })
    const result = await authenticateModerator(request)
    assert.equal(result.ok, false)
    if (!result.ok) assert.equal(result.response.status, 403)
  } finally {
    restoreEnvironment()
  }
})
