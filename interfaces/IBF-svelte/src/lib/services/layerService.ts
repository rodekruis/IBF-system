// Layer Service - Manages map layers and point data for IBF Dashboard
import { ibfApiService } from './ibfApi';
import config, { getGeoserverUrl } from '../config';

// Layer types based on IBF Dashboard
export enum LayerType {
  point = 'point',
  shape = 'shape',
  wms = 'wms'
}

export enum LayerGroup {
  adminRegions = 'adminRegions',
  aggregates = 'aggregates',
  outline = 'outline',
  point = 'point',
  wms = 'wms'
}

export enum LayerName {
  adminRegions = 'adminRegions',
  glofasStations = 'glofas_stations',
  typhoonTrack = 'typhoon_track',
  waterpoints = 'waterpoints',
  waterpointsInternal = 'waterpoints_internal',
  healthSites = 'health_sites',
  schools = 'schools',
  redCrossBranches = 'red_cross_branches',
  evacuationCenters = 'evacuation_centers',
  damSites = 'dams',
  communityNotifications = 'community_notifications',
  gauges = 'gauges'
}

// IBF Layer structure
export interface IBFLayer {
  name: string;
  label: string;
  type: LayerType;
  group?: LayerGroup;
  active: boolean;
  show: boolean;
  description?: string;
  data?: any; // GeoJSON data
  leafletLayer?: any; // Leaflet layer instance
  order?: number;
  leadTimeDependent?: boolean;
  dynamic?: boolean;
  wms?: WMSLayerConfig; // WMS configuration
  legendColor?: any; // Legend color information
}

// WMS Layer Configuration (based on IBF Dashboard)
export interface WMSLayerConfig {
  url: string;
  name: string;
  format: string;
  version: string;
  attribution: string;
  crs?: any; // Leaflet CRS
  transparent: boolean;
  viewparams?: string;
  leadTimeDependent: boolean;
}

// Point data types based on IBF Dashboard
export interface Station {
  stationName: string;
  stationCode: string;
  dynamicData?: {
    forecastLevel: number;
    triggerLevel: number;
    forecastReturnPeriod: number;
    eapAlertClass: string;
  };
}

export interface TyphoonTrackPoint {
  timestampOfTrackpoint: string;
  windspeed: number;
  category: string;
  firstLandfall: boolean;
  closestToLand: boolean;
}

export interface Waterpoint {
  wpdxId: string;
  activityId: string;
  type: string;
  reportDate: string;
}

export interface HealthSite {
  name: string;
  type: string;
  dynamicData?: { exposure: string };
}

export interface School {
  name: string;
  type: string;
  dynamicData?: { exposure: string };
}

export interface WaterpointInternal {
  name: string;
  type: string;
  dynamicData?: { exposure: string };
}

export interface RedCrossBranch {
  branchName: string;
  numberOfVolunteers: number;
  contactPerson: string;
  contactAddress: string;
  contactNumber: string;
}

export interface EvacuationCenter {
  evacuationCenterName: string;
  countryCodeISO3: string;
  latitude: string;
  longitude: string;
}

export interface DamSite {
  damName: string;
  countryCodeISO3: string;
  fullSupplyCapacity: number;
  latitude: string;
  longitude: string;
}

export interface CommunityNotification {
  nameVolunteer: string;
  nameVillage: string;
  description: string;
  type: string;
  uploadTime: string;
  dismissed: boolean;
  pointDataId: string;
  photoUrl: string;
}

export interface RiverGauge {
  fid: string;
  name: string;
  dynamicData: {
    'water-level': string;
    'water-level-previous': string;
    'water-level-reference': string;
  };
  pointDataId: string;
}

// Icon configurations based on IBF Dashboard
export const MARKER_ICON_CONFIG = {
  base: {
    iconSize: [28, 42],
    iconAnchor: [24, 42],
    popupAnchor: [0, -28]
  },
  
  // Point marker types
  markers: {
    glofasStation: {
      default: '/assets/markers/glofas-station-no-trigger.svg',
      min: '/assets/markers/glofas-station-min-trigger.svg',
      med: '/assets/markers/glofas-station-med-trigger.svg',
      max: '/assets/markers/glofas-station-max-trigger.svg'
    },
    waterpoint: {
      default: '/assets/markers/water-point-marker.svg',
      exposed: '/assets/markers/water-point-marker-exposed.svg'
    },
    healthSite: {
      default: '/assets/markers/health-center-marker.svg',
      exposed: '/assets/markers/health-center-marker-exposed.svg'
    },
    school: {
      default: '/assets/markers/school-marker.svg',
      exposed: '/assets/markers/school-marker-exposed.svg'
    },
    redCrossBranch: '/assets/markers/red-cross-marker.svg',
    evacuationCenter: '/assets/markers/evacuation-center-marker.svg',
    damSite: '/assets/markers/dam-marker.svg',
    communityNotification: '/assets/markers/community-notification-marker.svg',
    riverGauge: '/assets/markers/river-gauge-marker.svg',
    typhoonTrack: '/assets/markers/typhoon-track.png'
  }
};

