// Lightweight API client for IBF backend with authentication
import { setError, setLoading } from '../stores/app';
import { authService } from './authMock';
import { MockApiService } from './mockData';
import { ibfApiService, type IBFCountry, type IBFDisasterSetting, type IBFEvent, type IBFAdminArea } from './ibfApi';
import config from '../config';

// Configuration from config service
const API_BASE_URL = config.apiUrl;
const USE_MOCK_DATA = config.useMockData;
const USE_IBF_API = config.useIbfApi || false; // New flag for IBF API
const DISABLE_AUTHENTICATION = config.disableAuthentication;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private mockService = new MockApiService();
  
  constructor() {
    // Clear cache every 10 minutes
    setInterval(() => this.clearExpiredCache(), 10 * 60 * 1000);
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    cacheTTL: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const cacheKey = `${url}:${JSON.stringify(options)}`;
    
    // Check cache first
    if (options.method !== 'POST' && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < cached.ttl) {
        return { data: cached.data, status: 200 };
      }
    }

    try {
      setLoading(true);
      
      // Get authentication token
      const token = authService.getAuthToken();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'X-Requested-With': 'XMLHttpRequest', // CSRF protection
          ...options.headers
        }
      });

      if (response.status === 401) {
        // Token expired or invalid - attempt refresh
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          // Retry request with new token
          const newToken = authService.getAuthToken();
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              ...(newToken && { 'Authorization': `Bearer ${newToken}` }),
              'X-Requested-With': 'XMLHttpRequest',
              ...options.headers
            }
          });
          return this.handleResponse(retryResponse, cacheKey, cacheTTL);
        } else {
          authService.logout();
          return { error: 'Authentication required', status: 401 };
        }
      }

      return this.handleResponse(response, cacheKey, cacheTTL);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error';
      setError(message);
      return { error: message, status: 0 };
    } finally {
      setLoading(false);
    }
  }

  private async handleResponse<T>(
    response: Response, 
    cacheKey: string, 
    cacheTTL: number
  ): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'API Error', status: response.status };
    }

    // Cache successful GET requests
    if (response.url.includes('GET') || !response.url.includes('POST')) {
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: cacheTTL
      });
    }

    return { data, status: response.status };
  }

  private clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Countries
  async getCountries() {
    if (USE_IBF_API && !USE_MOCK_DATA) {
      console.log('Using IBF API for countries');
      const response = await ibfApiService.getCountries();
      if (response.data) {
        // Transform IBF data to match app format
        const countries = response.data.map(country => ibfApiService.transformCountryData(country));
        return { data: countries, status: response.status };
      }
      return { error: response.error, status: response.status };
    }
    
    if (USE_MOCK_DATA) {
      return this.mockService.getCountries();
    }
    return this.request<any[]>('/countries');
  }

  async getCountry(countryCode: string) {
    if (USE_IBF_API && !USE_MOCK_DATA) {
      console.log(`Using IBF API for country: ${countryCode}`);
      const response = await ibfApiService.getCountry(countryCode);
      if (response.data) {
        const country = ibfApiService.transformCountryData(response.data);
        return { data: country, status: response.status };
      }
      return { error: response.error, status: response.status };
    }
    
    if (USE_MOCK_DATA) {
      return this.mockService.getCountry(countryCode);
    }
    return this.request<any>(`/countries/${countryCode}`);
  }

  // Disaster types
  async getDisasterTypes(countryCode?: string) {
    if (USE_IBF_API && !USE_MOCK_DATA && countryCode) {
      console.log(`Using IBF API for disaster types: ${countryCode}`);
      const response = await ibfApiService.getDisasterTypes(countryCode);
      if (response.data) {
        const disasterTypes = ibfApiService.transformDisasterTypes(response.data);
        return { data: disasterTypes, status: response.status };
      }
      return { error: response.error, status: response.status };
    }
    
    if (USE_MOCK_DATA) {
      return this.mockService.getDisasterTypes();
    }
    return this.request<any[]>('/disaster-types');
  }

  // Event data
  async getEvents(countryCode: string, disasterType: string, leadTime?: string) {
    if (USE_IBF_API && !USE_MOCK_DATA) {
      console.log(`Using IBF API for events: ${countryCode}/${disasterType}`);
      const [eventsResponse, adminAreasResponse] = await Promise.all([
        ibfApiService.getEvents(countryCode, disasterType, leadTime),
        ibfApiService.getAdminAreas(countryCode)
      ]);
      
      if (eventsResponse.data && adminAreasResponse.data) {
        const events = ibfApiService.transformEventData(eventsResponse.data, adminAreasResponse.data);
        return { data: events, status: eventsResponse.status };
      }
      return { 
        error: eventsResponse.error || adminAreasResponse.error, 
        status: eventsResponse.status || adminAreasResponse.status 
      };
    }
    
    if (USE_MOCK_DATA) {
      return this.mockService.getEvents(countryCode, disasterType);
    }
    return this.request<any[]>(`/event/${countryCode}/${disasterType}`);
  }

  // Layer data
  async getLayers(countryCode: string) {
    if (USE_IBF_API && !USE_MOCK_DATA) {
      console.log(`Using IBF API for admin areas as layers: ${countryCode}`);
      const response = await ibfApiService.getAdminAreas(countryCode);
      if (response.data) {
        // Transform admin areas into layers
        const layers = [
          {
            id: `${countryCode}_admin_areas`,
            name: 'Administrative Areas',
            active: true,
            type: 'geojson' as const,
            data: {
              visible: true,
              opacity: 0.7,
              adminAreas: response.data
            }
          },
          {
            id: `${countryCode}_events`,
            name: 'Active Events',
            active: true,
            type: 'marker' as const,
            data: {
              visible: true,
              markerType: 'alert'
            }
          }
        ];
        return { data: layers, status: response.status };
      }
      return { error: response.error, status: response.status };
    }
    
    if (USE_MOCK_DATA) {
      return this.mockService.getLayers(countryCode);
    }
    return this.request<any[]>(`/layers/${countryCode}`);
  }

  // Admin areas
  async getAdminAreas(countryCode: string, adminLevel: number) {
    return this.request<any>(
      `/admin-area-data/${countryCode}/${adminLevel}`,
      {},
      10 * 60 * 1000 // Cache admin areas for 10 minutes
    );
  }

  // Dashboard data (consolidated endpoint for better performance)
  async getDashboardData(countryCode: string, disasterType?: string) {
    if (USE_IBF_API && !USE_MOCK_DATA) {
      console.log(`Using IBF API for dashboard data: ${countryCode}/${disasterType || 'all'}`);
      const result = await ibfApiService.getDashboardData(countryCode, disasterType);
      
      // Debug: Check what ibfApiService returns
      console.group('🔍 api.ts - IBF API Result Debug');
      console.log('ibfApiService result:', result);
      console.log('result.data:', result.data);
      if (result.data) {
        console.log('result.data.adminAreas:', result.data.adminAreas);
        console.log('result.data.adminAreas === null?', result.data.adminAreas === null);
        console.log('result.data.adminAreas type:', typeof result.data.adminAreas);
      }
      console.groupEnd();
      
      return result;
    }
    
    if (USE_MOCK_DATA) {
      return this.mockService.getDashboardData(countryCode, disasterType);
    }
    
    const params = new URLSearchParams();
    if (disasterType) params.set('disaster', disasterType);
    
    return this.request<{
      country: any;
      disasters: any[];
      layers: any[];
      events: any[];
    }>(`/dashboard/${countryCode}?${params}`);
  }

  // Health check
  async healthCheck() {
    if (USE_IBF_API && !USE_MOCK_DATA) {
      console.log('Using IBF API for health check');
      return ibfApiService.healthCheck();
    }
    
    if (USE_MOCK_DATA) {
      return this.mockService.healthCheck();
    }
    return this.request<{ status: string }>('/health', {}, 30 * 1000); // 30 second cache
  }
}

