import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { JwtService } from './jwt.service';

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
    console.log('ApiService : login()');

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

  getStations(countryCode: string, leadTime: string): Promise<[]> {
    return this.get(
      environment.api_url,
      `stations/${countryCode}/${leadTime}`,
    ).toPromise();
  }

  getAdminRegions(
    countryCode: string,
    adminLevel: number,
    leadTime: string,
  ): Promise<[]> {
    return this.get(
      environment.api_url,
      `admin-area-data/${countryCode}/${adminLevel}/${leadTime}`,
    ).toPromise();
  }
}
