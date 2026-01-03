# Stripe Payment Setup Guide

## 🚀 Quick Setup (5 minutes)

### 1. Create a Stripe Account

1. Go to <https://dashboard.stripe.com/register>
2. Sign up for a free Stripe account
3. Complete the account verification

### 2. Get Your API Keys

**In the Stripe Dashboard**:

1. Go to **Developers** → **API keys**
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...` in test mode)
   - **Secret key** (starts with `sk_test_...` in test mode, click "Reveal" to see it)

### 3. Add API Keys to Your `.env` File

Add these three variables to your `.env` file:

```bash
# Stripe API Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXX  # Set this up in step 4
```

### 4. Set Up Webhooks (For Automatic Payment Detection)

**Local Testing (Optional)**:

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Run: `stripe listen --forward-to localhost:3000/api/payments/webhook`
3. Copy the webhook secret (starts with `whsec_`)
4. Add it to your `.env` file

**Production (Required)**:

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://fantasy-weekly-golf.vercel.app/api/payments/webhook`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to **Vercel Environment Variables**:
   - Go to Vercel Project Settings → Environment Variables
   - Add `STRIPE_WEBHOOK_SECRET` with the value

### 5. Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these three variables:
   - `STRIPE_SECRET_KEY` (from step 2)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (from step 2)
   - `STRIPE_WEBHOOK_SECRET` (from step 4)

### 6. Test Payment Flow

**Local Testing**:

1. Start your dev server: `npm run dev`
2. Register a new test account
3. Go to `/payment` page
4. Use Stripe test card: **4242 4242 4242 4242**
5. Use any future expiry date and any CVC
6. Payment should succeed and account should auto-activate!

**Stripe Test Cards**:

- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

### 7. Go Live

When you're ready for real payments:

1. In Stripe Dashboard, click **Activate your account**
2 Complete business verification
2. Switch from **Test mode** to **Live mode** (toggle in top right)
3. Get your **Live API keys** (start with `pk_live_` and `sk_live_`)
4. Update Vercel environment variables with live keys
5. **IMPORTANT**: Update the webhook endpoint to point to your production domain
6. Redeploy on Vercel

---

## 💰 How Payments Work

1. **User Clicks "Proceed to Payment"** → Creates a Stripe PaymentIntent for $515
2. **User Enters Card Info** → Stripe securely collects and processes payment
3. **Payment Succeeds** → Stripe sends webhook to `/api/payments/webhook`
4. **Webhook Handler** → Automatically marks `team.isPaid = true`
5. **User Account Activated** → Can now make picks!

---

## 🔒 Security Notes

- **PCI Compliance**: Stripe handles all card data. Your server never sees card numbers.
- **Webhook Signatures**: The webhook endpoint verifies all requests are from Stripe.
- **HTTPS Only**: Stripe requires HTTPS in production (Vercel provides this automatically).

---

## 🧪 Testing Checklist

- [ ] Can create payment intent via `/api/payments/create-payment`
- [ ] Stripe payment form loads correctly
- [ ] Test payment with `4242 4242 4242 4242` succeeds
- [ ] Webhook fires and marks team as paid
- [ ] Payment status table shows green checkmark
- [ ] Failed payment shows error message
- [ ] `/payment/success` page displays after payment

---

## 📞 Need Help?

- Stripe Documentation: <https://stripe.com/docs>
- Stripe Support: <https://support.stripe.com>
- Test your webhooks: <https://dashboard.stripe.com/test/webhooks>

---

## ⚡ Next Steps

1. Add your Stripe API keys to `.env` file
2. Add your keys to Vercel environment variables
3. Test a payment locally
4. Deploy to Vercel
5. Set up production webhook endpoint
6. Activate your Stripe account when ready to go live!
