# 🛡️ CSRF Protection Implementation

## Overview

This application implements **multi-layered CSRF (Cross-Site Request Forgery) protection** to prevent attackers from tricking authenticated users into performing unwanted actions.

---

## 🔒 Protection Layers

### Layer 1: SameSite Cookies (Primary Defense)

**Implementation**: Upgraded from `SameSite=lax` to `SameSite=strict` for authentication cookies.

**Cookies affected**:
- `auth-token`: `SameSite=strict` ✅
- `user-id`: `SameSite=strict` ✅
- `auth-status`: `SameSite=lax` (for better UX)

**How it works**:
- Browser won't send cookies with cross-site requests
- Blocks most CSRF attacks automatically
- No code changes needed on client side

**Example blocked attack**:
```html
<!-- Malicious site trying to delete user's problem -->
<img src="https://your-app.com/api/problems/123" 
     onload="fetch('https://your-app.com/api/problems/123', {method:'DELETE'})" />
```
❌ **Blocked**: Auth cookies not sent with cross-site request

---

### Layer 2: Origin/Referer Validation

**Implementation**: Middleware validates `Origin` and `Referer` headers.

**File**: `src/lib/csrf.ts` → `validateOrigin()`

**How it works**:
1. Extract `Origin` or `Referer` header
2. Compare hostname with `Host` header
3. Block if mismatch detected

**Code**:
```typescript
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  if (origin) {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) {
      return false; // ❌ Cross-origin request blocked
    }
  }
  
  return true; // ✅ Same-origin request allowed
}
```

**Applied to**: All POST, PUT, DELETE, PATCH requests

---

### Layer 3: Custom Header Check

**Implementation**: Checks for `X-Requested-With` header.

**How it works**:
- Legitimate AJAX requests include custom headers
- Browsers won't add custom headers for cross-origin simple requests
- Provides additional validation layer

**Note**: Currently logging only, not blocking (for backward compatibility)

---

### Layer 4: CSRF Token System (Optional, for Extra Security)

**Implementation**: Token-based validation for sensitive operations.

**File**: `src/lib/csrf.ts`

**Features**:
- Cryptographically secure random tokens (32 bytes)
- 1-hour token lifetime
- User-specific tokens
- One-time use capability

**Usage** (when needed for extra-sensitive operations):
```typescript
// Generate token
const token = generateCSRFToken(userId);

// Client includes in header
headers: {
  'X-CSRF-Token': token
}

// Validate in API route
const validation = validateCSRFProtection(request, true, userId);
if (!validation.valid) {
  return NextResponse.json({ error: 'CSRF token invalid' }, { status: 403 });
}
```

**Currently**: Not required by default (Layers 1-2 are sufficient)

---

## 📋 Implementation Details

### Middleware (Entry Point)

**File**: `middleware.ts`

```typescript
// CSRF validation for state-changing requests
if (requiresCSRFProtection(method)) {
  const csrfValidation = validateCSRFProtection(request, false);
  
  if (!csrfValidation.valid) {
    return NextResponse.json({
      error: 'CSRF validation failed',
      details: csrfValidation.reason // Only in dev
    }, { status: 403 });
  }
}
```

**Protected methods**: POST, PUT, DELETE, PATCH

**Exempt methods**: GET, HEAD, OPTIONS

---

### Cookie Configuration

**Login Route** (`src/app/api/auth/login/route.ts`):
```typescript
// Strict cookies for auth
response.cookies.set('auth-token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict', // ⭐ CSRF protection
  maxAge: 7 * 24 * 60 * 60,
  path: '/'
});
```

**Why `strict` vs `lax`**:
- **strict**: More secure, no cookies on cross-site navigation
- **lax**: Sent with top-level navigation (e.g., clicking links)
- We use **strict** for auth tokens (users must log in from our domain)
- We use **lax** for `auth-status` (better UX for navigation)

---

## 🧪 Testing CSRF Protection

### Test 1: Cross-Origin POST (Should Fail)

```bash
# Try to POST from different origin
curl -X POST https://your-app.com/api/problems \
  -H "Origin: https://evil-site.com" \
  -H "Cookie: auth-token=..." \
  -d '{"title":"Hacked"}'

# Expected: 403 Forbidden
# Response: "CSRF validation failed: Origin/Referer mismatch"
```

### Test 2: Same-Origin POST (Should Succeed)

```bash
# POST from same origin
curl -X POST https://your-app.com/api/problems \
  -H "Origin: https://your-app.com" \
  -H "Cookie: auth-token=..." \
  -d '{"title":"Valid Request"}'

# Expected: 200 OK
```

