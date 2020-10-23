import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { AdminLevelService } from './admin-level.service';
import { TimelineService } from './timeline.service';

@Injectable({
  providedIn: 'root',
})
export class EapActionsService {
  private triggeredAreaSubject = new Subject<any[]>();
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

    const event = await this.apiService.getEvent(this.countryService.selectedCountry.countryCode);
    this.eventId = event.id * 1;

    this.triggeredAreas = await this.apiService.getTriggeredAreas(this.eventId,
      this.adminLevelService.adminLevel,
      this.timelineService.state.selectedTimeStepButtonValue,
    );

    for await (let area of this.triggeredAreas) {
      area.eapActions = await this.apiService.getEapActions(
        this.countryService.selectedCountry.countryCode,
        area.pcode,
        this.eventId
      );
    }
    this.triggeredAreaSubject.next(this.triggeredAreas);
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
    await this.apiService.checkEapAction(action, countryCode, status, pcode, this.eventId);
  }
}
