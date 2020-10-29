import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MockScenarioModule } from 'src/app/mocks/mock-scenario.module';
import { SharedModule } from 'src/app/shared.module';
import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    DashboardPageRoutingModule,
    MockScenarioModule,
  ],
  declarations: [DashboardPage],
})
export class DashboardPageModule {}
