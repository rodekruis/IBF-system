# Deployment & Testing Guide

## 🚀 Production Deployment

### 1. Build for Production

```bash
# Install dependencies
npm install

# Build with security optimizations
npm run build:secure

# Preview production build
npm run preview
```

### 2. Environment Setup

Create production environment file:

```bash
# .env.production
VITE_API_BASE_URL=https://api.ibf-system.org
VITE_AZURE_CLIENT_ID=your-production-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_EMBED_ALLOWED_ORIGINS=https://your-espocrm.com,https://backup-espocrm.com
VITE_REQUIRE_AUTH=true
VITE_VALIDATE_JWT=true
VITE_CSP_FRAME_ANCESTORS=https://your-espocrm.com
```

### 3. Server Configuration

#### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name ibf-dashboard.com;
    
    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # CSP Header
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://login.microsoftonline.com; connect-src 'self' https://login.microsoftonline.com https://api.ibf-system.org; frame-ancestors 'self' https://your-espocrm.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';" always;
    
    # Static files
    location / {
        root /var/www/ibf-dashboard/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass https://api.ibf-system.org;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Docker Deployment

```dockerfile
# Dockerfile.production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:secure

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
```

## 🧪 Security Testing

### 1. Authentication Testing

```javascript
// tests/security/auth.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../src/lib/services/auth.js';

describe('Authentication Security', () => {
  beforeEach(() => {
    authService.clearTokens();
    sessionStorage.clear();
  });

  it('should reject invalid JWT tokens', async () => {
    const invalidToken = 'invalid.jwt.token';
    const result = await authService.validateToken(invalidToken);
    expect(result).toBe(false);
  });

  it('should validate token expiration', async () => {
    const expiredToken = createExpiredJWT();
    const result = await authService.validateToken(expiredToken);
    expect(result).toBe(false);
  });

  it('should enforce origin validation', () => {
    const maliciousOrigin = 'https://malicious-site.com';
    const result = authService.isValidOrigin(maliciousOrigin);
    expect(result).toBe(false);
  });

  it('should handle token refresh properly', async () => {
    const validToken = createValidJWT();
    await authService.setToken(validToken);
    
    // Simulate token near expiry
    const refreshed = await authService.refreshTokenIfNeeded();
    expect(refreshed).toBe(true);
  });
});
```

### 2. Security Header Testing

```bash
# Test CSP headers
curl -I https://ibf-dashboard.com | grep -i content-security-policy

# Test CORS configuration
curl -H "Origin: https://malicious-site.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://ibf-dashboard.com/api/test

# Test SSL configuration
nmap --script ssl-enum-ciphers -p 443 ibf-dashboard.com
```

### 3. Penetration Testing Script

```bash
#!/bin/bash
# security-test.sh

echo "🔍 Starting security tests..."

# Test 1: XSS Prevention
echo "Testing XSS prevention..."
curl -X POST "https://ibf-dashboard.com/api/test" \
     -H "Content-Type: application/json" \
     -d '{"test": "<script>alert('xss')</script>"}' \
     -w "Status: %{http_code}\n"

# Test 2: SQL Injection (if applicable)
echo "Testing SQL injection prevention..."
curl "https://ibf-dashboard.com/api/data?id=1'; DROP TABLE users; --" \
     -w "Status: %{http_code}\n"

# Test 3: CSRF Protection
echo "Testing CSRF protection..."
curl -X POST "https://ibf-dashboard.com/api/action" \
     -H "Origin: https://malicious-site.com" \
     -w "Status: %{http_code}\n"

# Test 4: Authentication bypass
echo "Testing authentication bypass..."
curl "https://ibf-dashboard.com/api/admin" \
     -w "Status: %{http_code}\n"

echo "✅ Security tests completed!"
```

## 📊 Performance Testing

### 1. Load Testing

```javascript
// k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let response = http.get('https://ibf-dashboard.com');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'content size correct': (r) => r.body.length > 1000,
  });
  
  sleep(1);
}
```

### 2. Bundle Size Analysis

```bash
# Analyze bundle size
npm run build:analyze

# Check for security vulnerabilities
npm audit --audit-level moderate

# Performance audit
npx lighthouse https://ibf-dashboard.com --view
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Security audit
        run: npm audit --audit-level high
      
      - name: Run security tests
        run: npm run test:security
      
      - name: SAST scan
        uses: github/super-linter@v4
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  build-and-deploy:
    needs: security-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build production
        run: npm run build:secure
        env:
          VITE_API_BASE_URL: ${{ secrets.PROD_API_URL }}
          VITE_AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
          VITE_AZURE_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /var/www/ibf-dashboard
            git pull origin main
            npm ci
            npm run build:secure
            sudo systemctl reload nginx
```

## 🛠️ Maintenance Tasks

### Daily
```bash
# Check application logs
tail -f /var/log/nginx/access.log | grep "4[0-9][0-9]\|5[0-9][0-9]"

# Monitor authentication metrics
curl -s https://ibf-dashboard.com/health | jq '.auth_success_rate'
```

### Weekly
```bash
# Update dependencies
npm update
npm audit fix

# Certificate check
openssl x509 -in /path/to/cert.pem -text -noout | grep "Not After"
```

### Monthly
```bash
# Security scan
npm audit --audit-level moderate
nmap -sS -O ibf-dashboard.com

# Performance audit
npx lighthouse https://ibf-dashboard.com --output=html --output-path=audit-report.html
```

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Failures**
   ```bash
   # Check Azure AD configuration
   curl "https://login.microsoftonline.com/{tenant-id}/.well-known/openid_configuration"
   
   # Verify token
   echo "JWT_TOKEN" | base64 -d
   ```

2. **CORS Errors**
   ```bash
   # Test CORS configuration
   curl -H "Origin: https://your-espocrm.com" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        https://ibf-dashboard.com
   ```

3. **CSP Violations**
   ```javascript
   // Monitor CSP violations
   window.addEventListener('securitypolicyviolation', (e) => {
     console.error('CSP Violation:', e.violatedDirective, e.blockedURI);
   });
   ```

4. **Performance Issues**
   ```bash
   # Check bundle size
   ls -la dist/assets/ | grep -E "\.(js|css)$"
   
   # Monitor memory usage
   node --inspect dist/server.js
   ```

Your secure, high-performance IBF dashboard is now ready for production deployment! 🚀
