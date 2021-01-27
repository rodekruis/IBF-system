import { HttpService, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { GeoJson } from '../data/geo.model';

@Injectable()
export class WaterpointsService {
  private httpService: HttpService;
  private headers = { 'X-App-Token': process.env.WATERPOINTDATA_TOKEN };

  public constructor(httpService: HttpService) {
    this.httpService = httpService;
  }

  public async getWaterpoints(
    countryCode: string,
  ): Promise<AxiosResponse<GeoJson>> {
    let countryCodeShort;
    switch (countryCode) {
      case 'KEN':
        countryCodeShort = 'KE';
      case 'ZMB':
        countryCodeShort = 'ZM';
      case 'UGA':
        countryCodeShort = 'UG';
      case 'ETH':
        countryCodeShort = 'ET';
      default:
        countryCodeShort = countryCode.substr(0, 2);
    }
    const path =
      `https://data.waterpointdata.org/resource/amwk-dedf.geojson?` +
      `$where=water_source is not null AND ` +
      `water_source !='Lake'&` +
      `$limit=100000&` +
      `status_id=yes&` +
      `country_id=${countryCodeShort}`;

    return new Promise((resolve): void => {
      this.httpService
        .get(path, { headers: this.headers })
        .subscribe((response): void => {
          const result = response.data;
          result.features.forEach((feature): void => {
            feature.properties = {
              wpdxId: feature.properties.wpdx_id,
              activityId: feature.properties.activity_id,
              type: feature.properties.water_source,
              reportDate: feature.properties.report_date.substr(0, 10),
            };
          });
          resolve(result);
        });
    });
  }
}
