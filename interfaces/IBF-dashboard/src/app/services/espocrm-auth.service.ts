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
    this.setupTokenListeners();
  }

  private setupTokenListeners(): void {
    // Listen for IBF backend auth token from EspoCRM
    window.addEventListener('ibf-auth-ready', (event: any) => {
      console.log('🔍 DEBUG: ibf-auth-ready event received', event);
      console.log('🔍 DEBUG: Event detail:', event.detail);
      const token = event.detail?.token;
      if (token) {
        console.log('🔐 Received IBF backend token from EspoCRM via event');
        console.log('🔍 DEBUG: Token length:', token.length);
        console.log('🔍 DEBUG: Token preview:', token.substring(0, 20) + '...');
        this.setToken(token);
      } else {
        console.warn('⚠️ ibf-auth-ready event received but no token found in event.detail');
      }
    });

    // Watch for attribute changes on the custom element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'auth-token') {
          const target = mutation.target as HTMLElement;
          const token = target.getAttribute('auth-token');
          if (token && token !== this.tokenSubject.value) {
            console.log('🔐 Received IBF backend token from EspoCRM via attribute');
            this.setToken(token);
          }
        }
      });
    });

    // Start observing when the element exists
    setTimeout(() => {
      const dashboardElement = document.querySelector('ibf-dashboard');
      if (dashboardElement) {
        observer.observe(dashboardElement, {
          attributes: true,
          attributeFilter: ['auth-token']
        });
        
        // Check if token is already set
        const existingToken = dashboardElement.getAttribute('auth-token');
        if (existingToken) {
          this.setToken(existingToken);
        }
      }
    }, 100);
  }

  setToken(token: string): void {
    console.log('💾 Setting IBF backend token in storage');
    console.log('🔍 DEBUG: Token to store length:', token.length);
    console.log('🔍 DEBUG: Token to store preview:', token.substring(0, 20) + '...');
    
    this.tokenSubject.next(token);
    this.authenticatedSubject.next(true);
    
    // Store for persistence within the EspoCRM session
    sessionStorage.setItem('ibf-backend-token', token);
    sessionStorage.setItem('ibf-backend-timestamp', Date.now().toString());
    
    console.log('✅ IBF backend token set successfully');
    console.log('✅ Token stored in sessionStorage with key: ibf-backend-token');
  }

  getToken(): string | null {
    console.log('🔍 DEBUG: getToken() called');
    
    const currentToken = this.tokenSubject.value;
    if (currentToken) {
      console.log('🔍 DEBUG: Found token in memory, length:', currentToken.length);
      return currentToken;
    }

    // Check sessionStorage (use session storage since we're embedded in EspoCRM)
    const storedToken = sessionStorage.getItem('ibf-backend-token');
    const timestamp = sessionStorage.getItem('ibf-backend-timestamp');
    
    console.log('🔍 DEBUG: Checking sessionStorage for token...');
    console.log('🔍 DEBUG: StoredToken exists:', !!storedToken);
    console.log('🔍 DEBUG: Timestamp exists:', !!timestamp);
    
    if (storedToken && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      console.log('🔍 DEBUG: Token age in minutes:', Math.round(age / 60000));
      
      if (age < 3600000) { // 1 hour
        console.log('🔍 DEBUG: Token is valid, restoring from storage');
        this.setToken(storedToken);
        return storedToken;
      } else {
        console.log('⚠️ DEBUG: Token expired, clearing');
        this.clearToken();
      }
    }

    console.log('🔍 DEBUG: No valid token found, returning null');
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearToken(): void {
    this.tokenSubject.next(null);
    this.authenticatedSubject.next(false);
    sessionStorage.removeItem('ibf-backend-token');
    sessionStorage.removeItem('ibf-backend-timestamp');
    
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
