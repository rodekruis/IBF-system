import { Injectable } from '@nestjs/common';
import { GeoJson, GeoJsonFeature } from './geo.model';

@Injectable()
export class HelperService {
  public toGeojson(rawResult): GeoJson {
    const geoJson: GeoJson = {
      type: 'FeatureCollection',
      features: [],
    };
    rawResult.forEach((i): void => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        geometry: i.geom,
        properties: {},
      };
      delete i.geom;
      feature.properties = i;
      geoJson.features.push(feature);
    });

    return geoJson;
  }

  public getLast12hourInterval(triggeredDate?: string) {
    const last12hourInterval = triggeredDate
      ? new Date(triggeredDate)
      : new Date();
    // The update frequency is 12 hours, so dividing up in 2 12-hour intervals
    if (last12hourInterval.getHours() >= 12) {
      last12hourInterval.setHours(12, 0, 0, 0);
    } else {
      last12hourInterval.setHours(0, 0, 0, 0);
    }
    return last12hourInterval;
  }
}
