import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PlatformDetectionService } from 'src/app/services/platform-detection.service';
import { EspoCrmAuthService } from 'src/app/services/espocrm-auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private router: Router,
    private authService: AuthService,
    private platformDetectionService: PlatformDetectionService,
    private espoCrmAuth: EspoCrmAuthService,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | boolean
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | UrlTree {
    const url: string = state.url;

    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean | Observable<boolean> {
    // For EspoCRM embedded mode, wait for authentication to complete
    if (this.espoCrmAuth.isEmbeddedInEspoCrm()) {
      console.log('🔐 AuthGuard: EspoCRM mode detected, checking authentication state');
      if (this.espoCrmAuth.isAuthenticated()) {
        console.log('🔐 AuthGuard: EspoCRM authenticated, allowing access');
        return true;
      } else {
        console.log('🔐 AuthGuard: EspoCRM not yet authenticated, waiting...');
        // Return observable that resolves when authentication is ready
        return this.espoCrmAuth.isAuthenticated$;
      }
    }

    // Bypass authentication in other embedded modes
    if (this.platformDetectionService.isEmbeddedMode()) {
      return true;
    }
    
    if (this.authService.isLoggedIn()) {
      return true;
    }

    this.authService.redirectUrl = url;
    this.router.navigate(['/login']);

    return false;
  }
}
