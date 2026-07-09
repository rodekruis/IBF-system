import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivationLogPage } from 'src/app/pages/dashboard/activation-log/activation.log.page';
import { DashboardPage } from 'src/app/pages/dashboard/dashboard.page';
import { NotificationLogPage } from 'src/app/pages/dashboard/notification-log/notification-log.page';
import { StatusReportPage } from 'src/app/pages/dashboard/status-report/status-report.page';

const routes: Routes = [
  { path: '', component: DashboardPage },
  { path: 'log', component: ActivationLogPage },
  { path: 'status-report', component: StatusReportPage },
  { path: 'notifications', component: NotificationLogPage },
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class DashboardPageRoutingModule {}
