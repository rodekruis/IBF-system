import adminAreaData from './admin-area-data.json';
import { DateTime } from 'luxon';

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
    country_code: 'UGA',
    date: DateTime.now().toFormat('yyyy-LL-dd'),
  };
}

export function getTriggeredAreas() {
  return [];
}

export function getStations() {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [33.95, 0.95] },
        properties: {
          country_code: 'UGA',
          lead_time: '5-day',
          station_code: 'DWRM1',
          station_name: 'R. Manafwa at Butaleja',
          trigger_level: 841,
          fc: 59.2738970588,
          fc_trigger: '0',
          fc_perc: 0.0704802580960761,
          fc_prob: '0',
        },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [32.15, 0.65] },
        properties: {
          country_code: 'UGA',
          lead_time: '5-day',
          station_code: 'DWRM10',
          station_name: 'R. Mayanja',
          trigger_level: 84,
          fc: 3.1121323529,
          fc_trigger: '0',
          fc_perc: 0.037049194677381,
          fc_prob: '0',
        },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [30.95, 1.15] },
        properties: {
          country_code: 'UGA',
          lead_time: '5-day',
          station_code: 'DWRM12',
          station_name: 'R. Nkusi',
          trigger_level: 28,
          fc: 1.6231617647,
          fc_trigger: '0',
          fc_perc: 0.057970063025,
          fc_prob: '0',
        },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [33.85, 1.75] },
        properties: {
          country_code: 'UGA',
          lead_time: '5-day',
          station_code: 'DWRM14',
          station_name: 'Akokoro at Uganda Gauge',
          trigger_level: 100,
          fc: 7.5980392157,
          fc_trigger: '0',
          fc_perc: 0.075980392157,
          fc_prob: '0',
        },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [34.05, 0.25] },
        properties: {
          country_code: 'UGA',
          lead_time: '5-day',
          station_code: 'DWRM2',
          station_name: 'R. Sio',
          trigger_level: 92,
          fc: 40.9552696078,
          fc_trigger: '0',
          fc_perc: 0.445165973997826,
          fc_prob: '0',
        },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [33.75, 0.75] },
        properties: {
          country_code: 'UGA',
          lead_time: '5-day',
          station_code: 'DWRM3',
          station_name: 'R. Mpologoma at Budumba',
          trigger_level: 427,
          fc: 82.7626953125,
          fc_trigger: '0',
          fc_perc: 0.193823642418033,
          fc_prob: '0',
        },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [30.75, 0.85] },
        properties: {
          country_code: 'UGA',
          lead_time: '5-day',
          station_code: 'DWRM7',
          station_name: 'R. Muzizi',
          trigger_level: 21,
          fc: 1.9914215686,
          fc_trigger: '0',
          fc_perc: 0.0948295985047619,
          fc_prob: '0',
        },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [29.75, -0.75] },
        properties: {
          country_code: 'UGA',
          lead_time: '5-day',
          station_code: 'DWRM9',
          station_name: 'R. Mitano',
          trigger_level: 104,
          fc: 22.0508578431,
          fc_trigger: '0',
          fc_perc: 0.212027479260577,
          fc_prob: '0',
        },
      },
    ],
  };
}

export function getAdminRegions() {
  var result = JSON.parse(JSON.stringify(adminAreaData)); // Hack to clone without reference
  result.features.forEach((feature) => {
    feature.properties.populationAffected = 0;
  });
  return result;
}
