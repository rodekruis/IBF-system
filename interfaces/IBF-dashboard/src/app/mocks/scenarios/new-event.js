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
  return {
    country_code: 'UGA',
    start_date: moment().format('YYYY-MM-DD'),
    end_date: null,
    id: '14',
  };
}

export function getTriggerPerLeadTime() {
  return {
    '1': '0',
    '2': '0',
    '3': '0',
    '4': '0',
    '5': '0',
    '6': '0',
    '7': '1',
    country_code: 'UGA',
    current_prev: 'Current',
  };
}

export function getTriggeredAreas() {
  return [
    {
      pcode: '21UGA006003',
      name: 'Bulambuli',
      population_affected: 646.299926757813,
    },
    {
      pcode: '21UGA013006',
      name: 'Kumi',
      population_affected: 432.408020019531,
    },
    {
      pcode: '21UGA013002',
      name: 'Bukedea',
      population_affected: 144.982131958008,
    },
  ];
}

export function getMatrixAggregates(leadTime) {
  var result = {
    population_affected: 1223.690078735352,
    population: 34416151,
    vulnerability_index: 3.67468563628745,
    poverty_incidence: 0.5935475982192198,
    female_head_hh: 0.236787625234443,
    population_u8: 0.31127200912153125,
    population_over65: 0.02857607996315451,
    wall_type: 0.4440357339494473,
    roof_type: 0.7053708065146507,
  };
  if (leadTime === '3-day') {
    result.population_affected = 0;
  }
  return result;
}

export function getStations(leadTime) {
  var result = {
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
          fc: '700',
          fc_trigger: '1',
          fc_perc: 1.08600352919032,
          fc_prob: '1',
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

  if (leadTime === '3-day') {
    result.features.forEach((feature) => {
      feature.properties.fc = '0';
      feature.properties.fc_trigger = '0';
      feature.properties.fc_perc = 0;
      feature.properties.fc_prob = '0';
    });
  }
  return result;
}

export function getAdminRegions(leadTime) {
  var result = JSON.parse(JSON.stringify(adminAreaData)); // Hack to clone without reference
  if (leadTime === '3-day') {
    result.features.forEach((feature) => {
      feature.properties.population_affected = 0;
    });
  }
  return result;
}
