// Azure Static Web Apps authentication service
import { config, getEspoCrmApiUrl } from '../config';
import { writable } from 'svelte/store';

// Authentication state stores
export const isAuthenticated = writable(false);
export const currentUser = writable<UserInfo | null>(null);
export const authToken = writable<string | null>(null);
export const authError = writable<string | null>(null);
export const isLoggingIn = writable(false);

export interface UserInfo {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
  claims: Record<string, any>;
  isEspoCRMUser?: boolean;
}

export interface EspoCRMTokenValidationResponse {
  valid: boolean;
  user?: {
    id: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    emailAddress?: string;
  };
  error?: string;
  ibfToken?: string;
}

export class AuthService {
  private static instance: AuthService;
  private userInfo: UserInfo | null = null;
  private espoCRMToken: string | null = null;
  private ibfApiToken: string | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async getCurrentUser(): Promise<UserInfo | null> {
    // First check if we have an EspoCRM token to validate
    const urlParams = new URLSearchParams(window.location.search);
    const espoCRMToken = urlParams.get('espoToken') || urlParams.get('token');
    const espoCRMUserId = urlParams.get('espoUserId') || urlParams.get('userId');
    
    console.log('🔍 getCurrentUser() called with URL params:', {
      hasEspoToken: !!espoCRMToken,
      hasEspoUserId: !!espoCRMUserId,
      fullUrl: window.location.href,
      isInIframe: window.self !== window.top,
      searchParams: window.location.search
    });
    
    // If we have EspoCRM parameters, prioritize EspoCRM authentication
      if (espoCRMToken && espoCRMUserId) {
        console.log('🔍 Found EspoCRM token and userId, validating...', {
          hasToken: !!espoCRMToken,
          tokenStart: espoCRMToken.substring(0, 8) + '...',
          userId: espoCRMUserId
        });
        
        // Only validate if we don't have a current token or if the token changed
        if (espoCRMToken !== this.espoCRMToken) {
          const espoCRMUser = await this.validateEspoCRMToken(espoCRMToken);
          if (espoCRMUser && espoCRMUser.valid) {
            this.espoCRMToken = espoCRMToken;
            this.userInfo = {
              identityProvider: 'EspoCRM',
              userId: espoCRMUser.user!.id,
              userDetails: espoCRMUser.user!.userName || espoCRMUser.user!.id,
              userRoles: ['user'], // You can map EspoCRM roles here
              claims: {
                name: `${espoCRMUser.user!.firstName || ''} ${espoCRMUser.user!.lastName || ''}`.trim() || 'EspoCRM User',
                email: espoCRMUser.user!.emailAddress || '',
                userName: espoCRMUser.user!.userName || '',
                espoCRMUserId: espoCRMUser.user!.id,
                espoCRMUserName: espoCRMUser.user!.userName
              },
              isEspoCRMUser: true
            };
            console.log('✅ EspoCRM authentication successful - user can access dashboard directly');
            
            // Update stores
            isAuthenticated.set(true);
            currentUser.set(this.userInfo);
            if (espoCRMUser.ibfToken) {
              authToken.set(espoCRMUser.ibfToken);
            }
            authError.set(null);
            
            return this.userInfo;
          } else {
            console.log('❌ EspoCRM token validation failed - will show login screen');
            this.espoCRMToken = null;
            this.ibfApiToken = null;
            this.userInfo = null;
            
            // Update stores
            isAuthenticated.set(false);
            currentUser.set(null);
            authToken.set(null);
            authError.set('Authentication failed');
            
            return null;
          }
        } else {
          // Token hasn't changed, return existing user info
          console.log('🔄 Using existing EspoCRM authentication');
          return this.userInfo;
       }
    } else {
      console.log('🚫 No EspoCRM parameters found in URL');
    }

    // If we already have a valid EspoCRM user, return it
    if (this.userInfo?.isEspoCRMUser && this.espoCRMToken) {
        // If we already have a valid EspoCRM user but no URL params, return it
        console.log('🔄 Returning cached EspoCRM user');
        return this.userInfo;
      }

    // Fall back to IBF backend authentication only if no EspoCRM context
    if (!this.isInEspoCRMContext()) {
      console.log('🔍 Not in EspoCRM context - checking for stored IBF authentication...');
      
      // Check if we have a stored IBF token from previous login
      const storedToken = localStorage.getItem('ibf-auth-token');
      const storedUser = localStorage.getItem('ibf-user-info');
      
      if (storedToken && storedUser) {
        try {
          const userInfo = JSON.parse(storedUser);
          console.log('🔄 Found stored IBF authentication, validating...');
          
          // Validate the stored token by making a test API call
          const isValid = await this.validateIbfToken(storedToken);
          if (isValid) {
            console.log('✅ Stored IBF token is valid');
            
            this.userInfo = userInfo;
            this.ibfApiToken = storedToken;
            
            // Update stores
            isAuthenticated.set(true);
            currentUser.set(this.userInfo);
            authToken.set(storedToken);
            authError.set(null);
            
            return this.userInfo;
          } else {
            console.log('❌ Stored IBF token is invalid, clearing...');
            localStorage.removeItem('ibf-auth-token');
            localStorage.removeItem('ibf-user-info');
          }
        } catch (error) {
          console.error('❌ Error parsing stored user info:', error);
          localStorage.removeItem('ibf-auth-token');
          localStorage.removeItem('ibf-user-info');
        }
      }
      
      // No valid stored authentication found
      console.log('🔓 No valid IBF authentication found - user needs to login');
      isAuthenticated.set(false);
      currentUser.set(null);
      authToken.set(null);
      authError.set(null); // Don't set error for unauthenticated state
      
      return null;
    } else {
      console.log('🚪 In EspoCRM context but no valid token - user needs to authenticate');
      
      // Clear stores
      isAuthenticated.set(false);
      currentUser.set(null);
      authToken.set(null);
      authError.set('Authentication required');
      
      return null;
    }
  }

