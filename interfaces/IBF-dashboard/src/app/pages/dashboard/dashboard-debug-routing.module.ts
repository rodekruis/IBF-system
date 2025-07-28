import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardDebugComponent } from './dashboard-debug.component';

const routes: Routes = [
  { path: '', component: DashboardDebugComponent },
];

@NgModule({ 
  imports: [RouterModule.forChild(routes)], 
  exports: [RouterModule] 
})
export class DashboardPageDebugRoutingModule {
  constructor() {
    console.log('✅ DashboardPageDebugRoutingModule instantiated');
  }
}
