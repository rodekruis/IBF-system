import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from 'src/app/models/user/user.model';
import { ApiService } from 'src/app/services/api.service';
import { JwtService } from 'src/app/services/jwt.service';
import { UserRole } from '../models/user/user-role.enum';

@Injectable({
  providedIn: 'root',
})
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

    const decodedToken = this.jwtService.decodeToken(rawToken);
    const user: User = {
      token: rawToken,
      email: decodedToken.email,
      username: decodedToken.username,
      firstName: decodedToken.firstName,
      middleName: decodedToken.middleName,
      lastName: decodedToken.lastName,
      userRole: decodedToken.userRole,
      userStatus: decodedToken.userStatus,
      countries: decodedToken.countries,
    };

    this.userRole = user.userRole;

    return user;
  }

  public login(email, password) {
    return this.apiService
      .login(email, password)
      .subscribe(this.onLoginResponse, this.onLoginError);
  }

  private onLoginResponse = (response) => {
    if (!response.user || !response.user.token) {
      return;
    }

    this.jwtService.saveToken(response.user.token);

    const user = this.getUserFromToken();

    this.authSubject.next(user);

    this.loggedIn = true;
    this.userRole = user.userRole;

    if (this.redirectUrl) {
      this.router.navigate([this.redirectUrl]);
      this.redirectUrl = null;
      return;
    }

    this.router.navigate(['/']);
  };

  private onLoginError = (error) => {
    console.error('AuthService error: ', error);
  };

  public logout() {
    this.jwtService.destroyToken();
    this.loggedIn = false;
    this.authSubject.next(null);
    this.router.navigate(['/login']);
  }
}
