// Configuration service for IBF Dashboard
// Safely handles environment variables with fallbacks

interface AppConfig {
  // API Configuration
  apiUrl: string;
  useMockData: boolean;
  useIbfApi: boolean; // New flag for IBF API integration
  
  // IBF API Configuration - SECURITY WARNING
  ibfApiEmail: string;
  ibfApiPassword: string;
  
  // Authentication Configuration
  disableAuthentication: boolean;
  azureClientId: string;
  azureTenantId: string;
  azureRedirectUri: string;
  azureScopes: string[];
  
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

// Security warning for credentials
function warnAboutCredentials() {
  const email = getEnvVar('VITE_IBF_API_EMAIL', '');
  const password = getEnvVar('VITE_IBF_API_PASSWORD', '');
  
  if (email || password) {
    console.error('🚨 SECURITY WARNING: IBF API credentials detected in frontend!');
    console.error('❌ Frontend credentials are visible to all users');
    console.error('✅ Use backend proxy or OAuth flow instead');
    console.error('📖 See SECURITY_ALERT.md for details');
  }
}

// Application configuration with safe defaults
export const config: AppConfig = {
  // API Configuration
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:3000/api'),
  useMockData: getEnvBoolean('VITE_USE_MOCK_DATA', true),
  useIbfApi: getEnvBoolean('VITE_USE_IBF_API', false), // New flag for IBF API
  
  // IBF API Configuration - CREDENTIALS SHOULD NOT BE HERE
  ibfApiEmail: getEnvVar('VITE_IBF_API_EMAIL', ''),
  ibfApiPassword: getEnvVar('VITE_IBF_API_PASSWORD', ''),
  
  // Authentication Configuration - DISABLED BY DEFAULT
  disableAuthentication: getEnvBoolean('VITE_DISABLE_AUTHENTICATION', true),
  azureClientId: getEnvVar('VITE_AZURE_CLIENT_ID', ''),
  azureTenantId: getEnvVar('VITE_AZURE_TENANT_ID', ''),
  azureRedirectUri: getEnvVar('VITE_AZURE_REDIRECT_URI', 'http://localhost:5173/auth/callback'),
  azureScopes: getEnvVar('VITE_AZURE_SCOPES', 'openid profile email').split(' '),
  
  // Development Settings
  isDevelopment: import.meta.env.DEV || getEnvBoolean('VITE_IS_DEVELOPMENT', true),
  debugMode: getEnvBoolean('VITE_DEBUG_MODE', true),
  showDebugPanel: getEnvBoolean('VITE_SHOW_DEBUG_PANEL', true),
  disableApiCache: getEnvBoolean('VITE_DISABLE_API_CACHE', false)
};

// Log configuration in development
if (config.debugMode) {
  console.log('🔧 IBF Dashboard Configuration:', {
    useMockData: config.useMockData,
    useIbfApi: config.useIbfApi,
    disableAuthentication: config.disableAuthentication,
    isDevelopment: config.isDevelopment,
    debugMode: config.debugMode,
    showDebugPanel: config.showDebugPanel
  });
  
  // Security check
  warnAboutCredentials();
}

export default config;
