# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: favorites.spec.ts >> Favorites Functionality >> should navigate to favorites list
- Location: e2e\favorites.spec.ts:37:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('button[title*="favorite"]') to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "CSUBA" [ref=e6] [cursor=pointer]:
        - /url: /
      - navigation [ref=e7]:
        - link "Search" [ref=e8] [cursor=pointer]:
          - /url: /search
        - link "❤️ Favorites" [ref=e9] [cursor=pointer]:
          - /url: /watchlist
        - link "Sign In" [ref=e10] [cursor=pointer]:
          - /url: /login
        - link "Create Account" [ref=e11] [cursor=pointer]:
          - /url: /register
  - main [ref=e12]:
    - generic [ref=e13]:
      - heading "🔍 Buscar Subastas" [level=1] [ref=e14]
      - generic [ref=e15]:
        - generic [ref=e16]: "1"
        - generic [ref=e17]:
          - generic [ref=e18]:
            - generic [ref=e19]: Search
            - textbox "Search by location, address or description..." [ref=e20]
          - generic [ref=e21]:
            - generic [ref=e22]:
              - generic [ref=e23]:
                - generic [ref=e24]: Max Price (€)
                - spinbutton [ref=e25]
              - generic [ref=e26]:
                - generic [ref=e27]: Max Minimum Bid (€)
                - spinbutton [ref=e28]: "2000"
              - generic [ref=e29]:
                - generic [ref=e30]: Min Area (m2)
                - spinbutton [ref=e31]: "8"
              - generic [ref=e32]:
                - generic [ref=e33]: Province
                - combobox [ref=e34]:
                  - option "All Provinces"
                  - option "Madrid"
                  - option "Barcelona"
                  - option "Albacete"
                  - option "Alicante"
                  - option "Almería"
                  - option "Ávila"
                  - option "Badajoz"
                  - option "Baleares"
                  - option "Bilbao"
                  - option "Burgos"
                  - option "Cáceres"
                  - option "Cádiz"
                  - option "Cantabria"
                  - option "Castellón" [selected]
                  - option "Ceuta"
                  - option "Ciudad Real"
                  - option "Córdoba"
                  - option "A Coruña"
                  - option "Cuenca"
                  - option "Girona"
                  - option "Granada"
                  - option "Guadalajara"
                  - option "Guipúzcoa"
                  - option "Huelva"
                  - option "Huesca"
                  - option "Jaén"
                  - option "León"
                  - option "Lleida"
                  - option "Lugo"
                  - option "Málaga"
                  - option "Melilla"
                  - option "Murcia"
                  - option "Navarra"
                  - option "Ourense"
                  - option "Palencia"
                  - option "Palma"
                  - option "Pontevedra"
                  - option "La Rioja"
                  - option "Salamanca"
                  - option "Segovia"
                  - option "Sevilla"
                  - option "Soria"
                  - option "Tarragona"
                  - option "Teruel"
                  - option "Toledo"
                  - option "Valencia"
                  - option "Valladolid"
                  - option "Vizcaya"
                  - option "Zamora"
                  - option "Zaragoza"
              - generic [ref=e35]:
                - generic [ref=e36]: Property Type
                - combobox [ref=e37]:
                  - option "All Types" [selected]
                  - option "Vivienda"
                  - option "Local"
                  - option "Garaje"
                  - option "Terreno"
                  - option "Otro"
              - generic [ref=e38]:
                - generic [ref=e39]: Status
                - combobox [ref=e40]:
                  - option "All Status" [selected]
                  - option "Active"
                  - option "Completed"
                  - option "Deserted"
              - generic [ref=e41]:
                - generic [ref=e42]: Occupancy
                - combobox [ref=e43]:
                  - option "All" [selected]
                  - option "Empty"
                  - option "Occupied"
                  - option "Unknown"
              - generic [ref=e44]:
                - generic [ref=e45]: Investment Score
                - combobox [ref=e46]:
                  - option "All Scores"
                  - option "BAJO"
                  - option "MEDIO"
                  - option "ALTO"
                  - option "MUY_ALTO" [selected]
              - generic [ref=e47]:
                - generic [ref=e48]: Sort By
                - combobox [ref=e49]:
                  - option "Date" [selected]
                  - option "Price"
                  - option "Price per m2"
                  - option "Score"
            - generic [ref=e50]:
              - button "Apply Filters" [ref=e51] [cursor=pointer]
              - button "Reset" [ref=e52] [cursor=pointer]
      - paragraph [ref=e54]: 👀 No se encontraron subastas. Intenta ajustar tus filtros.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Favorites Functionality', () => {
  4  |   test('should save and unsave a favorite from search cards', async ({ page }) => {
  5  |     // Navigate to search
  6  |     await page.goto('/search');
  7  | 
  8  |     // Wait for cards to load
  9  |     await page.waitForSelector('text=View Details', { timeout: 10000 });
  10 | 
  11 |     // Get the first heart button
  12 |     const heartButtons = await page.locator('button[title*="favorite"]').all();
  13 |     expect(heartButtons.length).toBeGreaterThan(0);
  14 | 
  15 |     // Click the first heart to save
  16 |     await heartButtons[0].click();
  17 | 
  18 |     // Wait for the heart to turn red
  19 |     await page.waitForTimeout(1000);
  20 |     const heart = heartButtons[0];
  21 |     const text = await heart.textContent();
  22 |     expect(text).toContain('❤️');
  23 | 
  24 |     console.log('✅ Heart successfully turned red (saved)');
  25 | 
  26 |     // Click again to unsave
  27 |     await heart.click();
  28 | 
  29 |     // Wait for the heart to turn white
  30 |     await page.waitForTimeout(1000);
  31 |     const textAfter = await heart.textContent();
  32 |     expect(textAfter).toContain('🤍');
  33 | 
  34 |     console.log('✅ Heart successfully turned white (unsaved)');
  35 |   });
  36 | 
  37 |   test('should navigate to favorites list', async ({ page }) => {
  38 |     // Navigate to search and save an item
  39 |     await page.goto('/search');
> 40 |     await page.waitForSelector('button[title*="favorite"]', { timeout: 10000 });
     |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  41 | 
  42 |     const heartButtons = await page.locator('button[title*="favorite"]').all();
  43 |     await heartButtons[0].click();
  44 |     await page.waitForTimeout(500);
  45 | 
  46 |     // Click the Favorites button in header
  47 |     await page.click('a:has-text("❤️ Favorites")');
  48 | 
  49 |     // Should navigate to watchlist
  50 |     await expect(page).toHaveURL(/.*watchlist/);
  51 | 
  52 |     console.log('✅ Successfully navigated to Favorites page');
  53 |   });
  54 | 
  55 |   test('should show heart button in auction detail page', async ({ page }) => {
  56 |     // Navigate to search
  57 |     await page.goto('/search');
  58 |     await page.waitForSelector('a:has-text("View Details")', { timeout: 10000 });
  59 | 
  60 |     // Click on first View Details button
  61 |     const detailLinks = await page.locator('a:has-text("View Details")').all();
  62 |     await detailLinks[0].click();
  63 | 
  64 |     // Wait for detail page to load
  65 |     await page.waitForSelector('text=📍 Ubicación', { timeout: 10000 });
  66 | 
  67 |     // Should have a heart button in the detail page
  68 |     const heartInDetail = await page.locator('button[title*="favorite"]');
  69 |     expect(heartInDetail).toBeTruthy();
  70 | 
  71 |     console.log('✅ Heart button found in detail page');
  72 |   });
  73 | });
  74 | 
```