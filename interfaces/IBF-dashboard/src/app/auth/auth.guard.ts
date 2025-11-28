import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivateChild(
    _next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | boolean
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | UrlTree {
    const url: string = state.url;

    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    if (this.authService.isLoggedIn) {
      if (url === '/login') {
        void this.router.navigate(['/']);
      }

      if (url === '/manage/users' && !this.authService.isAdmin) {
        void this.router.navigate(['/manage']);
      }

      return true;
    } else if (url === '/login') {
      return true;
    }

    this.authService.redirectUrl = url;
    void this.router.navigate(['/login']);

    return false;
  }
}
