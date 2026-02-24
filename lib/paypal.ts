import paypal from '@paypal/checkout-server-sdk';

const Environment = process.env.PAYPAL_ENVIRONMENT === 'production'
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

export const getPaypalClient = () => {
    return new paypal.core.PayPalHttpClient(
        new Environment(
            process.env.PAYPAL_CLIENT_ID || 'dummy',
            process.env.PAYPAL_CLIENT_SECRET || 'dummy'
        )
    );
};
