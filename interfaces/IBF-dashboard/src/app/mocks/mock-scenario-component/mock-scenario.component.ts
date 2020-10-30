import { Component } from '@angular/core';
import { MockScenarioService } from 'src/app/mocks/mock-scenario-service/mock-scenario.service';
import { CountryService } from 'src/app/services/country.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { MockScenario } from '../mock-scenario.enum';

@Component({
  selector: 'app-mock-scenario',
  templateUrl: './mock-scenario.component.html',
  styleUrls: ['./mock-scenario.component.scss'],
})
export class MockScenarioComponent {
  public MockScenarioEnum = MockScenario;
  constructor(
    public mockScenarioService: MockScenarioService,
    public countryService: CountryService,
    private timelineService: TimelineService,
  ) {}

  public handleMockScenarioChange($event) {
    this.mockScenarioService.setMockScenario($event.detail.value);
  }

  public mockAddLeadtime($event) {
    const leadTimes = this.countryService.selectedCountry.countryForecasts;
    if ($event.detail.value === 'mock') {
      if (!leadTimes.includes('3-day')) {
        this.countryService.selectedCountry.countryForecasts.push('3-day');
      }
    } else {
      this.countryService.selectedCountry.countryForecasts = ['7-day'];
    }
    this.timelineService.loadTimeStepButtons();
  }
}
