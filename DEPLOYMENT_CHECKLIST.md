# Firebase Functions Deployment Checklist

## 🚀 Pre-Deployment

### 1. Code Review
- [x] reCAPTCHA verification added to both endpoints
- [x] RECAPTCHA_SECRET added to secrets array
- [x] Rate limiting configured (3/hour for deletion, 5/hour for data requests)
- [x] CORS protection enabled (dozi.app domains only)
- [x] Input validation implemented
- [x] Email notifications configured

### 2. Frontend Files
- [x] `account-deletion-form.html` - reCAPTCHA site key configured
- [x] `legal/kvkk-basvuru.html` - reCAPTCHA site key configured
- [x] `legal/gdpr-request.html` - reCAPTCHA site key configured

### 3. Documentation
- [x] `FIREBASE_FUNCTIONS_SECURITY.md` - Security measures documented
- [x] `SECURITY.md` - Website security headers documented

## 🔧 Deployment Steps

### Step 1: Set Firebase Secrets
```bash
cd Dozi/firebase-functions

# Set reCAPTCHA secret
firebase functions:secrets:set RECAPTCHA_SECRET
# Enter: 6Lcp60MsAAAAABdQNpYvd3ixJl51KpbwYe76Rf-N

# Set SMTP credentials (if not already set)
firebase functions:secrets:set SMTP_HOST
# Enter your SMTP host (e.g., smtp.gmail.com)

firebase functions:secrets:set SMTP_PORT
# Enter: 587

firebase functions:secrets:set SMTP_USER
# Enter your email address

firebase functions:secrets:set SMTP_PASS
# Enter your email password or app-specific password

firebase functions:secrets:set KVKK_EMAIL
# Enter: info@dozi.app (or dedicated KVKK email)
```

### Step 2: Deploy Functions
```bash
cd Dozi/firebase-functions

# Install dependencies (if needed)
npm install

# Build TypeScript
npm run build

# Deploy to Firebase
firebase deploy --only functions:submitAccountDeletionRequest,functions:submitDataRequest

# Or deploy all functions
firebase deploy --only functions
```

### Step 3: Get Function URLs
After deployment, Firebase will output the function URLs:
```
✔  functions[submitAccountDeletionRequest(europe-west3)]: https://europe-west3-dozi-app.cloudfunctions.net/submitAccountDeletionRequest
✔  functions[submitDataRequest(europe-west3)]: https://europe-west3-dozi-app.cloudfunctions.net/submitDataRequest
```

### Step 4: Update Frontend URLs
Update the endpoint URLs in HTML files:

**account-deletion-form.html:**
```javascript
const response = await fetch('https://europe-west3-dozi-app.cloudfunctions.net/submitAccountDeletionRequest', {
```

**legal/kvkk-basvuru.html:**
```javascript
const response = await fetch('https://europe-west3-dozi-app.cloudfunctions.net/submitDataRequest', {
```

**legal/gdpr-request.html:**
```javascript
const response = await fetch('https://europe-west3-dozi-app.cloudfunctions.net/submitDataRequest', {
```

### Step 5: Deploy Website
```bash
cd dozi-website-temp

# Commit changes
git add .
git commit -m "feat: Add Firebase Functions integration for KVKK/GDPR forms"
git push origin main

# GitHub Pages will auto-deploy
```

## ✅ Post-Deployment Testing

### Test Account Deletion Form
1. Go to: https://www.dozi.app/account-deletion-form.html
2. Fill form with test data
3. Submit and verify:
   - ✅ reCAPTCHA executes
   - ✅ Success message appears
   - ✅ Confirmation email received
   - ✅ Admin email received
   - ✅ Firestore document created in `account_deletion_requests`

### Test KVKK Form (Turkish)
1. Go to: https://www.dozi.app/legal/kvkk-basvuru.html
2. Test each request type:
   - Veri Erişim Talebi
   - Veri Düzeltme Talebi
   - Veri Silme Talebi
   - Veri Taşınabilirlik Talebi
   - İtiraz Talebi
3. Verify same checks as above
4. Check Firestore: `data_requests` collection

### Test GDPR Form (English)
1. Go to: https://www.dozi.app/legal/gdpr-request.html
2. Test each request type
3. Verify same checks as above

### Test Rate Limiting
1. Submit 4 account deletion requests quickly
2. 4th request should return 429 error
3. Wait 1 hour or check Firestore `rate_limits` collection

### Test reCAPTCHA
1. Open browser DevTools → Network tab
2. Submit form
3. Check request payload includes `recaptchaToken`
4. Check Firebase Functions logs for reCAPTCHA verification

## 🔍 Monitoring

### Firebase Console
- **Functions Logs:** https://console.firebase.google.com/project/dozi-app/functions/logs
- **Firestore Data:** https://console.firebase.google.com/project/dozi-app/firestore/data

### Check Pending Requests
```javascript
// In Firebase Console → Firestore
// Collection: account_deletion_requests
// Filter: status == "pending"

// Collection: data_requests
// Filter: status == "pending"
```

### View Function Logs
```bash
# Real-time logs
firebase functions:log --follow

# Filter by function
firebase functions:log --only submitAccountDeletionRequest

# Last 100 lines
firebase functions:log --limit 100
```

## 🚨 Rollback Plan

If issues occur:

### Rollback Functions
```bash
# List previous deployments
firebase functions:list

# Rollback to previous version (if needed)
# Note: Firebase doesn't have built-in rollback, redeploy previous code
```

### Disable Functions Temporarily
```bash
# Delete functions (can redeploy later)
firebase functions:delete submitAccountDeletionRequest
firebase functions:delete submitDataRequest
```

### Revert Website
```bash
cd dozi-website-temp
git revert HEAD
git push origin main
```

## 📊 Success Metrics

After 1 week, check:
- [ ] No 500 errors in function logs
- [ ] All requests processed successfully
- [ ] No spam/abuse detected
- [ ] Email delivery rate > 95%
- [ ] Average reCAPTCHA score > 0.7
- [ ] Rate limiting working (check `rate_limits` collection)

## 📞 Support

- **Firebase Issues:** Check Firebase Status page
- **Email Issues:** Verify SMTP credentials
- **reCAPTCHA Issues:** Check Google reCAPTCHA Admin Console
- **Website Issues:** Check GitHub Pages deployment status

---

**Prepared:** 2026-01-08  
**Deployment Target:** Production  
**Estimated Time:** 30 minutes
