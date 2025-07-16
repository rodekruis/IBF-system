import { writable, derived } from 'svelte/store';
import type { Writable } from 'svelte/store';

// Types
export interface Country {
  countryCodeISO3: string;
  countryName: string;
  name: string;
  region: string;
  coordinates?: { lat: number; lng: number };
  defaultZoom?: number;
  population?: number;
  countryBounds: number[][];
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface DisasterType {
  disasterType: string;
  label: string;
  active: boolean;
}

export interface LayerData {
  id: string;
  name: string;
  active: boolean;
  type: 'wms' | 'geojson' | 'marker';
  url?: string;
  data?: any;
}

// Core app state
export const user: Writable<User | null> = writable(null);
export const selectedCountry: Writable<Country | null> = writable(null);
export const selectedDisasterType: Writable<DisasterType | null> = writable(null);
export const activeLayers: Writable<LayerData[]> = writable([]);
export const isLoading: Writable<boolean> = writable(false);
export const error: Writable<string | null> = writable(null);

// Available countries and disaster types
export const countries: Writable<Country[]> = writable([
  { 
    countryCodeISO3: 'UGA', 
    countryName: 'Uganda', 
    name: 'Uganda',
    region: 'East Africa',
    coordinates: { lat: 1.3733, lng: 32.2903 },
    defaultZoom: 7,
    population: 45741007,
    countryBounds: [[28.8, -1.5], [35.0, 4.2]] 
  },
  { 
    countryCodeISO3: 'ETH', 
    countryName: 'Ethiopia', 
    name: 'Ethiopia',
    region: 'East Africa',
    coordinates: { lat: 9.1450, lng: 40.4897 },
    defaultZoom: 6,
    population: 114963588,
    countryBounds: [[32.9, 3.4], [47.9, 14.9]] 
  },
  { 
    countryCodeISO3: 'KEN', 
    countryName: 'Kenya', 
    name: 'Kenya',
    region: 'East Africa',
    coordinates: { lat: -0.0236, lng: 37.9062 },
    defaultZoom: 6,
    population: 53771296,
    countryBounds: [[33.9, -4.7], [41.9, 5.5]] 
  },
  { 
    countryCodeISO3: 'PHL', 
    countryName: 'Philippines', 
    name: 'Philippines',
    region: 'Southeast Asia',
    coordinates: { lat: 12.8797, lng: 121.7740 },
    defaultZoom: 6,
    population: 109581078,
    countryBounds: [[114.0, 4.2], [126.6, 21.1]] 
  },
  { 
    countryCodeISO3: 'BGD', 
    countryName: 'Bangladesh', 
    name: 'Bangladesh',
    region: 'South Asia',
    coordinates: { lat: 23.6850, lng: 90.3563 },
    defaultZoom: 7,
    population: 164689383,
    countryBounds: [[88.0, 20.7], [92.7, 26.6]] 
  }
]);

export const disasterTypes: Writable<DisasterType[]> = writable([
  { disasterType: 'floods', label: 'Floods', active: true },
  { disasterType: 'drought', label: 'Drought', active: true },
  { disasterType: 'typhoon', label: 'Typhoon', active: true },
  { disasterType: 'cyclone', label: 'Cyclone', active: true },
  { disasterType: 'earthquake', label: 'Earthquake', active: false }
]);

// iframe configuration
export interface EmbedConfig {
  mode: 'full' | 'embed' | 'minimal';
  country?: string;
  disaster?: string;
  showControls: boolean;
  showLegend: boolean;
  height?: number;
}

export const embedConfig: Writable<EmbedConfig> = writable({
  mode: 'full',
  showControls: true,
  showLegend: true
});

// Network and performance
export const networkInfo = writable({
  online: true,
  effectiveType: '4g',
  downlink: 10
});

export const performanceMetrics = writable({
  loadTime: 0,
  bundleSize: 0,
  memoryUsage: 0
});

// Derived stores
export const isEmbedMode = derived(embedConfig, ($config) => $config.mode !== 'full');
export const shouldShowControls = derived(embedConfig, ($config) => $config.showControls);
export const isMinimalMode = derived(embedConfig, ($config) => $config.mode === 'minimal');

// Helper functions
export function setCountry(country: Country) {
  selectedCountry.set(country);
  error.set(null);
}

export function setDisasterType(disaster: DisasterType) {
  selectedDisasterType.set(disaster);
  error.set(null);
}

export function addLayer(layer: LayerData) {
  activeLayers.update(layers => [...layers, layer]);
}

export function removeLayer(layerId: string) {
  activeLayers.update(layers => layers.filter(l => l.id !== layerId));
}

export function toggleLayer(layerId: string) {
  activeLayers.update(layers =>
    layers.map(layer =>
      layer.id === layerId
        ? { ...layer, active: !layer.active }
        : layer
    )
  );
}

export function setError(message: string | null) {
  error.set(message);
  if (message) {
    console.error('IBF Error:', message);
  }
}

export function setLoading(loading: boolean) {
  isLoading.set(loading);
}

// Initialize embed configuration from URL parameters
export function initializeEmbedConfig() {
  if (typeof window === 'undefined') return;
  
  const urlParams = new URLSearchParams(window.location.search);
  
  embedConfig.update(config => ({
    ...config,
    mode: urlParams.get('embed') === 'true' ? 'embed' : 
          urlParams.get('minimal') === 'true' ? 'minimal' : 'full',
    country: urlParams.get('country') || undefined,
    disaster: urlParams.get('disaster') || undefined,
    showControls: urlParams.get('controls') !== 'false',
    showLegend: urlParams.get('legend') !== 'false',
    height: urlParams.get('height') ? parseInt(urlParams.get('height')!) : undefined
  }));

  // Set iframe class if in embed mode
  if (urlParams.get('embed') === 'true' || urlParams.get('minimal') === 'true') {
    document.body.classList.add('iframe-mode');
  }
}

// Performance monitoring
export function trackPerformance(metric: string, value: number) {
  performanceMetrics.update(metrics => ({
    ...metrics,
    [metric]: value
  }));
  
  // Send to analytics in production
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Analytics integration would go here
    console.log(`Performance: ${metric} = ${value}`);
  }
}
