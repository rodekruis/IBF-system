# EspoCRM Authentication Methods Guide

## Overview

When validating EspoCRM tokens in your IBF dashboard, the authentication approach depends on your EspoCRM API structure. This guide covers validation using user-specific endpoints like `/Preferences/{userId}`.

## Method 1: User-Specific Endpoint (✅ Recommended for EspoCRM)

**How it works:** Use the user's EspoCRM session token with a user-specific endpoint that the authenticated user can access.

```typescript
const response = await fetch(`${espoCRMApiUrl}/Preferences/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${userToken}`, // ← User's session token
    'Content-Type': 'application/json',
  },
});
```

**URL Parameters Required:**
- `espoToken` - User's session token  
- `espoUserId` - User's ID for endpoint construction

**When to use:** When EspoCRM doesn't have a `/User/me` endpoint but uses user-specific endpoints like `/Preferences/{userId}`, `/User/{userId}`, etc.

## Method 2: Fallback User Details

**How it works:** After validating with Preferences, try to get additional user details from the User endpoint.

```typescript
// Primary validation
const prefsResponse = await fetch(`${espoCRMApiUrl}/Preferences/${userId}`, {
  headers: { 'Authorization': `Bearer ${userToken}` }
});

// Try to get additional user details
const userResponse = await fetch(`${espoCRMApiUrl}/User/${userId}`, {
  headers: { 'Authorization': `Bearer ${userToken}` }
});
```

**When to use:** To get complete user information (name, email) after successful token validation.

## Method 2: API Key + User Token

**How it works:** Some EspoCRM instances require an additional API key for external applications.

```typescript
const response = await fetch(`${espoCRMApiUrl}/Preferences/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'X-API-KEY': `${apiKey}`, // ← Additional API key
    'Content-Type': 'application/json',
  },
});
```

**Configuration:** Add to your `.env` file:
```bash
VITE_ESPOCRM_API_KEY=your-api-key-here
```

**When to use:** When your EspoCRM requires API key authentication for external applications.

## Method 3: Custom Validation Endpoint

**How it works:** Create a custom validation endpoint in EspoCRM that accepts token and user ID.

```php
// In EspoCRM: custom/Espo/Custom/Controllers/Auth.php
class Auth extends \Espo\Core\Controllers\Base
{
    public function postActionValidateUserToken(Request $request): array
    {
        $data = $request->getParsedBody();
        $token = $data->token ?? null;
        $userId = $data->userId ?? null;
        
        // Validate token for specific user
        $authToken = $this->getEntityManager()
            ->getRDBRepository('AuthToken')
            ->where(['token' => $token, 'userId' => $userId])
            ->findOne();
            
        if ($authToken && !$authToken->get('isActive')) {
            $user = $this->getEntityManager()
                ->getEntity('User', $userId);
                
            return [
                'valid' => true,
                'user' => [
                    'id' => $user->id,
                    'userName' => $user->get('userName'),
                    'firstName' => $user->get('firstName'),
                    'lastName' => $user->get('lastName'),
                    'emailAddress' => $user->get('emailAddress')
                ]
            ];
        }
        
        return ['valid' => false];
    }
}
```

**When to use:** For maximum security and custom validation logic.

## Testing Authentication

Test the user-specific endpoint directly:

```bash
# Test the Preferences endpoint with your token and user ID
curl -X GET "https://crm.510.global/api/v1/Preferences/614da7c0e68dba891" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 2. Check CORS Configuration

Ensure EspoCRM allows requests from your dashboard domain:

```php
// In EspoCRM: data/config.php
'corsAllowedOrigins' => [
    'https://your-ibf-dashboard.com',
    'http://localhost:5173'  // For development
]
```

### 3. Check Browser Console

Look for detailed error messages in the browser console:

```javascript
// Enable detailed logging
console.log('🔍 Validating EspoCRM token with headers:', headers);
```

## Current Implementation Status

✅ **Implemented:** User-specific endpoint validation (`/Preferences/{userId}`) with fallback to `/User/{userId}`
✅ **Environment:** EspoCRM URL configured as `https://crm.510.global/api/v1`
✅ **Parameters:** Both `espoToken` and `espoUserId` supported
✅ **Fallback:** Graceful fallback to regular authentication if EspoCRM validation fails
✅ **Testing:** Test page available at `/espocrm-test.html` with user ID support

## Next Steps

1. **Test with your EspoCRM instance** using the test page with both token and user ID
2. **Use a real EspoCRM user ID** (like `614da7c0e68dba891`) and token
3. **Check which endpoints work** by examining browser network requests  
4. **Add API key if needed** by setting `VITE_ESPOCRM_API_KEY` in your environment
5. **Configure CORS** in EspoCRM if you see CORS errors
6. **Deploy and test** with real EspoCRM user tokens and user IDs

## Security Considerations

- ✅ **Token + User ID Validation:** Both parameters validated against user-specific endpoints
- ✅ **Access Control:** Users can only access their own data via user-specific endpoints
- ✅ **No Token Storage:** Tokens are only stored in memory during the session  
- ✅ **HTTPS Only:** All communication should use HTTPS in production
- ✅ **Error Handling:** Failed validations gracefully fall back to normal login
- ⚠️ **Token Expiry:** Ensure EspoCRM tokens have reasonable expiry times
- ⚠️ **CORS Setup:** Configure CORS properly to prevent unauthorized access
- ⚠️ **User ID Validation:** Ensure user IDs can't be manipulated to access other users' data
