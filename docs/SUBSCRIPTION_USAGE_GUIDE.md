# Subscription System Usage Guide

## Overview
The subscription system now uses a global provider that checks subscription status once on app initialization and handles automatic redirects.

## For Developers

### Using the Subscription Hook

You can access subscription data in any component using the `useSubscription` hook:

```tsx
import { useSubscription } from '@/components/subscription-provider';

function MyComponent() {
  const { subscription, loading, hasAccess, refreshSubscription } = useSubscription();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasAccess) {
    return <div>No access</div>;
  }

  return (
    <div>
      <p>Tier: {subscription?.tier}</p>
      <p>Status: {subscription?.status}</p>
      <button onClick={refreshSubscription}>Refresh</button>
    </div>
  );
}
```

### Available Properties

- `subscription`: The full subscription object with all details
- `loading`: Boolean indicating if subscription is being fetched
- `hasAccess`: Boolean indicating if user has valid subscription access
- `refreshSubscription()`: Function to manually refresh subscription data

### Subscription Object Properties

```typescript
interface SubscriptionStatus {
  tier: 'free' | 'promotional' | 'standard';
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
  registrationOrder: number;
  trialStart: string | null;
  trialEnd: string | null;
  daysRemaining: number | null;
  monthlyPrice: number;
  requiresPaymentSetup: boolean;
  hasPaymentMethod: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## User Flows

### New User Signup Flow
1. User signs up at `/sign-up`
2. Redirected to `/sign-in` with success message
3. User signs in
4. Redirected to `/dashboard`
5. **Subscription provider checks status in background**
6. **If non-free tier user → Immediately redirected to Stripe checkout page**
7. User completes payment setup in Stripe
8. After successful payment → redirected back to `/dashboard` with success toast
9. If free tier user → stays on `/dashboard` (no redirect)

### Existing User Login Flow
1. User logs in at `/sign-in`
2. Redirected to `/dashboard`
3. **Subscription provider checks status in background**
4. If valid subscription → stays on `/dashboard`
5. If expired/no payment → **Immediately redirected to Stripe checkout page** (for non-free users)
6. User updates payment → redirected back to `/dashboard` with success toast

### Expired Subscription Flow
1. User tries to access protected page (e.g., `/dashboard`)
2. **Subscription provider checks status in background**
3. If expired → **Immediately redirected to Stripe checkout page**
4. User updates payment
5. After successful payment → redirected back to `/dashboard` with success toast

## Protected Routes

The following routes require valid subscription:
- `/dashboard`
- `/integrations`
- `/profile`
- `/jobs`
- `/invoice-review`

## Public Routes

The following routes are accessible without subscription:
- `/` (landing page)
- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/contact-us`
- `/privacy-policy`
- `/terms-conditions`
- `/auth/*` (OAuth callbacks)

## Subscription Tiers

### Free Tier
- First 100 users
- Full access forever
- No payment required

### Promotional Tier
- Users 101-500
- 60-day free trial
- $49/month after trial
- Requires payment method setup to start trial

### Standard Tier
- Users 501+
- 30-day free trial
- $99/month after trial
- Requires payment method setup to start trial

## Valid Subscription Criteria

A user has valid access if:
1. They are on the free tier, OR
2. Their subscription status is 'active', OR
3. Their subscription status is 'trialing', OR
4. They have a payment method and status is 'incomplete' (webhook processing)

## Manual Subscription Refresh

If you need to manually refresh subscription data (e.g., after a payment update):

```tsx
const { refreshSubscription } = useSubscription();

// After payment update
await refreshSubscription();
```

## Removing Old Subscription Guards

The old `SubscriptionGuard` component is no longer needed on pages. Simply remove it:

### Before
```tsx
import { SubscriptionGuard } from '@/components/auth/subscription-guard';

export default function MyPage() {
  return (
    <SubscriptionGuard requiresAccess={true}>
      <MyContent />
    </SubscriptionGuard>
  );
}
```

### After
```tsx
export default function MyPage() {
  return <MyContent />;
}
```

The subscription check is now handled globally by the provider.

## Troubleshooting

### User stuck on subscription page
- Check if webhook is properly configured
- Verify Stripe subscription was created
- Check browser console for errors
- Try refreshing subscription manually

### Subscription not updating after payment
- Wait 2-3 seconds for webhook processing
- Check Stripe dashboard for webhook delivery
- Verify webhook secret is correct
- Check API logs for webhook errors

### Infinite redirect loop
- Check if user has valid subscription in database
- Verify subscription status is correct
- Check browser console for errors
- Clear cookies and try again

## API Endpoints

- `GET /api/v1/subscription/status` - Get current subscription status
- `POST /api/v1/subscription/create-checkout` - Create Stripe checkout session
- `POST /api/v1/subscription/create-portal` - Create Stripe customer portal session
- `POST /api/v1/subscription/webhook` - Stripe webhook handler
