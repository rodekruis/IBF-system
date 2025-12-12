export enum DisasterType {
  Floods = 'floods',
  Malaria = 'malaria',
  Drought = 'drought',
  Typhoon = 'typhoon',
  FlashFloods = 'flash-floods',
}

export const DISASTER_TYPE_LABEL: Record<DisasterType, string> = {
  [DisasterType.Floods]: 'Flood',
  [DisasterType.Malaria]: 'Malaria',
  [DisasterType.Drought]: 'Drought',
  [DisasterType.Typhoon]: 'Typhoon',
  [DisasterType.FlashFloods]: 'Flash Flood',
};

// https://www.glidenumber.net/glide/public/search/search.jsp
export const DISASTER_TYPE_CODE: Record<DisasterType, string> = {
  [DisasterType.Floods]: 'FL',
  [DisasterType.Malaria]: 'EP',
  [DisasterType.Drought]: 'DR',
  [DisasterType.Typhoon]: 'TC',
  [DisasterType.FlashFloods]: 'FF',
};
