import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MockScenario } from 'src/app/mocks/mock-scenario.enum';

@Injectable({
  providedIn: 'root',
})
export class MockScenarioService {
  private mockScenarioSubject = new BehaviorSubject<MockScenario>(
    MockScenario.real,
  );

  constructor() {}

  public getMockScenarioSubscription(): Observable<MockScenario> {
    return this.mockScenarioSubject.asObservable();
  }

  public setMockScenario(mockScenario: MockScenario) {
    this.mockScenarioSubject.next(mockScenario);
  }
}
