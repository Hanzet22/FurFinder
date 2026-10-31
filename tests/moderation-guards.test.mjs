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
const { sameOrigin, methodNotAllowed, json } = await import(moduleUrl)

test('accepts requests from the exact same origin', () => {
  const request = new Request('https://furfinder.example/api/v1/moderation/review', {
    method: 'POST',
    headers: { origin: 'https://furfinder.example' },
  })
  assert.equal(sameOrigin(request), true)
})

test('rejects cross-origin, missing, malformed, and lookalike origins', () => {
  const cases = [
    undefined,
    'https://attacker.example',
    'https://furfinder.example.attacker.example',
    'not a URL',
    'null',
  ]

  for (const origin of cases) {
    const headers = origin === undefined ? {} : { origin }
    const request = new Request('https://furfinder.example/api/action', {
      method: 'POST',
      headers,
    })
    assert.equal(sameOrigin(request), false, String(origin))
  }
})

test('compares origin ports exactly', () => {
  const request = new Request('https://furfinder.example:8443/api/action', {
    method: 'POST',
    headers: { origin: 'https://furfinder.example' },
  })
  assert.equal(sameOrigin(request), false)
})

test('methodNotAllowed returns a 405 response with an Allow header', async () => {
  const response = methodNotAllowed('GET, POST')
  assert.equal(response.status, 405)
  assert.equal(response.headers.get('allow'), 'GET, POST')
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.deepEqual(await response.json(), {
    ok: false,
    message: 'Method not allowed.',
  })
})

test('JSON responses disable caching and MIME sniffing', async () => {
  const response = json({ ok: true }, 202)
  assert.equal(response.status, 202)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.deepEqual(await response.json(), { ok: true })
})
