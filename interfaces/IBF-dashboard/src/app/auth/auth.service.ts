import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { User } from 'src/app/models/user/user.model';
import { ApiService } from 'src/app/services/api.service';
import { JwtService } from 'src/app/services/jwt.service';
import { UserRole } from '../models/user/user-role.enum';

const HTTP_STATUS_MESSAGE_MAP = {
  401: 'Email and/or password unknown',
};
@Injectable({
  providedIn: 'root',
})
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
    private toastController: ToastController,
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

  private onLoginError = async ({ error }) => {
    const message =
      HTTP_STATUS_MESSAGE_MAP[error?.statusCode] || error?.message;
    const toast = await this.toastController.create({
      message: `Authentication Failed: ${message}`,
      duration: 5000,
    });
    toast.present();
    console.error('AuthService error: ', error);
  };

  public logout() {
    this.jwtService.destroyToken();
    this.loggedIn = false;
    this.authSubject.next(null);
    this.router.navigate(['/login']);
  }

  setDisplayName = (user: User) => {
    this.displayName = user
      ? user.firstName +
        (user.middleName ? ' ' + user.middleName : '') +
        ' ' +
        user.lastName
      : '';
  };

  changePassword(password: string) {
    console.log('authService changePassword');
    return this.apiService
      .changePassword(password)
      .subscribe(this.onPasswordChanged, this.onChangePasswordError);
  }

  private onPasswordChanged = async (res) => {
    const toast = await this.toastController.create({
      message: `Password changed successfully`,
      duration: 5000,
    });
    toast.present();
  };

  private onChangePasswordError = async (error) => {
    const message =
      HTTP_STATUS_MESSAGE_MAP[error?.statusCode] || error?.message;
    const toast = await this.toastController.create({
      message: `Authentication Failed: ${message}`,
      duration: 5000,
    });
    toast.present();
    console.error('AuthService error: ', error);
  };
}
