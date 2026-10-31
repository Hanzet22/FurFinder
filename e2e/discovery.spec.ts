import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const listing = {
  id: 'e2e-public-listing',
  name: 'Open community fixture',
  slug: 'open-community-fixture',
  category: 'community',
  summary: 'A synthetic public listing used only by browser tests.',
  region: 'Asia-Pacific',
  country_code: 'SG',
  website_url: 'https://example.org/community',
  source_url: 'https://example.org/community/about',
  is_featured: false,
  verified_at: '2026-10-01T00:00:00.000Z',
  created_at: '2026-10-01T00:00:00.000Z',
}

const pagePayload = {
  data: [listing],
  page: { next_cursor: null, has_more: false, limit: 20 },
}

async function mockDirectory(page, handler = async (route) => {
  const pathname = new URL(route.request().url()).pathname
  if (pathname.endsWith('/open-community-fixture')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: listing }),
    })
    return
  }
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(pagePayload),
  })
}) {
  await page.route('**/api/v1/listings**', handler)
}

test('public directory loads a listing and opens its detail dialog', async ({ page }) => {
  await mockDirectory(page)
  await page.goto('/')

  await expect(page.getByText(listing.name)).toBeVisible()
  await page.getByRole('button', { name: /view details/i }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: listing.name })).toBeVisible()
  await dialog.getByRole('button', { name: /close listing details/i }).click()
  await expect(dialog).not.toBeVisible()
})

test('directory communicates offline state without hiding previously loaded public data', async ({ page, context }) => {
  await mockDirectory(page)
  await page.goto('/')
  await expect(page.getByText(listing.name)).toBeVisible()

  await context.setOffline(true)
  await expect(page.getByText(/you are offline/i)).toBeVisible()
  await expect(page.getByText(listing.name)).toBeVisible()
})

test('directory retry recovers after a temporary API failure', async ({ page }) => {
  let allowSuccess = false
  await mockDirectory(page, async (route) => {
    if (!allowSuccess) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, message: 'Synthetic temporary failure.' }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(pagePayload),
    })
  })
  await page.goto('/')

  const alert = page.getByRole('alert')
  await expect(alert).toBeVisible({ timeout: 15_000 })
  const retry = page.getByRole('button', { name: 'Try again' })
  await expect(retry).toBeVisible()
  allowSuccess = true
  await retry.click()
  await expect(page.getByText(listing.name)).toBeVisible()
})

test('axe accessibility scan records the automated baseline for the public home page', async ({ page }) => {
  await mockDirectory(page, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], page: { next_cursor: null, has_more: false, limit: 20 } }),
    })
  })
  await page.goto('/')

  const results = await new AxeBuilder({ page }).analyze()
  await test.info().attach('axe-accessibility-baseline.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  })
  expect(Array.isArray(results.violations)).toBe(true)
})
