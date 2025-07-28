import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { DashboardDebugComponent } from './dashboard-debug.component';

console.log('🔍 Loading DashboardPageDebugModule...');

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardDebugComponent
      }
    ])
  ],
  declarations: [DashboardDebugComponent]
})
export class DashboardPageDebugModule {
  constructor() {
    console.log('✅ DashboardPageDebugModule instantiated successfully');
  }
}
