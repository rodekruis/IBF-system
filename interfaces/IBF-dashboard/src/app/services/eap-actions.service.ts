import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { MockScenarioService } from '../mocks/mock-scenario-service/mock-scenario.service';
import { Country } from '../models/country.model';

@Injectable({
  providedIn: 'root',
})
export class EapActionsService {
  private triggeredAreaSubject = new BehaviorSubject<any[]>([]);
  private triggeredAreas: any[];
  private country: Country;

  constructor(
    private countryService: CountryService,
    private apiService: ApiService,
    private mockScenarioService: MockScenarioService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.mockScenarioService
      .getMockScenarioSubscription()
      .subscribe(this.onMockScenarioChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
    this.loadDistrictsAndActions();
  };

  private onMockScenarioChange = () => {
    this.loadDistrictsAndActions();
  };

  private onEAPActionByTriggeredArea = (triggeredArea) => (eapActions) => {
    triggeredArea.eapActions = eapActions;
  };

  private onTriggeredAreas = (triggeredAreas) => {
    this.triggeredAreas = triggeredAreas;

    for (const triggeredArea of this.triggeredAreas) {
      this.apiService
        .getEapActions(this.country.countryCodeISO3, triggeredArea.placeCode)
        .subscribe(this.onEAPActionByTriggeredArea(triggeredArea));
    }

    this.triggeredAreaSubject.next(this.triggeredAreas);
  };

  private onEvent = (event) => {
    if (event) {
      this.apiService
        .getTriggeredAreas(this.country.countryCodeISO3)
        .subscribe(this.onTriggeredAreas);
    }
  };

  loadDistrictsAndActions() {
    if (this.country) {
      this.apiService
        .getEvent(this.country.countryCodeISO3)
        .subscribe(this.onEvent);
    }
  }

  getTriggeredAreas(): Observable<any[]> {
    return this.triggeredAreaSubject.asObservable();
  }

  checkEapAction(action: string, status: boolean, placeCode: string) {
    return this.apiService.checkEapAction(
      action,
      this.country.countryCodeISO3,
      status,
      placeCode,
    );
  }
}
