import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest } from 'src/app/auth/auth.service';
import { DEBUG_LOG } from 'src/app/config';
import { AlertPerLeadTime } from 'src/app/models/alert-per-lead-time.model';
import { Country, DisasterType } from 'src/app/models/country.model';
import { ActivationLogRecord } from 'src/app/pages/dashboard/activation-log/activation.log.page';
import { Event } from 'src/app/services/event.service';
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

export interface Headers {
  anonymous: boolean;
  contentType: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private log = DEBUG_LOG ? console.log : () => undefined;

  constructor(
    private jwtService: JwtService,
    private http: HttpClient,
  ) {}

  private showSecurity(anonymous: boolean) {
    return anonymous ? '🌐' : '🔐';
  }

  private createHeaders({
    anonymous = false,
    contentType = 'application/json',
  }: Partial<Headers>): HttpHeaders {
    let headers = new HttpHeaders({
      Accept: 'application/json',
      'Cache-Control':
        'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      Pragma: 'no-cache',
      Expires: '0',
    });

    if (!anonymous) {
      headers = headers.set(
        'Authorization',
        `Token ${this.jwtService.getToken()}`,
      );
    }

    if (contentType) {
      headers = headers.set('Content-Type', contentType);
    }

    return headers;
  }

  get<T>(
    path: string,
    headers: Partial<Headers> = { anonymous: true },
    params: HttpParams = null,
  ): Observable<T> {
    const url = `${environment.apiUrl}/${path}`;
    const security = this.showSecurity(headers.anonymous);

    this.log(`ApiService GET: ${security} ${url}`);

    return this.http
      .get<T>(url, { headers: this.createHeaders(headers), params })
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

  post<T>(
    path: string,
    body: object,
    headers: Partial<Headers> = { anonymous: false },
    params: HttpParams = null,
  ): Observable<T> {
    const url = `${environment.apiUrl}/${path}`;
    const security = this.showSecurity(headers.anonymous);

    this.log(`ApiService POST: ${security} ${url}`, body);

    return this.http
      .post<T>(url, body, { headers: this.createHeaders(headers), params })
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

  put<T>(
    path: string,
    body: object,
    headers: Partial<Headers> = { anonymous: false },
    params: HttpParams = null,
  ): Observable<T> {
    const url = `${environment.apiUrl}/${path}`;
    const security = this.showSecurity(headers.anonymous);

    this.log(`ApiService PUT: ${security} ${url}`, body);

    return this.http
      .put<T>(url, body, { headers: this.createHeaders(headers), params })
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

  login(loginRequest: LoginRequest) {
    this.log('ApiService : login()');

    return this.post('login', loginRequest, { anonymous: true });
  }

  getCountries(countryCodesISO3?: string): Observable<Country[]> {
    const path = 'country';
    let params = new HttpParams();

    if (countryCodesISO3) {
      params = params.append('countryCodesISO3', countryCodesISO3);
    }

    return this.get(path, { anonymous: false }, params);
  }

  getTyphoonTrack(
    countryCodeISO3: string,
    eventName: string,
  ): Observable<GeoJSON.FeatureCollection> {
    let params = new HttpParams();

    if (eventName) {
      params = params.append('eventName', eventName);
    }

    return this.get(
      `typhoon-track/${countryCodeISO3}`,
      { anonymous: false },
      params,
    );
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
      { anonymous: false },
      params,
    );
  }

  postPointData(
    countryCodeISO3: string,
    layerName: IbfLayerName,
    body: object,
  ) {
    return this.post(
      `point-data/upload-csv/${layerName}/${countryCodeISO3}`,
      body,
      { anonymous: false, contentType: null },
      null,
    );
  }

  getLastUploadDate(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
  ): Observable<LastUploadDate> {
    return this.get(
      `event/last-upload-date/${countryCodeISO3}/${disasterType}`,
      { anonymous: false },
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
      { anonymous: false },
      params,
    );
  }

  getEvents(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
  ): Observable<Event[]> {
    return this.get(`event/${countryCodeISO3}/${disasterType}`, {
      anonymous: false,
    });
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
      { anonymous: false },
      params,
    );
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
      { anonymous: false },
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
      { anonymous: false },
      params,
    );
  }

  getIndicators(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
  ): Observable<Indicator[]> {
    return this.get(`metadata/indicators/${countryCodeISO3}/${disasterType}`, {
      anonymous: false,
    });
  }

  getAdminAreaData(
    countryCodeISO3: string,
    adminLevel: AdminLevel,
    indicator: string,
  ): Observable<{ value: number; placeCode: string }[]> {
    return this.get(
      `admin-area-data/${countryCodeISO3}/${adminLevel.toString()}/${indicator}`,
      { anonymous: false },
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
      { anonymous: false },
      params,
    );
  }

  getLayers(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
  ): Observable<IbfLayerMetadata[]> {
    return this.get(`metadata/layers/${countryCodeISO3}/${disasterType}`, {
      anonymous: false,
    });
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
      { anonymous: false },
    );
  }

  mock(
    { countryCodeISO3 }: Country,
    triggered: boolean,
    removeEvents: boolean,
    { disasterType }: DisasterType,
  ) {
    const body = {
      removeEvents,
      date: new Date(),
      scenario: triggered ? 'trigger' : 'no-trigger',
    };
    let params = new HttpParams();

    params = params.append('countryCodeISO3', countryCodeISO3);
    params = params.append('disasterType', disasterType);

    return this.post('mock', body, { anonymous: false }, params);
  }

  getActivationLogs(
    countryCodeISO3?: string,
    disasterType?: DisasterTypeKey,
  ): Observable<ActivationLogRecord[]> {
    let params = new HttpParams();

    if (countryCodeISO3) {
      params = params.append('countryCodeISO3', countryCodeISO3);
    }

    if (disasterType) {
      params = params.append('disasterType', disasterType);
    }

    return this.get('event/activation-log', { anonymous: false }, params);
  }

  dismissCommunityNotification(pointDataId: string): Observable<void> {
    return this.put(
      `point-data/community-notification/${pointDataId}`,
      {},
      { anonymous: false },
    );
  }

  setTrigger(
    eventPlaceCodeIds: string[],
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
    noNotifications: boolean,
  ): Observable<void> {
    return this.post(
      'events/set-trigger',
      { eventPlaceCodeIds, countryCodeISO3, disasterType, noNotifications },
      { anonymous: false },
    );
  }
}
