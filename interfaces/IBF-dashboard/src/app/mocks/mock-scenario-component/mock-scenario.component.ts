import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MockScenarioService } from 'src/app/mocks/mock-scenario-service/mock-scenario.service';
import { MockScenario } from 'src/app/mocks/mock-scenario.enum';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-mock-scenario',
  templateUrl: './mock-scenario.component.html',
  styleUrls: ['./mock-scenario.component.scss'],
})
export class MockScenarioComponent implements OnInit, OnDestroy {
  public MockScenarioEnum = MockScenario;
  public mockScenario: MockScenario;
  public mockScenarioSubscription: Subscription;

  private country: Country;
  public countrySubscription: Subscription;

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
  ) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.country = country;
      });

    this.mockScenarioSubscription = this.mockScenarioService
      .getMockScenarioSubscription()
      .subscribe((mockScenario: MockScenario) => {
        this.mockScenario = mockScenario;
      });
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
    this.mockScenarioSubscription.unsubscribe();
  }

  public handleMockScenarioChange(event: CustomEvent): void {
    this.mockScenarioService.setMockScenario(event.detail.value);
  }

  public allowMockScenarios(): boolean {
    let allowMock = false;

    if (this.country) {
      allowMock = this.country.countryCodeISO3 === this.ugandaCountryCodeISO3;
    }

    return allowMock;
  }
}
