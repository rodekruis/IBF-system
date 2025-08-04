# IBF Dashboard EspoCRM Extension - Deployment Guide

This guide explains how to build, deploy, and manage the IBF Dashboard EspoCRM extension.

## Repository Information

- **Repository**: https://github.com/rodekruis/IBF-system
- **Branch**: `ibf-svelte`
- **EspoCRM Extension**: https://github.com/rodekruis/IBF-system/tree/ibf-svelte/interfaces/espocrm
- **IBF Dashboard Web Component**: https://github.com/rodekruis/IBF-system/tree/ibf-svelte/interfaces/IBF-dashboard

## Overview

The IBF Dashboard is integrated into EspoCRM as a custom extension that embeds the IBF Dashboard web component. The deployment process consists of three main steps:

1. **Build the IBF Dashboard Web Component** - Creates optimized assets for embedding
2. **Create the EspoCRM Extension** - Packages the web component and EspoCRM integration code
3. **Deploy to Virtual Machine** - Uploads and activates the extension on the target environment

## 1. Building the IBF Dashboard Web Component

### Location
```
interfaces/IBF-dashboard/
```

### Build Script
```bash
./build-web-component.sh
```

### What it does:
- Builds the Angular IBF Dashboard application in production mode
- Creates optimized, minified assets suitable for embedding
- Generates web component files that can be consumed by EspoCRM
- Outputs build artifacts to `dist/` directory
- Creates modular JavaScript bundles for efficient loading

### Key Build Outputs:
- `main.js` - Primary application bundle with web component registration
- `styles.css` - Compiled and optimized styles
- `polyfills.js` - Browser compatibility polyfills
- Various chunk files for code splitting and lazy loading

## 2. Creating the EspoCRM Extension

### Location
```
interfaces/espocrm/
```

### Create Extension Script
```bash
./create-extension.sh
```

### What it does:
- Copies the built web component assets from `interfaces/IBF-dashboard/dist/`
- Packages EspoCRM-specific integration code:
  - View controllers (`ibfdashboard.js`)
  - Authentication services (`ibf-auth.js`)
  - Extension metadata (`manifest.json`)
  - Configuration files
- Creates a versioned ZIP file: `ibf-dashboard-extension-v{version}.zip`
- Updates version number automatically

### Extension Structure:
```
ibf-dashboard-extension-v{version}.zip
├── manifest.json                           # Extension metadata
├── files/
│   └── client/custom/modules/ibf-dashboard/
│       ├── assets/                         # Web component assets
│       │   ├── main.js                     # IBF Dashboard web component
│       │   ├── styles.css                  # Component styles
│       │   └── ...                         # Additional chunks/polyfills
│       └── src/
│           ├── views/ibfdashboard.js       # EspoCRM view controller
│           └── services/ibf-auth.js        # Authentication service
```

## 3. Deployment Process

### Automated Deployment Script
```bash
./deploy-extension.sh [environment]
```

**Parameters:**
- `environment`: Either `dev` or `test`

### What the deployment script does:

1. **Build Web Component**
   ```bash
   cd interfaces/IBF-dashboard
   ./build-web-component.sh
   ```

2. **Create EspoCRM Extension**
   ```bash
   cd interfaces/espocrm
   ./create-extension.sh
   ```

3. **Upload to Virtual Machine**
   - Connects to the target VM via SSH
   - Uploads the extension ZIP file to `/tmp/`
   - Transfers deployment scripts

4. **Install on VM**
   ```bash
   ./install-extension.sh ibf-dashboard-extension-v{version}.zip
   ```

### VM Installation Process:
- Backs up current extension (if exists)
- Extracts new extension to EspoCRM directory
- Sets proper file permissions
- Clears EspoCRM cache
- Rebuilds EspoCRM metadata
- Activates the extension

## 4. Environment Credentials

All credentials are stored in **Bitwarden** under the 510 organization:

### Development Environment

**VM Access:**
- **Bitwarden Entry**: `IBF pivot crm - dev vm - ssh`
- **Purpose**: SSH access to development virtual machine
- **VM URL**: `ibf-pivot-crm-dev.510.global`

