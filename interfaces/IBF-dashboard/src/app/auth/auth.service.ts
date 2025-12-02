import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from 'src/app/models/user/user.model';
import { UserRole } from 'src/app/models/user/user-role.enum';
import { ApiService } from 'src/app/services/api.service';
import { JwtService } from 'src/app/services/jwt.service';
import { UserService } from 'src/app/services/user.service';
import { LoginRequest, LoginResponse, UserResponse } from 'src/app/types/api';

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
      countryCodesISO3: decodedToken.countryCodesISO3,
      disasterTypes: decodedToken.disasterTypes,
    };
  }

  public login(loginRequest: LoginRequest) {
    return this.apiService.login(loginRequest).pipe(
      tap((loginResponse: LoginResponse) => {
        if ('user' in loginResponse) {
          this.onLoginResponse(loginResponse);
        }
      }),
    );
  }

  public setUser = (user?: User) => {
    if (!user?.token) {
      return;
    }

    this.jwtService.saveToken(user.token);

    const tokenUser = this.getUserFromToken();

    this.authSubject.next(tokenUser);
  };

  private onLoginResponse = ({ user }: UserResponse) => {
    this.setUser(user);

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
