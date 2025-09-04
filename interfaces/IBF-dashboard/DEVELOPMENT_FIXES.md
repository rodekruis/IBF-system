# IBF Dashboard Development Setup - Fix Guide

This guide explains the fixes applied to resolve the Angular dashboard errors and how to run the application in development mode.

## Issues Fixed

### 1. NG0100 ExpressionChangedAfterItHasBeenCheckedError

**Problem**: Angular change detection error in AppComponent
**Solution**: Added OnPush change detection strategy and proper change detection handling

**Changes made**:

- Added `ChangeDetectionStrategy.OnPush` to AppComponent
- Injected `ChangeDetectorRef` service
- Updated `onLoaderChange` method to call `this.cdr.markForCheck()`
- Updated `ngOnChanges` method to trigger change detection after input changes

### 2. CORS Policy Errors

**Problem**: Browser blocking requests from localhost:4200 to https://ibf-pivot.510.global/api
**Solution**: Created proxy configuration for development

**Changes made**:

- Created `proxy.conf.json` with proxy rules for `/api/*` requests
- Created `environment.development.ts` with local API URL (`/api` instead of full external URL)
- Updated `angular.json` to use proxy configuration in serve command
- Updated package.json start script to use development configuration

### 3. Missing Ionicons

**Problem**: Console warnings for missing icons: "apps", "person", "eye"
**Solution**: Registered commonly used ionicons in main.ts

**Changes made**:

- Added ionicon imports and registration in `main.ts`
- Registered icons: apps, person, eye, information-circle-outline, arrow-forward, arrow-back, warning, close-circle

## Development Setup

### Prerequisites

- Node.js and npm installed
- Angular CLI installed globally: `npm install -g @angular/cli`

### Running the Application

1. **Install dependencies**:

   ```bash
   cd interfaces/IBF-dashboard
   npm install
   ```

2. **Start development server with proxy** (recommended):

   ```bash
   npm start
   ```

   This uses the development configuration with proxy to avoid CORS issues.

3. **Alternative: Start without proxy** (will have CORS issues):
   ```bash
   npm run serve:regular:direct
   ```

### Configuration Files

#### proxy.conf.json

Proxies `/api/*` requests to `https://ibf-pivot.510.global` to avoid CORS issues during development.

#### environment.development.ts

Development environment that uses `/api` (proxy) instead of direct external API calls.

#### Original environment.ts

Still uses direct external API URL - only use this for testing or when proxy is not needed.

### Angular Configurations

The angular.json now supports multiple configurations:

- `development`: Uses proxy and development environment
- `production`: Uses production environment and settings
- `ci`: For CI/CD environments
- `stage`: For staging environment

### Available Scripts

- `npm start`: Start with development proxy (recommended)
- `npm run serve:regular:direct`: Start without proxy (CORS issues expected)
- `npm run serve:web-component`: Serve the web component version
- `npm run serve:both`: Run both regular and web component versions
- `npm run build`: Build for development
- `npm run build:prod`: Build for production

## Troubleshooting

### If you still see CORS errors:

1. Make sure you're using `npm start` (not `ng serve` directly)
2. Check that proxy.conf.json exists in the root directory
3. Verify angular.json has the proxy configuration in the serve options

### If you see NG0100 errors:

1. The AppComponent now uses OnPush change detection
2. If you modify the component, ensure you call `this.cdr.markForCheck()` after state changes

### If you see icon warnings:

1. Icons are now registered in main.ts
2. Add any new icons to the addIcons() call in main.ts

## API Configuration

The application now supports two modes:

1. **Development mode** (`npm start`):
   - Uses proxy configuration
   - API calls go to `/api` which is proxied to external API
   - No CORS issues

2. **Direct mode** (`npm run serve:regular:direct`):
   - Makes direct calls to external API
   - Will have CORS issues unless external API supports CORS from localhost

## Notes for Production

- The proxy configuration only applies to development mode
- Production builds will use the production environment with direct API URLs
- The ChangeDetectionStrategy.OnPush improves performance in both development and production
- Ionicon registration is required for both development and production builds
