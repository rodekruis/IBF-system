# IBF Dashboard Security Implementation

## 🛡️ Security Architecture

This document outlines the comprehensive security measures implemented for the IBF Svelte dashboard when embedded in EspoCRM with Azure AD authentication.

## 🔐 Authentication Flow

### 1. Token-Based Authentication
```
EspoCRM (Azure AD) → JWT Token → IBF Dashboard → Azure AD Validation → Access Granted
```

### 2. Security Layers

| Layer | Implementation | Purpose |
|-------|---------------|---------|
| **Origin Validation** | PostMessage origin checking | Prevent unauthorized iframe parents |
| **Token Validation** | Azure AD JWT verification | Ensure valid authentication |
| **CORS Protection** | Restrictive CORS headers | Control API access origins |
| **CSP Headers** | Content Security Policy | Prevent XSS and injection attacks |
| **Iframe Sandbox** | Sandbox attributes | Limit iframe capabilities |
| **HTTPS Enforcement** | TLS 1.2+ required | Encrypt all communications |

## 🔒 Implementation Details

### Environment Security Configuration

```bash
# Authentication
VITE_AZURE_CLIENT_ID=your-app-registration-id
VITE_AZURE_TENANT_ID=your-azure-tenant-id
VITE_REQUIRE_AUTH=true
VITE_VALIDATE_JWT=true

# Origin Control
VITE_EMBED_ALLOWED_ORIGINS=https://your-espocrm.com
VITE_CSP_FRAME_ANCESTORS=https://your-espocrm.com

# Network Security
VITE_CORS_DOMAINS=https://your-espocrm.com
```

### Token Validation Process

1. **Receive Token** from EspoCRM via postMessage
2. **Cache Check** for recent validation (5min TTL)
3. **Azure AD Validation** via Microsoft Graph API
4. **Claims Verification** (audience, expiration, signature)
5. **Permission Mapping** based on Azure AD roles
6. **Secure Storage** in sessionStorage with expiration

### Authorization Matrix

| Azure AD Role | IBF Permissions | Dashboard Access |
|---------------|----------------|------------------|
| `IBF.Admin` | read, write, admin, manage_users | Full access + user management |
| `IBF.User` | read, write | Full dashboard access |
| `IBF.Viewer` | read | Read-only dashboard |
| `EspoCRM.User` | read | Basic embedded view |

## 🛠️ Security Headers

### Content Security Policy
```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://login.microsoftonline.com;
  connect-src 'self' https://login.microsoftonline.com https://api.ibf-system.org;
  frame-ancestors 'self' https://your-espocrm.com;
  img-src 'self' data: https:;
  style-src 'self' 'unsafe-inline';
```

### CORS Configuration
```javascript
{
  origin: ['https://your-espocrm.com'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}
```

### Iframe Security
```html
<iframe 
  src="https://ibf-dashboard.com"
  sandbox="allow-scripts allow-same-origin allow-forms"
  allow="fullscreen">
</iframe>
```

## 🔍 Security Monitoring

### Audit Logging
- Authentication attempts (success/failure)
- Token validation events
- Unauthorized origin attempts
- Permission violations
- API access patterns

### Error Handling
- No sensitive data in error messages
- Generic error responses for security failures
- Proper HTTP status codes
- Graceful degradation for auth failures

## 🚨 Threat Mitigation

### Cross-Site Scripting (XSS)
- **CSP headers** prevent script injection
- **Input sanitization** for all user data
- **Template escaping** in Svelte components

### Cross-Site Request Forgery (CSRF)
- **Origin validation** for postMessage
- **SameSite cookies** when applicable
- **X-Requested-With** header validation

### Clickjacking
- **X-Frame-Options** header set
- **CSP frame-ancestors** directive
- **Iframe sandbox** restrictions

### Token Hijacking
- **HTTPS-only** token transmission
- **Short token lifetime** (1 hour)
- **Secure storage** practices
- **Token refresh** mechanisms

## 🔧 Configuration Examples

### Azure AD App Registration
```json
{
  "displayName": "IBF Dashboard",
  "web": {
    "redirectUris": ["https://ibf-dashboard.com/auth/callback"],
    "implicitGrantSettings": {
      "enableAccessTokenIssuance": true,
      "enableIdTokenIssuance": true
    }
  },
  "requiredResourceAccess": [
    {
      "resourceAppId": "00000003-0000-0000-c000-000000000000",
      "resourceAccess": [
        {
          "id": "e1fe6dd8-ba31-4d61-89e7-88639da4683d",
          "type": "Scope"
        }
      ]
    }
  ]
}
```

### EspoCRM Security Settings
```php
// custom/Espo/Custom/Controllers/AzureAD.php
class AzureAD extends Base 
{
    public function beforeAction($action, $params)
    {
        // Validate user authentication
        if (!$this->getUser()->isAuthenticated()) {
            throw new Forbidden();
        }
        
        // Check Azure AD token freshness
        $tokenExpiry = $this->getUser()->get('azureAdTokenExpires');
        if ($tokenExpiry < time()) {
            throw new Unauthorized('Token expired');
        }
        
        return parent::beforeAction($action, $params);
    }
}
```

## 📋 Security Checklist

### Pre-Deployment
- [ ] Azure AD app registration configured
- [ ] HTTPS certificates installed and valid
- [ ] Environment variables set securely
- [ ] CSP headers configured
- [ ] CORS settings restrictive
- [ ] Token validation endpoints tested

### Runtime Security
- [ ] Token expiration handling
- [ ] Origin validation working
- [ ] Error handling graceful
- [ ] Audit logging active
- [ ] Performance monitoring enabled

### Regular Security Tasks
- [ ] Certificate renewal (quarterly)
- [ ] Security header audits (monthly)
- [ ] Token validation testing (weekly)
- [ ] Access log review (daily)
- [ ] Vulnerability scanning (quarterly)

## 🚨 Incident Response

### Security Event Detection
1. **Unauthorized Origin** → Log + Block + Alert
2. **Token Validation Failure** → Log + Deny Access
3. **Excessive Auth Attempts** → Rate Limit + Alert
4. **Suspicious API Patterns** → Log + Monitor

### Response Procedures
1. **Immediate** → Block malicious traffic
2. **Short-term** → Investigate and contain
3. **Medium-term** → Patch vulnerabilities
4. **Long-term** → Update security policies

## 📊 Security Metrics

### Key Performance Indicators
- Authentication success rate (target: >99%)
- Token validation time (target: <200ms)
- Security error rate (target: <0.1%)
- Certificate expiry warnings (target: 30+ days)

### Monitoring Dashboards
- Real-time authentication status
- Origin validation statistics
- Token usage patterns
- Security event timeline

This comprehensive security implementation ensures enterprise-grade protection for your IBF dashboard integration! 🛡️
