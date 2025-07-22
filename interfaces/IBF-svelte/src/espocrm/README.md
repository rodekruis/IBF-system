# EspoCRM IBF Dashboard Extension

A comprehensive EspoCRM extension that integrates the IBF (Impact-Based Forecasting) Dashboard directly into EspoCRM as a full-page application with advanced authentication and user management capabilities.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Architecture](#architecture)
5. [User Management](#user-management)
6. [Migration Guide](#migration-guide)
7. [Configuration](#configuration)
8. [Development](#development)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)
11. [Security](#security)

## 🎯 Overview

This extension creates a dedicated IBF Dashboard page in EspoCRM instead of using a dashlet. The dashboard appears as a full-page tab in the EspoCRM navigation with the standard EspoCRM header and integrated authentication.

### Key Benefits
- ✅ **Seamless Integration**: Native EspoCRM page with standard navigation
- ✅ **Advanced User Management**: Dedicated IBF user entity with fine-grained permissions
- ✅ **Automatic Authentication**: Single sign-on between EspoCRM and IBF
- ✅ **Scalable Architecture**: Clean separation of concerns with proper MVC structure
- ✅ **Production Ready**: Comprehensive error handling and security measures

## ✨ Features

### Core Functionality
- **Full-Page Dashboard**: Native EspoCRM integration (not an iframe dashlet)
- **IBF User Entity**: Dedicated entity for managing IBF-specific user data
- **Permission System**: Country and disaster-type level access control
- **Token-Based Authentication**: Secure authentication flow with EspoCRM
- **Admin Interface**: Complete CRUD interface for managing IBF users

### User Management Features
- **Automatic User Creation**: Option to auto-create IBF users from EspoCRM users
- **Manual User Management**: Admin interface for adding/editing IBF users
- **Permission Control**: Fine-grained access control by country and disaster type
- **User Mapping**: Link EspoCRM users to IBF credentials
- **Audit Trail**: Track user access and authentication events

## 🚀 Installation

### Option 1: Extension Package (Recommended)

1. **Create Extension Package**:
   ```bash
   # On Linux/Mac:
   ./deploy-extension.ps1
   
   # On Windows:
   .\deploy-extension.ps1
   ```

2. **Install via EspoCRM**:
   - Go to **Administration > Extensions**
   - Click **"Upload"** and select the generated `ibf-dashboard-extension-vX.X.X.zip`
   - Click **"Install"**
   - Clear cache and rebuild

### Option 2: Manual Installation

Deploy individual files to your EspoCRM installation:

```
espocrm/
├── client/custom/modules/ibf-dashboard/
│   ├── src/controllers/ibfdashboard.js
│   ├── src/views/dashlets/ibf-dashboard.js
│   └── src/views/ibfdashboard.js
├── custom/Espo/Modules/IBFDashboard/
│   ├── Controllers/IBFDashboard.php
│   ├── Controllers/IBFUser.php
│   ├── Resources/metadata/
│   └── Resources/layouts/
└── application/Espo/Modules/IBFDashboard/
    └── Resources/metadata/app/routes.json
```

## 🏗️ Architecture

### New Architecture (Current)

```
EspoCRM User Authentication
├── IBFUser Entity (Dedicated IBF Data)
├── IBFDashboard Controller (Authentication & Token Management)
├── IBF Dashboard Page (Full EspoCRM Integration)
└── Frontend Svelte App (Embedded with Authentication)
```

### Key Components

#### 1. **IBFUser Entity**
- Dedicated entity for IBF-specific user data
- Fields: email, password, allowed_countries, allowed_disaster_types
- Linked to EspoCRM User entity via user_id field
- Admin interface for user management

#### 2. **IBFDashboard Controller**
- Handles authentication between EspoCRM and IBF API
- Manages token validation and user verification
- Provides endpoints for user management
- Implements security controls and logging

#### 3. **Client-Side Components**
- **Controller**: `ibfdashboard.js` - Main dashboard controller
- **View**: `ibfdashboard.js` - Dashboard view with iframe integration
- **Dashlet**: `ibf-dashboard.js` - Optional dashlet version

#### 4. **Metadata Configuration**
- Route definitions for dashboard access
- Entity definitions for IBFUser
- Layout configurations for admin interface
- Client definitions for UI behavior

## 👥 User Management

### IBFUser Entity Fields

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | Link | Reference to EspoCRM User |
| `email` | Email | IBF API email credential |
| `password` | Password | IBF API password |
| `allowed_countries` | MultiEnum | Permitted countries (ETH, UGA, etc.) |
| `allowed_disaster_types` | MultiEnum | Permitted disaster types |
| `is_active` | Boolean | User active status |
| `auto_created` | Boolean | Was user auto-created |

### Administration Interface

Access via **Administration > IBF Users**:

- **List View**: See all IBF users with their permissions
- **Detail View**: View individual user settings and access history
- **Edit View**: Modify user permissions and credentials
- **Create View**: Add new IBF users manually

### User Creation Options

1. **Automatic Creation**: System creates IBF users automatically when they access the dashboard
2. **Manual Creation**: Admins create IBF users explicitly through the interface
3. **Migration**: Existing users can be migrated from legacy User entity fields

## 🔄 Migration Guide

### From Legacy User Fields to IBFUser Entity

If you're upgrading from a previous version that stored IBF credentials directly in the User entity:

#### 1. **Pre-Migration Checklist**
- [ ] Backup your EspoCRM database
- [ ] Install the updated extension
- [ ] Clear cache and rebuild

#### 2. **Run Migration Query**
```sql
INSERT INTO ibf_user (id, user_id, email, password, allowed_countries, allowed_disaster_types, is_active, auto_created, created_at, modified_at)
SELECT 
    CONCAT('ibf-', id) as id,
    id as user_id,
    c_ibf_email as email,
    c_ibf_password as password,
    '["ETH","UGA","ZMB","KEN"]' as allowed_countries,
    '["drought","floods","heavy-rainfall"]' as allowed_disaster_types,
    1 as is_active,
    0 as auto_created,
    NOW() as created_at,
    NOW() as modified_at
FROM user 
WHERE c_ibf_email IS NOT NULL 
AND c_ibf_email != ''
AND NOT EXISTS (SELECT 1 FROM ibf_user WHERE user_id = user.id);
```

#### 3. **Verify Migration**
- Go to **Administration > IBF Users**
- Verify all users are present with correct permissions
- Test dashboard access for migrated users

#### 4. **Clean Up (Optional)**
After confirming successful migration:
```sql
ALTER TABLE user DROP COLUMN c_ibf_email;
ALTER TABLE user DROP COLUMN c_ibf_password;
```

## ⚙️ Configuration

### Extension Settings

Configure via **Administration > Settings** or directly in configuration files:

```php
// data/config.php
'ibfDashboardUrl' => 'https://your-ibf-dashboard.azurestaticapps.net',
'ibfApiUrl' => 'https://api.ibf-system.org',
'ibfAutoCreateUsers' => true,
'ibfDefaultCountries' => ['ETH', 'UGA', 'ZMB'],
'ibfDefaultDisasterTypes' => ['drought', 'floods', 'heavy-rainfall']
```

### Security Configuration

```php
// custom/Espo/Modules/IBFDashboard/Controllers/IBFDashboard.php
protected $allowedOrigins = [
    'https://your-ibf-dashboard.azurestaticapps.net',
    'https://your-domain.com'
];

protected $tokenExpiryMinutes = 60;
protected $maxTokensPerUser = 3;
```

### Frontend Integration

Configure the embedded Svelte dashboard:

```javascript
// Dashboard URL construction
const dashboardUrl = `${Config.ibfDashboardUrl}?espoAuth=true&espoToken=${token}&espoUserId=${userId}`;

// Authentication parameters
const authParams = {
    espoAuth: true,
    espoToken: this.getAuthToken(),
    espoUserId: this.getUser().id
};
```

## 🛠️ Development

### Local Development Setup

1. **EspoCRM Setup**:
   ```bash
   # Install EspoCRM locally
   # Enable developer mode
   php command.php rebuild
   ```

2. **Extension Development**:
   ```bash
   # Link development files
   ln -s /path/to/extension/files /path/to/espocrm/
   
   # Watch for changes
   npm run dev:watch
   ```

3. **Frontend Development**:
   ```bash
   # Start Svelte dev server
   cd /path/to/ibf-svelte
   npm run dev
   
   # Update iframe URL to localhost
   dashboardUrl = 'http://localhost:5173?espoAuth=true&...'
   ```

### File Structure

```
src/espocrm/
├── files/                          # Extension files
│   ├── client/custom/modules/ibf-dashboard/
│   ├── custom/Espo/Modules/IBFDashboard/
│   └── application/Espo/Modules/IBFDashboard/
├── scripts/                        # Installation scripts
│   ├── AfterInstall.php
│   └── AfterUninstall.php
├── deploy-extension.ps1            # Build script
├── manifest.json                   # Extension manifest
└── README.md                      # This file
```

### Building Extension Package

```bash
# Windows
.\deploy-extension.ps1

# Linux/Mac  
./deploy-extension.sh
```

This creates `ibf-dashboard-extension-vX.X.X.zip` ready for installation.

## 🌐 Production Deployment

### Prerequisites

- ✅ EspoCRM 7.0+ installed
- ✅ PHP 7.4+ with required extensions
- ✅ HTTPS configured
- ✅ Database backup taken

### Deployment Steps

1. **Upload Extension**:
   - Use EspoCRM Administration > Extensions
   - Upload the extension package
   - Install and rebuild

2. **Configure Settings**:
   ```php
   'ibfDashboardUrl' => 'https://ibf-dashboard-production.azurestaticapps.net',
   'ibfApiUrl' => 'https://api.ibf-system.org/api/v1',
   'ibfAutoCreateUsers' => false,  // Disable auto-creation in production
   ```

3. **Setup User Permissions**:
   - Create role for IBF users
   - Assign permissions to IBFUser entity
   - Configure country/disaster type access

4. **Test Integration**:
   - Test user authentication
   - Verify dashboard loading
   - Check permission enforcement

### Production Checklist

- [ ] Extension installed successfully
- [ ] Dashboard URL configured correctly
- [ ] User permissions configured
- [ ] Authentication working
- [ ] Error logging enabled
- [ ] Performance monitoring active
- [ ] Backup procedures in place

## 🔧 Troubleshooting

### Common Issues

#### 1. **Dashboard Not Loading**
```javascript
// Check console for errors
console.log('Dashboard URL:', dashboardUrl);
console.log('Auth Token:', authToken);

// Verify iframe access
document.querySelector('iframe').contentWindow.postMessage('test', '*');
```

#### 2. **Authentication Failures**
```php
// Check EspoCRM logs
tail -f data/logs/espo.log | grep IBF

// Verify token generation
error_log('IBF Token: ' . $token);
error_log('User ID: ' . $userId);
```

#### 3. **Permission Errors**
- Verify user has access to IBFUser entity
- Check role permissions for IBF Dashboard
- Confirm user is in correct team/role

#### 4. **Extension Installation Issues**
```bash
# Clear all caches
rm -rf data/cache/*
php command.php rebuild

# Check file permissions
chmod -R 755 custom/
chown -R www-data:www-data custom/
```

### Debug Mode

Enable debug logging:

```php
// In controller
protected $debug = true;

// Log authentication attempts
$this->getContainer()->get('log')->info('IBF Auth attempt for user: ' . $userId);
```

### Performance Optimization

```php
// Cache tokens to reduce API calls
protected $tokenCache = [];

// Optimize database queries
protected $entityManager->getQueryBuilder()
    ->select(['id', 'email', 'allowedCountries'])
    ->from('IBFUser')
    ->where(['userId' => $userId])
    ->build();
```

## 🔒 Security

### Authentication Flow

1. **User Access**: EspoCRM user navigates to IBF Dashboard
2. **Token Generation**: Controller generates signed authentication token
3. **Dashboard Loading**: Frontend receives token via URL parameters
4. **Token Validation**: Dashboard validates token with EspoCRM API
5. **IBF Authentication**: Dashboard authenticates with IBF API using user credentials
6. **Session Management**: Secure session established with appropriate permissions

### Security Measures

- ✅ **Token-based authentication** with expiration
- ✅ **Origin validation** for iframe security
- ✅ **HTTPS enforcement** for all communications
- ✅ **Input sanitization** and validation
- ✅ **Error handling** without information disclosure
- ✅ **Audit logging** for security events

### Security Configuration

```php
// Token security
protected $tokenAlgorithm = 'HS256';
protected $tokenExpiry = 3600; // 1 hour
protected $tokenRefreshThreshold = 300; // 5 minutes

// Origin validation
protected $allowedOrigins = [
    'https://your-dashboard.azurestaticapps.net'
];

// Rate limiting
protected $maxRequestsPerMinute = 60;
protected $maxTokensPerUser = 3;
```

---

## 📞 Support

For issues and questions:

1. **Check Logs**: EspoCRM logs in `data/logs/espo.log`
2. **Debug Mode**: Enable debug logging in controller
3. **Browser Console**: Check for JavaScript errors
4. **Network Tab**: Verify API calls and responses

## 🚀 Version History

- **v1.0**: Initial dashlet implementation
- **v2.0**: Full-page dashboard with basic auth
- **v3.0**: IBFUser entity and advanced permissions
- **v3.1**: Production deployment optimizations
- **v3.2**: Enhanced security and error handling

---

*This documentation covers the complete EspoCRM IBF Dashboard Extension. For the frontend IBF Svelte Dashboard documentation, see the main README.md file.*
└── Handles routing and view initialization

client/custom/src/views/ibf-dashboard.js  
├── Main view logic for the IBF Dashboard page
├── Handles authentication token retrieval
├── Manages iframe loading and fullscreen functionality
└── Integrates with EspoCRM authentication system

client/custom/src/views/dashlets/ibf-dashbboard.js
├── Legacy dashlet view (if you still want dashlet functionality)
└── Contains iframe integration for dashboard widgets

client/custom/res/templates/ibf-dashboard.tpl
├── HTML template for the IBF Dashboard page
├── Includes fullscreen controls and responsive design
└── Styled to integrate seamlessly with EspoCRM UI
```

#### Server-side Metadata Files:
```
application/Espo/Custom/Resources/metadata/app/navbar.json
├── Adds "IBF Dashboard" to the main navigation menu
└── Configures icon, color, and URL routing

application/Espo/Custom/Resources/metadata/app/routes.json
├── Defines URL routing for #IbfDashboard
└── Maps routes to controllers and actions

application/Espo/Custom/Resources/metadata/clientDefs/IbfDashboard.json
├── Client-side configuration for IBF Dashboard entity
├── Defines which controller and views to use
└── Sets access control requirements

application/Espo/Custom/Resources/i18n/en_US/Global.json
├── English language definitions
└── Provides translatable labels for the IBF Dashboard
```

#### Backend PHP Files:
```
custom/Espo/Custom/Controllers/ibfAuth.php
├── Backend controller for IBF authentication integration
└── Handles token validation and user authentication

custom/Espo/Custom/Resources/metadata/dashlets/IbfDashboard.json
├── Dashlet metadata (for legacy dashlet functionality)
└── Defines dashlet configuration options

custom/Espo/Custom/Resources/routes.json
├── Backend API routing configuration
└── Maps API endpoints to controller methods
```

### Manual Installation Steps:

1. Copy all files maintaining the exact directory structure to your EspoCRM root directory
2. Clear EspoCRM cache: Administration > Clear Cache
3. The "IBF Dashboard" menu item should appear automatically

## Extension Package Structure

This extension follows EspoCRM's standard extension package format with:

- **manifest.json**: Extension metadata and version information
- **client/**: Frontend JavaScript files, templates, and resources  
- **application/**: Backend metadata and configuration files
- **custom/**: Backend PHP controllers and additional resources

## Features

- **Full-page IBF Dashboard**: Takes up the entire content area with EspoCRM header
- **Navigation Integration**: Appears as a main menu item in EspoCRM navigation
- **Fullscreen Mode**: Toggle button to expand dashboard to full browser window
- **EspoCRM Authentication**: Seamlessly uses EspoCRM user tokens for authentication
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Iframe Integration**: Loads external IBF dashboard with proper authentication
- **Permission Control**: Integrates with EspoCRM's role and permission system

## Configuration

### Dashboard URL Configuration

Update the IBF dashboard URL in `client/custom/src/views/ibf-dashboard.js`:

```javascript
loadDashboard: function () {
    this.getUserToken().then(token => {
        const dashboardUrl = 'https://your-ibf-dashboard-url.com'; // Update this URL
        const userId = this.getUser().id;
        const iframeUrl = `${dashboardUrl}?espoToken=${token}&espoUserId=${userId}`;
        // ...
    });
}
```

### Navigation Menu Customization

Edit `application/Espo/Custom/Resources/metadata/app/navbar.json` to customize:

- **Menu position**: Change the order in the tabs array
- **Icon**: Update `iconClass` (e.g., `"fas fa-chart-area"`, `"fas fa-analytics"`)
- **Color**: Update `color` (e.g., `"#e74c3c"`, `"#3498db"`)
- **Label**: Update `label` for different display name

```json
{
    "tabs": [
        {
            "name": "IbfDashboard",
            "label": "IBF Dashboard",
            "url": "#IbfDashboard", 
            "iconClass": "fas fa-chart-line",
            "color": "#2c3e50"
        }
    ]
}
```

## Access Control & Permissions

After installation, configure user permissions:

1. Go to **Administration > Roles**
2. Edit the roles that should access the IBF Dashboard
3. Add permissions for **"IbfDashboard"** scope:
   - **Read**: Allow users to view the dashboard
   - **Create/Edit/Delete**: Not applicable for this extension

## Troubleshooting

### Dashboard not loading
- **Check browser console** for authentication or loading errors
- **Verify IBF dashboard URL** is accessible and configured correctly
- **Test authentication tokens** by checking network requests in browser dev tools

### Menu item not appearing  
- **Clear cache**: Administration > Clear Cache, or run `php clear_cache.php`
- **Check file permissions**: Ensure web server can read all extension files
- **Verify file locations**: Confirm all files are in correct directories

### Permission denied errors
- **Check user roles**: Ensure user has access to "IbfDashboard" scope
- **Review EspoCRM logs**: Check `data/logs/` for permission-related errors

### Iframe loading issues
- **CORS configuration**: Ensure IBF dashboard allows iframe embedding
- **X-Frame-Options**: Verify target dashboard doesn't block iframe loading
- **Network connectivity**: Test direct access to IBF dashboard URL

## URL Structure & Access

- **Main page**: `https://your-espocrm.com/#IbfDashboard`
- **Iframe loads**: `https://your-ibf-dashboard.com?espoToken={token}&espoUserId={userId}`
- **Fullscreen mode**: Activated via button, uses same iframe URL

## Development & Customization

### Adding new features
- Modify `client/custom/src/views/ibf-dashboard.js` for frontend functionality
- Update `custom/Espo/Custom/Controllers/ibfAuth.php` for backend authentication
- Edit `client/custom/res/templates/ibf-dashboard.tpl` for UI changes

### Testing changes
1. Clear EspoCRM cache after modifications
2. Hard refresh browser (Ctrl+F5) to reload client-side changes
3. Check browser console for JavaScript errors

### Creating updates
1. Increment version in `manifest.json`
2. Re-package extension using the provided scripts
3. Install new version through Administration > Extensions
