import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
const detail = await readFile(new URL('../src/components/ListingDetailDialog.tsx', import.meta.url), 'utf8')
const directory = await readFile(new URL('../src/lib/directory.ts', import.meta.url), 'utf8')

test('discovery client keeps filter-aware cursor pagination and abort support', () => {
  assert.match(app, /queryKey:\s*\['directory',\s*'published',\s*query,\s*category,\s*region\]/)
  assert.match(app, /getNextPageParam:\s*\(lastPage\)\s*=>\s*lastPage\.page\.next_cursor/)
  assert.match(directory, /fetchListings\([\s\S]*?signal\?: AbortSignal/)
  assert.match(directory, /fetch\(endpoint,\s*\{[\s\S]*?signal,/)
})

test('discovery exposes offline state and an actionable retry control', () => {
  assert.match(app, /addEventListener\('online'/)
  assert.match(app, /addEventListener\('offline'/)
  assert.match(app, /You are offline\./)
  assert.match(app, /onClick=\{\(\)\s*=>\s*void refetch\(\)\}/)
  assert.match(app, /disabled=\{!isOnline \|\| isRefetching\}/)
})

test('listing detail dialog exposes accessible loading, error and retry states', () => {
  assert.match(detail, /aria-labelledby="listing-detail-title"/)
  assert.match(detail, /onCancel=\{onClose\}/)
  assert.match(detail, /role="status"/)
  assert.match(detail, /role="alert"/)
  assert.match(detail, /onClick=\{\(\)\s*=>\s*void refetch\(\)\}/)
  assert.match(detail, /disabled=\{isFetching\}/)
})
