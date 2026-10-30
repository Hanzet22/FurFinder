const CATEGORIES = new Set(['community', 'convention', 'artist', 'organization', 'industry', 'resource'])
const REGIONS = new Set(['North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East & Africa'])
const FIELDS = new Set(['id', 'name', 'slug', 'category', 'summary', 'region', 'country_code', 'website_url', 'source_url', 'is_featured', 'verified_at', 'created_at'])
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const COUNTRY = /^[A-Z]{2}$/
const DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/

function isDateTime(value: unknown, nullable = false): boolean {
  if (nullable && value === null) return true
  if (typeof value !== 'string') return false
  const match = DATE_TIME.exec(value)
  if (!match || Number.isNaN(Date.parse(value))) return false
  const [, year, month, day, hour, minute, second] = match.map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
    && hour <= 23 && minute <= 59 && second <= 59
}

function isHttpsUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.length > 0 && !url.username && !url.password
  } catch {
    return false
  }
}

function isListing(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const item = value as Record<string, unknown>
  if (Object.keys(item).some((key) => !FIELDS.has(key))) return false
  if ([...FIELDS].some((key) => !(key in item))) return false
  if (typeof item.id !== 'string' || !item.id.trim()) return false
  if (typeof item.name !== 'string' || item.name.trim().length < 2) return false
  if (typeof item.slug !== 'string' || item.slug.length > 120 || !SLUG.test(item.slug)) return false
  if (typeof item.category !== 'string' || !CATEGORIES.has(item.category)) return false
  if (typeof item.summary !== 'string' || item.summary.trim().length < 20 || item.summary.length > 500) return false
  if (typeof item.region !== 'string' || !REGIONS.has(item.region)) return false
  if (item.country_code !== null && (typeof item.country_code !== 'string' || !COUNTRY.test(item.country_code))) return false
  if (!isHttpsUrl(item.website_url) || !isHttpsUrl(item.source_url)) return false
  if (typeof item.is_featured !== 'boolean') return false
  if (!isDateTime(item.verified_at, true) || !isDateTime(item.created_at)) return false
  return true
}

export function isPublicListingsResponse(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const envelope = value as Record<string, unknown>
  if (Object.keys(envelope).some((key) => !['ok', 'version', 'data'].includes(key))) return false
  return envelope.ok === true
    && envelope.version === 'v1'
    && Array.isArray(envelope.data)
    && envelope.data.length <= 60
    && envelope.data.every(isListing)
}
