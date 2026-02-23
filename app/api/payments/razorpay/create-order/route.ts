import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// Lifetime Premium Cost in Indian Rupees (INR)
const PREMIUM_PRICE_INR = 499;

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        // Create a one-time payment order
        const options = {
            amount: PREMIUM_PRICE_INR * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${userId}_${Date.now()}`,
            notes: {
                userId: userId,
                purpose: 'InkHaven Lifetime Ad-Free Premium',
            },
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error: any) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }
}
