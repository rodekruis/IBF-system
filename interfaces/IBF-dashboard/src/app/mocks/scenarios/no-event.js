import { DateTime } from 'luxon';
import adminAreaData from './admin-area-data.json';
import glofasStationData from './glofas-station-data.json';

export function getRecentDates() {
  return [
    {
      date: DateTime.now().toFormat('yyyy-LL-dd'),
    },
  ];
}

export function getEvent() {
  return null;
}

export function getTriggerPerLeadTime() {
  return {
    1: '0',
    2: '0',
    3: '0',
    4: '0',
    5: '0',
    6: '0',
    7: '0',
    countryCodeISO3: 'UGA',
    date: DateTime.now().toFormat('yyyy-LL-dd'),
  };
}

export function getTriggeredAreas() {
  return [];
}

export function getStations() {
  return JSON.parse(JSON.stringify(glofasStationData)); // Hack to clone without reference
}

export function getAdminRegions() {
  return JSON.parse(JSON.stringify(adminAreaData)); // Hack to clone without reference
}
