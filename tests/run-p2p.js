const { chromium } = require('playwright');

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const handleConsole = (browserName) => (msg) => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error' || type === 'warning' || text.includes('WebRTC') || text.includes('ICE') || text.includes('RTCPeerConnection')) {
            console.log(`[${browserName}] ${type.toUpperCase()}: ${text}`);
        }
    };

    page1.on('console', handleConsole('User 1'));
    page2.on('console', handleConsole('User 2'));

    try {
        await page1.goto('https://inkhaven.in', { waitUntil: 'domcontentloaded' });
        await page2.goto('https://inkhaven.in', { waitUntil: 'domcontentloaded' });
    } catch (err) {
        console.error('Failed to navigate or load page:', err);
        await browser.close();
        return;
    }

    console.log('Initiating Quick Match on both browsers simultaneously...');
    await Promise.all([
        page1.click('text=Quick Match').catch(() => page1.locator('button:has-text("Quick Match")').click()),
        page2.click('text=Quick Match').catch(() => page2.locator('button:has-text("Quick Match")').click())
    ]);

    console.log('Waiting 15 seconds to observe signaling and P2P connection errors...');
    await page1.waitForTimeout(15000);

    console.log('Closing browsers...');
    await browser.close();
    console.log('Cross-browser test complete.');
})();
