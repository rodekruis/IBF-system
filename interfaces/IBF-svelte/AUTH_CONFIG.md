# Authentication Configuration

## 🔓 **Authentication is DISABLED by Default**

The IBF Dashboard is configured to run **without authentication** for development and testing purposes.

### Current Settings:
- ✅ **Authentication: DISABLED**
- ✅ **Mock Data: ENABLED** 
- ✅ **Debug Mode: ENABLED**

### Configuration Files:

#### `.env.local` (Current Active Settings)
```bash
VITE_DISABLE_AUTHENTICATION=true
VITE_USE_MOCK_DATA=true
VITE_DEBUG_MODE=true
VITE_SHOW_DEBUG_PANEL=true
```

### To Enable Authentication (if needed later):

1. **Update `.env.local`:**
   ```bash
   VITE_DISABLE_AUTHENTICATION=false
   VITE_AZURE_CLIENT_ID=your-client-id
   VITE_AZURE_TENANT_ID=your-tenant-id
   VITE_AZURE_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

2. **Restart the development server:**
   ```bash
   npm run dev
   ```

### Status Indicators:
- 🔓 **"Auth Disabled"** badge appears when authentication is disabled
- ✅ **"Running"** badge shows the app is working
- 🔧 **Debug Panel** shows API connectivity (can be hidden by setting `VITE_SHOW_DEBUG_PANEL=false`)

### Troubleshooting Azure AD Errors:
If you encounter Azure AD errors like `AADSTS90102: 'redirect_uri' value must be a valid absolute URI`, authentication is automatically disabled to prevent blocking the interface.

The interface works fully without authentication using mock data services.
