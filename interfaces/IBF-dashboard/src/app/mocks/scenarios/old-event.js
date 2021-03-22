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
  return {
    countryCode: 'UGA',
    startDate: DateTime.now().minus({days: 12}).toFormat('yyyy-LL-dd'),
    endDate: DateTime.now().minus({days: 7}).toFormat('yyyy-LL-dd'),
    activeTrigger: false,
  };
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
    country_code: 'UGA',
    date: DateTime.now().toFormat('yyyy-LL-dd'),
  };
}

export function getTriggeredAreas() {
  return [
    {
      placeCode: "21UGA013005",
      name: "Katakwi",
      populationAffected: 4133.6044921875,
      eventPlaceCodeId: "c5cf9a42-12d6-46c4-8d72-18019ae7c42a",
      activeTrigger: false
    },
    {
      placeCode: "21UGA008008",
      name: "Napak",
      populationAffected: 3501.15771484375,
      eventPlaceCodeId: "9a4d3f64-9547-42f9-878e-e0e96613c304",
      activeTrigger: false
    },
    {
      placeCode: "21UGA013001",
      name: "Amuria",
      populationAffected: 2047.373046875,
      eventPlaceCodeId: "5b7457cf-d1f9-4258-8469-bc3db90a4d44",
      activeTrigger: false
    },
    {
      placeCode: "21UGA013004",
      name: "Kapelebyong",
      populationAffected: 1561.43115234375,
      eventPlaceCodeId: "95f414a1-c3f3-425e-96f5-d3354cc04d5b",
      activeTrigger: false
    },
    {
      placeCode: "21UGA008004",
      name: "Kotido",
      populationAffected: 961.6905517578125,
      eventPlaceCodeId: "8286f5fe-e9a6-4ad2-afdc-9dc9af3c0f26",
      activeTrigger: false
    },
    {
      placeCode: "21UGA008001",
      name: "Abim",
      populationAffected: 401.5565185546875,
      eventPlaceCodeId: "07b26d41-abb0-4931-b4d4-a3fe7eeb9ff1",
      activeTrigger: false
    }
  ];
}

export function getStations() {
  return JSON.parse(JSON.stringify(glofasStationData)); // Hack to clone without reference
}

export function getAdminRegions() {
  return JSON.parse(JSON.stringify(adminAreaData)); // Hack to clone without reference
}

