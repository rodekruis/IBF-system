import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared.module';
import { ActivationLogPage } from './activation-log/activation.log.page';
import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './dashboard.page';
import { StatusReportPage } from './status-report/status-report.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    DashboardPageRoutingModule,
  ],
  declarations: [DashboardPage, ActivationLogPage, StatusReportPage],
})
export class DashboardPageModule {}
