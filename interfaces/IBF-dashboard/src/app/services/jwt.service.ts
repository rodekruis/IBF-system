import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  private tokenKey = 'jwt';
  private jwtHelper = new JwtHelperService();

  public getToken(): string | undefined {
    return window.localStorage[this.tokenKey];
  }

  public saveToken(token: string): void {
    window.localStorage[this.tokenKey] = token;
  }

  public destroyToken(): void {
    window.localStorage.removeItem(this.tokenKey);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public decodeToken(rawToken: string): any {
    return this.jwtHelper.decodeToken(rawToken);
  }

  public checkExpiry(rawToken: string): boolean {
    return this.jwtHelper.isTokenExpired(rawToken);
  }
}
