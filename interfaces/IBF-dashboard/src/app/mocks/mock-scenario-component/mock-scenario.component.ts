import { Component } from '@angular/core';
import { MockScenarioService } from 'src/app/mocks/mock-scenario-service/mock-scenario.service';

@Component({
  selector: 'app-mock-scenario',
  templateUrl: './mock-scenario.component.html',
  styleUrls: ['./mock-scenario.component.scss'],
})
export class MockScenarioComponent {
  constructor(public mockScenarioService: MockScenarioService) {}

  public handleMockScenarioChange($event) {
    this.mockScenarioService.setMockScenario($event.detail.value);
  }
}
