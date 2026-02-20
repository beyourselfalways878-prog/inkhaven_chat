import { test, expect } from '@playwright/test';

test('WebRTC P2P chat flow: two users connect and exchange messages', async ({ browser }) => {
  // Create two isolated browser contexts to simulate Alice and Bob
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  page1.on('console', msg => console.log('PAGE 1:', msg.text()));
  page2.on('console', msg => console.log('PAGE 2:', msg.text()));

  // Setup Alice without a userId so she triggers Supabase Anonymous Auth
  await page1.addInitScript(() => {
    localStorage.setItem('inkhaven:session', JSON.stringify({ state: { session: { inkId: 'Alice', displayName: 'Alice E2E' } }, version: 0 }));
    localStorage.setItem('inkhaven:preferences', JSON.stringify({ state: { safetyFilter: false }, version: 0 }));
  });

  // Setup Bob without a userId so he triggers Supabase Anonymous Auth
  await page2.addInitScript(() => {
    localStorage.setItem('inkhaven:session', JSON.stringify({ state: { session: { inkId: 'Bob', displayName: 'Bob E2E' } }, version: 0 }));
    localStorage.setItem('inkhaven:preferences', JSON.stringify({ state: { safetyFilter: false }, version: 0 }));
  });

  const roomId = 'room_webrtc_e2e_test';

  // Navigate both users to the exact same room
  // This will trigger the Supabase broadcast signaling and WebRTC handshake
  await Promise.all([
    page1.goto(`/chat/${roomId}`),
    page2.goto(`/chat/${roomId}`)
  ]);

  // Wait for both UIs to indicate the P2P connection was successfully established
  await expect(page1.locator('text=Connected')).toBeVisible({ timeout: 15000 });
  await expect(page2.locator('text=Connected')).toBeVisible({ timeout: 15000 });

  // Alice sends a message via WebRTC
  const input1 = page1.locator('input[placeholder*="Type a message"]');
  await input1.fill('Hello Bob, this is Alice over WebRTC!');
  await page1.locator('button[type="submit"]').click();

  // Bob should receive Alice's message instantly over the data channel
  await expect(page2.locator('text=Hello Bob, this is Alice over WebRTC!')).toBeVisible({ timeout: 10000 });

  // Bob replies to Alice
  const input2 = page2.locator('input[placeholder*="Type a message"]');
  await input2.fill('Hi Alice, P2P data channels are working perfectly!');
  await page2.locator('button[type="submit"]').click();

  // Alice should receive Bob's message
  await expect(page1.locator('text=Hi Alice, P2P data channels are working perfectly!')).toBeVisible({ timeout: 10000 });

  // Close contexts
  await context1.close();
  await context2.close();
});