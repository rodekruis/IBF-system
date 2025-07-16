// IBF API Service - Real API integration for disaster forecasting data
import { setError, setLoading } from '../stores/app';
import config from '../config';
import { authService } from './auth';

// IBF API Base URL - Use proxy in development to avoid CORS issues
const IBF_API_BASE_URL = import.meta.env.DEV ? '/api/ibf' : 'https://ibf-test.510.global/api';

// Type definitions for IBF API responses
export interface IBFCountry {
  countryCodeISO3: string;
  countryName: string;
  countryBounds?: number[][];
  adminLevel?: number;
  leadTimes?: string[];
  countryLogos?: any;
  eapActions?: any;
  countryDisasterSettings?: IBFDisasterSetting[];
}

export interface IBFDisasterSetting {
  disasterType: string;
  label?: string;
  active: boolean;
  leadTimeValue: string;
  leadTimeUnit: string;
  droughtForecastSeasons?: any[];
}

export interface IBFAdminArea {
  placeCode: string;
  name: string;
  adminLevel: number;
  countryCodeISO3: string;
  geom?: any;
}

// GeoJSON types for admin area boundaries
export interface GeoJSONGeometry {
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
  coordinates: any[];
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    adm2_en?: string;        // District name in English
    adm2_pcode?: string;     // District place code
    adm1_en?: string;        // Region name in English  
    adm1_pcode?: string;     // Region place code
    [key: string]: any;      // Additional properties
  };
  geometry: GeoJSONGeometry;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface IBFEvent {
  countryCodeISO3: string;
  disasterType: string;
  eventName?: string;
  thresholdOperator?: string;
  thresholdValue?: number;
  date?: string;
  adminAreas?: IBFAdminArea[];
}

export interface IBFMetadata {
  countryCodeISO3: string;
  disasterType: string;
  leadTime: string;
  metadataProperties: any;
}

interface IBFApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