// Export singleton instance
export const api = new ApiClient();

// Utility functions for common operations
export async function loadCountryData(countryCode: string, disasterType?: string) {
  try {
    setLoading(true);
    setError(null);

    // Use consolidated endpoint if available, fallback to individual calls
    const dashboardResult = await api.getDashboardData(countryCode, disasterType);
    
    if (dashboardResult.data) {
      return dashboardResult.data;
    }

    // Fallback: load data separately
    const [countryResult, layersResult, eventsResult] = await Promise.all([
      api.getCountry(countryCode),
      api.getLayers(countryCode),
      disasterType ? api.getEvents(countryCode, disasterType) : Promise.resolve({ data: [] })
    ]);

    return {
      country: countryResult.data,
      layers: layersResult.data || [],
      events: eventsResult.data || []
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load country data';
    setError(message);
    throw error;
  } finally {
    setLoading(false);
  }
}

export async function loadInitialData() {
  try {
    console.log('Loading initial data...');
    
    if (USE_IBF_API && !USE_MOCK_DATA) {
      // For IBF API, we need to load countries first to get disaster types
      const countriesResult = await api.getCountries();
      if (!countriesResult.data || countriesResult.data.length === 0) {
        throw new Error('No countries available from IBF API');
      }
      
      // Get disaster types from the first country as a default
      const firstCountry = countriesResult.data[0];
      const disasterTypesResult = await api.getDisasterTypes(firstCountry.countryCodeISO3);
      
      return {
        countries: countriesResult.data,
        disasterTypes: disasterTypesResult.data || []
      };
    }

    // For mock data or custom API
    const [countriesResult, disasterTypesResult] = await Promise.all([
      api.getCountries(),
      api.getDisasterTypes()
    ]);

    return {
      countries: countriesResult.data || [],
      disasterTypes: disasterTypesResult.data || []
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load initial data';
    console.error('Initial data loading failed:', error);
    setError(message);
    throw error;
  }
}

// Network-aware loading
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// Retry logic for failed requests
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
