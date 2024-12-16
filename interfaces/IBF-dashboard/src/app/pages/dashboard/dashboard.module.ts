import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivationLogPage } from 'src/app/pages/dashboard/activation-log/activation.log.page';
import { DashboardPage } from 'src/app/pages/dashboard/dashboard.page';
import { DashboardPageRoutingModule } from 'src/app/pages/dashboard/dashboard-routing.module';
import { StatusReportPage } from 'src/app/pages/dashboard/status-report/status-report.page';
import { SharedModule } from 'src/app/shared.module';

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
