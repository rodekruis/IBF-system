import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MockScenarioService } from 'src/app/mocks/mock-scenario-service/mock-scenario.service';
import { MockScenario } from 'src/app/mocks/mock-scenario.enum';
import { Country } from 'src/app/models/country.model';
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

  private ugandaCountryCodeISO3 = 'UGA';
  public mockLeadTimeKey = 'mock';

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

  public mockAddLeadTime(event: CustomEvent): void {
    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        if (event.detail.value === this.mockLeadTimeKey) {
          if (!country.countryLeadTimes.includes(LeadTime.day3)) {
            country.countryLeadTimes.push(LeadTime.day3);
          }
        } else {
          country.countryLeadTimes = [LeadTime.day7];
        }
        this.timelineService.loadTimeStepButtons();
      });
  }

  public allowMockScenarios(): boolean {
    let allowMock = false;

    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        if (country) {
          allowMock = country.countryCodeISO3 === this.ugandaCountryCodeISO3;
        }
      });

    return allowMock;
  }
}
