import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

import { getPaypalClient } from '../../../../../lib/paypal';

// Lifetime Premium Cost in USD
const PREMIUM_PRICE_USD = "9.99";

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

        const client = getPaypalClient();
        const response = await client.execute(request);

        return NextResponse.json({
            id: response.result.id,
        });
    } catch (error: any) {
        console.error('Error creating PayPal order:', error);
        return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }
}
