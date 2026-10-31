import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(
  new URL('../api/_lib/request.ts', import.meta.url),
  'utf8',
)
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
}).outputText
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
const { readBoundedBody } = await import(moduleUrl)

test('accepts a body whose UTF-8 byte length equals the limit', async () => {
  const request = new Request('https://furfinder.test/api', {
    method: 'POST',
    body: 'hé',
  })

  const result = await readBoundedBody(request, 3)
  assert.deepEqual(result, { ok: true, text: 'hé' })
})

test('rejects an oversized streamed body without a content-length header', async () => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(8))
      controller.close()
    },
  })
  const request = new Request('https://furfinder.test/api', {
    method: 'POST',
    body: stream,
    duplex: 'half',
  })

  const result = await readBoundedBody(request, 4)
  assert.deepEqual(result, { ok: false, reason: 'too_large' })
})

test('rejects a declared body size above the limit before reading', async () => {
  const request = new Request('https://furfinder.test/api', {
    method: 'POST',
    headers: { 'content-length': '9' },
    body: '123456789',
  })

  const result = await readBoundedBody(request, 4)
  assert.deepEqual(result, { ok: false, reason: 'too_large' })
})

test('rejects invalid UTF-8 instead of silently replacing bytes', async () => {
  const request = new Request('https://furfinder.test/api', {
    method: 'POST',
    body: new Uint8Array([0xff, 0xfe]),
  })

  const result = await readBoundedBody(request, 4)
  assert.deepEqual(result, { ok: false, reason: 'unreadable' })
})

test('treats a missing body as an empty string', async () => {
  const request = new Request('https://furfinder.test/api', { method: 'POST' })

  const result = await readBoundedBody(request, 4)
  assert.deepEqual(result, { ok: true, text: '' })
})


test('accepts application/json with optional parameters', async () => {
  const { isJsonContentType } = await import(moduleUrl)
  assert.equal(isJsonContentType('application/json; charset=utf-8'), true)
})

test('matches the JSON media type exactly', async () => {
  const { isJsonContentType } = await import(moduleUrl)
  assert.equal(isJsonContentType('application/json'), true)
  assert.equal(isJsonContentType('application/jsonp'), false)
  assert.equal(isJsonContentType('text/json'), false)
  assert.equal(isJsonContentType(null), false)
})
