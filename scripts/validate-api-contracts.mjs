import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const schema = JSON.parse(await readFile(new URL('contracts/schemas/listings-response.schema.json', root), 'utf8'))
const fixture = JSON.parse(await readFile(new URL('contracts/fixtures/listings-response.example.json', root), 'utf8'))
const errors = []
const fail = (path, message) => errors.push(`${path}: ${message}`)
const DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isDateTime = (value) => {
  if (typeof value !== 'string') return false
  const match = DATE_TIME.exec(value)
  if (!match || Number.isNaN(Date.parse(value))) return false
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3])
  const hour = Number(match[4]), minute = Number(match[5]), second = Number(match[6])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day && hour <= 23 && minute <= 59 && second <= 59
}
const isHttps = (value) => {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.length > 0 && !url.username && !url.password
  } catch { return false }
}
const categories = ['community', 'convention', 'artist', 'organization', 'industry', 'resource']
const regions = ['North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East & Africa']
const required = schema.$defs.listing.required
if (!fixture || fixture.ok !== true || fixture.version !== 'v1' || !Array.isArray(fixture.data)) fail('$', 'expected the v1 success envelope')
if (Object.keys(fixture ?? {}).some((key) => !['ok', 'version', 'data'].includes(key))) fail('$', 'unexpected envelope property')
if (fixture.data?.length > 60) fail('$.data', 'must contain at most 60 entries')
for (const [index, item] of (fixture.data ?? []).entries()) {
  const path = `$.data[${index}]`
  if (!item || typeof item !== 'object' || Array.isArray(item)) { fail(path, 'must be an object'); continue }
  for (const key of required) if (!(key in item)) fail(path, `missing required field ${key}`)
  for (const key of Object.keys(item)) if (!schema.$defs.listing.properties[key]) fail(path, `unexpected field ${key}`)
  if (typeof item.id !== 'string' || !UUID.test(item.id)) fail(path, 'id must be a UUID')
  if (typeof item.name !== 'string' || item.name.trim().length < 2 || item.name.length > 120) fail(path, 'name must contain 2–120 characters')
  if (typeof item.slug !== 'string' || item.slug.length > 120 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.slug)) fail(path, 'slug format or length is invalid')
  if (!categories.includes(item.category)) fail(path, 'category is not supported')
  if (typeof item.summary !== 'string' || item.summary.trim().length < 20 || item.summary.length > 500) fail(path, 'summary must contain 20–500 characters')
  if (!regions.includes(item.region)) fail(path, 'region is not supported')
  if (item.country_code !== null && (typeof item.country_code !== 'string' || !/^[A-Z]{2}$/.test(item.country_code))) fail(path, 'country_code must be null or ISO alpha-2')
  for (const key of ['website_url', 'source_url']) if (!isHttps(item[key])) fail(path, `${key} must be a credential-free HTTPS URL`)
  if (typeof item.is_featured !== 'boolean') fail(path, 'is_featured must be boolean')
  if (item.verified_at !== null && !isDateTime(item.verified_at)) fail(path, 'verified_at must be null or RFC 3339 date-time')
  if (!isDateTime(item.created_at)) fail(path, 'created_at must be an RFC 3339 date-time')
}
if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`API contract OK: v1 envelope and ${fixture.data.length} public listing fixture(s).`)
}
