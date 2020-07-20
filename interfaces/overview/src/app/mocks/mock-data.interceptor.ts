import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MockApi } from './api.mock';

@Injectable()
export class MockDataInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Strip API-hostname from url:
    const requestPath = request.url.replace(environment.api_url, '');
    // Use only first level to get generic endpoint
    const requestEndpoint = requestPath.split('/')[0];

    const currentMockEndpoint =
      (MockApi[request.method] && MockApi[request.method][requestPath]) ||
      (MockApi[request.method] && MockApi[request.method][requestEndpoint]) ||
      null;

    return currentMockEndpoint
      ? currentMockEndpoint.handler()
      : next.handle(request);
  }
}
