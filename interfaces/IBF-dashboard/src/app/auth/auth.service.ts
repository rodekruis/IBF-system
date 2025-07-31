import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { DEFAULT_USER } from 'src/app/config';
import { User } from 'src/app/models/user/user.model';
import { UserRole } from 'src/app/models/user/user-role.enum';
import { ApiService } from 'src/app/services/api.service';
import { JwtService } from 'src/app/services/jwt.service';
import { PlatformDetectionService } from 'src/app/services/platform-detection.service';
import { EspoCrmAuthService } from 'src/app/services/espocrm-auth.service';
import { environment } from 'src/environments/environment';

const HTTP_STATUS_MESSAGE_MAP = { 401: 'Email and/or password unknown' };
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
    private toastController: ToastController,
    private platformDetectionService: PlatformDetectionService,
    private espoCrmAuth: EspoCrmAuthService,
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
    // Check for EspoCRM with IBF backend token first
    if (this.espoCrmAuth.isEmbeddedInEspoCrm() && this.espoCrmAuth.isAuthenticated()) {
      console.log('🔐 EspoCRM detected with IBF backend token, setting up default user');
      const ibfBackendToken = this.espoCrmAuth.getToken();
      if (ibfBackendToken) {
        // Save the IBF backend token to JWT service for API calls
        this.jwtService.saveToken(ibfBackendToken);
        
        // Create a default user for EspoCRM mode
        const defaultUser: User = {
          ...DEFAULT_USER,
          countries: ['PHL', 'UGA', 'KEN', 'ETH'], // Add default countries for EspoCRM mode
          disasterTypes: ['typhoon', 'floods', 'drought'], // Add default disaster types
          userRole: UserRole.Viewer, // Set as viewer for EspoCRM mode
        };
        this.authSubject.next(defaultUser);
        this.loggedIn = true;
        this.userRole = defaultUser.userRole;
        return;
      }
    }

    // In embedded mode, provide a default user
    if (this.platformDetectionService.isEmbeddedMode()) {
      const defaultUser: User = {
        ...DEFAULT_USER,
        countries: ['PHL', 'UGA', 'KEN'], // Add some default countries for embedded mode
        disasterTypes: ['typhoon', 'floods', 'drought'], // Add default disaster types
        userRole: UserRole.Viewer, // Set as viewer for embedded mode
      };
      this.authSubject.next(defaultUser);
      return;
    }

    // Check if we have an environment token (disabled in EspoCRM embedded mode for security)
    if (environment.apiToken && !this.espoCrmAuth.isEmbeddedInEspoCrm()) {
      try {
        // If environment token exists, save it to JWT service and auto-authenticate
        this.jwtService.saveToken(environment.apiToken);
        const user = this.getUserFromToken();
        if (user) {
          this.authSubject.next(user);
          this.loggedIn = true;
          this.userRole = user.userRole;
          
          // Auto-navigate to dashboard if currently on login page
          if (this.router.url === '/login') {
            this.router.navigate(['/']);
          }
          return;
        }
      } catch (error) {
        console.warn('Environment token is invalid:', error);
      }
    } else if (environment.apiToken && this.espoCrmAuth.isEmbeddedInEspoCrm()) {
      console.log('🔒 Environment token disabled in EspoCRM embedded mode for security');
    }
    
    const user = this.getUserFromToken();
    this.authSubject.next(user);
  }

  public isLoggedIn(): boolean {
    // Check for EspoCRM with IBF backend token first
    if (this.espoCrmAuth.isEmbeddedInEspoCrm() && this.espoCrmAuth.isAuthenticated()) {
      return true;
    }

    // Bypass authentication in embedded mode
    if (this.platformDetectionService.isEmbeddedMode()) {
      return true;
    }

    // Check if environment token is available (disabled in EspoCRM embedded mode for security)
    if (environment.apiToken && !this.espoCrmAuth.isEmbeddedInEspoCrm()) {
      return true;
    }
    
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

  public login(email: string, password: string) {
    return this.apiService
      .login(email, password)
      .subscribe(this.onLoginResponse, this.onLoginError);
  }

  private onLoginResponse = (response: { user: User }) => {
    if (!response.user?.token) {
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

    void toast.present();
    console.error('AuthService error: ', error);
  };

  public logout() {
    this.jwtService.destroyToken();
    this.loggedIn = false;
    this.authSubject.next(null);
    this.router.navigate(['/login']);
  }

  setDisplayName = (user: User) => {
    user = user ?? DEFAULT_USER;

    const displayName = [user.firstName, user.middleName, user.lastName]
      .filter(Boolean)
      .join(' ');

    this.displayName = displayName;
  };

  changePassword(password: string) {
    return this.apiService
      .changePassword(password)
      .subscribe(this.onPasswordChanged, this.onChangePasswordError);
  }

  private onPasswordChanged = async () => {
    const toast = await this.toastController.create({
      message: 'Password changed successfully',
      duration: 5000,
    });

    void toast.present();
  };

  private onChangePasswordError = async (error) => {
    const message =
      HTTP_STATUS_MESSAGE_MAP[error?.statusCode] || error?.message;
    const toast = await this.toastController.create({
      message: `Authentication Failed: ${message}`,
      duration: 5000,
    });

    void toast.present();
    console.error('AuthService error: ', error);
  };
}
