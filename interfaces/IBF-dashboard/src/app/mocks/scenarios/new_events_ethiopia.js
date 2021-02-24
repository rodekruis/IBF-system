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
    country_code: 'ETH',
    start_date: moment().format('YYYY-MM-DD'),
    end_date: null,
    id: '14',
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
    7: '1',
    country_code: 'ETH',
    current_prev: 'Current',
  };
}

export function getTriggeredAreas() {
  return [
    {
      pcode: 'ET0203',
      name: 'Zone 3',
      population_affected: 646.299926757813,
    },
    {
      pcode: 'ET0506',
      name: 'Shabelle',
      population_affected: 432.408020019531,
    },
  ];
}

export function getStations(leadTime) {
  var result = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [40.15, 9.15],
        },
        properties: {
          country_code: 'ETH',
          lead_time: '7-day',
          station_code: 'G1067',
          station_name: 'Melka Sedi',
          trigger_level: 719.30,
          fc: '0',
          fc_trigger: '0',
          fc_perc: 0,
          fc_prob: '0',#75%
        },
      },
	  {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [40.15, 9.15],
        },
        properties: {
          country_code: 'ETH',
          lead_time: '3-day',
          station_code: 'G1067',
          station_name: 'Melka Sedi',
          trigger_level: 870.71,
          fc: '0',
          fc_trigger: '0',
          fc_perc: 0,
          fc_prob: '0',#85%
        },
      },
	  
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [44.85, 5.05],
        },
        properties: {
          country_code: 'ETH',
          lead_time: '7-day',
          station_code: 'G1904',
          station_name: 'No Name',
          trigger_level: 1695.02,
          fc: '0',
          fc_trigger: '0',
          fc_perc: 0,
          fc_prob: '0',#75%
        },
      },
	  {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [44.85, 5.05],
        },
        properties: {
          country_code: 'ETH',
          lead_time: '3-day',
          station_code: 'G1904',
          station_name: 'No Name',
          trigger_level: 2086.84,
          fc: '0',
          fc_trigger: '0',
          fc_perc: 0,
          fc_prob: '0',#85%
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