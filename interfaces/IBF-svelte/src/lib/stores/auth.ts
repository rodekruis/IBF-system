import { writable } from 'svelte/store';
import { authService, type UserInfo } from '../services/authService';
import config from '../config';

// Authentication store
export const user = writable<UserInfo | null>(null);
export const isAuthenticated = writable<boolean>(false);
export const isLoading = writable<boolean>(true);

// Initialize authentication
export async function initAuth() {
  isLoading.set(true);
  
  // If authentication is disabled, set as authenticated immediately
  if (config.disableAuthentication) {
    console.log('🔓 Authentication disabled - skipping auth check');
    user.set({
      identityProvider: 'mock',
      userId: 'dev-user',
      userDetails: 'Development User',
      userRoles: ['user'],
      claims: {}
    });
    isAuthenticated.set(true);
    isLoading.set(false);
    return;
  }
  
  try {
    const userInfo = await authService.getCurrentUser();
    user.set(userInfo);
    isAuthenticated.set(userInfo !== null);
  } catch (error) {
    console.error('Failed to initialize authentication:', error);
    user.set(null);
    isAuthenticated.set(false);
  } finally {
    isLoading.set(false);
  }
}

// Authentication actions
export const auth = {
  login: () => authService.login(),
  logout: () => authService.logout(),
  refresh: initAuth
};
