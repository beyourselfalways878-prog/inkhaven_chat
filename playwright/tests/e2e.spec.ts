import { test, expect } from '@playwright/test';

test('chat send and delivery/read lifecycle', async ({ page }) => {
  await page.goto('/');

  // Navigate to Quick Match directly (less brittle than header click)
  await page.goto('/quick-match');
  await page.waitForURL(/\/quick-match/, { timeout: 10000 });

  await page.waitForSelector('text=Start Match', { timeout: 10000 });
  await page.click('text=Start Match');

  // Wait for Chat page to render
  await page.waitForSelector('text=Private room', { timeout: 30000 });
  await page.waitForURL(/\/chat\//, { timeout: 30000 });

  // Send a message
  const msg = 'Hello from E2E at ' + new Date().toISOString();
  await page.fill('input[placeholder="Type a message..."]', msg);
  await page.click('text=Send');

  // Message content should appear
  await expect(page.locator(`text=${msg}`)).toBeVisible({ timeout: 10000 });

  // Date separator should appear after sending
  await expect(page.locator('text=Today')).toBeVisible({ timeout: 10000 });

  // Wait for status to become Read (mock timings are small)
  const statusLocator = page.locator('[data-testid^="msg-status-"][aria-label="Read"]');
  await statusLocator.waitFor({ timeout: 12000 });
  await expect(statusLocator).toHaveCount(1);

  // Visual regression: capture the chat area (save for manual review)
  const chatArea = page.locator('div.card');
  await expect(chatArea).toBeVisible({ timeout: 5000 });
  await chatArea.screenshot({ path: `test-results/chat-flow-${Date.now()}.png`, fullPage: false });
  // (Baseline comparison can be added to CI when we have stable snapshots)
});
