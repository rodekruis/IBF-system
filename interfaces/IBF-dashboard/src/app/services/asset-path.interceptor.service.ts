import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class AssetPathInterceptorService implements HttpInterceptor {
  
  // Asset path patterns that should be intercepted
  private readonly ASSET_PATHS = [
    '/assets/', 'assets/',
    '/svg/', 'svg/',
    '/icons/', 'icons/',
    '/i18n/', 'i18n/',
    '/images/', 'images/',
    '/fonts/', 'fonts/',
    '/static/', 'static/',
    '/markers/', 'markers/'
  ];

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    console.log(`🔍 HTTP Request intercepted: ${req.method} ${req.url}`);
    
    // Only intercept asset requests in embedded EspoCRM mode
    if (this.isAssetRequest(req) && this.isEmbeddedMode()) {
      const originalUrl = req.url;
      const correctedUrl = this.correctAssetPath(originalUrl);
      
      if (correctedUrl !== originalUrl) {
        console.log(`🔀 Asset intercepted: ${originalUrl} → ${correctedUrl}`);
        const modifiedReq = req.clone({
          url: correctedUrl
        });
        return next.handle(modifiedReq);
      } else {
        console.log(`ℹ️ Asset request kept unchanged: ${originalUrl}`);
      }
    } else {
      if (this.isAssetRequest(req)) {
        console.log(`⚠️ Asset request detected but not in embedded mode: ${req.url}`);
      } else {
        console.log(`🌐 Non-asset request: ${req.url}`);
      }
    }
    
    return next.handle(req);
  }

  private isAssetRequest(req: HttpRequest<any>): boolean {
    const url = req.url.toLowerCase();
    
    // Skip if it's already an absolute HTTP URL to external domain
    if (url.startsWith('http') && !url.includes(window.location.hostname)) {
      return false;
    }
    
    // Check if URL contains any of our asset paths
    return this.ASSET_PATHS.some(path => url.includes(path));
  }

  private isEmbeddedMode(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      // Method 1: Check if we're inside an ibf-dashboard custom element with embedded-mode attribute
      const ibfDashboard = document.querySelector('ibf-dashboard[embedded-mode]');
      if (ibfDashboard) {
        console.log('🔍 AssetPathInterceptor: Detected embedded mode via ibf-dashboard[embedded-mode] element');
        return true;
      }

      // Method 2: Check if we're loaded from the EspoCRM module path
      if (window.location.pathname.includes(environment.assetBasePath)) {
        console.log('🔍 AssetPathInterceptor: Detected embedded mode via URL path');
        return true;
      }

      // Method 3: Check for EspoCRM-specific indicators
      if (window.location.hostname.includes('espocrm') || 
          window.location.hostname.includes('crm') ||
          document.querySelector('meta[name="application-name"][content*="EspoCRM"]') ||
          document.querySelector('[data-espocrm]')) {
        console.log('🔍 AssetPathInterceptor: Detected embedded mode via EspoCRM indicators');
        return true;
      }

      // Method 4: Check if we have EspoCRM-style layout
      if (document.getElementById('header') && document.getElementById('content') && 
          document.querySelector('.container.content')) {
        console.log('🔍 AssetPathInterceptor: Detected embedded mode via EspoCRM layout');
        return true;
      }

    } catch (e) {
      console.warn('AssetPathInterceptor: Error detecting embedded mode:', e);
    }

    console.log('🔍 AssetPathInterceptor: No embedded mode detected, running in standalone mode');
    return false;
  }

  private correctAssetPath(originalUrl: string): string {
    const assetBasePath = environment.assetBasePath;
    
    // Parse the URL to extract the domain and path
    let url = originalUrl;
    
    // Handle absolute URLs that point to wrong domain
    if (url.startsWith('http')) {
      try {
        const urlObj = new URL(url);
        // If it's pointing to a different domain, extract just the path
        if (!urlObj.hostname.includes(window.location.hostname)) {
          url = urlObj.pathname + urlObj.search + urlObj.hash;
          console.log(`🌐 Converted absolute URL to relative: ${originalUrl} → ${url}`);
        }
      } catch (e) {
        console.warn('Failed to parse URL:', originalUrl, e);
      }
    }
    
    // Remove any existing asset base path that might be incorrect
    url = url.replace(new RegExp(`^${assetBasePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '');
    
    // Find which asset path this URL contains
    const matchedPath = this.ASSET_PATHS.find(path => url.includes(path));
    
    if (matchedPath) {
      // Extract the part starting from the asset path
      const pathIndex = url.indexOf(matchedPath);
      const assetPath = url.substring(pathIndex);
      
      // For paths that don't start with /, we need to add /assets/ prefix
      if (matchedPath.startsWith('/')) {
        return `${assetBasePath}${assetPath}`;
      } else {
        return `${assetBasePath}/assets/${assetPath}`;
      }
    }
    
    // Fallback: if we can't determine the correct path, default to assets folder
    if (url.startsWith('/') && !url.startsWith(assetBasePath)) {
      return `${assetBasePath}/assets${url}`;
    }
    
    return originalUrl;
  }
}
