import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from 'src/app/models/user/user.model';

@Injectable({ providedIn: 'root' })
export class JwtService {
  private tokenKey = 'jwt';
  private jwtHelper = new JwtHelperService();

  public getToken(): string | undefined {
    console.log('🔍 DEBUG: JwtService.getToken() called');
    const token = window.localStorage[this.tokenKey];
    console.log('🔍 DEBUG: Token found in localStorage[jwt]:', !!token);
    if (token) {
      console.log('🔍 DEBUG: Token length:', token.length);
      console.log('🔍 DEBUG: Token preview:', token.substring(0, 20) + '...');
    }
    return token;
  }

  public saveToken(token: string): void {
    console.log('💾 JwtService.saveToken() called');
    console.log('🔍 DEBUG: Saving token to localStorage[jwt]');
    console.log('🔍 DEBUG: Token length:', token.length);
    console.log('🔍 DEBUG: Token preview:', token.substring(0, 20) + '...');
    
    window.localStorage[this.tokenKey] = token;
    
    // Also save to the key that the HTTP client expects for web components
    window.localStorage.setItem('IBF-API-TOKEN', token);
    console.log('✅ Token saved to both jwt and IBF-API-TOKEN keys');
  }

  public destroyToken(): void {
    window.localStorage.removeItem(this.tokenKey);
  }

  public decodeToken(rawToken: string): User {
    return this.jwtHelper.decodeToken(rawToken);
  }

  public checkExpiry(rawToken: string): boolean {
    return this.jwtHelper.isTokenExpired(rawToken);
  }
}
