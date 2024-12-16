import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap(
        (event) => {
          this.handleResponse(event);
        },
        (error) => {
          this.handleError(error);
        },
      ),
    );
  }

  private handleResponse(event: HttpEvent<unknown>): void {
    if (event instanceof HttpResponse) {
      const isCountryRequest =
        event.url?.startsWith(
          `${environment.apiUrl}/country?countryCodesISO3=`,
        ) ?? false;
      const isEmptyResponse =
        Array.isArray(event.body) && event.body.length === 0;

      if (isCountryRequest && isEmptyResponse) {
        this.authService.logout();
      }
    }
  }

  private handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.authService.logout();
    }
  }
}
