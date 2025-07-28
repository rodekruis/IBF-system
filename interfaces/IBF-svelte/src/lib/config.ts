// Configuration service for IBF Dashboard
// Safely handles environment variables with fallbacks

interface AppConfig {
  // API Configuration - Now dynamic from EspoCRM settings
  useMockData: boolean;
  useIbfApi: boolean; // New flag for IBF API integration
  
  // Development Settings
  isDevelopment: boolean;
  debugMode: boolean;
  showDebugPanel: boolean;
  disableApiCache: boolean;
}

// Safe environment variable getter
function getEnvVar(name: keyof ImportMetaEnv, defaultValue: string = ''): string {
  return import.meta.env[name] || defaultValue;
}

function getEnvBoolean(name: keyof ImportMetaEnv, defaultValue: boolean = false): boolean {
  const value = getEnvVar(name, defaultValue.toString());
  return value === 'true' || value === '1';
}

// Application configuration with safe defaults
export const config: AppConfig = {
  // API Configuration - Now dynamic from EspoCRM settings
  useMockData: getEnvBoolean('VITE_USE_MOCK_DATA', true),
  useIbfApi: getEnvBoolean('VITE_USE_IBF_API', false), // New flag for IBF API
  
  // Development Settings - Force production mode when deployed
  isDevelopment: import.meta.env.DEV && !window.location.hostname.includes('510.global'),
  debugMode: getEnvBoolean('VITE_DEBUG_MODE', import.meta.env.DEV),
  showDebugPanel: getEnvBoolean('VITE_SHOW_DEBUG_PANEL', import.meta.env.DEV),
  disableApiCache: getEnvBoolean('VITE_DISABLE_API_CACHE', false)
};

// Log configuration in development
if (config.debugMode) {
  console.log('🔧 IBF Dashboard Configuration:', {
    useMockData: config.useMockData,
    useIbfApi: config.useIbfApi,
    isDevelopment: config.isDevelopment,
    debugMode: config.debugMode,
    showDebugPanel: config.showDebugPanel
  });
}

export default config;

/**
 * Get the appropriate EspoCRM API URL based on environment
 * Uses a consistent priority hierarchy for EspoCRM URL detection:
 * 1. URL Parameters (most reliable - passed by EspoCRM extension)  
 * 2. Browser Detection (fallback - for legacy or third-party embeds)
 * 3. Error if detection fails (no hardcoded fallback)
 */
export function getEspoCrmApiUrl(): string {
  const isDev = config.isDevelopment;
  const hostname = window.location.hostname;
  
  // Check if we're running in an iframe (likely embedded in EspoCRM)
  const isInIframe = window.self !== window.top;
  
  let detectedEspoCrmUrl: string | null = null;
  let detectionMethod: string = 'none';
  
  // PRIORITY 1: URL Parameters (Primary Method - Most Reliable)
  // This is passed by our EspoCRM extension and is the preferred method
  const urlParams = new URLSearchParams(window.location.search);
  const espoCrmBase = urlParams.get('parentUrl') || urlParams.get('espoCrmUrl') || urlParams.get('baseUrl');
  if (espoCrmBase) {
    // Decode the URL parameter in case it's encoded
    const decodedUrl = decodeURIComponent(espoCrmBase);
    detectedEspoCrmUrl = extractEspoCrmBaseUrl(decodedUrl);
    detectionMethod = 'url-parameter';
    console.log('🎯 EspoCRM URL detected from URL parameter (primary method):', {
      raw: espoCrmBase,
      decoded: decodedUrl,
      extracted: detectedEspoCrmUrl
    });
  }
  
  // PRIORITY 2: Browser Detection (Fallback Method - For Legacy/Third-party)
  // Only attempt if we're in iframe and no URL parameter was provided
  if (!detectedEspoCrmUrl && isInIframe) {
    // Method 2a: Try parent window location (often blocked by CORS)
    try {
      if (window.parent && window.parent.location) {
        const parentUrl = window.parent.location.href;
        detectedEspoCrmUrl = extractEspoCrmBaseUrl(parentUrl);
        detectionMethod = 'parent-window';
        console.log('🔍 EspoCRM URL detected from parent window (fallback):', detectedEspoCrmUrl);
      }
    } catch (e) {
      // Expected to fail due to cross-origin restrictions - continue to next method
    }
    
    // Method 2b: Check document referrer (less reliable but works cross-origin)
    if (!detectedEspoCrmUrl && document.referrer) {
      detectedEspoCrmUrl = extractEspoCrmBaseUrl(document.referrer);
      detectionMethod = 'document-referrer';
      console.log('🔍 EspoCRM URL detected from referrer (fallback):', detectedEspoCrmUrl);
    }
  }
  
  console.log('🔧 getEspoCrmApiUrl() - Detection Summary:', {
    isDevelopment: isDev,
    hostname: hostname,
    isInIframe: isInIframe,
    detectionMethod: detectionMethod,
    detectedUrl: detectedEspoCrmUrl,
    urlParameters: Object.fromEntries(urlParams.entries()),
    documentReferrer: document.referrer || 'None'
  });
  
  if (isDev) {
    // Use proxy during development to avoid CORS
    console.log('🔧 Using development proxy: /api/espocrm');
    return '/api/espocrm';
  }
  
  // PRIORITY 3: Use detected URL (Primary + Fallback methods)
  if (detectedEspoCrmUrl) {
    const apiUrl = `${detectedEspoCrmUrl}/api/v1`;
    console.log(`✅ Using auto-detected EspoCRM API URL via ${detectionMethod}:`, apiUrl);
    return apiUrl;
  }
  
  // PRIORITY 4: Final fallback - throw error since we can't determine the URL
  const errorMsg = 'Unable to determine EspoCRM API URL. No parentUrl parameter provided and iframe detection failed.';
  console.error('❌ EspoCRM URL Detection Failed:', errorMsg);
  throw new Error(errorMsg);
}

