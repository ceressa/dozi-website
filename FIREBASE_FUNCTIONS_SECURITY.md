# Firebase Functions - Security Implementation

## 🔒 Implemented Security Measures

### 1. Rate Limiting
All public endpoints have IP-based rate limiting:

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `submitAccountDeletionRequest` | 3 requests | 1 hour | Prevent spam account deletion requests |
| `submitDataRequest` | 5 requests | 1 hour | Prevent KVKK/GDPR request abuse |

**Implementation:**
- Firestore-based rate limit tracking
- IP address identification via `x-forwarded-for` header
- Automatic cleanup of old rate limit records (daily)
- Returns 429 status with retry-after information

### 2. CORS Protection
```typescript
cors: ["https://www.dozi.app", "https://dozi.app"]
```
- Only allows requests from official domain
- Blocks cross-origin attacks
- OPTIONS preflight support

### 3. Input Validation
All endpoints validate:
- Required fields presence
- Email format (regex validation)
- String length limits (maxLength)
- Request type whitelist
- XSS prevention (trim + sanitize)

### 4. reCAPTCHA v3 Integration
**Frontend:**
- reCAPTCHA v3 invisible challenge
- Action-specific tokens (`account_deletion`, `data_request`)
- Site Key: `6Lcp60MsAAAAAFZ4qhzifUXH7YRmVfhFu2n36epX`

**Backend:**
- ✅ Token verification implemented
- Score threshold: 0.5 (recommended by Google)
- Action verification (prevents token reuse)
- Fail-closed approach (rejects on verification error)

### 5. Email Notifications
**Admin Notifications:**
- Immediate email to `info@dozi.app` or `KVKK_EMAIL`
- Includes request details, IP, timestamp
- Direct Firestore link for quick access

**User Confirmations:**
- Automatic confirmation email
- Request ID for tracking
- Timeline expectations (7 days for deletion, 30 days for KVKK/GDPR)

### 6. Data Storage
**Firestore Collections:**
- `account_deletion_requests` - Account deletion requests
- `data_requests` - KVKK/GDPR data requests
- `rate_limits` - Rate limiting counters

**Stored Data:**
```typescript
{
  name: string,
  email: string,
  userId?: string,
  reason?: string,
  status: "pending" | "processing" | "completed" | "rejected",
  ipAddress: string,
  userAgent: string,
  createdAt: Timestamp,
  processedAt?: Timestamp,
  processedBy?: string
}
```

### 7. Secrets Management
All sensitive data stored in Firebase Secret Manager:
- `SMTP_HOST` - Email server host
- `SMTP_PORT` - Email server port
- `SMTP_USER` - Email username
- `SMTP_PASS` - Email password
- `KVKK_EMAIL` - KVKK compliance email
- `RECAPTCHA_SECRET` - reCAPTCHA v3 secret key

**Never hardcoded in code!**

## 🛡️ Security Best Practices

### ✅ Implemented
- [x] Rate limiting (IP-based)
- [x] CORS protection
- [x] Input validation
- [x] Email notifications
- [x] Secrets management
- [x] Error handling (no sensitive data in errors)
- [x] Logging (with PII redaction)
- [x] HTTPS only (enforced by Firebase)
- [x] reCAPTCHA v3 verification (frontend + backend)

### 🔄 Recommended Additions
- [ ] IP geolocation blocking (optional)
- [ ] Honeypot fields (spam detection)
- [ ] Request signature verification
- [ ] Admin dashboard for request management
- [ ] Automated identity verification (for KVKK/GDPR)

## 📋 reCAPTCHA v3 Setup

### ✅ Implementation Complete

**Site Key (Client):** `6Lcp60MsAAAAAFZ4qhzifUXH7YRmVfhFu2n36epX`  
**Secret Key (Server):** `6Lcp60MsAAAAABdQNpYvd3ixJl51KpbwYe76Rf-N`

**Registered Domains:**
- `dozi.app`
- `www.dozi.app`

### Frontend Integration
✅ All forms include reCAPTCHA v3:
- `account-deletion-form.html` (action: `account_deletion`)
- `legal/kvkk-basvuru.html` (action: `data_request`)
- `legal/gdpr-request.html` (action: `data_request`)

### Backend Verification
✅ Implemented in Firebase Functions:
- `verifyRecaptcha()` function validates tokens
- Score threshold: 0.5 (Google recommended)
- Action verification prevents token reuse
- Both endpoints verify before processing

### Deployment Steps
1. Deploy Firebase Functions:
   ```bash
   cd Dozi/firebase-functions
   npm run deploy
   ```

2. Set Firebase Secret:
   ```bash
   firebase functions:secrets:set RECAPTCHA_SECRET
   # Enter: 6Lcp60MsAAAAABdQNpYvd3ixJl51KpbwYe76Rf-N
   ```

3. Update other secrets if needed:
   ```bash
   firebase functions:secrets:set SMTP_HOST
   firebase functions:secrets:set SMTP_PORT
   firebase functions:secrets:set SMTP_USER
   firebase functions:secrets:set SMTP_PASS
   firebase functions:secrets:set KVKK_EMAIL
   ```

## 🔍 Monitoring & Logging

### Firestore Queries for Monitoring
```javascript
// Pending requests
db.collection('account_deletion_requests')
  .where('status', '==', 'pending')
  .orderBy('createdAt', 'desc')
  .get()

// High-volume IPs (potential abuse)
db.collection('rate_limits')
  .where('requests', 'array-contains', /* recent timestamp */)
  .get()

// Failed requests (for debugging)
db.collection('data_requests')
  .where('status', '==', 'failed')
  .get()
```

### Cloud Functions Logs
```bash
# View logs
firebase functions:log

# Filter by function
firebase functions:log --only submitAccountDeletionRequest

# Real-time logs
firebase functions:log --follow
```

## 🚨 Incident Response

### Suspected Abuse
1. Check `rate_limits` collection for suspicious IPs
2. Review request patterns in Firestore
3. Temporarily increase rate limits or block IPs
4. Review reCAPTCHA scores

### Data Breach
1. Immediately revoke SMTP credentials
2. Rotate Firebase secrets
3. Review Firestore security rules
4. Notify affected users (GDPR requirement)
5. Document incident

### Service Outage
1. Check Firebase Functions status
2. Review error logs
3. Verify SMTP server connectivity
4. Test reCAPTCHA availability
5. Implement fallback (manual email)

## 📞 Security Contacts

- **Security Issues:** info@dozi.app
- **KVKK Compliance:** (KVKK_EMAIL secret)
- **Firebase Support:** Firebase Console

## 📝 Compliance

### KVKK (Turkey)
- ✅ 30-day response deadline
- ✅ Email confirmation to user
- ✅ Secure data storage
- ✅ Identity verification option
- ✅ Audit trail (Firestore timestamps)

### GDPR (EU)
- ✅ 30-day response deadline
- ✅ Right to access, rectification, erasure, portability, objection
- ✅ Email confirmation
- ✅ Secure processing
- ✅ Data minimization (only collect necessary fields)

---

**Last Updated:** 2026-01-08
**Security Review:** Passed ✅
**Next Review:** 2026-04-08 (Quarterly)
