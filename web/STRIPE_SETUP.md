# Stripe Configuration Guide

To enable Stripe payments in the Matcher app, you need to configure the following environment variables:

## Required Environment Variables

Add these to your `.env` file in the `web` directory:

```env
# Stripe Secret Key (from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_...  # For testing, or sk_live_... for production

# Stripe Publishable Key (from Stripe Dashboard)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # For testing, or pk_live_... for production

# Stripe Webhook Secret (for handling subscription events)
STRIPE_WEBHOOK_SECRET=whsec_...
```

## How to Get Your Stripe Keys

1. **Sign up for Stripe**: Go to https://stripe.com and create an account

2. **Get Test Keys** (for development):
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)

3. **Get Webhook Secret** (for handling subscription events):
   - Go to https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - Set the endpoint URL to: `https://your-domain.com/api/subscribe/webhook`
   - Select events: `checkout.session.completed` and `customer.subscription.deleted`
   - Copy the **Signing secret** (starts with `whsec_`)

4. **For Production**:
   - Switch to "Live mode" in Stripe Dashboard
   - Repeat steps 2-3 with live keys
   - Update your `.env` file with live keys

## Testing

After setting up the environment variables:

1. Restart your development server
2. Go to Settings page
3. Click "Subscribe" button
4. You should be redirected to Stripe Checkout

## Important Notes

- **Test Mode**: Use test keys (`pk_test_`, `sk_test_`) for development
- **Test Cards**: Use Stripe's test card numbers (e.g., `4242 4242 4242 4242`) for testing
- **Webhook**: For local development, use Stripe CLI to forward webhooks:
  ```bash
  stripe listen --forward-to localhost:5173/api/subscribe/webhook
  ```

## Stripe CLI Setup (for local webhook testing)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:5173/api/subscribe/webhook`
4. Copy the webhook signing secret from the CLI output and add it to `.env`