**EspoCRM Admin Access:**
- **Bitwarden Entry**: `ibf-pivot-crm-dev espocrm admin`
- **Purpose**: Admin login for EspoCRM development instance
- **Login URL**: https://ibf-pivot-crm-dev.510.global/
- **Usage**: Managing users, extensions, system configuration

### Test Environment

**VM Access:**
- **Bitwarden Entry**: `IBF pivot crm - test VM - ssh`
- **Purpose**: SSH access to test virtual machine
- **VM URL**: `ibf-pivot-crm.510.global`

**EspoCRM Admin Access:**
- **Bitwarden Entry**: `ibf pivot espocrm admin - test`
- **Purpose**: Admin login for EspoCRM test instance
- **Login URL**: https://ibf-pivot-crm.510.global/
- **Usage**: Managing users, extensions, system configuration

## 5. Manual Deployment Steps

If you need to deploy manually:

### Step 1: Build the Web Component
```bash
cd interfaces/IBF-dashboard
npm install
npm run build:prod
```

### Step 2: Create Extension
```bash
cd ../espocrm
./create-extension.sh
```

### Step 3: Upload to VM
```bash
# For development
scp ibf-dashboard-extension-v*.zip user@ibf-pivot-crm-dev.510.global:/tmp/

# For test
scp ibf-dashboard-extension-v*.zip user@ibf-pivot-crm.510.global:/tmp/
```

### Step 4: Install on VM
```bash
# SSH to VM
ssh user@ibf-pivot-crm-dev.510.global  # or test VM

# Run installation
cd /var/www/html/espocrm
sudo ./install-extension.sh /tmp/ibf-dashboard-extension-v*.zip
```

## 6. Verification

After deployment, verify the installation:

1. **Check Extension Status**
   - Login to EspoCRM admin panel
   - Go to Administration → Extensions
   - Verify IBF Dashboard extension is installed and enabled

2. **Test Functionality**
   - Navigate to IBF Dashboard tab
   - Verify web component loads correctly
   - Check that authentication works
   - Confirm country selection respects user settings

3. **Check Logs**
   - Browser console for JavaScript errors
   - EspoCRM logs: `/var/www/html/espocrm/data/logs/`
   - Web server logs: `/var/log/apache2/` or `/var/log/nginx/`

## 7. Troubleshooting

### Common Issues:

**Extension not showing up:**
- Check file permissions: `sudo chown -R www-data:www-data /var/www/html/espocrm/`
- Clear cache: `sudo rm -rf /var/www/html/espocrm/data/cache/*`
- Rebuild: Access Admin → Rebuild in EspoCRM

**Web component not loading:**
- Check asset files in `/client/custom/modules/ibf-dashboard/assets/`
- Verify browser console for 404 errors
- Ensure proper MIME types for JavaScript files

**Authentication issues:**
- Verify JWT token generation in browser network tab
- Check IBF API connectivity
- Confirm user has proper country access

**Country selection not working:**
- Check IBF settings configuration
- Verify user has access to expected countries
- Review browser console for country selection logs

## 8. Development Workflow

For ongoing development:

1. **Make changes** to either:
   - IBF Dashboard Angular application (`interfaces/IBF-dashboard/`)
   - EspoCRM integration code (`interfaces/espocrm/`)

2. **Test locally** using development servers

3. **Build and deploy** to development environment:
   ```bash
   ./deploy-extension.sh dev
   ```

4. **Test on development VM**

5. **Deploy to test environment** when ready:
   ```bash
   ./deploy-extension.sh test
   ```

6. **Production deployment** follows same pattern with production credentials

## 9. Version Management

- Extension versions are automatically incremented in `create-extension.sh`
- Each deployment creates a new versioned ZIP file
- Previous versions are preserved for rollback capability
- Version history is maintained in the extension manifest

## 10. Security Considerations

- **SSH Keys**: Use SSH key authentication for VM access
- **Credentials**: Never commit credentials to repository
- **HTTPS**: All communication uses HTTPS/TLS encryption
- **JWT Tokens**: Short-lived tokens for API authentication
- **File Permissions**: Proper web server permissions on VM
- **Access Control**: User-based country access restrictions
