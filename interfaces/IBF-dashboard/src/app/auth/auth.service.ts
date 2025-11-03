import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from 'src/app/models/user/user.model';
import { UserRole } from 'src/app/models/user/user-role.enum';
import { ApiService } from 'src/app/services/api.service';
import { JwtService } from 'src/app/services/jwt.service';
import { UserService } from 'src/app/services/user.service';

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
  public redirectUrl: string;
  private authSubject = new BehaviorSubject<User>(null);

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private jwtService: JwtService,
    private router: Router,
  ) {
    const user = this.getUserFromToken();

    this.authSubject.next(user);
  }

  getAuthSubscription = (): Observable<User> => {
    return this.authSubject.asObservable();
  };

  get isLoggedIn() {
    return this.authSubject.value !== null;
  }

  get isAdmin() {
    return [UserRole.Admin, UserRole.LocalAdmin].includes(
      this.authSubject.value?.userRole,
    );
  }

  get userRole() {
    return this.authSubject.value?.userRole;
  }

  get userName() {
    return this.userService.getUserName(this.authSubject.value);
  }

  get userInitials() {
    return this.userService.getUserInitials(this.authSubject.value);
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

    return {
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
      return;
    }

    this.jwtService.saveToken(response.user.token);

    const user = this.getUserFromToken();

    this.authSubject.next(user);
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
    this.authSubject.next(null);
    void this.router.navigate(['/login']);
  }
}
