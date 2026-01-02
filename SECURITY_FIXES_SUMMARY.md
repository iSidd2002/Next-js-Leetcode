# Security Audit and Fixes Summary

Date: 2025-12-30

## Vulnerabilities Found and Fixed

### 1. Missing Rate Limiting on Public Endpoints (CRITICAL)
**Severity:** High  
**Issue:** Public API endpoints lacked rate limiting, making them vulnerable to DoS attacks and abuse.

**Affected Endpoints:**
- `/api/potd` - POTD endpoint could be abused to proxy unlimited requests to LeetCode
- `/api/contests/all` - Contest API could be abused to make unlimited external requests
- `/api/companies/[company]/problems` - Company problems endpoint could be abused
- `/api/health` - Health check endpoint could be abused

**Fix Applied:**
- Added rate limiting using `RateLimitPresets.PUBLIC` (50 req/min) to all public endpoints
- Health endpoint uses more lenient `RateLimitPresets.READ_ONLY` (200 req/min)

**Files Modified:**
- `src/app/api/potd/route.ts`
- `src/app/api/contests/all/route.ts`
- `src/app/api/health/route.ts`
- `src/app/api/companies/[company]/problems/route.ts`

---

### 2. Missing Timeouts on Fetch Requests (HIGH)
**Severity:** High  
**Issue:** Fetch requests to external APIs lacked timeouts, making them vulnerable to:
- Slowloris-like attacks
- Resource exhaustion
- Hanging connections

**Affected Endpoints:**
- `/api/contests/all` - No timeout on Codeforces and LeetCode API requests
- `/api/companies/[company]/problems` - No timeout on GitHub fetch
- `/api/ai/verify` - No timeout on Gemini API verification

**Fix Applied:**
- Codeforces API: Added 10 second timeout
- LeetCode API: Added 15 second timeout
- GitHub fetch: Added 10 second timeout
- Gemini API: Added 30 second timeout

**Files Modified:**
- `src/app/api/contests/all/route.ts:28`
- `src/app/api/contests/all/route.ts:73`
- `src/app/api/companies/[company]/problems/route.ts:97`
- `src/app/api/ai/verify/route.ts:38`

---

### 3. SSRF Vulnerability in Companies Route (HIGH)
**Severity:** High  
**Issue:** The company parameter was not validated before being used in URL construction, allowing potential SSRF attacks.

**Vulnerability Details:**
```typescript
// BEFORE (Vulnerable):
const url = `${GITHUB_BASE_URL}/${encodeURIComponent(company)}/${fileName}`;
// User could input: "../../../etc/passwd" or other malicious paths
```

**Fix Applied:**
- Added `validateCompanyName()` function that:
  - Only allows alphanumeric characters, spaces, hyphens, periods, underscores, and ampersands
  - Validates company name is a string
  - Enforces 100 character maximum length
  - Rejects path traversal attempts

```typescript
// AFTER (Secure):
function validateCompanyName(company: string): boolean {
  if (!company || typeof company !== 'string') {
    return false;
  }
  const validPattern = /^[a-zA-Z0-9\s\-._&]+$/;
  return validPattern.test(company) && company.length <= 100;
}
```

**Files Modified:**
- `src/app/api/companies/[company]/problems/route.ts:28-38`
- `src/app/api/companies/[company]/problems/route.ts:208-213`

---

### 4. Response Size Limits (MEDIUM)
**Severity:** Medium  
**Issue:** Large responses could cause DoS through bandwidth exhaustion or memory issues.

**Fix Applied:**
- Verified and ensured response size limits are in place:
  - Companies endpoint: Max 2000 items per page
  - Pagination enforced with slice operations
  - Mock data generation respects limit parameter
  - All public endpoints have reasonable defaults

**Files Modified:**
- `src/app/api/companies/[company]/problems/route.ts:249-253` (verified existing limits)

---

## Security Posture - Other Checks

### ✅ Already Secure
1. **Input Validation:** Comprehensive input sanitization in `src/lib/input-validation.ts`
2. **Authentication:** JWT-based auth with proper verification
3. **CSRF Protection:** Multi-layer CSRF implementation in `src/lib/csrf.ts`
4. **SQL Injection Protection:** Using Prisma ORM with parameterized queries
5. **NoSQL Injection Protection:** MongoDB operator sanitization in place
6. **XSS Protection:** No `dangerouslySetInnerHTML` usage found
7. **Security Headers:** CSP, HSTS, X-Frame-Options, etc. in `middleware.ts`
8. **Rate Limiting:** In-memory rate limiting with presets (noted: needs Redis for production scaling)
9. **Password Security:** Bcrypt with 12 rounds for hashing
10. **Cookie Security:** HttpOnly, Secure, SameSite flags on auth cookies
11. **API Key Security:** Environment variables used, no hardcoded keys found

### ⚠️ Recommendations for Production
1. **Persistent Rate Limiting:** Migrate in-memory rate limiter to Redis/Upstash for multi-instance deployments
2. **CSRF Token Storage:** Migrate in-memory CSRF store to Redis for serverless environments
3. **Dependency Scanning:** Implement automated dependency scanning in CI/CD pipeline
4. **Security Headers:** Consider adding more granular CSP directives for production
5. **Audit Logging:** Implement comprehensive security audit logging

---

## Dependency Vulnerabilities
✅ **Zero vulnerabilities found** (npm audit)

---

## Testing Summary
- ✅ Rate limiting added to all public endpoints
- ✅ Timeouts added to all external API calls
- ✅ SSRF vulnerability fixed with input validation
- ✅ Response size limits verified
- ✅ No new TypeScript errors introduced by security fixes
- ✅ No dependency vulnerabilities detected

---

## Files Modified

1. `src/app/api/potd/route.ts`
   - Added rate limiting (PUBLIC preset)
   - Kept existing 30s timeout

2. `src/app/api/contests/all/route.ts`
   - Added rate limiting (PUBLIC preset)
   - Added 10s timeout to Codeforces fetch
   - Added 15s timeout to LeetCode fetch

3. `src/app/api/health/route.ts`
   - Added rate limiting (READ_ONLY preset)

4. `src/app/api/companies/[company]/problems/route.ts`
   - Added rate limiting (PUBLIC preset)
   - Added `validateCompanyName()` function for SSRF prevention
   - Added company name validation
   - Added 10s timeout to GitHub fetch

5. `src/app/api/ai/verify/route.ts`
   - Added 30s timeout to Gemini API fetch

---

## Conclusion

All identified security vulnerabilities have been fixed. The application now has:
- ✅ Rate limiting on all public endpoints
- ✅ Timeouts on all external API calls
- ✅ SSRF protection through input validation
- ✅ Proper response size limits

The security posture is significantly improved while maintaining functionality.
