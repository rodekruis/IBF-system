import { Component, OnInit, ElementRef, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard-debug',
  standalone: false,  // Make it non-standalone so it can be declared in a module
  template: `
    <div class="main-container" #mainContainer>
      <h1 class="title">🌪️ IBF Dashboard Debug View [{{ renderCount }}]</h1>
      
      <div class="status-section">
        <h2>✅ Component Status</h2>
        <p>✓ Angular component loaded successfully</p>
        <p>✓ Web component registered</p>
        <p>✓ Router navigation working</p>
        <p>✓ Template rendering</p>
        <p class="highlight">🎯 YOU CAN SEE THIS - WEB COMPONENT IS WORKING!</p>
      </div>

      <div class="info-section">
        <h2>📊 Dashboard Information</h2>
        <p><strong>Current Time:</strong> {{ getCurrentTime() }}</p>
        <p><strong>Platform:</strong> Generic Embedding</p>
        <p><strong>Mode:</strong> Web Component</p>
        <p><strong>Status:</strong> 🟢 Active</p>
        <p><strong>Render Count:</strong> {{ renderCount }}</p>
      </div>

      <div class="dom-debug-section">
        <h2>🔍 DOM Debug Information</h2>
        <div class="debug-grid">
          <div class="debug-item">
            <strong>Element Dimensions:</strong><br>
            {{ elementDimensions }}
          </div>
          <div class="debug-item">
            <strong>Computed Styles:</strong><br>
            {{ computedStyleInfo }}
          </div>
          <div class="debug-item">
            <strong>Parent Chain:</strong><br>
            {{ parentChain }}
          </div>
          <div class="debug-item">
            <strong>Shadow DOM:</strong><br>
            {{ shadowDomInfo }}
          </div>
        </div>
      </div>

      <div class="features-section">
        <h2>🎯 Mock Dashboard Features</h2>
        <div class="features-grid">
          <div class="feature-card map">
            <h3>🗺️ Map View</h3>
            <p>Interactive disaster mapping</p>
          </div>
          <div class="feature-card indicators">
            <h3>📈 Indicators</h3>
            <p>Real-time risk metrics</p>
          </div>
          <div class="feature-card alerts">
            <h3>🚨 Alerts</h3>
            <p>Early warning system</p>
          </div>
          <div class="feature-card analytics">
            <h3>📊 Analytics</h3>
            <p>Impact assessment</p>
          </div>
        </div>
      </div>

      <div class="next-steps-section">
        <h2>🔧 Next Steps & Debug Info</h2>
        <ul>
          <li>✅ Basic web component infrastructure working</li>
          <li>✅ Angular routing and module loading functional</li>
          <li class="success">🔄 WEB COMPONENT SUCCESSFULLY RENDERS CONTENT!</li>
          <li>🔄 Now ready to integrate full dashboard components</li>
          <li>🔄 Connect to real API endpoints</li>
          <li>🔄 Add authentication integration</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      min-height: 600px !important;
      position: relative !important;
      z-index: 1000 !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      border: 5px solid #ff0000 !important;
    }
    
    .main-container {
      padding: 20px !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      min-height: 600px !important;
      width: 100% !important;
      display: block !important;
      position: relative !important;
      z-index: 1000 !important;
      border: 3px solid #ffff00 !important;
      box-sizing: border-box !important;
    }
    
    .title {
      margin: 0 0 20px 0 !important;
      color: white !important;
      font-size: 28px !important;
      font-weight: bold !important;
      text-align: center !important;
      background: rgba(255,0,0,0.3) !important;
      padding: 15px !important;
      border: 2px solid #ffff00 !important;
      border-radius: 8px !important;
    }
    
    .status-section, .info-section, .dom-debug-section, .features-section, .next-steps-section {
      background: rgba(255,255,255,0.2) !important;
      padding: 15px !important;
      border-radius: 8px !important;
      margin-bottom: 20px !important;
      border: 2px solid rgba(255,255,255,0.5) !important;
    }
    
    .dom-debug-section {
      border: 3px solid #00ff00 !important;
      background: rgba(0,255,0,0.1) !important;
    }
    
    .debug-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 15px !important;
      margin-top: 10px !important;
    }
    
    .debug-item {
      background: rgba(0,0,0,0.3) !important;
      padding: 10px !important;
      border-radius: 6px !important;
      border: 1px solid rgba(255,255,255,0.3) !important;
      font-size: 12px !important;
      word-break: break-all !important;
    }
    
    .features-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
      gap: 10px !important;
    }
    
    .feature-card {
      padding: 15px !important;
      border-radius: 8px !important;
      border: 2px solid !important;
    }
    
    .map { background: rgba(0,123,255,0.4) !important; border-color: rgba(0,123,255,0.8) !important; }
    .indicators { background: rgba(40,167,69,0.4) !important; border-color: rgba(40,167,69,0.8) !important; }
    .alerts { background: rgba(255,193,7,0.4) !important; border-color: rgba(255,193,7,0.8) !important; }
    .analytics { background: rgba(220,53,69,0.4) !important; border-color: rgba(220,53,69,0.8) !important; }
    
    .highlight {
      font-weight: bold !important;
      color: #ffff00 !important;
      background: rgba(255,0,0,0.3) !important;
      padding: 8px !important;
      border-radius: 4px !important;
    }
    
    .success {
      font-weight: bold !important;
      color: #00ff00 !important;
    }
    
    h2 {
      margin: 0 0 10px 0 !important;
      color: white !important;
      font-size: 20px !important;
    }
    
    h3 {
      margin: 0 0 5px 0 !important;
      color: white !important;
      font-size: 18px !important;
    }
    
    p, li {
      margin: 5px 0 !important;
      font-size: 16px !important;
      color: white !important;
    }
    
    ul {
      margin: 0 !important;
      padding-left: 20px !important;
    }
    
    * {
      box-sizing: border-box !important;
    }
  `]
})
export class DashboardDebugComponent implements OnInit, AfterViewInit {
  renderCount: number = 0;
  elementDimensions: string = 'Calculating...';
  computedStyleInfo: string = 'Calculating...';
  parentChain: string = 'Calculating...';
  shadowDomInfo: string = 'Calculating...';

