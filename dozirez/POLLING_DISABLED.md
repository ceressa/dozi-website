# Pharmacy Dashboard Auto-Refresh Disabled

**Date:** 2026-01-30  
**Reason:** No pilot pharmacies yet, unnecessary polling

## Changes

### dashboard.js
- **Auto-refresh disabled** (was: 2 minutes)
- Will be re-enabled when pilot program starts
- Suggested interval: 10 minutes (600000ms)

## Current Behavior

- Dashboard loads data on page load
- Manual refresh: User can reload page
- No automatic polling to Firebase Functions

## When to Re-enable

1. When first pilot pharmacy is onboarded
2. Change interval to 10 minutes (not 2 minutes)
3. Uncomment the setInterval code in dashboard.js

## Code Location

```javascript
// File: dozi-website-temp/dozirez/dashboard.js
// Line: ~450

// Auto refresh disabled - will be enabled when pilot pharmacies are active
// TODO: Enable with longer interval (10 minutes) when pilot program starts
// setInterval(() => {
//     loadDashboardData();
// }, 600000); // 10 minutes
```

## Impact

- **Reduced Firebase Function calls:** No more 204/401 responses every 2 minutes
- **Lower costs:** Fewer function invocations
- **Better logs:** Cleaner function logs without polling noise
- **No user impact:** Dashboard still works, just no auto-refresh

## Testing

Dashboard still works normally:
- Login works
- Data loads on page load
- Manual refresh (F5) works
- All features functional
