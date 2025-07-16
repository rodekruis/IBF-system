// Azure Static Web Apps authentication service
import { config } from '../config';

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
}

export class AuthService {
  private static instance: AuthService;
  private userInfo: UserInfo | null = null;
  private espoCRMToken: string | null = null;

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
    
    if (espoCRMToken && espoCRMUserId && espoCRMToken !== this.espoCRMToken) {
      console.log('🔍 Found EspoCRM token and userId, validating...');
      const espoCRMUser = await this.validateEspoCRMToken(espoCRMToken);
      if (espoCRMUser) {
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
        console.log('✅ EspoCRM authentication successful');
        return this.userInfo;
      } else {
        console.log('❌ EspoCRM token validation failed');
        this.espoCRMToken = null;
      }
    }

    // If we already have a valid EspoCRM user, return it
    if (this.userInfo?.isEspoCRMUser && this.espoCRMToken) {
      return this.userInfo;
    }

    // Fall back to Azure Static Web Apps authentication
    try {
      const response = await fetch('/.auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.clientPrincipal) {
          this.userInfo = {
            ...data.clientPrincipal,
            isEspoCRMUser: false
          };
          return this.userInfo;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  async validateEspoCRMToken(token: string): Promise<EspoCRMTokenValidationResponse | null> {
    try {
      // Get EspoCRM API URL from configuration
      const espoCRMApiUrl = config.espoCrmApiUrl;
      
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
        apiUrl: espoCRMApiUrl
      });
      
      // Use the custom validation endpoint with both token and userId
      const response = await fetch(`${espoCRMApiUrl}/IbfAuth/action/validateToken?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const validationData = await response.json();
        
        if (validationData.valid) {
          console.log('✅ EspoCRM token validation successful via custom endpoint');
          
          // Since our API only returns validation status, create a mock user object
          return {
            valid: true,
            user: {
              id: userId,
              userName: `EspoCRM-${userId}`,
              firstName: 'EspoCRM',
              lastName: 'User',
              emailAddress: `user-${userId}@espocrm.local`
            }
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
          endpoint: `/IbfAuth/action/validateToken`
        });
        
        return {
          valid: false,
          error: `Custom validation failed: ${response.status} - ${response.statusText}`
        };
      }
    } catch (error) {
      console.error('❌ Error validating EspoCRM token with custom endpoint:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async login(): Promise<void> {
    // If user is trying to login but we're in an EspoCRM context without a valid token,
    // show an error message instead of redirecting to Azure AD
    if (this.isInEspoCRMContext() && !this.espoCRMToken) {
      alert('Invalid or missing authentication token from EspoCRM. Please contact your administrator.');
      return;
    }
    
    window.location.href = '/.auth/login/aad';
  }

  async logout(): Promise<void> {
    this.userInfo = null;
    this.espoCRMToken = null;
    
    // If we're in EspoCRM context, just clear the data and show a message
    if (this.isInEspoCRMContext()) {
      alert('You have been logged out. Please refresh the dashlet in EspoCRM.');
      return;
    }
    
    window.location.href = '/.auth/logout';
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

  getUserName(): string | null {
    return this.userInfo?.userDetails || null;
  }

  getUserRoles(): string[] {
    return this.userInfo?.userRoles || [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }
}

export const authService = AuthService.getInstance();
