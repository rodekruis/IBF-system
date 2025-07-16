// Azure Static Web Apps authentication service
export interface UserInfo {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
  claims: Record<string, any>;
}

export class AuthService {
  private static instance: AuthService;
  private userInfo: UserInfo | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const response = await fetch('/.auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.clientPrincipal) {
          this.userInfo = data.clientPrincipal;
          return this.userInfo;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  async login(): Promise<void> {
    window.location.href = '/.auth/login/aad';
  }

  async logout(): Promise<void> {
    window.location.href = '/.auth/logout';
  }

  isAuthenticated(): boolean {
    return this.userInfo !== null;
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
