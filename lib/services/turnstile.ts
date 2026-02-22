export async function verifyTurnstileToken(token: string): Promise<boolean> {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        console.warn('TURNSTILE_SECRET_KEY is not set. Failing open for development.');
        return true;
    }

    try {
        const formData = new URLSearchParams();
        formData.append('secret', secret);
        formData.append('response', token);

        const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        return data.success;
    } catch (e) {
        console.error('Turnstile verification failed:', e);
        return false;
    }
}
