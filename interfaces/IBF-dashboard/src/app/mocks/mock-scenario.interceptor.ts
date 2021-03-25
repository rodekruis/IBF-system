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
    const requestPath = request.url.replace(environment.apiUrl, '');
    // Use only first level to get generic endpoint
    const requestPathSplit = requestPath.split('/');
    const requestEndpoint = requestPathSplit[1];

    const mockAPIs = this.mockAPI.getMockAPI();

    const currentMockEndpoint =
      (mockAPIs[request.method] && mockAPIs[request.method][requestPath]) ||
      (mockAPIs[request.method] && mockAPIs[request.method][requestEndpoint]) ||
      null;

    let isMockScenario = false;

    this.mockScenarioService
      .getMockScenarioSubscription()
      .subscribe((mockScenario: MockScenario) => {
        isMockScenario = mockScenario !== MockScenario.real;
      });

    return isMockScenario && currentMockEndpoint
      ? currentMockEndpoint.handler()
      : next.handle(request);
  }
}
