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

  constructor(
    private countryService: CountryService,
    private apiService: ApiService,
    private mockScenarioService: MockScenarioService,
  ) {
    this.mockScenarioService.getMockScenarioSubscription().subscribe(() => {
      this.loadDistrictsAndActions();
    });
  }

  async loadAreasOfFocus() {
    return await this.apiService.getAreasOfFocus();
  }

  loadDistrictsAndActions() {
    this.countryService
      .getCountrySubscription()
      .subscribe(async (country: Country) => {
        if (country) {
          const event = await this.apiService.getEvent(country.countryCodeISO3);
          if (event) {
            this.triggeredAreas = await this.apiService.getTriggeredAreas(
              country.countryCodeISO3,
            );

            for (let area of this.triggeredAreas) {
              area.eapActions = await this.apiService.getEapActions(
                country.countryCodeISO3,
                area.placeCode,
              );
            }
            this.triggeredAreaSubject.next(this.triggeredAreas);
          }
        }
      });
  }

  getTriggeredAreas(): Observable<any[]> {
    return this.triggeredAreaSubject.asObservable();
  }

  async checkEapAction(
    action: string,
    countryCodeISO3: string,
    status: boolean,
    placeCode: string,
  ) {
    await this.apiService.checkEapAction(
      action,
      countryCodeISO3,
      status,
      placeCode,
    );
  }
}
