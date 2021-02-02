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

  get(
    endpoint: string,
    path: string,
    anonymous: boolean = true,
  ): Observable<any> {
    const security = this.showSecurity(anonymous);
    this.log(`ApiService GET: ${security} ${endpoint}${path}`);

    return this.http
      .get(endpoint + path, {
        headers: this.createHeaders(anonymous),
      })
      .pipe(
        tap((response) =>
          this.log(
            `ApiService GET: ${security} ${endpoint}${path}`,
            `\nResponse:`,
            response,
          ),
        ),
      );
  }

  post(
    endpoint: string,
    path: string,
    body: object,
    anonymous: boolean = false,
  ): Observable<any> {
    const security = this.showSecurity(anonymous);
    this.log(`ApiService POST: ${security} ${endpoint}${path}`, body);

    return this.http
      .post(endpoint + path, body, {
        headers: this.createHeaders(anonymous),
      })
      .pipe(
        tap((response) =>
          this.log(
            `ApiService POST: ${security} ${endpoint}${path}:`,
            body,
            `\nResponse:`,
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
      environment.api_url,
      'user/login',
      {
        email,
        password,
      },
      true,
    );
  }

  getCountries(): Promise<Country[]> {
    return this.get(environment.api_url, `country`, false)
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
      environment.api_url,
      `stations/${countryCodeISO3}/${leadTime}`,
      false,
    ).toPromise();
  }

  getRedCrossBranches(
    countryCodeISO3: string,
  ): Promise<GeoJSON.FeatureCollection> {
    return this.get(
      environment.api_url,
      `red-cross-branches/${countryCodeISO3}`,
      false,
    ).toPromise();
  }

  getWaterpoints(countryCodeISO3: string): Promise<GeoJSON.FeatureCollection> {
    return this.get(
      environment.api_url,
      `waterpoints/${countryCodeISO3}`,
      false,
    ).toPromise();
  }

  getRecentDates(countryCodeISO3: string): Promise<any> {
    return this.get(
      environment.api_url,
      `recent-dates/${countryCodeISO3}`,
      false,
    ).toPromise();
  }

  getTriggerPerLeadTime(countryCodeISO3: string): Promise<number> {
    return this.get(
      environment.api_url,
      `triggers/${countryCodeISO3}`,
      false,
    ).toPromise();
  }

  getEvent(countryCodeISO3: string): Promise<any> {
    return this.get(
      environment.api_url,
      `event/${countryCodeISO3}`,
      false,
    ).toPromise();
  }

  getAdminRegions(
    countryCodeISO3: string,
    leadTime: LeadTime = LeadTime.day7,
    adminLevel: AdminLevel = AdminLevel.adm1,
  ): Promise<GeoJSON.FeatureCollection> {
    return this.get(
      environment.api_url,
      `admin-area-data/${countryCodeISO3}/${adminLevel}/${leadTime}`,
      false,
    ).toPromise();
  }

  getTriggeredAreas(event: number) {
    return this.get(
      environment.api_url,
      `triggered-areas/${event}`,
      false,
    ).toPromise();
  }

  getMetadata(countryCodeISO3: string) {
    return this.get(
      environment.api_url,
      `metadata/${countryCodeISO3}`,
      false,
    ).toPromise();
  }

  getAreasOfFocus() {
    return this.get(
      environment.api_url,
      `eap-actions/areas-of-focus`,
      false,
    ).toPromise();
  }

  getEapActions(countryCodeISO3: string, pcode: string, event: number) {
    return this.get(
      environment.api_url,
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
      environment.api_url,
      `eap-actions`,
      {
        action,
        countryCodeISO3,
        status,
        pcode,
        event,
      },
      false,
    ).toPromise();
  }
}
