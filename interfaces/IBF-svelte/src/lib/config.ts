// Configuration service for IBF Dashboard
// Safely handles environment variables with fallbacks

interface AppConfig {
  // API Configuration
  apiUrl: string;
  geoserverUrl: string;
  useMockData: boolean;
  useIbfApi: boolean; // New flag for IBF API integration
  
  // EspoCRM Integration
  espoCrmApiUrl: string;
  
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
  // API Configuration
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:3000/api'),
  geoserverUrl: getEnvVar('VITE_GEOSERVER_URL', 'https://ibf.510.global/geoserver/ibf-system/wms'),
  useMockData: getEnvBoolean('VITE_USE_MOCK_DATA', true),
  useIbfApi: getEnvBoolean('VITE_USE_IBF_API', false), // New flag for IBF API
  
  // EspoCRM Integration
  espoCrmApiUrl: getEnvVar('VITE_ESPOCRM_API_URL', 'https://crm.510.global/api/v1'),
  
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
 * In development, use proxy to avoid CORS issues
 * In production, use the full URL directly
 */
export function getEspoCrmApiUrl(): string {
  const isDev = config.isDevelopment;
  const hostname = window.location.hostname;
  
  console.log('🔧 getEspoCrmApiUrl() debug:', {
    isDevelopment: isDev,
    hostname: hostname,
    importMetaEnvDev: import.meta.env.DEV,
    configEspoCrmApiUrl: config.espoCrmApiUrl
  });
  
  if (isDev) {
    // Use proxy during development to avoid CORS
    console.log('🔧 Using development proxy: /api/espocrm');
    return '/api/espocrm';
  }
  // In production, use the full EspoCRM API URL directly
  console.log('🔧 Using production URL:', config.espoCrmApiUrl);
  return config.espoCrmApiUrl;
}
