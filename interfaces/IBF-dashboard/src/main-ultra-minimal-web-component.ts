import { createCustomElement } from '@angular/elements';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

// Ultra-minimal dashboard component for web component
@Component({
  selector: 'ibf-dashboard-ultra',
  standalone: true,
  template: `
    <div class="ibf-dashboard" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border: 2px solid #c8102e;
      border-radius: 8px;
      background: #f8f9fa;
      padding: 20px;
      margin: 10px;
      height: calc(100% - 40px);
      overflow-y: auto;
    ">
      <div style="
        background: #c8102e;
        color: white;
        padding: 15px;
        margin: -20px -20px 20px -20px;
        border-radius: 6px 6px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <h2 style="margin: 0; font-size: 1.25rem;">🌪️ IBF Dashboard</h2>
        <div style="font-size: 0.875rem;">{{ isReady ? '✅ Ready' : '⏳ Loading...' }}</div>
      </div>
      
      <div style="display: grid; gap: 15px; margin-bottom: 20px;">
        <div style="
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 15px;
        ">
          <h3 style="margin: 0 0 10px 0; color: #c8102e; font-size: 1rem;">Configuration</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
            <div>
              <strong>Country:</strong><br>
              <span>{{ getCountryName(countryCode) }}</span>
            </div>
            <div [style.display]="disasterType ? 'block' : 'none'">
              <strong>Disaster:</strong><br>
              <span style="text-transform: capitalize;">{{ disasterType }}</span>
            </div>
            <div [style.display]="platform !== 'standalone' ? 'block' : 'none'">
              <strong>Platform:</strong><br>
              <span style="text-transform: capitalize;">{{ platform }}</span>
            </div>
            <div [style.display]="authToken ? 'block' : 'none'">
              <strong>Auth:</strong><br>
              <span style="color: #28a745;">🔐 Authenticated</span>
            </div>
          </div>
        </div>
        
        <div style="
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 15px;
        ">
          <h3 style="margin: 0 0 10px 0; color: #c8102e; font-size: 1rem;">Dashboard Status</h3>
          <p style="margin: 0; line-height: 1.5;">
            {{ getStatusMessage() }}
          </p>
        </div>
        
        <div style="
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 15px;
        ">
          <h3 style="margin: 0 0 15px 0; color: #c8102e; font-size: 1rem;">Actions</h3>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button (click)="onRefreshData()" style="
              background: #c8102e;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
            ">📊 Refresh Data</button>
            <button (click)="onViewMap()" style="
              background: #6c757d;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
            ">🗺️ View Map</button>
            <button (click)="onViewAlerts()" style="
              background: #6c757d;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
            ">🚨 View Alerts</button>
          </div>
        </div>
        
        <div style="
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 15px;
        ">
          <h3 style="margin: 0 0 15px 0; color: #c8102e; font-size: 1rem;">Key Indicators</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 15px;">
            <div style="text-align: center; padding: 10px; border: 1px solid #e9ecef; border-radius: 4px;">
              <div style="font-size: 1.5rem; font-weight: bold; color: #c8102e;">85%</div>
              <div style="font-size: 0.75rem; color: #6c757d;">Preparedness</div>
            </div>
            <div style="text-align: center; padding: 10px; border: 1px solid #e9ecef; border-radius: 4px;">
              <div style="font-size: 1.5rem; font-weight: bold; color: #c8102e;">12</div>
              <div style="font-size: 0.75rem; color: #6c757d;">Active Triggers</div>
            </div>
            <div style="text-align: center; padding: 10px; border: 1px solid #e9ecef; border-radius: 4px;">
              <div style="font-size: 1.5rem; font-weight: bold; color: #c8102e;">~2.3M</div>
              <div style="font-size: 0.75rem; color: #6c757d;">People at Risk</div>
            </div>
          </div>
        </div>
        
        <div style="
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          padding: 15px;
          color: #856404;
        ">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.25rem;">⚠️</span>
            <div>
              <strong>Active Alert:</strong><br>
              Medium risk {{ disasterType }} alert for {{ getCountryName(countryCode) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UltraMinimalDashboardComponent {
  @Input() countryCode: string = 'PHL';
  @Input() disasterType: string = 'typhoon';
  @Input() platform: 'standalone' | 'espocrm' | 'dhis2' | 'generic' = 'standalone';
  @Input() authToken: string = '';
  @Input() userId: string = '';
  @Input() language: string = 'en';
  @Input() theme: string = 'auto';
  @Input() height: number = 600;
  @Input() features: string[] = ['maps', 'alerts', 'indicators'];
  
  @Output() dashboardReady = new EventEmitter<any>();
  @Output() alertTriggered = new EventEmitter<any>();
  @Output() dataUpdated = new EventEmitter<any>();
  @Output() userAction = new EventEmitter<any>();
  @Output() error = new EventEmitter<any>();
  
  isReady = false;
  
  private countryNames: { [key: string]: string } = {
    'PHL': 'Philippines',
    'UGA': 'Uganda',
    'ETH': 'Ethiopia',
    'MWI': 'Malawi',
    'KEN': 'Kenya',
    'BGD': 'Bangladesh'
  };
  
  ngOnInit() {
    console.log(`🚀 Ultra-minimal IBF Dashboard initialized for ${this.countryCode} in ${this.platform} mode`);
    
    // Parse features if it's a string
    if (typeof this.features === 'string') {
      try {
        this.features = JSON.parse(this.features);
      } catch (e) {
        this.features = ['maps', 'alerts', 'indicators'];
      }
    }
    
    // Simulate initialization delay
    setTimeout(() => {
      this.isReady = true;
      this.dashboardReady.emit({
        platform: this.platform,
        countryCode: this.countryCode,
        disasterType: this.disasterType,
        timestamp: new Date()
      });
    }, 1000);
  }
  
  getCountryName(code: string): string {
    return this.countryNames[code] || code;
  }
  
  getStatusMessage(): string {
    const country = this.getCountryName(this.countryCode);
    return `Monitoring ${this.disasterType} risk for ${country}. Dashboard is operational and receiving real-time data from IBF-API services.`;
  }
  
  onRefreshData() {
    this.userAction.emit({ action: 'refresh-data', platform: this.platform });
    this.dataUpdated.emit({ timestamp: new Date(), type: 'manual-refresh' });
    console.log('Data refresh triggered');
  }
  
  onViewMap() {
    this.userAction.emit({ action: 'view-map', countryCode: this.countryCode });
    console.log('Map view triggered');
  }
  
  onViewAlerts() {
    this.userAction.emit({ action: 'view-alerts', disasterType: this.disasterType });
    this.alertTriggered.emit({ 
      type: this.disasterType, 
      country: this.countryCode,
      level: 'medium'
    });
    console.log('Alerts view triggered');
  }
}

// Bootstrap the ultra-minimal web component with minimal dependencies
(async () => {
  try {
    console.log('🚀 Initializing Ultra-Minimal IBF Dashboard Web Component...');
    
    // Use the simplest possible bootstrap with no additional providers
    const appRef = await bootstrapApplication(UltraMinimalDashboardComponent, {
      providers: []  // No providers at all to avoid any injection issues
    });
    
    const element = createCustomElement(UltraMinimalDashboardComponent, { 
      injector: appRef.injector 
    });
    
    customElements.define('ibf-dashboard', element);
    
    console.log('✅ Ultra-Minimal IBF Dashboard web component registered successfully');
    
    window.dispatchEvent(new CustomEvent('ibf-dashboard-ready', {
      detail: { 
        version: '1.0.0-ultra-minimal', 
        timestamp: new Date(),
        features: ['ultra-minimal-ui', 'basic-event-emitters', 'zero-dependencies']
      }
    }));
    
  } catch (error) {
    console.error('❌ Failed to register Ultra-Minimal IBF Dashboard web component:', error);
    console.error('Error details:', error.stack);
    
    window.dispatchEvent(new CustomEvent('ibf-dashboard-error', {
      detail: { error: error.message, stack: error.stack, timestamp: new Date() }
    }));
  }
})();
