import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from 'src/app/models/user/user.model';

@Injectable({ providedIn: 'root' })
export class JwtService {
  private tokenKey = 'jwt';
  private jwtHelper = new JwtHelperService();

  public getToken(): string | undefined {
    const token = window.localStorage[this.tokenKey];
    return token;
  }

  public saveToken(token: string): void {
    window.localStorage[this.tokenKey] = token;
    console.log('💾 JWT token saved to localStorage with key:', this.tokenKey);
  }

  public destroyToken(): void {
    window.localStorage.removeItem(this.tokenKey);
    console.log('🗑️ JWT token removed from localStorage');
  }

  public decodeToken(rawToken: string): User {
    return this.jwtHelper.decodeToken(rawToken);
  }

  public checkExpiry(rawToken: string): boolean {
    return this.jwtHelper.isTokenExpired(rawToken);
  }
}
