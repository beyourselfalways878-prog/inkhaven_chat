import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

// Lifetime Premium Cost in USD
const PREMIUM_PRICE_USD = "9.99";

const Environment = process.env.PAYPAL_ENVIRONMENT === 'production'
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

export const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
    )
);

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: PREMIUM_PRICE_USD,
                    },
                    description: 'InkHaven Lifetime Ad-Free Premium',
                    custom_id: userId, // Pass the user ID to the capture phase
                },
            ],
        });

        const response = await paypalClient.execute(request);

        return NextResponse.json({
            id: response.result.id,
        });
    } catch (error: any) {
        console.error('Error creating PayPal order:', error);
        return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }
}
