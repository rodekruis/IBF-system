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
      .subscribe((country: Country) => {
        this.country = country;
        this.loadDistrictsAndActions();
      });

    this.mockScenarioService.getMockScenarioSubscription().subscribe(() => {
      this.loadDistrictsAndActions();
    });
  }

  loadDistrictsAndActions() {
    if (this.country) {
      this.apiService
        .getEvent(this.country.countryCodeISO3)
        .subscribe((event) => {
          if (event) {
            this.apiService
              .getTriggeredAreas(this.country.countryCodeISO3)
              .subscribe((triggeredAreas) => {
                this.triggeredAreas = triggeredAreas;

                for (const area of this.triggeredAreas) {
                  this.apiService
                    .getEapActions(this.country.countryCodeISO3, area.placeCode)
                    .subscribe((eapActions) => {
                      area.eapActions = eapActions;
                    });
                }

                this.triggeredAreaSubject.next(this.triggeredAreas);
              });
          }
        });
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
