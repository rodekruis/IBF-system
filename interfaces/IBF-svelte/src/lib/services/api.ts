// Lightweight API client for IBF backend with authentication
import { setError, setLoading } from '../stores/app';
import { authService } from './authService';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
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
        // Token expired or invalid - logout user
        console.warn('⚠️ Authentication failed - redirecting to login');
        authService.logout();
        return { error: 'Authentication required', status: 401 };
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
    return this.request<any[]>('/countries');
  }

  async getCountry(countryCode: string) {
    return this.request<any>(`/countries/${countryCode}`);
  }

  // Disaster types
  async getDisasterTypes() {
    return this.request<any[]>('/disaster-types');
  }

  // Event data
  async getEvents(countryCode: string, disasterType: string) {
    return this.request<any[]>(`/event/${countryCode}/${disasterType}`);
  }

  // Layer data
  async getLayers(countryCode: string) {
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
