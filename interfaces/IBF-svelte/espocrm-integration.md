# EspoCRM Integration Guide

## Overview
This guide shows how to integrate the IBF Dashboard as a dashlet in EspoCRM with token-based authentication.

## Authentication Flow
1. EspoCRM generates a user token and gets the user ID
2. EspoCRM embeds the IBF dashboard in an iframe with both token and user ID as URL parameters
3. IBF dashboard validates the token against EspoCRM's custom API endpoint
4. If valid, user is automatically authenticated; if not, user must login normally

## Step-by-Step Implementation

### Step 1: Create Custom Dashlet in EspoCRM

Create a file `custom/Espo/Custom/Resources/metadata/dashlets/IbfDashboard.json`:

```json
{
    "view": "custom:views/dashlets/ibf-dashboard",
    "aclScope": "User",
    "entityType": "User",
    "options": {
        "fields": {
            "title": {
                "type": "varchar",
                "required": true
            },
            "autorefreshInterval": {
                "type": "enumFloat",
                "options": [0, 0.5, 1, 2, 5, 10]
            }
        },
        "defaults": {
            "title": "IBF Dashboard"
        },
        "layout": [
            {
                "rows": [
                    [{"name": "title"}],
                    [{"name": "autorefreshInterval"}]
                ]
            }
        ]
    }
}
```

### Step 2: Create Dashlet View

Create a file `client/custom/src/views/dashlets/ibf-dashboard.js`:

```javascript
define('custom:views/dashlets/ibf-dashboard', ['views/dashlets/abstract/base'], function (Dep) {
    
    return Dep.extend({

        name: 'IbfDashboard',

        templateContent: `
            <style>
                .dashlet-container,
                .dashlet,
                .dashlet-body {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .dashlet-body iframe {
                    flex: 1;
                    width: 100%;
                    border: none;
                }

                #dashlet-{{id}} .panel-heading {
                    display: none;
                }

                #dashlet-{{id}} .dashlet-body {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                #dashlet-{{id}} .dashlet-body iframe {
                    flex: 1;
                    width: 100%;
                    border: none;
                }
            </style>

            <div class="dashlet-body">
                <iframe 
                    id="ibf-dashboard-frame" 
                    src="{{iframeUrl}}" 
                    style="width: 100%; height: 100%; border: none;"
                    frameborder="0"
                    allowfullscreen 
                    allow="fullscreen">
                </iframe>
            </div>
        `,

        init: function () {
            Dep.prototype.init.call(this);
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            this.loadDashboard();
        },

        loadDashboard: function () {
            // Get user token and user ID
            this.getUserToken().then(token => {
                const dashboardUrl = 'https://ibf-pivot.510.global';
                const userId = this.getUser().id;
                const iframeUrl = `${dashboardUrl}?espoToken=${token}&espoUserId=${userId}`;
                
                // Update iframe src
                const iframe = this.$el.find('#ibf-dashboard-frame');
                iframe.attr('src', iframeUrl);
            }).catch(error => {
                console.error('Failed to load IBF Dashboard:', error);
                this.$el.find('.dashlet-body').html('<p>Failed to load dashboard</p>');
            });
        },

        getUserToken: function () {
            return new Promise((resolve, reject) => {
                const authToken = this.getUser().get('token') || 
                                 this.getStorage().get('user', 'auth-token') ||
                                 this.getCookie('auth-token');
                
                if (authToken) {
                    resolve(authToken);
                    return;
                }

                reject(new Error('No authentication token available'));
            });
        },

        getCookie: function(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        }
    });
});
```

### Step 3: Create Custom Token Validation Controller

Create a file `custom/Espo/Custom/Controllers/IbfAuth.php`:

```php
<?php

namespace Espo\Custom\Controllers;

use Espo\Core\Controllers\Base;
use Espo\Core\Api\Request;
use Espo\Core\ORM\EntityManager;

class IbfAuth extends Base
{
    private EntityManager $entityManager;

    public function __construct(EntityManager $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function actionTest(): array
    {
        return ['status' => 'Route working', 'timestamp' => date('Y-m-d H:i:s')];
    }

    public function actionValidateToken(Request $request): array
    {
        try {
            // Handle both GET and POST safely
            if ($request->getMethod() === 'POST') {
                $rawData = $request->getParsedBody();
                $token = $rawData->token ?? null;
                $userId = $rawData->userId ?? null;
            } else {
                $queryParams = $request->getQueryParams();
                $token = $queryParams['token'] ?? null;
                $userId = $queryParams['userId'] ?? null;
            }
            
            if (!$token || !$userId) {
                return [
                    'valid' => false,
                    'error' => 'Token and userId are required'
                ];
            }
            
            // Validate the token by checking if it exists, is active, and belongs to the specified user
            $authToken = $this->entityManager
                ->getRDBRepository('AuthToken')
                ->where([
                    'token' => $token,
                    'userId' => $userId,
                    'isActive' => true
                ])
                ->findOne();
            
            if (!$authToken) {
                return [
                    'valid' => false,
                    'error' => 'Invalid token or token does not belong to specified user'
                ];
            }
            
            return ['valid' => true];
            
        } catch (\Exception $e) {
            return [
                'valid' => false,
                'error' => 'Validation failed: ' . $e->getMessage()
            ];
        }
    }

    public function postActionValidateToken(Request $request): array
    {
        return $this->actionValidateToken($request);
    }

    public function getActionValidateToken(Request $request): array
    {
        return $this->actionValidateToken($request);
    }
}
```

### Step 4: Register the Custom API Route

Create a file `custom/Espo/Custom/Resources/routes.json`:

```json
[
    {
        "route": "/test",
        "method": "GET",
        "params": {
            "controller": "IbfAuth",
            "action": "test"
        },
        "noAuth": true
    },
    {
        "route": "/IbfAuth/action/validateToken",
        "method": "GET",
        "params": {
            "controller": "IbfAuth",
            "action": "validateToken"
        },
        "noAuth": true
    },
    {
        "route": "/IbfAuth/action/validateToken",
        "method": "POST",
        "params": {
            "controller": "IbfAuth",
            "action": "validateToken"
        },
        "noAuth": true
    }
]
```

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

// Test with real data
fetch(`/api/v1/IbfAuth/action/validateToken?token=${app.getUser().get('token')}&userId=${app.getUser().get('id')}`)
.then(response => response.json())
.then(data => console.log('Real Token Test:', data));
// Should return: {"valid": true}
```

## ✅ IBF Dashboard Integration

The IBF-svelte app is already configured to handle EspoCRM authentication automatically:

### Authentication Flow
1. **URL Parameter Detection**: App checks for `espoToken` and `espoUserId` parameters
2. **Token Validation**: Calls `https://crm.510.global/api/v1/IbfAuth/action/validateToken?token={token}&userId={userId}`
3. **Response Handling**: 
   - If `{"valid": true}` → User is automatically authenticated
   - If `{"valid": false}` → User sees normal login popup

### Configuration
The IBF dashboard is configured with:
- **Environment Variable**: `VITE_ESPOCRM_API_URL=https://crm.510.global/api/v1`
- **File**: `src/lib/services/authService.ts` (already implemented)
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

## API Endpoint Details

**Request**: `GET /api/v1/IbfAuth/action/validateToken?token={token}&userId={userId}`

**Response - Valid**:
```json
{
  "valid": true
}
```

**Response - Invalid**:
```json
{
  "valid": false,
  "error": "Invalid token or token does not belong to specified user"
}
```