class LayerService {
  private layers: IBFLayer[] = [];
  private layerCache = new Map<string, any>();
  private currentCountryCode: string | null = null;

  /**
   * Get available layers for a country and disaster type
   */
  async getLayersForCountry(countryCodeISO3: string, disasterType: string): Promise<IBFLayer[]> {
    try {
      console.log(`🗺️ Loading layers for ${countryCodeISO3} - ${disasterType}`);
      
      // Store current country code for WMS layer configuration
      this.currentCountryCode = countryCodeISO3;
      
      const response = await ibfApiService.getLayers(countryCodeISO3, disasterType);
      
      if (response.error || !response.data) {
        console.warn('⚠️ No layers data available, using fallback layers');
        return this.getFallbackLayers(disasterType);
      }

      // Transform layer metadata to IBFLayer format
      const layers = response.data.map(layerMeta => this.transformLayerMetadata(layerMeta));
      
      console.log(`✅ Loaded ${layers.length} layers:`, layers.map(l => l.name));
      this.layers = layers;
      
      return layers;
    } catch (error) {
      console.error('❌ Error loading layers:', error);
      return this.getFallbackLayers(disasterType);
    }
  }

  /**
   * Load data for a specific layer
   */
  async loadLayerData(
    layer: IBFLayer, 
    countryCodeISO3: string, 
    disasterType: string,
    eventName?: string
  ): Promise<any> {
    const cacheKey = `${layer.name}_${countryCodeISO3}_${disasterType}_${eventName || 'no-event'}`;
    
    // Check cache first
    if (this.layerCache.has(cacheKey)) {
      console.log(`🗄️ Using cached data for layer: ${layer.name}`);
      return this.layerCache.get(cacheKey);
    }

    try {
      let layerData: any = null;

      // Load data based on layer type and name
      switch (layer.name) {
        case LayerName.waterpoints:
          console.log(`💧 Loading waterpoints for ${countryCodeISO3}`);
          const waterpointsResponse = await ibfApiService.getWaterpoints(countryCodeISO3);
          layerData = waterpointsResponse.data || null;
          break;

        case LayerName.typhoonTrack:
          console.log(`🌀 Loading typhoon track for ${countryCodeISO3}`);
          const typhoonResponse = await ibfApiService.getTyphoonTrack(countryCodeISO3, eventName);
          layerData = typhoonResponse.data || null;
          break;

        case LayerName.glofasStations:
        case LayerName.healthSites:
        case LayerName.schools:
        case LayerName.waterpointsInternal:
        case LayerName.redCrossBranches:
        case LayerName.evacuationCenters:
        case LayerName.damSites:
        case LayerName.communityNotifications:
        case LayerName.gauges:
          console.log(`📍 Loading point data for ${layer.name} in ${countryCodeISO3}`);
          const pointDataResponse = await ibfApiService.getPointData(countryCodeISO3, layer.name);
          layerData = pointDataResponse.data || null;
          break;

        default:
          console.log(`⚠️ Unknown layer type: ${layer.name}, skipping data load`);
          break;
      }

      // Cache the data
      if (layerData) {
        this.layerCache.set(cacheKey, layerData);
        const featureCount = layerData?.features?.length || (Array.isArray(layerData) ? layerData.length : 0);
        console.log(`✅ Loaded data for layer ${layer.name}: ${featureCount} features`);
      }

      return layerData;
    } catch (error) {
      console.error(`❌ Error loading data for layer ${layer.name}:`, error);
      return null;
    }
  }

  /**
   * Create Leaflet marker for point data based on layer type
   */
  createPointMarker(feature: any, layerName: string, L: any): any {
    const { geometry, properties } = feature;
    const [lng, lat] = geometry.coordinates;
    const latlng = L.latLng(lat, lng);

    // Get appropriate icon based on layer type and properties
    const iconUrl = this.getMarkerIcon(layerName, properties);
    
    const markerOptions = {
      icon: L.icon({
        iconUrl,
        ...MARKER_ICON_CONFIG.base
      })
    };

    const marker = L.marker(latlng, markerOptions);

    // Add popup with feature information
    const popupContent = this.createPopupContent(layerName, properties);
    if (popupContent) {
      marker.bindPopup(popupContent);
    }

    return marker;
  }

