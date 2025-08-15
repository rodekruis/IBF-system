import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, tap } from 'rxjs';
import { DEFAULT_USER } from 'src/app/config';
import { User } from 'src/app/models/user/user.model';
import { UserRole } from 'src/app/models/user/user-role.enum';
import { ApiService } from 'src/app/services/api.service';
import { JwtService } from 'src/app/services/jwt.service';

export interface LoginUserResponse {
  user: User;
}

export interface LoginMessageResponse {
  message: string;
}

type LoginResponse = LoginMessageResponse | LoginUserResponse;

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private loggedIn = false;
  private userRole: UserRole;
  public redirectUrl: string;
  private authSubject = new BehaviorSubject<User>(null);
  public displayName: string;
  private authSubscription: Subscription;

  constructor(
    private apiService: ApiService,
    private jwtService: JwtService,
    private router: Router,
  ) {
    this.checkLoggedInState();

    this.authSubscription = this.getAuthSubscription().subscribe(
      this.setDisplayName,
    );
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
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
      id: decodedToken.id,
      token: rawToken,
      email: decodedToken.email,
      firstName: decodedToken.firstName,
      middleName: decodedToken.middleName,
      lastName: decodedToken.lastName,
      userRole: decodedToken.userRole,
      countries: decodedToken.countries,
      disasterTypes: decodedToken.disasterTypes,
    };

    this.userRole = user.userRole;

    return user;
  }

  public login(email: string, code: null | string) {
    return this.apiService.login(email, code).pipe(
      tap((response: LoginResponse) => {
        if ('user' in response) {
          this.onLoginResponse(response);
        }
      }),
    );
  }

  private onLoginResponse = (response: LoginUserResponse) => {
    if (!response.user?.token) {
      return;
    }

    this.jwtService.saveToken(response.user.token);

    const user = this.getUserFromToken();

    this.authSubject.next(user);
    this.loggedIn = true;
    this.userRole = user.userRole;

    if (this.redirectUrl) {
      this.router.navigate([this.redirectUrl]).catch(console.error);
      this.redirectUrl = null;

      return;
    }

    this.router.navigate(['/']).catch(console.error);
  };

  public logout() {
    this.jwtService.destroyToken();
    this.loggedIn = false;
    this.authSubject.next(null);
    this.router.navigate(['/login']).catch(console.error);
  }

  setDisplayName = (user: User) => {
    user = user ?? DEFAULT_USER;

    const displayName = [user.firstName, user.middleName, user.lastName]
      .filter(Boolean)
      .join(' ');

    this.displayName = displayName;
  };
}
