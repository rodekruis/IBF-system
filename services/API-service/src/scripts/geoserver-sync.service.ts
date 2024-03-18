import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom, map } from 'rxjs';
import { INTERNAL_GEOSERVER_API_URL } from '../config';
import countries from './json/countries.json';
import { DisasterType } from '../api/disaster/disaster-type.enum';
import { DisasterTypeGeoServerMapper } from './disaster-type-geoserver-file.mapper';
import * as fs from 'fs';

const workspaceName = 'ibf-system';

class RecourceNameObject {
  resourceName: string;
  disasterType: DisasterType;
  countryCodeISO3: string;
}

@Injectable()
export class GeoseverSyncService {
  constructor(private httpService: HttpService) {}

  public async sync(
    countryCodeISO3?: string,
    disasterType?: DisasterType,
  ): Promise<void> {
    const filteredCountries = countries.filter((country: any) => {
      return countryCodeISO3
        ? country.countryCodeISO3 === countryCodeISO3
        : true;
    });
    // also filter by disaster type
    for (const country of filteredCountries) {
      const disasterSettings = country.countryDisasterSettings.filter(
        (disasterSetting: any) => {
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

  private async syncStores(expectedStoreNameObjects: RecourceNameObject[]) {
    const foundStoreNames = await this.getStoreNamesFromGeoserver(
      workspaceName,
    );
    const missingStoreNames = expectedStoreNameObjects.filter(
      (o) => !foundStoreNames.includes(o.resourceName),
    );
    await this.postStoreNamesToGeoserver(missingStoreNames);
  }

  private generateGeoserverResourceNames(
    filteredCountries: any[],
  ): RecourceNameObject[] {
    const resourceNameObjects = [];
    for (const country of filteredCountries) {
      resourceNameObjects.push(...this.generateStoreNameForCountry(country));
    }
    return resourceNameObjects;
  }

  private generateStoreNameForCountry(country: any): RecourceNameObject[] {
    const resourceNameObjects = [];
    const countryCode = country.countryCodeISO3;
    for (const disasterSetting of country.countryDisasterSettings) {
      if (disasterSetting.disasterType == DisasterType.Floods) {
        for (const leadTime of disasterSetting.activeLeadTimes) {
          const disasterTypeStorePrefix =
            DisasterTypeGeoServerMapper.getLayerStorePrefixForDisasterType(
              disasterSetting.disasterType
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
      (store: any) => store.name,
    );
    return storeNames;
  }

  private async postStoreNamesToGeoserver(
    resourceNameObjects: RecourceNameObject[],
  ) {
    for (const resourceNameObject of resourceNameObjects) {
      const subfolder = DisasterTypeGeoServerMapper.getSubfolderForDisasterType(
        resourceNameObject.disasterType,
      );
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

  public async syncLayers(expectedLayerNames: RecourceNameObject[]) {
    const foundLayerNames = await this.getLayerNamesFromGeoserver(
      workspaceName,
    );
    const missingLayerNames = expectedLayerNames.filter(
      (o) => !foundLayerNames.includes(o.resourceName),
    );
    await this.postLayerNamesToGeoserver(missingLayerNames);
  }

  private async getLayerNamesFromGeoserver(workspaceName: string) {
    const data = await this.get(`workspaces/${workspaceName}/layers`);
    const layerNames = data.layers.layer.map((layer: any) => layer.name);
    return layerNames;
  }

  private async postLayerNamesToGeoserver(
    resourceNameObjects: RecourceNameObject[],
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
        DisasterTypeGeoServerMapper.getStyleForCountryAndDisasterType(
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

  private async post(path: string, body: any) {
    const url = `${INTERNAL_GEOSERVER_API_URL}/${path}`;
    const headers = this.getHeaders();
    const result = await firstValueFrom(
      this.httpService.post(url, body, { headers }),
    );
    return result.data;
  }

  private async put(path: string, body: any) {
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
