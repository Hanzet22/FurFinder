import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../src/lib/directory.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText
const { fetchListings } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const fixture = JSON.parse(await readFile(new URL('../contracts/fixtures/listings-response.example.json', import.meta.url), 'utf8'))

test('web directory client reads the public v1 envelope', async () => {
  const previousFetch = globalThis.fetch
  let requestedUrl = ''
  globalThis.fetch = async (input, init) => {
    requestedUrl = String(input)
    assert.equal(new Headers(init?.headers).get('Accept'), 'application/json')
    return Response.json(fixture)
  }
  try {
    const listings = await fetchListings()
    assert.equal(requestedUrl, '/api/v1/listings')
    assert.equal(listings.length, fixture.data.length)
    assert.equal(listings[0].name, fixture.data[0].name)
  } finally {
    globalThis.fetch = previousFetch
  }
})

test('web directory client rejects unexpected or private payload fields', async () => {
  const previousFetch = globalThis.fetch
  globalThis.fetch = async () => Response.json({
    ...fixture,
    data: [{ ...fixture.data[0], private_contact: 'not-public' }],
  })
  try {
    await assert.rejects(fetchListings(), /outside the public API contract/)
  } finally {
    globalThis.fetch = previousFetch
  }
})

test('web directory client rejects invalid dates and oversized results', async () => {
  const previousFetch = globalThis.fetch
  globalThis.fetch = async () => Response.json({
    ...fixture,
    data: [{ ...fixture.data[0], created_at: '2026-02-31T10:00:00Z' }],
  })
  try {
    await assert.rejects(fetchListings(), /outside the public API contract/)
    globalThis.fetch = async () => Response.json({
      ...fixture,
      data: Array.from({ length: 61 }, () => fixture.data[0]),
    })
    await assert.rejects(fetchListings(), /outside the public API contract/)
  } finally {
    globalThis.fetch = previousFetch
  }
})

test('web directory client reports upstream HTTP failures', async () => {
  const previousFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(null, { status: 503 })
  try {
    await assert.rejects(fetchListings(), /Directory request failed \(503\)/)
  } finally {
    globalThis.fetch = previousFetch
  }
})
