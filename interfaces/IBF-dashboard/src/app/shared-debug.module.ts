import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

// Import only the most basic components first to identify the problematic ones
console.log('🔍 Loading SharedModule dependencies...');

// Test Leaflet imports individually
try {
  console.log('📦 Importing LeafletModule...');
  const leafletModule = require('@bluehalo/ngx-leaflet');
  console.log('✅ LeafletModule imported successfully:', leafletModule);
} catch (error) {
  console.error('❌ Failed to import LeafletModule:', error);
}

try {
  console.log('📦 Importing LeafletMarkerClusterModule...');
  const leafletClusterModule = require('@bluehalo/ngx-leaflet-markercluster');
  console.log('✅ LeafletMarkerClusterModule imported successfully:', leafletClusterModule);
} catch (error) {
  console.error('❌ Failed to import LeafletMarkerClusterModule:', error);
}

// Minimal shared module for debugging
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
  ],
  declarations: [
    // Start with no declarations to see if the basic module works
  ],
  exports: [
    TranslateModule,
  ],
})
export class SharedModuleDebug {
  constructor() {
    console.log('✅ SharedModuleDebug instantiated successfully');
  }
}
