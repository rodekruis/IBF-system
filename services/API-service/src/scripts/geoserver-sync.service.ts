import fs from 'fs';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { firstValueFrom } from 'rxjs';

import { DisasterType } from '../api/disaster/disaster-type.enum';
import { INTERNAL_GEOSERVER_API_URL } from '../config';
import { DisasterTypeGeoServerMapper } from './disaster-type-geoserver-file.mapper';
import countries from './json/countries.json';

const workspaceName = 'ibf-system';

class ResourceNameObject {
  resourceName: string;
  disasterType: DisasterType;
  countryCodeISO3: string;
}

@Injectable()
export class GeoserverSyncService {
  constructor(private httpService: HttpService) {}

  public async sync(
    countryCodeISO3?: string,
    disasterType?: DisasterType,
  ): Promise<void> {
    const countriesCopy = JSON.parse(JSON.stringify(countries));
    const filteredCountries = countriesCopy.filter((country) => {
      return countryCodeISO3
        ? country.countryCodeISO3 === countryCodeISO3
        : true;
    });
    // also filter by disaster type
    for (const country of filteredCountries) {
      const disasterSettings = country.countryDisasterSettings.filter(
        (disasterSetting) => {
          return disasterType
            ? disasterSetting.disasterType === disasterType
            : true;
        },
      );
      country.countryDisasterSettings = disasterSettings;
    }
    const geoserverResourceNameObjects =
      this.generateGeoserverResourceNames(filteredCountries);

    await this.syncStores(geoserverResourceNameObjects);
    await this.syncLayers(geoserverResourceNameObjects);
  }

  private async syncStores(expectedStoreNameObjects: ResourceNameObject[]) {
    const foundStoreNames =
      await this.getStoreNamesFromGeoserver(workspaceName);
    const missingStoreNames = expectedStoreNameObjects.filter(
      (o) => !foundStoreNames.includes(o.resourceName),
    );
    await this.postStoreNamesToGeoserver(missingStoreNames);
  }

  private generateGeoserverResourceNames(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filteredCountries: any[],
  ): ResourceNameObject[] {
    const resourceNameObjects = [];
    for (const country of filteredCountries) {
      resourceNameObjects.push(...this.generateStoreNameForCountry(country));
    }
    return resourceNameObjects;
  }

  private generateStoreNameForCountry(country): ResourceNameObject[] {
    const resourceNameObjects = [];
    const countryCode = country.countryCodeISO3;
    for (const disasterSetting of country.countryDisasterSettings) {
      if (disasterSetting.disasterType == DisasterType.Floods) {
        for (const leadTime of disasterSetting.activeLeadTimes) {
          const disasterTypeStorePrefix =
            DisasterTypeGeoServerMapper.getLayerStorePrefixForDisasterType(
              disasterSetting.disasterType,
            );
          const resourceName = `${disasterTypeStorePrefix}_${leadTime}_${countryCode}`;
          resourceNameObjects.push({
            resourceName: resourceName,
            disasterType: disasterSetting.disasterType,
            countryCodeISO3: countryCode,
          });
        }
      }
    }
    return resourceNameObjects;
  }

  private async getStoreNamesFromGeoserver(workspaceName: string) {
    const data = await this.get(`workspaces/${workspaceName}/coveragestores`);
    const storeNames = data.coverageStores.coverageStore.map(
      (store) => store.name,
    );
    return storeNames;
  }

  private async postStoreNamesToGeoserver(
    resourceNameObjects: ResourceNameObject[],
  ) {
    for (const resourceNameObject of resourceNameObjects) {
      const subfolder = DisasterTypeGeoServerMapper.getSubfolderForDisasterType(
        resourceNameObject.disasterType,
      );
      if (
        !fs.existsSync(
          `./geoserver-volume/raster-files/output/${subfolder}/${resourceNameObject.resourceName}.tif`,
        )
      ) {
        throw new HttpException(
          {
            error: `File not found: ./geoserver-volume/raster-files/output/${subfolder}/${resourceNameObject.resourceName}.tif`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      const url = `workspaces/${workspaceName}/coveragestores`; // replace with the correct API endpoint
      const body = {
        coverageStore: {
          name: resourceNameObject.resourceName,
          workspace: workspaceName,
          enabled: true,
          type: 'GeoTIFF',
          url: `file:workspaces/ibf-system/ibf-pipeline/output/${subfolder}/${resourceNameObject.resourceName}.tif`,
        },
      };
      const result = await this.post(url, body);
      console.log(
        'Updated geoserver with ',
        result,
        'please commit the resulting config changes of geoserver to git.',
      );
    }
  }

  public async syncLayers(expectedLayerNames: ResourceNameObject[]) {
    const foundLayerNames =
      await this.getLayerNamesFromGeoserver(workspaceName);
    const missingLayerNames = expectedLayerNames.filter(
      (o) => !foundLayerNames.includes(o.resourceName),
    );
    await this.postLayerNamesToGeoserver(missingLayerNames);
  }

  private async getLayerNamesFromGeoserver(workspaceName: string) {
    const data = await this.get(`workspaces/${workspaceName}/layers`);
    const layerNames = data.layers.layer.map((layer) => layer.name);
    return layerNames;
  }

  private async postLayerNamesToGeoserver(
    resourceNameObjects: ResourceNameObject[],
  ) {
    for (const resourceNameObject of resourceNameObjects) {
      const publishLayerUrl = `workspaces/${workspaceName}/coveragestores/${resourceNameObject.resourceName}/coverages`;
      const publishLayerBody = {
        coverage: {
          name: resourceNameObject.resourceName,
          title: resourceNameObject.resourceName,
          nativeName: resourceNameObject.resourceName,
        },
      };
      await this.post(publishLayerUrl, publishLayerBody);
      // Set the default style for the layer
      const styleName =
        DisasterTypeGeoServerMapper.generateStyleForCountryAndDisasterType(
          resourceNameObject.countryCodeISO3,
          resourceNameObject.disasterType,
        );
      const styleUrl = `layers/${resourceNameObject.resourceName}`;
      const body = {
        layer: {
          defaultStyle: {
            name: `${workspaceName}:${styleName}`,
          },
        },
      };
      await this.put(styleUrl, body);
    }
  }

  private async post(path: string, body: unknown) {
    const url = `${INTERNAL_GEOSERVER_API_URL}/${path}`;
    const headers = this.getHeaders();
    const result = await firstValueFrom(
      this.httpService.post(url, body, { headers }),
    );
    return result.data;
  }

  private async put(path: string, body: unknown) {
    const url = `${INTERNAL_GEOSERVER_API_URL}/${path}`;
    const headers = this.getHeaders();
    const result = await firstValueFrom(
      this.httpService.put(url, body, { headers }),
    );
    return result.data;
  }

  private async get(path: string) {
    const url = `${INTERNAL_GEOSERVER_API_URL}/${path}`;
    const headers = this.getHeaders();
    const result = await firstValueFrom(this.httpService.get(url, { headers }));
    return result.data;
  }

  private getHeaders() {
    const username = 'admin';
    return {
      Authorization:
        'Basic ' +
        Buffer.from(
          username + ':' + process.env.GEOSERVER_ADMIN_PASSWORD,
        ).toString('base64'),
    };
  }
}
