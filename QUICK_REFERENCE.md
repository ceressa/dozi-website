# Quick Reference - Firebase Functions & Forms

## 🔑 reCAPTCHA Keys

**Site Key (Frontend):**
```
6Lcp60MsAAAAAFZ4qhzifUXH7YRmVfhFu2n36epX
```

**Secret Key (Backend):**
```
6Lcp60MsAAAAABdQNpYvd3ixJl51KpbwYe76Rf-N
```

**Domains:** `dozi.app`, `www.dozi.app`

---

## 🎯 reCAPTCHA Actions

| Form | Action Name | Endpoint |
|------|-------------|----------|
| Account Deletion | `account_deletion` | `submitAccountDeletionRequest` |
| KVKK Request | `data_request` | `submitDataRequest` |
| GDPR Request | `data_request` | `submitDataRequest` |

---

## 🚀 Deploy Commands

### Set Secrets
```bash
cd Dozi/firebase-functions

firebase functions:secrets:set RECAPTCHA_SECRET
# Enter: 6Lcp60MsAAAAABdQNpYvd3ixJl51KpbwYe76Rf-N

firebase functions:secrets:set SMTP_HOST
firebase functions:secrets:set SMTP_PORT
firebase functions:secrets:set SMTP_USER
firebase functions:secrets:set SMTP_PASS
firebase functions:secrets:set KVKK_EMAIL
```

### Deploy Functions
```bash
cd Dozi/firebase-functions
npm run build
firebase deploy --only functions:submitAccountDeletionRequest,functions:submitDataRequest
```

### Deploy Website
```bash
cd dozi-website-temp
git add .
git commit -m "feat: Add Firebase Functions integration for KVKK/GDPR forms"
git push origin main
```

---

## 📊 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Account Deletion | 3 requests | 1 hour |
| Data Request | 5 requests | 1 hour |

---

## 🔗 Form URLs

| Form | URL |
|------|-----|
| Account Deletion (TR) | https://www.dozi.app/account-deletion-form.html |
| KVKK Request (TR) | https://www.dozi.app/legal/kvkk-basvuru.html |
| GDPR Request (EN) | https://www.dozi.app/legal/gdpr-request.html |

---

## 📧 Email Recipients

| Type | Recipient |
|------|-----------|
| Account Deletion Admin | `info@dozi.app` |
| KVKK/GDPR Admin | `KVKK_EMAIL` secret (default: `info@dozi.app`) |
| User Confirmation | User's email from form |

---

## 🗄️ Firestore Collections

| Collection | Purpose |
|------------|---------|
| `account_deletion_requests` | Account deletion requests |
| `data_requests` | KVKK/GDPR data requests |
| `rate_limits` | Rate limiting counters |

---

## 🧪 Test Checklist

- [ ] Account deletion form submits successfully
- [ ] KVKK form submits (test all 5 request types)
- [ ] GDPR form submits (test all 5 request types)
- [ ] Admin emails received
- [ ] User confirmation emails received
- [ ] Firestore documents created
- [ ] Rate limiting works (4th request blocked)
- [ ] reCAPTCHA verification logs show success

---

## 🔍 Monitoring

**Firebase Console:**
- Functions: https://console.firebase.google.com/project/dozi-app/functions
- Firestore: https://console.firebase.google.com/project/dozi-app/firestore
- Logs: https://console.firebase.google.com/project/dozi-app/functions/logs

**CLI:**
```bash
# Real-time logs
firebase functions:log --follow

# Filter by function
firebase functions:log --only submitAccountDeletionRequest
```

---

## 🆘 Troubleshooting

### reCAPTCHA Fails
- Check site key in HTML files
- Verify secret key in Firebase
- Check domain registration (no `https://`)
- Review score in logs (must be ≥ 0.5)

### Email Not Sent
- Verify SMTP secrets are set
- Check SMTP credentials
- Review function logs for errors
- Test SMTP connection manually

### Rate Limit Issues
- Check `rate_limits` collection in Firestore
- Verify IP address in logs
- Wait 1 hour or manually delete rate limit doc

### CORS Errors
- Verify request from `dozi.app` or `www.dozi.app`
- Check browser console for CORS errors
- Ensure CORS array in function config is correct

---

**Last Updated:** 2026-01-08