  /**
   * Get appropriate marker icon URL based on layer and properties
   */
  private getMarkerIcon(layerName: string, properties: any): string {
    const { markers } = MARKER_ICON_CONFIG;

    switch (layerName) {
      case LayerName.glofasStations:
        const alertClass = properties.dynamicData?.eapAlertClass || 'no';
        if (alertClass === 'max') return markers.glofasStation.max;
        if (alertClass === 'med') return markers.glofasStation.med;
        if (alertClass === 'min') return markers.glofasStation.min;
        return markers.glofasStation.default;

      case LayerName.waterpoints:
        return markers.waterpoint.default;

      case LayerName.waterpointsInternal:
        return properties.dynamicData?.exposure 
          ? markers.waterpoint.exposed 
          : markers.waterpoint.default;

      case LayerName.healthSites:
        return properties.dynamicData?.exposure 
          ? markers.healthSite.exposed 
          : markers.healthSite.default;

      case LayerName.schools:
        return properties.dynamicData?.exposure 
          ? markers.school.exposed 
          : markers.school.default;

      case LayerName.redCrossBranches:
        return markers.redCrossBranch;

      case LayerName.evacuationCenters:
        return markers.evacuationCenter;

      case LayerName.damSites:
        return markers.damSite;

      case LayerName.communityNotifications:
        return markers.communityNotification;

      case LayerName.gauges:
        return markers.riverGauge;

      case LayerName.typhoonTrack:
        return markers.typhoonTrack;

      default:
        return markers.waterpoint.default; // Fallback
    }
  }

  /**
   * Create popup content for a point feature
   */
  private createPopupContent(layerName: string, properties: any): string {
    let content = `<div class="marker-popup">`;

    switch (layerName) {
      case LayerName.glofasStations:
        content += `
          <h4>${properties.stationName || 'Station'}</h4>
          <p><strong>Code:</strong> ${properties.stationCode || 'N/A'}</p>
          ${properties.dynamicData ? `
            <p><strong>Alert Class:</strong> ${properties.dynamicData.eapAlertClass || 'None'}</p>
            <p><strong>Forecast Level:</strong> ${properties.dynamicData.forecastLevel || 'N/A'}</p>
            <p><strong>Trigger Level:</strong> ${properties.dynamicData.triggerLevel || 'N/A'}</p>
          ` : ''}
        `;
        break;

      case LayerName.healthSites:
        content += `
          <h4>${properties.name || 'Health Site'}</h4>
          <p><strong>Type:</strong> ${properties.type || 'N/A'}</p>
          ${properties.dynamicData?.exposure ? `
            <p><strong>Status:</strong> <span style="color: red;">Exposed</span></p>
          ` : '<p><strong>Status:</strong> <span style="color: green;">Safe</span></p>'}
        `;
        break;

      case LayerName.schools:
        content += `
          <h4>${properties.name || 'School'}</h4>
          <p><strong>Type:</strong> ${properties.type || 'N/A'}</p>
          ${properties.dynamicData?.exposure ? `
            <p><strong>Status:</strong> <span style="color: red;">Exposed</span></p>
          ` : '<p><strong>Status:</strong> <span style="color: green;">Safe</span></p>'}
        `;
        break;

      case LayerName.waterpoints:
        content += `
          <h4>Waterpoint</h4>
          <p><strong>ID:</strong> ${properties.wpdxId || 'N/A'}</p>
          <p><strong>Type:</strong> ${properties.type || 'N/A'}</p>
          <p><strong>Report Date:</strong> ${properties.reportDate || 'N/A'}</p>
        `;
        break;

      case LayerName.waterpointsInternal:
        content += `
          <h4>${properties.name || 'Waterpoint'}</h4>
          <p><strong>Type:</strong> ${properties.type || 'N/A'}</p>
          ${properties.dynamicData?.exposure ? `
            <p><strong>Status:</strong> <span style="color: red;">Exposed</span></p>
          ` : '<p><strong>Status:</strong> <span style="color: green;">Safe</span></p>'}
        `;
        break;

      case LayerName.redCrossBranches:
        content += `
          <h4>${properties.branchName || 'Red Cross Branch'}</h4>
          <p><strong>Volunteers:</strong> ${properties.numberOfVolunteers || 'N/A'}</p>
          <p><strong>Contact:</strong> ${properties.contactPerson || 'N/A'}</p>
          ${properties.contactNumber ? `<p><strong>Phone:</strong> ${properties.contactNumber}</p>` : ''}
        `;
        break;

      case LayerName.evacuationCenters:
        content += `
          <h4>${properties.evacuationCenterName || 'Evacuation Center'}</h4>
          <p><strong>Location:</strong> ${properties.latitude}, ${properties.longitude}</p>
        `;
        break;

      case LayerName.damSites:
        content += `
          <h4>${properties.damName || 'Dam Site'}</h4>
          <p><strong>Capacity:</strong> ${properties.fullSupplyCapacity || 'N/A'}</p>
        `;
        break;

      case LayerName.typhoonTrack:
        content += `
          <h4>Typhoon Track Point</h4>
          <p><strong>Time:</strong> ${properties.timestampOfTrackpoint || 'N/A'}</p>
          <p><strong>Category:</strong> ${properties.category || 'N/A'}</p>
          <p><strong>Wind Speed:</strong> ${properties.windspeed || 'N/A'} km/h</p>
          ${properties.firstLandfall ? '<p><strong>First Landfall</strong></p>' : ''}
          ${properties.closestToLand ? '<p><strong>Closest to Land</strong></p>' : ''}
        `;
        break;

      default:
        content += `<h4>Point of Interest</h4><p>Click for details</p>`;
        break;
    }

    content += `</div>`;
    return content;
  }

