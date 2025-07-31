import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EspoCrmAuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private authenticatedSubject = new BehaviorSubject<boolean>(false);

  public token$ = this.tokenSubject.asObservable();
  public isAuthenticated$ = this.authenticatedSubject.asObservable();

  constructor() {
    // In embedded mode, periodically check for token until found
    if (this.isEmbeddedInEspoCrm()) {
      this.setupTokenPolling();
    }
  }

  private setupTokenPolling(): void {
    // Check immediately
    this.checkForToken();
    
    // Then check every 100ms until token is found
    const tokenCheckInterval = setInterval(() => {
      if (this.checkForToken()) {
        clearInterval(tokenCheckInterval);
      }
    }, 100);
    
    // Stop checking after 10 seconds to avoid infinite polling
    setTimeout(() => {
      clearInterval(tokenCheckInterval);
    }, 10000);
  }

  private checkForToken(): boolean {
    const token = localStorage.getItem('IBF-API-TOKEN');
    if (token && !this.tokenSubject.value) {
      console.log('🔐 EspoCRM token detected in localStorage, initializing authentication');
      this.setToken(token);
      return true;
    }
    return false;
  }

  setToken(token: string): void {
    console.log('💾 Setting IBF backend token in storage');
    
    this.tokenSubject.next(token);
    this.authenticatedSubject.next(true);
    
    // Use same localStorage key as non-embedded mode for consistency
    localStorage.setItem('IBF-API-TOKEN', token);
    localStorage.setItem('ibf-backend-timestamp', Date.now().toString());
    
    console.log('✅ IBF backend token set successfully');
  }

  getToken(): string | null {
    const currentToken = this.tokenSubject.value;
    if (currentToken) {
      return currentToken;
    }

    // Check localStorage (same as non-embedded mode for consistency)
    const storedToken = localStorage.getItem('IBF-API-TOKEN');
    const timestamp = localStorage.getItem('ibf-backend-timestamp');
    
    if (storedToken && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      
      if (age < 3600000) { // 1 hour
        this.setToken(storedToken);
        return storedToken;
      } else {
        console.log('⚠️ Token expired, clearing');
        this.clearToken();
      }
    }

    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearToken(): void {
    this.tokenSubject.next(null);
    this.authenticatedSubject.next(false);
    localStorage.removeItem('IBF-API-TOKEN');
    localStorage.removeItem('ibf-backend-timestamp');
    
    console.log('🧹 IBF backend token cleared');
  }

  isEmbeddedInEspoCrm(): boolean {
    // Check for EspoCRM embedded mode indicators
    return document.querySelector('ibf-dashboard[platform="espocrm"]') !== null ||
           window.location.hostname.includes('espocrm') ||
           (window as any).EspoCRM !== undefined ||
           document.querySelector('ibf-dashboard[embedded-mode]') !== null;
  }

  requestTokenRefresh(): void {
    // Request token refresh from EspoCRM
    const dashboardElement = document.querySelector('ibf-dashboard');
    if (dashboardElement) {
      const event = new CustomEvent('ibf-auth-refresh', {
        detail: { reason: 'token_expired' }
      });
      dashboardElement.dispatchEvent(event);
      console.log('🔄 Requested token refresh from EspoCRM');
    }
  }

  notifyAuthFailure(error: string): void {
    // Notify EspoCRM of authentication failure
    const dashboardElement = document.querySelector('ibf-dashboard');
    if (dashboardElement) {
      const event = new CustomEvent('ibf-auth-failed', {
        detail: { error }
      });
      dashboardElement.dispatchEvent(event);
      console.log('❌ Notified EspoCRM of auth failure:', error);
    }
  }

  notifyTokenRequired(): void {
    // Notify EspoCRM that a proper JWT token is required
    const dashboardElement = document.querySelector('ibf-dashboard');
    if (dashboardElement) {
      const event = new CustomEvent('ibf-jwt-token-required', {
        detail: { 
          message: 'EspoCRM must provide a valid JWT token from IBF backend API for proper authentication',
          currentTokenType: 'base64',
          requiredTokenType: 'jwt'
        }
      });
      dashboardElement.dispatchEvent(event);
      console.log('🚨 Notified EspoCRM that JWT token is required for proper functionality');
    }
  }
}
