import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token missing' }, { status: 400 });
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      console.error('TURNSTILE_SECRET_KEY is missing');
      // Failsafe open if misconfigured
      return NextResponse.json({ success: true, bypass: true });
    }

    // --- LOCALHOST DEV BYPASS ---
    // If we're on localhost and the token is a dummy token, allow it.
    // Cloudflare provides '1x00000000000000000000AA' as a dummy success token for testing.
    // Or we can just bypass entirely in dev if we want, but letting the widget run is better.
    if (process.env.NODE_ENV === 'development' && token === 'dummy_dev_token') {
      const response = NextResponse.json({ success: true, bypass: true });
      response.cookies.set('inkhaven_verified', 'true', {
        httpOnly: true,
        secure: false, // localhost
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
      return response;
    }
    // ----------------------------

    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 403 });
    }

    // Success! Set a secure HTTP-only cookie indicating the user passed the global gate
    const response = NextResponse.json({ success: true });
    response.cookies.set('inkhaven_verified', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Global verify endpoint error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
