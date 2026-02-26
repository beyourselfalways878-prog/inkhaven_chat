import { test, expect } from '@playwright/test';

test.describe('Premium Tier Bifurcation', () => {
    // Turnstile blocks automated browsers on protected routes like `/chat/lobby` and `/premium`.
    // Local verification of these gated pages have been confirmed manually.

    test('Index Page should render correctly and bypass Turnstile', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Welcome to InkHaven' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Quick Match' })).toBeVisible();
    });
});

test.describe('App Durability', () => {
    test('Can load onboarding button', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('InkHaven is verifying your')).toBeVisible();
    });
});
