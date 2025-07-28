// Authentication service for IBF dashboard - supports both Azure AD and IBF API
import { writable, get } from 'svelte/store';
import { ibfApiService } from './ibfApi';

// Authentication state
export const isAuthenticated = writable(false);
export const currentUser = writable<User | null>(null);
export const authToken = writable<string | null>(null);
export const authError = writable<string | null>(null);
export const isLoggingIn = writable(false);

interface AzureADConfig {
  clientId: string;
  tenantId: string;
  redirectUri: string;
  scopes: string[];
}

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  country?: string;
  permissions: string[];
}

interface TokenValidationResponse {
  valid: boolean;
  user?: User;
  error?: string;
}

class AuthService {
  private config: AzureADConfig;
  private tokenValidationCache = new Map<string, { valid: boolean; timestamp: number }>();

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
      tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
      redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI,
      scopes: (import.meta.env.VITE_AZURE_SCOPES || 'openid profile email').split(' ')
    };
  }

  /**
   * Initialize authentication from EspoCRM context
   * Called when dashboard loads in iframe
   */
  async initializeFromParent(): Promise<boolean> {
    try {
      // Check if we're in embedded mode
      if (window.parent === window) {
        return await this.handleStandaloneAuth();
      }

      // Request authentication token from EspoCRM parent
      return await this.requestTokenFromParent();
    } catch (error) {
      console.error('Authentication initialization failed:', error);
      authError.set('Failed to initialize authentication');
      return false;
    }
  }

  /**
   * Request JWT token from EspoCRM parent window
   */
  private async requestTokenFromParent(): Promise<boolean> {
    return new Promise((resolve) => {
      // Listen for auth response from parent
      const messageHandler = async (event: MessageEvent) => {
        if (!this.isValidOrigin(event.origin)) {
          console.warn('Received message from unauthorized origin:', event.origin);
          return;
        }

        if (event.data.type === 'IBF_AUTH_TOKEN') {
          window.removeEventListener('message', messageHandler);
          
          const success = await this.handleTokenFromParent(event.data.token);
          resolve(success);
        } else if (event.data.type === 'IBF_AUTH_ERROR') {
          window.removeEventListener('message', messageHandler);
          authError.set(event.data.error || 'Authentication failed');
          resolve(false);
        }
      };

      window.addEventListener('message', messageHandler);

      // Request token from parent (EspoCRM)
      window.parent.postMessage({
        type: 'IBF_REQUEST_AUTH',
        data: {
          origin: window.location.origin,
          scopes: this.config.scopes
        }
      }, '*');

      // Timeout after 10 seconds
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        authError.set('Authentication timeout');
        resolve(false);
      }, 10000);
    });
  }

  /**
   * Handle JWT token received from EspoCRM
   */
  private async handleTokenFromParent(token: string): Promise<boolean> {
    if (!token) {
      authError.set('No authentication token received');
      return false;
    }

    try {
      // Validate token with Azure AD
      const validation = await this.validateAzureADToken(token);
      
      if (validation.valid && validation.user) {
        authToken.set(token);
        currentUser.set(validation.user);
        isAuthenticated.set(true);
        authError.set(null);
        
        // Store token securely (with expiration)
        this.storeTokenSecurely(token);
        
        return true;
      } else {
        authError.set(validation.error || 'Token validation failed');
        return false;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      authError.set('Token validation failed');
      return false;
    }
  }

  /**
   * Validate JWT token with Azure AD
   */
  private async validateAzureADToken(token: string): Promise<TokenValidationResponse> {
    // Check cache first (valid for 5 minutes)
    const cached = this.tokenValidationCache.get(token);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return { valid: cached.valid };
    }

    try {
      // Validate with Azure AD
      const response = await fetch(
        `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/userinfo`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Azure AD validation failed: ${response.status}`);
      }

      const userInfo = await response.json();
      
      // Validate token claims
      if (!this.validateTokenClaims(userInfo)) {
        return { valid: false, error: 'Invalid token claims' };
      }

      // Map Azure AD user to IBF user
      const user: User = {
        id: userInfo.sub || userInfo.oid,
        email: userInfo.email || userInfo.preferred_username,
        name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`,
        roles: userInfo.roles || [],
        permissions: this.mapRolesToPermissions(userInfo.roles || [])
      };

      // Cache validation result
      this.tokenValidationCache.set(token, {
        valid: true,
        timestamp: Date.now()
      });

      return { valid: true, user };
    } catch (error) {
      console.error('Azure AD token validation failed:', error);
      
      // Cache negative result for shorter time
      this.tokenValidationCache.set(token, {
        valid: false,
        timestamp: Date.now()
      });

      return { valid: false, error: error.message };
    }
  }

  /**
   * Validate token claims for security
   */
  private validateTokenClaims(claims: any): boolean {
    // Check required claims
    if (!claims.sub && !claims.oid) {
      console.error('Token missing user identifier');
      return false;
    }

    if (!claims.email && !claims.preferred_username) {
      console.error('Token missing email');
      return false;
    }

    // Check token audience (if configured)
    if (claims.aud && claims.aud !== this.config.clientId) {
      console.error('Token audience mismatch');
      return false;
    }

    // Check token expiration
    if (claims.exp && Date.now() >= claims.exp * 1000) {
      console.error('Token expired');
      return false;
    }

    return true;
  }

  /**
   * Map Azure AD roles to IBF permissions
   */
  private mapRolesToPermissions(roles: string[]): string[] {
    const rolePermissionMap: Record<string, string[]> = {
      'IBF.Admin': ['read', 'write', 'admin', 'manage_users'],
      'IBF.User': ['read', 'write'],
      'IBF.Viewer': ['read'],
      'EspoCRM.User': ['read'] // Default for EspoCRM users
    };

    const permissions = new Set<string>();
    
    roles.forEach(role => {
      const rolePerms = rolePermissionMap[role];
      if (rolePerms) {
        rolePerms.forEach(perm => permissions.add(perm));
      }
    });

    // Default permissions if no roles matched
    if (permissions.size === 0) {
      permissions.add('read');
    }

    return Array.from(permissions);
  }

  /**
   * Handle standalone authentication (not in iframe)
   */
  private async handleStandaloneAuth(): Promise<boolean> {
    // Check for existing token in storage
    const storedToken = this.getStoredToken();
    if (storedToken) {
      // Determine if it's an IBF or Azure AD token and validate accordingly
      const validation = this.isIBFToken(storedToken) 
        ? await this.validateIBFToken(storedToken)
        : await this.validateAzureADToken(storedToken);
        
      if (validation.valid) {
        authToken.set(storedToken);
        currentUser.set(validation.user || null);
        isAuthenticated.set(true);
        return true;
      } else {
        this.clearStoredToken();
      }
    }

    // For standalone mode, we'll show login form instead of redirecting
    return false;
  }

  /**
   * Validate IBF API token
   */
  private async validateIBFToken(token: string): Promise<TokenValidationResponse> {
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token is expired
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return { valid: false, error: 'Token expired' };
      }

      // Map IBF token payload to User interface
      const user: User = {
        id: payload.email,
        email: payload.email,
        name: payload.firstName && payload.lastName 
          ? `${payload.firstName} ${payload.middleName || ''} ${payload.lastName}`.trim()
          : payload.email,
        roles: [payload.userRole || payload.role],
        permissions: this.mapIBFRoleToPermissions(payload.userRole || payload.role),
        country: payload.countries?.[0]
      };

      // Set the token in IBF API service for making API calls
      const expiryHours = payload.exp 
        ? Math.max(1, Math.floor((payload.exp * 1000 - Date.now()) / (1000 * 60 * 60)))
        : 24;
      ibfApiService.setToken(token, expiryHours);

      return { valid: true, user };
    } catch (error) {
      console.error('IBF token validation failed:', error);
      return { valid: false, error: 'Invalid token format' };
    }
  }

  /**
   * Redirect to Azure AD for authentication
   */
  private redirectToAzureAD(): void {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'token',
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_mode: 'fragment',
      state: this.generateState(),
      nonce: this.generateNonce()
    });

    const authUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/authorize?${params}`;
    window.location.href = authUrl;
  }

  /**
   * Generate secure random state for CSRF protection
   */
  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  /**
   * Generate secure random nonce
   */
  private generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  /**
   * Store token securely with expiration
   */
  private storeTokenSecurely(token: string): void {
    const tokenData = {
      token,
      timestamp: Date.now(),
      expires: Date.now() + (60 * 60 * 1000) // 1 hour
    };
    
    sessionStorage.setItem('ibf_auth_token', JSON.stringify(tokenData));
  }

  /**
   * Get stored token if valid
   */
  private getStoredToken(): string | null {
    try {
      const tokenData = sessionStorage.getItem('ibf_auth_token');
      if (!tokenData) return null;

      const parsed = JSON.parse(tokenData);
      if (Date.now() > parsed.expires) {
        this.clearStoredToken();
        return null;
      }

      return parsed.token;
    } catch {
      return null;
    }
  }

  /**
   * Clear stored token
   */
  private clearStoredToken(): void {
    sessionStorage.removeItem('ibf_auth_token');
  }

  /**
   * Check if origin is allowed
   */
  private isValidOrigin(origin: string): boolean {
    const allowedOrigins = import.meta.env.VITE_EMBED_ALLOWED_ORIGINS?.split(',') || [];
    return allowedOrigins.includes(origin) || origin === window.location.origin;
  }

  /**
   * Get current auth token for API calls
   */
  getAuthToken(): string | null {
    return get(authToken);
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = get(currentUser);
    return user !== null && user.permissions.includes(permission);
  }

  /**
   * Login with IBF API using email and password
   */
  async loginWithIBF(email: string, password: string): Promise<boolean> {
    try {
      isLoggingIn.set(true);
      authError.set(null);

      console.log('🔐 Attempting login to IBF API...');

      // Use the IBF API service for authentication
      const loginResponse = await ibfApiService.login(email, password);

      if (loginResponse.error || !loginResponse.data?.token) {
        throw new Error(loginResponse.error || 'Login failed - no token received');
      }

      const data: any = loginResponse.data;
      const userData = data.user || data; // Handle different response structures

      // Map IBF user to our User interface
      const user: User = {
        id: userData.email || data.email,
        email: userData.email || data.email,
        name: `${userData.firstName || data.firstName} ${userData.middleName || data.middleName || ''} ${userData.lastName || data.lastName}`.trim(),
        roles: [userData.userRole || data.userRole || 'user'],
        permissions: this.mapIBFRoleToPermissions(userData.userRole || data.userRole || 'user'),
        country: userData.countries?.[0] || data.countries?.[0] // Use first country if available
      };

      // Store authentication data
      authToken.set(data.token);
      currentUser.set(user);
      isAuthenticated.set(true);
      authError.set(null);
      
      // Store token securely
      this.storeTokenSecurely(data.token);

      // The IBF API service already has the token from the login call
      console.log('✅ IBF login successful');
      return true;

    } catch (error) {
      console.error('❌ IBF login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      authError.set(errorMessage);
      return false;
    } finally {
      isLoggingIn.set(false);
    }
  }

  /**
   * Map IBF user role to permissions
   */
  private mapIBFRoleToPermissions(role: string): string[] {
    const rolePermissionMap: Record<string, string[]> = {
      'admin': ['read', 'write', 'admin', 'manage_users'],
      'user': ['read', 'write'],
      'viewer': ['read']
    };

    return rolePermissionMap[role?.toLowerCase()] || ['read'];
  }

  /**
   * Check if current token is from IBF API (vs Azure AD)
   */
  private isIBFToken(token: string): boolean {
    try {
      // IBF tokens are JWT tokens, check if they have IBF-specific claims
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email && (payload.userRole || payload.role);
    } catch {
      return false;
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearStoredToken();
    authToken.set(null);
    currentUser.set(null);
    isAuthenticated.set(false);
    authError.set(null);
    
    // Clear IBF API token
    ibfApiService.clearToken();
    
    // Notify parent window of logout
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'IBF_LOGOUT'
      }, '*');
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<boolean> {
    if (window.parent !== window) {
      // Request new token from parent
      return await this.requestTokenFromParent();
    } else {
      // Redirect to Azure AD
      this.redirectToAzureAD();
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Initialize authentication when imported
if (typeof window !== 'undefined') {
  authService.initializeFromParent();
}
