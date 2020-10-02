import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { ApiService } from 'src/app/services/api.service';
import { JwtService } from 'src/app/services/jwt.service';
import { UserRole } from './user-role.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = false;
  private userRole: UserRole | string;

  redirectUrl: string;

  private authenticationState = new BehaviorSubject<User | null>(null);
  public authenticationState$ = this.authenticationState.asObservable();

  constructor(
    private apiService: ApiService,
    private jwtService: JwtService,
    private router: Router,
  ) {
    this.checkLoggedInState();
  }

  checkLoggedInState() {
    const user = this.getUserFromToken();

    this.authenticationState.next(user);
  }

  public isLoggedIn(): boolean {
    this.loggedIn = this.getUserFromToken() !== null;

    return this.loggedIn;
  }

  public getUserRole(): UserRole | string {
    if (!this.userRole) {
      const user = this.getUserFromToken();

      this.userRole = user ? user.role : '';
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
      role: decodedToken.role,
      status: decodedToken.status,
      countries: decodedToken.countries,
    };

    this.userRole = user.role;

    return user;
  }

  public async login(email, password) {
    return this.apiService.login(email, password).subscribe(
      (response) => {
        if (!response.user || !response.user.token) {
          return;
        }

        this.jwtService.saveToken(response.user.token);

        const user = this.getUserFromToken();

        this.authenticationState.next(user);

        if (user.role === UserRole.Guest) {
          return;
        }

        this.loggedIn = true;
        this.userRole = user.role;

        if (this.redirectUrl) {
          this.router.navigate([this.redirectUrl]);
          this.redirectUrl = null;
          return;
        }

        this.router.navigate(['/overview']);
      },
      (error) => {
        console.error('AuthService error: ', error);
      },
    );
  }

  public logout() {
    this.jwtService.destroyToken();
    this.loggedIn = false;
    this.authenticationState.next(null);
    this.router.navigate(['/login']);
  }
}
