import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const contract = JSON.parse(await readFile(new URL('../openapi/furfinder-public-v1.json', import.meta.url), 'utf8'))

test('publishes an OpenAPI 3.1 contract for the existing public read routes', () => {
  assert.equal(contract.openapi, '3.1.1')
  assert.ok(contract.paths['/api/v1/listings'].get)
  assert.ok(contract.paths['/api/v1/listings/{slug}'].get)
  assert.equal(contract.paths['/api/v1/listings'].get.operationId, 'listPublicListings')
  assert.equal(contract.paths['/api/v1/listings/{slug}'].get.operationId, 'getPublicListing')
})

test('documents bounded filters and cursor pagination', () => {
  const params = contract.paths['/api/v1/listings'].get.parameters
  const byName = Object.fromEntries(params.map((parameter) => [parameter.name, parameter]))
  assert.deepEqual(Object.keys(byName).sort(), ['category', 'country', 'cursor', 'limit', 'q', 'region'])
  assert.equal(byName.limit.schema.minimum, 1)
  assert.equal(byName.limit.schema.maximum, 50)
  assert.equal(byName.limit.schema.default, 20)
  assert.equal(byName.cursor.schema.maxLength, 512)
  assert.equal(byName.category.schema.enum.length, 6)
  assert.equal(byName.region.schema.enum.length, 5)
})

test('locks the public listing schema to an explicit allowlist', () => {
  const listing = contract.components.schemas.DirectoryListing
  assert.equal(listing.additionalProperties, false)
  assert.deepEqual(listing.required, [
    'id', 'name', 'slug', 'category', 'summary', 'region', 'country_code',
    'website_url', 'source_url', 'is_featured', 'verified_at', 'created_at',
  ])
  for (const forbidden of ['account_id', 'moderation_note', 'consent_evidence', 'attendee_list', 'precise_location']) {
    assert.equal(forbidden in listing.properties, false)
  }
})

test('does not expose moderator, report, roster or people-finder routes', () => {
  const paths = Object.keys(contract.paths)
  assert.deepEqual(paths.sort(), ['/api/v1/listings', '/api/v1/listings/{slug}'])
  assert.equal(paths.some((path) => /moderation|reports|attendees|members|profiles/i.test(path)), false)
})

test('documents consistent generic error envelopes for list and detail reads', () => {
  for (const path of Object.values(contract.paths)) {
    const responses = path.get.responses
    assert.ok(responses['400'])
    assert.ok(responses['502'])
    assert.ok(responses['503'])
    assert.equal(responses['400'].content['application/json'].schema.$ref, '#/components/schemas/ErrorResponse')
  }
})
