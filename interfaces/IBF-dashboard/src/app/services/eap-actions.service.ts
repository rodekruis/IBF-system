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

  loadDistrictsAndActions() {
    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        if (country) {
          this.apiService
            .getEvent(country.countryCodeISO3)
            .subscribe((event) => {
              if (event) {
                this.apiService
                  .getTriggeredAreas(country.countryCodeISO3)
                  .subscribe((triggeredAreas) => {
                    this.triggeredAreas = triggeredAreas;

                    for (let area of this.triggeredAreas) {
                      this.apiService
                        .getEapActions(country.countryCodeISO3, area.placeCode)
                        .subscribe((eapActions) => {
                          area.eapActions = eapActions;
                        });
                    }

                    this.triggeredAreaSubject.next(this.triggeredAreas);
                  });
              }
            });
        }
      });
  }

  getTriggeredAreas(): Observable<any[]> {
    return this.triggeredAreaSubject.asObservable();
  }

  checkEapAction(
    action: string,
    countryCodeISO3: string,
    status: boolean,
    placeCode: string,
  ) {
    this.apiService.checkEapAction(action, countryCodeISO3, status, placeCode);
  }
}
