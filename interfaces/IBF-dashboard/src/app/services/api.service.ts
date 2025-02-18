import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DEBUG_LOG } from 'src/app/config';
import { AlertPerLeadTime } from 'src/app/models/alert-per-lead-time.model';
import { Country, DisasterType } from 'src/app/models/country.model';
import { User } from 'src/app/models/user/user.model';
import { ActivationLogRecord } from 'src/app/pages/dashboard/activation-log/activation.log.page';
import { EventSummary } from 'src/app/services/event.service';
import { JwtService } from 'src/app/services/jwt.service';
import { AdminLevel } from 'src/app/types/admin-level';
import { AggregateRecord } from 'src/app/types/aggregate';
import { AlertArea } from 'src/app/types/alert-area';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { IbfLayerMetadata, IbfLayerName } from 'src/app/types/ibf-layer';
import { Indicator } from 'src/app/types/indicator-group';
import { LastUploadDate } from 'src/app/types/last-upload-date';
import { LeadTime } from 'src/app/types/lead-time';
import { environment } from 'src/environments/environment';

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

  get<T>(
    path: string,
    anonymous = true,
    params: HttpParams = null,
  ): Observable<T> {
    const url = `${environment.apiUrl}/${path}`;
    const security = this.showSecurity(anonymous);
    this.log(`ApiService GET: ${security} ${url}`);

    return this.http
      .get<T>(url, {
        headers: this.createHeaders(anonymous),
        params,
      })
      .pipe(
        tap((response) => {
          this.log(
            `ApiService GET: ${security} ${url}`,
            '\nResponse:',
            response,
          );
        }),
      );
  }

  post<T>(path: string, body: object, anonymous = false): Observable<T> {
    const url = `${environment.apiUrl}/${path}`;
    const security = this.showSecurity(anonymous);
    this.log(`ApiService POST: ${security} ${url}`, body);

    return this.http
      .post<T>(url, body, {
        headers: this.createHeaders(anonymous),
      })
      .pipe(
        tap((response) => {
          this.log(
            `ApiService POST: ${security} ${url}:`,
            body,
            '\nResponse:',
            response,
          );
        }),
      );
  }

  put<T>(path: string, body: object, anonymous = false): Observable<T> {
    const url = `${environment.apiUrl}/${path}`;
    const security = this.showSecurity(anonymous);
    this.log(`ApiService PUT: ${security} ${url}`, body);

    return this.http
      .put<T>(url, body, {
        headers: this.createHeaders(anonymous),
      })
      .pipe(
        tap((response) => {
          this.log(
            `ApiService PUT: ${security} ${url}:`,
            body,
            '\nResponse:',
            response,
          );
        }),
      );
  }

  /////////////////////////////////////////////////////////////////////////////
  // API-endpoints:
  /////////////////////////////////////////////////////////////////////////////

  login(email: string, password: string): Observable<{ user: User }> {
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
    return this.get(path, false, params);
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

  getLastUploadDate(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
  ): Observable<LastUploadDate> {
    return this.get(
      `event/last-upload-date/${countryCodeISO3}/${disasterType}`,
      false,
    );
  }

  getAlertPerLeadTime(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
    eventName: string,
  ): Observable<AlertPerLeadTime> {
    let params = new HttpParams();
    if (eventName) {
      params = params.append('eventName', eventName);
    }
    return this.get(
      `event/alerts/${countryCodeISO3}/${disasterType}`,
      false,
      params,
    );
  }

  getEventsSummary(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
  ): Observable<EventSummary[]> {
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
      `admin-areas/${countryCodeISO3}/${disasterType}/${adminLevel.toString()}`,
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
  ): Observable<AggregateRecord[]> {
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
      `admin-areas/aggregates/${countryCodeISO3}/${disasterType}/${adminLevel.toString()}`,
      false,
      params,
    );
  }

  getAlertAreas(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
    adminLevel: number,
    eventName: string,
  ): Observable<AlertArea[]> {
    let params = new HttpParams();
    if (eventName) {
      params = params.append('eventName', eventName);
    }
    return this.get(
      `event/alert-areas/${countryCodeISO3}/${adminLevel.toString()}/${disasterType}`,
      false,
      params,
    );
  }

  getIndicators(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
  ): Observable<Indicator[]> {
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
      `admin-area-data/${countryCodeISO3}/${adminLevel.toString()}/${indicator}`,
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
      `admin-area-dynamic-data/${countryCodeISO3}/${adminLevel.toString()}/${indicator}/${disasterType}`,
      false,
      params,
    );
  }

  getLayers(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
  ): Observable<IbfLayerMetadata[]> {
    return this.get(
      `metadata/layers/${countryCodeISO3}/${disasterType}`,
      false,
    );
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

  mockDynamicData(
    secret: string,
    country: Country,
    triggered: boolean,
    removeEvents: boolean,
    disasterType: DisasterType,
  ) {
    const body = {
      secret,
      removeEvents,
      date: new Date(),
      scenario: triggered ? 'trigger' : 'no-trigger',
    };
    const apiPath = `scripts/mock?disasterType=${disasterType.disasterType}&countryCodeISO3=${country.countryCodeISO3}`;
    return this.post(apiPath, body, false);
  }

  getActivationLogs(
    countryCodeISO3?: string,
    disasterType?: DisasterTypeKey,
  ): Observable<ActivationLogRecord[]> {
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

  dismissCommunityNotification(pointDataId: string): Observable<void> {
    return this.put(
      `point-data/community-notification/${pointDataId}`,
      {},
      false,
    );
  }
}
