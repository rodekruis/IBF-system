/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { HttpService, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';

@Injectable()
export class WaterpointsService {
  public constructor(private httpService: HttpService) {}

  public async getWaterpoints(
    countryCode: string,
  ): Promise<AxiosResponse<any>> {
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
      `$where=water_source is not null&` +
      `$limit=100000&` +
      `status_id=yes&` +
      `country_id=${countryCodeShort}`;

    return new Promise(resolve => {
      this.httpService.get(path).subscribe(response => {
        const result = response.data;
        result.features.forEach(feature => {
          feature.properties = {
            wpdxId: feature.properties.wpdx_id,
            activityId: feature.properties.activity_id,
            type: feature.properties.water_source,
            reportDate: feature.properties.report_date.substr(0, 10),
          };
        });
        console.log('Nr of features: ', result.features.length);
        resolve(result);
      });
    });
  }
}
