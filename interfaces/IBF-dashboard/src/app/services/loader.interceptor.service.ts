import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root',
})
export class LoaderInterceptorService implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const requestPath = request.url;

    this.showLoader(requestPath);
    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.onEnd(requestPath);
          }
        },
        (error: any) => {
          this.onEnd(requestPath);
        },
      ),
    );
  }

  private onEnd(path: string): void {
    this.hideLoader(path);
  }

  private showLoader(path: string): void {
    this.loaderService.setLoader(path, false);
  }

  private hideLoader(path: string): void {
    this.loaderService.setLoader(path, true);
  }
}
