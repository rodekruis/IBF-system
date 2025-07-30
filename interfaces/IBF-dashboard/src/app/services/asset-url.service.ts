import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssetUrlService {

  /**
   * Resolves asset URLs for embedded mode
   */
  getAssetUrl(assetPath: string): string {
    if (!this.isEmbeddedMode()) {
      return assetPath;
    }

    // Remove leading slash if present for consistent processing
    const normalizedPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
    
    // If it's already an absolute URL, return as-is
    if (normalizedPath.startsWith('http')) {
      return assetPath;
    }

    // For embedded mode, prepend the asset base path
    return `${environment.assetBasePath}/${normalizedPath}`;
  }

  /**
   * Batch resolve multiple asset URLs
   */
  getAssetUrls(assetPaths: string[]): string[] {
    return assetPaths.map(path => this.getAssetUrl(path));
  }

  /**
   * Resolve asset URLs in an object recursively
   */
  resolveAssetUrls<T>(obj: T): T {
    if (!this.isEmbeddedMode()) {
      return obj;
    }

    return this.deepResolveUrls(obj);
  }

  private deepResolveUrls<T>(obj: T): T {
    if (typeof obj === 'string') {
      // Check if it looks like an asset path
      if (obj.includes('/assets/') || obj.includes('/icons/') || obj.includes('/images/')) {
        return this.getAssetUrl(obj) as unknown as T;
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepResolveUrls(item)) as unknown as T;
    }

    if (obj && typeof obj === 'object') {
      const resolved = {} as T;
      for (const [key, value] of Object.entries(obj)) {
        (resolved as any)[key] = this.deepResolveUrls(value);
      }
      return resolved;
    }

    return obj;
  }

  private isEmbeddedMode(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      // Quick check for embedded mode
      return !!(
        document.querySelector('ibf-dashboard[embedded-mode]') ||
        window.location.pathname.includes(environment.assetBasePath) ||
        window.location.hostname.includes('espocrm') ||
        window.location.hostname.includes('crm')
      );
    } catch {
      return false;
    }
  }
}
