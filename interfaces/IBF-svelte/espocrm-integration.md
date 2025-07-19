# EspoCRM Integration Guide

## Overview
This guide shows how to integrate the IBF Dashboard as a dashlet in EspoCRM with token-based authentication.

## Authentication Flow
1. EspoCRM generates a user token and gets the user ID
2. EspoCRM embeds the IBF dashboard in an iframe with both token and user ID as URL parameters
3. IBF dashboard validates the token against EspoCRM's custom API endpoint
4. EspoCRM controller:
   - Validates the EspoCRM token and user ID
   - Checks if user has IBF credentials (ibfEmail/ibfPassword)
   - If no IBF credentials: Creates new IBF user automatically using emailAddress
   - If IBF credentials exist: Authenticates with IBF API using stored credentials
   - Returns IBF API token for dashboard authentication
5. If successful, user is automatically authenticated with IBF token; if not, user must login normally

## Step-by-Step Implementation

### Step 1: Create Custom Dashlet in EspoCRM

Create a file `custom/Espo/Custom/Resources/metadata/dashlets/IbfDashboard.json`:
Use file src/espocrm/IbfDashboard.json

### Step 2: Create Dashlet View

Create a file `client/custom/src/views/dashlets/ibf-dashboard.js`:
Use file in src/espocrm/ibf-dashboard.js

### Step 3: Create Custom Token Validation Controller (Enhanced with Comprehensive Logging)

Create a file `custom/Espo/Custom/Controllers/IbfAuth.php`:
Use file in src/espocrm/IbfAuth.php

### Step 4: Register the Custom API Route

Create a file `custom/Espo/Custom/Resources/routes.json`:
Use file in src/espocrm/routes.json


**Important**: The `"noAuth": true` parameter bypasses EspoCRM's standard authentication requirements for this endpoint.

### Step 5: Clear Cache and Test

1. **Clear EspoCRM cache**: Go to Administration > Clear Cache
2. **Test the endpoint**: Navigate to your EspoCRM and open browser console (F12)
3. **Run test**:
```javascript
// Test with invalid data
fetch('/api/v1/IbfAuth/action/validateToken?token=test&userId=test')
.then(response => response.json())
.then(data => console.log('Test Result:', data));
// Should return: {"valid": false, "error": "Invalid token or token does not belong to specified user"}

// Test with real data (automatically creates IBF user if needed)
fetch(`/api/v1/IbfAuth/action/validateToken?token=${app.getUser().get('token')}&userId=${app.getUser().get('id')}`)
.then(response => response.json())
.then(data => console.log('Real Token Test:', data));
// Should return: {"valid": true, "ibfToken": "actual_ibf_token_here"}
// Note: On first run, this will create a new IBF user automatically
```

## Required EspoCRM Configuration

### Custom Fields for User Entity (Optional)

These custom fields can be added to the User entity in EspoCRM for manual management:

1. **IBF Email** (`ibfEmail`)
   - Type: Email
   - Required: No (auto-populated with emailAddress if empty)
   - Label: "IBF System Email"

2. **IBF Password** (`ibfPassword`)
   - Type: Text (Encrypted)
   - Required: No (auto-generated if empty)
   - Label: "IBF System Password"

### Automatic User Setup Process

The system now automatically handles IBF user creation:

1. **First Access**: When a user first accesses the IBF dashboard through EspoCRM:
   - System checks if `ibfEmail` and `ibfPassword` fields exist and are populated
   - If not, automatically creates a new IBF user with:
     - Email: User's `emailAddress` from EspoCRM
     - Password: Auto-generated 20-character secure password
     - Username: User's `userName` or email if username is empty
     - Name: User's `firstName` and `lastName` from EspoCRM
   - Saves the generated credentials to the EspoCRM user record
   - Returns the IBF API token immediately

2. **Subsequent Access**: For users with existing IBF credentials:
   - Uses stored `ibfEmail` and `ibfPassword` to authenticate with IBF API
   - Returns fresh IBF API token on each validation

### Manual User Setup (Alternative)

If you prefer manual control:

