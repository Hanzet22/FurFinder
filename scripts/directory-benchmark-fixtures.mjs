const categories = ['community', 'convention', 'artist', 'organization', 'industry', 'resource']
const regions = ['North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East & Africa']
const EPOCH = Date.UTC(2025, 0, 1)

function createRandom(seed) {
  let state = seed >>> 0
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) / 0x1_0000_0000
  }
}

export function generateBenchmarkFixtures({ count = 1_000, seed = 20_261_031 } = {}) {
  if (!Number.isSafeInteger(count) || count < 1 || count > 100_000) {
    throw new RangeError('count must be an integer between 1 and 100000')
  }
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffff_ffff) {
    throw new RangeError('seed must be an unsigned 32-bit integer')
  }

  const random = createRandom(seed)
  return Array.from({ length: count }, (_, index) => {
    const sequence = index + 1
    const suffix = String(sequence).padStart(6, '0')
    const slug = `benchmark-listing-${suffix}`
    const createdAt = new Date(EPOCH + sequence * 60_000).toISOString()

    return {
      id: `benchmark-${suffix}`,
      name: `Synthetic directory listing ${suffix}`,
      slug,
      category: categories[Math.floor(random() * categories.length)],
      summary: `Synthetic public directory fixture ${suffix}; generated for local performance tests only.`,
      region: regions[Math.floor(random() * regions.length)],
      country_code: null,
      website_url: `https://example.org/benchmark/${slug}`,
      source_url: `https://example.org/benchmark/${slug}/source`,
      is_featured: false,
      verified_at: null,
      created_at: createdAt,
    }
  })
}

function readOption(name, fallback) {
  const index = process.argv.indexOf(name)
  if (index === -1) return fallback
  const value = Number(process.argv[index + 1])
  if (!Number.isSafeInteger(value)) throw new Error(`Expected an integer after ${name}`)
  return value
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const count = readOption('--count', 1_000)
  const seed = readOption('--seed', 20_261_031)
  process.stdout.write(`${JSON.stringify(generateBenchmarkFixtures({ count, seed }), null, 2)}\n`)
}
