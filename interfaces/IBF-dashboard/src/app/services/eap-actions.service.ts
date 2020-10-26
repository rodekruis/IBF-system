import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { MockScenario } from '../mocks/mock-scenario.enum';
import { AdminLevelService } from './admin-level.service';
import { TimelineService } from './timeline.service';

@Injectable({
  providedIn: 'root',
})
export class EapActionsService {
  private triggeredAreaSubject = new ReplaySubject<any[]>();
  private triggeredAreas: any[];
  private eventId: number;

  constructor(
    private countryService: CountryService,
    private adminLevelService: AdminLevelService,
    private timelineService: TimelineService,
    private apiService: ApiService,
  ) {}

  async loadAreasOfFocus() {
    return await this.apiService.getAreasOfFocus();
  }

  async loadDistrictsAndActions() {
    const mockScenario = MockScenario.newEvent;
    const event = await this.apiService.getEvent(
      this.countryService.selectedCountry.countryCode,
      mockScenario,
    );
    if (event) {
      this.eventId = event?.id * 1;

      this.triggeredAreas = await this.apiService.getTriggeredAreas(
        this.eventId,
      );

      for await (let area of this.triggeredAreas) {
        area.eapActions = await this.apiService.getEapActions(
          this.countryService.selectedCountry.countryCode,
          area.pcode,
          this.eventId,
        );
      }
      this.triggeredAreaSubject.next(this.triggeredAreas);
    }
  }

  getTriggeredAreas(): Observable<any[]> {
    return this.triggeredAreaSubject.asObservable();
  }

  async checkEapAction(
    action: string,
    countryCode: string,
    status: boolean,
    pcode: string,
  ) {
    await this.apiService.checkEapAction(
      action,
      countryCode,
      status,
      pcode,
      this.eventId,
    );
  }
}
