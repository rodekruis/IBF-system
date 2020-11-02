import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import mockCountry from 'src/app/mocks/country.mock';
import { AdminLevel } from 'src/app/types/admin-level.enum';

@Injectable({
  providedIn: 'root',
})
export class AdminLevelService {
  private adminLevelSubject = new ReplaySubject<AdminLevel>();
  public adminLevel: AdminLevel = mockCountry.defaultAdminLevel;

  constructor() {}

  getAdminLevelSubscription = (): Observable<AdminLevel> => {
    return this.adminLevelSubject.asObservable();
  };

  public setAdminLevel(adminLevel: AdminLevel) {
    this.adminLevel = adminLevel;
    this.adminLevelSubject.next(this.adminLevel);
  }
}
