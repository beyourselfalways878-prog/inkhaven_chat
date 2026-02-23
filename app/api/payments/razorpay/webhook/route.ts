import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const payload = JSON.parse(body);

        // Only process successful payment captures
        if (payload.event === 'payment.captured') {
            const payment = payload.payload.payment.entity;

            // The user ID was passed in the order creation notes
            const userId = payment.notes?.userId;

            if (userId) {
                // Initialize Supabase Admin Client to bypass RLS
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
                const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must use service role for admin tasks

                const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                });

                // Grant Lifetime Premium (or 10 years as a simple placeholder for 'forever')
                const premiumUntil = new Date();
                premiumUntil.setFullYear(premiumUntil.getFullYear() + 100);

                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        is_premium: true,
                        subscription_provider: 'razorpay',
                        subscription_id: payment.order_id,
                        premium_until: premiumUntil.toISOString()
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('Failed to update user profile to premium:', error);
                    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
                }
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error: any) {
        console.error('Error handling Razorpay webhook:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
