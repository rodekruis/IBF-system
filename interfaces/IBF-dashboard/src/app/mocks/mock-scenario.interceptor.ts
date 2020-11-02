import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockScenarioService } from 'src/app/mocks/mock-scenario-service/mock-scenario.service';
import { environment } from 'src/environments/environment';
import { MockAPI } from './api.mock';
import { MockScenario } from './mock-scenario.enum';

@Injectable({
  providedIn: 'root',
})
export class MockScenarioInterceptor implements HttpInterceptor {
  constructor(
    private mockScenarioService: MockScenarioService,
    private mockAPI: MockAPI,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Strip API-hostname from url:
    const requestPath = request.url.replace(environment.api_url, '');
    // Use only first level to get generic endpoint
    const requestEndpoint = requestPath.split('/')[0];

    const mockAPIs = this.mockAPI.getMockAPI();

    const currentMockEndpoint =
      (mockAPIs[request.method] && mockAPIs[request.method][requestPath]) ||
      (mockAPIs[request.method] && mockAPIs[request.method][requestEndpoint]) ||
      null;

    return this.mockScenarioService.mockScenario !== MockScenario.real &&
      currentMockEndpoint
      ? currentMockEndpoint.handler()
      : next.handle(request);
  }
}
