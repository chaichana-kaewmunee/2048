import { expect, test } from '@playwright/test';

test('plays with the keyboard, undoes, and switches language', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.getByTestId('game-board')).toBeVisible();
  await expect(page.locator('#board-summary')).toContainText('Current board');
  await expect(page.locator('.score-card--score strong')).toHaveText('0');
  await page.screenshot({ path: 'artifacts/neon-fusion-desktop.png', fullPage: true });

  await page.getByTestId('game-board').click();
  for (const key of ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']) {
    await page.keyboard.press(key);
    if ((await page.locator('.move-count strong').textContent()) !== '0') {
      break;
    }
  }

  await expect(page.locator('.move-count strong')).not.toHaveText('0');
  await expect(page.getByRole('button', { name: 'Undo', exact: true }).first()).toBeEnabled();
  await page.getByRole('button', { name: 'Undo', exact: true }).first().click();
  await expect(page.locator('.move-count strong')).toHaveText('0');

  await page.getByRole('button', { name: 'Switch to Thai' }).click();
  await expect(page.getByRole('button', { name: 'เล่นเกม', exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'th');

  expect(errors).toEqual([]);
});

test('initializes SQLite WASM with kvvfs and exposes settings', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByText('SQLite storage is ready.')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('SQLite WASM · kvvfs')).toBeVisible();

  const kvvfsKeys = await page.evaluate(() =>
    Object.keys(localStorage).filter((key) => key.startsWith('kvvfs-')),
  );
  expect(kvvfsKeys.length).toBeGreaterThan(0);
});

test('keeps the board and controls usable on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByTestId('game-board')).toBeVisible();
  await expect(page.getByRole('button', { name: 'New game', exact: true }).last()).toBeVisible();

  const board = page.getByTestId('game-board');
  const box = await board.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.width).toBeLessThanOrEqual(390);
    expect(box.width).toBeGreaterThan(300);
  }

  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(bodyWidth).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'artifacts/neon-fusion-mobile.png', fullPage: true });
});

test('records a finished game in SQLite and shows it in statistics', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('game-board')).toBeVisible();

  const directions = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
  for (let batch = 0; batch < 80; batch += 1) {
    await page.evaluate((keys) => {
      keys.forEach((key) => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      });
    }, Array.from({ length: 25 }, (_, index) => directions[index % directions.length]!));
    await page.waitForTimeout(25);

    const winDialog = page.getByRole('dialog', { name: '2048 achieved' });
    if (await winDialog.isVisible()) {
      await page.getByRole('button', { name: 'Keep playing' }).click();
    }
    if (await page.getByRole('dialog', { name: 'Grid complete' }).isVisible()) {
      break;
    }
  }

  await expect(page.getByRole('dialog', { name: 'Grid complete' })).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('button', { name: 'Statistics' }).click();
  const playedCard = page.locator('.stat-card').filter({ hasText: 'Games played' });
  await expect(playedCard.locator('strong')).toHaveText('1');
});

test('serves the versioned health endpoint through the dev proxy', async ({ request }) => {
  const response = await request.get('/api/v1/health');
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({
    status: 'ok',
    service: 'neon-fusion-api',
    version: '1.0.0',
  });
});