/**
 * Get the IBF Backend API URL from EspoCRM settings
 * This URL is configured through the EspoCRM admin interface
 * Returns a default for development if no URL parameters are available
 */
export function getIbfApiUrl(): string {
  const isDev = config.isDevelopment;
  
  if (isDev) {
    // Use proxy during development to avoid CORS
    console.log('🔧 Using development proxy for IBF API: /api/ibf');
    return '/api/ibf';
  }
  
  // For production, we expect the IBF backend API URL to be passed via URL parameters
  // from the EspoCRM extension which reads it from the admin settings
  const urlParams = new URLSearchParams(window.location.search);
  const ibfApiUrl = urlParams.get('ibfBackendApiUrl') || urlParams.get('ibfApiUrl');
  
  if (ibfApiUrl) {
    console.log('✅ Using IBF backend API URL from EspoCRM settings:', ibfApiUrl);
    return ibfApiUrl;
  }
  
  // If no URL parameter is available, throw an error
  const errorMsg = 'IBF Backend API URL not available. This should be configured in EspoCRM admin settings and passed via URL parameters.';
  console.error('❌ IBF API URL Configuration Missing:', errorMsg);
  throw new Error(errorMsg);
}

/**
 * Get the Geoserver URL from EspoCRM settings
 * This URL is configured through the EspoCRM admin interface and set during installation
 * Returns the URL passed via URL parameters from EspoCRM settings
 */
export function getGeoserverUrl(): string {
  const isDev = config.isDevelopment;
  
  if (isDev) {
    // Use proxy during development 
    console.log('🔧 Using development proxy for Geoserver: /api/geoserver');
    return '/api/geoserver';
  }
  
  // For production, we expect the Geoserver URL to be passed via URL parameters
  // from the EspoCRM extension which reads it from the admin settings
  const urlParams = new URLSearchParams(window.location.search);
  const geoserverUrl = urlParams.get('ibfGeoserverUrl') || urlParams.get('geoserverUrl');
  
  if (geoserverUrl) {
    console.log('✅ Using Geoserver URL from EspoCRM settings:', geoserverUrl);
    return geoserverUrl;
  }
  
  // If no URL parameter is available, throw an error
  const errorMsg = 'Geoserver URL not available. This should be configured in EspoCRM admin settings and passed via URL parameters.';
  console.error('❌ Geoserver URL Configuration Missing:', errorMsg);
  throw new Error(errorMsg);
}

/**
 * Extract the base EspoCRM URL from a full URL
 * Converts URLs like:
 * - https://ibf-pivot-crm-dev.510.global/#IBFDashboard -> https://ibf-pivot-crm-dev.510.global
 * - https://espocrm.example.com/admin#Users -> https://espocrm.example.com
 */
function extractEspoCrmBaseUrl(fullUrl: string): string | null {
  try {
    const url = new URL(fullUrl);
    
    // Remove hash and search parameters to get clean base URL
    const baseUrl = `${url.protocol}//${url.host}${url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '')}`;
    
    // Remove common EspoCRM paths from the end
    const cleanBaseUrl = baseUrl
      .replace(/\/admin$/, '')
      .replace(/\/client$/, '')
      .replace(/\/api.*$/, '')
      .replace(/\/$/, '');
    
    console.log('🔍 Extracted EspoCRM base URL:', {
      input: fullUrl,
      output: cleanBaseUrl
    });
    
    return cleanBaseUrl;
  } catch (error) {
    console.warn('❌ Failed to extract EspoCRM base URL from:', fullUrl, error);
    return null;
  }
}
