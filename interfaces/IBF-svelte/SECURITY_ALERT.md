# 🚨 SECURITY ALERT: Exposed Credentials

## CRITICAL ISSUE FOUND

The IBF Svelte app was exposing sensitive credentials in the client-side bundle:

- **Email**: `dunant@redcross.nl`
- **Password**: `sqgIF1Gm3b1M3ChWljP9lkuwJBAn1FcQ`

## IMMEDIATE ACTIONS TAKEN

1. ✅ Removed credentials from `.env.local`
2. ✅ Switched to mock data mode
3. ✅ Documented security vulnerability

## REQUIRED FIXES

### 1. **Revoke Compromised Credentials**
- The exposed password should be changed immediately
- Any systems using these credentials need new authentication

### 2. **Never Put Secrets in VITE_* Variables**
```bash
# ❌ NEVER DO THIS - Gets embedded in bundle
VITE_API_PASSWORD=secret123

# ✅ DO THIS - Backend only
API_PASSWORD=secret123
```

### 3. **Proper Architecture for Authentication**

#### Option A: Backend Proxy (Recommended)
```
Frontend → Your Backend → IBF API
         (handles auth)
```

#### Option B: Client-Side OAuth Flow
```
Frontend → IBF OAuth → Get Token → Use Token
```

### 4. **Environment Variable Security**

```bash
# .env.local (for development)
VITE_API_URL=https://your-backend.com/api
VITE_USE_MOCK_DATA=true

# .env.production (server-side only)
IBF_API_EMAIL=your-email@domain.com
IBF_API_PASSWORD=your-secure-password
```

## IMPACT ASSESSMENT

### What Was Exposed:
- IBF API login credentials
- Production-ready access tokens
- Potentially sensitive user data access

### Who Could Access:
- Anyone visiting the website
- Web crawlers and search engines
- Browser dev tools users
- Cached CDN content

## RECOMMENDED SOLUTION

Create a secure backend authentication service:

```typescript
// Backend endpoint (Node.js/Express)
app.post('/api/ibf-auth', async (req, res) => {
  // Server-side credentials (safe)
  const token = await ibfApi.login(
    process.env.IBF_API_EMAIL, 
    process.env.IBF_API_PASSWORD
  );
  
  // Return token to frontend
  res.json({ token });
});

// Frontend (Svelte)
const token = await fetch('/api/ibf-auth')
  .then(r => r.json())
  .then(data => data.token);
```

## PREVENTION CHECKLIST

- [ ] Never use `VITE_*` for sensitive data
- [ ] Use backend proxy for API authentication
- [ ] Audit all environment variables
- [ ] Implement proper token refresh
- [ ] Use HTTPS everywhere
- [ ] Monitor for credential exposure
- [ ] Regular security reviews

**This vulnerability affects the iframe integration security and EspoCRM deployment readiness.**
