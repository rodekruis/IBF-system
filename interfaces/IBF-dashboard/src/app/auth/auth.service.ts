import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from 'src/app/models/user/user.model';
import { UserRole } from 'src/app/models/user/user-role.enum';
import { ApiService } from 'src/app/services/api.service';
import { JwtService } from 'src/app/services/jwt.service';

export interface LoginRequest {
  email: string;
  code?: number;
}

export interface UserResponse {
  user: User;
}

export interface MessageResponse {
  message: string;
}

type LoginResponse = MessageResponse | UserResponse;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = false;
  private userRole: UserRole;
  public redirectUrl: string;
  private authSubject = new BehaviorSubject<User>(null);

  constructor(
    private apiService: ApiService,
    private jwtService: JwtService,
    private router: Router,
  ) {
    this.checkLoggedInState();
  }

  getAuthSubscription = (): Observable<User> => {
    return this.authSubject.asObservable();
  };

  checkLoggedInState() {
    const user = this.getUserFromToken();

    this.authSubject.next(user);
  }

  public isLoggedIn(): boolean {
    this.loggedIn = this.getUserFromToken() !== null;

    return this.loggedIn;
  }

  public getUserRole(): UserRole {
    if (!this.userRole) {
      const user = this.getUserFromToken();

      this.userRole = user ? user.userRole : null;
    }

    return this.userRole;
  }

  private getUserFromToken() {
    const rawToken = this.jwtService.getToken();

    if (!rawToken) {
      return null;
    }

    const isExpired: boolean = this.jwtService.checkExpiry(rawToken);

    if (isExpired) {
      return null;
    }

    const decodedToken = this.jwtService.decodeToken(rawToken);
    const user: User = {
      userId: decodedToken.userId,
      token: rawToken,
      email: decodedToken.email,
      firstName: decodedToken.firstName,
      middleName: decodedToken.middleName,
      lastName: decodedToken.lastName,
      userRole: decodedToken.userRole,
      whatsappNumber: decodedToken.whatsappNumber,
      countries: decodedToken.countries,
      disasterTypes: decodedToken.disasterTypes,
    };

    this.userRole = user.userRole;

    return user;
  }

  public login(loginRequest: LoginRequest) {
    return this.apiService.login(loginRequest).pipe(
      tap((response: LoginResponse) => {
        if ('user' in response) {
          this.onLoginResponse(response);
        }
      }),
    );
  }

  public setUser = (response: UserResponse) => {
    if (!response.user?.token) {
      this.loggedIn = false;
      this.userRole = null;

      return;
    }

    this.jwtService.saveToken(response.user.token);

    const user = this.getUserFromToken();

    this.authSubject.next(user);
    this.loggedIn = true;
    this.userRole = user.userRole;
  };

  private onLoginResponse = (response: UserResponse) => {
    this.setUser(response);

    if (this.redirectUrl) {
      void this.router.navigate([this.redirectUrl]);
      this.redirectUrl = null;

      return;
    }

    void this.router.navigate(['/']);
  };

  public logout() {
    this.jwtService.destroyToken();
    this.loggedIn = false;
    this.authSubject.next(null);
    void this.router.navigate(['/login']);
  }
}
