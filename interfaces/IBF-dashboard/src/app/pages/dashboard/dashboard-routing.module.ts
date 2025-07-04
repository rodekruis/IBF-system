import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivationLogPage } from 'src/app/pages/dashboard/activation-log/activation.log.page';
import { DashboardPage } from 'src/app/pages/dashboard/dashboard.page';
import { StatusReportPage } from 'src/app/pages/dashboard/status-report/status-report.page';

const routes: Routes = [
  { path: '', component: DashboardPage },
  { path: 'log', component: ActivationLogPage },
  { path: 'status-report', component: StatusReportPage },
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class DashboardPageRoutingModule {}
