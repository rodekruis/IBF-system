import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  private debugPrefix = '🔍 [DEBUG]';
  private initCounters = new Map<string, number>();

  constructor() {
    console.log(`${this.debugPrefix} Debug service initialized`);
  }

  logComponentInit(componentName: string, instanceId?: number) {
    // Track initialization counts to detect infinite loops
    const key = instanceId ? `${componentName}[${instanceId}]` : componentName;
    const currentCount = this.initCounters.get(componentName) || 0;
    const newCount = currentCount + 1;
    this.initCounters.set(componentName, newCount);
    
    const warning = newCount > 3 ? ' ⚠️ MULTIPLE INITS!' : '';
    console.log(`${this.debugPrefix} 🚀 ${key} - Initialized (${newCount}x total for ${componentName})${warning}`);
    
    if (newCount > 5) {
      console.error(`${this.debugPrefix} 🚨 INFINITE LOOP DETECTED in ${componentName} - ${newCount} initializations!`);
      // Optionally trigger a circuit breaker here
      this.triggerCircuitBreaker(componentName);
    }
  }

  triggerCircuitBreaker(componentName: string) {
    console.error(`${this.debugPrefix} 🔒 Circuit breaker triggered for ${componentName}`);
    // Reset counter to prevent further logging spam
    this.initCounters.set(componentName, 0);
    
    // Emit an error event that the application can handle
    window.dispatchEvent(new CustomEvent('component-loop-detected', {
      detail: { componentName, timestamp: Date.now() }
    }));
  }

  resetCounters() {
    console.log(`${this.debugPrefix} 🔄 Resetting all counters`);
    this.initCounters.clear();
  }

  getComponentInitCount(componentName: string): number {
    return this.initCounters.get(componentName) || 0;
  }

  logComponentDestroy(componentName: string) {
    console.log(`${this.debugPrefix} 💀 ${componentName} - ngOnDestroy`);
  }

  logComponentAfterViewInit(componentName: string, data?: any) {
    console.log(`${this.debugPrefix} 👁️ ${componentName} - ngAfterViewInit`, data || '');
  }

  logData(componentName: string, label: string, data: any) {
    console.log(`${this.debugPrefix} 📊 ${componentName} - ${label}:`, data);
  }

  logError(componentName: string, error: any) {
    console.error(`${this.debugPrefix} ❌ ${componentName} - Error:`, error);
  }

  logRender(componentName: string, element?: HTMLElement) {
    // DOM render logging disabled to reduce console verbosity
    // if (element) {
    //   const rect = element.getBoundingClientRect();
    //   const visible = rect.width > 0 && rect.height > 0;
    //   console.log(`${this.debugPrefix} 🎨 ${componentName} - Rendered:`, {
    //     visible,
    //     width: rect.width,
    //     height: rect.height,
    //     display: getComputedStyle(element).display,
    //     visibility: getComputedStyle(element).visibility,
    //     opacity: getComputedStyle(element).opacity
    //   });
    // } else {
    //   console.log(`${this.debugPrefix} 🎨 ${componentName} - Rendered (no element)`);
    // }
  }

  logElementVisibility(componentName: string, selector: string) {
    // Element visibility logging disabled to reduce console verbosity
    // const element = document.querySelector(selector);
    // if (element) {
    //   this.logRender(componentName, element as HTMLElement);
    // } else {
    //   console.log(`${this.debugPrefix} ❓ ${componentName} - Element not found: ${selector}`);
    // }
  }

  logDOMState() {
    // DOM state logging disabled to reduce console verbosity
    // console.log(`${this.debugPrefix} 🌍 DOM State Analysis:`);
    
    // Check main dashboard sections
    // this.logElementVisibility('DOM', '[data-testid="ibf-dashboard-interface"]');
    // this.logElementVisibility('DOM', '.ibf-dashboard-left-column');
    // this.logElementVisibility('DOM', '.ibf-dashboard-right-column');
    // this.logElementVisibility('DOM', '[data-testid="dashboard-top-bar"]');
    // this.logElementVisibility('DOM', 'app-chat');
    // this.logElementVisibility('DOM', 'app-timeline');
    // this.logElementVisibility('DOM', 'app-aggregates');
    // this.logElementVisibility('DOM', 'app-matrix');
    // this.logElementVisibility('DOM', 'app-map');
    // this.logElementVisibility('DOM', '[data-testid="dashboard-map-componenet"]');
    // this.logElementVisibility('DOM', '.leaflet--map');
  }

  logCSSStyles(componentName: string, selector: string) {
    // CSS styles logging disabled to reduce console verbosity
    // const element = document.querySelector(selector);
    // if (element) {
    //   const styles = getComputedStyle(element);
    //   console.log(`${this.debugPrefix} 🎭 ${componentName} - CSS for ${selector}:`, {
    //     display: styles.display,
    //     visibility: styles.visibility,
    //     opacity: styles.opacity,
    //     width: styles.width,
    //     height: styles.height,
    //     position: styles.position,
    //     zIndex: styles.zIndex,
    //     overflow: styles.overflow,
    //     color: styles.color,
    //     backgroundColor: styles.backgroundColor
    //   });
    // }
  }
}