1. **Create IBF Account**: Manually create user account in IBF system
2. **Configure EspoCRM User**: Add the IBF credentials to the EspoCRM user record
3. **Test Integration**: Verify the token validation works correctly

## ✅ IBF Dashboard Integration

The IBF-svelte app is already configured to handle EspoCRM authentication automatically:

### Authentication Flow
1. **URL Parameter Detection**: App checks for `espoToken` and `espoUserId` parameters
2. **Token Validation**: Calls `https://ibf-pivot-crm.510.global/api/v1/IbfAuth/action/validateToken?token={token}&userId={userId}`
3. **Response Handling**: 
   - If `{"valid": true}` → User is automatically authenticated
   - If `{"valid": false}` → User sees normal login popup

### Fullscreen Functionality
The dashlet includes built-in fullscreen capabilities:

1. **EspoCRM Dashlet Fullscreen**: 
   - Floating "⛶ Fullscreen" button in the top-right of the dashlet
   - Creates a fullscreen overlay within EspoCRM
   - Escape key or close button to exit
   - Maintains authentication state

2. **IBF App Native Fullscreen**:
   - Floating fullscreen button in the IBF app (top-right corner)
   - Works across domains/subdomains within iframe
   - Responsive design for all screen sizes
   - Browser native fullscreen API support

### Configuration
The IBF dashboard is configured with:
- **Environment Variable**: `VITE_ESPOCRM_API_URL=https://ibf-pivot-crm.510.global/api/v1`
- **File**: `src/lib/services/authService.ts` (already implemented)
- **Fullscreen Component**: `src/lib/components/FullscreenButton.svelte` (cross-domain compatible)
- **Fallback**: Azure Static Web Apps authentication if EspoCRM validation fails

## Deployment Instructions

1. **Deploy EspoCRM files**:
   - Copy dashlet metadata and view files to your EspoCRM installation
   - Copy controller and routes files to custom directory
   - Clear EspoCRM cache

2. **Add Dashlet to Dashboard**:
   - Login to EspoCRM
   - Go to your dashboard
   - Click "Add Dashlet"
   - Select "IBF Dashboard"
   - Configure title and refresh interval

3. **Test Integration**:
   - The IBF dashboard should load automatically in the dashlet
   - User should be authenticated without additional login
   - Test fullscreen functionality:
     - Click "⛶ Fullscreen" button in dashlet for EspoCRM fullscreen
     - Click fullscreen icon in IBF app for native browser fullscreen
     - Both should work seamlessly across domains

## URL Parameters

The IBF dashboard accepts these authentication parameters:

- `espoToken` - EspoCRM user token
- `espoUserId` - EspoCRM user ID (required for token validation)
- `token` - Alternative parameter name for the token
- `userId` - Alternative parameter name for the user ID

Example: `https://ibf-pivot.510.global?espoToken=abc123token&espoUserId=614da7c0e68dba891`

## Security Considerations

1. **Two-Parameter Validation**: Validates both token and userId for security
2. **Token Activity Check**: Validates that the token is active and not expired
3. **User Verification**: Confirms token belongs to the specified user
4. **Minimal Data Exposure**: Only returns validation status, no user information
5. **HTTPS Only**: Always use HTTPS for token transmission
6. **No Authentication Required**: The validation endpoint uses `noAuth: true` because it validates authentication tokens
7. **Cross-Domain Fullscreen**: Fullscreen functionality works securely across domains via iframe permissions

## Fullscreen Implementation Details

### EspoCRM Dashlet Fullscreen
- **Method**: CSS overlay within EspoCRM interface
- **Activation**: "⛶ Fullscreen" button in dashlet
- **Features**: 
  - Escape key support
  - Click-outside-to-close (close button)
  - Prevents body scrolling when active
  - Resource efficient (iframe src copying)

### IBF App Native Fullscreen  
- **Method**: Browser Fullscreen API
- **Activation**: Floating fullscreen button in app
- **Cross-Domain Support**: Works in iframes with proper permissions
- **Responsive**: Adapts button size for mobile devices
- **Fallback**: Document fullscreen if iframe fullscreen fails

