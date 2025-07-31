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
    // Set up authentication state subscription first
    this.authSubscription = this.getAuthSubscription().subscribe(
      this.setDisplayName,
    );

    // For EspoCRM embedded mode, wait for authentication before checking logged in state
    if (this.espoCrmAuth.isEmbeddedInEspoCrm()) {
      console.log('🔐 EspoCRM embedded mode detected, setting up authentication listener');
      // Subscribe to authentication state changes
      this.espoCrmAuth.isAuthenticated$.subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          console.log('🔐 EspoCRM authentication ready, proceeding with normal auth flow');
          this.checkLoggedInState();
        }
      });
      
      // Check if already authenticated
      if (this.espoCrmAuth.isAuthenticated()) {
        console.log('🔐 EspoCRM already authenticated');
        this.checkLoggedInState();
      }
    } else {
      // For non-EspoCRM modes, check logged in state immediately
      this.checkLoggedInState();
    }
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
      console.log('🔐 EspoCRM detected with IBF backend token, decoding user from token');
      const ibfBackendToken = this.espoCrmAuth.getToken();
      if (ibfBackendToken) {
        console.log('🔍 Debug: Raw token received from EspoCRM:', ibfBackendToken);
        console.log('🔍 Debug: Token length:', ibfBackendToken.length);
        console.log('🔍 Debug: Token parts (split by .):', ibfBackendToken.split('.').length);
        
        // Check if token is a proper JWT (3 parts) or base64-encoded user info
        const tokenParts = ibfBackendToken.split('.');
        if (tokenParts.length === 3) {
          console.log('✅ Received proper JWT token from EspoCRM');
          // Save the IBF backend token to JWT service for API calls
          this.jwtService.saveToken(ibfBackendToken);
          
          // Get the actual user data from the JWT token
          const user = this.getUserFromToken();
          if (user) {
            console.log('✅ Successfully created user from JWT token:', user.email);
            this.authSubject.next(user);
            this.loggedIn = true;
            this.userRole = user.userRole;
            return;
          } else {
            console.error('❌ Failed to create user from JWT token - checking JWT service');
            console.error('❌ JWT service token:', this.jwtService.getToken());
            return;
          }
        } else if (tokenParts.length === 1) {
          console.log('⚠️ Received base64-encoded user info instead of JWT token');
          this.handleBase64UserInfo(ibfBackendToken);
          return;
        } else {
          console.error('❌ Invalid token format - expected 3 parts (JWT) or 1 part (base64), got:', tokenParts.length);
          console.error('❌ Token content:', ibfBackendToken);
          return;
        }
      } else {
        console.warn('⚠️ EspoCRM detected as authenticated but no token found');
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
    // For EspoCRM embedded mode, only return true if authenticated, 
    // but don't return false during waiting period (let other checks handle it)
    if (this.espoCrmAuth.isEmbeddedInEspoCrm()) {
      if (this.espoCrmAuth.isAuthenticated()) {
        return true;
      }
      // During waiting period, check if we have a user set up (means auth completed)
      // Otherwise return false to prevent premature API calls
      return this.loggedIn;
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
      console.warn('⚠️ getUserFromToken: No token found in JWT service');
      return null;
    }

    console.log('🔍 getUserFromToken: Processing token, length:', rawToken.length);

    try {
      const isExpired: boolean = this.jwtService.checkExpiry(rawToken);

      if (isExpired) {
        console.warn('⚠️ getUserFromToken: Token is expired');
        return null;
      }

      console.log('✅ getUserFromToken: Token is valid, decoding...');
      const decodedToken = this.jwtService.decodeToken(rawToken);
      console.log('🔍 getUserFromToken: Decoded token keys:', Object.keys(decodedToken));
      
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
      console.log('✅ getUserFromToken: Successfully created user object for:', user.email);

      return user;
    } catch (error) {
      console.error('❌ Error decoding JWT token:', error);
      console.error('❌ Token was:', rawToken);
      console.error('❌ Token preview:', rawToken.substring(0, 50) + '...');
      return null;
    }
  }

  private handleBase64UserInfo(base64Token: string) {
    try {
      console.log('🔄 Processing base64-encoded user info to get proper JWT token');
      
      // Decode the base64 token to get user information
      const decodedUserInfo = JSON.parse(atob(base64Token));
      console.log('📋 Decoded user info:', decodedUserInfo);
      
      if (!decodedUserInfo.email) {
        console.error('❌ No email found in decoded user info');
        return;
      }
      
      console.log('🔑 User email extracted:', decodedUserInfo.email);
      console.log('⚠️ Base64 token detected - EspoCRM should be configured to pass the actual JWT token from IBF backend API');
      console.log('💡 Creating user object from available information (limited API access due to missing JWT token)');
      
      // Create a user object from the available information
      // Note: This is a temporary workaround - ideally EspoCRM should pass the actual JWT token
      const user: User = {
        token: null, // Don't use the base64 token as it's not a proper JWT
        email: decodedUserInfo.email,
        firstName: decodedUserInfo.userName || decodedUserInfo.firstName || 'EspoCRM',
        middleName: decodedUserInfo.middleName || null,
        lastName: decodedUserInfo.lastName || 'User',
        userRole: UserRole.Viewer, // Default role for EspoCRM users
        countries: ['PHL', 'UGA', 'KEN', 'ZMB', 'MWI', 'SSD', 'ETH', 'ZWE', 'LSO'], // Default countries
        disasterTypes: ['floods', 'malaria', 'drought', 'typhoon', 'flash-floods'], // Default disaster types
      };
      
      // Store a fallback token for API calls - this will have limited functionality
      const fallbackJwtPayload = {
        email: user.email,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        userRole: user.userRole,
        countries: user.countries,
        disasterTypes: user.disasterTypes,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
        embedded: true, // Flag to indicate this is from embedded mode
        source: 'espocrm'
      };
      
      // Create a pseudo-JWT for internal use (this won't work with the API but will prevent null errors)
      const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
      const payload = btoa(JSON.stringify(fallbackJwtPayload));
      const fallbackToken = `${header}.${payload}.embedded-mode-signature`;
      
      console.log('🔧 Created fallback JWT token for embedded mode');
      
      // Don't save this to JWT service as it won't work with the API
      // Instead, we'll rely on EspoCRM providing a proper JWT token for API calls
      
      this.authSubject.next(user);
      this.loggedIn = true;
      this.userRole = user.userRole;
      
      console.log('✅ User authentication completed with EspoCRM embedded mode (limited functionality)');
      console.log('🚨 CRITICAL: EspoCRM must be configured to pass the actual JWT token from IBF backend API');
      console.log('🚨 Without a proper JWT token, API calls will fail. Please check EspoCRM IBF integration.');
      
      // Notify EspoCRM that it should provide a proper JWT token
      this.espoCrmAuth.notifyTokenRequired();
      
    } catch (error) {
      console.error('❌ Error processing base64 user info:', error);
      console.error('❌ Base64 token was:', base64Token);
    }
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
