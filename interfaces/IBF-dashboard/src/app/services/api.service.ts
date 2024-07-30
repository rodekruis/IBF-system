import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DEBUG_LOG } from 'src/app/config';
import { CountryTriggers } from 'src/app/models/country-triggers.model';
import { Country, DisasterType } from 'src/app/models/country.model';
import { JwtService } from 'src/app/services/jwt.service';
import { AdminLevel } from 'src/app/types/admin-level';
import { LeadTime } from 'src/app/types/lead-time';
import { environment } from 'src/environments/environment';
import { User } from '../models/user/user.model';
import { Aggregate } from '../types/aggregate';
import { DisasterTypeKey } from '../types/disaster-type-key';
import { IbfLayerName } from '../types/ibf-layer';
import { RecentDate } from '../types/recent-date';
import { TriggeredArea } from '../types/triggered-area';
import { EventSummary } from './event.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private log = DEBUG_LOG ? console.log : () => undefined;

  constructor(
    private jwtService: JwtService,
    private http: HttpClient,
  ) {}

  private showSecurity(anonymous: boolean) {
    return anonymous ? '🌐' : '🔐';
  }

  private createHeaders(anonymous = false): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control':
        'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      Pragma: 'no-cache',
      Expires: '0',
    });

    if (!anonymous) {
      return headers.set(
        'Authorization',
        `Token ${this.jwtService.getToken()}`,
      );
    }

    return headers;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(path: string, anonymous = true, params = null): Observable<any> {
    const url = `${environment.apiUrl}/${path}`;
    const security = this.showSecurity(anonymous);
    this.log(`ApiService GET: ${security} ${url}`);

    return this.http
      .get(url, {
        headers: this.createHeaders(anonymous),
        params,
      })
      .pipe(
        tap((response) =>
          this.log(
            `ApiService GET: ${security} ${url}`,
            '\nResponse:',
            response,
          ),
        ),
      );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post(path: string, body: object, anonymous = false): Observable<any> {
    const url = `${environment.apiUrl}/${path}`;
    const security = this.showSecurity(anonymous);
    this.log(`ApiService POST: ${security} ${url}`, body);

    return this.http
      .post(url, body, {
        headers: this.createHeaders(anonymous),
      })
      .pipe(
        tap((response) =>
          this.log(
            `ApiService POST: ${security} ${url}:`,
            body,
            '\nResponse:',
            response,
          ),
        ),
      );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put(path: string, body: object, anonymous = false): Observable<any> {
    const url = `${environment.apiUrl}/${path}`;
    const security = this.showSecurity(anonymous);
    this.log(`ApiService PUT: ${security} ${url}`, body);

    return this.http
      .put(url, body, {
        headers: this.createHeaders(anonymous),
      })
      .pipe(
        tap((response) =>
          this.log(
            `ApiService PUT: ${security} ${url}:`,
            body,
            '\nResponse:',
            response,
          ),
        ),
      );
  }

  /////////////////////////////////////////////////////////////////////////////
  // API-endpoints:
  /////////////////////////////////////////////////////////////////////////////

  login(email: string, password: string): Observable<User> {
    this.log('ApiService : login()');

    return this.post(
      'user/login',
      {
        email,
        password,
      },
      true,
    );
  }

  changePassword(password: string): Observable<User> {
    this.log('ApiService : changePassword()');
    return this.post('user/change-password', {
      password,
    });
  }

  getCountries(
    countryCodesISO3?: string,
    minimalInfo?: boolean,
  ): Observable<Country[]> {
    const path = 'country';
    let params = new HttpParams();
    if (countryCodesISO3) {
      params = params.append('countryCodesISO3', countryCodesISO3);
    }
    if (minimalInfo) {
      params = params.append('minimalInfo', String(minimalInfo));
    }
    return this.get(path, false, params).pipe(
      map((countries) => {
        return countries.map((country) => {
          country.countryDisasterSettings?.map((disaster) => {
            disaster.activeLeadTimes = disaster.activeLeadTimes.map(
              (leadTime) => leadTime.leadTimeName,
            );
            return disaster;
          });
          return country;
        });
      }),
    );
  }

  getTyphoonTrack(
    countryCodeISO3: string,
    eventName: string,
  ): Observable<GeoJSON.FeatureCollection> {
    let params = new HttpParams();
    if (eventName) {
      params = params.append('eventName', eventName);
    }
    return this.get(`typhoon-track/${countryCodeISO3}`, false, params);
  }

  getPointData(
    countryCodeISO3: string,
    layerName: IbfLayerName,
    disasterType: DisasterTypeKey,
  ): Observable<GeoJSON.FeatureCollection> {
    let params = new HttpParams();
    if (disasterType) {
      params = params.append('disasterType', disasterType);
    }
    return this.get(
      `point-data/${layerName}/${countryCodeISO3}`,
      false,
      params,
    );
  }

  getWaterPoints(
    countryCodeISO3: string,
  ): Observable<GeoJSON.FeatureCollection> {
    return this.get(`waterpoints/${countryCodeISO3}`, false);
  }

  getRecentDates(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
  ): Observable<RecentDate> {
    return this.get(
      `event/recent-date/${countryCodeISO3}/${disasterType}`,
      false,
    );
  }

  getTriggerPerLeadTime(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
    eventName: string,
  ): Observable<CountryTriggers> {
    let params = new HttpParams();
    if (eventName) {
      params = params.append('eventName', eventName);
    }
    return this.get(
      `event/triggers/${countryCodeISO3}/${disasterType}`,
      false,
      params,
    );
  }

  getEventsSummary(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
  ): Observable<EventSummary> {
    return this.get(`event/${countryCodeISO3}/${disasterType}`, false);
  }

  getAdminRegions(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
    leadTime: string,
    adminLevel: AdminLevel = AdminLevel.adminLevel1,
    eventName: string,
    placeCodeParent?: string,
  ): Observable<GeoJSON.FeatureCollection> {
    let params = new HttpParams();
    if (eventName) {
      params = params.append('eventName', eventName);
    }
    if (leadTime) {
      params = params.append('leadTime', leadTime);
    }
    if (placeCodeParent) {
      params = params.append('placeCodeParent', placeCodeParent);
    }
    return this.get(
      `admin-areas/${countryCodeISO3}/${disasterType}/${adminLevel}`,
      false,
      params,
    );
  }

  getAggregatesData(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
    adminLevel: AdminLevel = AdminLevel.adminLevel1,
    leadTime: string,
    eventName: string,
    placeCodeParent?: string,
  ): Observable<Aggregate[]> {
    let params = new HttpParams();
    if (eventName) {
      params = params.append('eventName', eventName);
    }
    if (leadTime) {
      params = params.append('leadTime', leadTime);
    }
    if (placeCodeParent) {
      params = params.append('placeCodeParent', placeCodeParent);
    }
    return this.get(
      `admin-areas/aggregates/${countryCodeISO3}/${disasterType}/${adminLevel}`,
      false,
      params,
    );
  }

  getTriggeredAreas(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
    adminLevel: number,
    leadTime: string,
    eventName: string,
  ): Observable<TriggeredArea> {
    let params = new HttpParams();
    if (eventName) {
      params = params.append('eventName', eventName);
    }
    if (leadTime) {
      params = params.append('leadTime', leadTime);
    }
    return this.get(
      `event/triggered-areas/${countryCodeISO3}/${adminLevel}/${disasterType}`,
      false,
      params,
    );
  }

  getIndicators(countryCodeISO3: string, disasterType: DisasterTypeKey) {
    return this.get(
      `metadata/indicators/${countryCodeISO3}/${disasterType}`,
      false,
    );
  }

  getAdminAreaData(
    countryCodeISO3: string,
    adminLevel: AdminLevel,
    indicator: string,
  ): Observable<{ value: number; placeCode: string }[]> {
    return this.get(
      `admin-area-data/${countryCodeISO3}/${adminLevel}/${indicator}`,
      false,
    );
  }

  getAdminAreaDynamicDataOne(
    key: string,
    placeCode: string,
    leadTime: string,
    eventName: string,
  ) {
    return this.get(
      `admin-area-dynamic-data/single/${key}/${placeCode}/${leadTime}/${
        eventName || 'no-name'
      }`,
      false,
    );
  }

  getAdminAreaDynamicData(
    countryCodeISO3: string,
    adminLevel: AdminLevel,
    leadTime: LeadTime,
    indicator: string,
    disasterType: DisasterTypeKey,
    eventName: string,
  ): Observable<{ value: number; placeCode: string }[]> {
    let params = new HttpParams();
    if (eventName) {
      params = params.append('eventName', eventName);
    }
    if (leadTime) {
      params = params.append('leadTime', leadTime);
    }
    return this.get(
      `admin-area-dynamic-data/${countryCodeISO3}/${adminLevel}/${indicator}/${disasterType}`,
      false,
      params,
    );
  }

  getLayers(countryCodeISO3: string, disasterType: DisasterTypeKey) {
    return this.get(
      `metadata/layers/${countryCodeISO3}/${disasterType}`,
      false,
    );
  }

  getAreasOfFocus() {
    return this.get('eap-actions/areas-of-focus', false);
  }

  checkEapAction(
    action: string,
    countryCodeISO3: string,
    disasterType: string,
    status: boolean,
    placeCode: string,
    eventName: string,
  ) {
    return this.post(
      'eap-actions/check',
      {
        action,
        countryCodeISO3,
        disasterType,
        status,
        placeCode,
        eventName: eventName || 'no-name',
      },
      false,
    );
  }

  toggleTrigger(eventPlaceCodeId: string) {
    return this.post(
      'event/toggle-stopped-trigger',
      {
        eventPlaceCodeId,
      },
      false,
    );
  }

  mockDynamicData(
    secret: string,
    country: Country,
    triggered: boolean,
    removeEvents: boolean,
    disasterType: DisasterType,
  ) {
    return this.post(
      'scripts/mock-dynamic-data',
      {
        secret,
        countryCodeISO3: country.countryCodeISO3,
        disasterType: disasterType.disasterType,
        triggered,
        removeEvents,
        date: new Date(),
      },
      false,
    );
  }

  getActivationLogs(countryCodeISO3?: string, disasterType?: DisasterTypeKey) {
    return this.get(
      `event/activation-log${
        countryCodeISO3 && disasterType
          ? '?countryCodeISO3=' +
            countryCodeISO3 +
            '&disasterType=' +
            disasterType
          : ''
      }`,
      false,
    );
  }

  dismissCommunityNotification(pointDataId: string) {
    return this.put(
      `point-data/community-notification/${pointDataId}`,
      {},
      false,
    );
  }
}
