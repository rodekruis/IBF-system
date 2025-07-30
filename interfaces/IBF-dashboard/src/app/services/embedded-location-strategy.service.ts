import { Injectable } from '@angular/core';
import { LocationStrategy, PlatformLocation } from '@angular/common';

@Injectable()
export class EmbeddedLocationStrategy extends LocationStrategy {
  private _baseHref = '';
  private _embeddedPrefix = '#IBFDashboard/';

  constructor(private _platformLocation: PlatformLocation) {
    super();
    console.log('🔧 EmbeddedLocationStrategy initialized with prefix:', this._embeddedPrefix);
  }

  path(includeHash?: boolean): string {
    const hash = this._platformLocation.hash;
    
    // If we have our embedded prefix, extract the Angular route part
    if (hash.startsWith(this._embeddedPrefix)) {
      const angularRoute = hash.substring(this._embeddedPrefix.length);
      const path = angularRoute || '/';
      console.log('🧭 EmbeddedLocationStrategy.path() ->', path, 'from hash:', hash);
      return path;
    }
    
    // Fallback to root if we don't have our prefix
    console.log('🧭 EmbeddedLocationStrategy.path() -> / (fallback) from hash:', hash);
    return '/';
  }

  prepareExternalUrl(internal: string): string {
    // Convert internal Angular route to the embedded format
    // For EspoCRM, we need to ensure we're working with the root domain hash
    const cleanInternal = internal.startsWith('/') ? internal.substring(1) : internal;
    
    // Get the root domain without any path components
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? ':' + window.location.port : '';
    const rootUrl = `${protocol}//${hostname}${port}/`;
    
    // Construct the full URL with our embedded prefix at the root level
    const embeddedPath = this._embeddedPrefix + cleanInternal;
    const fullExternalUrl = rootUrl + embeddedPath;
    
    console.log('🧭 EmbeddedLocationStrategy.prepareExternalUrl():', {
      internal,
      cleanInternal,
      embeddedPath,
      fullExternalUrl,
      currentLocation: window.location.href
    });
    
    // Return just the hash part since we're working with hash-based routing
    return embeddedPath;
  }

  pushState(state: any, title: string, url: string, queryParams: string): void {
    // Build the hash with our embedded prefix for EspoCRM compatibility
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    let fullHash = this._embeddedPrefix + cleanUrl;
    
    if (queryParams) {
      fullHash += (fullHash.includes('?') ? '&' : '?') + queryParams;
    }
    
    // Get the root URL for EspoCRM (without any module paths)
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? ':' + window.location.port : '';
    const search = window.location.search; // Preserve query params
    const rootUrl = `${protocol}//${hostname}${port}/${search}${fullHash}`;
    
    console.log('🧭 EmbeddedLocationStrategy.pushState():', {
      url,
      fullHash,
      rootUrl,
      currentLocation: window.location.href
    });
    
    // Use replaceState to navigate to the root domain with our hash
    // This prevents creating browser history entries and keeps us in EspoCRM context
    window.history.replaceState(state, title, rootUrl);
  }

  replaceState(state: any, title: string, url: string, queryParams: string): void {
    // Build the hash with our embedded prefix for EspoCRM compatibility
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    let fullHash = this._embeddedPrefix + cleanUrl;
    
    if (queryParams) {
      fullHash += (fullHash.includes('?') ? '&' : '?') + queryParams;
    }
    
    // Get the root URL for EspoCRM (without any module paths)
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? ':' + window.location.port : '';
    const search = window.location.search; // Preserve query params
    const rootUrl = `${protocol}//${hostname}${port}/${search}${fullHash}`;
    
    console.log('🧭 EmbeddedLocationStrategy.replaceState():', {
      url,
      fullHash,
      rootUrl,
      currentLocation: window.location.href
    });
    
    // Replace the current URL with the root domain URL containing our hash
    window.history.replaceState(state, title, rootUrl);
  }

  forward(): void {
    console.log('🧭 EmbeddedLocationStrategy.forward()');
    this._platformLocation.forward();
  }

  back(): void {
    console.log('🧭 EmbeddedLocationStrategy.back()');
    this._platformLocation.back();
  }

  getBaseHref(): string {
    return this._baseHref;
  }

  getState(): unknown {
    return this._platformLocation.getState();
  }

  onPopState(fn: (value: any) => void): void {
    // Listen for hash changes that affect our routing space
    this._platformLocation.onHashChange((event: any) => {
      const newHash = this._platformLocation.hash;
      
      // Only trigger if the change is within our embedded routing space
      if (newHash.startsWith(this._embeddedPrefix)) {
        console.log('🧭 EmbeddedLocationStrategy.onPopState() - hash change in our space:', newHash);
        fn(event);
      } else {
        console.log('🧭 EmbeddedLocationStrategy.onPopState() - hash change outside our space:', newHash);
      }
    });
  }
}
