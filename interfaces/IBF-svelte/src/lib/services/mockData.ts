// Mock data service for IBF dashboard when backend is not available
export const MOCK_COUNTRIES = [
  { countryCodeISO3: 'UGA', countryName: 'Uganda', countryBounds: [[28.8, -1.5], [35.0, 4.2]] },
  { countryCodeISO3: 'ETH', countryName: 'Ethiopia', countryBounds: [[32.9, 3.4], [47.9, 14.9]] },
  { countryCodeISO3: 'KEN', countryName: 'Kenya', countryBounds: [[33.9, -4.7], [41.9, 5.5]] },
  { countryCodeISO3: 'MWI', countryName: 'Malawi', countryBounds: [[32.6, -17.1], [35.9, -9.3]] },
  { countryCodeISO3: 'MOZ', countryName: 'Mozambique', countryBounds: [[30.2, -26.9], [40.8, -10.4]] },
  { countryCodeISO3: 'ZMB', countryName: 'Zambia', countryBounds: [[21.9, -18.1], [33.7, -8.2]] },
  { countryCodeISO3: 'ZWE', countryName: 'Zimbabwe', countryBounds: [[25.2, -22.4], [33.1, -15.6]] },
  { countryCodeISO3: 'PHL', countryName: 'Philippines', countryBounds: [[114.0, 4.2], [126.6, 21.1]] },
  { countryCodeISO3: 'BGD', countryName: 'Bangladesh', countryBounds: [[88.0, 20.7], [92.7, 26.6]] }
];

export const MOCK_DISASTER_TYPES = [
  { disasterType: 'floods', label: 'Floods', active: true },
  { disasterType: 'drought', label: 'Drought', active: true },
  { disasterType: 'typhoon', label: 'Typhoon', active: true },
  { disasterType: 'cyclone', label: 'Cyclone', active: true },
  { disasterType: 'earthquake', label: 'Earthquake', active: false }
];

export function generateMockEvents(countryCode: string, disasterType: string) {
  const events: any[] = [];
  const country = MOCK_COUNTRIES.find(c => c.countryCodeISO3 === countryCode);
  
  if (!country) return [];

  const [minLon, minLat] = country.countryBounds[0];
  const [maxLon, maxLat] = country.countryBounds[1];

  // Generate 2-5 mock events within country bounds
  const eventCount = Math.floor(Math.random() * 4) + 2;
  
  for (let i = 0; i < eventCount; i++) {
    const lat = minLat + Math.random() * (maxLat - minLat);
    const lon = minLon + Math.random() * (maxLon - minLon);
    
    events.push({
      id: `${countryCode}_${disasterType}_${i}`,
      disasterType,
      lat,
      lon,
      affectedPeople: Math.floor(Math.random() * 50000) + 1000,
      severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      description: `${disasterType} event in ${country.countryName}`
    });
  }
  
  return events;
}

export function generateMockLayers(countryCode: string) {
  const country = MOCK_COUNTRIES.find(c => c.countryCodeISO3 === countryCode);
  if (!country) return [];

  return [
    {
      id: `${countryCode}_population`,
      name: 'Population Density',
      active: true,
      type: 'wms' as const,
      data: {
        visible: true,
        opacity: 0.7,
        colorScheme: 'YlOrRd'
      }
    },
    {
      id: `${countryCode}_vulnerability`,
      name: 'Vulnerability Index',
      active: false,
      type: 'wms' as const,
      data: {
        visible: false,
        opacity: 0.6,
        colorScheme: 'RdYlBu_r'
      }
    },
    {
      id: `${countryCode}_flood_risk`,
      name: 'Flood Risk Areas',
      active: true,
      type: 'geojson' as const,
      data: {
        visible: true,
        opacity: 0.5,
        color: '#0066cc'
      }
    },
    {
      id: `${countryCode}_infrastructure`,
      name: 'Critical Infrastructure',
      active: false,
      type: 'marker' as const,
      data: {
        visible: false,
        markerType: 'hospital'
      }
    }
  ];
}

export function generateMockDashboardData(countryCode: string, disasterType?: string) {
  console.log(`Generating mock dashboard data for: ${countryCode}, disaster: ${disasterType}`);
  const country = MOCK_COUNTRIES.find(c => c.countryCodeISO3 === countryCode);
  
  if (!country) {
    console.log(`Country ${countryCode} not found in mock data`);
    return {
      country: null,
      disasters: [],
      layers: [],
      events: []
    };
  }

  const layers = generateMockLayers(countryCode);
  const allEvents: any[] = [];
  
  // Generate events for all disaster types if no specific type requested
  const typesToGenerate = disasterType 
    ? [disasterType] 
    : MOCK_DISASTER_TYPES.filter(dt => dt.active).map(dt => dt.disasterType);
    
  console.log('Generating events for disaster types:', typesToGenerate);
    
  for (const type of typesToGenerate) {
    const eventsForType = generateMockEvents(countryCode, type);
    console.log(`Generated ${eventsForType.length} events for ${type}`);
    allEvents.push(...eventsForType);
  }

  const result = {
    country: {
      ...country,
      population: Math.floor(Math.random() * 100000000) + 1000000,
      riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      lastUpdate: new Date().toISOString()
    },
    disasters: MOCK_DISASTER_TYPES,
    layers,
    events: allEvents
  };
  
  console.log(`Generated dashboard data with ${result.events.length} total events:`, result);
  return result;
}

// Simulate network delay for more realistic behavior
export function delay(ms: number = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock API responses with proper structure
export class MockApiService {
  async getCountries() {
    await delay(300);
    return { data: MOCK_COUNTRIES, status: 200 };
  }

  async getCountry(countryCode: string) {
    await delay(200);
    const country = MOCK_COUNTRIES.find(c => c.countryCodeISO3 === countryCode);
    return country 
      ? { data: country, status: 200 }
      : { error: 'Country not found', status: 404 };
  }

  async getDisasterTypes() {
    await delay(200);
    return { data: MOCK_DISASTER_TYPES, status: 200 };
  }

  async getEvents(countryCode: string, disasterType: string) {
    await delay(400);
    const events = generateMockEvents(countryCode, disasterType);
    return { data: events, status: 200 };
  }

  async getLayers(countryCode: string) {
    await delay(350);
    const layers = generateMockLayers(countryCode);
    return { data: layers, status: 200 };
  }

  async getDashboardData(countryCode: string, disasterType?: string) {
    console.log(`MockApiService.getDashboardData called with: ${countryCode}, ${disasterType}`);
    await delay(600);
    const data = generateMockDashboardData(countryCode, disasterType);
    console.log('MockApiService.getDashboardData generated:', data);
    return { data, status: 200 };
  }

  async healthCheck() {
    await delay(100);
    return { data: { status: 'mock_service_healthy' }, status: 200 };
  }
}
