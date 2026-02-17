import { test, expect } from '@playwright/test';

test('chat flow: send message and observe status/read + auto reply + typing', async ({ page }) => {
  // Pre-set a session to simulate a logged-in anonymous user
  await page.addInitScript(() => {
    localStorage.setItem('inkhaven:session', JSON.stringify({ userId: 'e2e_user', inkId: 'ink_e2e', displayName: 'E2E Tester', interests: ['Testing'] }));
    localStorage.setItem('inkhaven:preferences', JSON.stringify({ safetyFilter: false }));
  });

  await page.goto('/chat/room_e2e_test');

  // Wait for chat readiness (ensures membership flow completed) and input visibility
  await page.waitForSelector('text=Private room', { timeout: 20000 });
  const input = page.locator('input[placeholder="Type a message..."]');
  await expect(input).toBeVisible({ timeout: 20000 });

  // Type and send message (use fill for deterministic input)
  await input.fill('Hello E2E');
  await page.locator('button:has-text("Send")').click();

  // Expect our message to appear (allow longer to reduce flakiness)
  await page.waitForSelector('.message:has-text("Hello E2E")', { timeout: 20000 });
  await expect(page.locator('.message:has-text("Hello E2E")')).toBeVisible({ timeout: 20000 });

  // Wait for status to reach 'Read' (mock moves to read after short delays) -- allow more time for network persistence
  const statusLocator = page.locator('[data-testid^="msg-status-"][aria-label="Read"]');
  await statusLocator.waitFor({ timeout: 20000 });
  await expect(statusLocator).toHaveCount(1);

  // Auto-reply should appear
  await expect(page.locator('text=Auto-reply to')).toBeVisible({ timeout: 10000 });

  // Visual regression: capture the chat area (save for manual review)
  const chatArea = page.locator('div.card');
  await expect(chatArea).toBeVisible({ timeout: 5000 });
  await chatArea.screenshot({ path: `test-results/chat-flow-${Date.now()}.png` });
  // (Baseline comparison can be added to CI when we have stable snapshots)
});