  /**
   * Transform layer metadata from API to IBFLayer format
   */
  private transformLayerMetadata(layerMeta: any): IBFLayer {
    const layer: IBFLayer = {
      name: layerMeta.name,
      label: layerMeta.label || layerMeta.name,
      type: layerMeta.type as LayerType,
      group: this.getLayerGroup(layerMeta.type),
      active: layerMeta.active === 'yes' || layerMeta.active === true,
      show: true,
      description: layerMeta.description ? JSON.stringify(layerMeta.description) : '',
      leadTimeDependent: layerMeta.leadTimeDependent || false,
      dynamic: layerMeta.dynamic || false,
      order: layerMeta.order || 10,
      legendColor: layerMeta.legendColor
    };

    // Add WMS configuration for WMS layers
    if (layerMeta.type === LayerType.wms) {
      layer.wms = {
        url: getGeoserverUrl(),
        name: layerMeta.name, // WMS layer name
        format: 'image/png',
        version: '1.1.0',
        attribution: '510 Global',
        transparent: true,
        leadTimeDependent: layerMeta.leadTimeDependent || false,
        viewparams: `countryCodeISO3:${this.currentCountryCode || ''}`
      };
    }

    return layer;
  }

  /**
   * Get layer group based on layer type
   */
  private getLayerGroup(layerType: string): LayerGroup {
    switch (layerType) {
      case LayerType.point:
        return LayerGroup.point;
      case LayerType.shape:
        return LayerGroup.adminRegions;
      case LayerType.wms:
        return LayerGroup.wms;
      default:
        return LayerGroup.point;
    }
  }

  /**
   * Get fallback layers when API is not available
   */
  private getFallbackLayers(disasterType: string): IBFLayer[] {
    const commonLayers: IBFLayer[] = [
      {
        name: LayerName.waterpoints,
        label: 'Waterpoints',
        type: LayerType.point,
        group: LayerGroup.point,
        active: false,
        show: true,
        order: 1
      },
      {
        name: LayerName.healthSites,
        label: 'Health Sites',
        type: LayerType.point,
        group: LayerGroup.point,
        active: false,
        show: true,
        order: 2
      },
      {
        name: LayerName.schools,
        label: 'Schools',
        type: LayerType.point,
        group: LayerGroup.point,
        active: false,
        show: true,
        order: 3
      }
    ];

    // Add disaster-specific layers
    if (disasterType === 'floods' || disasterType === 'flash-floods') {
      commonLayers.push({
        name: LayerName.glofasStations,
        label: 'Glofas Stations',
        type: LayerType.point,
        group: LayerGroup.point,
        active: true,
        show: true,
        order: 0
      });
    }

    if (disasterType === 'typhoon') {
      commonLayers.push({
        name: LayerName.typhoonTrack,
        label: 'Typhoon Track',
        type: LayerType.point,
        group: LayerGroup.point,
        active: true,
        show: true,
        order: 0
      });
    }

    return commonLayers;
  }

  /**
   * Clear layer cache
   */
  clearCache(): void {
    this.layerCache.clear();
    console.log('🗑️ Layer cache cleared');
  }

  /**
   * Get current layers
   */
  getLayers(): IBFLayer[] {
    return this.layers;
  }

  /**
   * Update layer active state
   */
  updateLayerState(layerName: string, active: boolean): void {
    const layer = this.layers.find(l => l.name === layerName);
    if (layer) {
      layer.active = active;
      console.log(`🔄 Updated layer ${layerName} active state: ${active}`);
    }
  }
}

// Export singleton instance
export const layerService = new LayerService();
export default layerService;
