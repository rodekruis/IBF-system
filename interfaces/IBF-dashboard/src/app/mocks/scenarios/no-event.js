import adminAreaData from './admin-area-data.json';
import * as moment from 'moment';

export function getRecentDates() {
  return [
    {
      date: moment().format('YYYY-MM-DD'),
    },
  ];
}

export function getEvent() {
  return null;
}

export function getTriggerPerLeadTime() {
  return {
    '1': '0',
    '2': '0',
    '3': '0',
    '4': '0',
    '5': '0',
    '6': '0',
    '7': '0',
    country_code: 'UGA',
    current_prev: 'Current',
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
        geometry: {
          type: 'Point',
          coordinates: [34.04999924, 0.150000006],
        },
        properties: {
          country_code: 'UGA',
          lead_time: '7-day',
          station_code: 'G5195',
          station_name: 'NZOIA AT RUAMBWA FERRY (1EF01)',
          trigger_level: 1951.601318,
          fc: '0',
          fc_trigger: '0',
          fc_perc: 0,
          fc_prob: '0',
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [33.84999847, 1.75],
        },
        properties: {
          country_code: 'UGA',
          lead_time: '7-day',
          station_code: 'G5196',
          station_name: 'Akokorio at Uganda Gauge',
          trigger_level: 125.1974792,
          fc: '0',
          fc_trigger: '0',
          fc_perc: 0,
          fc_prob: '0',
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [33.95000076, 1.649999976],
        },
        properties: {
          country_code: 'UGA',
          lead_time: '7-day',
          station_code: 'G5200',
          station_name: 'Magoro Ngariam',
          trigger_level: 644.5651245,
          fc: '100',
          fc_trigger: '0',
          fc_perc: 0.15,
          fc_prob: '0',
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [34.04999924, 2.450000048],
        },
        properties: {
          country_code: 'UGA',
          lead_time: '7-day',
          station_code: 'G6106',
          station_name: 'Kapelebyong',
          trigger_level: 160.9732056,
          fc: '0',
          fc_trigger: '0',
          fc_perc: 0,
          fc_prob: '0',
        },
      },
    ],
  };
}

export function getAdminRegions() {
  var result = JSON.parse(JSON.stringify(adminAreaData)); // Hack to clone without reference
  result.features.forEach((feature) => {
    feature.properties.population_affected = 0;
  });
  return result;
}
