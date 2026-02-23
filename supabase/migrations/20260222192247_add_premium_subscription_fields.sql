-- Add subscription fields to track premium ad-free status
ALTER TABLE public.profiles
ADD COLUMN is_premium BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN subscription_provider TEXT CHECK (subscription_provider IN ('razorpay', 'paypal', 'manual')),
ADD COLUMN subscription_id TEXT,
ADD COLUMN premium_until TIMESTAMPTZ;

-- Add comment to the table to explain the fields
COMMENT ON COLUMN public.profiles.is_premium IS 'Indicates if the user has an active ad-free premium subscription';
COMMENT ON COLUMN public.profiles.subscription_provider IS 'The gateway used to purchase the subscription';
COMMENT ON COLUMN public.profiles.subscription_id IS 'The recurring billing profile ID from the payment provider';
COMMENT ON COLUMN public.profiles.premium_until IS 'The expiration date of the premium status (null for lifetime)';
