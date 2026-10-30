import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const schema = JSON.parse(await readFile(new URL('contracts/schemas/listings-response.schema.json', root), 'utf8'))
const fixture = JSON.parse(await readFile(new URL('contracts/fixtures/listings-response.example.json', root), 'utf8'))
const errors = []
const fail = (path, message) => errors.push(`${path}: ${message}`)
const isDateTime = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value)) && /T/.test(value)
const isHttps = (value) => {
  try { return new URL(value).protocol === 'https:' } catch { return false }
}
const categories = ['community', 'convention', 'artist', 'organization', 'industry', 'resource']
const regions = ['North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East & Africa']
const required = schema.$defs.listing.required
if (fixture.ok !== true || fixture.version !== 'v1' || !Array.isArray(fixture.data)) fail('$', 'expected the v1 success envelope')
if (fixture.data?.length > 60) fail('$.data', 'must contain at most 60 entries')
for (const [index, item] of (fixture.data ?? []).entries()) {
  const path = `$.data[${index}]`
  for (const key of required) if (!(key in item)) fail(path, `missing required field ${key}`)
  for (const key of Object.keys(item)) if (!schema.$defs.listing.properties[key]) fail(path, `unexpected field ${key}`)
  for (const key of ['id', 'name', 'slug', 'summary']) if (typeof item[key] !== 'string' || !item[key]) fail(path, `${key} must be a non-empty string`)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.slug ?? '')) fail(path, 'slug format is invalid')
  if (!categories.includes(item.category)) fail(path, 'category is not supported')
  if (!regions.includes(item.region)) fail(path, 'region is not supported')
  if (item.country_code !== null && !/^[A-Z]{2}$/.test(item.country_code ?? '')) fail(path, 'country_code must be null or ISO alpha-2')
  for (const key of ['website_url', 'source_url']) if (!isHttps(item[key])) fail(path, `${key} must be HTTPS`)
  if (typeof item.is_featured !== 'boolean') fail(path, 'is_featured must be boolean')
  if (item.verified_at !== null && !isDateTime(item.verified_at)) fail(path, 'verified_at must be null or an ISO date-time')
  if (!isDateTime(item.created_at)) fail(path, 'created_at must be an ISO date-time')
}
if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`API contract OK: v1 envelope and ${fixture.data.length} public listing fixture(s).`)
}
