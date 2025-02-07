import { DisasterType } from '../api/disaster-type/disaster-type.enum';

export class DisasterTypeGeoServerMapper {
  static getLayerStorePrefixForDisasterType(
    disasterType: DisasterType,
  ): string {
    if (disasterType === DisasterType.Floods) {
      return 'flood_extent';
    } else if (disasterType === DisasterType.Drought) {
      return 'rainfall_forecast';
    } else if (disasterType === DisasterType.FlashFloods) {
      return 'flood_extent';
    }
    return '';
  }

  static getDestFilePrefixForDisasterType(disasterType: DisasterType): string {
    if (disasterType === DisasterType.Floods) {
      return 'flood_extent';
    } else if (disasterType === DisasterType.Drought) {
      return 'rain_rp';
    } else if (disasterType === DisasterType.FlashFloods) {
      return 'flood_extent';
    }
    return '';
  }

  static getSubfolderForDisasterType(disasterType: DisasterType): string {
    let subfolder = '';
    if (
      [DisasterType.Floods, DisasterType.FlashFloods].includes(disasterType)
    ) {
      subfolder = 'flood_extents';
    } else if ([DisasterType.Drought].includes(disasterType)) {
      subfolder = 'rainfall_extents';
    }
    return subfolder;
  }

  static generateStyleForCountryAndDisasterType(
    countryCode: string,
    disasterType: DisasterType,
  ): string {
    if (disasterType === DisasterType.Drought) {
      return 'rainfall_extent_drought';
    } else if (disasterType === DisasterType.FlashFloods) {
      return 'flood_extent_MWI_flash-floods';
    } else if (disasterType === DisasterType.Floods) {
      if (countryCode === 'PHL') {
        return 'flood_extent_PHL';
      } else {
        return 'flood_extent';
      }
    }
    throw new Error(
      `No style found for disaster type' ${disasterType} and country code ${countryCode}`,
    );
  }
}
