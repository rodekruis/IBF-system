import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DEBUG_LOG } from 'src/app/config';
import { CountryTriggers } from 'src/app/models/country-triggers.model';
import { Country } from 'src/app/models/country.model';
import { JwtService } from 'src/app/services/jwt.service';
import { AdminLevel } from 'src/app/types/admin-level';
import { LeadTime } from 'src/app/types/lead-time';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private log = DEBUG_LOG ? console.log : () => {};

  constructor(private jwtService: JwtService, private http: HttpClient) {}

  private showSecurity(anonymous: boolean) {
    return anonymous ? '🌐' : '🔐';
  }

  private createHeaders(anonymous: boolean = false): HttpHeaders {
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

  get(path: string, anonymous: boolean = true): Observable<any> {
    const url = `${environment.apiUrl}/${path}`;
    const security = this.showSecurity(anonymous);
    this.log(`ApiService GET: ${security} ${url}`);

    return this.http
      .get(url, {
        headers: this.createHeaders(anonymous),
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

  post(
    path: string,
    body: object,
    anonymous: boolean = false,
  ): Observable<any> {
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

  /////////////////////////////////////////////////////////////////////////////
  // API-endpoints:
  /////////////////////////////////////////////////////////////////////////////

  login(email: string, password: string): Observable<any> {
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

  getCountries(): Observable<Country[]> {
    return this.get('country', false).pipe(
      map((countries) => {
        return countries.map((country) => {
          country.countryActiveLeadTimes = country.countryActiveLeadTimes.map(
            (leadTime) => leadTime.leadTimeName,
          );
          return country;
        });
      }),
    );
  }

  getStations(
    countryCodeISO3: string,
    leadTime: LeadTime = LeadTime.day7,
  ): Observable<GeoJSON.FeatureCollection> {
    return this.get(`stations/${countryCodeISO3}/${leadTime}`, false);
  }

  getRedCrossBranches(
    countryCodeISO3: string,
  ): Observable<GeoJSON.FeatureCollection> {
    return this.get(`red-cross-branches/${countryCodeISO3}`, false);
  }

  getHealthSites(
    countryCodeISO3: string,
  ): Observable<GeoJSON.FeatureCollection> {
    return this.get(`health-sites/${countryCodeISO3}`, false);
  }

  getWaterPoints(
    countryCodeISO3: string,
  ): Observable<GeoJSON.FeatureCollection> {
    return this.get(`waterpoints/${countryCodeISO3}`, false);
  }

  getRecentDates(countryCodeISO3: string): Observable<any> {
    return this.get(`recent-dates/${countryCodeISO3}`, false);
  }

  getTriggerPerLeadTime(countryCodeISO3: string): Observable<CountryTriggers> {
    return this.get(`triggers/${countryCodeISO3}`, false);
  }

  getEvent(countryCodeISO3: string): Observable<any> {
    return this.get(`event/${countryCodeISO3}`, false);
  }

  getAdminRegions(
    countryCodeISO3: string,
    leadTime: string,
    adminLevel: AdminLevel = AdminLevel.adm1,
  ): Observable<GeoJSON.FeatureCollection> {
    return this.get(
      `admin-area-data/${countryCodeISO3}/${adminLevel}/` +
        (leadTime ? leadTime : ''),
      false,
    );
  }

  getTriggeredAreas(countryCodeISO3: string) {
    return this.get(`triggered-areas/${countryCodeISO3}`, false);
  }

  getIndicators(countryCodeISO3: string) {
    return this.get(`metadata/indicators/${countryCodeISO3}`, false);
  }

  getLayers(countryCodeISO3: string) {
    return this.get(`metadata/layers/${countryCodeISO3}`, false);
  }

  getAreasOfFocus() {
    return this.get('eap-actions/areas-of-focus', false);
  }

  getEapActions(countryCodeISO3: string, placeCode: string) {
    return this.get(`eap-actions/${countryCodeISO3}/${placeCode}`, false);
  }

  checkEapAction(
    action: string,
    countryCodeISO3: string,
    status: boolean,
    placeCode: string,
  ) {
    return this.post(
      'eap-actions',
      {
        action,
        countryCode: countryCodeISO3,
        status,
        placeCode,
      },
      false,
    );
  }

  closeEventPlaceCode(eventPlaceCodeId: string) {
    return this.post(
      'event/close-place-code',
      {
        eventPlaceCodeId,
      },
      false,
    );
  }
}