  async validateIbfToken(token: string): Promise<boolean> {
    try {
      console.log('🔍 Validating IBF token...');
      
      // Make a test call to the IBF API to validate the token
      const response = await fetch('/api/ibf/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        console.log('✅ IBF token validation successful');
        return true;
      } else {
        console.log('❌ IBF token validation failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error validating IBF token:', error);
      return false;
    }
  }

  async validateEspoCRMToken(token: string): Promise<EspoCRMTokenValidationResponse | null> {
    try {
      // Get EspoCRM API URL from configuration (with proxy support)
      const espoCRMApiUrl = getEspoCrmApiUrl();
      
      // Get userId from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('espoUserId') || urlParams.get('userId');
      
      if (!userId) {
        console.error('❌ EspoCRM userId parameter is missing');
        return {
          valid: false,
          error: 'Missing userId parameter for token validation'
        };
      }

      console.log('🔍 Validating EspoCRM token with custom validation endpoint:', {
        endpoint: `/IbfAuth/action/validateToken`,
        hasToken: !!token,
        hasUserId: !!userId,
        apiUrl: espoCRMApiUrl,
        isDevelopment: config.isDevelopment
      });
      
      // Use GET request with query parameters for better compatibility
      const url = new URL(`${espoCRMApiUrl}/IbfAuth/action/validateToken`);
      url.searchParams.set('token', token);
      url.searchParams.set('userId', userId);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📡 EspoCRM API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      if (response.ok) {
        const validationData = await response.json();
        
        if (validationData.valid) {
          console.log('✅ EspoCRM token validation successful via custom endpoint');
          
          // Store the IBF token for API calls
          if (validationData.ibfToken) {
            this.ibfApiToken = validationData.ibfToken;
            console.log('🔑 IBF API token received from EspoCRM:', {
              hasToken: !!validationData.ibfToken,
              tokenLength: validationData.ibfToken?.length || 0
            });
          } else {
            console.warn('⚠️ No IBF token received in validation response');
          }
          
          // Since our API only returns validation status, create a mock user object
          return {
            valid: true,
            user: {
              id: userId,
              userName: `EspoCRM-${userId}`,
              firstName: 'EspoCRM',
              lastName: 'User',
              emailAddress: `user-${userId}@espocrm.local`
            },
            ibfToken: validationData.ibfToken
          };
        } else {
          console.error('❌ EspoCRM token validation failed:', validationData.error);
          return {
            valid: false,
            error: validationData.error
          };
        }
      } else {
        const errorText = await response.text().catch(() => 'No response body');
        console.error('❌ EspoCRM custom validation endpoint failed:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          endpoint: `/IbfAuth/action/validateToken`,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Provide more specific error messages based on status code
        let errorMessage = `Custom validation failed: ${response.status} - ${response.statusText}`;
        if (response.status === 404) {
          errorMessage = 'EspoCRM endpoint not found. Please check if the IbfAuth controller is properly installed.';
        } else if (response.status === 500) {
          errorMessage = 'EspoCRM server error. Please check the server logs.';
        } else if (response.status === 0 || response.status === 503) {
          errorMessage = 'Cannot connect to EspoCRM server. Please check network connectivity.';
        }
        
        return {
          valid: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('❌ Error validating EspoCRM token with custom endpoint:', error);
      
      // Provide specific error messages for common network issues
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Cannot connect to EspoCRM server. Please check if the server is running and CORS is properly configured.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'CORS error: Cross-origin request blocked. Please configure CORS headers on the EspoCRM server.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        valid: false,
        error: errorMessage
      };
    }
  }

  async login(): Promise<void> {
    // If we're in EspoCRM context, show error message
    if (this.isInEspoCRMContext() && !this.espoCRMToken) {
      alert('Invalid or missing authentication token from EspoCRM. Please contact your administrator.');
      return;
    }
    
    // If in EspoCRM context with valid token, no additional login needed
    if (this.isInEspoCRMContext() && this.espoCRMToken) {
      console.log('✅ Already authenticated via EspoCRM');
      return;
    }
    
    // For non-EspoCRM context, the login popup should handle the authentication
    // This method is called by the login popup after successful authentication
    console.log('🔗 Login method called - authentication should be handled by login popup');
  }

  async logout(): Promise<void> {
    console.log('🚪 Logging out...');
    
    // Clear all authentication data
    this.userInfo = null;
    this.espoCRMToken = null;
    this.ibfApiToken = null;
    
    // Clear localStorage
    localStorage.removeItem('ibf-auth-token');
    localStorage.removeItem('ibf-user-info');
    
    // Clear stores
    isAuthenticated.set(false);
    currentUser.set(null);
    authToken.set(null);
    authError.set(null);
    
    // If we're in EspoCRM context, just show a message
    if (this.isInEspoCRMContext()) {
      alert('You have been logged out. Please refresh the dashlet in EspoCRM.');
      return;
    }
    
    // For regular IBF context, just clear data (no redirect needed)
    console.log('✅ Logout successful');
  }

  isAuthenticated(): boolean {
    return this.userInfo !== null;
  }

  isInEspoCRMContext(): boolean {
    // Check if we're loaded in an iframe or have EspoCRM-specific parameters
    return window.self !== window.top || 
           new URLSearchParams(window.location.search).has('espoToken') ||
           new URLSearchParams(window.location.search).has('espoUserId') ||
           new URLSearchParams(window.location.search).has('token') ||
           new URLSearchParams(window.location.search).has('userId');
  }

  getEspoCRMToken(): string | null {
    return this.espoCRMToken;
  }

  getIbfApiToken(): string | null {
    return this.ibfApiToken;
  }

  getAuthToken(): string | null {
    // Return appropriate token based on user type
    if (this.ibfApiToken) {
      return this.ibfApiToken;
    }
    
    // If no token available, log warning
    if (this.userInfo) {
      console.warn('⚠️ No API token available - API calls may fail');
    }
    
    return null;
  }

  getUserName(): string | null {
    return this.userInfo?.userDetails || null;
  }

  getUserRoles(): string[] {
    return this.userInfo?.userRoles || [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  async loginWithIBF(email: string, password: string): Promise<boolean> {
    // If in EspoCRM context, don't allow direct login
    if (this.isInEspoCRMContext()) {
      console.warn('Direct IBF login not allowed in EspoCRM context - use EspoCRM integration');
      authError.set('Direct IBF login not supported in EspoCRM context');
      return false;
    }
    
    // Perform IBF backend authentication
    console.log('🔐 Attempting IBF backend authentication with corrected endpoint...');
    
    try {
      isLoggingIn.set(true);
      authError.set(null);
      
      // Call IBF backend login API
      const response = await fetch('/api/ibf/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (response.ok) {
        const authData = await response.json();
        
        if (authData.user && authData.user.token) {
          console.log('✅ IBF backend authentication successful');
          
          // Store authentication data
          this.ibfApiToken = authData.user.token;
          this.userInfo = {
            identityProvider: 'IBF',
            userId: authData.user.email || email, // IBF uses email as userId
            userDetails: `${authData.user.firstName || ''} ${authData.user.lastName || ''}`.trim() || authData.user.email || email,
            userRoles: [authData.user.userRole || 'user'],
            claims: {
              name: `${authData.user.firstName || ''} ${authData.user.lastName || ''}`.trim() || authData.user.email || email,
              email: authData.user.email || email,
              userName: authData.user.email || email,
              firstName: authData.user.firstName || '',
              lastName: authData.user.lastName || '',
              userRole: authData.user.userRole || 'user',
              whatsappNumber: authData.user.whatsappNumber || ''
            },
            isEspoCRMUser: false
          };
          
          // Store in localStorage for persistence
          if (this.ibfApiToken) {
            localStorage.setItem('ibf-auth-token', this.ibfApiToken);
            localStorage.setItem('ibf-user-info', JSON.stringify(this.userInfo));
          }
          
          // Update stores
          isAuthenticated.set(true);
          currentUser.set(this.userInfo);
          authToken.set(this.ibfApiToken);
          authError.set(null);
          isLoggingIn.set(false);
          
          return true;
        } else {
          console.error('❌ IBF backend authentication failed: Invalid response format');
          authError.set('Invalid response from authentication server');
          isLoggingIn.set(false);
          return false;
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Authentication failed' }));
        console.error('❌ IBF backend authentication failed:', response.status, errorData);
        
        let errorMessage = 'Authentication failed';
        if (response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (response.status === 403) {
          errorMessage = 'Account access denied';
        } else if (response.status === 429) {
          errorMessage = 'Too many login attempts. Please try again later';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        authError.set(errorMessage);
        isLoggingIn.set(false);
        return false;
      }
    } catch (error) {
      console.error('❌ IBF backend authentication error:', error);
      
      let errorMessage = 'Network error - please check your connection';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to authentication server';
        } else {
          errorMessage = error.message;
        }
      }
      
      authError.set(errorMessage);
      isLoggingIn.set(false);
      return false;
    }
  }
}

export const authService = AuthService.getInstance();
