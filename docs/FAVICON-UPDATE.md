# Favicon Update

## Changes Made

Updated the favicon to match the SLEDGE logo used in the navbar.

### Files Changed:

1. **Added `apps/main/app/icon.png`** - Main favicon (500x500 PNG)
2. **Added `apps/main/app/apple-icon.png`** - Apple touch icon for iOS devices (500x500 PNG)
3. **Removed `apps/main/app/favicon.ico`** - Old favicon file
4. **Updated `apps/main/app/layout.tsx`** - Updated metadata with proper title and icon reference

### What This Does:

- **Browser Tab**: Shows the SLEDGE logo in the browser tab
- **Bookmarks**: Uses the SLEDGE logo when users bookmark the site
- **Mobile Home Screen**: Uses the SLEDGE logo when users add the app to their home screen (iOS/Android)
- **Consistent Branding**: Favicon now matches the logo in the sidebar navigation

### Technical Details:

Next.js 13+ automatically detects and uses:
- `icon.png` - For the main favicon
- `apple-icon.png` - For Apple touch icon (iOS devices)

Both files are sourced from `/public/images/logos/sledge.png` (500x500 PNG).

### Testing:

1. Clear your browser cache
2. Reload the application
3. Check the browser tab - you should see the SLEDGE logo
4. On mobile, add to home screen - you should see the SLEDGE logo

### Metadata Updated:

```typescript
title: "SLEDGE - Invoice Management"
description: "A modern dashboard to manage and process invoices with AI-powered data extraction."
icons: { icon: '/icon.png' }
```
