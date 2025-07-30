# IBF Dashboard Web Component v0.321.33

Built on: 2025-07-30 12:16:15

## Modular Approach
This build uses the modular approach with main.js + chunks instead of a single bundle file.

## Files included:
- web-component/browser/main.js - Main Angular web component entry point
- web-component/browser/polyfills.js - Browser polyfills  
- web-component/browser/chunk-*.js - Dynamically loaded modules (~100 chunk files)
- web-component/browser/styles.css - Component styling
- assets/ - Required assets (images, fonts, i18n translations, etc.)
- svg/ - Ionic SVG icons

## Usage:

### Basic Usage (ES6 Modules):
```html
<link rel="stylesheet" href="web-component/browser/styles.css">
<script src="web-component/browser/polyfills.js"></script>
<script type="module" src="web-component/browser/main.js"></script>

<ibf-dashboard 
  country-code="ETH" 
  platform="generic"
  api-base-url="https://ibf-api.rodekruis.nl">
</ibf-dashboard>
```

### EspoCRM Integration:
```html
<ibf-dashboard 
  country-code="ETH" 
  platform="espocrm"
  api-base-url="https://ibf-api.rodekruis.nl"
  theme="auto"
  language="en">
</ibf-dashboard>
```

### Available Attributes:
- country-code: ISO3 country code (e.g., "ETH", "KEN", "UGA")
- platform: Platform identifier ("generic", "espocrm", "dhis2")
- api-base-url: IBF API endpoint URL
- theme: "light", "dark", or "auto"
- language: Language code (e.g., "en", "es", "fr")
- features: JSON array of enabled features

## Notes:
- Chunks are loaded dynamically as needed
- All assets must be served from the same origin or properly configured
- The base href should point to the assets directory for proper asset resolution

## Version: 0.321.33
