import { HttpService, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { WKTStringFromGeometry } from 'wkt-io-ts';
import { isRight } from 'fp-ts/lib/Either';
import { CountryService } from '../country/country.service';
import { GeoJson } from '../data/geo.model';

@Injectable()
export class WaterpointsService {
    private httpService: HttpService;
    private countryService: CountryService;

    private headers = { 'X-App-Token': process.env.WATERPOINTDATA_TOKEN };

    public constructor(
        httpService: HttpService,
        countryService: CountryService,
    ) {
        this.httpService = httpService;
        this.countryService = countryService;
    }

    public async getWaterpoints(
        countryCodeISO3: string,
    ): Promise<AxiosResponse<GeoJson>> {
        const country = await this.countryService.findOne(countryCodeISO3);

        const countryWkt = WKTStringFromGeometry.decode(
            country.countryBoundingBox,
        );
        if (!isRight(countryWkt)) {
            throw new Error('Country Bounding Box is not valid');
        }

        const path =
            `https://data.waterpointdata.org/resource/amwk-dedf.geojson` +
            `?$where=water_source is not null` +
            ` AND water_source !='Lake'` +
            ` AND within_polygon(location, '${countryWkt.right}')` +
            `&$limit=100000` +
            `&status_id=yes` +
            `&country_id=${country.countryCodeISO2}`;

        return new Promise((resolve, reject): void => {
            this.httpService.get(path, { headers: this.headers }).subscribe({
                next: (response): void => {
                    const result = response.data;
                    result.features.forEach((feature): void => {
                        feature.properties = {
                            wpdxId: feature.properties.wpdx_id,
                            activityId: feature.properties.activity_id,
                            type: feature.properties.water_source,
                            reportDate: feature.properties.report_date.substr(
                                0,
                                10,
                            ),
                        };
                    });
                    resolve(result);
                },
                error: reject,
            });
        });
    }
}
