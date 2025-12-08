# Auto-Checkout Feature

## Overview
After signup or login, non-free tier users are automatically redirected to the Stripe checkout page to set up their payment method and start their trial.

## How It Works

### For New Users (Signup Flow)
1. User completes signup form
2. Backend creates user account and assigns subscription tier based on registration order
3. User is redirected to sign-in page
4. After signing in, user is redirected to `/dashboard`
5. **Subscription provider detects non-free tier + no payment method**
6. **Stripe checkout page opens automatically (full redirect)**
7. User completes payment setup in Stripe
8. After successful payment, user is redirected back to `/dashboard` with success message

### For Existing Users (Login Flow)
1. User logs in
2. User is redirected to `/dashboard`
3. **Subscription provider checks status in background**
4. If subscription is expired or payment is missing:
   - **Stripe checkout page opens automatically (full redirect)**
5. User updates payment
6. Redirected back to `/dashboard` with success message

### For Free Tier Users
- No payment setup required
- Automatically redirected to `/dashboard` after login
- Never see the Stripe checkout
- Full access immediately

## Technical Implementation

### Auto-Redirect Logic
Located in `apps/main/components/subscription-provider.tsx`:

```typescript
const checkAuth = async () => {
    const subscriptionData = await fetchSubscription();

    if (subscriptionData) {
        const hasAccess = hasValidSubscription(subscriptionData);

        // If user doesn't have valid subscription, open Stripe checkout directly
        if (!hasAccess && !pathname.startsWith('/profile')) {
            // Check if user needs payment setup (non-free tier without payment)
            if (subscriptionData.tier !== 'free' && 
                subscriptionData.requiresPaymentSetup && 
                !subscriptionData.hasPaymentMethod) {
                // Directly create and redirect to Stripe checkout
                await createCheckoutAndRedirect();
                return;
            }
        }
    }
};

const createCheckoutAndRedirect = async () => {
    const response = await client.post('api/v1/subscription/create-checkout', {
        successUrl: `${window.location.origin}/dashboard?payment=success`,
        cancelUrl: `${window.location.origin}/profile?tab=subscription&payment=canceled`
    });
    const checkoutData = response?.data;
    window.location.href = checkoutData.url; // Full page redirect to Stripe
};
```

### Conditions for Auto-Redirect
The Stripe checkout automatically opens when ALL of these conditions are met:
1. User is authenticated (has token)
2. User navigates to a protected route (e.g., `/dashboard`)
3. `subscription` exists (user has a subscription record)
4. `hasAccess === false` (subscription is not valid)
5. `subscription.tier !== 'free'` (user is not on free tier)
6. `subscription.requiresPaymentSetup === true` (backend indicates payment is needed)
7. `subscription.hasPaymentMethod === false` (no payment method on file)

### Preventing Multiple Redirects
- Subscription check happens once on initial load
- Uses `isChecked` state to prevent repeated checks
- If user cancels checkout, they're redirected to profile page
- Can manually retry from profile page if needed

## User Experience

### Seamless Flow
- User logs in and is redirected to dashboard
- If payment is needed, immediately redirected to Stripe checkout
- No intermediate pages or buttons to click
- Clean, direct flow from login to payment to dashboard

### Manual Override
If user cancels checkout:
- Redirected to profile page with subscription tab
- "Set Up Payment" button is visible
- User can manually trigger checkout anytime
- No loss of functionality

## Edge Cases Handled

### 1. User Cancels Checkout
- Redirected to profile page with subscription tab
- Can click "Set Up Payment" to try again
- No automatic re-trigger (prevents annoyance)

### 2. Webhook Processing
- After successful payment, Stripe redirects to `/dashboard?payment=success`
- Success toast message displayed
- Subscription status updated via webhook in background

### 3. Network Errors
- Error message displayed
- "Refresh Status" button available
- Can retry payment setup

### 4. Free Tier Users
- Never see checkout
- Go directly to dashboard
- No payment prompts

### 5. Already Has Payment Method
- No auto-trigger
- Goes directly to dashboard
- Can manage subscription via "Manage Subscription" button

## Configuration

### URL Parameters
- `?payment=success` - Payment completed successfully (shows toast on dashboard)
- `?payment=canceled` - Payment was canceled (redirects to profile)

### Stripe URLs
Checkout session is created with:
- `successUrl`: `/dashboard?payment=success`
- `cancelUrl`: `/profile?tab=subscription&payment=canceled`

## Benefits

1. **Zero Friction**: Direct redirect from login to Stripe checkout - no intermediate pages
2. **Higher Conversion**: Immediate payment flow increases completion rate
3. **Clear Intent**: Users know immediately what's required
4. **Professional**: Clean, direct flow like major SaaS products
5. **Smart**: Only triggers when actually needed
6. **Fast**: No unnecessary page loads or button clicks

## Monitoring

### Console Logs
- `🚀 Creating Stripe checkout session...` - Creating checkout
- `✅ Redirecting to Stripe checkout...` - Redirecting to Stripe
- `❌ No valid subscription, opening Stripe checkout...` - Detected missing payment

### What to Watch
- Checkout completion rate
- Cancellation rate
- Time from signup to first payment
- Users who return after canceling

## Future Enhancements

Potential improvements:
1. Add analytics tracking for auto-trigger events
2. A/B test delay timing (500ms vs other values)
3. Add progress indicator during checkout
4. Email reminder for users who cancel
5. Offer to schedule payment setup for later
