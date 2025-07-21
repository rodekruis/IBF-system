# EspoCRM IBF Dashboard Extension

This extension creates a dedicated IBF Dashboard page in EspoCRM instead of using a dashlet. The dashboard appears as a full-page tab in the EspoCRM navigation with the standard EspoCRM header.

## Installation Options

### Option 1: Install as Extension Package (Recommended)

1. Run the packaging script to create the extension:
   ```bash
   # On Linux/Mac:
   ./create-extension.sh
   
   # On Windows:
   .\create-extension.ps1
   ```

2. Upload the generated `ibf-dashboard-extension.zip` file through EspoCRM:
   - Go to Administration > Extensions
   - Click "Upload" and select the zip file
   - Click "Install"

### Option 2: Manual File Installation

The files in this directory structure are organized exactly as they should appear in your EspoCRM installation:

#### Client-side Files (Frontend):
```
client/custom/src/controllers/ibf-dashboard.js
├── Custom controller for the IBF Dashboard page
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
