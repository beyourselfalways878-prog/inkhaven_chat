import { test, expect, chromium, firefox } from '@playwright/test';

test('Cross Browser WebRTC Connection (Chromium <-> Firefox)', async () => {
    // Launch two distinct browsers
    const chromeBrowser = await chromium.launch({ headless: false });
    const ffBrowser = await firefox.launch({ headless: false });

    // Create two distinct contexts to prevent state sharing
    const chromeContext = await chromeBrowser.newContext();
    const ffContext = await ffBrowser.newContext();

    const chromePage = await chromeContext.newPage();
    const ffPage = await ffContext.newPage();

    const handleConsole = (browserName: string) => (msg: any) => {
        const type = msg.type();
        const text = msg.text();
        // Only log warnings and errors to keep it clean, or specific WebRTC logs
        if (type === 'error' || type === 'warning' || text.includes('WebRTC') || text.includes('ICE') || text.includes('RTCPeerConnection')) {
            console.log(`[${browserName}] ${type.toUpperCase()}: ${text}`);
        }
    };

    chromePage.on('console', handleConsole('Chromium'));
    ffPage.on('console', handleConsole('Firefox'));

    console.log('Navigating to local server...');
    await chromePage.goto('http://localhost:3000');
    await ffPage.goto('http://localhost:3000');

    // Wait for the main page to load
    await chromePage.waitForLoadState('networkidle');
    await ffPage.waitForLoadState('networkidle');

    // Find and click the quick match button on both browsers
    console.log('Initiating Quick Match...');
    await Promise.all([
        chromePage.click('text=Quick Match').catch(() => chromePage.getByRole('button', { name: /Quick Match/i }).click()),
        ffPage.click('text=Quick Match').catch(() => ffPage.getByRole('button', { name: /Quick Match/i }).click())
    ]);

    // Wait 15 seconds to observe the WebRTC signaling console logs
    console.log('Waiting 15 seconds to observe signaling and P2P connection errors...');
    await chromePage.waitForTimeout(15000);

    // Close browsers
    await chromeBrowser.close();
    await ffBrowser.close();
});
