import { test, expect, chromium } from '@playwright/test';

test.describe('Quick Match Concurrent Connections', () => {
    // Use independent browser contexts for two users
    test('Two users joining quick match simultaneously should securely establish a P2P connection', async () => {
        test.setTimeout(60000); // 1 min timeout for ICE gathering and matching

        // Launch a browser (using default from playwright config, but we can explicitly launch)
        const browser = await chromium.launch();

        // Create two isolated incognito contexts
        const contextA = await browser.newContext();
        const contextB = await browser.newContext();

        const pageA = await contextA.newPage();
        const pageB = await contextB.newPage();

        const setupProfile = async (page: any, name: string) => {
            await page.goto('/onboarding');

            // Bypass Moderation Gate if it appears
            try {
                const safeModeBtn = page.locator('button:has-text("Safe Mode")');
                await safeModeBtn.click({ timeout: 5000 });
            } catch (e) {
                // If the modal doesn't appear for some reason, we can ignore this
            }

            await page.waitForTimeout(2000); // 2s to allow server compile 
            await page.screenshot({ path: `screenshot-onboarding-${name}.png` });

            const input = page.locator('input[placeholder*="calm alias"]');
            await expect(input).toBeVisible({ timeout: 10000 });
            await input.fill(name);

            // Select an interest
            await page.locator('input[type="checkbox"][value="Gaming"]').check({ force: true });

            // Submit
            const submitBtn = page.locator('button:has-text("Save profile")');
            await submitBtn.click();

            // Wait for it to redirect to the preferences page
            await page.waitForURL('**/onboarding/preferences', { timeout: 10000 }).catch(() => { });
        };

        console.log("Setting up Player A...");
        await setupProfile(pageA, 'Player A');

        console.log("Setting up Player B...");
        await setupProfile(pageB, 'Player B');

        console.log("Both players navigating to Quick Match concurrently...");
        await Promise.all([
            pageA.goto('/quick-match'),
            pageB.goto('/quick-match')
        ]);

        console.log("Waiting for Turnstile and clicking Initiate Vibe Check");
        const startMatch = async (page: any) => {
            const btn = page.locator('button:has-text("Initiate Vibe Check")');
            // Wait for Turnstile to enable the button
            await expect(btn).toBeEnabled({ timeout: 15000 });
            await btn.click();
        };

        await Promise.all([
            startMatch(pageA),
            startMatch(pageB)
        ]);

        // They should both see searching, and then eventually transition to /chat/[room]
        console.log("Waiting for matching redirect...");
        await Promise.all([
            pageA.waitForURL('**/chat/**', { timeout: 30000 }),
            pageB.waitForURL('**/chat/**', { timeout: 30000 })
        ]);

        console.log("Matched. Checking WebRTC P2P connection...");

        // They should now be in the room. Let's wait for the "Anonymous Partner" or "Connected Partner" header
        // Wait for the text indicating that connection is established. It changes from "NEGOTIATING..." to "SECURE P2P CHANNEL" or similar
        const connectedStatusA = pageA.locator('text="SECURE P2P CHANNEL"');
        const connectedStatusB = pageB.locator('text="SECURE P2P CHANNEL"');

        await expect(connectedStatusA).toBeVisible({ timeout: 15000 });
        await expect(connectedStatusB).toBeVisible({ timeout: 15000 });

        console.log("WebRTC Channel is SECURE. Sending test messages...");

        // Send message from A to B
        const inputA = pageA.locator('input[type="text"], textarea');
        await inputA.fill("Hello from A!");
        await inputA.press('Enter');

        // B should receive it
        const msgAtB = pageB.locator('text="Hello from A!"');
        await expect(msgAtB).toBeVisible({ timeout: 10000 });

        // Send message from B to A
        const inputB = pageB.locator('input[type="text"], textarea');
        await inputB.fill("Hello from B!");
        await inputB.press('Enter');

        // A should receive it
        const msgAtA = pageA.locator('text="Hello from B!"');
        await expect(msgAtA).toBeVisible({ timeout: 10000 });

        console.log("P2P messaging verified successfully!");

        await contextA.close();
        await contextB.close();
        await browser.close();
    });
});
