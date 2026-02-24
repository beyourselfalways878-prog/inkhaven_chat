import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { createClient } from '@supabase/supabase-js';
import { getPaypalClient } from '../../../../../lib/paypal';

export async function POST(req: NextRequest) {
    try {
        const { orderID } = await req.json();

        if (!orderID) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        // Capture the payment
        const client = getPaypalClient();
        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({} as any);
        const captureResponse = await client.execute(request);

        // Verify it was successful
        if (captureResponse.result.status === 'COMPLETED') {
            // Extract the user ID we passed during order creation
            const userId = captureResponse.result.purchase_units[0].custom_id;

            if (userId) {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
                const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

                const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                });

                // Grant Lifetime Premium
                const premiumUntil = new Date();
                premiumUntil.setFullYear(premiumUntil.getFullYear() + 100);

                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        is_premium: true,
                        subscription_provider: 'paypal',
                        subscription_id: captureResponse.result.id,
                        premium_until: premiumUntil.toISOString()
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('Failed to update user profile to premium:', error);
                    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
                }
            }

            return NextResponse.json({ status: 'completed' });
        } else {
            return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Error capturing PayPal order:', error);
        return NextResponse.json({ error: 'Capture processing failed' }, { status: 500 });
    }
}
