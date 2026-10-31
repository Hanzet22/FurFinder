import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const compilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ES2022,
}
const toDataUrl = (source) => {
  const compiled = ts.transpileModule(source, { compilerOptions }).outputText
  return `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
}

const moderationSource = await readFile(
  new URL('../api/_lib/moderation.ts', import.meta.url),
  'utf8',
)
const requestSource = await readFile(
  new URL('../api/_lib/request.ts', import.meta.url),
  'utf8',
)
const routeSource = await readFile(
  new URL('../api/v1/moderation/moderators.ts', import.meta.url),
  'utf8',
)
const moderationUrl = toDataUrl(moderationSource)
const requestUrl = toDataUrl(requestSource)
const routedSource = routeSource
  .replaceAll("'../../_lib/moderation'", `'${moderationUrl}'`)
  .replaceAll("'../../_lib/request'", `'${requestUrl}'`)
const routeUrl = toDataUrl(routedSource)
const { default: moderatorsRoute } = await import(routeUrl)

const originalFetch = globalThis.fetch
const originalEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}
const adminId = '12345678-1234-4234-8234-123456789abc'
const reviewerId = '22345678-1234-4234-8234-123456789abc'

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

function request(method, body) {
  return new Request('https://furfinder.test/api/v1/moderation/moderators', {
    method,
    headers: {
      authorization: 'Bearer valid-access-token',
      origin: 'https://furfinder.test',
      'content-type': 'application/json',
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

function installFetch(role, calls, extraFetch) {
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input))
    calls.push({ url, init })
    if (url.pathname === '/auth/v1/user') {
      return Response.json({ id: adminId, email: 'admin@example.test' })
    }
    if (url.pathname === '/rest/v1/moderators' && url.searchParams.get('select') === 'role') {
      return Response.json([{ role }])
    }
    return extraFetch(url, init)
  }
}

test('reviewers cannot add or change moderator access', async () => {
  configureAuth()
  const calls = []
  installFetch('reviewer', calls, async () => {
    throw new Error('Unexpected privileged request')
  })
  try {
    const response = await moderatorsRoute.fetch(request('POST', { user_id: reviewerId }))
    assert.equal(response.status, 403)
    assert.equal(calls.length, 2)
  } finally {
    restoreEnvironment()
  }
})

test('admins can add reviewers but the API never creates another admin', async () => {
  configureAuth()
  const calls = []
  installFetch('admin', calls, async (url, init) => {
    if (url.pathname === '/rest/v1/moderators' && init.method === 'GET') {
      return Response.json([])
    }
    if (url.pathname === '/rest/v1/moderators' && init.method === 'POST') {
      return new Response(null, { status: 201 })
    }
    throw new Error(`Unexpected request: ${url.pathname} ${init.method}`)
  })
  try {
    const response = await moderatorsRoute.fetch(request('POST', { user_id: reviewerId }))
    assert.equal(response.status, 201)
    const createCall = calls.find((call) => call.init.method === 'POST')
    assert.ok(createCall)
    assert.deepEqual(JSON.parse(createCall.init.body), {
      user_id: reviewerId,
      role: 'reviewer',
      active: true,
    })
  } finally {
    restoreEnvironment()
  }
})

test('admin PATCH is scoped to reviewer rows and only changes active state', async () => {
  configureAuth()
  const calls = []
  installFetch('admin', calls, async (url, init) => {
    if (url.pathname === '/rest/v1/moderators' && init.method === 'PATCH') {
      return Response.json([{ user_id: reviewerId }])
    }
    throw new Error(`Unexpected request: ${url.pathname} ${init.method}`)
  })
  try {
    const response = await moderatorsRoute.fetch(request('PATCH', {
      user_id: reviewerId,
      active: false,
    }))
    assert.equal(response.status, 200)
    const patchCall = calls.find((call) => call.init.method === 'PATCH')
    assert.ok(patchCall)
    assert.equal(patchCall.url.searchParams.get('role'), 'eq.reviewer')
    assert.deepEqual(JSON.parse(patchCall.init.body), { active: false })
  } finally {
    restoreEnvironment()
  }
})
