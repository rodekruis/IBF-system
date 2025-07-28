import { createCustomElement } from '@angular/elements';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

// Minimal dashboard component for web component
@Component({
  selector: 'ibf-dashboard-minimal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ibf-dashboard-wrapper" [style.height.px]="height || 600">
      <div class="ibf-header">
        <h2>🌪️ IBF Dashboard</h2>
        <div class="ibf-status" [class.ready]="isReady">
          {{ isReady ? '✅ Ready' : '⏳ Loading...' }}
        </div>
      </div>
      
      <div class="ibf-content">
        <div class="ibf-info-panel">
          <div class="ibf-info-item">
            <label>Country:</label>
            <span>{{ getCountryName(countryCode) }}</span>
          </div>
          <div class="ibf-info-item" *ngIf="disasterType">
            <label>Disaster Type:</label>
            <span>{{ disasterType | titlecase }}</span>
          </div>
          <div class="ibf-info-item" *ngIf="platform !== 'standalone'">
            <label>Platform:</label>
            <span>{{ platform | titlecase }}</span>
          </div>
          <div class="ibf-info-item" *ngIf="authToken">
            <label>Auth Status:</label>
            <span class="auth-status">🔐 Authenticated</span>
          </div>
        </div>
        
        <div class="ibf-actions">
          <button class="ibf-btn primary" (click)="onRefreshData()">
            📊 Refresh Data
          </button>
          <button class="ibf-btn secondary" (click)="onViewMap()">
            🗺️ View Map
          </button>
          <button class="ibf-btn secondary" (click)="onViewAlerts()" *ngIf="platform !== 'generic'">
            🚨 View Alerts
          </button>
        </div>
        
        <div class="ibf-mock-content">
          <div class="ibf-card">
            <h3>Current Status</h3>
            <p>{{ getStatusMessage() }}</p>
          </div>
          
          <div class="ibf-card" *ngIf="features.includes('alerts')">
            <h3>Active Alerts</h3>
            <div class="alert-item warning">
              <span class="alert-icon">⚠️</span>
              <span>Medium risk {{ disasterType }} alert for {{ getCountryName(countryCode) }}</span>
            </div>
          </div>
          
          <div class="ibf-card" *ngIf="features.includes('indicators')">
            <h3>Key Indicators</h3>
            <div class="indicator-grid">
              <div class="indicator">
                <span class="value">85%</span>
                <span class="label">Preparedness</span>
              </div>
              <div class="indicator">
                <span class="value">12</span>
                <span class="label">Active Triggers</span>
              </div>
              <div class="indicator">
                <span class="value">~2.3M</span>
                <span class="label">People at Risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ibf-dashboard-wrapper {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .ibf-header {
      background: #c8102e;
      color: white;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .ibf-header h2 {
      margin: 0;
      font-size: 1.25rem;
    }
    
    .ibf-status {
      font-size: 0.875rem;
      opacity: 0.9;
    }
    
    .ibf-status.ready {
      opacity: 1;
      font-weight: 500;
    }
    
    .ibf-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }
    
    .ibf-info-panel {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .ibf-info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .ibf-info-item label {
      font-weight: 600;
      color: #495057;
      font-size: 0.875rem;
    }
    
    .ibf-info-item span {
      color: #212529;
    }
    
    .auth-status {
      color: #28a745;
      font-weight: 500;
    }
    
    .ibf-actions {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .ibf-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .ibf-btn.primary {
      background: #c8102e;
      color: white;
    }
    
    .ibf-btn.primary:hover {
      background: #a00d26;
    }
    
    .ibf-btn.secondary {
      background: #6c757d;
      color: white;
    }
    
    .ibf-btn.secondary:hover {
      background: #545b62;
    }
    
    .ibf-mock-content {
      display: grid;
      gap: 20px;
    }
    
    .ibf-card {
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 15px;
      background: white;
    }
    
    .ibf-card h3 {
      margin: 0 0 10px 0;
      color: #c8102e;
      font-size: 1rem;
    }
    
    .alert-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 4px;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
    }
    
    .alert-item.warning {
      color: #856404;
    }
    
    .alert-icon {
      font-size: 1.25rem;
    }
    
    .indicator-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 15px;
    }
    
    .indicator {
      text-align: center;
      padding: 10px;
      border: 1px solid #e9ecef;
      border-radius: 4px;
    }
    
    .indicator .value {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
      color: #c8102e;
    }
    
    .indicator .label {
      display: block;
      font-size: 0.75rem;
      color: #6c757d;
      margin-top: 4px;
    }
  `]
})
export class MinimalDashboardComponent {
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
    console.log(`🚀 Minimal IBF Dashboard initialized for ${this.countryCode} in ${this.platform} mode`);
    
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
    return `Monitoring ${this.disasterType} risk for ${country}. Dashboard is operational and receiving real-time data.`;
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

// Bootstrap the minimal web component
(async () => {
  try {
    console.log('🚀 Initializing Minimal IBF Dashboard Web Component...');
    
    const appRef = await bootstrapApplication(MinimalDashboardComponent);
    
    const element = createCustomElement(MinimalDashboardComponent, { 
      injector: appRef.injector 
    });
    
    customElements.define('ibf-dashboard', element);
    
    console.log('✅ Minimal IBF Dashboard web component registered successfully');
    
    window.dispatchEvent(new CustomEvent('ibf-dashboard-ready', {
      detail: { 
        version: '1.0.0-minimal', 
        timestamp: new Date(),
        features: ['minimal-ui', 'event-emitters', 'platform-integration']
      }
    }));
    
  } catch (error) {
    console.error('❌ Failed to register Minimal IBF Dashboard web component:', error);
    
    window.dispatchEvent(new CustomEvent('ibf-dashboard-error', {
      detail: { error: error.message, timestamp: new Date() }
    }));
  }
})();
