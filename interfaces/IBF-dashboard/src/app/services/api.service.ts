import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Country } from 'src/app/models/country.model';
import { JwtService } from 'src/app/services/jwt.service';
import { AdminLevel } from 'src/app/types/admin-level';
import { LeadTime } from 'src/app/types/lead-time';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private enableLogging = false;
  private log = this.enableLogging ? console.log : () => {};

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

  getCountries(): Promise<Country[]> {
    return this.get('country', false)
      .pipe(
        map((countries) => {
          return countries.map((country) => {
            country.countryLeadTimes = country.countryLeadTimes.map(
              (leadTime) => leadTime.leadTimeName,
            );
            return country;
          });
        }),
      )
      .toPromise();
  }

  getStations(
    countryCodeISO3: string,
    leadTime: LeadTime = LeadTime.day7,
  ): Promise<GeoJSON.FeatureCollection> {
    return this.get(
      `stations/${countryCodeISO3}/${leadTime}`,
      false,
    ).toPromise();
  }

  getRedCrossBranches(
    countryCodeISO3: string,
  ): Promise<GeoJSON.FeatureCollection> {
    return this.get(`red-cross-branches/${countryCodeISO3}`, false).toPromise();
  }

  getWaterpoints(countryCodeISO3: string): Promise<GeoJSON.FeatureCollection> {
    return this.get(`waterpoints/${countryCodeISO3}`, false).toPromise();
  }

  getRecentDates(countryCodeISO3: string): Promise<any> {
    return this.get(`recent-dates/${countryCodeISO3}`, false).toPromise();
  }

  getTriggerPerLeadTime(countryCodeISO3: string): Promise<number> {
    return this.get(`triggers/${countryCodeISO3}`, false).toPromise();
  }

  getEvent(countryCodeISO3: string): Promise<any> {
    return this.get(`event/${countryCodeISO3}`, false).toPromise();
  }

  getAdminRegions(
    countryCodeISO3: string,
    leadTime: LeadTime = LeadTime.day7,
    adminLevel: AdminLevel = AdminLevel.adm1,
  ): Promise<GeoJSON.FeatureCollection> {
    return this.get(
      `admin-area-data/${countryCodeISO3}/${adminLevel}/${leadTime}`,
      false,
    ).toPromise();
  }

  getAdmin2Data(): Promise<GeoJSON.FeatureCollection> {
    return this.get('uga-data-level-2/all', false).toPromise();
  }

  getTriggeredAreas(event: number) {
    return this.get(`triggered-areas/${event}`, false).toPromise();
  }

  getMetadata(countryCodeISO3: string) {
    return this.get(`metadata/${countryCodeISO3}`, false).toPromise();
  }

  getAreasOfFocus() {
    return this.get('eap-actions/areas-of-focus', false).toPromise();
  }

  getEapActions(countryCodeISO3: string, pcode: string, event: number) {
    return this.get(
      `eap-actions/${countryCodeISO3}/${pcode}/${event}`,
      false,
    ).toPromise();
  }

  checkEapAction(
    action: string,
    countryCodeISO3: string,
    status: boolean,
    pcode: string,
    event: number,
  ) {
    return this.post(
      'eap-actions',
      {
        action,
        countryCode: countryCodeISO3,
        status,
        pcode,
        event,
      },
      false,
    ).toPromise();
  }
}
