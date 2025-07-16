// Cache Service - Centralized caching for admin area data
// This service provides a singleton cache that can be shared across components

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 15 * 60 * 1000; // 15 minutes default

  constructor() {
    // Clean up expired cache entries every 5 minutes
    setInterval(() => this.cleanupExpired(), 5 * 60 * 1000);
  }

  /**
   * Get cached data if it exists and is not expired
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    console.log(`🗄️ Cache hit for: ${key}`);
    return entry.data as T;
  }

  /**
   * Store data in cache with optional TTL
   */
  set<T = any>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    this.cache.set(key, entry);
    console.log(`💾 Cached data for: ${key} (TTL: ${Math.round((ttl || this.defaultTTL) / 1000)}s)`);
  }

  /**
   * Check if a key exists in cache and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove a specific cache entry
   */
  delete(key: string): boolean {
    console.log(`🗑️ Removed cache entry: ${key}`);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    console.log(`🧹 Cleared all cache entries (${this.cache.size} items)`);
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalMemory: this.estimateMemoryUsage()
    };
  }

  /**
   * Remove expired cache entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`🧹 Cache cleanup: removed ${removedCount} expired entries`);
    }
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  private estimateMemoryUsage(): string {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2; // chars to bytes (roughly)
      totalSize += JSON.stringify(entry.data).length * 2;
    }

    if (totalSize < 1024) {
      return `${totalSize} B`;
    } else if (totalSize < 1024 * 1024) {
      return `${Math.round(totalSize / 1024)} KB`;
    } else {
      return `${Math.round(totalSize / (1024 * 1024))} MB`;
    }
  }

  /**
   * Generate a standardized cache key for admin area data
   */
  static generateAdminAreaKey(countryCode: string, adminCode: string, dataType: string = 'population'): string {
    return `admin-area:${countryCode}:${adminCode}:${dataType}`;
  }

  /**
   * Generate a standardized cache key for country data
   */
  static generateCountryKey(countryCode: string, dataType: string = 'boundaries'): string {
    return `country:${countryCode}:${dataType}`;
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export for easy import
export default cacheService;