  constructor(
    private elementRef: ElementRef,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    console.log('🎨 DashboardDebugComponent constructor called!');
    console.log('🎨 Component should now be rendering...');
    console.log('🔍 ElementRef:', this.elementRef);
    console.log('🔍 Native element:', this.elementRef.nativeElement);
    this.renderCount++;
  }

  ngOnInit() {
    console.log('🎨 DashboardDebugComponent ngOnInit called!');
    console.log('🎨 Component fully initialized and should be visible');
    this.renderCount++;
    this.updateDebugInfo();
    
    // Update debug info every 2 seconds
    setInterval(() => {
      this.updateDebugInfo();
    }, 2000);
  }

  ngAfterViewInit() {
    console.log('🎨 DashboardDebugComponent ngAfterViewInit called!');
    this.renderCount++;
    setTimeout(() => {
      this.analyzeDOM();
    }, 100);
    
    // Continuous DOM analysis
    setInterval(() => {
      this.analyzeDOM();
    }, 3000);
  }

  getCurrentTime(): string {
    return new Date().toLocaleString();
  }

  private updateDebugInfo() {
    this.renderCount++;
    this.cdr.detectChanges();
  }

  private analyzeDOM() {
    this.ngZone.run(() => {
      const element = this.elementRef.nativeElement;
      
      try {
        // Element dimensions
        const rect = element.getBoundingClientRect();
        this.elementDimensions = `${Math.round(rect.width)}x${Math.round(rect.height)} at (${Math.round(rect.left)}, ${Math.round(rect.top)})`;
        
        // Computed styles
        const computed = window.getComputedStyle(element);
        this.computedStyleInfo = `display: ${computed.display}, visibility: ${computed.visibility}, opacity: ${computed.opacity}, position: ${computed.position}`;
        
        // Parent chain
        const parents = [];
        let parent = element.parentElement;
        let depth = 0;
        while (parent && depth < 6) {
          const tagName = parent.tagName.toLowerCase();
          const classes = parent.className ? '.' + parent.className.split(' ').slice(0, 2).join('.') : '';
          parents.push(`${tagName}${classes}`);
          parent = parent.parentElement;
          depth++;
        }
        this.parentChain = parents.join(' > ') || 'No parents';
        
        // Shadow DOM info
        const rootNode = element.getRootNode();
        if (rootNode !== document) {
          const shadowHost = (rootNode as ShadowRoot).host;
          this.shadowDomInfo = `In shadow DOM, host: ${shadowHost.tagName.toLowerCase()}`;
        } else {
          this.shadowDomInfo = 'Not in shadow DOM';
        }
        
        // Log comprehensive debug info
        console.log('🔍 DOM Analysis Update:');
        console.log('  📏 Element dimensions:', this.elementDimensions);
        console.log('  🎨 Computed styles:', this.computedStyleInfo);
        console.log('  📋 Parent chain:', this.parentChain);
        console.log('  🌑 Shadow DOM:', this.shadowDomInfo);
        console.log('  🔗 Is connected:', element.isConnected);
        console.log('  📊 Children count:', element.children.length);
        console.log('  📝 InnerHTML length:', element.innerHTML?.length || 0);
        console.log('  🎯 Scroll dimensions:', `scrollWidth: ${element.scrollWidth}, scrollHeight: ${element.scrollHeight}`);
        console.log('  👁️ Visible:', rect.width > 0 && rect.height > 0 && computed.visibility !== 'hidden' && computed.display !== 'none');
        
        // Check web component host
        let webComponentHost = element;
        while (webComponentHost && webComponentHost.tagName !== 'IBF-DASHBOARD') {
          webComponentHost = webComponentHost.parentElement;
        }
        if (webComponentHost) {
          const hostRect = webComponentHost.getBoundingClientRect();
          const hostStyles = window.getComputedStyle(webComponentHost);
          console.log('🎯 Web component host found:', webComponentHost);
          console.log('🎯 Host dimensions:', `${hostRect.width}x${hostRect.height}`);
          console.log('🎯 Host styles:', `display: ${hostStyles.display}, visibility: ${hostStyles.visibility}, opacity: ${hostStyles.opacity}`);
          console.log('🎯 Host position:', `${hostRect.left}, ${hostRect.top}`);
        } else {
          console.log('❌ Web component host not found!');
        }
        
        this.cdr.detectChanges();
      } catch (error) {
        console.error('❌ Error during DOM analysis:', error);
        this.elementDimensions = 'Error analyzing';
        this.computedStyleInfo = 'Error analyzing';
        this.parentChain = 'Error analyzing';
        this.shadowDomInfo = 'Error analyzing';
      }
    });
  }
}
