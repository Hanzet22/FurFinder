import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('PWA manifest declares a standalone public discovery app', async () => {
  const manifest = JSON.parse(await read('../public/manifest.webmanifest'))
  assert.equal(manifest.name, 'FurFinder — Global Discovery')
  assert.equal(manifest.start_url, '/')
  assert.equal(manifest.scope, '/')
  assert.equal(manifest.display, 'standalone')
  assert.ok(manifest.icons.some((icon) => icon.src === '/favicon.svg'))
})

test('service worker never intercepts API or moderator routes', async () => {
  const worker = await read('../public/sw.js')
  assert.match(worker, /url\.pathname\.startsWith\('\/api\/'\)/)
  assert.match(worker, /url\.pathname === '\/moderation'/)
  assert.match(worker, /url\.pathname\.startsWith\('\/moderation\/'\)/)
  assert.match(worker, /request\.method !== 'GET'/)
})

test('service worker caches only the public shell and build assets', async () => {
  const worker = await read('../public/sw.js')
  assert.match(worker, /const SHELL_URLS = \['\/', '\/index\.html', '\/manifest\.webmanifest', '\/favicon\.svg'\]/)
  assert.match(worker, /url\.pathname\.startsWith\('\/assets\/'\)/)
  assert.match(worker, /fetch\(request\)/)
})

test('service worker activates updates and removes only older FurFinder shell caches', async () => {
  const worker = await read('../public/sw.js')
  assert.match(worker, /const CACHE_PREFIX = 'furfinder-shell-'/)
  assert.match(worker, /const CACHE_NAME = `\$\{CACHE_PREFIX\}v1`/)
  assert.match(worker, /then\(\(\) => self\.skipWaiting\(\)\)/)
  assert.match(worker, /key\.startsWith\(CACHE_PREFIX\) && key !== CACHE_NAME/)
  assert.match(worker, /then\(\(\) => self\.clients\.claim\(\)\)/)
})

test('navigation uses network-first fallback while private API and moderator paths bypass caching', async () => {
  const worker = await read('../public/sw.js')
  assert.match(worker, /request\.mode === 'navigate'/)
  assert.match(worker, /catch\(async \(\) => \(await caches\.match\('\/'\)\) \|\| Response\.error\(\)/)
  assert.match(worker, /url\.pathname\.startsWith\('\/api\/'\)/)
  assert.match(worker, /url\.pathname === '\/moderation'/)
  assert.match(worker, /url\.pathname\.startsWith\('\/moderation\/'\)/)
})
