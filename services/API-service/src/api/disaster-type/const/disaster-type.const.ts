import { DisasterType } from '../disaster-type.enum';

export const EVENT_AREA_DISASTER_TYPES = [
  DisasterType.Floods,
  // DisasterType.Drought, // REFACTOR: too slow for current on-the-fly calculation. Refactor would be to create an events table and calculate union only once in /events/process.
  DisasterType.FlashFloods,
];
