import { test, expect } from '@playwright/test';

test.describe('Navigation and Auth E2E flows', () => {

  test('Homepage loads and displays main call to actions', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/InkHaven/);

    // Check if hero elements render
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // We should have a button indicating "Chat" or "Start"
    const chatBtn = page.locator('button:has-text("Chat"), a:has-text("Chat")').first();
    await expect(chatBtn).toBeVisible();
  });

  test('Legal pages structure load correctly', async ({ page }) => {
    await page.goto('/legal/privacy');
    await expect(page.locator('h1').first()).toBeVisible();

    await page.goto('/legal/terms');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Chat Interface loads the layout completely', async ({ page }) => {
    // Generate an isolated room session to avoid mock matching hanging
    const testRoom = `room_${Math.random().toString(36).substring(7)}`;
    await page.goto(`/chat/${testRoom}`);

    // WebRTC Mock mode should render "Connected" or the message input field
    const inputField = page.locator('input[type="text"], input[placeholder*="Type a message"], textarea');
    await expect(inputField.first()).toBeVisible({ timeout: 15000 });
  });

});