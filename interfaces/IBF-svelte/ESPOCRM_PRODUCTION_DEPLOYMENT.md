# EspoCRM Production Deployment - CORS Fixes

## Issue Description
The production deployment is experiencing CORS errors when the IBF Dashboard tries to validate tokens with the EspoCRM server:

```
Access to fetch at 'https://ibf-pivot-crm.510.global/api/v1/IbfAuth/action/validateToken?token=...&userId=...' 
from origin 'https://ibf-pivot.510.global' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause
- Preflight OPTIONS requests are not being handled properly
- CORS headers need to be set specifically for the production domain
- EspoCRM routing needs explicit OPTIONS method support

## Files to Deploy

### 1. Updated Controller: `IbfAuth.php`
**Location on EspoCRM server:** `custom/Espo/Custom/Controllers/IbfAuth.php`
**Source file:** `src/espocrm/ibfAuth.php`

**Key changes:**
- Added `getActionValidateToken()` method for explicit GET request handling
- Added `optionsActionValidateToken()` method for preflight OPTIONS requests
- Enhanced `setCorsHeaders()` with production domain whitelist
- Added proper origin checking and fallback

### 2. Updated Routes: `routes.json`
**Location on EspoCRM server:** `custom/Espo/Custom/Resources/routes.json`
**Source file:** `src/espocrm/routes.json`

**Key changes:**
- Added explicit OPTIONS route for preflight requests
- Maintains existing GET and POST routes

## Deployment Steps

### Step 1: Backup Current Files
```bash
# SSH into the EspoCRM server
ssh user@ibf-pivot-crm.510.global

# Backup current files
sudo cp /var/www/html/custom/Espo/Custom/Controllers/IbfAuth.php /var/www/html/custom/Espo/Custom/Controllers/IbfAuth.php.backup
sudo cp /var/www/html/custom/Espo/Custom/Resources/routes.json /var/www/html/custom/Espo/Custom/Resources/routes.json.backup
```

### Step 2: Deploy Updated Files
```bash
# Copy the updated controller
sudo cp /path/to/new/IbfAuth.php /var/www/html/custom/Espo/Custom/Controllers/IbfAuth.php

# Copy the updated routes
sudo cp /path/to/new/routes.json /var/www/html/custom/Espo/Custom/Resources/routes.json

# Set proper permissions
sudo chown www-data:www-data /var/www/html/custom/Espo/Custom/Controllers/IbfAuth.php
sudo chown www-data:www-data /var/www/html/custom/Espo/Custom/Resources/routes.json
sudo chmod 644 /var/www/html/custom/Espo/Custom/Controllers/IbfAuth.php
sudo chmod 644 /var/www/html/custom/Espo/Custom/Resources/routes.json
```

### Step 3: Clear EspoCRM Cache
```bash
# Clear application cache
sudo rm -rf /var/www/html/data/cache/*

# Or via EspoCRM admin panel:
# Administration → Clear Cache → Clear All
```

### Step 4: Restart Web Server (if needed)
```bash
# Restart Apache/Nginx
sudo systemctl restart apache2
# OR
sudo systemctl restart nginx
```

## Testing the Fix

### 1. Test Preflight Request
```javascript
// In browser console on https://ibf-pivot.510.global
fetch('https://ibf-pivot-crm.510.global/api/v1/IbfAuth/action/validateToken', {
    method: 'OPTIONS',
    headers: {
        'Content-Type': 'application/json'
    }
}).then(response => {
    console.log('OPTIONS response:', response.status);
    console.log('CORS headers:', response.headers.get('Access-Control-Allow-Origin'));
});
```

### 2. Test Actual Request
```javascript
// In browser console on https://ibf-pivot.510.global
fetch('https://ibf-pivot-crm.510.global/api/v1/IbfAuth/action/validateToken?token=test&userId=test', {
    method: 'GET',
    headers: {
        'Accept': 'application/json'
    }
}).then(response => response.json())
.then(data => console.log('API response:', data))
.catch(error => console.error('Error:', error));
```

## Expected Results After Deployment

1. **No CORS errors** in the browser console
2. **Successful preflight requests** with proper CORS headers
3. **Working authentication flow** in production
4. **Console logs** showing the GET method being used

## Key CORS Headers Set

- `Access-Control-Allow-Origin: https://ibf-pivot.510.global`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept`
- `Access-Control-Allow-Credentials: true`

## Rollback Plan

If issues occur:
```bash
# Restore backup files
sudo cp /var/www/html/custom/Espo/Custom/Controllers/IbfAuth.php.backup /var/www/html/custom/Espo/Custom/Controllers/IbfAuth.php
sudo cp /var/www/html/custom/Espo/Custom/Resources/routes.json.backup /var/www/html/custom/Espo/Custom/Resources/routes.json

# Clear cache
sudo rm -rf /var/www/html/data/cache/*

# Restart web server
sudo systemctl restart apache2
```

## Monitoring

After deployment, monitor:
1. EspoCRM logs: `/var/www/html/data/logs/`
2. Web server error logs: `/var/log/apache2/error.log` or `/var/log/nginx/error.log`
3. Browser console for CORS errors
4. Authentication success rate in IBF Dashboard

## Next Steps

Once deployed and tested:
1. Verify authentication works in production
2. Test user creation/login flow
3. Monitor for any remaining errors
4. Document any additional configuration needed
