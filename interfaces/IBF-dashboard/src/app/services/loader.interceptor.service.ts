import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root',
})
export class LoaderInterceptorService implements HttpInterceptor {
  private requestsToSkip: string[] = ['waterpoints'];

  constructor(private loaderService: LoaderService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const requestPath = request.url;
    const skipRequest = this.requestsToSkip.some((toSkip) =>
      requestPath.includes(toSkip),
    );
    if (skipRequest) {
      return next.handle(request).pipe(
        tap(
          (event: HttpEvent<unknown>) => {
            if (event instanceof HttpResponse) {
              this.onEnd(requestPath);
            }
          },
          (error: unknown) => {
            console.log('error: ', error);
            this.onEnd(requestPath);
          },
        ),
      );
    }

    this.showLoader(requestPath);

    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<unknown>) => {
          if (event instanceof HttpResponse) {
            this.onEnd(requestPath);
          }
        },
        (error: unknown) => {
          console.log('error: ', error);
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
