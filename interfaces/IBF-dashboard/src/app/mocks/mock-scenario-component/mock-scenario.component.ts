import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MockScenarioService } from 'src/app/mocks/mock-scenario-service/mock-scenario.service';
import { MockScenario } from 'src/app/mocks/mock-scenario.enum';
import { CountryService } from 'src/app/services/country.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { LeadTime } from 'src/app/types/lead-time';

@Component({
  selector: 'app-mock-scenario',
  templateUrl: './mock-scenario.component.html',
  styleUrls: ['./mock-scenario.component.scss'],
})
export class MockScenarioComponent implements OnInit, OnDestroy {
  public MockScenarioEnum = MockScenario;
  public mockScenario: MockScenario;
  public mockScenarioSubscription: Subscription;

  public mockScenarios: MockScenario[] = [
    MockScenario.real,
    MockScenario.noEvent,
    MockScenario.newEvent,
    MockScenario.existingEvent,
    MockScenario.oldEvent,
  ];

  constructor(
    public mockScenarioService: MockScenarioService,
    public countryService: CountryService,
    private timelineService: TimelineService,
  ) {}

  ngOnInit() {
    this.mockScenarioSubscription = this.mockScenarioService
      .getMockScenarioSubscription()
      .subscribe((mockScenario: MockScenario) => {
        this.mockScenario = mockScenario;
      });
  }

  ngOnDestroy() {
    this.mockScenarioSubscription.unsubscribe();
  }

  public handleMockScenarioChange(event: CustomEvent): void {
    this.mockScenarioService.setMockScenario(event.detail.value);
  }

  public mockAddLeadtime(event: CustomEvent): void {
    const activeCountry = this.countryService.activeCountry;
    if (event.detail.value === 'mock') {
      if (!activeCountry.countryLeadTimes.includes(LeadTime.day3)) {
        activeCountry.countryLeadTimes.push(LeadTime.day3);
      }
    } else {
      activeCountry.countryLeadTimes = [LeadTime.day7];
    }
    this.timelineService.loadTimeStepButtons();
  }
}
