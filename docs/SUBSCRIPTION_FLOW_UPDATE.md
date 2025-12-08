# Subscription Flow Update

## Overview
Refactored the subscription payment flow to check subscription status once on app initialization instead of on every page, and automatically redirect users to the payment page after signup/login if payment is not set up or subscription is expired.

## Changes Made

### 1. Created Global Subscription Provider
**File:** `apps/main/components/subscription-provider.tsx`

- Created a React Context provider that checks subscription status once when the app loads
- Handles automatic redirection logic:
  - If user has no valid subscription → redirect to `/profile?tab=subscription&setup=required`
  - If user has valid subscription and is on subscription tab → redirect to `/dashboard`
- Provides subscription data and refresh function to all components via context
- Shows loading indicator only during initial check (with 300ms delay to avoid flash)
- Skips checks for public routes (landing page, auth pages, etc.)

### 1.1 Updated Signup Actions
**File:** `apps/main/app/(auth)/sign-up/actions.ts`

- Added `requiresPayment` flag to signup response
- Returns user tier information after successful registration
- Helps determine if Stripe checkout should be triggered

### 2. Updated Providers
**File:** `apps/main/components/providers.tsx`

- Wrapped the app with `SubscriptionProvider` to enable global subscription checking
- Subscription check happens once per session/navigation

### 3. Updated Middleware
**File:** `apps/main/middleware.ts`

- Changed auth page redirect: When logged-in users try to access `/sign-in`, `/sign-up`, or `/forgot-password`, they are now redirected to `/profile?tab=subscription` instead of `/dashboard`
- This allows the subscription provider to check their subscription status and redirect appropriately
- Added `/jobs` to protected routes list

### 4. Updated Sign-In Flow
**File:** `apps/main/app/(auth)/sign-in/actions.ts`

- Changed redirect after successful login from `/dashboard` to `/profile?tab=subscription`
- The subscription provider will then check if payment is set up and redirect to dashboard if valid, or show payment setup if not

### 5. Removed Subscription Guards from Pages
**Files:**
- `apps/main/app/(dashboard)/dashboard/page.tsx`
- `apps/main/app/(dashboard)/integrations/page.tsx`

- Removed `SubscriptionGuard` component from individual pages
- Subscription checking is now handled globally by the provider
- Pages load faster without individual subscription API calls

### 6. Enhanced Subscription Tab
**File:** `apps/main/components/subscription/subscription-tab.tsx`

- Integrated with subscription context for better state management
- **Auto-triggers Stripe checkout for non-free users who need payment setup**
- After successful payment setup, automatically redirects to dashboard
- Refreshes both local state and global context after subscription changes
- Detects `setupRequired` parameter and automatically opens Stripe checkout modal

## Flow Diagram

### Before (Old Flow)
```
Login → Dashboard → SubscriptionGuard checks → API call → Redirect if needed
Every page → SubscriptionGuard → API call → Check access
```

### After (New Flow)
```
Login → Dashboard → Provider checks in background → Redirect based on status
  ├─ Valid subscription → Stay on Dashboard
  └─ No/Expired subscription → Redirect to Stripe checkout → Complete payment → Back to Dashboard

Signup → Sign-in → Dashboard → Provider checks in background
  ├─ Free tier → Stay on Dashboard
  └─ Paid tier → Redirect to Stripe checkout → Complete payment → Back to Dashboard

Navigation → Provider checks (cached) → Allow/Redirect to Stripe
```

## Benefits

1. **Performance**: Subscription status is checked once instead of on every page load
2. **Better UX**: Users are immediately directed to payment setup after signup/login if needed
3. **Cleaner Code**: Removed repetitive subscription guards from individual pages
4. **Centralized Logic**: All subscription checking logic is in one place
5. **Automatic Redirects**: Users can't access protected pages without valid subscription

## Testing Checklist

- [ ] New user signup (non-free tier) → redirects to sign-in → auto-opens Stripe checkout
- [ ] New user signup (free tier) → redirects to sign-in → goes directly to dashboard
- [ ] User login with no payment → redirects to profile → auto-opens Stripe checkout
- [ ] User login with valid subscription → redirects to dashboard
- [ ] User with expired subscription → redirects to profile → auto-opens Stripe checkout
- [ ] Payment setup completion → redirects to dashboard
- [ ] Payment cancellation → stays on subscription tab with option to retry
- [ ] Direct navigation to protected pages without subscription → redirects to payment
- [ ] Free tier users → have immediate access without payment prompts
- [ ] Public pages (landing, contact, etc.) → accessible without checks

## API Calls Reduced

**Before:** 
- 1 API call on login
- 1 API call per protected page visit
- Example: Login + Dashboard + Integrations + Profile = 4 API calls

**After:**
- 1 API call on login/navigation
- Cached for the session
- Example: Login + Dashboard + Integrations + Profile = 1 API call

## Notes

- The subscription provider only runs on protected routes (not on public pages)
- Loading indicator appears after 300ms to avoid flash for fast connections
- Subscription context can be accessed in any component using `useSubscription()` hook
- The old `SubscriptionGuard` component is still available but no longer used
