# Onboarding Flow Feature

## Overview
This feature implements a guided onboarding flow for new users after they complete payment. The flow guides users through connecting Gmail and QuickBooks integrations before showing them the main dashboard.

## User Flow

1. **Sign In** → User signs in to the application
2. **Payment** → User is redirected to Stripe payment page
3. **Payment Success** → After successful payment, user is redirected to `/dashboard?payment_success=true`
4. **Onboarding Check** → Dashboard checks if user has completed onboarding
5. **Onboarding Flow** → If not completed, show step-by-step integration setup:
   - **Step 1: Gmail Integration** - Connect Gmail account for invoice processing (required)
   - **Step 2: Gmail Configuration** - Select start date for email processing (required)
   - **Step 3: QuickBooks Integration** - Connect QuickBooks (required)
   - **Step 4: Complete** - Mark onboarding as complete and show dashboard
6. **Dashboard** → Show normal dashboard with stats and invoices

## Implementation Details

### Backend Changes

#### 1. Database Schema
- **File**: `apps/api/models/users.model.ts`
- **Change**: Added `onboardingCompleted` boolean field (default: false)
- **Migration**: `apps/api/drizzle/0010_add_onboarding_completed.sql`

```sql
ALTER TABLE "users" ADD COLUMN "onboarding_completed" boolean DEFAULT false NOT NULL;
```

#### 2. User Service
- **File**: `apps/api/services/users.service.ts`
- **New Method**: `completeOnboarding(userId: number)`
  - Updates user's `onboardingCompleted` field to true
  - Returns updated user data

#### 3. User Controller
- **File**: `apps/api/controllers/users.controller.ts`
- **New Endpoint**: `completeOnboarding`
  - Handles POST request to complete onboarding
  - Calls user service to update database

#### 4. User Routes
- **File**: `apps/api/routes/users.route.ts`
- **New Route**: `POST /api/v1/users/complete-onboarding`
  - Protected route (requires authentication)
  - Marks user's onboarding as complete

### Frontend Changes

#### 1. Onboarding Component
- **File**: `apps/main/components/onboarding/onboarding-flow.tsx`
- **Features**:
  - Step-by-step progress indicator (4 steps)
  - Gmail integration button (required)
  - Gmail date configuration with calendar picker (required)
  - QuickBooks integration button (required)
  - Auto-advances when each step is completed
  - Completion button that marks onboarding as done
  - Smart redirect using localStorage: Returns to dashboard during onboarding, stays on integrations page otherwise

#### 2. Dashboard Page
- **File**: `apps/main/app/(dashboard)/dashboard/page.tsx`
- **Changes**:
  - Fetches user data to check `onboardingCompleted` status
  - Fetches integrations data for onboarding flow
  - Shows `OnboardingFlow` component if onboarding not completed
  - Shows normal dashboard if onboarding is completed

#### 3. Onboarding Redirect Handler
- **File**: `apps/main/components/onboarding/onboarding-redirect-handler.tsx`
- **Purpose**: Client-side component that checks localStorage and redirects appropriately
- **How it works**:
  - Checks for `onboarding_mode` flag in localStorage
  - If flag is set and user lands on integrations page, redirects to dashboard
  - Clears the flag after redirect
  - Mounted on integrations page to intercept OAuth callbacks

#### 4. Integration Callbacks
- **Files**: 
  - `apps/main/app/api/callback/gmail/route.ts`
  - `apps/main/app/api/callback/quickbooks/route.ts`
- **Changes**:
  - Always redirect to `/integrations` page after OAuth
  - OnboardingRedirectHandler checks localStorage and redirects to dashboard if needed

#### 4. Subscription Provider
- **File**: `apps/main/components/subscription-provider.tsx`
- **Change**: Updated success URL to include `payment_success=true` parameter

#### 5. Type Definitions
- **File**: `apps/main/lib/types/index.ts`
- **Change**: Added `onboardingCompleted?: boolean` to User interface

## API Endpoints

### Complete Onboarding
```
POST /api/v1/users/complete-onboarding
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "message": "Onboarding completed successfully"
  }
}
```

## Database Migration

To apply the database changes, run:

```bash
# Connect to your database and run the migration
psql -d your_database -f apps/api/drizzle/0010_add_onboarding_completed.sql

# Or if using a migration tool
npm run migrate
```

## Testing the Feature

1. **Create a new user account**
2. **Complete payment** - You'll be redirected to Stripe
3. **After payment** - You'll see the onboarding flow
4. **Connect Gmail** - Click "Connect Gmail" button (required)
5. **Configure Gmail** - Select start date for email processing (required)
6. **Connect QuickBooks** - Click "Connect QuickBooks" button (required)
7. **Complete** - Click "Go to Dashboard"
8. **Verify** - You should now see the normal dashboard

## Edge Cases Handled

1. **Existing Users**: Users created before this feature will have `onboardingCompleted = false` by default, but can be manually updated if needed
2. **Both Integrations Required**: Users must connect both Gmail and QuickBooks to complete onboarding
3. **Integration Failures**: If integration fails, user stays on onboarding screen and can retry
4. **Direct Dashboard Access**: If user tries to access dashboard directly, onboarding flow will show if not completed
5. **Callback Redirects**: Integration callbacks detect onboarding mode and redirect appropriately

## Future Enhancements

1. Add progress persistence (save current step)
2. Add ability to restart onboarding from settings
3. Add analytics tracking for onboarding completion rates
4. Add tooltips and help text for each integration
5. Add video tutorials or documentation links
6. Allow admins to customize onboarding steps
7. Add email notifications for incomplete onboarding

## Files Modified

### Backend
- `apps/api/models/users.model.ts`
- `apps/api/services/users.service.ts`
- `apps/api/controllers/users.controller.ts`
- `apps/api/routes/users.route.ts`
- `apps/api/drizzle/0010_add_onboarding_completed.sql` (new)

### Frontend
- `apps/main/components/onboarding/onboarding-flow.tsx` (new)
- `apps/main/components/onboarding/onboarding-redirect-handler.tsx` (new)
- `apps/main/components/onboarding/index.ts` (new)
- `apps/main/app/(dashboard)/dashboard/page.tsx`
- `apps/main/app/(dashboard)/integrations/page.tsx`
- `apps/main/app/api/callback/gmail/route.ts`
- `apps/main/app/api/callback/quickbooks/route.ts`
- `apps/main/components/subscription-provider.tsx`
- `apps/main/lib/types/index.ts`

## Notes

- The onboarding flow is only shown once per user
- Users can access integrations page later to add more integrations
- The flow is designed to be non-blocking (users can skip QuickBooks)
- All existing functionality remains unchanged for users who have already completed onboarding