### Technical Implementation
```javascript
// EspoCRM Dashlet Methods
openFullscreen()  // Shows overlay, copies iframe src
closeFullscreen() // Hides overlay, cleans up resources

// IBF Svelte Component
FullscreenButton.svelte // Handles cross-domain fullscreen requests
```

## API Endpoint Details

**Request**: `GET /api/v1/IbfAuth/action/validateToken?token={token}&userId={userId}`

**Response - Valid with IBF Token**:
```json
{
  "valid": true,
  "ibfToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response - Invalid**:
```json
{
  "valid": false,
  "error": "Invalid token or token does not belong to specified user"
}
```

**Response - IBF User Creation Failed**:
```json
{
  "valid": false,
  "error": "Failed to retrieve IBF API token"
}
```

### Behavior Details

1. **Existing IBF User**: If user has `ibfEmail` and `ibfPassword` fields populated:
   - Authenticates with IBF API using stored credentials
   - Returns fresh IBF token on success

2. **New IBF User**: If user lacks IBF credentials:
   - Creates new IBF user automatically using EspoCRM `emailAddress`
   - Generates secure 20-character password
   - Saves credentials to EspoCRM user record
   - Returns IBF token from user creation response

3. **Error Handling**: If any step fails:
   - Logs detailed error messages to EspoCRM error log
   - Returns `valid: false` with error description

## Troubleshooting

### WebSocket Mixed Content Errors

If you see console errors like:
```
Mixed Content: The page at 'https://ibf-pivot-crm.510.global' was loaded over HTTPS, but attempted to connect to the insecure WebSocket endpoint 'ws://localhost:8080/'. This request has been blocked; this content must be served over HTTPS.
```

This is a browser security restriction that prevents WebSocket connections over unsecured `ws://` protocol from HTTPS pages. Here are the solutions based on [EspoCRM's official WebSocket documentation](https://docs.espocrm.com/administration/websocket/):

#### Solution 1: Configure SSL WebSocket Proxy (Recommended)

**For Apache (if using Apache web server):**

1. Enable required Apache modules:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_wstunnel
```

2. Add to your Apache SSL VirtualHost configuration (`<VirtualHost _default_:443>`):
```apache
<IfModule proxy_module>
  ProxyRequests Off
  <Location /wss>
       ProxyPass ws://your-domain:8080
       ProxyPassReverse ws://your-domain:8080
  </Location>
</IfModule>
```

**For Nginx (if using Nginx web server):**

1. Add to your main nginx configuration file (usually `/etc/nginx/nginx.conf`) **inside the `http` block but outside any `server` block**:
```nginx
http {
    # ... existing http configuration ...
    
    # WebSocket upgrade mapping - MUST be in http block
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }

    # WebSocket upstream - MUST be in http block
    upstream websocket {
        server 127.0.0.1:8080;
    }
    
    # ... rest of http configuration ...
}
```

2. Add to your **server block** (in your site configuration or inside the `http` block):
```nginx
server {
    # ... existing server configuration ...
    
    location /wss {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 12h;
    }
    
    # ... rest of server configuration ...
}
```

3. **For Docker/Container setups**, create or modify your Nginx configuration file to have this structure:
```nginx
# /etc/nginx/espocrm.conf or your main config file
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # WebSocket configuration - MUST be here in http block
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }

    upstream websocket {
        server 127.0.0.1:8080;
    }
    
    server {
        listen 80;
        server_name ibf-pivot-crm.510.global;
        
        # Your existing EspoCRM configuration...
        
        # WebSocket proxy location
        location /wss {
            proxy_pass http://websocket;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_read_timeout 12h;
        }
    }
}
```

4. Configure EspoCRM to use the secure WebSocket URL by adding to your EspoCRM `data/config.php`:
```php
'webSocketUrl' => 'wss://ibf-pivot-crm.510.global/wss',
```

5. **Test and reload Nginx configuration**:
```bash
# Test configuration syntax
nginx -t

