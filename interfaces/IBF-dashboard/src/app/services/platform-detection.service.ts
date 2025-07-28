import { Injectable } from '@angular/core';

export type PlatformMode = 'standalone' | 'espocrm' | 'dhis2' | 'generic';

@Injectable({
  providedIn: 'root'
})
export class PlatformDetectionService {

  getPlatformMode(): PlatformMode {
    // Check if running as custom element
    if (this.isRunningAsWebComponent()) {
      return this.detectSpecificPlatform();
    }
    
    // Check URL patterns for iframe embedding
    if (window.location.hostname.includes('espocrm')) {
      return 'espocrm';
    }
    
    if (window.location.hostname.includes('dhis2')) {
      return 'dhis2';
    }
    
    // Check for platform-specific URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const platform = urlParams.get('platform');
    if (platform && ['espocrm', 'dhis2', 'generic'].includes(platform)) {
      return platform as PlatformMode;
    }
    
    return 'standalone'; // Default Azure web app mode
  }
  
  isStandaloneMode(): boolean {
    return this.getPlatformMode() === 'standalone';
  }
  
  isEmbeddedMode(): boolean {
    return this.getPlatformMode() !== 'standalone';
  }
  
  isEspoCrmMode(): boolean {
    return this.getPlatformMode() === 'espocrm';
  }
  
  isDhis2Mode(): boolean {
    return this.getPlatformMode() === 'dhis2';
  }
  
  isGenericMode(): boolean {
    return this.getPlatformMode() === 'generic';
  }
  
  private isRunningAsWebComponent(): boolean {
    // Check if we're inside a custom element
    try {
      const customElement = document.querySelector('ibf-dashboard');
      return !!customElement;
    } catch {
      return false;
    }
  }
  
  private detectSpecificPlatform(): PlatformMode {
    // Try to detect specific platform from parent window or context
    try {
      // Check parent window for EspoCRM indicators
      if (window.parent && window.parent !== window) {
        const parentUrl = window.parent.location.href;
        if (parentUrl.includes('espocrm')) {
          return 'espocrm';
        }
        if (parentUrl.includes('dhis2')) {
          return 'dhis2';
        }
      }
    } catch (error) {
      // Cross-origin restrictions prevent access to parent
      console.debug('Cannot access parent window:', error);
    }
    
    // Check for platform-specific global variables
    if ((window as any).EspoCRM) {
      return 'espocrm';
    }
    
    if ((window as any).DHIS2) {
      return 'dhis2';
    }
    
    // Check custom element attributes
    const element = document.querySelector('ibf-dashboard');
    if (element) {
      const platform = element.getAttribute('platform');
      if (platform && ['espocrm', 'dhis2', 'generic'].includes(platform)) {
        return platform as PlatformMode;
      }
    }
    
    return 'generic'; // Default for web component mode
  }
  
  getEmbeddingContext(): any {
    const context = {
      platform: this.getPlatformMode(),
      isEmbedded: this.isEmbeddedMode(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    };
    
    // Add platform-specific context
    if (this.isEspoCrmMode()) {
      context['espoCrmContext'] = this.getEspoCrmContext();
    } else if (this.isDhis2Mode()) {
      context['dhis2Context'] = this.getDhis2Context();
    }
    
    return context;
  }
  
  private getEspoCrmContext(): any {
    return {
      hasEspoCrmGlobal: !!(window as any).EspoCRM,
      hasEspoCrmToken: !!this.getUrlParam('espoToken'),
      hasEspoCrmUserId: !!this.getUrlParam('espoUserId')
    };
  }
  
  private getDhis2Context(): any {
    return {
      hasDhis2Global: !!(window as any).DHIS2,
      hasDhis2Token: !!this.getUrlParam('dhis2Token'),
      hasOrgUnit: !!this.getUrlParam('orgUnit')
    };
  }
  
  private getUrlParam(param: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  logPlatformInfo(): void {
    const context = this.getEmbeddingContext();
    console.log('🔍 Platform Detection:', context);
  }
}
