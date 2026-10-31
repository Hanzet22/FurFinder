export const submissionCategories = [
  'community',
  'convention',
  'artist',
  'organization',
  'industry',
  'resource',
] as const

export const submissionRegions = [
  'North America',
  'Europe',
  'Asia-Pacific',
  'Latin America',
  'Middle East & Africa',
] as const

export type SubmissionCategory = (typeof submissionCategories)[number]
export type SubmissionRegion = (typeof submissionRegions)[number]

export type ListingSubmission = {
  name: string
  category: SubmissionCategory
  summary: string
  region: SubmissionRegion
  country_code: string | null
  website_url: string
  source_url: string
  turnstileToken: string
}

export type ValidationResult =
  | { ok: true; value: ListingSubmission }
  | { ok: false; message: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cleanText(value: unknown, minimum: number, maximum: number): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.normalize('NFC').trim()
  if (normalized.length < minimum || normalized.length > maximum) return null
  return normalized
}

function normalizeHttpsUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null

  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

export function validateListingSubmission(input: unknown): ValidationResult {
  if (!isRecord(input)) {
    return { ok: false, message: 'Submission payload must be a JSON object.' }
  }

  const name = cleanText(input.name, 2, 120)
  const summary = cleanText(input.summary, 20, 500)
  const turnstileToken = cleanText(input.turnstileToken, 1, 2048)
  if (
    input.country_code !== undefined &&
    input.country_code !== null &&
    typeof input.country_code !== 'string'
  ) {
    return { ok: false, message: 'Country code must use two letters.' }
  }

  const countryCode =
    typeof input.country_code === 'string' && input.country_code.trim()
      ? input.country_code.trim().toUpperCase()
      : null

  if (!name) return { ok: false, message: 'Name must contain 2–120 characters.' }
  if (!summary) return { ok: false, message: 'Summary must contain 20–500 characters.' }
  if (!submissionCategories.includes(input.category as SubmissionCategory)) {
    return { ok: false, message: 'Choose a supported category.' }
  }
  if (!submissionRegions.includes(input.region as SubmissionRegion)) {
    return { ok: false, message: 'Choose a supported region.' }
  }
  if (countryCode !== null && !/^[A-Z]{2}$/.test(countryCode)) {
    return { ok: false, message: 'Country code must use two letters.' }
  }
  const websiteUrl = normalizeHttpsUrl(input.website_url)
  if (!websiteUrl) {
    return { ok: false, message: 'Website must be a valid HTTPS URL.' }
  }
  const sourceUrl = normalizeHttpsUrl(input.source_url)
  if (!sourceUrl) {
    return { ok: false, message: 'Source must be a valid HTTPS URL.' }
  }
  if (!turnstileToken) {
    return { ok: false, message: 'Complete the verification before submitting.' }
  }

  return {
    ok: true,
    value: {
      name,
      category: input.category as SubmissionCategory,
      summary,
      region: input.region as SubmissionRegion,
      country_code: countryCode,
      website_url: websiteUrl,
      source_url: sourceUrl,
      turnstileToken,
    },
  }
}

export function createPendingListing(
  submission: ListingSubmission,
  uuid: string,
) {
  const baseSlug =
    submission.name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70) || 'listing'

  return {
    name: submission.name,
    slug: `${baseSlug}-${uuid.slice(0, 8)}`,
    category: submission.category,
    summary: submission.summary,
    region: submission.region,
    country_code: submission.country_code,
    website_url: submission.website_url,
    source_url: submission.source_url,
    status: 'pending',
    is_featured: false,
    verified_at: null,
  }
}