class IBFApiService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private currentToken: string | null = null;

  constructor() {
    // Clear cache every 15 minutes
    setInterval(() => this.clearExpiredCache(), 15 * 60 * 1000);
  }

  /**
   * Set a manual token for testing (bypasses login)
   */
  setManualToken(token: string): void {
    this.currentToken = token;
    console.log('🔑 Manual token set for testing');
  }

  /**
   * Get or refresh IBF authentication token
   */
  private async getIbfToken(): Promise<string | null> {
    // Get token from the main authentication service
    const token = authService.getAuthToken();
    
    if (token) {
      console.log('✅ Using token from auth service');
      return token;
    }
    
    console.log('❌ No token available from auth service');
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheTTL: number = 10 * 60 * 1000, // 10 minutes default cache
    showGlobalLoading: boolean = true // Whether to show global loading spinner
  ): Promise<IBFApiResponse<T>> {
    const url = `${IBF_API_BASE_URL}${endpoint}`;
    const cacheKey = `${url}:${JSON.stringify(options)}`;

    // Check cache for GET requests (unless disabled)
    if ((!options.method || options.method === 'GET') && !config.disableApiCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        console.log(`🗄️ Cache hit for: ${endpoint}`);
        return { data: cached.data, status: 200 };
      }
    }

    // Add cache-busting headers when cache is disabled
    const extraHeaders: Record<string, string> = config.disableApiCache ? {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    } : {};

    try {
      if (showGlobalLoading) {
        setLoading(true);
      }
      
      // Get IBF authentication token
      const token = await this.getIbfToken();
      
      const method = options.method || 'GET';
      const finalHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'VRC',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...extraHeaders, // Add cache-busting headers when cache is disabled
        ...options.headers
      };

      // Detailed request logging
      console.group(`🌐 IBF API Request: ${method} ${endpoint}${config.disableApiCache ? ' [CACHE DISABLED]' : ''}`);
      console.log(`📍 Full URL: ${url}`);
      console.log(`🔧 Method: ${method}`);
      console.log(`🎯 Endpoint: ${endpoint}`);
      console.log(`🗄️ Cache Status: ${config.disableApiCache ? 'DISABLED' : 'ENABLED'}`);
      console.log(`🔑 Has Token: ${!!token}`);
      if (token) {
        console.log(`🎫 Token Preview: ${token.substring(0, 10)}...`);
      }
      console.log(`📋 Headers:`, finalHeaders);
      if (options.body) {
        console.log(`📦 Body:`, options.body);
      }
      console.groupEnd();

      const response = await fetch(url, {
        ...options,
        headers: finalHeaders
      });

      const data = await response.json();

      if (!response.ok) {
        console.group(`❌ IBF API Error: ${method} ${endpoint}`);
        console.log(`📍 URL: ${url}`);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        console.log(`📄 Response:`, data);
        console.groupEnd();
        
        // If we get 401/403, try to refresh the token
        if (response.status === 401 || response.status === 403) {
          console.log('🔄 Authentication failed, trying to refresh token...');
          this.currentToken = null;
          const newToken = await this.getIbfToken();
          
          if (newToken) {
            // Retry the request once with new token
            const retryHeaders = {
              ...finalHeaders,
              'Authorization': `Bearer ${newToken}`
            };
            const retryResponse = await fetch(url, {
              ...options,
              headers: retryHeaders
            });
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              console.log('✅ Retry successful after token refresh');
              return { data: retryData, status: retryResponse.status };
            }
          }
        }
        
        return {
          error: data.message || `IBF API Error: ${response.status}`,
          status: response.status
        };
      }

      // Cache successful GET requests (unless disabled)
      if ((!options.method || options.method === 'GET') && !config.disableApiCache) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: cacheTTL
        });
      }

      // Success logging with detailed response preview
      console.group(`✅ IBF API Success: ${method} ${endpoint}`);
      console.log(`📍 URL: ${url}`);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      console.log(`📦 Data Size: ${JSON.stringify(data).length} characters`);
      
      // Enhanced response preview
      if (Array.isArray(data)) {
        console.log(`📋 Array Length: ${data.length} items`);
        console.log(`📄 First ${Math.min(data.length, 3)} items:`, data.slice(0, 3));
      } else if (data && typeof data === 'object') {
        console.log(`📄 Object Keys:`, Object.keys(data));
        
        // Show first 100 lines of JSON representation
        const jsonString = JSON.stringify(data, null, 2);
        const lines = jsonString.split('\n');
        const preview = lines.slice(0, 100).join('\n');
        const truncated = lines.length > 100;
        
      
        if (truncated) {
          console.log(`... [${lines.length - 100} more lines truncated]`);
        }
      } else {
        console.log(`📄 Response Data:`, data);
      }
      
      console.groupEnd();
      
      return { data, status: response.status };

    } catch (error) {
      const method = options.method || 'GET';
      const message = error instanceof Error ? error.message : 'IBF API Network Error';
      console.group(`💥 IBF API Network Error: ${method} ${endpoint}`);
      console.log(`📍 URL: ${url}`);
      console.log(`⚠️ Error:`, error);
      console.groupEnd();
      setError(message);
      return { error: message, status: 0 };
    } finally {
      if (showGlobalLoading) {
        setLoading(false);
      }
    }
  }

  private clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // ============= Countries =============
  
  /**
   * Get all countries available in IBF system
   */
  async getCountries(): Promise<IBFApiResponse<IBFCountry[]>> {
    return this.request<IBFCountry[]>('/country', {}, 30 * 60 * 1000); // Cache for 30 minutes
  }

  /**
   * Get specific country details
   */
  async getCountry(countryCodeISO3: string): Promise<IBFApiResponse<IBFCountry>> {
    return this.request<IBFCountry>(`/country?countryCodes=${countryCodeISO3}`, {}, 30 * 60 * 1000);
  }

  // ============= Disaster Types =============

  /**
   * Get disaster types for a specific country
   */
  async getDisasterTypes(countryCodeISO3: string): Promise<IBFApiResponse<IBFDisasterSetting[]>> {
    // Try to get the country data first
    const countriesResult = await this.getCountries();
    if (countriesResult.data) {
      const country = countriesResult.data.find(c => c.countryCodeISO3 === countryCodeISO3);
      if (country?.countryDisasterSettings) {
        return {
          data: country.countryDisasterSettings,
          status: 200
        };
      }
    }
    return { error: 'No disaster types found for country', status: 404 };
  }

  // ============= Admin Areas =============

  /**
   * Get admin areas for a country at specified level (returns GeoJSON FeatureCollection)
   */
  async getAdminAreas(
    countryCodeISO3: string, 
    adminLevel: number = 2
  ): Promise<IBFApiResponse<GeoJSONFeatureCollection>> {
    // Try the request first - some endpoints might be public
    console.log(`🗺️ Attempting to get admin areas for ${countryCodeISO3} at level ${adminLevel}`);
    
    // First try without authentication to see if it's a public endpoint
    try {
      const url = `${IBF_API_BASE_URL}/admin-areas/${countryCodeISO3}/${adminLevel}`;
      console.log(`🌐 Trying public access to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'VRC'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Public admin areas access successful for ${countryCodeISO3}`);
        return { data, status: response.status };
      } else {
        console.log(`❌ Public access failed with status: ${response.status}, trying authenticated request...`);
      }
    } catch (error) {
      console.log(`❌ Public access error:`, error);
    }
    
    // Fall back to authenticated request
    return this.request<GeoJSONFeatureCollection>(
      `/admin-areas/${countryCodeISO3}/${adminLevel}`,
      {},
      20 * 60 * 1000 // Cache for 20 minutes
    );
  }

  /**
   * Get admin area geometries (alias for getAdminAreas for backward compatibility)
   */
  async getAdminAreaGeometry(
    countryCodeISO3: string,
    adminLevel: number = 2
  ): Promise<IBFApiResponse<GeoJSONFeatureCollection>> {
    return this.getAdminAreas(countryCodeISO3, adminLevel);
  }

  /**
   * Convert GeoJSON FeatureCollection to simplified admin area list
   */
  async getAdminAreasList(
    countryCodeISO3: string,
    adminLevel: number = 2
  ): Promise<IBFApiResponse<IBFAdminArea[]>> {
    const geoJsonResult = await this.getAdminAreas(countryCodeISO3, adminLevel);
    
    if (geoJsonResult.error || !geoJsonResult.data) {
      return {
        error: geoJsonResult.error || 'Failed to fetch admin areas',
        status: geoJsonResult.status
      };
    }

    // Convert GeoJSON features to simplified admin area objects
    const adminAreas: IBFAdminArea[] = geoJsonResult.data.features.map(feature => ({
      placeCode: feature.properties.adm2_pcode || feature.properties.adm1_pcode || 'UNKNOWN',
      name: feature.properties.adm2_en || feature.properties.adm1_en || 'Unknown Area',
      adminLevel: adminLevel,
      countryCodeISO3: countryCodeISO3,
      geom: feature.geometry
    }));

    return {
      data: adminAreas,
      status: geoJsonResult.status
    };
  }

  // ============= Events & Triggers =============

  /**
   * Get active events/triggers for a country and disaster type
   */
  async getEvents(
    countryCodeISO3: string,
    disasterType: string,
    leadTime?: string
  ): Promise<IBFApiResponse<IBFEvent[]>> {
    const params = new URLSearchParams();
    if (leadTime) params.set('leadTime', leadTime);
    
    const endpoint = `/event/${countryCodeISO3}/${disasterType}${params.toString() ? '?' + params.toString() : ''}`;
    return this.request<IBFEvent[]>(endpoint, {}, 5 * 60 * 1000); // Cache for 5 minutes - events change frequently
  }

  /**
   * Get event data with admin area details
   */
  async getEventData(
    countryCodeISO3: string,
    disasterType: string,
    leadTime?: string
  ): Promise<IBFApiResponse<any>> {
    const params = new URLSearchParams();
    if (leadTime) params.set('leadTime', leadTime);
    
    const endpoint = `/event/${countryCodeISO3}/${disasterType}/data${params.toString() ? '?' + params.toString() : ''}`;
    return this.request<any>(endpoint, {}, 5 * 60 * 1000);
  }

  // ============= Metadata & Indicators =============

  /**
   * Get metadata for country, disaster type, and lead time
   */
  async getMetadata(
    countryCodeISO3: string,
    disasterType: string,
    leadTime: string
  ): Promise<IBFApiResponse<IBFMetadata[]>> {
    return this.request<IBFMetadata[]>(
      `/metadata/${countryCodeISO3}/${disasterType}/${leadTime}`,
      {},
      15 * 60 * 1000 // Cache for 15 minutes
    );
  }

  /**
   * Get indicator data for visualization layers
   */
  async getIndicatorData(
    countryCodeISO3: string,
    disasterType: string,
    leadTime: string,
    indicatorName: string
  ): Promise<IBFApiResponse<any>> {
    return this.request<any>(
      `/indicators/${countryCodeISO3}/${disasterType}/${leadTime}/${indicatorName}`,
      {},
      10 * 60 * 1000
    );
  }

  // ============= Authentication =============

  /**
   * Get user profile (requires authentication)
   */
  async getUserProfile(): Promise<IBFApiResponse<any>> {
    return this.request<any>('/user/current');
  }

  // ============= Health Check =============

  /**
   * Check if IBF API is healthy
   */
  async healthCheck(): Promise<IBFApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health', {}, 60 * 1000); // Cache for 1 minute
  }

  // ============= Dashboard Data (Consolidated) =============

  /**
   * Get comprehensive dashboard data for a country and disaster type
   * This consolidates multiple API calls for better performance
   */
  async getDashboardData(
    countryCodeISO3: string,
    disasterType?: string,
    leadTime?: string
  ): Promise<IBFApiResponse<{
    country: IBFCountry;
    adminAreas: GeoJSONFeatureCollection | null; // GeoJSON for map display
    adminAreasList: IBFAdminArea[];               // Simplified list for other uses
    events: IBFEvent[];
    metadata: IBFMetadata[];
    disasterTypes: IBFDisasterSetting[];
    layers: any[]; // Include layers for compatibility
  }>> {
    try {
      console.log(`Loading dashboard data for ${countryCodeISO3}, disaster: ${disasterType}`);

      // Load country info first to get available disaster types
      const countryResponse = await this.getCountry(countryCodeISO3);
      if (!countryResponse.data) {
        return { error: 'Country not found', status: 404 };
      }

      const country = countryResponse.data;
      const availableDisasters = country.countryDisasterSettings || [];

      // If no disaster type specified, use the first active one
      const selectedDisaster = disasterType || 
        availableDisasters.find(d => d.active)?.disasterType ||
        (availableDisasters.length > 0 ? availableDisasters[0].disasterType : null);

      // Always load admin areas regardless of disaster type
      const [adminAreasGeoJson, adminAreasList] = await Promise.all([
        this.getAdminAreas(countryCodeISO3, country.adminLevel || 2), // GeoJSON for map
        this.getAdminAreasList(countryCodeISO3, country.adminLevel || 2), // Simplified list
      ]);

      // If no disaster type available, return with just admin areas
      if (!selectedDisaster) {
        console.log('🔍 No disaster type found, returning admin areas only');
        return {
          data: {
            country,
            adminAreas: adminAreasGeoJson.data || null, // Always include admin areas!
            adminAreasList: adminAreasList.data || [],
            events: [],
            metadata: [],
            disasterTypes: availableDisasters,
            layers: [{
              id: `${countryCodeISO3}_admin_areas`,
              name: 'Administrative Areas',
              active: true,
              type: 'geojson' as const,
              data: {
                visible: true,
                opacity: 0.7,
                adminAreas: adminAreasList.data || []
              }
            }]
          },
          status: 200
        };
      }

      // Get lead time
      const selectedDisasterSettings = availableDisasters.find(d => d.disasterType === selectedDisaster);
      const selectedLeadTime = leadTime || selectedDisasterSettings?.leadTimeValue || '1-day';

      // Load disaster-specific data
      const [eventsResponse, metadataResponse] = await Promise.all([
        this.getEvents(countryCodeISO3, selectedDisaster, selectedLeadTime),
        this.getMetadata(countryCodeISO3, selectedDisaster, selectedLeadTime)
      ]);

      // Debug: Check admin areas responses
      console.group('🔍 Dashboard Data - Admin Areas Debug');
      console.log('AdminAreasGeoJson response:', adminAreasGeoJson);
      console.log('AdminAreasGeoJson.data:', adminAreasGeoJson.data);
      console.log('AdminAreasGeoJson.data type:', typeof adminAreasGeoJson.data);
      console.log('AdminAreasGeoJson.data is null?', adminAreasGeoJson.data === null);
      console.log('AdminAreasGeoJson.data is undefined?', adminAreasGeoJson.data === undefined);
      if (adminAreasGeoJson.data) {
        console.log('AdminAreasGeoJson.data.type:', adminAreasGeoJson.data.type);
        console.log('AdminAreasGeoJson.data.features.length:', adminAreasGeoJson.data.features?.length);
      }
      console.log('AdminAreasList response:', adminAreasList);
      console.groupEnd();

      // Create layers from admin areas and events (events may be empty if no disaster type)
      const layers = [
        {
          id: `${countryCodeISO3}_admin_areas`,
          name: 'Administrative Areas',
          active: true,
          type: 'geojson' as const,
          data: {
            visible: true,
            opacity: 0.7,
            adminAreas: adminAreasList.data || []
          }
        },
        {
          id: `${countryCodeISO3}_events`,
          name: 'Active Events',
          active: eventsResponse?.data && eventsResponse.data.length > 0,
          type: 'marker' as const,
          data: {
            visible: true,
            markerType: 'alert',
            events: eventsResponse?.data || []
          }
        }
      ];

      // Debug: Check final dashboard data structure
      const finalAdminAreas = adminAreasGeoJson.data || null;
      console.group('🔍 Dashboard Data - Final Structure Debug');
      console.log('Final adminAreas value:', finalAdminAreas);
      console.log('Final adminAreas is null?', finalAdminAreas === null);
      console.log('Final adminAreas type:', typeof finalAdminAreas);
      if (finalAdminAreas) {
        console.log('Final adminAreas.type:', finalAdminAreas.type);
        console.log('Final adminAreas.features.length:', finalAdminAreas.features?.length);
      }
      console.groupEnd();

      // Final data structure before return
      const finalData = {
        country,
        adminAreas: finalAdminAreas, // GeoJSON FeatureCollection for map
        adminAreasList: adminAreasList.data || [],   // Simplified list for other uses
        events: eventsResponse?.data || [],
        metadata: metadataResponse?.data || [],
        disasterTypes: availableDisasters,
        layers
      };

      console.group('🚀 FINAL RETURN - Dashboard Data Structure');
      console.log('finalData object:', finalData);
      console.log('finalData.adminAreas:', finalData.adminAreas);
      console.log('finalData.adminAreas === null?', finalData.adminAreas === null);
      console.log('finalData.adminAreas type:', typeof finalData.adminAreas);
      if (finalData.adminAreas) {
        console.log('finalData.adminAreas.type:', finalData.adminAreas.type);
        console.log('finalData.adminAreas.features?.length:', finalData.adminAreas.features?.length);
      }
      console.groupEnd();

      return {
        data: finalData,
        status: 200
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard data';
      console.error('Dashboard data loading failed:', error);
      return { error: message, status: 500 };
    }
  }

  // ============= Data Transformation =============

  /**
   * Transform IBF country data to match your app's expected format
   */
  transformCountryData(ibfCountry: IBFCountry): any {
    return {
      countryCodeISO3: ibfCountry.countryCodeISO3,
      countryName: ibfCountry.countryName,
      countryBounds: ibfCountry.countryBounds || [[-180, -90], [180, 90]], // Fallback bounds
      population: null, // Would need separate API call
      riskLevel: 'Unknown', // Would be calculated from current events
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Transform IBF events to match your map component format
   */
  transformEventData(ibfEvents: IBFEvent[], adminAreas: IBFAdminArea[]): any[] {
    return ibfEvents.flatMap(event => {
      if (!event.adminAreas) return [];
      
      return event.adminAreas.map((area, index) => ({
        id: `${event.countryCodeISO3}_${event.disasterType}_${area.placeCode}`,
        disasterType: event.disasterType,
        eventName: event.eventName || `${event.disasterType} Alert`,
        placeCode: area.placeCode,
        placeName: area.name,
        adminLevel: area.adminLevel,
        thresholdValue: event.thresholdValue,
        thresholdOperator: event.thresholdOperator,
        date: event.date || new Date().toISOString(),
        // For map display - would need to get coordinates from admin area geometry
        lat: null, // Would need geometry calculation
        lon: null, // Would need geometry calculation
        severity: this.calculateSeverity(event.thresholdValue),
        affectedPeople: null, // Would need separate indicator data
        description: `${event.disasterType} event in ${area.name}`
      }));
    });
  }

  private calculateSeverity(thresholdValue?: number): string {
    if (!thresholdValue) return 'Unknown';
    if (thresholdValue > 0.7) return 'High';
    if (thresholdValue > 0.4) return 'Medium';
    return 'Low';
  }

  /**
   * Transform disaster settings to match your app format
   */
  transformDisasterTypes(disasterSettings: IBFDisasterSetting[]): any[] {
    return disasterSettings.map(setting => ({
      disasterType: setting.disasterType,
      label: setting.label || setting.disasterType.charAt(0).toUpperCase() + setting.disasterType.slice(1),
      active: setting.active,
      leadTime: `${setting.leadTimeValue}-${setting.leadTimeUnit}`,
      leadTimeValue: setting.leadTimeValue,
      leadTimeUnit: setting.leadTimeUnit
    }));
  }

  // ============= Layer Data Methods =============

  /**
   * Get layer metadata for a specific country and disaster type
   */
  async getLayers(
    countryCodeISO3: string,
    disasterType: string
  ): Promise<IBFApiResponse<any[]>> {
    try {
      console.log(`🗂️ Getting layers for ${countryCodeISO3} - ${disasterType}`);
      return await this.request<any[]>(`/metadata/layers/${countryCodeISO3}/${disasterType}`);
    } catch (error) {
      console.error('❌ Error fetching layers:', error);
      return { error: error.message, status: 500 };
    }
  }

  /**
   * Get point data for a specific layer
   */
  async getPointData(
    countryCodeISO3: string,
    layerName: string,
    disasterType: string
  ): Promise<IBFApiResponse<GeoJSONFeatureCollection>> {
    try {
      console.log(`📍 Getting point data for ${layerName} in ${countryCodeISO3}`);
      const endpoint = `/point-data/${layerName}/${countryCodeISO3}?disasterType=${disasterType}`;
      return await this.request<GeoJSONFeatureCollection>(endpoint);
    } catch (error) {
      console.error('❌ Error fetching point data:', error);
      return { error: error.message, status: 500 };
    }
  }

  /**
   * Get aggregated data (including population) for a specific admin area
   */
  async getAggregatedData(
    countryCodeISO3: string,
    disasterType: string,
    placeCode: string,
    adminLevel: number
  ): Promise<IBFApiResponse<any>> {
    try {
      console.log(`📊 Getting aggregated data for area ${placeCode} in ${countryCodeISO3}`);
      
      // Try multiple endpoints to get population data
      const endpoints = [
        `/aggregates/${countryCodeISO3}/${disasterType}/${adminLevel}?placeCode=${placeCode}`,
        `/admin-areas/${countryCodeISO3}/${adminLevel}?placeCode=${placeCode}`,
        `/indicators/${countryCodeISO3}/${disasterType}/${adminLevel}?placeCode=${placeCode}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const result = await this.request<any>(endpoint, {}, 10 * 60 * 1000, false); // Disable global loading for hover requests
          if (result.data && !result.error) {
            console.log(`✅ Got aggregated data from ${endpoint}`);
            return result;
          }
        } catch (err) {
          console.log(`⚠️ Endpoint ${endpoint} failed:`, err.message);
        }
      }
      
      console.log('❌ No aggregated data available from any endpoint');
      return { error: 'No aggregated data available', status: 404 };
      
    } catch (error) {
      console.error('❌ Error fetching aggregated data:', error);
      return { error: error.message, status: 500 };
    }
  }

  /**
   * Get waterpoints data for a specific country
   */
  async getWaterpoints(
    countryCodeISO3: string
  ): Promise<IBFApiResponse<GeoJSONFeatureCollection>> {
    try {
      console.log(`💧 Getting waterpoints for ${countryCodeISO3}`);
      return await this.request<GeoJSONFeatureCollection>(`/waterpoints/${countryCodeISO3}`);
    } catch (error) {
      console.error('❌ Error fetching waterpoints:', error);
      return { error: error.message, status: 500 };
    }
  }

  /**
   * Get typhoon track data for a specific country and event
   */
  async getTyphoonTrack(
    countryCodeISO3: string,
    eventName?: string
  ): Promise<IBFApiResponse<GeoJSONFeatureCollection>> {
    try {
      console.log(`🌀 Getting typhoon track for ${countryCodeISO3}${eventName ? ` - ${eventName}` : ''}`);
      const endpoint = `/typhoon-track/${countryCodeISO3}${eventName ? `?eventName=${eventName}` : ''}`;
      return await this.request<GeoJSONFeatureCollection>(endpoint);
    } catch (error) {
      console.error('❌ Error fetching typhoon track:', error);
      return { error: error.message, status: 500 };
    }
  }

  /**
   * Get indicators data for a specific country and disaster type
   */
  async getIndicators(
    countryCodeISO3: string,
    disasterType: string
  ): Promise<IBFApiResponse<any[]>> {
    try {
      console.log(`📊 Getting indicators for ${countryCodeISO3} - ${disasterType}`);
      return await this.request<any[]>(`/metadata/indicators/${countryCodeISO3}/${disasterType}`);
    } catch (error) {
      console.error('❌ Error fetching indicators:', error);
      return { error: error.message, status: 500 };
    }
  }

  /**
   * Get last upload date for a specific country and disaster type
   */
  async getLastUploadDate(
    countryCodeISO3: string,
    disasterType: string
  ): Promise<IBFApiResponse<{ timestamp: string; cutoffMoment: string }>> {
    try {
      console.log(`📅 Getting last upload date for ${countryCodeISO3} - ${disasterType}`);
      return await this.request<{ timestamp: string; cutoffMoment: string }>(`/event/last-upload-date/${countryCodeISO3}/${disasterType}`);
    } catch (error) {
      console.error('❌ Error fetching last upload date:', error);
      return { error: error.message, status: 500 };
    }
  }
}

// Export singleton instance
export const ibfApiService = new IBFApiService();

// Export for easy import
export default ibfApiService;
