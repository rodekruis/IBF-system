// Simple mock authentication service for development
import { writable } from 'svelte/store';

export const isAuthenticated = writable(true); // Always authenticated in dev mode
export const currentUser = writable({ 
  id: 'mock-user', 
  email: 'dev@example.com', 
  name: 'Development User' 
});
export const authToken = writable('mock-token');
export const authError = writable<string | null>(null);

// Simple mock auth service
class MockAuthService {
  async initialize() {
    return true;
  }

  async login() {
    isAuthenticated.set(true);
    return true;
  }

  async logout() {
    isAuthenticated.set(false);
    currentUser.set(null);
    authToken.set(null);
  }

  getAuthToken(): string | null {
    return 'mock-token';
  }

  async refreshToken(): Promise<boolean> {
    return true;
  }

  async validateToken(token: string) {
    return {
      valid: true,
      user: {
        id: 'mock-user',
        email: 'dev@example.com', 
        name: 'Development User'
      }
    };
  }

  checkPermission(permission: string): boolean {
    return true; // All permissions granted in dev mode
  }
}

export const authService = new MockAuthService();