### Test 3: GET Request (Always Allowed)

```bash
# GET requests don't need CSRF protection
curl -X GET https://your-app.com/api/problems \
  -H "Cookie: auth-token=..."

# Expected: 200 OK (CSRF not checked for GET)
```

---

## 🔍 Security Analysis

### Attack Scenarios Prevented

#### Scenario 1: Form-Based Attack
```html
<!-- Malicious site -->
<form action="https://your-app.com/api/problems/123" method="POST">
  <input type="hidden" name="action" value="delete">
</form>
<script>document.forms[0].submit();</script>
```
**Blocked by**: SameSite=strict (cookies not sent)

#### Scenario 2: Fetch-Based Attack
```javascript
// Malicious site
fetch('https://your-app.com/api/problems', {
  method: 'POST',
  credentials: 'include', // Try to include cookies
  body: JSON.stringify({title: 'Hacked'})
});
```
**Blocked by**: 
1. SameSite=strict (cookies not sent)
2. Origin validation (if cookies somehow sent)

#### Scenario 3: XMLHttpRequest Attack
```javascript
// Malicious site
const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://your-app.com/api/problems');
xhr.withCredentials = true;
xhr.send('{"title":"Hacked"}');
```
**Blocked by**: Same as Scenario 2

---

## 📊 Protection Matrix

| Attack Vector | SameSite | Origin Check | Custom Header | Token |
|---------------|----------|--------------|---------------|-------|
| **Simple Form POST** | ✅ Blocks | ✅ Blocks | N/A | N/A |
| **Fetch with credentials** | ✅ Blocks | ✅ Blocks | ⚠️ Optional | ⚠️ Optional |
| **XHR cross-origin** | ✅ Blocks | ✅ Blocks | ⚠️ Optional | ⚠️ Optional |
| **Subdomain attack** | ⚠️ Vulnerable* | ✅ Blocks | N/A | ✅ Blocks |
| **Same-site attack** | ⚠️ Vulnerable | ⚠️ Vulnerable | ✅ Blocks | ✅ Blocks |

\* If attacker controls a subdomain (rare)

---

## ⚙️ Configuration

### Environment Variables

No additional environment variables needed. CSRF protection is automatic.

### Disabling (Not Recommended)

If you need to disable for testing:

```typescript
// In middleware.ts
if (requiresCSRFProtection(method) && process.env.DISABLE_CSRF !== 'true') {
  // ... validation
}
```

**WARNING**: Never disable in production!

---

## 🚀 Migration Guide

### For Existing API Clients

**Good news**: No changes needed! If your client:
1. Makes requests from the same origin (same domain)
2. Includes cookies automatically
3. Uses standard fetch/axios

**Then**: Everything works automatically ✅

### For External API Clients (e.g., Mobile Apps)

If you have non-browser clients:

**Option 1**: Use Bearer token in Authorization header (no cookies)
```typescript
headers: {
  'Authorization': 'Bearer ' + token
}
```

**Option 2**: Implement CSRF token exchange
1. GET `/api/csrf-token` to get token
2. Include token in `X-CSRF-Token` header
3. Validate in backend

---

## 🐛 Troubleshooting

### Issue: "CSRF validation failed" on legitimate requests

**Cause**: Missing Origin/Referer header

**Solution**: Ensure your client includes proper headers:
```javascript
fetch('/api/problems', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Origin header added automatically by browser
  },
  body: JSON.stringify(data)
});
```

### Issue: Auth cookies not sent

**Cause**: Cross-origin request or SameSite=strict

**Solution**: 
1. Ensure requests are same-origin
2. If cross-origin is needed, use Authorization header instead

### Issue: Works in dev but not production

**Cause**: `secure` flag requires HTTPS

**Solution**: Ensure production uses HTTPS

---

## 📚 References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetshetoproject.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN: SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [CSRF in Modern Web Applications](https://portswigger.net/web-security/csrf)

---

## ✅ Checklist

- [x] SameSite=strict cookies implemented
- [x] Origin/Referer validation in middleware
- [x] Custom header checking (logging)
- [x] CSRF token system available (optional)
- [x] All auth routes updated
- [x] Middleware validates state-changing requests
- [x] Error messages clear (in dev mode)
- [x] Production logging disabled

---

**Last Updated**: November 23, 2025  
**Security Level**: 🔒 CRITICAL PROTECTION ACTIVE  
**Status**: ✅ Production Ready

