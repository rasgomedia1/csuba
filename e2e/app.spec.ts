import { test, expect, Page } from '@playwright/test';

// End-to-end flow against the local stack (frontend :5174 → backend :4006).
// Each run registers a throwaway user named e2e<timestamp>; clean them up with
//   DELETE FROM users WHERE username LIKE 'e2e%';

const stamp = Date.now();
const user = { username: `e2e${stamp}`, email: `e2e${stamp}@test.com`, password: 'e2e-pass-1234' };

async function register(page: Page) {
  await page.goto('/register');
  await page.getByPlaceholder('tu@email.com').fill(user.email);
  await page.getByPlaceholder('tu_usuario').fill(user.username);
  await page.locator('input[autocomplete="new-password"]').fill(user.password);
  await page.getByRole('button', { name: /Crear Cuenta/ }).click();
  await expect(page).toHaveURL(/\/search/);
}

test.describe.serial('CSUBA', () => {
  test('footer shows Rasgo Media signature and version', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toContainText(`© ${new Date().getFullYear()} Rasgo Media -`);
    await expect(footer.getByRole('link', { name: 'rasgomedia.es' })).toHaveAttribute('href', 'https://rasgomedia.es');
    await expect(footer).toContainText(/v\d+\.\d+\.\d+ \(\d+\)/);
  });

  test('protected routes redirect to login', async ({ page }) => {
    await page.goto('/watchlist');
    await expect(page).toHaveURL(/\/login\?next=%2Fwatchlist/);
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login\?next=%2Fprofile/);
  });

  test('register rejects a short password (client-side)', async ({ page }) => {
    await page.goto('/register');
    const pwd = page.locator('input[autocomplete="new-password"]');
    await pwd.fill('123');
    expect(await pwd.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
  });

  test('password toggle shows and hides the password', async ({ page }) => {
    await page.goto('/login');
    const pwd = page.locator('input[autocomplete="current-password"]');
    await expect(pwd).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Mostrar password' }).click();
    await expect(pwd).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Ocultar password' }).click();
    await expect(pwd).toHaveAttribute('type', 'password');
  });

  test('register, favorite from search, see it in watchlist and detail', async ({ page }) => {
    await register(page);

    const firstCard = page.locator('a:has-text("View Details")').first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });

    // Toggle favorite on the first card
    const heart = page.getByRole('button', { name: 'Add to favorites' }).first();
    await heart.click();
    await expect(page.getByRole('button', { name: 'Remove from favorites' }).first()).toBeVisible();

    // Watchlist shows exactly that one
    await page.getByRole('link', { name: /Favorites/ }).click();
    await expect(page).toHaveURL(/\/watchlist/);
    await expect(page.getByText('1 subasta guardada')).toBeVisible();

    // Detail page reflects favorite state via /auctions/:id/watchlist
    await page.locator('a:has-text("View Details")').first().click();
    await expect(page).toHaveURL(/\/auctions\//);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /Ver en BOE/ })).toBeVisible();

    // Remove from watchlist page
    await page.goto('/watchlist');
    await page.getByRole('button', { name: 'Remove from favorites' }).first().click();
    await expect(page.getByText(/No tienes subastas guardadas/)).toBeVisible();
  });

  test('login with username (Email or User) and logout', async ({ page }) => {
    await page.goto('/login?next=%2Fprofile');
    await page.locator('input[autocomplete="username"]').fill(user.username);
    await page.locator('input[autocomplete="current-password"]').fill(user.password);
    await page.getByRole('button', { name: /Iniciar Sesión/ }).click();
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByText(user.email)).toBeVisible();

    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });

  test('search cards label zero minimum bid and show the location map', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('a:has-text("View Details")').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/^0\s?€$/)).toHaveCount(0);

    // Location map is visible on cards with GPS, with a keyless Street View link
    const cardsWithMap = page.locator('iframe[src*="output=embed"]');
    if (await cardsWithMap.count()) {
      await expect(page.getByRole('link', { name: /Street View/ }).first()).toHaveAttribute('href', /map_action=pano/);
    }
  });

  test('detail shows a location image even when the Maps key is rejected', async ({ page }) => {
    await page.goto('/search');
    await page.locator('select').nth(1).selectOption('');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    const withGps = page.locator('div.bg-white:has(iframe) a:has-text("View Details")').first();
    await expect(withGps).toBeVisible({ timeout: 15000 });
    await withGps.click();
    await expect(page.getByRole('link', { name: /Street View/ })).toHaveAttribute('href', /map_action=pano/);
    // Either the Street View photo loaded, or the keyless satellite map replaced it
    await expect(page.locator('img[alt="Vista de la calle del inmueble"], iframe[title="Vista de la calle del inmueble"]').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1500);
    await expect(page.locator('iframe[title="Vista de la calle del inmueble"]')).toHaveCount(1);
  });

  test('mobile viewport: no horizontal overflow on search', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto('/search');
    await expect(page.locator('a:has-text("View Details")').first()).toBeVisible({ timeout: 15000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await page.screenshot({ path: 'test-results/mobile-search.png' });
    await ctx.close();
  });
});
