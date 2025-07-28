import { createCustomElement } from '@angular/elements';
import { platformBrowser } from '@angular/platform-browser';
import { NgModule, Component, Input, Output, EventEmitter } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

// Simplified component for web component
@Component({
  selector: 'ibf-dashboard-simple',
  template: `
    <div style="padding: 20px; border: 2px solid #c8102e; border-radius: 8px; background: #f8f9fa;">
      <h2 style="color: #c8102e; margin: 0 0 10px 0;">🌪️ IBF Dashboard</h2>
      <p><strong>Country:</strong> {{countryCode}}</p>
      <p><strong>Platform:</strong> {{embedPlatform}}</p>
      <p><strong>Status:</strong> Web Component Loaded Successfully!</p>
      <button (click)="onTestAction()" style="background: #c8102e; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
        Test Action
      </button>
    </div>
  `,
  standalone: false
})
export class SimpleDashboardComponent {
  @Input() countryCode: string = 'PHL';
  @Input() disasterType: string = 'typhoon';
  @Input() embedPlatform: 'standalone' | 'espocrm' | 'dhis2' | 'generic' = 'standalone';
  @Input() authToken: string = '';
  
  @Output() dashboardReady = new EventEmitter<boolean>();
  @Output() userAction = new EventEmitter<any>();
  
  ngOnInit() {
    console.log(`🚀 Simple IBF Dashboard initialized in ${this.embedPlatform} mode`);
    setTimeout(() => {
      this.dashboardReady.emit(true);
    }, 500);
  }
  
  onTestAction() {
    this.userAction.emit({ action: 'test-button-clicked', platform: this.embedPlatform });
    console.log('Test action triggered!');
  }
}

@NgModule({
  declarations: [SimpleDashboardComponent],
  imports: [BrowserModule, HttpClientModule, IonicModule.forRoot()],
  providers: [],
  exports: [SimpleDashboardComponent]
})
export class SimpleDashboardModule {}

// Bootstrap the simple web component
(async () => {
  try {
    console.log('🚀 Initializing Simple IBF Dashboard Web Component...');
    
    const platform = platformBrowser();
    const moduleRef = await platform.bootstrapModule(SimpleDashboardModule);
    
    const element = createCustomElement(SimpleDashboardComponent, { 
      injector: moduleRef.injector 
    });
    
    customElements.define('ibf-dashboard-simple', element);
    
    console.log('✅ Simple IBF Dashboard web component registered successfully');
    
    window.dispatchEvent(new CustomEvent('ibf-dashboard-ready', {
      detail: { version: '1.0.0-simple', timestamp: new Date() }
    }));
    
  } catch (error) {
    console.error('❌ Failed to register Simple IBF Dashboard web component:', error);
    
    window.dispatchEvent(new CustomEvent('ibf-dashboard-error', {
      detail: { error: error.message, timestamp: new Date() }
    }));
  }
})();
