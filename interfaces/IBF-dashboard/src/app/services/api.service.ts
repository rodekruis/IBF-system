import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtService } from 'src/app/services/jwt.service';
import { AdminLevel } from 'src/app/types/admin-level.enum';
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

  getStations(
    countryCode: string,
    leadTime: string,
  ): Promise<GeoJSON.FeatureCollection> {
    return this.get(
      environment.api_url,
      `stations/${countryCode}/${leadTime}`,
      false,
    ).toPromise();
  }

  getRecentDates(countryCode: string): Promise<any> {
    return this.get(
      environment.api_url,
      `recent-dates/${countryCode}`,
      false,
    ).toPromise();
  }

  getTriggerPerLeadTime(countryCode: string): Promise<number> {
    return this.get(
      environment.api_url,
      `triggers/${countryCode}`,
      false,
    ).toPromise();
  }

  getEvent(countryCode: string): Promise<any> {
    return this.get(
      environment.api_url,
      `event/${countryCode}`,
      false,
    ).toPromise();
  }

  getAdminRegions(
    countryCode: string,
    leadTime: string,
    adminLevel: AdminLevel,
  ): Promise<GeoJSON.FeatureCollection> {
    return this.get(
      environment.api_url,
      `admin-area-data/${countryCode}/${adminLevel}/${leadTime}`,
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

  getAdminRegionsStatic(
    countryCode: string,
    adminLevel: AdminLevel,
  ): Promise<GeoJSON.FeatureCollection> {
    return this.get(
      environment.api_url,
      `admin-static/${countryCode}/${adminLevel}`,
      false,
    ).toPromise();
  }

  getMatrixAggregates(
    countryCode: string,
    leadTime: string,
    adminLevel: AdminLevel,
  ) {
    return this.get(
      environment.api_url,
      `matrix-aggregates/${countryCode}/${adminLevel}/${leadTime}`,
      false,
    ).toPromise();
  }

  getMetadata(countryCode: string) {
    return this.get(
      environment.api_url,
      `metadata/${countryCode}`,
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

  getEapActions(countryCode: string, pcode: string, event: number) {
    return this.get(
      environment.api_url,
      `eap-actions/${countryCode}/${pcode}/${event}`,
      false,
    ).toPromise();
  }

  checkEapAction(
    action: string,
    countryCode: string,
    status: boolean,
    pcode: string,
    event: number,
  ) {
    return this.post(
      environment.api_url,
      `eap-actions`,
      {
        action,
        countryCode,
        status,
        pcode,
        event,
      },
      false,
    ).toPromise();
  }
}