# If test passes, reload configuration
nginx -s reload
# or for Docker: docker-compose restart espocrm-nginx
```

#### Solution 2: Enable Built-in SSL WebSocket Server

If you prefer to use EspoCRM's built-in SSL WebSocket server, configure these parameters in `data/config.php`:

```php
'webSocketUseSecureServer' => true,
'webSocketPort' => '8443',
'webSocketSslCertificateFile' => '/path/to/certificate.crt',
'webSocketSslCertificateLocalPrivateKey' => '/path/to/private.key',
'webSocketSslCertificatePassphrase' => 'your_passphrase_if_any',
'webSocketSslAllowSelfSigned' => false,
```

#### Solution 3: Disable WebSocket (Quick Fix)

If WebSocket functionality is not critical for your use case:

1. Go to **Administration > Settings**
2. Find **"Use WebSocket"** option  
3. Set it to **"No"**
4. Save settings

#### Solution 4: WebSocket Daemon Configuration

Ensure the WebSocket daemon is properly configured and running:

1. Create systemd service file `/etc/systemd/system/espocrm-websocket.service`:
```ini
[Unit]
Description=EspoCRM WebSocket Service
Requires=mysql.service
After=mysql.service
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=5
User=www-data
ExecStart=/usr/bin/php /path/to/espocrm/websocket.php
StandardError=/path/to/espocrm/data/logs/websocket.log

[Install]
WantedBy=default.target
```

2. Enable and start the service:
```bash
systemctl enable espocrm-websocket.service
systemctl start espocrm-websocket.service
```

#### Testing WebSocket Configuration

After implementing SSL WebSocket configuration:

1. Clear EspoCRM cache: **Administration > Clear Cache**
2. Open browser console (F12) on your EspoCRM instance  
3. Check for WebSocket connection errors
4. Look for successful WebSocket connection messages

**Note**: The WebSocket error is an EspoCRM internal issue and does not affect the IBF Dashboard functionality, which is working correctly on the custom domain. Choose **Solution 1 (SSL Proxy)** for the most robust implementation.

### Custom Field Setup Issues

If the IBF authentication controller reports missing custom fields:

1. **Check Field Creation**: Go to **Administration > Entity Manager > User**
2. **Add Custom Fields** if missing:
   - `ibfEmail` (Type: Email, Label: "IBF System Email")
   - `ibfPassword` (Type: Text Encrypted, Label: "IBF System Password")
3. **Clear Cache**: **Administration > Clear Cache**
4. **Test Again**: Try the authentication flow

### Logging and Debugging

To monitor the IBF authentication process:

1. **Enable EspoCRM Logging**: **Administration > Settings > Enable Logging**
2. **Set Log Level**: Set to "DEBUG" for detailed information
3. **Check Logs**: **Administration > Logs** - Look for `[IBF-AUTH]` prefixed messages
4. **Review Process**: The enhanced controller logs every step of the authentication process

### Common Error Messages

- **"No token available from auth service"**: Check that EspoCRM token validation is working
- **"Custom field 'ibfEmail' does not exist"**: Create the required custom fields
- **"IBF API login failed"**: Check IBF API connectivity and user credentials
- **"Failed to save IBF credentials"**: Verify custom fields exist and are writable

### Nginx Configuration Errors

#### Error: `nginx: [emerg] "map" directive is not allowed here`

This error occurs when the `map` directive is placed in the wrong location. The `map` directive **must** be in the `http` block, not in a `server` block.

**Incorrect configuration:**
```nginx
server {
    # This is WRONG - map cannot be here
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }
}
```

**Correct configuration:**
```nginx
http {
    # This is CORRECT - map must be here
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }
    
    upstream websocket {
        server 127.0.0.1:8080;
    }
    
    server {
        # Server configuration here
        location /wss {
            proxy_pass http://websocket;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_read_timeout 12h;
        }
    }
}
```

**For Docker environments:**
1. Check your Nginx configuration file structure
2. Ensure `map` and `upstream` directives are in the `http` block
3. Restart the container: `docker-compose restart espocrm-nginx`
4. Check logs: `docker-compose logs espocrm-nginx`
